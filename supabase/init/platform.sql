-- Platform helpers for hosting many Base44-style apps on one Supabase stack.
-- Runs once, on first database start. Each app gets its own schema
-- (platform.register_app) and each Base44 entity becomes a table in it
-- (platform.setup_entity).

create schema if not exists platform;
grant usage on schema platform to anon, authenticated, service_role;

create table if not exists platform.apps (
  name text primary key,
  created_at timestamptz not null default now()
);

-- Request identity, read from the JWT PostgREST puts in request.jwt.claims.
create or replace function platform.jwt_claims() returns jsonb
language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
$$;

create or replace function platform.uid() returns uuid
language sql stable as $$
  select nullif(platform.jwt_claims() ->> 'sub', '')::uuid
$$;

create or replace function platform.email() returns text
language sql stable as $$
  select lower(nullif(platform.jwt_claims() ->> 'email', ''))
$$;

-- True for service_role and direct database sessions (imports, psql),
-- false for end users coming through the API as anon/authenticated.
create or replace function platform.is_privileged() returns boolean
language sql stable as $$
  select current_user not in ('anon', 'authenticated')
$$;

-- Keeps Base44's built-in fields (created_date, updated_date, created_by)
-- correct and unforgeable by end users.
create or replace function platform.set_audit_fields() returns trigger
language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    if not platform.is_privileged() then
      new.created_by := platform.email();
      new.created_by_id := platform.uid();
      new.created_date := now();
      new.updated_date := now();
    else
      new.created_date := coalesce(new.created_date, now());
      new.updated_date := coalesce(new.updated_date, new.created_date);
    end if;
  else
    if not platform.is_privileged() then
      new.id := old.id;
      new.created_by := old.created_by;
      new.created_by_id := old.created_by_id;
      new.created_date := old.created_date;
    end if;
    new.updated_date := now();
  end if;
  return new;
end
$$;

-- Users may edit their own profile but never their own role. App admins may
-- change other users' roles.
create or replace function platform.protect_profile_role() returns trigger
language plpgsql as $$
declare
  caller_is_admin boolean;
begin
  if not platform.is_privileged() then
    if tg_op = 'INSERT' then
      new.role := 'user';
      new.id := platform.uid();
      new.email := platform.email();
    else
      execute format('select %I.is_admin()', tg_table_schema) into caller_is_admin;
      if not caller_is_admin or old.id = platform.uid() then
        new.role := old.role;
      end if;
      new.id := old.id;
      new.email := old.email;
    end if;
  end if;
  new.updated_date := now();
  return new;
end
$$;

create or replace function platform.register_app(app text) returns void
language plpgsql as $fn$
declare
  schemas text;
begin
  if app !~ '^[a-z][a-z0-9_]{1,40}$' or app in ('public', 'platform', 'auth', 'storage', 'extensions') then
    raise exception 'invalid app name "%": use lowercase letters, digits and _', app;
  end if;

  insert into platform.apps (name) values (app) on conflict do nothing;

  execute format('create schema if not exists %I', app);
  execute format('grant usage on schema %I to anon, authenticated, service_role', app);
  execute format('grant all on all tables in schema %I to service_role', app);
  execute format('alter default privileges in schema %I grant all on tables to service_role', app);
  execute format('alter default privileges in schema %I grant select, insert, update, delete on tables to authenticated', app);
  execute format('alter default privileges in schema %I grant select on tables to anon', app);
  execute format('alter default privileges in schema %I grant execute on functions to anon, authenticated, service_role', app);

  -- Base44's built-in User entity: auth.users holds credentials, this holds
  -- the app-specific profile (role + any custom fields set via updateMe).
  execute format($sql$
    create table if not exists %1$I.profiles (
      id uuid primary key,
      email text,
      full_name text,
      role text not null default 'user',
      data jsonb not null default '{}'::jsonb,
      created_date timestamptz not null default now(),
      updated_date timestamptz not null default now()
    )$sql$, app);
  execute format('grant select, insert, update on %I.profiles to authenticated', app);
  execute format('revoke all on %I.profiles from anon', app);
  execute format('alter table %I.profiles enable row level security', app);

  execute format($sql$
    create or replace function %1$I.is_admin() returns boolean
    language sql stable security definer set search_path = '' as $f$
      select exists (select 1 from %1$I.profiles where id = platform.uid() and role = 'admin')
    $f$$sql$, app);

  execute format('drop trigger if exists protect_role on %I.profiles', app);
  execute format('create trigger protect_role before insert or update on %I.profiles
                  for each row execute function platform.protect_profile_role()', app);

  execute format('drop policy if exists profiles_select on %I.profiles', app);
  execute format('create policy profiles_select on %1$I.profiles for select to authenticated
                  using (id = platform.uid() or %1$I.is_admin())', app);
  execute format('drop policy if exists profiles_insert on %I.profiles', app);
  execute format('create policy profiles_insert on %I.profiles for insert to authenticated
                  with check (id = platform.uid())', app);
  execute format('drop policy if exists profiles_update on %I.profiles', app);
  execute format('create policy profiles_update on %1$I.profiles for update to authenticated
                  using (id = platform.uid() or %1$I.is_admin())', app);

  -- Public bucket for UploadFile. Users write only under their own user id folder.
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public) values (app, app, true) on conflict (id) do nothing;
    execute format('drop policy if exists %I on storage.objects', app || '_upload');
    execute format('create policy %I on storage.objects for insert to authenticated
                    with check (bucket_id = %L and (storage.foldername(name))[1] = platform.uid()::text)',
                   app || '_upload', app);
  else
    raise notice 'storage schema not ready yet; re-run platform.register_app(%) once storage has started', app;
  end if;

  -- Expose every app schema through PostgREST and reload it.
  select string_agg(name, ',' order by name) into schemas from platform.apps;
  execute format('alter role authenticator set pgrst.db_schemas = %L', 'public,' || schemas);
  notify pgrst, 'reload config';
  notify pgrst, 'reload schema';
end
$fn$;

-- Adds Base44's built-in columns, audit trigger and a row-level-security
-- preset to an entity table that already exists in an app schema.
--
-- access:
--   'shared'      any signed-in user reads; creator or admin edits (Base44's usual default)
--   'private'     only the creator (or an admin) can see and edit a row
--   'public_read' anyone, even signed-out, reads; creator or admin edits
--   'admin_write' signed-in users read; only admins write
create or replace function platform.setup_entity(app text, entity text, access text default 'shared')
returns void language plpgsql as $$
declare
  t text := format('%I.%I', app, entity);
  owner text := format('(created_by_id = platform.uid() or created_by = platform.email() or %I.is_admin())', app);
  admin text := format('%I.is_admin()', app);
  p text;
begin
  if access not in ('shared', 'private', 'public_read', 'admin_write') then
    raise exception 'unknown access preset "%"', access;
  end if;

  execute format('alter table %s add column if not exists id text primary key default replace(gen_random_uuid()::text, ''-'', '''')', t);
  execute format('alter table %s add column if not exists created_date timestamptz not null default now()', t);
  execute format('alter table %s add column if not exists updated_date timestamptz not null default now()', t);
  execute format('alter table %s add column if not exists created_by text', t);
  execute format('alter table %s add column if not exists created_by_id uuid', t);
  execute format('create index if not exists %I on %s (created_date)', entity || '_created_date_idx', t);
  execute format('create index if not exists %I on %s (created_by)', entity || '_created_by_idx', t);

  execute format('drop trigger if exists audit on %s', t);
  execute format('create trigger audit before insert or update on %s for each row execute function platform.set_audit_fields()', t);

  execute format('alter table %s enable row level security', t);
  for p in select policyname from pg_policies where schemaname = app and tablename = entity loop
    execute format('drop policy %I on %s', p, t);
  end loop;

  execute format('grant select, insert, update, delete on %s to authenticated', t);
  execute format('grant all on %s to service_role', t);

  if access = 'public_read' then
    execute format('grant select on %s to anon', t);
    execute format('create policy read on %s for select to anon, authenticated using (true)', t);
  else
    execute format('revoke all on %s from anon', t);
  end if;

  if access in ('shared', 'admin_write') then
    execute format('create policy read on %s for select to authenticated using (true)', t);
  elsif access = 'private' then
    execute format('create policy read on %s for select to authenticated using %s', t, owner);
  end if;

  if access = 'admin_write' then
    execute format('create policy write_insert on %s for insert to authenticated with check (%s)', t, admin);
    execute format('create policy write_update on %s for update to authenticated using (%s)', t, admin);
    execute format('create policy write_delete on %s for delete to authenticated using (%s)', t, admin);
  else
    execute format('create policy write_insert on %s for insert to authenticated with check (true)', t);
    execute format('create policy write_update on %s for update to authenticated using %s', t, owner);
    execute format('create policy write_delete on %s for delete to authenticated using %s', t, owner);
  end if;

  notify pgrst, 'reload schema';
end
$$;

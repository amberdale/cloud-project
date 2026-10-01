// Drop-in replacement for the parts of @base44/sdk that exported Base44 apps
// use, backed by the self-hosted Supabase stack in this repo.
//
//   import { createClient as createSupabase } from '@supabase/supabase-js';
//   import { createClient } from './base44-compat';
//   const supabase = createSupabase(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
//   export const base44 = createClient({ supabase, schema: import.meta.env.VITE_APP_SCHEMA });
//
// Entities map to tables in the app's schema, auth to Supabase Auth plus the
// app's profiles table, and UploadFile to the app's storage bucket.

const BUILTIN_FIELDS = ['id', 'created_date', 'updated_date', 'created_by', 'created_by_id'];
const PROFILE_COLUMNS = ['full_name'];
const DEFAULT_PAGE = 1000;

export class Base44CompatError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'Base44CompatError';
    this.status = status;
    // Base44's SDK throws axios errors; apps often check error.response.status.
    this.response = { status, data };
  }
}

function unwrap({ data, error, status }) {
  if (error) throw new Base44CompatError(error.message || 'Request failed', status || 500, error);
  return data;
}

function withoutBuiltins(data = {}) {
  const out = { ...data };
  for (const f of BUILTIN_FIELDS) delete out[f];
  return out;
}

export function applySort(query, sort) {
  if (!sort) return query.order('created_date', { ascending: false });
  for (const part of String(sort).split(',').map((s) => s.trim()).filter(Boolean)) {
    const desc = part.startsWith('-');
    const field = part.replace(/^[-+]/, '');
    query = query.order(field, { ascending: !desc });
  }
  return query;
}

export function applyPaging(query, limit, skip) {
  if (skip) return query.range(skip, skip + (limit || DEFAULT_PAGE) - 1);
  if (limit) return query.limit(limit);
  return query;
}

// PostgREST value syntax inside or()/in lists: double-quoted, backslash-escaped.
function pgValue(v) {
  return `"${String(v).replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;
}

function pgList(values) {
  return `(${values.map(pgValue).join(',')})`;
}

// Base44 filters are plain equality objects with optional Mongo-style
// operators: { status: 'open', priority: { $gte: 2 }, tag: { $in: [...] } }.
export function applyFilter(query, filter = {}) {
  for (const [field, cond] of Object.entries(filter)) {
    if (field.startsWith('$')) {
      throw new Base44CompatError(`Filter operator ${field} is not supported; use the Supabase client directly`, 400);
    }
    const isOps = cond && typeof cond === 'object' && !Array.isArray(cond) && Object.keys(cond).some((k) => k.startsWith('$'));
    if (!isOps) {
      query = cond === null ? query.is(field, null) : query.eq(field, cond);
      continue;
    }
    for (const [op, value] of Object.entries(cond)) {
      switch (op) {
        case '$eq': query = value === null ? query.is(field, null) : query.eq(field, value); break;
        // Like Base44 (Mongo), $ne and $nin also match rows where the field is empty.
        case '$ne': query = value === null ? query.not(field, 'is', null) : query.or(`${field}.is.null,${field}.neq.${pgValue(value)}`); break;
        case '$gt': query = query.gt(field, value); break;
        case '$gte': query = query.gte(field, value); break;
        case '$lt': query = query.lt(field, value); break;
        case '$lte': query = query.lte(field, value); break;
        case '$in': query = query.filter(field, 'in', pgList(value)); break; // supabase-js .in() doesn't escape quotes
        case '$nin': query = query.or(`${field}.is.null,${field}.not.in.${pgList(value)}`); break;
        case '$exists': query = value ? query.not(field, 'is', null) : query.is(field, null); break;
        case '$regex': query = query.filter(field, cond.$options?.includes('i') ? 'imatch' : 'match', value); break;
        case '$options': break;
        default:
          throw new Base44CompatError(`Filter operator ${op} is not supported; use the Supabase client directly`, 400);
      }
    }
  }
  return query;
}

function entityHandler(db, name) {
  const table = () => db.from(name);
  return {
    async list(sort, limit, skip) {
      return unwrap(await applyPaging(applySort(table().select('*'), sort), limit, skip));
    },
    async filter(filter, sort, limit, skip) {
      return unwrap(await applyPaging(applySort(applyFilter(table().select('*'), filter), sort), limit, skip));
    },
    async get(id) {
      const row = unwrap(await table().select('*').eq('id', id).maybeSingle());
      if (!row) throw new Base44CompatError(`${name} ${id} not found`, 404);
      return row;
    },
    async create(data) {
      return unwrap(await table().insert(withoutBuiltins(data), { defaultToNull: false }).select('*').single());
    },
    async bulkCreate(items) {
      // defaultToNull: false so fields missing from some items get the column default, not NULL
      return unwrap(await table().insert(items.map(withoutBuiltins), { defaultToNull: false }).select('*'));
    },
    async update(id, data) {
      const row = unwrap(await table().update(withoutBuiltins(data)).eq('id', id).select('*').maybeSingle());
      if (!row) throw new Base44CompatError(`${name} ${id} not found or not editable`, 404);
      return row;
    },
    async delete(id) {
      unwrap(await table().delete().eq('id', id));
    },
    async deleteMany(filter) {
      if (!filter || !Object.keys(filter).length) throw new Base44CompatError('deleteMany needs a filter', 400);
      unwrap(await applyFilter(table().delete(), filter));
    },
  };
}

export function flattenProfile(p) {
  if (!p) return p;
  const { data, ...rest } = p;
  return { ...(data || {}), ...rest };
}

function splitProfileUpdate(changes) {
  const columns = {};
  const extra = {};
  for (const [k, v] of Object.entries(withoutBuiltins(changes))) {
    if (k === 'email' || k === 'data') continue;
    if (PROFILE_COLUMNS.includes(k) || k === 'role') columns[k] = v;
    else extra[k] = v;
  }
  return { columns, extra };
}

function authHandler(supabase, db, opts) {
  const profiles = () => db.from('profiles');

  async function currentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) throw new Base44CompatError('Not authenticated', 401);
    return data.user;
  }

  async function updateProfile(id, changes) {
    const { columns, extra } = splitProfileUpdate(changes);
    const existing = unwrap(await profiles().select('data').eq('id', id).maybeSingle());
    if (!existing) throw new Base44CompatError(`User ${id} not found`, 404);
    const patch = { ...columns, data: { ...(existing.data || {}), ...extra } };
    return flattenProfile(unwrap(await profiles().update(patch).eq('id', id).select('*').single()));
  }

  const goTo = (url) => {
    if (typeof window !== 'undefined') window.location.href = url;
  };

  const auth = {
    async me() {
      const user = await currentUser();
      let profile = unwrap(await profiles().select('*').eq('id', user.id).maybeSingle());
      if (!profile) {
        // First visit to this app: create the profile. The database forces role='user'.
        const meta = user.user_metadata || {};
        profile = unwrap(
          await profiles()
            .insert({ id: user.id, email: user.email, full_name: meta.full_name || meta.name || null })
            .select('*')
            .single(),
        );
      }
      return flattenProfile(profile);
    },
    async isAuthenticated() {
      const { data } = await supabase.auth.getSession();
      return !!data?.session;
    },
    async updateMe(changes) {
      const user = await currentUser();
      await auth.me(); // makes sure the profile row exists
      return updateProfile(user.id, changes);
    },
    async logout(redirectUrl) {
      await supabase.auth.signOut();
      if (redirectUrl) goTo(redirectUrl);
      else if (typeof window !== 'undefined') window.location.reload();
    },
    redirectToLogin(nextUrl) {
      const next = nextUrl || (typeof window !== 'undefined' ? window.location.href : '/');
      goTo(`${opts.loginPath}?next=${encodeURIComponent(next)}`);
    },
    login(nextUrl) {
      auth.redirectToLogin(nextUrl);
    },
    setToken() {
      // Base44 apps sometimes call this after their hosted login; Supabase manages the session itself.
    },

    // The User entity (base44.entities.User). Non-admins only see themselves.
    async list(sort, limit, skip) {
      return unwrap(await applyPaging(applySort(profiles().select('*'), sort), limit, skip)).map(flattenProfile);
    },
    async filter(filter, sort, limit, skip) {
      return unwrap(await applyPaging(applySort(applyFilter(profiles().select('*'), filter), sort), limit, skip)).map(
        flattenProfile,
      );
    },
    async get(id) {
      const row = unwrap(await profiles().select('*').eq('id', id).maybeSingle());
      if (!row) throw new Base44CompatError(`User ${id} not found`, 404);
      return flattenProfile(row);
    },
    async update(id, changes) {
      return updateProfile(id, changes);
    },

    // Used by the login page that replaces Base44's hosted one.
    signInWithEmailLink(email, nextUrl) {
      return supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: nextUrl } }).then(unwrap);
    },
    signInWithPassword(email, password) {
      return supabase.auth.signInWithPassword({ email, password }).then(unwrap);
    },
    signUp(email, password, nextUrl) {
      return supabase.auth.signUp({ email, password, options: { emailRedirectTo: nextUrl } }).then(unwrap);
    },
    signInWithGoogle(nextUrl) {
      return supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: nextUrl } }).then(unwrap);
    },
  };
  return auth;
}

function safeFileName(name) {
  return String(name || 'file').replace(/[^A-Za-z0-9._-]+/g, '_').slice(-120);
}

function integrationsHandler(supabase, opts) {
  const custom = opts.integrations || {};
  const core = {
    async UploadFile({ file }) {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) throw new Base44CompatError('Sign in to upload files', 401);
      const path = `${auth.user.id}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
      const bucket = supabase.storage.from(opts.bucket);
      unwrap(await bucket.upload(path, file, { contentType: file.type || undefined }));
      return { file_url: bucket.getPublicUrl(path).data.publicUrl };
    },
  };

  const missing = (pkg, name) => async (payload) => {
    if (typeof custom[name] === 'function') return custom[name](payload);
    if (opts.functionsUrl) return callFunction(supabase, opts.functionsUrl, `integrations/${pkg}/${name}`, payload);
    throw new Base44CompatError(
      `Integration ${pkg}.${name} has not been migrated yet. Pass it via createClient({ integrations: { ${name}: fn } }) or set functionsUrl.`,
      501,
    );
  };

  return new Proxy(
    {},
    {
      get(_, pkg) {
        if (typeof pkg !== 'string') return undefined;
        return new Proxy(pkg === 'Core' ? core : {}, {
          get(target, name) {
            if (typeof name !== 'string') return undefined;
            return target[name] || custom[name] || missing(pkg, name);
          },
        });
      },
    },
  );
}

async function callFunction(supabase, baseUrl, name, payload) {
  const { data } = await supabase.auth.getSession();
  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(data?.session ? { Authorization: `Bearer ${data.session.access_token}` } : {}),
    },
    body: JSON.stringify(payload ?? {}),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Base44CompatError(body?.error || `Function ${name} failed`, res.status, body);
  // Base44's functions.invoke resolves to an axios response ({ data }).
  return { data: body, status: res.status };
}

/**
 * @param {object} opts
 * @param {import('@supabase/supabase-js').SupabaseClient} opts.supabase
 * @param {string} opts.schema         the app's Postgres schema (VITE_APP_SCHEMA)
 * @param {string} [opts.bucket]       storage bucket for UploadFile (defaults to schema)
 * @param {string} [opts.loginPath]    route of the app's login page (default /login)
 * @param {boolean} [opts.requiresAuth] send signed-out visitors to the login page
 * @param {string} [opts.functionsUrl] base URL of your own backend functions
 * @param {Record<string, Function>} [opts.integrations] replacements for InvokeLLM, SendEmail, ...
 */
export function createClient(opts) {
  if (!opts?.supabase) throw new Error('createClient needs { supabase }');
  if (!opts.schema) throw new Error('createClient needs { schema } (set VITE_APP_SCHEMA)');
  const options = { loginPath: '/login', bucket: opts.schema, ...opts };
  const { supabase } = options;
  const db = supabase.schema(options.schema);

  const auth = authHandler(supabase, db, options);
  const cache = new Map();
  const entities = new Proxy(
    {},
    {
      get(_, name) {
        if (typeof name !== 'string') return undefined;
        if (name === 'User') return auth;
        if (!cache.has(name)) cache.set(name, entityHandler(db, name));
        return cache.get(name);
      },
    },
  );

  if (options.requiresAuth && typeof window !== 'undefined' && window.location.pathname !== options.loginPath) {
    auth.isAuthenticated().then((ok) => ok || auth.redirectToLogin());
  }

  return {
    entities,
    auth,
    integrations: integrationsHandler(supabase, options),
    functions: {
      invoke(name, payload) {
        if (!options.functionsUrl) {
          return Promise.reject(new Base44CompatError(`functions.invoke('${name}') needs functionsUrl`, 501));
        }
        return callFunction(supabase, options.functionsUrl, name, payload);
      },
    },
    supabase,
  };
}

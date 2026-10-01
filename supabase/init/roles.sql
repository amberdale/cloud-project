-- From supabase/supabase docker/volumes/db/roles.sql
-- NOTE: change to your own passwords for production environments
-- (supabase_functions_admin line removed: this stack has no edge functions)
\set pgpass `echo "$POSTGRES_PASSWORD"`

ALTER USER authenticator WITH PASSWORD :'pgpass';
ALTER USER pgbouncer WITH PASSWORD :'pgpass';
ALTER USER supabase_auth_admin WITH PASSWORD :'pgpass';
ALTER USER supabase_storage_admin WITH PASSWORD :'pgpass';

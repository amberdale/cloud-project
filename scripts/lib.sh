# Shared helpers for the shell scripts. Source, don't run.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

[ -f .env ] || { echo "missing .env (copy .env.example and run scripts/gen-keys.mjs)" >&2; exit 1; }
set -a; . ./.env; set +a

# psql as supabase_admin (the real superuser in the supabase/postgres image).
psql_admin() {
  docker compose exec -T -e PGOPTIONS="-c client_min_messages=warning" db psql -U supabase_admin -h localhost -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 -q "$@"
}

check_app_name() {
  [[ "$1" =~ ^[a-z][a-z0-9_]{1,40}$ ]] || { echo "app name must be lowercase letters, digits and _ (got '$1')" >&2; exit 1; }
}

#!/usr/bin/env bash
# Registers a new app: Postgres schema, storage bucket, Caddy site and the
# frontend env file.
#   scripts/new-app.sh <app> [hostname]     hostname defaults to <app-with-dashes>.$DOMAIN
source "$(dirname "$0")/lib.sh"

APP="${1:?usage: new-app.sh <app> [hostname]}"
check_app_name "$APP"
HOST="${2:-${APP//_/-}.$DOMAIN}"

mkdir -p "apps/$APP/entities" "www/$APP"

cat > "apps/$APP/app.env" <<ENV
# Build-time env for the app's frontend (copy into the app repo as .env.production).
VITE_SUPABASE_URL=https://api.$DOMAIN
VITE_SUPABASE_ANON_KEY=$ANON_KEY
VITE_APP_SCHEMA=$APP
ENV

cat > "caddy/sites/$APP.caddy" <<SITE
$HOST {
	encode zstd gzip
	root * /srv/www/$APP
	@assets path /assets/*
	header @assets Cache-Control "public, max-age=31536000, immutable"
	try_files {path} /index.html
	file_server
}
SITE

psql_admin -c "select platform.register_app('$APP');"
docker compose exec -T caddy caddy reload --config /etc/caddy/Caddyfile >/dev/null

cat <<MSG
App '$APP' registered.
  Site:      https://$HOST   (point its DNS A record at this server)
  Schema:    $APP   bucket: $APP
  Next:      put Base44 entity schemas in apps/$APP/entities/*.json, then run scripts/apply-schema.sh $APP
MSG

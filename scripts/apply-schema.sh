#!/usr/bin/env bash
# Generates apps/<app>/schema.sql from apps/<app>/entities/*.json and applies it.
# Safe to re-run after adding entities or fields.
source "$(dirname "$0")/lib.sh"

APP="${1:?usage: apply-schema.sh <app>}"
check_app_name "$APP"

node scripts/entities-to-sql.mjs "$APP" > "apps/$APP/schema.sql"
psql_admin < "apps/$APP/schema.sql"
[ ! -f "apps/$APP/custom.sql" ] || psql_admin < "apps/$APP/custom.sql"
echo "Applied apps/$APP/schema.sql"

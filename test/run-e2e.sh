#!/usr/bin/env bash
# Runs test/e2e.mjs against a local stack (DOMAIN=localhost in .env) with the
# demo app registered from apps/_example. Trusts Caddy's local CA for HTTPS.
source "$(dirname "$0")/../scripts/lib.sh"
[ "$DOMAIN" = localhost ] || { echo "set DOMAIN=localhost in .env first" >&2; exit 1; }
grep -q "api.localhost" /etc/hosts || echo "add '127.0.0.1 api.localhost demo.localhost' to /etc/hosts" >&2

[ -f caddy/sites/demo.caddy ] || scripts/new-app.sh demo
mkdir -p apps/demo/entities && cp apps/_example/entities/*.json apps/demo/entities/
scripts/apply-schema.sh demo >/dev/null

docker compose cp caddy:/data/caddy/pki/authorities/local/root.crt /tmp/caddy-local-root.crt >/dev/null 2>&1
NODE_EXTRA_CA_CERTS=/tmp/caddy-local-root.crt NO_PROXY=localhost,.localhost no_proxy=localhost,.localhost node test/e2e.mjs

#!/usr/bin/env bash
# Publishes a built frontend (the Vite dist/ folder) for an app.
#   scripts/deploy-app.sh <app> <path-to-dist>
source "$(dirname "$0")/lib.sh"

APP="${1:?usage: deploy-app.sh <app> <dist-dir>}"
DIST="${2:?usage: deploy-app.sh <app> <dist-dir>}"
check_app_name "$APP"
[ -f "$DIST/index.html" ] || { echo "$DIST/index.html not found; build the app first" >&2; exit 1; }

# Copy next to the live folder, then swap, so visitors never see a half-copied site.
rm -rf "www/.$APP.new"
cp -a "$DIST" "www/.$APP.new"
rm -rf "www/.$APP.old"
[ ! -d "www/$APP" ] || mv "www/$APP" "www/.$APP.old"
mv "www/.$APP.new" "www/$APP"
rm -rf "www/.$APP.old"
echo "Deployed $DIST -> www/$APP"

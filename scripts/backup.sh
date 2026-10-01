#!/usr/bin/env bash
# Dumps the database and archives uploaded files into backups/<timestamp>/.
# Keeps the last $KEEP backups (default 14). Run nightly from cron, e.g.
#   15 3 * * * cd /opt/cloud-project && scripts/backup.sh >> backups/backup.log 2>&1
# and copy backups/ off the server (restic, rclone, Backblaze B2, S3...).
source "$(dirname "$0")/lib.sh"

KEEP="${KEEP:-14}"
DIR="backups/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$DIR"

docker compose exec -T db pg_dump -U supabase_admin -h localhost -d "$POSTGRES_DB" -Fc > "$DIR/db.dump"
tar -czf "$DIR/storage.tar.gz" -C volumes storage

ls -1d backups/*/ | sort | head -n -"$KEEP" | xargs -r rm -rf
echo "Backup written to $DIR ($(du -sh "$DIR" | cut -f1))"

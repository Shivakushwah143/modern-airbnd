#!/bin/sh
set -eu
umask 077
mkdir -p /backups/daily /backups/weekly
while :; do
  stamp=$(date -u +%Y%m%dT%H%M%SZ)
  target="/backups/daily/modern-airbnd-$stamp.dump"
  if pg_dump --format=custom --no-owner --no-acl --file="$target.tmp"; then
    mv "$target.tmp" "$target"
    if [ "$(date -u +%u)" = 7 ]; then cp "$target" "/backups/weekly/modern-airbnd-$stamp.dump"; fi
    find /backups/daily -type f -name '*.dump' -mtime +6 -delete
    find /backups/weekly -type f -name '*.dump' -mtime +27 -delete
    printf 'Backup completed: %s
' "$stamp"
  else
    rm -f "$target.tmp"
    printf 'Backup failed: %s
' "$stamp" >&2
    exit 1
  fi
  sleep 86400 & wait $!
done

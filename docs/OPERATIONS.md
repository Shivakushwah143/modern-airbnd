# Operations

## VPS deployment (not executed in this environment)

Prerequisites: Linux VPS, Docker Engine with Compose v2, domain pointed to the VPS, inbound TCP 80/443 (and optionally UDP 443), sufficient disk for PostgreSQL and retained backups. Do not expose database port 5432.

```bash
cp .env.production.example .env.production
```

Fill `DOMAIN` with the bare hostname, `APP_ORIGIN` with its HTTPS origin, `ACME_EMAIL`, database credentials, an independently generated session secret, Argon2id password hash and Cloudinary credentials. Single-quote the Argon2 hash so Compose does not interpret `$` characters. Restrict file permissions, e.g. `chmod 600 .env.production`.

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml build
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

The migration service runs after PostgreSQL readiness and before the API. Seed initial amenities/locations without demo data:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm migrate node --import tsx apps/api/prisma/seed.ts
```

Then:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
curl --fail https://YOUR_DOMAIN/api/v1/health/live
curl --fail https://YOUR_DOMAIN/api/v1/health/ready
```

Sign in at `/admin`, publish real content, check a date search, verify WhatsApp destination/message without sending it, inspect production cookie attributes and confirm logout protection. Verify `/admin` is not indexable and sitemap contains only real published properties.

## Backups

The production `backup` service writes PostgreSQL custom-format dumps at startup and every 24 hours to the `backups` named volume. It keeps seven days of daily dumps and four weeks of Sunday copies. A health check detects absence of a recent dump. Monitor backup failures externally; a backup volume on the same VPS is not off-site protection. Arrange an encrypted off-site copy and monitor it before launch.

A one-time backup:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T postgres pg_dump -U modern_airbnd -d modern_airbnd -Fc --no-owner --no-acl > modern-airbnd.dump
```

Never treat an untested dump as a proven recovery mechanism. Test restore to a new, disposable database, never over the live database:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec postgres createdb -U modern_airbnd modern_airbnd_restore_test
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T postgres pg_restore -U modern_airbnd -d modern_airbnd_restore_test --no-owner --no-acl < modern-airbnd.dump
```

Compare property, unit, image-reference and block counts; check a known property's dates in the restored database. Protect dump files like production data. Record a successful restore and its recovery time. These commands have not been executed as part of this handover.

## Upgrade and rollback

1. Record the current Git commit/release and back up the database.
2. Build the reviewed source revision.
3. Apply migrations using the migration service, then recreate API/web.
4. Wait for health checks; smoke-test public and admin flows.
5. If application regression occurs, redeploy the last reviewed release only if its code remains schema-compatible.

Never assume app rollback reverses schema migrations. Prefer additive migrations and test any destructive change against a restored database first. Do not run `docker compose down -v` against production: it deletes named volumes, including database data.

## Security and maintenance

- The API trusts exactly one proxy hop in production; keep it inaccessible except through Caddy and the internal web proxy.
- Change the admin password by generating a new hash and restarting the API. To revoke every existing session too, rotate SESSION_SECRET or clear the session table through an authorized maintenance action.
- Keep Node, Next, Express, Prisma and container images patched after reviewing release/security notes. Exact dependency versions are locked in package-lock.json.
- Avoid logging passwords, session cookies or secrets. Request IDs and structured request summaries are emitted by the API.
- An API readiness failure indicates a database connectivity problem. Cloudinary credentials are optional for read availability but required for real media administration.

# cloud-project

Self-hosted home for SaaS apps moved off Base44. One VPS runs one Docker
Compose stack. Every app is a static frontend plus its own slice of a shared,
self-hosted Supabase backend.

```
                 ┌──────────────── VPS (docker compose) ────────────────┐
 app1.domain ───►│ Caddy ── /srv/www/app1 (static Vite build)           │
 app2.domain ───►│   │   ── /srv/www/app2                               │
 api.domain  ───►│   ├─ /auth/v1    → GoTrue    (users, magic links,    │
                 │   │                           Google login)          │
                 │   ├─ /rest/v1    → PostgREST ─┐                      │
                 │   └─ /storage/v1 → Storage  ──┴─► Postgres           │
                 │                                   schema per app     │
                 └──────────────────────────────────────────────────────┘
```

| Base44 concept             | Here                                                                 |
| -------------------------- | -------------------------------------------------------------------- |
| App                        | Postgres schema `<app>` + storage bucket `<app>` + Caddy site        |
| Entity (`Task`)            | Table `<app>."Task"` with row-level security                         |
| Built-in fields            | `id`, `created_date`, `updated_date`, `created_by` (set by trigger)  |
| User entity / `auth.me()`  | Supabase Auth user + `<app>.profiles` row (`role`, custom fields)    |
| `Core.UploadFile`          | Public storage bucket, files under the uploader's user id            |
| `@base44/sdk`              | `packages/base44-compat`, which keeps the same API                   |

## Repository layout

```
docker-compose.yml        the whole stack
caddy/Caddyfile           API routing; caddy/sites/<app>.caddy per app (generated)
supabase/init/            database bootstrap (runs on first start only)
  platform.sql            register_app(), setup_entity(), audit + RLS helpers
packages/base44-compat/   drop-in @base44/sdk replacement + React login page
apps/<app>/               per-app config: entities/*.json, schema.sql, app.env, custom.sql
apps/_example/            sample Base44 entity schemas
scripts/                  gen-keys, new-app, apply-schema, import-data, deploy-app, backup
www/<app>/                deployed frontend builds (not in git)
```

## 1. Set up the server (once)

1. **Get a VPS.** Ubuntu 24.04 with 4 GB RAM is plenty for several small apps
   (Hetzner CX22/CPX21, DigitalOcean, etc.). Open ports 22, 80 and 443 only.
2. **DNS.** Point `api.<domain>` and each app hostname at the server. A wildcard
   `*.<domain>` A record covers all of them.
3. **Install Docker:** `curl -fsSL https://get.docker.com | sh`
4. **Clone and configure:**
   ```bash
   git clone <this repo> /opt/cloud-project && cd /opt/cloud-project
   cp .env.example .env
   node scripts/gen-keys.mjs        # paste the 4 values into .env
   nano .env                        # DOMAIN, ACME_EMAIL, SMTP_*, optional GOOGLE_*
   docker compose up -d
   docker compose ps                # all services should become healthy
   ```
   Node is only needed for the helper scripts (`apt install nodejs`, v20+).
5. **Email.** Magic-link login needs working SMTP. Any provider works
   (Resend, Postmark, SES). Verify your sending domain with them.
6. **Backups.** Add `scripts/backup.sh` to cron (see the header of the script)
   and copy `backups/` off the server. Not optional: this replaces what Base44
   did for you.

## 2. Migrate one Base44 app

Example app name: `crm`, served at `crm.<domain>`.

**a. Register the app**
```bash
scripts/new-app.sh crm                 # or: scripts/new-app.sh crm app.mybrand.com
```

**b. Recreate the entities.** For each entity, save its Base44 JSON schema as
`apps/crm/entities/<Entity>.json`. Get it from the Base44 dashboard
(Data → entity → schema), or from the `entities/` folder if your export
includes one. See `apps/_example/entities/` for the format. You can pick
who sees what per entity with `"x-access"`:

| `x-access`            | Read                       | Create    | Edit / delete      |
| --------------------- | -------------------------- | --------- | ------------------ |
| `shared` (default)    | any signed-in user         | signed in | creator or admin   |
| `private`             | creator or admin           | signed in | creator or admin   |
| `public_read`         | everyone, even signed out  | signed in | creator or admin   |
| `admin_write`         | any signed-in user         | admin     | admin              |

Check these against the permissions the app had in Base44. Then:
```bash
scripts/apply-schema.sh crm            # re-run any time you add entities/fields
```
For anything the presets don't cover (extra indexes, custom policies, SQL
functions), add `apps/crm/custom.sql`. It is applied after the generated schema.

**c. Move the data.** Export each entity as CSV (or JSON) from the Base44
dashboard, then:
```bash
node scripts/import-data.mjs crm Task ~/Downloads/Task.csv
```
Original ids are kept, so references between entities still work. Re-running
the import updates rows instead of duplicating them. Ownership follows the
`created_by` email, so users regain edit rights to their old records once they
sign in with the same email.

**d. Point the frontend at the new backend.** In the exported app's code:
```bash
npm uninstall @base44/sdk && npm install @supabase/supabase-js
cp /opt/cloud-project/packages/base44-compat/src/index.js src/lib/base44-compat.js
cp /opt/cloud-project/packages/base44-compat/react/LoginPage.jsx src/pages/Login.jsx
cp /opt/cloud-project/apps/crm/app.env .env.production
```
Replace `src/api/base44Client.js` with:
```js
import { createClient as createSupabase } from '@supabase/supabase-js';
import { createClient } from '@/lib/base44-compat';

const supabase = createSupabase(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export const base44 = createClient({
  supabase,
  schema: import.meta.env.VITE_APP_SCHEMA,
  requiresAuth: true, // same as Base44's requiresAuth: send signed-out visitors to /login
});
```
Add a `/login` route that renders `Login.jsx`. `entities.js` and the rest of
the app can stay as they are: `base44.entities.X.list/filter/get/create/update/delete/bulkCreate`,
`base44.auth.me/updateMe/logout/redirectToLogin` and `Core.UploadFile` all work
the same way.

**e. Build and deploy**
```bash
npm run build
scripts/deploy-app.sh crm path/to/app/dist     # run on the server (rsync dist/ there first)
```

**f. Make yourself admin** (after signing in once):
```bash
docker compose exec db psql -U supabase_admin -h localhost -d postgres \
  -c "update crm.profiles set role = 'admin' where email = 'you@example.com'"
```

### What does not carry over automatically

- **Integrations other than UploadFile** (`InvokeLLM`, `SendEmail`,
  `GenerateImage`, `ExtractDataFromUploadedFile`) and **backend functions**
  (`base44.functions.invoke`). They throw a clear "not migrated" error (HTTP
  501). Pass your own implementations via `createClient({ integrations: { InvokeLLM } })`,
  or set `functionsUrl` to a backend you host. API keys for LLM or email
  providers must stay on a server, never in the frontend.
- **Passwords.** Base44 doesn't export them. Users sign in again with a magic
  link or Google using the same email.
- **Complex filters** such as `$or` or `$elemMatch`. Unsupported operators throw
  instead of being silently ignored. Use `base44.supabase` (the raw
  supabase-js client) for those queries.
- **Realtime subscriptions** aren't included in this stack yet.

## Operations

| Task                       | Command                                                          |
| -------------------------- | ---------------------------------------------------------------- |
| Status / logs              | `docker compose ps`, `docker compose logs -f auth`               |
| SQL shell                  | `docker compose exec db psql -U supabase_admin -h localhost -d postgres` |
| Reload Caddy after edits   | `docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile` |
| Backup now                 | `scripts/backup.sh`                                              |
| Restore DB                 | `docker compose exec -T db pg_restore -U supabase_admin -h localhost -d postgres --clean < backups/<ts>/db.dump` |
| Update images              | bump tags in `docker-compose.yml` (follow [supabase/docker](https://github.com/supabase/supabase/tree/master/docker)), `docker compose pull && docker compose up -d` |
| Run tests                  | `npm test`                                                       |

Postgres is not exposed to the internet. Reach it through `docker compose
exec`, or an SSH tunnel for GUI tools.

### Shared-stack trade-offs

All apps share one Auth service, so one user account (email) works across all
your apps. Each app still keeps its own profile, role and data. The magic-link
email template and sender are shared too. If an app needs fully separate
users or its own email branding, run a second copy of this stack for it
(separate directory, `name:` and domain).

## Testing

- `npm test` runs fast unit tests (filter translation, schema generation, CSV
  import). No Docker needed.
- `npm run test:e2e` drives the real stack with supabase-js through Caddy
  over HTTPS: entity CRUD, filters, the access presets, admin roles, uploads.
  **Local only.** It deletes all users, so it refuses to run unless
  `DOMAIN=localhost`. Setup: `npm install`, a `.env` with `DOMAIN=localhost`
  and `ENABLE_EMAIL_AUTOCONFIRM=true`, `127.0.0.1 api.localhost demo.localhost`
  in `/etc/hosts`, `docker compose up -d`. It registers a throwaway `demo` app
  from `apps/_example`.

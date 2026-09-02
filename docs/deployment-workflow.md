# Deployment Workflow

## Vercel (recommended)

1. Push the repo to GitHub.
2. Import it in [Vercel](https://vercel.com).
3. Copy every variable from `.env.example` into Vercel's Environment
   Variables panel — only fill in the optional ones (Stripe, R2, Resend,
   Sentry) this project actually uses; see `docs/integrations.md`.
4. Set `SKIP_ENV_VALIDATION=true` as a build-time env var only if the
   build environment genuinely lacks secrets it needs (CI does this — see
   `.github/workflows/ci.yml`). Don't reach for it to silence a real
   misconfiguration.
5. Deploy.

## Environments

| Environment | Branch           | Database                                                | Keys |
| ----------- | ---------------- | ------------------------------------------------------- | ---- |
| Local       | —                | Neon dev branch (`DATABASE_URL` in `.env.local`)        | Test |
| Preview     | feature branches | Same dev branch unless you set up Neon branching per PR | Test |
| Production  | `main`           | Production branch (`.env.prod`)                         | Live |

A preview pointed at production credentials charges real cards and emails
real users if Stripe/Resend are configured — double-check before the
first preview deploy that uses either.

## Database

- **Dev:** `npm run db:push` — pushes the current schema, no migration
  files. Fast to iterate with, destructive on conflicting changes.
- **Prod:** `npm run db:push:prod` / `db:migrate:prod` (via `dotenv -e
.env.prod`) — decide up front whether this project uses `db:push` or
  proper migrations (`db:generate` + `db:migrate`) in production; push is
  fine solo, migrations are safer once more than one person touches the
  schema.
- **Expand/contract for anything destructive:** add the new column
  nullable and deploy, backfill, then drop the old column in a separate
  deploy. Renaming a column in one step breaks a rollback, because
  rolling back reverts code, not the database.

## Release

- No committed CI gate currently blocks merges beyond `npm run validate`
  (typecheck, lint, format, build) — see `.github/workflows/ci.yml`. Add a
  test job and branch protection once the project has tests worth
  gating on.
- `.husky/pre-push` blocks a broken build from reaching `origin`, not a
  broken deploy — Vercel still runs its own build on push.

## Other providers

Works with any host that supports Next.js 16: Railway, Fly.io, AWS
Amplify, self-hosted via `Dockerfile`/`docker-compose.yml`. Adjust the
build command and environment variables accordingly.

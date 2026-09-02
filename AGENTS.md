# NextLaunch — Starter Template

Production-ready Next.js boilerplate: auth, payments, email, storage, i18n
and CI/CD wired up so a new project skips setup and starts on features.
**This is a template, not a product.** Delete whatever a given project
doesn't need — an unused integration left in place is a liability, not a
convenience (see `docs/integrations.md`).

> This file is always loaded (`CLAUDE.md` is `@AGENTS.md` — Claude Code
> resolves that import automatically; Codex, Cursor, and GitHub Copilot
> read `AGENTS.md` directly). Keep it short. Deep detail lives in `docs/`
> (see the map at the bottom) — read the relevant doc before working in
> that area, don't guess. `docs/VISION.md` is a separate, **aspirational**
> document — do not treat anything in it as implemented; see its banner.

## Behavior

- Concise. No basic-concept explanations — give the solution.
- YAGNI: implement only what's asked. Propose improvements, don't
  auto-implement them.
- Ambiguous request → ask before implementing.
- No new dependencies without explicit permission (propose + justify first).
- Don't refactor unrelated code.
- Check a file doesn't already exist before creating it; read a file
  before modifying it.
- Code, variables, comments in English. All UI strings go through
  `next-intl` (`src/messages/es.json` / `en.json`) — never hardcode
  user-facing text. Default language: Spanish.
- When starting a **new project from this template**, ask which
  integrations (Stripe, R2, Resend, Sentry) are actually needed before
  wiring up features against them — don't assume all of them apply.
- When flow/architecture changes, update the relevant `docs/` file.

## Non-negotiable constraints

- **Server Components first.** `"use client"` only when hooks/interactivity
  require it.
- **DAL pattern.** All DB queries go through `src/data/`. Never import
  `db` directly in UI/pages/actions.
- **Typed responses.** Server Actions return `ActionResponse<T>`
  (`src/types/index.ts`) — never throw a bare error out of an action.
- **Env safety.** Every env var is validated in `src/lib/env.ts`. Adding one
  without updating `env.ts` and `.env.example` in the same change is a bug.
- **No `middleware.ts` at root.** This template uses `src/proxy.ts` —
  creating `middleware.ts` alongside it causes routing conflicts.
- **Integrations are optional by construction.** Stripe, R2 and Resend keys
  are `.optional()` in `env.ts`; the app boots without them. A feature that
  needs one must check `integrations.<name>` from `@/lib/env` (or catch the
  startup error from that lib file) rather than assuming the key exists.

**Not building:** this template ships no domain logic, no committed
migrations beyond the example `users` table, and no admin UI generator —
those are what the next project adds on top.

## Tech stack

| Layer         | Choice                                                                 |
| ------------- | ---------------------------------------------------------------------- |
| Framework     | Next.js 16 (App Router), React 19 (Compiler enabled)                   |
| Styling       | Tailwind CSS v4                                                        |
| Components    | Shadcn/UI + Radix                                                      |
| Database      | PostgreSQL (NeonDB) + Drizzle ORM                                      |
| Auth          | Clerk                                                                  |
| Client state  | Zustand                                                                |
| Server state  | SWR                                                                    |
| Forms         | React Hook Form + Zod                                                  |
| Payments      | Stripe — **optional**, see `docs/integrations.md`                      |
| Email         | Resend — **optional**                                                  |
| Storage       | Cloudflare R2 (S3-compatible) — **optional**                           |
| Errors        | Sentry — **optional**, degrades to console-only without a DSN          |
| Rate limiting | In-memory, auto-upgrades to Upstash Redis if configured — **optional** |
| Analytics     | Vercel Analytics + Speed Insights — cookieless, included               |
| Theming       | next-themes (light/dark/system), wired in the root layout              |
| i18n          | next-intl (`es` default, `en`)                                         |
| Testing       | Vitest (unit) + Playwright (E2E)                                       |

Full package list with versions → `docs/references.md`.

## Coding guidelines

1. TypeScript strict mode. No `any`.
2. File names: `kebab-case`. Components: `PascalCase`. Utils/hooks:
   `camelCase`. Constants: `UPPER_SNAKE_CASE`. DB schema: `snake_case`.
3. Absolute imports via `@/`.
4. Server Actions: `requireAuth()` (or `requireRole()`) → validate input →
   call DAL (`src/data/`) → `logger` → return `ActionResponse<T>`. See
   `src/actions/example.ts` for the full shape.
5. API routes: wrap with `withErrorHandler()` (`src/lib/api.ts`); throw
   `AppError` subclasses (`src/lib/errors.ts`) for expected failures.
6. Auth: always via `requireAuth()` / `requireRole()` from `@/lib/auth` —
   never call the Clerk SDK directly outside that file.
7. Logging: `logger` from `@/lib/logger`, never raw `console.log`. It
   forwards to Sentry automatically when `NEXT_PUBLIC_SENTRY_DSN` is set,
   and no-ops to console-only otherwise.
8. `import "server-only"` at the top of server-only modules (`lib/auth.ts`,
   `lib/api.ts`, `data/*` are the existing examples) to prevent accidental
   client bundling.
9. Before adding a raw `<input>`, `<button>`, `<label>`, dialog, etc.,
   check `src/components/ui/` first — extend an existing primitive rather
   than hand-rolling a new one.
10. Webhooks (`src/app/api/webhooks/*`) verify their signature before doing
    any work, and dedupe on the provider's event ID — see
    `docs/patterns-and-gotchas.md`.
11. Security headers and a baseline CSP are set in `next.config.mjs`'s
    `headers()`. Its `script-src`/`connect-src` are intentionally permissive
    (any `https:` origin) rather than allowlisting Clerk/Stripe/Sentry by
    name — see `docs/patterns-and-gotchas.md` before tightening them.
12. **Read the bundled Next.js docs before writing App Router code** —
    `node_modules/next/dist/docs/` (resolved relative to this file; in a
    monorepo the `next` package may not be visible from the repo root).
    They're version-matched to the installed `next`, unlike training data.
    See the managed block at the bottom of this file.

## Roles

| Role  | Auth  | Access                                                                        |
| ----- | ----- | ----------------------------------------------------------------------------- |
| user  | Clerk | Default role on sign-up                                                       |
| admin | Clerk | Set via `publicMetadata.role` in Clerk — see `src/lib/constants.ts` (`ROLES`) |

`requireRole("admin")` in `src/lib/auth.ts` enforces this server-side; there
is no UI gating yet beyond what a new project builds.

## Key commands

| Command                           | Use                                                             |
| --------------------------------- | --------------------------------------------------------------- |
| `npm run dev`                     | Dev server                                                      |
| `npm run build`                   | Production build — run before claiming a task done              |
| `npm run validate`                | Full local CI: typecheck → lint → format:check → build          |
| `npm run lint` / `lint:fix`       | ESLint                                                          |
| `npm run format` / `format:check` | Prettier                                                        |
| `npm run test`                    | Vitest, single run                                              |
| `npm run test:coverage`           | Vitest with coverage report                                     |
| `npm run test:e2e`                | Playwright                                                      |
| `npm run db:push`                 | Push Drizzle schema to the dev database                         |
| `npm run db:studio`               | Drizzle Studio (visual DB browser)                              |
| `npm run db:seed`                 | Seed the database (`src/lib/db/seed.ts`)                        |
| `npm run clean`                   | Delete `.next` — fixes stale type errors after removing a route |

## 📚 Read on demand (don't auto-load — open only when relevant)

- **`docs/architecture.md`** — directory tree and route inventory. Read
  before adding a route or reorganizing folders.
- **`docs/integrations.md`** — Clerk, Stripe, Resend, R2, Sentry, Upstash,
  Vercel Analytics: purpose, key files, env vars, and **how to remove each
  one** if a project doesn't need it. Read before wiring up or ripping out
  any of them. Also covers the placeholder `/privacy` and `/terms` pages
  (`src/messages/*.json`'s `legal` namespace) — replace before launch —
  and the `.mcp.json` / bundled-docs AI agent tooling described below.
- **`docs/patterns-and-gotchas.md`** — established patterns (Server Action
  shape, DAL, auth guards, webhooks) and known gotchas. Read before
  implementing something that resembles what's already scaffolded, and
  whenever you touch auth, webhooks, i18n, or dates.
- **`docs/domain-model.md`** — DB schema and entities. Read before touching
  `src/lib/db/schema.ts` or writing a migration.
- **`docs/deployment-workflow.md`** — environments, branch flow, and what
  to run manually vs. what CI does automatically.
- **`docs/maintenance-checklist.md`** — recurring health audit (deps,
  security, a11y, SEO) for a project once it's live. Not relevant to a
  freshly cloned template.
- **`docs/roadmap.md`** — current phase and active task for **this specific
  project** once cloned. Empty/bootstrap state in the template itself.
- **`docs/references.md`** — full dependency list with versions.
- **`docs/VISION.md`** — an ambitious target architecture (Better Auth,
  `next-safe-action`, WCAG/APCA design system, full testing pyramid, etc.)
  written for a possible future evolution of this template. **None of it
  is implemented today.** Read only if deliberately planning that
  migration — never assume any symbol, file, or library it names exists.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Integrations

Every integration below Clerk/Database is **optional**: `src/lib/env.ts`
validates its keys with `.optional()`, so the app boots without them. Each
one exposes a flag on `integrations` (from `@/lib/env`) so feature code can
check `integrations.stripe` instead of assuming the SDK is configured.

**Read before wiring one up, and before ripping one out.** If a new
project genuinely doesn't need an integration, delete it — an unused
integration left in the codebase is a liability: an agent reading the repo
later will assume the capability exists and build features against it.

## Clerk — required

- **Purpose:** authentication, session management, user metadata (roles).
- **Files:** `src/proxy.ts` (route protection + locale negotiation),
  `src/lib/auth.ts` (`getCurrentUser`, `requireAuth`, `requireRole`),
  `src/app/api/webhooks/clerk/route.ts` (sync to your DB),
  `src/app/[locale]/layout.tsx` (`ClerkProvider`).
- **Env vars:** `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`,
  `CLERK_WEBHOOK_SECRET` (for the webhook route).
- This is the one integration the template assumes exists — swapping it
  out is a real migration, not a delete. If you do it anyway, everything
  importing `@clerk/nextjs` needs a replacement (see `docs/VISION.md` for
  what a self-hosted-auth version of this template would look like — as a
  direction to evaluate deliberately, not something to assume is done).

## Stripe — optional (payments)

- **Purpose:** checkout, subscriptions, invoices.
- **Files:** `src/lib/stripe.ts`, `src/app/api/webhooks/stripe/route.ts`.
- **Env vars:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
- **Disabled behavior:** `src/lib/stripe.ts` throws a clear error the
  moment it's imported without `STRIPE_SECRET_KEY` set — the webhook route
  already dynamically imports it and returns HTTP 500 before that happens
  if `STRIPE_WEBHOOK_SECRET` is missing. The rest of the app is unaffected.
- **To remove entirely:** delete `src/lib/stripe.ts` and
  `src/app/api/webhooks/stripe/`; remove `STRIPE_*` /
  `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` from `env.ts` and `.env.example`;
  `npm uninstall stripe @stripe/stripe-js`.
- **Critical if kept:** the webhook handler must be idempotent — Stripe
  retries deliveries, so dedupe on `event.id` before any side effect (not
  yet implemented in the example handler — add it before going live).

## Resend — optional (transactional email)

- **Purpose:** sending emails (welcome, notifications, etc.).
- **Files:** `src/lib/resend.ts`, `src/lib/email/send.ts`,
  `src/lib/email/templates/`.
- **Env vars:** `RESEND_API_KEY`, `RESEND_FROM_EMAIL`.
- **Disabled behavior:** `src/lib/resend.ts` throws a clear error if
  imported without `RESEND_API_KEY`. Nothing in the template calls
  `sendEmail()` yet, so leaving it unconfigured is safe by default.
- **To remove entirely:** delete `src/lib/resend.ts` and
  `src/lib/email/`; remove `RESEND_*` from `env.ts` and `.env.example`;
  `npm uninstall resend`.

## Cloudflare R2 — optional (file storage)

- **Purpose:** S3-compatible object storage for uploads.
- **Files:** `src/lib/r2.ts`.
- **Env vars:** `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`,
  `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `NEXT_PUBLIC_R2_PUBLIC_URL`.
- **Disabled behavior:** `src/lib/r2.ts` throws a clear error if imported
  without the four server-side vars set. Nothing in the template imports
  it yet, so leaving it unconfigured is safe by default.
- **To remove entirely:** delete `src/lib/r2.ts`; remove `R2_*` /
  `NEXT_PUBLIC_R2_PUBLIC_URL` from `env.ts` and `.env.example`;
  `npm uninstall @aws-sdk/client-s3`.
- **If you build an upload flow:** prefer presigned PUT URLs over routing
  file bytes through a Server Action — Vercel serverless functions cap the
  request body around 4.5MB, so a request through an action fails
  opaquely on anything larger than a small image.

## Sentry — optional (error monitoring)

- **Purpose:** error tracking, session replay, performance traces.
- **Files:** `src/sentry.server.config.ts`, `src/sentry.edge.config.ts`,
  `src/instrumentation.ts`, `next.config.mjs` (`withSentryConfig`),
  `src/lib/logger.ts` (auto-forwards `logger.error` when a DSN is set).
- **Env vars:** `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`,
  `SENTRY_AUTH_TOKEN` (build-time only, not read via `env.ts`).
- **Disabled behavior:** already degrades gracefully — `logger` checks for
  a DSN at runtime and falls back to console-only. No error at any keys
  missing; this is the reference pattern the other integrations' explicit
  guards are trying to approximate for cases where a silent no-op isn't
  safe (payments, storage, email — you want to know immediately if those
  are misconfigured, not discover it in production).
- **To remove entirely:** delete the files above, the `withSentryConfig`
  wrapper in `next.config.mjs`, the Sentry block in `logger.ts`;
  `npm uninstall @sentry/nextjs`.

## Legal pages — included, placeholder content

- **Purpose:** `/privacy` and `/terms` exist so a project doesn't launch
  with dead footer links — not because the included text is usable as-is.
- **Files:** `src/app/[locale]/privacy/page.tsx`, `.../terms/page.tsx`,
  `src/components/legal-page.tsx`, the `legal` namespace in
  `src/messages/es.json` / `en.json`.
- **Before launch:** replace every bracketed placeholder (`[Company
name]`, `[jurisdiction]`, `[contact email]`, the payments section if
  Stripe is disabled) with real content **reviewed by a lawyer** — the
  shipped text is a structural placeholder, not legal advice, and the
  page renders a visible "not legal advice" banner until you remove it.
- **Cookies note:** the placeholder text already reflects that Vercel
  Analytics is cookieless and Clerk's session cookie is strictly
  necessary. If you add anything that sets a non-essential cookie
  (PostHog, GA, a marketing pixel), you likely need a consent banner
  before it loads, and to update this page's Cookies section.

## NeonDB — required

- **Purpose:** Postgres database.
- **Files:** `src/lib/db/index.ts`, `src/lib/db/schema.ts`,
  `drizzle.config.ts`.
- **Env vars:** `DATABASE_URL`.
- Branch per preview/PR if you adopt Neon's branching — not configured by
  default in this template's CI.

## Upstash Redis — optional (production-grade rate limiting)

- **Purpose:** distributed rate limiting that survives serverless — the
  in-memory limiter it upgrades resets per invocation on Vercel.
- **Files:** `src/lib/rate-limit.ts` — `checkRateLimit()` uses Upstash
  automatically when configured; otherwise falls back to in-memory with no
  code change required at call sites.
- **Env vars:** `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
- **Disabled behavior:** silent fallback to the in-memory limiter — no
  error, since the in-memory version is a legitimate (if limited) default
  for local dev and single-instance deployments.
- **To remove entirely:** delete `@upstash/ratelimit` and `@upstash/redis`
  usage from `src/lib/rate-limit.ts` (keep the in-memory implementation),
  remove the `UPSTASH_*` vars from `env.ts` and `.env.example`;
  `npm uninstall @upstash/ratelimit @upstash/redis`.

## Vercel Analytics & Speed Insights — included, effectively zero-config

- **Purpose:** page-view analytics and Core Web Vitals, without cookies or
  personal data — no consent banner needed for these specifically.
- **Files:** `<Analytics />` and `<SpeedInsights />` in
  `src/app/[locale]/layout.tsx`.
- **Behavior off Vercel:** both components no-op when not deployed on
  Vercel (e.g. local dev, another host) — safe to leave in.
- **To remove entirely:** delete the two components and their imports from
  `layout.tsx`; `npm uninstall @vercel/analytics @vercel/speed-insights`.
- **If you need product analytics instead** (funnels, feature flags,
  session replay — not just page views), that's a bigger addition
  (PostHog or similar) that also sets cookies and needs a consent gate
  before loading. Not included by default — see `docs/VISION.md` §11 for
  what that would look like.

## AI agent tooling — Next.js 16.3+, included

Implements [Next.js's own AI-agents guide](https://nextjs.org/docs/app/guides/ai-agents).
`next` is pinned to `16.3.4` specifically for this — it's the first
version that auto-generates these files.

- **`AGENTS.md`** is the real, always-loaded source of truth (this repo's
  equivalent of "the docs an agent reads before touching code"). It ends
  with a `<!-- BEGIN:nextjs-agent-rules --> ... <!-- END -->` block that
  `next dev` writes and re-adds if it goes missing — don't hand-edit that
  block, and don't delete it; it points agents at the version-matched
  Next.js docs bundled in `node_modules/next/dist/docs/` instead of
  relying on training data, which can describe a different Next.js
  version entirely.
- **`CLAUDE.md`** is one line — `@AGENTS.md` — which Claude Code resolves
  as an import automatically. **Edit `AGENTS.md`, never `CLAUDE.md`.**
  Codex, Cursor, and GitHub Copilot read `AGENTS.md` directly.
- **`.mcp.json`** configures the `next-devtools-mcp` server, which
  auto-connects to a running `npm run dev` and exposes live compilation
  errors, runtime errors, routes, and Server Action lookups as MCP tools
  — an agent can ask "what errors are currently in my application?"
  without running a full `npm run build` first. Requires the dev server
  to actually be running; it has nothing to report otherwise.
- **To upgrade further:** `next.config.mjs` doesn't set `agentRules`, so
  the default (auto-generate/upsert) applies. Set `agentRules: false`
  there to opt out. [Vercel's official Next.js Skills](https://www.skills.sh/vercel/next.js)
  (`next-dev-loop`, Cache Components / Partial Prefetching adoption) are
  a further optional layer for workflows rather than lookups — not
  installed by default here; add one with
  `npx skills add vercel/next.js --skill <name>` if a project wants that
  specific workflow.
- **To remove entirely:** you generally shouldn't — this is what makes
  `npm run dev` keep agents pointed at the docs for whatever Next.js
  version the project is actually running, which matters most right
  after an upgrade. If you do: delete `.mcp.json`, delete the managed
  block from `AGENTS.md`, and set `agentRules: false` in
  `next.config.mjs` so `next dev` doesn't re-add it.

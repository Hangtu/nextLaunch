# 📂 PROJECT CONTEXT: NextLaunch

> **SYSTEM INSTRUCTION FOR AI:**
> This file is the Single Source of Truth (SSOT) for architectural decisions, constraints, and non-obvious knowledge.
> It is NOT a mirror of the filesystem. Anything derivable by reading the code (exact file lists, exports, props) is authoritative in the code, not here.
> Read Sections 0, 1 and 2 before any task. Load other sections on demand per the Context Load Map.
> If a user prompt contradicts this file, prioritize this file or ask for confirmation.

> **Agent tooling:** `CLAUDE.md` and `AGENTS.md` at the project root are thin pointers to this file, so any agent runtime picks up the same SSOT. Do not duplicate content into them — one file, many readers.

---

## 0. 🤖 AI Instructions

### Prime Directive

1. **Always read:** Section 0 (this), Section 1 (Constraints), Section 2 (Stack & Guidelines).
2. **Load on demand:** use the Context Load Map for the rest.
3. **Resolve conflicts:** if the user's prompt contradicts this file, prioritize this file or ask.

### 🗺️ Context Load Map

| Read this section | When |
| ----------------- | ---- |
| 0, 1, 2 | Always |
| 12 (Testing) | Writing or modifying any Server Action, DAL function, or auth logic |
| 13 (Security) | Touching auth, API routes, webhooks, uploads, or any user input |
| 15 (Gotchas) | Before debugging anything that "should work" |
| 11 (Integrations) | Touching Better Auth, Stripe, Resend, R2, Neon, Upstash, or Sentry |
| 9 (Env) | Adding or reading an environment variable |
| 10 (Commands) | Running anything in the terminal |
| 3, 4 (Architecture, Domain) | Adding routes or entities, restructuring |
| 5, 6, 7 (Status, Roadmap, Icebox) | Planning, or asked "what's next" |
| 8 (Flow), 14 (Deploy), 16 (Refs) | Rarely — deploy questions or navigation redesign |

### Vibe & Behavior

- **Concise:** do not explain basic concepts. Give the solution.
- **Strict compliance:** adhere to Section 2 guidelines and Section 1 constraints.
- **Language:** **English** for all code (variables, functions, types, comments, JSDoc). All user-facing strings go through `next-intl` — see Rule 15.
- **Scope (YAGNI):** implement only what is requested. Propose improvements; do not implement them unsolicited.
- **Clarification:** if the request is ambiguous, ask. Do not assume.
- **Dependencies:** do NOT introduce libraries without explicit permission. Propose with justification first.
- **Refactoring:** do not refactor code unrelated to the active task.
- **File awareness:** before creating a file, verify it doesn't exist. Before modifying, read its current content.
- **Documentation:** when architecture, constraints, or non-obvious behavior changes, update this file. When you burn time on a non-obvious bug, add it to Section 15.
- **Security-first:** see Section 13. Auth and validation are structural, not retrofitted.

### 🚫 Anti-Patterns (things AI assistants get wrong here — do not do these)

1. **Do not silence the type system.** `any`, `as unknown as`, `@ts-ignore`, `@ts-expect-error`, and non-null `!` are forbidden as a way to make `tsc` pass. If types don't line up, the model or the logic is wrong.
2. **Do not define a raw Server Action.** Every action is built from a `next-safe-action` client (`actionClient`, `authActionClient`, `adminActionClient`). A bare `"use server"` async export is an unauthenticated public RPC endpoint — see §13.
3. **Do not create a utility that already exists.** Search `src/lib/utils.ts`, `src/lib/`, and `src/hooks/` first.
4. **`"use client"` is a permission you request, not a default.** Every occurrence needs a reason (hook, event handler, browser API). Push it to the smallest leaf — a client leaf inside a server page, never a client page.
5. **Do not swallow errors.** No `catch {}`, no `catch (e) { return null }`. Every catch logs via `logger` or throws a typed error from `@/lib/errors`.
6. **Do not import `db` outside `src/data/`.** No exceptions.
7. **Do not hand-write Zod schemas that mirror a DB table.** Derive them with `drizzle-zod`, then `.refine()` for business rules.
8. **Do not put client state in Zustand if it belongs in the URL.** Filters, pagination, tabs, sort order and open-modal state go through `nuqs`.
9. **Do not route file bytes through a Server Action.** Uploads use presigned URLs — see §11 R2.
10. **Do not touch files outside the active task's scope.** No opportunistic cleanup.
11. **Do not invent env vars.** Adding one means updating `src/lib/env.ts`, `.env.example`, and Section 9 in the same change.
12. **Do not hardcode user-facing text.** Add the key to `messages/es.json` and `messages/en.json`.
13. **Do not rebuild what Shadcn/Radix provides.** Check `src/components/ui/` and the Shadcn registry first.
14. **Do not mark a task complete without running the DoD below.**

### ✅ Definition of Done (per task)

Not complete until all pass. Run them; do not assume.

```bash
npm run typecheck   # zero errors
npm run lint        # zero errors, zero warnings
npm run test        # unit + component tests pass (see §12 for what requires a test)
```

When the change touches UI, additionally:

- **Visual verification:** render the affected route via the browser MCP, screenshot at 375px and 1280px, confirm it matches intent. Never report UI work as done unsighted.
- **Keyboard pass:** the new UI is reachable and operable with Tab / Enter / Escape alone, with visible focus.

Then report what you ran and what the results were.

---

## 1. 🎯 Project Overview & Boundaries

### Core Vision

- **Elevator Pitch:** NextLaunch is a production-ready Next.js 16 **SaaS boilerplate** with self-hosted auth, payments, email, storage, i18n, testing and observability pre-wired behind a clean architecture — so developers skip setup and start on features.
- **Target Audience:** solo developers, freelancers, and small teams shipping SaaS or web apps.
- **KPIs:**
  - Clone to first feature < 30 minutes.
  - Zero configuration errors on fresh clone (env validation catches everything).
  - `npm run validate` passes with zero warnings out of the box.

> **Positioning:** this is an opinionated SaaS starter, not a neutral blank slate. Auth, payments, email and storage are pre-wired. If your project doesn't need one, **delete it** — an unused integration is a live liability, because an AI assistant reading this repo will assume the capability exists and wire features into it.

> **Design bias — own your data:** where a self-hosted library and a SaaS vendor are comparable, this boilerplate picks the library. Auth is the clearest case: user identities are the hardest thing to migrate, so they live in your own Postgres. Vendor alternatives are documented in §11 for teams that prefer to trade lock-in for speed.

### 🚧 Operational Constraints (Grounding)

_Non-negotiable._

- **Server Components First:** default to RSC. `"use client"` only for hooks, event handlers, or browser APIs, at the smallest possible leaf.
- **DAL Pattern:** all database queries go through `src/data/`. Never import `db` in UI components, pages, or actions.
- **Safe Actions Only:** every Server Action is defined via a `next-safe-action` client. Input validation and the auth guard are enforced by middleware, not by convention. There is no valid reason to export a bare `"use server"` function.
- **Env Safety:** all environment variables are validated in `src/lib/env.ts`. Direct `process.env` is allowed only in files that run outside the Next.js runtime (`drizzle.config.ts`, `next.config.ts`, Sentry init).
- **Explicit Auth Declaration:** every route, API route and action declares its auth posture. **Intentionally public endpoints are listed in §13 with justification and abuse mitigation.** Nothing ships with an undeclared posture.
- **Double-Layer Authorization:** the proxy handles navigation (optimistic, cookie-based). Real enforcement happens server-side in the action or route handler. Proxy-only protection is one middleware CVE away from public — and that CVE shipped in 2026, see §13.
- **Roles:** `user` (default — `/dashboard`, `/settings`), `admin` (`/admin`). The `role` column lives on the `user` table in your database. Admin access requires `adminActionClient` or `requireRole("admin")` on the server, every time.
- **Single Source of Shape:** the Drizzle schema is the source of truth for data shape. Zod validators for table-backed entities are derived with `drizzle-zod`, never hand-written twice.
- **URL as State:** anything a user would reasonably bookmark, share, or reach with the back button lives in the URL via `nuqs`, not in a client store.
- **Platform:** mobile-first responsive web app. Accessibility target **WCAG 2.1 AA**.

### 🚫 Negative Scope

- No specific business logic — bring your own domain.
- No committed migrations — each project generates its own.
- No CMS, no admin UI generator, no multi-tenancy.
- No analytics vendor chosen (see Icebox).

### 🏁 Boilerplate Readiness Criteria

_The single canonical checklist. Do not duplicate it elsewhere in this file._

**Foundation**

- [x] Next.js 16 + React 19 + React Compiler
- [x] Tailwind CSS v4 + Shadcn/UI + Radix + Lucide
- [x] NeonDB + Drizzle ORM with example schema
- [x] i18n via next-intl (`es` default, `en`)
- [x] Structured logger with Sentry forwarding
- [x] Error class hierarchy + friendly error mapping
- [x] Env validation (Zod, fail-fast, actionable messages)
- [x] SEO scaffold (robots.ts, sitemap.ts, OG metadata, metadataBase)
- [x] PWA scaffold (manifest.ts)
- [x] Husky + lint-staged + CI (typecheck, lint, format, test, build)
- [x] Prettier + ESLint configured

**Hardening — open items**

- [ ] `next` at `16.2.11+` (security floor — §13)
- [ ] Better Auth wired: schema generated, proxy session check, `requireAuth`/`requireRole`
- [ ] `next-safe-action` clients: `actionClient`, `authActionClient`, `adminActionClient`
- [ ] Presigned-URL upload flow to R2 (no bytes through Server Actions)
- [ ] `drizzle-zod` deriving validators from schema
- [ ] React Email templates replacing HTML strings
- [ ] `nuqs` adapter mounted in root layout
- [ ] Upstash Redis rate limiting (in-memory limiter deleted)
- [ ] Vitest + RTL + MSW + `vitest-axe` configured with tests for actions, DAL, auth
- [ ] Playwright configured with one smoke spec and one admin-denied spec
- [ ] `eslint-plugin-jsx-a11y` at error level
- [ ] Browser MCP in `.mcp.json` for visual verification
- [ ] Security headers + CSP in `next.config.ts`
- [ ] Sentry PII scrubbing (`beforeSend`) and replay input masking

---

## 2. 🛠️ Tech Stack & Coding Guidelines

_Use only the tools below. Do not introduce new libraries without permission._

### Core Stack

| Category | Technology | Package(s) |
| -------- | ---------- | ---------- |
| **Framework** | Next.js 16 (App Router) | `next@16.2.11` ⚠️ security floor — §13 |
| **UI Library** | React 19 + Compiler | `react@19.2.3`, `react-dom@19.2.3` |
| **Language** | TypeScript (strict) | `typescript` |
| **Styling** | Tailwind CSS v4, mobile-first | `tailwindcss@^4`, `@tailwindcss/postcss@^4` |
| **Components** | Shadcn/UI + Radix UI | `shadcn`, `radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css` |
| **Icons** | Lucide React | `lucide-react` |
| **Database** | PostgreSQL via NeonDB | `@neondatabase/serverless` |
| **ORM** | Drizzle ORM | `drizzle-orm`, `drizzle-kit` (dev) |
| **Schema → Validation** | drizzle-zod | `drizzle-zod` |
| **Auth** | **Better Auth** (self-hosted, users in your Postgres) | `better-auth` |
| **Server Actions** | **next-safe-action** (validation + auth as middleware) | `next-safe-action` |
| **Validation** | Zod 4 | `zod` |
| **Forms** | React Hook Form + Zod | `react-hook-form`, `@hookform/resolvers` |
| **URL State** | **nuqs** | `nuqs` |
| **Client State** | Zustand (ephemeral UI only) | `zustand` |
| **Client Fetching** | SWR (narrow cases only — see note) | `swr` |
| **Payments** | Stripe | `stripe`, `@stripe/stripe-js` |
| **Email Delivery** | Resend | `resend` |
| **Email Templates** | **React Email** | `@react-email/components`, `@react-email/render` |
| **Storage** | Cloudflare R2 via presigned URLs | **`aws4fetch`** |
| **Upload UI** | FilePond | `react-filepond`, `filepond` |
| **i18n** | next-intl (`es` default) | `next-intl` |
| **Theming** | next-themes | `next-themes` |
| **Toasts** | Sonner | `sonner` |
| **Rate Limiting** | Upstash Redis | `@upstash/ratelimit`, `@upstash/redis` |
| **Error Monitoring** | Sentry | `@sentry/nextjs` |
| **Server Guards** | server-only | `server-only` |
| **Unit / Component Tests** | Vitest + RTL | `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` (dev) |
| **API Mocking** | MSW | `msw` (dev) |
| **A11y Assertions** | vitest-axe | `vitest-axe` (dev) |
| **E2E** | Playwright | `@playwright/test` (dev) |
| **Formatting** | Prettier + Tailwind plugin | `prettier`, `prettier-plugin-tailwindcss` (dev) |
| **Linting** | ESLint + a11y + Prettier compat | `eslint`, `eslint-config-next`, `eslint-plugin-jsx-a11y`, `eslint-config-prettier` (dev) |
| **Code Quality** | Husky + lint-staged | `husky`, `lint-staged` (dev) |

**Removed from earlier versions of this stack, deliberately:**

| Removed | Reason |
| ------- | ------ |
| `@clerk/nextjs` | Replaced by Better Auth. Removes the `clerk_id` column, the user-sync webhook, and its entire class of eventual-consistency bugs. |
| `svix` | Only existed to verify Clerk webhooks. Stripe verifies its own signatures. |
| `@aws-sdk/client-s3` | Heavy SDK for what is now just URL signing. `aws4fetch` does it in a few KB. |
| `ActionResponse<T>` (hand-rolled) | `next-safe-action` returns a typed result with validation errors already discriminated. Keeping both is duplicated machinery. |
| `src/hooks/use-action.ts` (hand-rolled) | `next-safe-action` ships `useAction` and `useOptimisticAction`. |
| In-memory rate limiter | Non-functional on serverless — see §15. |

**Version policy:** pin exact versions for runtime dependencies (no `^`) so builds are reproducible and agent-generated code targets a known API. Dev tooling may use `^`. Dependabot proposes weekly; security advisories are triaged the same week.

**Note on SWR:** with RSC for reads and `next-safe-action` for mutations, most apps need zero client-side fetching. SWR stays for the narrow cases RSC can't serve — polling, infinite scroll, and data that must refresh without navigation. **If you reach for SWR, first confirm RSC or a server action can't do it.** Do not migrate to TanStack Query without a concrete need (dependent query graphs, complex optimistic cache surgery).

### Coding Guidelines

1. **Strict Typing:** strict mode. No `any`, and no escape hatches to fake compliance (Anti-Pattern #1).
2. **File Naming:** `kebab-case` for all files.
3. **Component Strategy:** functional components only. RSC by default; `"use client"` at the smallest leaf.
4. **Server Action Pattern:** build from a `next-safe-action` client. The client's middleware supplies the session and the role check; the schema supplies validation. Your action body assumes both already happened and calls the DAL.
5. **Error Handling:** internal errors use the classes in `src/lib/errors.ts` — never bare `throw new Error()`. Route handlers wrap with `withErrorHandler()` from `src/lib/api.ts`. Action errors surface through `next-safe-action`'s typed result; never leak a raw message to the UI (Rule: use `getFriendlyErrorMessage`).
6. **Database Abstraction (DAL):** all queries in `src/data/*.ts` as pure functions — no auth, no validation, no logging. Import the specific module (`@/data/users`), never a barrel.
7. **Imports:** absolute with `@/`. No barrel files that re-export a directory — they break tree-shaking and hide where code lives.
8. **Naming:** `PascalCase` export in a `kebab-case` file (`product-card.tsx` → `ProductCard`); `camelCase` for utils/hooks; `UPPER_SNAKE_CASE` for constants; `snake_case` for DB columns.
9. **Logging:** `logger` from `@/lib/logger`, never `console.log`. `logger.error()` forwards to Sentry when a DSN is set. **Never log secrets, tokens, request bodies, or PII** — log identifiers.
10. **Auth in Actions:** use `authActionClient` / `adminActionClient`, or `requireAuth()` / `requireRole()` in route handlers. Never read the session manually inside an action body.
11. **No native browser UI:** no `window.alert` / `confirm` / `prompt`. Shadcn `AlertDialog` for confirmations, `Dialog` for modals, Sonner for ephemeral feedback.
12. **Server-Only Guards:** `import "server-only"` in `src/lib/{api,auth,env,stripe,r2,resend}.ts`, `src/lib/db/*`, `src/lib/email/*`, and `src/data/*`.
13. **React Compiler:** `reactCompiler: true` is on, so manual `useMemo` / `useCallback` / `React.memo` are unnecessary **for render optimization**. Three cases still need them explicitly:
    - a value or callback passed to a **non-compiled third-party component** that relies on reference equality
    - a value in a `useEffect` **dependency array** where an unstable reference re-fires the effect
    - a genuinely expensive computation (parsing, large sort) where you want caching semantics, not just render skipping
14. **Component Size:** files SHOULD stay under **300 lines**. At 200+, evaluate splitting.
15. **i18n — no hardcoded strings:** every user-facing string goes through `t()`. `messages/es.json` is the source; `en.json` mirrors its key structure exactly. Adding a string means adding the key to **both** files in the same change. Zero string literals in JSX.
16. **JSDoc `@fileoverview`:** required in `src/lib/`, `src/data/`, `src/actions/`, `src/hooks/` — the non-obvious modules. **Not** required in presentational components, where the code is self-describing and the comment rots on first refactor.

### ♿ Accessibility Guidelines (WCAG 2.1 AA)

`eslint-plugin-jsx-a11y` runs at **error** level. It catches the mechanical half. These are the rest:

1. **Reach for the Radix primitive first.** Radix ships focus management, ARIA wiring and keyboard behavior. A `<div onClick>` reimplementation of a menu or dialog is a regression, not a shortcut.
2. **Semantics:** `<button>` for actions, `<Link>` for navigation. Never swap for styling.
3. **Visible focus:** never remove focus outlines. Use `focus-visible:ring-2`, not `outline-none` alone.
4. **Touch targets:** minimum 44×44px. Achieve it with padding, not fixed height alone.
5. **Contrast:** 4.5:1 body text, 3:1 large text and UI boundaries. Verify custom colors, not just Shadcn defaults.
6. **Images:** meaningful `alt`, or `alt=""` when decorative. Always set `width`/`height` (or `fill` in a sized container) to avoid layout shift.
7. **Forms:** every input has an associated `<Label htmlFor>`. Errors link via `aria-describedby` and are announced — a red border is not an error message.
8. **Headings:** one `<h1>` per page, no skipped levels.
9. **Async states:** use `aria-busy` or a live region. A spinner that exists only visually is invisible to assistive tech.
10. **Motion:** respect `prefers-reduced-motion` for anything beyond a simple opacity fade.

---

## 3. 🗺️ App Architecture & Route Inventory

> **Read this as intent, not inventory.** The filesystem is authoritative. Verify before relying on a path; if you find drift, fix this section.

### Request Flow

```
Client Component
  → Server Action (next-safe-action: schema → auth middleware → handler)
    → DAL (src/data/) → Drizzle → Neon

Server Component
  → DAL directly → Drizzle → Neon

Route Handler (webhooks, presign)
  → withErrorHandler → service logic → DAL
```

### 📂 Directory Structure

```
src/
├── actions/              # Server Actions, all built on next-safe-action clients
├── app/
│   ├── [locale]/         # i18n wrapper (layout: NuqsAdapter + NextIntl + Toaster + SEO)
│   ├── api/
│   │   ├── auth/[...all]/route.ts    # Better Auth handler
│   │   └── webhooks/stripe/route.ts  # signature-verified
│   ├── global-error.tsx, not-found.tsx
│   ├── robots.ts, sitemap.ts, manifest.ts
│   └── globals.css
├── components/ui/        # Shadcn/UI primitives
├── data/                 # DAL — pure queries, no auth/validation/logging
├── hooks/                # Client hooks (action hooks come from next-safe-action)
├── i18n/                 # config, navigation, request, routing
├── lib/
│   ├── api.ts            # successResponse, errorResponse, withErrorHandler (server-only)
│   ├── auth.ts           # Better Auth instance + getSession/requireAuth/requireRole (server-only)
│   ├── auth-client.ts    # createAuthClient for Client Components
│   ├── safe-action.ts    # actionClient / authActionClient / adminActionClient
│   ├── constants.ts      # APP_CONFIG, PAGINATION, UPLOAD, CACHE, ROLES
│   ├── env.ts            # Zod-validated serverEnv + clientEnv (fail-fast)
│   ├── errors.ts         # AppError hierarchy
│   ├── error-messages.ts, fetcher.ts, logger.ts
│   ├── r2.ts             # presignPutUrl / publicUrl via aws4fetch (server-only)
│   ├── rate-limit.ts     # Upstash Ratelimit instances
│   ├── resend.ts, stripe.ts, utils.ts
│   ├── db/
│   │   ├── index.ts      # Drizzle + Neon connection
│   │   ├── schema/
│   │   │   ├── auth.ts   # Better Auth tables — GENERATED, do not hand-edit
│   │   │   └── app.ts    # your domain tables
│   │   └── seed.ts
│   └── email/
│       ├── send.ts       # sendEmail() — renders React Email → Resend
│       └── templates/    # .tsx React Email components
├── messages/             # es.json (source), en.json (mirror)
├── schemas/              # drizzle-zod derivations + non-table schemas
├── store/                # Zustand — ephemeral UI state only
├── types/                # PaginatedResponse<T>, ListParams
├── instrumentation.ts, sentry.server.config.ts, sentry.edge.config.ts
└── proxy.ts              # optimistic session cookie check + next-intl locale

tests/
├── setup.ts              # RTL + jest-dom + MSW lifecycle
├── mocks/                # MSW handlers
└── e2e/                  # Playwright specs

Root:
instrumentation-client.ts, vitest.config.ts, playwright.config.ts
.mcp.json                 # browser MCP for visual verification
CLAUDE.md, AGENTS.md      # pointers to this file
.env.example, .env.ci
.husky/{pre-commit,pre-push}
.github/{workflows/ci.yml,dependabot.yml,PULL_REQUEST_TEMPLATE.md}
CONTRIBUTING.md, CHANGELOG.md, docs/{DEPLOY.md,ROADMAP.md}
```

### 📍 Route Inventory

**Public**

| Route | Description | Auth posture |
| ----- | ----------- | ------------ |
| `/:locale` | Homepage | Public |
| `/:locale/login` | Sign in (Better Auth) | Public — rate limited |
| `/:locale/sign-up` | Sign up (Better Auth) | Public — rate limited |
| `/:locale/forgot-password` | Password reset request | Public — rate limited |

**Protected (session required)**

| Route | Description | Enforced by |
| ----- | ----------- | ----------- |
| `/:locale/dashboard` | User dashboard | proxy (optimistic) + server check in page/actions |
| `/:locale/settings` | User settings | proxy (optimistic) + server check in page/actions |

**Admin (session + `role === "admin"`)**

| Route | Description | Enforced by |
| ----- | ----------- | ----------- |
| `/:locale/admin` | Admin panel | proxy (optimistic) **and** `adminActionClient` / `requireRole("admin")` server-side |

**API**

| Route | Method | Description | Auth posture |
| ----- | ------ | ----------- | ------------ |
| `/api/auth/[...all]` | GET/POST | Better Auth handler (sessions, OAuth callbacks, password reset) | Public by design — rate limited |
| `/api/webhooks/stripe` | POST | Stripe events | Public — signature verified, idempotent |

---

## 4. 🗄️ Domain Model

_See `src/lib/db/schema/` for authoritative definitions._

### Auth entities (managed by Better Auth — do not hand-edit)

Generated into `src/lib/db/schema/auth.ts` by the Better Auth CLI: `user`, `session`, `account`, `verification`. Your domain tables reference `user.id` directly — **there is no external identity to sync**, which is the main reason this boilerplate self-hosts auth.

- **user:** `id`, `email` (unique), `name`, `emailVerified`, `image`, `role` (`"user" | "admin"`, default `"user"`), `createdAt`, `updatedAt`

### Domain entities (example — replace with your own)

```
(None yet. Add tables to src/lib/db/schema/app.ts and document relationships here.)
```

### Database Notes

- **ORM:** Drizzle with the NeonDB serverless driver. **Config:** `drizzle.config.ts`. **Migrations:** `./drizzle/`.
- **Validation:** derive with `drizzle-zod` (`createInsertSchema` / `createSelectSchema`) in `src/schemas/`, then `.refine()` for business rules. Never hand-write a validator that mirrors a table.
- **Transactions:** the Neon **HTTP** driver does not support `db.transaction()`. Use the WebSocket Pool driver for paths that need real transactions, or sequence idempotent writes. See §15.

---

## 5. 📍 Current Project Status

_Keep under 6 lines. Detailed planning lives in `docs/ROADMAP.md` or GitHub Issues — long checklists in always-loaded context rot and mislead._

- **Phase:** Boilerplate — hardening (see the open items in §1)
- **Active Task:** None
- **Blockers:** None

---

## 6. 📝 Roadmap

Canonical status is the §1 checklist. This is sequencing only.

### 🟡 Now — close the hardening gaps, in this order

1. [ ] Bump `next` to `16.2.11+`; re-verify that a non-admin cannot reach `/admin`
2. [ ] Wire Better Auth: generate schema, mount handler, proxy cookie check, `requireAuth`/`requireRole`
3. [ ] Add `src/lib/safe-action.ts` clients; convert the example action
4. [ ] Presigned-URL upload flow + R2 CORS configuration
5. [ ] `drizzle-zod` derivations; delete duplicated validators
6. [ ] Upstash rate limiting on `/api/auth/*` and every public action
7. [ ] Security headers + CSP; Sentry PII scrubbing
8. [ ] Vitest + RTL + MSW + `vitest-axe`; tests for actions, DAL, auth guards, schemas
9. [ ] Playwright: smoke spec + admin-denied spec
10. [ ] `eslint-plugin-jsx-a11y` at error; fix fallout
11. [ ] `.mcp.json` browser MCP; document the visual loop
12. [ ] React Email templates; `nuqs` adapter in root layout

### ⬜ Next — your first feature

- [ ] Domain tables in `src/lib/db/schema/app.ts`
- [ ] `npm run db:push`
- [ ] `drizzle-zod` schemas in `src/schemas/`
- [ ] DAL functions in `src/data/`
- [ ] Actions on `authActionClient` (with tests — §12)
- [ ] UI pages and components (with visual verification — §0)

---

## 7. 🧊 Icebox

_Do NOT implement unless explicitly moved into §6._

- [ ] Dark mode (`next-themes` installed)
- [ ] Better Auth plugins: passkeys, 2FA, organizations/teams
- [ ] Analytics (PostHog — would also consolidate session replay with Sentry)
- [ ] Dynamic OG image generation (`opengraph-image.tsx`)
- [ ] `llms.txt` / `llms-full.txt` for AI discoverability
- [ ] Visual regression testing (Playwright snapshots)
- [ ] Storybook — revisit past ~15 components
- [ ] Merchant-of-record billing (Polar / Lemon Squeezy) if selling internationally — see §11 Stripe

---

## 8. 🔀 App Flow

```mermaid
flowchart TD
    Root["/:locale"]
    Root -->|session cookie| Dashboard["/:locale/dashboard"]
    Root -->|no session| Login["/:locale/login"]
    Login -->|OK| Root
    SignUp["/:locale/sign-up"] -->|OK| Root
    Dashboard --> Settings["/:locale/settings"]

    subgraph PublicArea [Public — rate limited]
        Root
        Login
        SignUp
    end
    subgraph ProtectedArea [Proxy cookie check + server verification]
        Dashboard
        Settings
    end
    subgraph AdminArea [Proxy AND adminActionClient / requireRole]
        Admin["/:locale/admin"]
    end
    subgraph PublicAPI [Public by design]
        AuthAPI["/api/auth/[...all]"]
        StripeWH["/api/webhooks/stripe"]
    end
```

---

## 9. ⚙️ Environment & Secrets

_NEVER hardcode secrets. NEVER commit `.env` files. NEVER echo a secret's value into logs or chat — reference it by key name._

### Server-Side (validated in `src/lib/env.ts`)

| Variable | Description | Example |
| -------- | ----------- | ------- |
| `DATABASE_URL` | NeonDB connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `BETTER_AUTH_SECRET` | Signs sessions and tokens — 32+ random bytes | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Canonical base URL for auth callbacks | `https://example.com` |
| `GITHUB_CLIENT_ID` | OAuth provider (optional) | `Iv1....` |
| `GITHUB_CLIENT_SECRET` | OAuth provider (optional) | `...` |
| `GOOGLE_CLIENT_ID` | OAuth provider (optional) | `...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | OAuth provider (optional) | `...` |
| `R2_ACCOUNT_ID` | Cloudflare account ID | `xxxxxxxxxxxxxxxx` |
| `R2_ACCESS_KEY_ID` | R2 access key | `xxxxxxxxxxxxxxxx` |
| `R2_SECRET_ACCESS_KEY` | R2 secret key | `xxxxxxxxxxxxxxxxxxxx` |
| `R2_BUCKET_NAME` | R2 bucket name | `your-bucket-name` |
| `STRIPE_SECRET_KEY` | Stripe private key | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_...` |
| `RESEND_API_KEY` | Resend API key | `re_...` |
| `RESEND_FROM_EMAIL` | Default sender | `onboarding@resend.dev` |
| `UPSTASH_REDIS_REST_URL` | Upstash REST endpoint | `https://xxx.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash token | `AX...` |

### Client-Side (validated in `src/lib/env.ts`)

| Variable | Description | Example |
| -------- | ----------- | ------- |
| `NEXT_PUBLIC_APP_URL` | App base URL (canonical, OG, emails). Must equal `BETTER_AUTH_URL`. | `https://example.com` |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | R2 public bucket URL | `https://pub-xxx.r2.dev` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key | `pk_test_...` |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN (safe to expose) | `https://xxx@xxx.ingest.sentry.io/xxx` |

### Intentionally outside `env.ts`

Runs before or outside the Next.js runtime, so importing `serverEnv` isn't possible.

| Variable | Used in | Why |
| -------- | ------- | --- |
| `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` | `next.config.ts` (token: CI only) | Build-time source map upload |
| `DATABASE_URL` | `drizzle.config.ts` | Drizzle Kit runs outside Next.js |

**Notes:**

- Files: `.env.local` (dev), hosting provider secrets (production). `.env.example` is committed with placeholders and stays in sync with the tables above.
- Validation runs at import time and fails fast with a message naming the missing key.
- **`SKIP_ENV_VALIDATION` is discouraged.** It disables the only guard that catches a missing production variable, converting a loud build failure into a silent outage. CI uses a committed `.env.ci` of syntactically valid placeholders so validation actually runs. See §15.

---

## 10. 🧰 Key Commands

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` / `lint:fix` | ESLint (zero warnings tolerated) |
| `npm run format` / `format:check` | Prettier |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest, single run |
| `npm run test:watch` | Vitest watch — **run manually, never from an agent** |
| `npm run test:e2e` | Playwright |
| `npm run validate` | Full CI: typecheck + lint + format + test + build |
| `npm run clean` | Delete `.next` cache (fixes stale type errors) |
| `npm run auth:generate` | `npx @better-auth/cli generate` — regenerate auth schema |
| `npm run db:push` / `db:generate` / `db:migrate` / `db:studio` / `db:seed` | Drizzle Kit |
| `npm run email:dev` | React Email preview server — **run manually** |
| `npx shadcn@latest add [component]` | Add a Shadcn/UI component |

> **Agents:** never start a long-running process (`dev`, `test:watch`, `db:studio`, `email:dev`). Use `npm run test` and `npm run build`. For Playwright, let the config's `webServer` manage the server.

---

## 11. 🔌 Third-Party Integrations

### Better Auth (Authentication) — self-hosted

- **Purpose:** sessions, email/password, OAuth, password reset, roles. Users live in **your** Postgres.
- **Package:** `better-auth` · **Docs:** https://www.better-auth.com
- **Key files:** `src/lib/auth.ts` (instance + `getSession`, `requireAuth`, `requireRole`), `src/lib/auth-client.ts`, `src/app/api/auth/[...all]/route.ts`, `src/lib/db/schema/auth.ts` (generated), `src/proxy.ts`
- **Env:** `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, optional OAuth provider pairs
- **Why this over a hosted vendor:** no external identity to reconcile. There is no `clerk_id` column, no user-sync webhook, no eventual consistency between two user stores, and no per-user bill. Better Auth covers email/password, OAuth, magic links, 2FA and organizations in one library rather than separate plugins ([overview](https://getnextjstemplates.com/blogs/best-nextjs-user-authentication-resources)), and has a first-class Drizzle adapter ([docs](https://www.better-auth.com/docs/adapters/drizzle)).
- **Documented alternative — Clerk:** if prebuilt auth UI and a hosted user-management dashboard matter more than owning the data, Clerk ships faster; its free tier now covers 50,000 monthly retained users ([LogRocket](https://blog.logrocket.com/best-auth-library-nextjs-2026/)). The cost is a `clerk_id` foreign identity plus a sync webhook you maintain. Choose deliberately; migrating identities later is the most expensive migration in the stack. Comparison details paraphrased for licensing compliance.
- **Critical:** do not query the database inside `proxy.ts`. Use Better Auth's session-cookie helper for an optimistic redirect only, then verify the real session server-side in the page or action. See §15.

### next-safe-action (Server Action layer)

- **Purpose:** end-to-end type safety from input validation to action result, with chainable middleware for auth and metadata ([docs](https://next-safe-action.dev/docs/introduction)).
- **Package:** `next-safe-action` · **Key file:** `src/lib/safe-action.ts`
- **Three clients:**
  - `actionClient` — public actions. Rate limiting is mandatory here.
  - `authActionClient` — extends with session middleware; `ctx.user` is guaranteed.
  - `adminActionClient` — extends with `role === "admin"`; throws `ForbiddenError` otherwise.
- **Why it's a constraint and not a convenience:** a Server Action is a network endpoint. Next.js provides CSRF defense, encrypted closures and rotating action IDs, but its own documentation is explicit that these are not a substitute for application-level authorization ([production patterns](https://www.digitalapplied.com/blog/nextjs-server-actions-production-patterns-2026-guide)); action ID encryption is not authentication ([analysis](https://dev.to/shubhradev/nextjs-16-server-actions-security-the-auth-check-most-developers-miss-1ei1)). A 2026 security review put the failure mode bluntly: without strict payload validation, an author can create an unauthenticated RPC endpoint by accident ([dev.to](https://dev.to/adioof/server-actions-blur-the-client-server-line-and-juniors-are-paying-for-it-4plc)). Findings paraphrased for licensing compliance. Middleware makes the guard structural — you cannot define an action without passing through it. For AI-generated code, structural enforcement beats documented convention every time.

### Cloudflare R2 (Object Storage) — presigned URLs

- **Purpose:** file/image storage, S3-compatible.
- **Package:** `aws4fetch` · **Dashboard:** https://dash.cloudflare.com → R2
- **Key file:** `src/lib/r2.ts` — `presignPutUrl({ key, contentType, contentLength })`, `publicUrl(key)`
- **Env:** `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `NEXT_PUBLIC_R2_PUBLIC_URL`
- **Flow:**
  1. Client asks an `authActionClient` action for a presigned PUT URL, sending filename, MIME type and size.
  2. Server validates type and size against `UPLOAD` in `@/lib/constants`, **generates the object key itself** (`${user.id}/${crypto.randomUUID()}.${ext}`), signs a short-lived URL (≤5 min), returns it.
  3. FilePond PUTs the file **directly to R2** with the exact signed `Content-Type` and `Content-Length`.
  4. Client reports the key back to a second action, which persists it.
- **Why not FormData through a Server Action:** that routes file bytes through your serverless function, which has a body size limit around 4.5MB on Vercel. A 6MB phone photo fails with an opaque error. It also bills you compute for bytes you're only relaying. Presigned upload has no size ceiling and no relay cost.
- **Requires:** R2 bucket CORS configured for your origins, or the browser PUT fails. See §15.

### Stripe (Payments)

- **Purpose:** payments, subscriptions, checkout.
- **Packages:** `stripe` (server), `@stripe/stripe-js` (client) · **Dashboard:** https://dashboard.stripe.com
- **Webhook:** `/api/webhooks/stripe` · **Local:** `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- **Key files:** `src/lib/stripe.ts`, `src/app/api/webhooks/stripe/route.ts`
- **Env:** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- **Critical:** handlers must be **idempotent**. Stripe retries, so a handler that grants credit or sends email fires twice unless you dedupe on `event.id` before any side effect.
- **Documented alternative:** Stripe leaves global VAT and sales-tax compliance to you. A merchant of record (Polar, Lemon Squeezy) takes a higher cut and absorbs that obligation. For solo developers selling internationally that trade is often worth it. See Icebox.

### Resend + React Email

- **Purpose:** transactional email delivery and templates.
- **Packages:** `resend`, `@react-email/components`, `@react-email/render` · **Dashboard:** https://resend.com/overview
- **Key files:** `src/lib/resend.ts`, `src/lib/email/send.ts`, `src/lib/email/templates/*.tsx`
- **Env:** `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- **Why React Email over HTML strings:** email clients are a compatibility minefield — Outlook renders through Word, Gmail strips much of `<head>`, and flexbox is unreliable. Maintaining that by hand in template strings does not survive past the second template. React Email ships the table layouts and hacks already solved, plus local preview via `npm run email:dev`.
- **Security:** never send an unvalidated user-supplied address in the `to` field. That's an open relay for spam.

### NeonDB (Database)

- **Purpose:** serverless PostgreSQL.
- **Packages:** `@neondatabase/serverless`, `drizzle-orm` · **Dashboard:** https://console.neon.tech
- **Key files:** `src/lib/db/index.ts`, `src/lib/db/schema/`, `src/lib/db/seed.ts`, `drizzle.config.ts`
- **Env:** `DATABASE_URL`
- **Branching:** use Neon branches for preview deploys so previews never touch production data.

### Upstash Redis (Rate Limiting)

- **Purpose:** distributed rate limiting that survives serverless cold starts.
- **Packages:** `@upstash/ratelimit`, `@upstash/redis` · **Dashboard:** https://console.upstash.com
- **Key file:** `src/lib/rate-limit.ts`
- **Env:** `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- **Applied to:** `/api/auth/*`, every `actionClient` (public) action, and the presign action.

### Sentry (Error Monitoring)

- **Purpose:** error tracking, performance, Web Vitals, session replay.
- **Package:** `@sentry/nextjs` · **Dashboard:** https://sentry.io
- **Key files:** `instrumentation-client.ts`, `src/instrumentation.ts`, `src/sentry.{server,edge}.config.ts`, `next.config.ts` (`withSentryConfig`), `src/app/global-error.tsx`, `src/lib/logger.ts`
- **Env:** `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`
- **Critical:** configure `beforeSend` scrubbing and mask session replay inputs **before** enabling in production, or you ship PII to a third party.

---

## 12. 🧪 Testing Strategy

> AI-generated code needs **more** verification than hand-written code, not less. `npm run build` proves it compiles; it proves nothing about behavior. This section is what replaces "write tests only when asked."

### What requires a test (non-negotiable)

| Code | Test required | Why |
| ---- | ------------- | --- |
| Server Actions (`src/actions/`) | **Yes** — happy path, unauthenticated, wrong role, invalid input | Network endpoints with the highest blast radius |
| DAL functions (`src/data/`) | **Yes** | Data correctness, cheap to test |
| Auth guards (`src/lib/auth.ts`) | **Yes** — especially the negative cases | A broken guard is a breach |
| `safe-action` middleware (`src/lib/safe-action.ts`) | **Yes** | Everything else depends on it holding |
| Zod / drizzle-zod schemas | **Yes** — valid and invalid input | The security boundary |
| Stripe webhook handler | **Yes** — invalid signature rejected, duplicate `event.id` is a no-op | Public endpoint, retried by Stripe |
| Presign action | **Yes** — oversized and wrong-MIME rejected, key generated server-side | Abuse surface |
| Business logic in `src/lib/` | **Yes** | Pure functions, trivial |
| Custom hooks | **Yes** | Stateful logic |
| Interactive components (forms, dialogs) | **Yes** — behavior + a11y assertion | Where users actually break things |
| Presentational components | Optional | Low value; covered by visual verification |
| `components/ui/` Shadcn primitives | No | Upstream, already tested |
| `src/lib/db/schema/auth.ts` | No | Generated by the Better Auth CLI |

### Layers

**Unit + component — Vitest + React Testing Library.** Query by accessible role and label (`getByRole`, `getByLabelText`), never by test id or class. A test that can't find the button by its accessible name is telling you the component is inaccessible — fix the component, not the test. Add `expect(await axe(container)).toHaveNoViolations()` to interactive component tests via `vitest-axe`.

**Network mocking — MSW.** Mock at the network layer, not by stubbing modules. Handlers live in `tests/mocks/`. Never mock your own DAL in an action test — mock the external HTTP call (Stripe, Resend, R2).

**E2E — Playwright.** Keep it thin. Critical paths only: sign-up → dashboard, checkout, and one admin-denied case. E2E is expensive and flaky at volume; unit tests carry the load. The config's `webServer` manages the server so agents never start one manually.

### Visual verification loop (required for UI work)

A browser MCP (Chrome DevTools MCP or Playwright MCP) is configured in `.mcp.json`. Without it an agent writes Tailwind blind and the human becomes the browser. The loop:

1. Render the affected route
2. Screenshot at 375px and 1280px
3. Compare against intent (design reference or stated requirement)
4. Fix and repeat until it matches
5. Tab through to confirm focus order and visible focus rings

Part of the Definition of Done in §0. UI is never reported as done unsighted.

### Rules

- Test behavior, not implementation. No assertions on internal state or call counts unless the call *is* the contract ("the payment provider was charged exactly once").
- One assertion concept per test; names state the expected behavior.
- No snapshot tests of large trees — they pass on breakage and fail on formatting.
- Deterministic: no real network, no real clock (`vi.useFakeTimers()`), no shared mutable state.
- A failing test is fixed, never skipped or deleted, without explicit approval.

---

## 13. 🔒 Security Baseline

### ⚠️ Open security items

| Item | Status | Action |
| ---- | ------ | ------ |
| **`next` below the patched floor** | **Open** | Upgrade to `16.2.11+`. The July 2026 Next.js advisory covers nine issues including SSRF, a **middleware/proxy authorization bypass**, DoS, and cache identifier disclosure, patched in `15.5.21` and `16.2.11` ([Netlify](https://www.netlify.com/changelog/2026-07-21-nextjs-security-vulnerabilities/), [release notes](https://releasebot.io/updates/vercel/next-js)). The middleware bypass is directly relevant because `/admin` navigation gating lives in `src/proxy.ts` — and is exactly why enforcement must also exist server-side. After upgrading, verify a non-admin cannot reach `/admin`. Details paraphrased for licensing compliance. |
| No security headers / CSP | Open | Add `headers()` to `next.config.ts`: HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors`, and a CSP with nonces |
| Sentry PII scrubbing not configured | Open | `beforeSend` filtering + replay input masking before production |

### Standing rules

1. **Authorization is server-side, always.** The proxy provides an optimistic cookie check for navigation UX. Every action and route handler that reads or mutates protected data re-verifies through `authActionClient` / `adminActionClient` / `requireRole()`. A route protected only by the proxy is one middleware CVE away from public — and that CVE shipped this year.
2. **Every Server Action is a public endpoint until proven otherwise.** No bare `"use server"` exports. The `next-safe-action` client is the only entry point, because it makes validation and the auth guard impossible to forget.
3. **Validate at every trust boundary.** Actions, route handlers, webhooks and env vars all parse with Zod. Client-side validation is UX, never security.
4. **Verify every webhook signature before doing any work.** Reject with 400 and log the rejection. Never parse the body first.
5. **Never trust client-supplied identifiers.** Derive `userId` from the session, never from the payload. Generate storage object keys server-side — a client-supplied filename is path traversal and overwrite risk.
6. **Never expose internals in errors.** User-facing text goes through `getFriendlyErrorMessage()`. Stack traces, SQL and provider strings go to Sentry, not the browser.
7. **No secrets in client code.** Anything `NEXT_PUBLIC_*` is public. Before adding the prefix, confirm the value is safe on a billboard.
8. **Rate-limit every public input path:** `/api/auth/*`, every `actionClient` action, uploads, contact forms.
9. **Scrub PII before it leaves.** `logger` logs identifiers, never bodies or credentials. Sentry filtering is configured before production.
10. **Public endpoints are declared, not discovered.** The only intentionally public endpoints are `/api/auth/[...all]` (rate limited) and `/api/webhooks/stripe` (signature verified, idempotent), both listed in §3. Adding another requires an entry there with justification and abuse mitigation.
11. **Dependencies:** pin exact runtime versions. Review any new package for maintenance status and name-squatting before proposing it. Security advisories triaged within the week.
12. **Sessions:** `BETTER_AUTH_SECRET` is 32+ random bytes and rotates on suspicion of compromise. Cookies are `httpOnly`, `secure`, `sameSite: "lax"`.

---

## 14. 🚀 Deployment

- **Hosting:** Vercel
- **Production URL:** (configure after first deploy) · **Staging:** (if needed)
- **Branches:** `main` → production (auto-deploy); `develop` → staging; feature branches → preview. Never push directly to `main`.
- **CI/CD:** `.github/workflows/ci.yml` runs typecheck + lint + format + **test** + build on every push/PR. Vercel deploys on merge.
- **CI env:** `.env.ci` placeholders so env validation actually runs. Do not set `SKIP_ENV_VALIDATION`.
- **Preview deploy safety:** previews must use **test** keys for Stripe and Resend, a **Neon branch** database, and OAuth apps with preview callback URLs registered. A preview wired to production credentials charges real cards and emails real users.
- **Auth URLs:** `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` must match the deployment origin, or OAuth callbacks and cookies break. Preview deploys need this set per-environment.
- **Dependencies:** Dependabot weekly for npm and GitHub Actions.
- **Domain/DNS:** Vercel dashboard.

---

## 15. 🐛 Known Gotchas & Patterns

_The highest-value section in this file. When you burn time on a non-obvious bug, document it here._

### Gotchas

| Issue | Solution |
| ----- | -------- |
| **Never query the DB inside `proxy.ts`** | Better Auth's docs are explicit: middleware runs on every matched request and may run at the edge. Use the session-cookie helper for an optimistic redirect only; verify the real session in the page or action. A DB call here is a latency tax on every navigation and unreliable at the edge. |
| **Presigned PUT rejected by R2** | The client must send exactly the `Content-Type` and `Content-Length` that were signed. Any mismatch is a signature failure. |
| **Browser PUT to R2 fails with a CORS error** | Configure CORS on the R2 bucket for your origins (including preview domains) allowing `PUT` and the `Content-Type` header. Easy to miss because server-side signing succeeds regardless. |
| **In-memory rate limiting doesn't work on Vercel** | Each invocation may be a fresh instance, so the counter resets and the limit effectively does not exist — worse than nothing, because it creates false confidence. Use `@upstash/ratelimit`. |
| **`next-safe-action` validation errors are a result field, not a throw** | Read `validationErrors` from the result. Wrapping the call in `try/catch` will silently miss them. |
| **Auth schema is generated** | Run `npm run auth:generate` after changing Better Auth config. Hand-editing `src/lib/db/schema/auth.ts` gets overwritten. |
| **Neon HTTP driver has no transactions** | The HTTP driver does not support `db.transaction()`. Use the WebSocket Pool driver for those paths, or sequence idempotent writes. |
| **`nuqs` needs an adapter** | Wrap the app in `NuqsAdapter` in the root layout, or hooks throw at runtime. |
| **`drizzle-zod` should not carry business rules** | Derive shape from the table, then `.refine()` separately. Putting business constraints in the DB schema couples validation to migrations. |
| **Stripe webhook needs the raw body** | Use `req.text()`, not `req.json()`, for signature verification. |
| **Stripe retries webhooks** | Handlers must be idempotent — dedupe on `event.id` before any side effect. |
| **React Email must be rendered before sending** | `render()` the component to HTML at send time inside `sendEmail()`. Passing the component to Resend directly won't do what you expect. |
| **next-intl requires awaiting `params`** | In Next.js 16 `params` is a Promise. Always `await params` in layouts and pages. |
| **Hydration mismatch with dates** | Use `suppressHydrationWarning` on date elements, or format client-side only. |
| **`next/image` needs explicit remote domains** | Add to `next.config.ts` → `images.remotePatterns`, including your R2 public domain. |
| **Typecheck fails for deleted routes** | If `.next/types/validator.ts` references deleted files: `npm run clean` then `npm run typecheck`. |
| **Zod date coercion for DB** | Use `z.coerce.date()` for form dates. Raw strings into Drizzle timestamp fields fail with `value.toISOString is not a function`. |
| **Drizzle config reads env directly** | `drizzle.config.ts` uses `process.env.DATABASE_URL!` because it runs outside Next.js. |
| **Sentry is optional** | Without `NEXT_PUBLIC_SENTRY_DSN`, logger and instrumentation degrade to console-only. No errors. |
| **`SKIP_ENV_VALIDATION` hides real failures** | It turns a loud build failure into a silent production outage. Use `.env.ci` placeholders so validation runs in CI. |
| **MSW must not intercept Playwright** | MSW is for Vitest only. E2E hits real routes against a seeded test database. |
| **OAuth breaks on preview deploys** | Each preview origin needs its callback URL registered with the provider and `BETTER_AUTH_URL` set to that origin. |

### Patterns & Conventions

- **Safe Action Pattern:** pick the client (`actionClient` / `authActionClient` / `adminActionClient`) → attach the schema → the handler receives validated input and, where applicable, a guaranteed `ctx.user` → call the DAL → log → return data. Reference: `src/actions/example.ts`.
- **DAL Pattern:** pure query functions in `src/data/*.ts`. No auth, no validation, no logging. Import the specific module.
- **Route Handler Pattern:** wrap with `withErrorHandler()`; respond via `successResponse()` / `errorResponse()`. Reserved for webhooks and cases Server Actions can't serve (streaming, custom headers, public APIs).
- **Client Action Pattern:** `useAction` / `useOptimisticAction` from `next-safe-action/hooks`. Do not hand-roll loading state.
- **Schema Pattern:** `createInsertSchema(table)` from `drizzle-zod` in `src/schemas/`, `.omit()` server-managed columns, `.refine()` for business rules. Hand-write only non-table schemas (login, contact, filters).
- **URL State Pattern:** `useQueryState` / `useQueryStates` from `nuqs` for filters, pagination, sort, tabs, and open-panel state. Zustand is for ephemeral UI only (sidebar collapsed, transient toasts).
- **Upload Pattern:** presign action → direct browser PUT to R2 → persist-key action. Never route bytes through the server. Validate MIME and size server-side against `UPLOAD` in `@/lib/constants`; generate the key server-side.
- **Email Pattern:** `sendEmail()` from `@/lib/email` renders a React Email component from `templates/` and dispatches via Resend.
- **Auth Guard Pattern:** proxy for navigation (optimistic cookie check), `authActionClient` / `adminActionClient` / `requireRole()` for enforcement. Both layers, always.
- **Rate Limiting Pattern:** `checkRateLimit(identifier)` from `@/lib/rate-limit`, with `getClientIdentifier(headers)` for IP-based limiting, on every public input path.
- **Friendly Error Pattern:** `getFriendlyErrorMessage(error)` from `@/lib/error-messages` for user-facing text. Never surface a raw message or stack trace.
- **Lazy Loading Pattern:** heavy client libraries via `next/dynamic` with `ssr: false`. `optimizePackageImports` in `next.config.ts` handles tree-shaking.
- **SEO Pattern:** root layout sets `metadataBase`. Pages use `generateMetadata` with OG + Twitter fields. `robots.ts` and `sitemap.ts` cover crawling.
- **Code Quality Pattern:** pre-commit runs lint-staged (prettier + eslint) + typecheck. Pre-push runs `test` + `build`. CI runs `validate`. Run `npm run validate` locally to simulate CI.

---

## 16. 📚 Key References

_Human-facing. An AI assistant should not follow these links — use a docs MCP or ask._

Next.js · React · Tailwind v4 · Shadcn/UI · Radix · Drizzle · drizzle-zod · Better Auth · next-safe-action · nuqs · Zod · React Hook Form · Stripe · Resend · React Email · Cloudflare R2 · aws4fetch · Upstash · next-intl · Zustand · SWR · Sentry · Vitest · Playwright · Testing Library

- **Design (Figma/Mockups):** N/A
- **Brand Guide / Style Guide:** N/A

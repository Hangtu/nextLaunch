# 📂 PROJECT CONTEXT: NextLaunch

> **SYSTEM INSTRUCTION FOR AI:**
> This file is the Single Source of Truth (SSOT) for architectural decisions, constraints, standards, and non-obvious knowledge.
> It is NOT a mirror of the filesystem. Anything derivable by reading the code is authoritative in the code, not here.
> **Always read Sections 0, 1, 2, 3.** Load everything else on demand via the Context Load Map.
> If a user prompt contradicts this file, prioritize this file or ask for confirmation.

> **Agent tooling:** `CLAUDE.md` and `AGENTS.md` at the root are thin pointers to this file so any agent runtime resolves to the same SSOT. Never duplicate content into them.
>
> **Future decoupling:** Section 22 maps every section to the skill it will become. Until that split happens, this file is intentionally monolithic and the Load Map is what keeps it affordable.

---

## 0. 🤖 AI Instructions

### Prime Directive

1. **Always read:** §0 (this), §1 (Boundaries), §2 (Stack), §3 (Coding Guidelines).
2. **Load on demand** per the Context Load Map.
3. **Resolve conflicts:** the file wins over the prompt, or you ask.

### 🗺️ Context Load Map

| Load | When |
| ---- | ---- |
| **0, 1, 2, 3** | Always |
| 4 Architecture · 5 Domain | Adding routes or entities, restructuring |
| 6 Design System | Any visual or component work |
| 7 Accessibility | Any UI work — no exceptions |
| 8 i18n | Any user-facing string, date, number, or currency |
| 9 SEO | Public pages, metadata, sitemap, structured data |
| 10 Performance | Adding a dependency, an image, a list, or a client component |
| 11 Marketing & Analytics | Tracking, conversion, landing pages, email campaigns |
| 12 Privacy & Legal | Storing user data, cookies, third parties, account deletion |
| 13 Security | Auth, API routes, webhooks, uploads, any user input |
| 14 Testing | Writing or changing an action, DAL fn, guard, schema, or interactive component |
| 15 Agent Toolchain | Verifying work — read before reporting anything as done |
| 16 Env · 17 Commands | Env vars, terminal work |
| 18 Integrations | Better Auth, Stripe, Resend, R2, Neon, Upstash, Sentry, PostHog |
| 19 Deployment & Ops | Migrations, releases, incidents, flags |
| 20 Gotchas | Before debugging anything that "should work" |
| 21 Status & Roadmap | Planning, or asked "what's next" |
| 22 Skills Map · 23 References | Restructuring this document |

### Behavior

- **Concise.** No explanations of basic concepts. Give the solution.
- **Language.** **English** in all code (identifiers, comments, JSDoc, commit messages). All user-facing copy goes through `next-intl` — §8.
- **Scope (YAGNI).** Implement what was asked. Propose improvements; don't ship them unsolicited.
- **Clarify, don't assume.** Ambiguity is a question, not a guess.
- **Dependencies.** Never add a library without explicit permission. Propose with justification, bundle cost, and maintenance status.
- **No drive-by refactors.** Touch only what the task requires.
- **File awareness.** Verify a file doesn't exist before creating it. Read it before modifying it.
- **Documentation duty.** Architecture, constraint, or non-obvious behavior changes → update this file in the same change. Time lost to a surprising bug → add it to §20.
- **Security- and accessibility-first.** Both are structural in this codebase, never retrofitted.

### 🛑 Escalate instead of proceeding when

- The task requires a schema change that drops or renames a column holding production data
- The task requires a new third-party service (privacy, cost, and DPA implications — §12)
- The change touches authorization logic and you cannot write a test that proves the negative case
- The requirement conflicts with §7 Accessibility or §13 Security
- Two attempts at the same approach have failed — state the root cause and propose a different track

### 🚫 Anti-Patterns

**Type safety**

1. No `any`. No `as unknown as`, `@ts-ignore`, `@ts-expect-error`, or non-null `!` used to make `tsc` pass. If types don't line up, the model is wrong.

**Server boundary**

2. No bare `"use server"` exports. Every action is built from a `next-safe-action` client. A raw action is an unauthenticated public RPC endpoint — §13.
3. Never import `db` outside `src/data/`.
4. Never trust a client-supplied identifier. Derive `userId` from the session; generate storage keys server-side.
5. Never route file bytes through a Server Action. Presigned URLs only — §18 R2.

**Client boundary**

6. `"use client"` is a permission you request with a reason, pushed to the smallest leaf. Never a client page wrapping server-capable children.
7. URL-worthy state (filters, pagination, sort, tabs, open panels) goes in `nuqs`, never Zustand.

**Data shape**

8. Never hand-write a Zod schema that mirrors a table. Derive with `drizzle-zod`, then `.refine()`.

**Copy & formatting**

9. Zero string literals in JSX. Zero manual date/number/currency formatting.

**Errors**

10. No `catch {}`, no `catch (e) { return null }`. Log via `logger` or throw a typed error from `@/lib/errors`.
11. Never surface a raw error message, stack trace, or provider string to the UI.

**UI**

12. Don't rebuild what Shadcn/Radix provides. Don't build a custom control where a semantic element exists.
13. Never remove focus outlines. Never use `ml-*`/`text-left` where a logical property exists.
14. Never ship an async surface without all four states: empty, loading, error, success.

**Process**

15. Never invent an env var without updating `src/lib/env.ts`, `.env.example`, and §16 in the same change.
16. Never mark a task complete without running the DoD below and reporting the results.

### ✅ Definition of Done

Not complete until these pass. Run them; do not assume.

```bash
npm run typecheck   # zero errors
npm run lint        # zero errors, zero warnings (includes jsx-a11y, i18next)
npm run test        # unit + component + a11y assertions
```

When the change touches UI, additionally:

| Gate | How |
| ---- | --- |
| **Visual** | Render via Chrome DevTools MCP. Screenshot at 375, 768, 1280, 1920. Compare against intent. |
| **Keyboard** | Tab / Shift+Tab / Enter / Space / Escape only. Focus visible and never obscured. |
| **Zoom** | Readable and operable at 200% browser zoom and 320px width without horizontal scroll. |
| **States** | Empty, loading, error and success all rendered and screenshotted. |
| **Motion** | Verified with `prefers-reduced-motion: reduce` active. |
| **Performance** | If the change adds a dependency, an image, or a client component: CWV trace via Chrome DevTools MCP against §10 budgets. |

When the change touches a public page, additionally: metadata, canonical, hreflang and structured data verified in the rendered HTML — §9.

Then report exactly what you ran and what the results were. "Should work" is not a result.

---

## 1. 🎯 Project Overview & Boundaries

### Core Vision

- **Pitch:** NextLaunch is a production-ready Next.js 16 **SaaS boilerplate** with self-hosted auth, payments, email, storage, i18n, testing, observability and an agent-native verification toolchain — so developers skip setup and start on features.
- **Audience:** solo developers, freelancers, and small teams shipping SaaS.
- **KPIs:** clone → first feature < 30 min · zero config errors on fresh clone · `npm run validate` green out of the box · Lighthouse ≥ 95 on the marketing pages.

> **Positioning.** Opinionated SaaS starter, not a blank slate. If your project doesn't need an integration, **delete it**. An unused integration is a live liability, because an agent reading this repo will assume the capability exists and wire features into it.

### Design biases (the "why" behind the stack)

| Bias | Consequence |
| ---- | ----------- |
| **Own your data** | Where a self-hosted library and a SaaS vendor are comparable, pick the library. Auth is the clearest case — identities are the hardest migration in software. |
| **Structural over conventional** | If a rule can be enforced by a type, a lint rule, or middleware, it must be. Documented conventions decay; enforced ones don't. This is the single most important principle for AI-generated code. |
| **Server by default** | Every client component is a deliberate cost. |
| **Verified, not assumed** | No UI ships unsighted, no action ships untested, no perf claim ships unmeasured. |
| **One source of shape** | The Drizzle schema defines data shape. Everything else derives from it. |

### 🚧 Operational Constraints

_Non-negotiable._

- **Server Components First.** RSC by default; `"use client"` only for hooks, events, or browser APIs, at the smallest leaf.
- **DAL Pattern.** All queries in `src/data/`. Never import `db` in UI, pages, or actions.
- **Safe Actions Only.** Validation and auth are middleware, not convention.
- **Env Safety.** All env vars validated in `src/lib/env.ts`. Direct `process.env` only outside the Next runtime (`drizzle.config.ts`, `next.config.ts`, Sentry init).
- **Explicit Auth Declaration.** Every route, handler and action declares its posture. Public endpoints are enumerated in §13 with justification and abuse mitigation.
- **Double-Layer Authorization.** Proxy gates navigation optimistically; the server enforces. Proxy-only protection is one middleware CVE away from public — and that CVE shipped in 2026 (§13).
- **Roles.** `user` default; `admin` for `/admin`. The `role` column lives on `user` in your database.
- **Accessibility target: WCAG 2.2 AA.** A change that introduces a violation is a bug, not a backlog item.
- **URL as State.** Anything bookmarkable, shareable, or back-button-reachable lives in the URL.
- **Localized by construction.** No English fallback shipped as product copy. That includes emails, validation errors, and metadata.
- **Mobile-first.** 375px is the design baseline, not the afterthought.

### 🚫 Negative Scope

No domain logic · no committed migrations · no CMS · no admin UI generator · no multi-tenancy · no native apps.

---

## 2. 🛠️ Tech Stack

_Use only what's listed. Never add a library without permission._

### Core

| Category | Technology | Package(s) |
| -------- | ---------- | ---------- |
| **Framework** | Next.js 16 (App Router) | `next@16.2.11` ⚠️ security floor — §13 |
| **UI** | React 19 + Compiler | `react@19.2.3`, `react-dom@19.2.3` |
| **Language** | TypeScript strict | `typescript` |
| **Styling** | Tailwind CSS v4 | `tailwindcss@^4`, `@tailwindcss/postcss@^4` |
| **Components** | Shadcn/UI + Radix | `shadcn`, `radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge` |
| **Icons** | Lucide | `lucide-react` |
| **Animation** | Motion | `motion` |
| **Fonts** | next/font (self-hosted, subset) | built-in |
| **Database** | PostgreSQL / NeonDB | `@neondatabase/serverless` |
| **ORM** | Drizzle | `drizzle-orm`, `drizzle-kit` (dev) |
| **Schema → Validation** | drizzle-zod | `drizzle-zod` |
| **Validation** | Zod 4 | `zod` |
| **Auth** | Better Auth (self-hosted) | `better-auth` |
| **Server Actions** | next-safe-action | `next-safe-action` |
| **Forms** | React Hook Form | `react-hook-form`, `@hookform/resolvers` |
| **URL State** | nuqs | `nuqs` |
| **Client State** | Zustand (ephemeral UI only) | `zustand` |
| **Client Fetching** | SWR (narrow cases only) | `swr` |
| **Payments** | Stripe | `stripe`, `@stripe/stripe-js` |
| **Email delivery** | Resend | `resend` |
| **Email templates** | React Email | `@react-email/components`, `@react-email/render` |
| **Storage** | Cloudflare R2, presigned | `aws4fetch` |
| **Upload UI** | FilePond | `react-filepond`, `filepond` |
| **i18n** | next-intl | `next-intl` |
| **Theming** | next-themes | `next-themes` |
| **Toasts** | Sonner | `sonner` |
| **Rate limiting** | Upstash Redis | `@upstash/ratelimit`, `@upstash/redis` |
| **Errors & tracing** | Sentry | `@sentry/nextjs` |
| **Product analytics + flags** | PostHog | `posthog-js`, `posthog-node` |
| **Server guards** | server-only | `server-only` |

### Quality toolchain

| Purpose | Package(s) |
| ------- | ---------- |
| Unit / component | `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` |
| Network mocking | `msw` |
| A11y — unit | `vitest-axe` |
| A11y — E2E | `@axe-core/playwright` |
| E2E | `@playwright/test` |
| Performance CI | `@lhci/cli` (Lighthouse CI) |
| Lint | `eslint`, `eslint-config-next`, `eslint-plugin-jsx-a11y`, `eslint-plugin-i18next`, `eslint-config-prettier` |
| Format | `prettier`, `prettier-plugin-tailwindcss` |
| Hooks | `husky`, `lint-staged` |

### Deliberately removed

| Removed | Reason |
| ------- | ------ |
| `@clerk/nextjs` | Better Auth removes the foreign identity, the `clerk_id` column, the sync webhook, and its eventual-consistency bug class |
| `svix` | Existed only for Clerk webhooks; Stripe verifies its own signatures |
| `@aws-sdk/client-s3` | Heavy SDK for what is now URL signing; `aws4fetch` does it in a few KB |
| `ActionResponse<T>` (hand-rolled) | `next-safe-action` returns a typed, discriminated result |
| `src/hooks/use-action.ts` (hand-rolled) | `next-safe-action` ships `useAction` / `useOptimisticAction` |
| In-memory rate limiter | Non-functional on serverless — §20 |
| `framer-motion` | Renamed upstream; the package is `motion` |

### Version & dependency policy

- **Pin exact versions** for runtime deps. Reproducible builds, and agent-generated code targets a known API. Dev tooling may use `^`.
- **Adding a dependency requires:** a named alternative you rejected, the gzipped bundle cost, last-release date, and whether it works in RSC.
- **Dependabot** weekly. Security advisories triaged the same week.
- **Never** add a package whose name is a near-miss of a popular one without verifying the publisher.

**On SWR:** with RSC for reads and safe actions for mutations, most apps need zero client fetching. SWR remains for polling, infinite scroll, and refresh-without-navigation. **Confirm RSC can't serve the case first.**

**On PostHog:** chosen because it collapses product analytics, feature flags, session replay and A/B assignment into one vendor instead of four. It's the one place this stack accepts a SaaS over self-hosting, because building flag infrastructure is not the product. Self-hosted PostHog is available if the data-residency argument outweighs the ops cost.

---

## 3. 📐 Coding Guidelines

1. **Strict typing.** No `any`, no escape hatches (Anti-Pattern #1). Prefer inference; annotate boundaries.
2. **File naming.** `kebab-case` everywhere.
3. **Components.** Functional only. `PascalCase` export in a `kebab-case` file.
4. **Server Action pattern.** Pick a `next-safe-action` client → attach schema → the handler receives validated input plus a guaranteed `ctx.user` where applicable → call the DAL → log → return data. Never read the session inside a handler body.
5. **Error handling.** Typed errors from `src/lib/errors.ts`; never bare `throw new Error()`. Route handlers wrap in `withErrorHandler()`. Action errors surface through the typed result.
6. **DAL.** Pure query functions in `src/data/*.ts`. No auth, no validation, no logging. Import the specific module (`@/data/users`), never a barrel.
7. **Imports.** Absolute with `@/`. **No barrel files that re-export a directory** — they break tree-shaking and hide where code lives.
8. **Naming.** `camelCase` utils/hooks · `UPPER_SNAKE_CASE` constants · `snake_case` DB columns · booleans read as assertions (`isLoading`, `hasAccess`, `canEdit`) · event handlers `handleX`, props `onX`.
9. **Logging.** `logger` from `@/lib/logger`, never `console.log`. `logger.error()` forwards to Sentry. **Never log secrets, tokens, bodies, or PII** — log identifiers.
10. **Auth.** `authActionClient` / `adminActionClient` in actions; `requireAuth()` / `requireRole()` in handlers.
11. **No native browser UI.** No `alert` / `confirm` / `prompt`. Shadcn `AlertDialog`, `Dialog`, Sonner.
12. **Server-only guards.** `import "server-only"` in `src/lib/{api,auth,env,stripe,r2,resend,rate-limit}.ts`, `src/lib/db/*`, `src/lib/email/*`, `src/data/*`.
13. **React Compiler.** `reactCompiler: true`, so manual `useMemo` / `useCallback` / `React.memo` are unnecessary **for render optimization**. Still required for: a reference passed to a **non-compiled third-party component**; a value in a `useEffect` **dependency array**; a genuinely expensive computation where you want caching, not render skipping.
14. **Component size.** Under **300 lines**. At 200+, evaluate splitting into sub-components or hooks.
15. **Function signatures.** 2+ parameters use a destructured object with a named interface.
16. **`@fileoverview` JSDoc** required in `src/lib/`, `src/data/`, `src/actions/`, `src/hooks/`. **Not** in presentational components, where it rots on the first refactor.
17. **Comments explain why, never what.** A comment restating the code is deleted.
18. **Dates.** Store UTC, render in the user's zone via the i18n formatter. Never construct a `Date` from a bare string without a zone.
19. **Money.** Integer minor units (cents) in the database. Never floats. Format via the i18n currency formatter.
20. **IDs.** UUID v7 for new tables — time-sortable, no sequential-ID enumeration leak.

---

## 4. 🗺️ Architecture & Route Inventory

> Read as intent, not inventory. The filesystem is authoritative. Fix drift here when you find it.

### Request flow

```
Client Component
  → Server Action (next-safe-action: schema → auth middleware → rate limit → handler)
    → DAL (src/data/) → Drizzle → Neon

Server Component
  → DAL directly → Drizzle → Neon

Route Handler (webhooks, auth, presign)
  → withErrorHandler → validate → service logic → DAL
```

### Directory structure

```
src/
├── actions/                    # all built on next-safe-action clients
├── app/
│   ├── [locale]/               # NuqsAdapter + NextIntl + Theme + Toaster + JSON-LD
│   │   ├── (marketing)/        # public: home, pricing, legal — indexable
│   │   ├── (auth)/             # login, sign-up, forgot-password — noindex
│   │   └── (app)/              # dashboard, settings, admin — noindex
│   ├── api/
│   │   ├── auth/[...all]/      # Better Auth handler
│   │   └── webhooks/stripe/    # signature-verified, idempotent
│   ├── global-error.tsx, not-found.tsx
│   ├── robots.ts, sitemap.ts, manifest.ts, opengraph-image.tsx
│   └── globals.css
├── components/
│   ├── ui/                     # Shadcn primitives
│   ├── layout/                 # shells, nav, footer
│   └── features/               # domain composition
├── data/                       # DAL
├── hooks/
├── i18n/                       # config, navigation, request, routing
├── lib/
│   ├── api.ts                  # withErrorHandler, successResponse, errorResponse
│   ├── auth.ts                 # Better Auth instance + guards (server-only)
│   ├── auth-client.ts          # createAuthClient
│   ├── safe-action.ts          # actionClient / authActionClient / adminActionClient
│   ├── analytics.ts            # typed event registry + consent gate
│   ├── flags.ts                # PostHog feature flag reads (server + client)
│   ├── consent.ts              # cookie consent state
│   ├── seo.ts                  # buildMetadata(), hreflang, JSON-LD builders
│   ├── constants.ts, env.ts, errors.ts, error-messages.ts
│   ├── logger.ts, fetcher.ts, utils.ts
│   ├── r2.ts                   # presignPutUrl / publicUrl (aws4fetch)
│   ├── rate-limit.ts, resend.ts, stripe.ts
│   ├── db/
│   │   ├── index.ts
│   │   ├── schema/
│   │   │   ├── auth.ts         # GENERATED by Better Auth CLI — never hand-edit
│   │   │   └── app.ts
│   │   └── seed.ts
│   └── email/
│       ├── send.ts             # locale-aware: renders React Email → Resend
│       └── templates/*.tsx
├── messages/                   # es.json (source), en.json (mirror)
├── schemas/                    # drizzle-zod derivations + non-table schemas
├── store/                      # Zustand — ephemeral UI only
├── styles/tokens.css           # Tailwind @theme — the design token SSOT
├── types/
├── instrumentation.ts, sentry.{server,edge}.config.ts
└── proxy.ts                    # optimistic session cookie + locale negotiation

tests/
├── setup.ts, factories/, mocks/     # MSW handlers
├── e2e/                             # Playwright specs
└── e2e/a11y/                        # axe scans per route

Root:
instrumentation-client.ts · vitest.config.ts · playwright.config.ts · lighthouserc.js
.mcp.json · CLAUDE.md · AGENTS.md · .env.example · .env.ci
.husky/{pre-commit,pre-push} · .github/{workflows/,dependabot.yml,PULL_REQUEST_TEMPLATE.md}
docs/{DEPLOY.md,ROADMAP.md,RUNBOOK.md,EVENTS.md}
```

### Route inventory

**Marketing — indexable**

| Route | Purpose | Notes |
| ----- | ------- | ----- |
| `/:locale` | Homepage | LCP-critical, JSON-LD `WebSite` + `Organization` |
| `/:locale/pricing` | Plans | JSON-LD `SoftwareApplication` + `Offer` |
| `/:locale/privacy` · `/terms` · `/cookies` | Legal | Localized, required — §12 |

**Auth — `noindex`, rate limited**

`/:locale/login` · `/sign-up` · `/forgot-password` · `/reset-password`

**App — `noindex`, session required**

| Route | Enforced by |
| ----- | ----------- |
| `/:locale/dashboard` · `/settings` | proxy (optimistic) + server check |
| `/:locale/settings/data` | Account export + deletion — §12 |
| `/:locale/admin` | proxy **and** `adminActionClient` / `requireRole("admin")` |

**API**

| Route | Method | Auth posture |
| ----- | ------ | ------------ |
| `/api/auth/[...all]` | GET/POST | Public by design, rate limited |
| `/api/webhooks/stripe` | POST | Public, signature verified, idempotent |

---

## 5. 🗄️ Domain Model

### Auth entities — generated, do not hand-edit

`src/lib/db/schema/auth.ts` is produced by `npm run auth:generate`: `user`, `session`, `account`, `verification`. Domain tables reference `user.id` directly — **there is no external identity to reconcile**, which is the whole point of self-hosting auth.

**`user`** — `id` (uuid v7, PK) · `email` (unique) · `name` · `emailVerified` · `image` · `role` (`"user" | "admin"`, default `"user"`) · **`locale`** (`"es" | "en"`, default `"es"`) · **`marketingConsent`** (boolean, default false) · **`deletedAt`** (soft delete) · `createdAt` · `updatedAt`

The last three columns are not optional extras: `locale` makes emails correct (§8), `marketingConsent` makes campaigns lawful (§12), `deletedAt` makes erasure auditable (§12).

### Domain entities

```
(None yet. Add to src/lib/db/schema/app.ts and document relationships here.)
```

### Database rules

- **Validation** derives from the schema via `drizzle-zod` in `src/schemas/`, then `.refine()` for business rules.
- **Transactions:** the Neon **HTTP** driver has no `db.transaction()`. Use the WebSocket Pool driver for those paths, or sequence idempotent writes — §20.
- **Migrations are expand/contract.** Never destructive in the same deploy as the code change — §19.
- **Soft delete by default** for anything user-owned. Hard delete only in the erasure flow (§12).
- **Every foreign key has an index.** Postgres doesn't create them for you.

---

## 6. 🎨 Design System & UI Craft

### Tokens are the only source of visual truth

`src/styles/tokens.css` defines the Tailwind `@theme`. **Never hardcode a color, spacing value, radius, shadow or z-index in a component.** If a value doesn't exist, add a named token first, then use it.

| Scale | Rule |
| ----- | ---- |
| **Spacing** | 4px base, 8px rhythm. Only `1, 2, 3, 4, 6, 8, 12, 16, 24` steps. Arbitrary values like `p-[13px]` are rejected. |
| **Type** | Fixed scale, no ad-hoc sizes. Body 16px minimum on mobile — 14px body is an accessibility failure, not a design choice. Line height 1.5 for body, 1.2 for headings. Max measure 75ch. |
| **Radius** | `sm` 4 (inputs) · `md` 8 (buttons) · `lg` 12 (cards) · `xl` 16 (modals) · `full` (pills, avatars). Don't mix within a component. |
| **Elevation** | Four steps only: subtle, card, popover, modal. Shadows use the neutral-900 base at low opacity, never pure black. |
| **Z-index** | Named tokens only: `sticky` → `dropdown` → `popover` → `tooltip` → `overlay` → `modal` → `toast`. Never a raw number. |
| **Color** | Semantic names (`--color-surface`, `--color-danger-fg`), never literal (`--color-blue-500`) in component code. Dark mode swaps token values, so components need zero conditionals. |

### Every async surface has four states

Empty, loading, error, success. Shipping only the success state is the most common UI defect in generated code.

- **Empty state** explains what goes here and offers the action that fills it. Never a bare "No data".
- **Loading** uses a skeleton whose dimensions match the final content, or you've traded a spinner for a layout shift (§10). Skeletons need `aria-busy`.
- **Error** states what happened, what to do, and offer a retry. Never a raw error string (§3.5).
- **Optimistic success** where the mutation is safe to assume — `useOptimisticAction`.

### Form UX

| Rule | Why |
| ---- | --- |
| Validate on **blur**, not on change | Validating mid-typing punishes the user for incomplete input |
| Re-validate on change **only after** the first error | Lets them see the fix land |
| Disable submit only **while pending**, never because the form is invalid | A disabled button with no explanation is a dead end; submit and show errors |
| Preserve every input on failure | Losing form data is unforgivable |
| Correct `autocomplete` and `inputmode` on every field | Autofill and the right mobile keyboard |
| Error summary at the top for forms over 5 fields, focus moved to it | Screen reader users need the summary; §7 |
| One primary action per form | Two equal buttons is a decision the user didn't ask for |

### Motion

- `motion` library. Enter/exit only for elements that appear or disappear; never decorative.
- **Duration 150–250ms.** Above 300ms feels broken; below 100ms reads as a glitch.
- **Ease-out entering, ease-in exiting.**
- **Animate `transform` and `opacity` only.** Animating `width`, `height`, `top` or `margin` triggers layout on every frame and destroys INP.
- **Respect `prefers-reduced-motion: reduce`** — reduce to an opacity fade or nothing. This is a WCAG requirement, not a nicety (§7).
- No animation on the LCP element. No autoplaying loops.

### Mobile ergonomics

- Primary actions in the bottom third — the thumb zone.
- Bottom sheet over centered modal on small viewports.
- **No hover-only affordance.** If it only appears on hover, it doesn't exist on touch.
- Test at 375×667. Verify at 320px width — the WCAG reflow floor.
- Safe-area insets respected on notched devices.

### UX writing

- Sentence case in UI. Title Case only in legal document titles.
- Buttons name the action: "Save changes", never "Submit" or "OK".
- Errors: what happened + what to do. "We couldn't reach the payment provider. Try again in a moment."
- No "please", no exclamation marks, no blame ("You entered an invalid…" → "That email doesn't look right").
- Numbers and dates always localized (§8).
- Every string is a translation key with both locales filled (§8).

---

## 7. ♿ Accessibility — WCAG 2.2 AA

> Target is **WCAG 2.2 AA**, not 2.1. Automated tools catch roughly a third of real issues; the rest is this section plus the keyboard pass in §0.

### Enforcement layers

| Layer | Tool | Gate |
| ----- | ---- | ---- |
| Lint | `eslint-plugin-jsx-a11y` at **error** | pre-commit + CI |
| Unit | `vitest-axe` on every interactive component | `npm run test` |
| E2E | `@axe-core/playwright` scanning every route in both locales, light and dark | CI blocks on new violations |
| Manual | Keyboard + zoom + reduced-motion pass | §0 DoD |

### Core rules

1. **Radix primitive first.** It ships focus management, ARIA wiring and keyboard behavior. A `<div onClick>` menu is a regression.
2. **Semantics.** `<button>` for actions, `<Link>` for navigation. Never swap for styling. One `<h1>` per page, no skipped levels. Landmarks: `<header>`, `<nav>`, `<main>`, `<footer>`.
3. **Visible focus, always.** `focus-visible:ring-2` with a 3:1 contrast ring. Never `outline-none` alone.
4. **Contrast.** 4.5:1 body text · 3:1 large text, icons, and UI boundaries · 3:1 focus indicators. Verify **both** themes — dark mode is where contrast silently fails.
5. **Images.** Meaningful `alt`, or `alt=""` when decorative. Always `width`/`height` or `fill` in a sized container.
6. **Forms.** Every input has a real `<Label htmlFor>` — placeholder is not a label. Errors link via `aria-describedby` and are announced. Required fields marked in text, not by color alone.
7. **Never convey meaning by color alone.** Status needs an icon or text too.
8. **Async announcements.** `aria-busy` or a live region. A visual-only spinner is invisible to assistive tech.
9. **Reduced motion.** Respect it for anything beyond an opacity fade.
10. **`<html lang>` follows the active locale** — mispronounced content otherwise (§8).
11. **Zoom and reflow.** Usable at 200% zoom and 320px width with no horizontal scroll and no loss of function.
12. **No keyboard traps.** Escape closes every overlay and returns focus to the trigger.

### WCAG 2.2 additions — the ones people miss

| Criterion | Requirement here |
| --------- | ---------------- |
| **2.4.11 Focus Not Obscured** (AA) | A focused element must never be hidden behind a sticky header, footer bar, cookie banner or toast. Sticky chrome needs `scroll-margin` on focusable content. This is the most commonly broken 2.2 criterion. |
| **2.5.7 Dragging Movements** (AA) | Anything draggable (reorder, slider, file drop) needs a non-drag alternative — buttons, arrow keys, or a file picker. |
| **2.5.8 Target Size** (AA) | 24×24px CSS minimum with adequate spacing. **This project targets 44×44** for touch, which comfortably exceeds it. |
| **3.2.6 Consistent Help** (A) | Support access appears in the same relative position on every page where it exists. |
| **3.3.7 Redundant Entry** (A) | Never ask for the same information twice in one flow. Prefill or offer to reuse — relevant in sign-up and checkout. |
| **3.3.8 Accessible Authentication** (AA) | No cognitive function test without an alternative. Concretely: **allow paste into every password and OTP field**, don't block password managers, and offer passkeys or magic links. A CAPTCHA with no alternative path is a violation. Better Auth supports passkeys — see Icebox. |

### Testing what tools can't

Automated scans miss: whether `alt` text is *useful*, whether focus order is *logical*, whether an error message is *actionable*, and whether the whole flow is completable without sight. Reserve manual review for those. Full compliance validation requires testing with real assistive technology and expert review — automated gates raise the floor, they don't certify the ceiling.

---

## 8. 🌐 Internationalization

### Routing decisions — declared once, never improvised

- **Locales:** `es` (default), `en`. In `src/i18n/config.ts`.
- **`localePrefix: "always"`.** Every locale carries its prefix, including the default. Bare `/pricing` **302**-redirects to the negotiated locale.
  - **Why not `as-needed`:** without a prefix on the default locale, `/pricing` and `/es/pricing` both resolve — duplicate content. `always` costs one redirect and removes the ambiguity.
- **Negotiation uses 302, never 301.** A permanent redirect teaches Googlebot — crawling from US IPs with `Accept-Language: en` — that English *is* the site, and the Spanish version never gets crawled. Every locale must also be directly reachable without negotiation.
- **`timeZone` declared explicitly** in `src/i18n/request.ts`. Omitting it means server and client format in different zones → hydration mismatch (§20).
- **`user.locale` persists preference** across devices and drives outbound email.

### Translation rules

1. **Key parity is enforced by the type system.** `messages/es.json` is the source; the `IntlMessages` type is augmented from it, so a missing or misspelled key is a **TypeScript error**, not a silent runtime fallback. `npm run i18n:check` verifies parity explicitly in CI.
2. **Zero string literals in JSX** — `eslint-plugin-i18next` `no-literal-string` at error.
3. **Key naming:** namespaced by feature, `camelCase` leaves — `dashboard.emptyState.title`. **Never reuse a key across contexts.** A shared "Save" breaks in languages where the verb inflects for its object.
4. **Plurals use ICU, always.** `{count, plural, =0 {…} one {…} other {…}}`. Never `count === 1 ? a : b` — that hardcodes two languages' plural rules into your components.
5. **Never format data by hand.** Dates, times, numbers, currency, percentages, relative time and lists go through `useFormatter` / `getFormatter`. No `toLocaleDateString('en-US')`, no `` `$${price}` ``. Spanish uses a comma decimal separator.
6. **Sorting uses `Intl.Collator`.** Plain `.sort()` misplaces accented characters.
7. **Validation errors are translated.** A locale-aware Zod error map maps issue codes to translation keys. Raw English Zod output is user-facing copy that bypassed i18n entirely — one of the most common leaks.
8. **`getFriendlyErrorMessage()` returns a key**, never a string. The component translates.
9. **Emails are sent in the recipient's locale.** `sendEmail()` takes `locale`, defaults to `user.locale`, resolves copy via `getTranslations({ locale })`. React Email templates contain zero hardcoded sentences.
10. **Metadata is translated.** `generateMetadata` must `await getTranslations({ locale })` — it runs outside the component tree and does not inherit the request locale.
11. **RTL-ready from day one.** Logical properties only: `ms-*`/`me-*` not `ml-*`/`mr-*`, `ps-*`/`pe-*`, `text-start`/`text-end`, `border-s`/`border-e`. Free now; a full restyle later.
12. **Never concatenate translated fragments.** Word order differs between languages. Use one key with interpolation.
13. **Leave room for expansion.** German and Spanish run 20–30% longer than English. No fixed-width buttons or single-line truncation on translated labels.

---

## 9. 🔍 SEO

> In a `[locale]`-routed app, i18n and SEO are the same problem. Translation work is invisible to search engines until the relationships are declared.

### Per-page metadata — all five are mandatory

Every public page exports `generateMetadata` via `buildMetadata()` in `src/lib/seo.ts`:

1. **Translated title and description.** A Spanish page with an English `<title>` is the most common i18n-SEO failure. Unique per page — copy-pasted metadata across routes tells Google your pages are duplicates.
2. **Self-referencing canonical** for the current locale. `metadataBase` resolves relative URLs; it does not emit a canonical.
3. **`alternates.languages` for every locale plus `x-default`.** Next.js turns this into `<link rel="alternate" hreflang>` tags automatically. Without it Google treats locale variants as duplicates and indexes one arbitrarily. `x-default` points at the **unprefixed root** — the locale-negotiating page — and signals the page that targets no specific language.
4. **`openGraph.locale` + `alternateLocale`**, with a 1200×630 image.
5. **Explicit `robots`** — see indexing rules.

### Indexing rules

- **`noindex` outside production.** `robots.ts` returns a global disallow unless the deployment is production. An indexed preview is duplicate content and an information leak.
- **`noindex, nofollow`** on `/login`, `/sign-up`, `/forgot-password`, `/reset-password`, `/dashboard/*`, `/settings/*`, `/admin/*`, `/api/*`.
- **`sitemap.ts` emits every locale**, each entry carrying its `alternates.languages` map. Build alternates from the **unprefixed** path or you get `/es/es/pricing` (§20).
- **Legal pages are indexable** and localized — they're trust signals.

### Structured data (JSON-LD), server-rendered

| Schema | Where |
| ------ | ----- |
| `Organization` + `WebSite` | Root layout |
| `BreadcrumbList` | Any page deeper than one level |
| `SoftwareApplication` + `Offer` | Pricing |
| `FAQPage` | FAQ sections only, and only for genuinely visible Q&A |
| `inLanguage` | Localized per locale on every entity |

Validate against Rich Results Test before shipping. Marking up content that isn't visible on the page is a manual-action risk.

### Local SEO — only if there is a real physical presence

**Do not add `LocalBusiness` markup for a purely online product.** Claiming a location you don't operate from is spam and gets manual actions. If the business does have premises or a service area:

| Requirement | Detail |
| ----------- | ------ |
| `LocalBusiness` JSON-LD | Or the specific subtype. Include `address` (full `PostalAddress`), `geo`, `telephone`, `openingHoursSpecification`, `priceRange`, `sameAs` social profiles |
| **NAP consistency** | Name, Address, Phone identical byte-for-byte across the site, Google Business Profile, and every directory. Inconsistency is the top local ranking problem |
| Google Business Profile | Claimed, verified, categories and hours current. Ranking lives here more than on your site |
| Location pages | One per location with genuinely unique content — address, staff, local landmarks, embedded map. Templated pages with a swapped city name get filtered |
| Service area | `areaServed` in markup, and real content about those areas |
| Reviews | Only mark up reviews you actually display. `AggregateRating` on invisible data is a violation |
| `hreflang` + local | A locale and a region are different axes. `es` is a language; `es-MX` targets a market. Only split by region when the content genuinely differs |

### Technical SEO baseline

- Server-render everything a crawler needs. Content behind `useEffect` may never be indexed.
- Static or ISR for marketing routes; never client-side-only.
- One `<h1>`, meaningful heading hierarchy — the same structure that serves screen readers serves crawlers.
- Internal links use `<Link>` with descriptive text. Never "click here".
- `next/image` with dimensions — CLS is a ranking input (§10).
- 404s return real 404 status. Soft 404s waste crawl budget.
- Redirects: 301 for permanent moves, 302 for locale negotiation only.
- `manifest.ts` + `opengraph-image.tsx` present.
- Consider `llms.txt` for AI crawler discoverability — Icebox.

---

## 10. ⚡ Performance Budgets

Enforced by Lighthouse CI in the pipeline. A regression past budget fails the build.

| Metric | Budget | Notes |
| ------ | ------ | ----- |
| **LCP** | < 2.5s | Usually the hero image or heading |
| **INP** | < 200ms | Usually a too-large client component or a layout-animating transition |
| **CLS** | < 0.1 | Images without dimensions, injected banners, font swap |
| **TTFB** | < 600ms | Watch DB round-trips in RSC |
| First-load JS (marketing route) | < 150KB gzipped | |
| First-load JS (app route) | < 250KB gzipped | |
| Lighthouse Performance (marketing) | ≥ 95 | |
| Lighthouse Accessibility | 100 | Non-negotiable |

### Rules

**Rendering**

- Server Components by default. Every `"use client"` is measured JS shipped to users.
- `next/dynamic` with `ssr: false` for heavy client-only libraries.
- Never define ReactFlow-style `nodeTypes`, chart configs, or option objects inside a component — module scope or `useMemo`.
- Suspense boundaries around slow data so the shell paints immediately.

**Images**

- `next/image` always, with explicit `width`/`height` or `fill` in a sized container.
- AVIF/WebP via the built-in optimizer. `loading="lazy"` by default; the LCP image gets `priority` and `fetchpriority="high"` and is never lazy.
- R2 domain registered in `images.remotePatterns`.

**Fonts**

- `next/font`, self-hosted, subset to the glyphs you use. `display: "swap"`. Preload only the LCP font. Two families maximum.

**Data**

- Parallel independent queries — never an `await` waterfall in RSC.
- Index every column you filter or sort on. Every FK.
- No N+1 in the DAL: join or batch.
- Cache with explicit `revalidate` or tags. Never cache authenticated data at the CDN.

**Lists**

- Virtualize anything that can exceed ~50 rows (`react-window`), or paginate. Both is better.
- Stable `key` — never the array index.

**Bundle**

- Import subpaths, not barrels: `import debounce from "lodash/debounce"`.
- No barrel files re-exporting a directory.
- Check `npm run analyze` before adding any dependency over 20KB.

**Third parties**

- Every third-party script is a budget line item. Load after interaction or after consent (§12), never blocking.
- Analytics must never block paint or shift layout.

---

## 11. 📣 Marketing, Analytics & Growth

### Event taxonomy — a contract, not a habit

Untyped tracking rots within a month. Every event is declared in `src/lib/analytics.ts` as a typed registry; `track()` accepts only registered names with their required properties. An unregistered event is a **type error**. Human-readable catalog in `docs/EVENTS.md`.

| Rule | Detail |
| ---- | ------ |
| Naming | `object_action`, snake_case, past tense: `checkout_started`, `subscription_activated` |
| Properties | snake_case, no PII in property values — ID references only |
| Never fire from mount effects | React Strict Mode double-invokes in dev and you'll ship double counts. Fire from the actual interaction or a server action |
| Revenue is server-side truth | Conversions come from the **Stripe webhook**, never a client "thank you" page. Client-side purchase events are lost to ad blockers and abandoned tabs |
| Identify on auth | Alias the anonymous ID to `user.id` at login so pre-signup sessions stitch to the account |
| No event before consent | §12 |

### Attribution

- Capture UTM parameters on first landing, store **first-touch** and **last-touch** on the user record. Session-only attribution loses the multi-visit path, which is most B2B.
- Server-side conversion reporting where the platform supports it — client pixels are unreliable.
- Never let a tracking parameter create a crawlable URL variant. Canonical excludes query params (§9).

### Experiments

- Feature flags and A/B assignment via PostHog, **resolved server-side**. Client-side variant swapping causes a flash of the control and a CLS hit that fails §10.
- Every experiment declares its hypothesis, primary metric and minimum sample before launch. Stopping early on a favorable peek is how teams ship noise.
- Flags are cleaned up after the decision. Stale flags are dead branches an agent will treat as live paths.

### Landing page conventions

- One `<h1>` stating the value proposition, above the fold, no scroll needed.
- **One primary CTA** repeated, not five competing ones.
- Proof near the ask: logos, numbers, testimonials.
- LCP element is text or a `priority` image — never a carousel, never a video.
- Forms ask for the minimum. Every extra field costs conversion.
- Copy passes the §7 reading rules and the §8 translation rules. A marketing page that only exists in English defeats the i18n work.

### Email

| Type | Rules |
| ---- | ----- |
| **Transactional** (receipts, resets, verification) | Sent regardless of marketing consent — legitimate interest. Never contains promotional content, or it becomes marketing |
| **Marketing** (campaigns, newsletters) | Requires `user.marketingConsent === true`. One-click unsubscribe honored immediately. Physical address and unsubscribe link in every message |

Both are localized via `user.locale` (§8). Separate sender identities so a marketing complaint never damages transactional deliverability. Verify SPF, DKIM and DMARC before the first send.

---

## 12. 🔐 Privacy, Legal & Compliance

### Consent gate

**No non-essential cookie, script, or event before explicit consent.** Analytics, session replay and marketing pixels load *after* the user opts in. Essential cookies (session, locale, consent state) need no consent and are documented as such.

- Consent choice is stored, versioned, and re-requested when the policy changes.
- Rejecting is exactly as easy as accepting — one click, equal visual weight. A pre-checked opt-in or a hidden reject button is not consent.
- The banner must not obscure focused content (§7, 2.4.11) and must be keyboard operable.

### Required pages — localized, indexable

Privacy Policy · Terms of Service · Cookie Policy, each listing the actual subprocessors below. A generic template naming services you don't use is worse than none.

### Subprocessor inventory

| Vendor | Data | Purpose |
| ------ | ---- | ------- |
| Vercel | Request metadata, IP | Hosting |
| Neon | All application data | Database |
| Better Auth *(self-hosted)* | — | Auth runs in your infra; no third party sees credentials |
| Stripe | Name, email, payment data | Payments |
| Resend | Email address, content | Transactional + marketing email |
| Cloudflare R2 | Uploaded files | Storage |
| Upstash | IP hashes | Rate limiting |
| Sentry | Error context, scrubbed | Error monitoring |
| PostHog | Behavioral events, replay | Analytics, flags |

Keep this current. A DPA is required with each, and the list must match reality — it's the first thing a data request asks for.

### User rights — implemented, not promised

| Right | Implementation |
| ----- | -------------- |
| **Access / portability** | `/settings/data` exports all user data as JSON |
| **Erasure** | Account deletion: hard-deletes PII, retains the minimum required for legal and financial records, cascades a deletion request to Stripe, Sentry and PostHog |
| **Rectification** | Editable profile |
| **Consent withdrawal** | Toggle in settings, effective immediately |

Erasure is the one most boilerplates skip and the one most likely to be requested. **Both flows are E2E tested** (§14) — a broken export is a compliance failure, not a bug.

### Data minimization

- Collect only what a feature needs today. "We might want it later" is not a basis.
- **Never log PII** — identifiers only (§3.9).
- Sentry `beforeSend` scrubbing and session replay input masking configured **before** production, or you ship PII to a third party.
- Documented retention: logs 30d, sessions 90d, deleted accounts purged after the legal minimum.
- Secrets never in code, never in client bundles, never in agent output.

---

## 13. 🛡️ Security Baseline

### ⚠️ Open items

| Item | Action |
| ---- | ------ |
| **`next` below the patched floor** | Upgrade to **`16.2.11+`**. The July 2026 advisory covers nine issues including SSRF, a **middleware/proxy authorization bypass**, DoS, and cache identifier disclosure, patched in `15.5.21` and `16.2.11` ([Netlify](https://www.netlify.com/changelog/2026-07-21-nextjs-security-vulnerabilities/), [release notes](https://releasebot.io/updates/vercel/next-js)). The middleware bypass is directly relevant because `/admin` navigation gating lives in `proxy.ts` — and is precisely why enforcement must also be server-side. After upgrading, verify a non-admin cannot reach `/admin`. Details paraphrased for licensing compliance. |
| Security headers / CSP | `headers()` in `next.config.ts`: HSTS with preload, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and a nonce-based CSP with `frame-ancestors 'none'` |
| Sentry PII scrubbing | `beforeSend` + replay masking before production |

### Standing rules

1. **Authorization is server-side, always.** The proxy is optimistic UX. Every action and handler re-verifies via `authActionClient` / `adminActionClient` / `requireRole()`. Proxy-only protection is one middleware CVE from public — and that CVE shipped this year.
2. **Every Server Action is a public endpoint until proven otherwise.** Next.js provides CSRF defense, encrypted closures and rotating action IDs, but its own docs are explicit that these don't replace application-level authorization ([production patterns](https://www.digitalapplied.com/blog/nextjs-server-actions-production-patterns-2026-guide)); action-ID encryption is not authentication ([analysis](https://dev.to/shubhradev/nextjs-16-server-actions-security-the-auth-check-most-developers-miss-1ei1)). A 2026 review put the failure mode bluntly: without strict payload validation an author can create an unauthenticated RPC endpoint by accident ([dev.to](https://dev.to/adioof/server-actions-blur-the-client-server-line-and-juniors-are-paying-for-it-4plc)). Findings paraphrased for licensing compliance. **This is why `next-safe-action` is a constraint and not a convenience:** middleware makes the guard impossible to forget.
3. **Validate at every trust boundary.** Actions, handlers, webhooks, env vars — all parse with Zod. Client validation is UX, never security.
4. **Verify every webhook signature before doing any work.** Reject 400, log the rejection, never parse first.
5. **Never trust client-supplied identifiers.** Session-derived `userId`; server-generated storage keys. A client filename is path traversal and overwrite risk.
6. **No internals in errors.** `getFriendlyErrorMessage()` for users; stack traces to Sentry.
7. **No secrets in client code.** `NEXT_PUBLIC_*` is public. Confirm the value is billboard-safe before adding the prefix.
8. **Rate-limit every public input path:** `/api/auth/*`, every `actionClient` action, uploads, contact forms, password reset.
9. **Sessions.** `BETTER_AUTH_SECRET` is 32+ random bytes, rotated on suspicion. Cookies `httpOnly`, `secure`, `sameSite: "lax"`.
10. **Auth hardening.** Rate-limit and progressively delay failed logins. Never reveal whether an email exists ("If that address is registered, we sent a link"). Password reset tokens are single-use and short-lived. **Allow paste and password managers** — blocking them is both a security and an accessibility failure (§7, 3.3.8).
11. **Uploads.** Validate MIME and size server-side; never trust the client. Serve user files from a separate origin so a malicious upload can't script against your session.
12. **Public endpoints are declared, not discovered.** Only `/api/auth/[...all]` (rate limited) and `/api/webhooks/stripe` (signature verified, idempotent). Adding one requires an entry in §4 with justification and mitigation.
13. **Dependencies.** Pin exact runtime versions. Vet maintenance status and typosquatting before proposing.

---

## 14. 🧪 Testing Strategy

> AI-generated code needs **more** verification, not less. `npm run build` proves it compiles and nothing else. This section is what replaces "write tests only when asked."

### Mandatory coverage

| Code | Required cases |
| ---- | -------------- |
| Server Actions | Happy path · unauthenticated · wrong role · invalid input · rate limited |
| DAL functions | Correct data, correct filters |
| Auth guards | **Especially the negative cases** — a broken guard is a breach |
| `safe-action` middleware | Everything else depends on it holding |
| Zod / drizzle-zod schemas | Valid and invalid input |
| **Zod locale error map** | Errors render in `es` and `en` |
| Stripe webhook | Invalid signature rejected · duplicate `event.id` is a no-op |
| Presign action | Oversized rejected · wrong MIME rejected · key generated server-side |
| `sendEmail()` | Correct locale resolved from `user.locale` |
| **Data export & account deletion** | End-to-end — a broken export is a compliance failure (§12) |
| Business logic in `lib/` | Pure functions, trivial to cover |
| Custom hooks | Stateful logic |
| Interactive components | Behavior + `axe` assertion |
| Presentational components | Optional — covered by visual verification |
| `components/ui/` Shadcn | No — upstream |
| `schema/auth.ts` | No — generated |

### Layers

**Unit + component — Vitest + RTL.** Query by accessible role and label, never by test id or class. A test that can't find the button by its accessible name is telling you the component is inaccessible — fix the component, not the test. Every interactive component asserts `toHaveNoViolations()`.

**Network — MSW.** Mock at the network layer, not by stubbing modules. Never mock your own DAL in an action test; mock the external call (Stripe, Resend, R2).

**E2E — Playwright.** Thin and critical-path only: sign-up → dashboard · checkout → subscription active · admin denied to a non-admin · data export · account deletion. Browser matrix: Chromium, WebKit, and Chromium mobile viewport. Each spec runs in both locales where copy matters.

**A11y — `@axe-core/playwright`.** Scan every route in both locales, both themes. CI blocks on new violations.

**Visual regression — Playwright snapshots.** Marketing pages and the component gallery at 375 / 768 / 1280. Catches the CSS regression that no assertion covers.

**Performance — Lighthouse CI.** Runs against a preview deploy, asserts §10 budgets, blocks the merge on regression.

### Test data

- **Factories, not fixtures.** `tests/factories/` builds objects with sensible defaults and explicit overrides, so a test states only what it cares about.
- **A Neon branch per CI run**, seeded and destroyed. Never a shared mutable test database.
- MSW is Vitest-only. E2E hits real routes against the seeded branch.

### Rules

- Test behavior, not implementation. No call-count assertions unless the call *is* the contract ("charged exactly once").
- One assertion concept per test. Names state expected behavior.
- No snapshot tests of large trees — they pass on breakage and fail on formatting.
- Deterministic: no real network, no real clock (`vi.useFakeTimers()`), no shared mutable state.
- **A failing test is fixed, never skipped.** A flaky test is quarantined with an issue and a deadline, never left to erode trust in the suite.

---

## 15. 🤖 Agent Toolchain

> Without a browser, an agent writes CSS blind and the human becomes the test runner. This section is what makes "verified" mean something.

### MCP servers — `.mcp.json`

| Server | Purpose | Use for |
| ------ | ------- | ------- |
| **Chrome DevTools MCP** | Real browser: DOM, console, network, performance traces, CWV | **Primary verification tool.** Screenshots, layout checks, real LCP/INP/CLS measurement, reading console errors, inspecting rendered metadata and JSON-LD |
| **Playwright MCP** | Deterministic scripted interaction | Authoring and debugging E2E specs, multi-step flows, cross-browser checks |
| **Docs MCP** (Context7 or equivalent) | Current library documentation | Verifying an API before using it, instead of guessing from training data |
| **Figma MCP** (Dev Mode) | Design source | Extracting tokens and specs when a design exists |

### The verification loop — required for UI work

1. Build or change the UI
2. Render the affected route through Chrome DevTools MCP
3. **Read the console.** A clean-looking page with hydration errors is not done
4. Screenshot at **375, 768, 1280, 1920**
5. Compare against intent — design reference or stated requirement
6. Keyboard pass: Tab order, visible focus, focus not obscured, Escape closes
7. Re-render with `prefers-reduced-motion: reduce`
8. Screenshot the empty, loading and error states, not just success
9. If the change adds JS, an image, or a dependency: run a performance trace and check §10 budgets
10. On a public page: inspect the rendered `<head>` for canonical, hreflang and JSON-LD (§9)
11. Fix and repeat until it matches

### Hooks

| Trigger | Action | Why |
| ------- | ------ | --- |
| `agentStop` | `npm run typecheck && npm run lint` | Closes the correction loop without being asked |
| `postToolUse` on write | `prettier --write` on the changed file | Formatting never becomes a review comment |
| `preToolUse` on shell | Warn on `rm -rf`, `db:push` against a non-local URL, `git push --force` | Destructive-command guard |

### Rules for agents

- **Never start a long-running process.** No `dev`, `test:watch`, `db:studio`, `email:dev`. Use `npm run test` and `npm run build`. For E2E, let Playwright's `webServer` manage the server.
- **Never claim a visual result you didn't see.** "Should render correctly" is not a result.
- **Read the console before declaring success.** Hydration and CSP errors don't fail the build.
- **Prefer the docs MCP over memory** for any API you're not certain about. A confidently wrong API call costs more than a lookup.
- **Report what you ran, verbatim output for failures.**
- **When a lookup or a fan-out is large** (many files, many routes to check), delegate to a subagent to keep the main context on implementation.

---

## 16. ⚙️ Environment & Secrets

_Never hardcode secrets. Never commit `.env`. Never echo a secret's value into logs or agent output — reference it by key name._

### Server-side — validated in `src/lib/env.ts`

| Variable | Description |
| -------- | ----------- |
| `DATABASE_URL` | NeonDB connection string |
| `BETTER_AUTH_SECRET` | Signs sessions and tokens — `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Canonical base URL for auth callbacks |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | OAuth (optional) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth (optional) |
| `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET_NAME` | Cloudflare R2 |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` / `RESEND_MARKETING_FROM_EMAIL` | Email — separate senders per §11 |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Rate limiting |
| `POSTHOG_API_KEY` | Server-side events and flag evaluation |

### Client-side — validated in `src/lib/env.ts`

| Variable | Description |
| -------- | ----------- |
| `NEXT_PUBLIC_APP_URL` | Base URL. **Must equal `BETTER_AUTH_URL`** |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | R2 public bucket |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN |
| `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` | Analytics — **loaded only after consent** (§12) |

### Intentionally outside `env.ts`

| Variable | Used in | Why |
| -------- | ------- | --- |
| `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` | `next.config.ts` (token CI-only) | Build-time source maps |
| `DATABASE_URL` | `drizzle.config.ts` | Drizzle Kit runs outside Next |

**Notes**

- `.env.local` for dev; provider secrets in production. `.env.example` is committed with placeholders and stays in sync with these tables.
- Validation runs at import time and fails fast naming the missing key.
- **`SKIP_ENV_VALIDATION` is discouraged.** It converts a loud build failure into a silent production outage. CI uses a committed `.env.ci` of valid placeholders so validation actually runs (§20).
- Secrets rotate on staff change or suspected exposure. Rotation order is in `docs/RUNBOOK.md`.

---

## 17. 🧰 Key Commands

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Dev server — **agents never run this** |
| `npm run build` / `start` | Production build / server |
| `npm run lint` / `lint:fix` | ESLint — zero warnings tolerated |
| `npm run format` / `format:check` | Prettier |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest, single run |
| `npm run test:watch` | Watch — **run manually only** |
| `npm run test:e2e` | Playwright |
| `npm run test:a11y` | axe scan across routes |
| `npm run test:visual` | Visual regression snapshots |
| `npm run lighthouse` | Lighthouse CI against §10 budgets |
| `npm run analyze` | Bundle analyzer |
| `npm run i18n:check` | Translation key parity |
| `npm run validate` | Full CI: typecheck + lint + format + i18n + test + build |
| `npm run clean` | Delete `.next` (fixes stale type errors) |
| `npm run auth:generate` | Regenerate the Better Auth schema |
| `npm run db:push` / `generate` / `migrate` / `studio` / `seed` | Drizzle Kit |
| `npm run email:dev` | React Email preview — **run manually only** |
| `npx shadcn@latest add [component]` | Add a Shadcn component |

---

## 18. 🔌 Third-Party Integrations

### Better Auth — self-hosted

- **Purpose:** sessions, email/password, OAuth, reset, roles. Users live in **your** Postgres.
- **Files:** `lib/auth.ts` (instance + `getSession`/`requireAuth`/`requireRole`), `lib/auth-client.ts`, `app/api/auth/[...all]/route.ts`, `lib/db/schema/auth.ts` (generated), `proxy.ts`
- **Why over a hosted vendor:** no external identity to reconcile — no `clerk_id`, no sync webhook, no dual user store, no per-user bill. Covers email/password, OAuth, magic links, 2FA and organizations in one library rather than separate plugins ([overview](https://getnextjstemplates.com/blogs/best-nextjs-user-authentication-resources)), with a first-class Drizzle adapter ([docs](https://www.better-auth.com/docs/adapters/drizzle)).
- **Documented alternative — Clerk:** ships faster with prebuilt auth UI and a hosted user dashboard; its free tier now covers 50,000 monthly retained users ([LogRocket](https://blog.logrocket.com/best-auth-library-nextjs-2026/)). The cost is a foreign identity plus a sync webhook you maintain. Choose deliberately — identity migration is the most expensive migration in the stack. Comparisons paraphrased for licensing compliance.
- **Critical:** never query the database inside `proxy.ts`. Use the session-cookie helper for an optimistic redirect, then verify server-side (§20).
- **Trade-off to plan for:** you build the login and sign-up UI. Those screens must satisfy §7 3.3.8 — paste allowed, password managers supported.

### next-safe-action

- **Purpose:** end-to-end type safety from input validation to result, with chainable middleware ([docs](https://next-safe-action.dev/docs/introduction)).
- **File:** `lib/safe-action.ts` — `actionClient` (public, rate limiting mandatory) · `authActionClient` (`ctx.user` guaranteed) · `adminActionClient` (role enforced)
- **Why it's a constraint:** see §13.2. Structural enforcement beats documented convention, and that gap is where AI-generated code fails.

### Cloudflare R2 — presigned URLs

- **File:** `lib/r2.ts` — `presignPutUrl({ key, contentType, contentLength })`, `publicUrl(key)`
- **Flow:** client requests a presigned PUT from an `authActionClient` action → server validates type/size against `UPLOAD` and **generates the key itself** (`${user.id}/${uuid}.${ext}`), signs for ≤5 min → browser PUTs **directly to R2** with exactly the signed `Content-Type` and `Content-Length` → a second action persists the key.
- **Why not FormData through an action:** that routes bytes through your serverless function, which caps around 4.5MB on Vercel. A 6MB phone photo fails opaquely, and you pay compute to relay bytes.
- **Requires:** R2 bucket CORS for all origins including previews, or the browser PUT fails (§20).

### Stripe

- **Files:** `lib/stripe.ts`, `app/api/webhooks/stripe/route.ts`
- **Critical:** handlers must be **idempotent** — Stripe retries, so anything granting credit or sending email fires twice unless you dedupe on `event.id` before side effects. Use `req.text()` for the raw body.
- Conversion events originate here, not client-side (§11).
- **Documented alternative:** Stripe leaves global VAT and sales tax to you. A merchant of record (Polar, Lemon Squeezy) takes a higher cut and absorbs that obligation — often worth it for solo developers selling internationally.

### Resend + React Email

- **Files:** `lib/resend.ts`, `lib/email/send.ts`, `lib/email/templates/*.tsx`
- **Why React Email:** email clients are a compatibility minefield — Outlook renders through Word, Gmail strips much of `<head>`, flexbox is unreliable. Hand-maintained HTML strings don't survive the second template. React Email ships the table layouts already solved, plus local preview.
- **Rules:** locale-aware (§8) · separate transactional and marketing senders (§11) · SPF/DKIM/DMARC verified before first send · never send an unvalidated user-supplied `to` address.

### NeonDB

- **Files:** `lib/db/index.ts`, `lib/db/schema/`, `drizzle.config.ts`
- **Branching:** a branch per preview deploy and per CI run, so previews and tests never touch production data.

### Upstash Redis

- **File:** `lib/rate-limit.ts` · Applied to `/api/auth/*`, every public action, presign, contact.

### Sentry

- **Files:** `instrumentation-client.ts`, `instrumentation.ts`, `sentry.{server,edge}.config.ts`, `next.config.ts`, `global-error.tsx`, `lib/logger.ts`
- **Critical:** `beforeSend` scrubbing and replay input masking **before** production (§12). Web Vitals report here.
- Release health tied to deploys so a regression is attributable to a commit.

### PostHog

- **Files:** `lib/analytics.ts`, `lib/flags.ts`
- **Loaded only after consent** (§12). Flags resolved **server-side** to avoid variant flash (§11).
- Collapses analytics, flags, replay and experiments into one vendor. Self-hosting is available if data residency outweighs ops cost.

---

## 19. 🚀 Deployment & Operations

### Environments

| Environment | Branch | Data | Keys |
| ----------- | ------ | ---- | ---- |
| Local | — | Neon dev branch | Test |
| Preview | feature branches | **Neon branch per PR** | **Test** |
| Staging | `develop` | Staging branch | Test |
| Production | `main` | Production | Live |

**A preview wired to production credentials charges real cards and emails real users.** Verify test keys, a Neon branch, and preview OAuth callback URLs before the first preview deploy.

### CI pipeline

`typecheck → lint → format:check → i18n:check → test → build → e2e → a11y → visual → lighthouse`

Uses `.env.ci` placeholders so env validation actually runs. Never `SKIP_ENV_VALIDATION`.

### Database migrations — expand/contract, always

Never destructive in the same deploy as the code change. Rollback reverts code, **not** the database, so every migration must be backward compatible with the previous release.

1. **Expand** — add the nullable column or new table. Deploy. Old code still works.
2. **Migrate** — backfill. Deploy code writing to both shapes.
3. **Contract** — once no running version reads the old shape, drop it. Separate deploy.

Renaming a column in one step is how you cause a five-minute outage on rollback.

### Release

- Never push directly to `main`. PRs only, CI green.
- **Deploy and release are decoupled.** Ship dark behind a flag, enable separately. Reduces a risky release to a config change.
- Squash merge, conventional commits, `CHANGELOG.md` maintained.
- Rollback is Vercel instant rollback. Practice it before you need it.

### Observability

| Signal | Tool | Alert |
| ------ | ---- | ----- |
| Errors | Sentry | New issue in production, or error rate above baseline |
| Performance | Sentry + Lighthouse CI | CWV regression past §10 |
| Uptime | External check on `/` and `/api/auth` | Two consecutive failures |
| Webhooks | Stripe dashboard + Sentry | Delivery failure rate |
| Business | PostHog | Signup or conversion drop |

Alerts route to a real channel. An alert nobody sees is a log line.

### Incidents

`docs/RUNBOOK.md` covers: rollback steps, secret rotation order, Stripe webhook replay, Neon point-in-time restore, and who to contact per vendor. Written before the first incident, not during.

---

## 20. 🐛 Known Gotchas & Patterns

_The highest-value section in this file. Burned time on a surprising bug? Document it here._

### Gotchas

| Issue | Solution |
| ----- | -------- |
| **Never query the DB in `proxy.ts`** | Middleware runs on every matched request and may run at the edge. Use Better Auth's session-cookie helper for an optimistic redirect; verify server-side. A DB call here taxes every navigation and is unreliable at the edge. |
| **Hydration mismatch on dates** | The cause in a next-intl app is a missing `timeZone` in `i18n/request.ts` — server and client format in different zones. Set it. **Do not reach for `suppressHydrationWarning`**: it hides the mismatch and leaves the date wrong for the user. |
| **Presigned PUT rejected by R2** | The client must send exactly the signed `Content-Type` and `Content-Length`. Any mismatch is a signature failure. |
| **Browser PUT to R2 fails with CORS** | Configure bucket CORS for every origin including previews, allowing `PUT` and `Content-Type`. Easy to miss because server-side signing succeeds regardless. |
| **In-memory rate limiting doesn't work on Vercel** | Each invocation may be a fresh instance, so the counter resets and the limit effectively doesn't exist — worse than nothing, because it creates false confidence. Use `@upstash/ratelimit`. |
| **`next-safe-action` validation errors are a result field, not a throw** | Read `validationErrors` from the result. A `try/catch` silently misses them. |
| **Auth schema is generated** | Run `npm run auth:generate` after config changes. Hand edits to `schema/auth.ts` get overwritten. |
| **Neon HTTP driver has no transactions** | Use the WebSocket Pool driver for those paths, or sequence idempotent writes. |
| **`nuqs` needs its adapter** | Wrap the app in `NuqsAdapter` in the root layout or hooks throw at runtime. |
| **`drizzle-zod` shouldn't carry business rules** | Derive shape from the table, `.refine()` separately. Business constraints in the DB schema couple validation to migrations. |
| **Stripe webhook needs the raw body** | `req.text()`, not `req.json()`. |
| **Stripe retries webhooks** | Dedupe on `event.id` before any side effect. |
| **React Email must be rendered before sending** | `render()` the component to HTML inside `sendEmail()`. Passing the component to Resend won't do what you expect. |
| **next-intl requires awaiting `params`** | In Next 16 `params` is a Promise. Always `await params`. |
| **Metadata in the wrong language** | `generateMetadata` runs outside the component tree and doesn't inherit the request locale. `await getTranslations({ locale })`. |
| **Translations exist but pages don't rank** | Missing `alternates.languages`. Without hreflang, Google treats locale variants as duplicates. |
| **`x-default` pointing at a prefixed URL** | It must point at the unprefixed root. Pointing it at `/en` tells Google English is everyone's fallback. |
| **Sitemap alternates duplicating the locale** | Build alternates from the unprefixed path, or you emit `/es/es/pricing`. |
| **Preview deploy in search results** | `robots.ts` didn't check the environment. Global disallow unless production. |
| **Zod errors in English for Spanish users** | The locale-aware error map isn't installed. Zod's defaults render directly in forms. |
| **Emails always in one language** | `sendEmail()` called without a locale, or the template has hardcoded copy. Pass `user.locale`. |
| **Analytics events firing twice in dev** | Fired from a mount effect; Strict Mode double-invokes. Fire from the interaction or a server action. |
| **Cookie banner obscuring focused content** | WCAG 2.2 2.4.11 violation. Sticky chrome needs `scroll-margin` on focusable content. |
| **CLS from a skeleton** | The skeleton's dimensions don't match the loaded content. Match them. |
| **INP regression after adding a transition** | You animated a layout property. `transform` and `opacity` only. |
| **`next/image` needs remote domains** | Add to `images.remotePatterns`, including the R2 public domain. |
| **Typecheck fails for deleted routes** | `.next/types/validator.ts` references deleted files: `npm run clean` then `typecheck`. |
| **Zod date coercion for the DB** | `z.coerce.date()` for form dates. Raw strings into Drizzle timestamps fail with `value.toISOString is not a function`. |
| **Drizzle config reads env directly** | `drizzle.config.ts` uses `process.env.DATABASE_URL!` — it runs outside Next. |
| **Sentry is optional** | Without a DSN, logger and instrumentation degrade to console-only. No errors. |
| **`SKIP_ENV_VALIDATION` hides real failures** | Turns a loud build failure into a silent outage. Use `.env.ci` placeholders. |
| **MSW must not intercept Playwright** | MSW is Vitest-only. E2E hits real routes against the seeded branch. |
| **OAuth breaks on previews** | Each preview origin needs its callback registered and `BETTER_AUTH_URL` set to that origin. |
| **Rollback didn't fix it** | Vercel reverts code, not the database. This is why migrations are expand/contract (§19). |

### Patterns

- **Safe Action:** pick the client → attach schema → handler gets validated input and guaranteed `ctx.user` → DAL → log → return. Reference: `actions/example.ts`.
- **DAL:** pure query functions. No auth, no validation, no logging. Import the specific module.
- **Route Handler:** `withErrorHandler()` + `successResponse()`/`errorResponse()`. Reserved for webhooks, auth, and cases actions can't serve (streaming, custom headers, public APIs).
- **Client Action:** `useAction` / `useOptimisticAction`. Never hand-roll loading state.
- **Schema:** `createInsertSchema(table)`, `.omit()` server-managed columns, `.refine()` business rules. Hand-write only non-table schemas.
- **URL State:** `useQueryState` / `useQueryStates`. Zustand only for ephemeral UI.
- **Upload:** presign action → direct browser PUT → persist-key action.
- **Email:** `sendEmail({ to, template, locale })` renders React Email and dispatches via Resend.
- **Auth Guard:** proxy for navigation, `authActionClient`/`adminActionClient`/`requireRole()` for enforcement. Both layers, always.
- **Rate Limit:** `checkRateLimit(identifier)` with `getClientIdentifier(headers)` on every public path.
- **Friendly Error:** `getFriendlyErrorMessage(error)` returns a translation key.
- **Metadata:** `buildMetadata({ locale, path, title, description })` from `lib/seo.ts` — emits canonical, hreflang, `x-default` and OG consistently. Never hand-assemble metadata.
- **Analytics:** `track("event_name", props)` from the typed registry, after the consent gate.
- **Feature Flag:** `getFlag(name, user)` server-side; pass the resolved value down as a prop.
- **Four States:** every async surface renders empty, loading, error and success.
- **Lazy Loading:** `next/dynamic` with `ssr: false` for heavy client libraries.
- **Code Quality:** pre-commit → lint-staged + typecheck. Pre-push → test + build. CI → `validate` + e2e + a11y + visual + lighthouse.

---

## 21. 📍 Project Status & Roadmap

_Keep status under 6 lines. Detailed planning in `docs/ROADMAP.md` or GitHub Issues — long checklists in always-loaded context rot and mislead._

- **Phase:** Boilerplate — hardening
- **Active Task:** None
- **Blockers:** None

### 🟡 Now — hardening, in order

1. [ ] `next` → `16.2.11+`; verify a non-admin cannot reach `/admin`
2. [ ] Better Auth: generate schema, mount handler, proxy cookie check, guards
3. [ ] `lib/safe-action.ts` clients; convert the example action
4. [ ] Security headers + CSP; Sentry PII scrubbing
5. [ ] Upstash rate limiting on `/api/auth/*` and every public action
6. [ ] Presigned upload flow + R2 CORS
7. [ ] `drizzle-zod` derivations; Zod locale error map
8. [ ] `lib/seo.ts`: `buildMetadata()` with canonical + hreflang + `x-default`; multi-locale sitemap; env-aware robots; JSON-LD
9. [ ] `IntlMessages` typing + `i18n:check`; `eslint-plugin-i18next`
10. [ ] `styles/tokens.css` as the token SSOT; audit hardcoded values
11. [ ] `jsx-a11y` at error; WCAG 2.2 audit including 2.4.11 and 3.3.8
12. [ ] Vitest + RTL + MSW + `vitest-axe`; the §14 mandatory table
13. [ ] Playwright: critical paths + `@axe-core/playwright` + visual snapshots
14. [ ] Lighthouse CI with §10 budgets
15. [ ] `.mcp.json` + hooks; document the verification loop
16. [ ] Consent gate; PostHog behind it; typed event registry
17. [ ] Legal pages localized; data export + account deletion, E2E tested
18. [ ] React Email templates, locale-aware; `nuqs` adapter mounted
19. [ ] `docs/RUNBOOK.md`

### ⬜ Next — your first feature

Domain tables → `db:push` → `drizzle-zod` schemas → DAL → actions on `authActionClient` with tests → UI with the four states, verified visually.

### 🧊 Icebox

Dark mode · Better Auth passkeys / 2FA / organizations · dynamic OG images · `llms.txt` · Storybook past ~15 components · merchant-of-record billing · multi-region · self-hosted PostHog

---

## 22. 🧩 Skills Extraction Map

When this file is split into `.claude/skills/`, use this mapping. Load-map frequency determines what stays in `CLAUDE.md` versus what becomes on-demand.

| Skill | Sections | Trigger description |
| ----- | -------- | ------------------- |
| `CLAUDE.md` (always loaded) | 0, 1, 3 | Constraints, anti-patterns, DoD, coding rules. Target under 100 lines |
| `architecture` | 4, 5 | Adding routes, entities, or restructuring the app |
| `design-system` | 6 | Building or changing any component, layout, or visual treatment |
| `motion` | 6 (Motion) | Adding animation, transitions, or micro-interactions |
| `accessibility` | 7 | Any UI work — WCAG 2.2 AA rules and the manual audit |
| `i18n` | 8 | Adding strings, dates, numbers, currency, or a locale |
| `seo` | 9 | Metadata, sitemap, structured data, canonical, hreflang |
| `local-seo` | 9 (Local) | Physical location, service area, or Google Business Profile work |
| `performance` | 10 | Adding a dependency, image, list, or client component |
| `analytics` | 11 | Tracking, conversion, experiments, landing pages |
| `privacy-compliance` | 12 | Storing user data, cookies, third parties, erasure |
| `security` | 13 | Auth, API routes, webhooks, uploads, user input |
| `testing` | 14 | Writing or changing actions, DAL, guards, schemas, components |
| `agent-toolchain` | 15 | Verifying work — the MCP loop |
| `integrations/*` | 18 (one per vendor) | Touching that specific service |
| `deployment` | 19 | Migrations, releases, incidents, flags |
| `gotchas` | 20 | Debugging anything surprising — highest hit rate per token |

**Split principles.** Only §0, §1 and §3 load on every turn. `name` and `description` are the only fields the runtime sees before activating a skill, so they must be trigger-shaped and specific, not generic. Keep each `SKILL.md` lean and push depth into `references/`. Scripts that can be deterministic (i18n parity, token audit, bundle check) belong in `scripts/`, not in prose.

---

## 23. 📚 References

_Human-facing. Agents use the docs MCP (§15) rather than following links._

Next.js · React · Tailwind v4 · Shadcn/UI · Radix · Motion · Drizzle · drizzle-zod · Better Auth · next-safe-action · nuqs · Zod · React Hook Form · Stripe · Resend · React Email · Cloudflare R2 · aws4fetch · Upstash · next-intl · Zustand · SWR · Sentry · PostHog · Vitest · Playwright · Testing Library · axe-core · Lighthouse CI · WCAG 2.2 · Schema.org

- **Design (Figma):** N/A — connect via Figma MCP when available
- **Brand / Style Guide:** N/A
- **Event catalog:** `docs/EVENTS.md`
- **Runbook:** `docs/RUNBOOK.md`

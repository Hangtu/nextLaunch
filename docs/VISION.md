# 📂 Vision: An Ambitious NextLaunch

> ## ⚠️ Status: aspirational, not implemented
>
> This document was formerly the project's `CONTEXT.MD` / source of truth.
> It describes a **more ambitious target architecture** — Better Auth
> instead of Clerk, `next-safe-action`, `nuqs`, a computed WCAG/APCA color
> system, a full testing pyramid (MSW, `vitest-axe`, Lighthouse CI,
> visual regression), PostHog, Upstash rate limiting, and more — that was
> **never actually built**. The real codebase still runs on Clerk, Zustand,
> hand-rolled `ActionResponse`, an in-memory rate limiter (Upstash Redis
> optional, not required), and no design token / accessibility tooling
> beyond ESLint's bundled `jsx-a11y` rules.
>
> **Current, accurate documentation lives in `AGENTS.md` and the rest of
> `docs/`.** Treat everything below as a direction to evaluate
> deliberately if a project wants to take this template further — never as
> a description of what exists today. No file, function, or package named
> below should be assumed to exist without checking. The historical
> "SYSTEM INSTRUCTION FOR AI" framing below is kept for context only; it
> no longer applies — `AGENTS.md` is what agents actually load (`CLAUDE.md`
> is a one-line `@AGENTS.md` pointer, per Next.js's own
> [AI agents guide](https://nextjs.org/docs/app/guides/ai-agents)).

---

> **SYSTEM INSTRUCTION FOR AI (historical — superseded, see banner above):**
> This file is the Single Source of Truth (SSOT) for architectural decisions, constraints, standards, and non-obvious knowledge.
> It is NOT a mirror of the filesystem. Anything derivable by reading the code is authoritative in the code, not here.
> **Always read Sections 0, 1, 2, 3.** Load everything else on demand via the Context Load Map.
> If a user prompt contradicts this file, prioritize this file or ask for confirmation.

> **On a fresh project:** if the user says "start the project", "initialize", "set this up", or equivalent — go to **§24 Bootstrap Protocol** and follow it. Do not begin scaffolding before reading it.

> **Agent tooling:** `CLAUDE.md` and `AGENTS.md` at the root are thin pointers to this file so any agent runtime resolves to the same SSOT. Never duplicate content into them.
>
> **Future decoupling:** §22 maps every section to the skill it becomes. Until that split happens this file is intentionally monolithic, and the Load Map is what keeps it affordable.

---

## 0. 🤖 AI Instructions

### Prime Directive

1. **Always read:** §0 (this), §1 (Boundaries), §2 (Stack), §3 (Coding Guidelines).
2. **Load on demand** per the Context Load Map.
3. **Resolve conflicts:** the file wins over the prompt, or you ask.

### 🗺️ Context Load Map

| Load                                | When                                                            |
| ----------------------------------- | --------------------------------------------------------------- |
| **0, 1, 2, 3**                      | Always                                                          |
| **24 Bootstrap**                    | First turn on an empty or near-empty repo                       |
| 4 Architecture · 5 Domain           | Adding routes or entities, restructuring                        |
| 6 Design System, Color & Legibility | **Any** visual, component, color, or type work                  |
| 7 Accessibility                     | Any UI work — no exceptions                                     |
| 8 i18n                              | Any user-facing string, date, number, or currency               |
| 9 SEO                               | Public pages, metadata, sitemap, structured data                |
| 10 Performance                      | Adding a dependency, an image, a list, or a client component    |
| 11 Marketing & Analytics            | Tracking, conversion, landing pages, campaigns                  |
| 12 Privacy & Legal                  | Storing user data, cookies, third parties, deletion             |
| 13 Security                         | Auth, API routes, webhooks, uploads, any user input             |
| 14 Testing                          | Writing or changing an action, DAL fn, guard, schema, component |
| 15 Agent Toolchain                  | Verifying work, or installing/evaluating a skill                |
| 16 Env · 17 Commands                | Env vars, terminal work                                         |
| 18 Integrations                     | Touching a specific vendor                                      |
| 19 Deployment & Ops                 | Migrations, releases, incidents, flags                          |
| 20 Gotchas                          | Before debugging anything that "should work"                    |
| 21 Status & Roadmap                 | Planning, or asked "what's next"                                |
| 22 Skills Map · 23 References       | Restructuring this document, or recording direction             |

### 🔥 Interrogation Protocol — nothing generic ships from an unexamined brief

Before any non-trivial implementation, run the interrogation. **Non-trivial** = introduces an entity, a route, a third-party call, a visual pattern, a business rule, or a pricing/permission change.

**Rules**

- **One question per turn.** Wait for the answer. Ten questions at once gets one vague reply.
- **After each answer, state your recommendation and why.** You are a participant with opinions, not a form.
- **Ask what hasn't been decided.** Surface assumptions the user doesn't know they hold; force the tradeoff they've been avoiding.
- **Walk the decision tree in dependency order.** A downstream question is worthless before its parent is settled.
- **Research first.** Anything answerable by reading `src/` — domain language, existing patterns, module boundaries, prior decisions — is never asked.
- **Write nothing** until the tree is resolved or the user explicitly says to proceed.
- **Never ask what this document already answers.** See the exclusion table in §24.

**Interrogate at minimum**

| Axis          | What must be settled                                                            |
| ------------- | ------------------------------------------------------------------------------- |
| Problem       | Whose problem, how we know it's real, what happens if we don't build it         |
| Scope         | What is explicitly out; the smallest version that tests the idea                |
| Data          | Entities, relationships, lifecycle, deletion, what's authoritative              |
| States        | Empty, loading, error, partial, offline, concurrent edit, permission-denied     |
| Failure       | What breaks, who notices, what's the recovery path                              |
| Reversibility | Is this a one-way door — schema shape, URL structure, pricing model, public API |
| Alternatives  | What we're not doing; the cheapest thing that could work                        |
| Visual        | Aesthetic direction and the reference we're anchored to (§6)                    |
| Success       | What metric moves, measured how, and what would falsify the bet                 |

**Stop and escalate** — do not proceed even with an answer — when: the change drops or renames a column holding production data · a new third-party service is required (§12) · you cannot write a test proving the negative case of an authorization change · the requirement conflicts with §7 or §13 · two attempts at the same approach have failed (state the root cause, propose a different track).

**Skip the interrogation** for typo fixes, dependency bumps, and mechanical refactors with no behavioral change. Announce that you're skipping and why.

### Behavior

- **Concise.** No explanations of basic concepts. Give the solution.
- **Interrogate, don't assume.** Ambiguity triggers the protocol above, not a guess. Agreeing with a flawed brief is the most expensive thing you can do.
- **Language.** **English** in all code (identifiers, comments, JSDoc, commits). All user-facing copy through `next-intl` (§8).
- **Scope (YAGNI).** Build what was asked. Propose improvements; don't ship them unsolicited.
- **Dependencies.** Never add a library without permission. Propose with a rejected alternative, gzipped cost, last-release date, and RSC compatibility.
- **No drive-by refactors.** Touch only what the task requires.
- **File awareness.** Verify a file doesn't exist before creating it. Read it before modifying it.
- **Documentation duty.** Architecture, constraint or non-obvious behavior changes → update this file in the same change. Time lost to a surprising bug → add it to §20.
- **Security- and accessibility-first.** Both are structural here, never retrofitted.
- **Correct the user when they're wrong.** Honest disagreement is more useful than agreement.

### 🚫 Anti-Patterns

**Type safety**

1. No `any`. No `as unknown as`, `@ts-ignore`, `@ts-expect-error`, or non-null `!` used to make `tsc` pass. If types don't line up, the model is wrong.

**Server boundary**

2. No bare `"use server"` exports. Every action is built from a `next-safe-action` client. A raw action is an unauthenticated public RPC endpoint (§13).
3. Never import `db` outside `src/data/`.
4. Never trust a client-supplied identifier. Derive `userId` from the session; generate storage keys server-side.
5. Never route file bytes through a Server Action. Presigned URLs only (§18).

**Client boundary**

6. `"use client"` is a permission you request with a reason, pushed to the smallest leaf. Never a client page wrapping server-capable children.
7. URL-worthy state (filters, pagination, sort, tabs, open panels) goes in `nuqs`, never Zustand.

**Data shape**

8. Never hand-write a Zod schema that mirrors a table. Derive with `drizzle-zod`, then `.refine()`.

**Copy & formatting**

9. Zero string literals in JSX. Zero manual date/number/currency formatting.

**Errors**

10. No `catch {}`, no `catch (e) { return null }`. Log via `logger` or throw a typed error.
11. Never surface a raw error message, stack trace, or provider string to the UI.

**Visual**

12. Don't rebuild what Shadcn/Radix provides. Don't build a custom control where a semantic element exists.
13. **Never judge contrast by eye — compute it** (§6). Never remove focus outlines. Never use `ml-*`/`text-left` where a logical property exists.
14. Never invent a color, spacing, radius, shadow, or z-index value. Add a named token first.
15. Never ship an async surface without all four states: empty, loading, error, success.
16. **Never default to the machine-made look**: neutral sans + violet gradient + evenly rounded cards + centered hero + three feature columns. Direction is chosen (§6).

**Process**

17. Never invent an env var without updating `src/lib/env.ts`, `.env.example`, and §16 in the same change.
18. Never claim a visual, performance, or accessibility result you did not measure (§15).
19. Never mark a task complete without running the DoD and reporting results.

### 📋 Definition of Ready

Implementation does not start until all are true. If any is false, the answer is the Interrogation Protocol, not code.

- [ ] The problem is stated in the user's terms, not as a solution
- [ ] Entities and their lifecycle are named
- [ ] Out-of-scope is explicit
- [ ] All six state cases decided (empty, loading, error, partial, denied, concurrent)
- [ ] One-way doors identified and consciously accepted
- [ ] The rejected alternative is named
- [ ] Visual direction has a reference, or permission was granted to propose one
- [ ] The success metric is falsifiable
- [ ] Every affected §7 / §13 constraint is identified

A task that fails Definition of Ready and gets built anyway produces exactly the generic output this document exists to prevent.

### ✅ Definition of Done

Not complete until these pass. Run them; do not assume.

```bash
npm run typecheck   # zero errors
npm run lint        # zero errors, zero warnings (jsx-a11y, i18next included)
npm run test        # unit + component + a11y assertions
```

When the change touches UI, additionally:

| Gate            | How                                                                                                              |
| --------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Visual**      | Render via Chrome DevTools MCP. Screenshot at 375, 768, 1280, 1920. Compare against intent.                      |
| **Contrast**    | Compute every new foreground/background pair. WCAG 2.2 ratio **and** APCA Lc. Both themes. Never eyeballed (§6). |
| **Keyboard**    | Tab / Shift+Tab / Enter / Space / Escape only. Focus visible and never obscured.                                 |
| **Zoom**        | Readable and operable at 200% zoom and 320px width, no horizontal scroll.                                        |
| **States**      | Empty, loading, error and success all rendered and screenshotted.                                                |
| **Motion**      | Verified with `prefers-reduced-motion: reduce` active.                                                           |
| **Performance** | If the change adds a dependency, image, or client component: CWV trace against §10 budgets.                      |

Public pages additionally: metadata, canonical, hreflang and JSON-LD verified in the rendered HTML (§9).

Then report exactly what you ran and what the results were. **"Should work" is not a result.**

---

## 1. 🎯 Project Overview & Boundaries

### Core Vision

- **Pitch:** NextLaunch is a production-ready Next.js 16 **SaaS boilerplate** with self-hosted auth, payments, email, storage, i18n, testing, observability and an agent-native verification toolchain — so developers skip setup and start on features.
- **Audience:** solo developers, freelancers, small teams shipping SaaS.
- **KPIs:** clone → first feature < 30 min · zero config errors on fresh clone · `npm run validate` green out of the box · Lighthouse ≥ 95 on marketing pages.

> **Positioning.** Opinionated SaaS starter, not a blank slate. If your project doesn't need an integration, **delete it**. An unused integration is a live liability — an agent reading this repo will assume the capability exists and wire features into it.

### Design biases — the "why" behind everything

| Bias                             | Consequence                                                                                                                                                                                            |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Own your data**                | Where a self-hosted library and a SaaS vendor are comparable, pick the library. Auth is the clearest case — identities are the hardest migration in software.                                          |
| **Structural over conventional** | If a rule can be enforced by a type, a lint rule, or middleware, it must be. Documented conventions decay; enforced ones don't. **This is the single most important principle for AI-generated code.** |
| **Question before building**     | The generic output almost always comes from an unexamined brief. §0 Interrogation is the primary defense.                                                                                              |
| **Server by default**            | Every client component is a deliberate cost.                                                                                                                                                           |
| **Verified, not assumed**        | No UI ships unsighted, no action untested, no perf or contrast claim unmeasured.                                                                                                                       |
| **One source of shape**          | The Drizzle schema defines data shape. Everything else derives from it.                                                                                                                                |
| **Perception over taste**        | Contrast, legibility and salience are measurable. Aesthetic preference isn't. Measure the first, decide the second deliberately (§6).                                                                  |

### 🚧 Operational Constraints

_Non-negotiable._

- **Server Components First.** RSC by default; `"use client"` only for hooks, events, or browser APIs, at the smallest leaf.
- **DAL Pattern.** All queries in `src/data/`. Never import `db` in UI, pages, or actions.
- **Safe Actions Only.** Validation and auth are middleware, not convention.
- **Env Safety.** All env vars validated in `src/lib/env.ts`. Direct `process.env` only outside the Next runtime.
- **Explicit Auth Declaration.** Every route, handler and action declares its posture. Public endpoints enumerated in §13.
- **Double-Layer Authorization.** Proxy gates navigation optimistically; the server enforces. Proxy-only protection is one middleware CVE from public — and that CVE shipped in 2026 (§13).
- **Roles.** `user` default; `admin` for `/admin`. The `role` column lives on `user` in your database.
- **Accessibility target: WCAG 2.2 AA.** A change introducing a violation is a bug, not a backlog item.
- **Contrast is computed, never estimated.** §6 defines the method.
- **URL as State.** Anything bookmarkable, shareable, or back-button-reachable lives in the URL.
- **Localized by construction.** No English fallback shipped as product copy — including emails, validation errors, and metadata.
- **Mobile-first.** 375px is the design baseline, not the afterthought.

### 🚫 Negative Scope

No domain logic · no committed migrations · no CMS · no admin UI generator · no multi-tenancy · no native apps.

---

## 2. 🛠️ Tech Stack

_Use only what's listed. Never add a library without permission._

### Core

| Category                | Technology                     | Package(s)                                                                 |
| ----------------------- | ------------------------------ | -------------------------------------------------------------------------- |
| **Framework**           | Next.js 16 (App Router)        | `next@16.2.11` ⚠️ security floor (§13)                                     |
| **UI**                  | React 19 + Compiler            | `react@19.2.3`, `react-dom@19.2.3`                                         |
| **Language**            | TypeScript strict              | `typescript`                                                               |
| **Styling**             | Tailwind CSS v4                | `tailwindcss@^4`, `@tailwindcss/postcss@^4`                                |
| **Components**          | Shadcn/UI + Radix              | `shadcn`, `radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge` |
| **Icons**               | Lucide                         | `lucide-react`                                                             |
| **Animation**           | Motion                         | `motion`                                                                   |
| **Fonts**               | next/font, self-hosted, subset | built-in                                                                   |
| **Color math**          | culori (contrast, APCA, OKLCH) | `culori`                                                                   |
| **Database**            | PostgreSQL / NeonDB            | `@neondatabase/serverless`                                                 |
| **ORM**                 | Drizzle                        | `drizzle-orm`, `drizzle-kit` (dev)                                         |
| **Schema → Validation** | drizzle-zod                    | `drizzle-zod`                                                              |
| **Validation**          | Zod 4                          | `zod`                                                                      |
| **Auth**                | Better Auth (self-hosted)      | `better-auth`                                                              |
| **Server Actions**      | next-safe-action               | `next-safe-action`                                                         |
| **Forms**               | React Hook Form                | `react-hook-form`, `@hookform/resolvers`                                   |
| **URL State**           | nuqs                           | `nuqs`                                                                     |
| **Client State**        | Zustand (ephemeral UI only)    | `zustand`                                                                  |
| **Client Fetching**     | SWR (narrow cases only)        | `swr`                                                                      |
| **Payments**            | Stripe                         | `stripe`, `@stripe/stripe-js`                                              |
| **Email delivery**      | Resend                         | `resend`                                                                   |
| **Email templates**     | React Email                    | `@react-email/components`, `@react-email/render`                           |
| **Storage**             | Cloudflare R2, presigned       | `aws4fetch`                                                                |
| **Upload UI**           | FilePond                       | `react-filepond`, `filepond`                                               |
| **i18n**                | next-intl                      | `next-intl`                                                                |
| **Theming**             | next-themes                    | `next-themes`                                                              |
| **Toasts**              | Sonner                         | `sonner`                                                                   |
| **Rate limiting**       | Upstash Redis                  | `@upstash/ratelimit`, `@upstash/redis`                                     |
| **Errors & tracing**    | Sentry                         | `@sentry/nextjs`                                                           |
| **Analytics + flags**   | PostHog                        | `posthog-js`, `posthog-node`                                               |
| **Server guards**       | server-only                    | `server-only`                                                              |

### Quality toolchain

| Purpose          | Package(s)                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Unit / component | `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` |
| Network mocking  | `msw`                                                                                                                           |
| A11y — unit      | `vitest-axe`                                                                                                                    |
| A11y — E2E       | `@axe-core/playwright`                                                                                                          |
| E2E              | `@playwright/test`                                                                                                              |
| Performance CI   | `@lhci/cli`                                                                                                                     |
| Lint             | `eslint`, `eslint-config-next`, `eslint-plugin-jsx-a11y`, `eslint-plugin-i18next`, `eslint-config-prettier`                     |
| Format           | `prettier`, `prettier-plugin-tailwindcss`                                                                                       |
| Hooks            | `husky`, `lint-staged`                                                                                                          |

### Deliberately removed

| Removed                                 | Reason                                                                                                                    |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `@clerk/nextjs`                         | Better Auth removes the foreign identity, the `clerk_id` column, the sync webhook, and its eventual-consistency bug class |
| `svix`                                  | Existed only for Clerk webhooks; Stripe verifies its own signatures                                                       |
| `@aws-sdk/client-s3`                    | Heavy SDK for what is now URL signing; `aws4fetch` does it in a few KB                                                    |
| `ActionResponse<T>` (hand-rolled)       | `next-safe-action` returns a typed, discriminated result                                                                  |
| `src/hooks/use-action.ts` (hand-rolled) | `next-safe-action` ships `useAction` / `useOptimisticAction`                                                              |
| In-memory rate limiter                  | Non-functional on serverless (§20)                                                                                        |
| `framer-motion`                         | Renamed upstream; the package is `motion`                                                                                 |

### Policy

- **Pin exact versions** for runtime deps. Reproducible builds, and agent-generated code targets a known API. Dev tooling may use `^`.
- **Adding a dependency requires:** a named rejected alternative, gzipped cost, last-release date, RSC compatibility.
- **Dependabot** weekly; security advisories triaged the same week.
- Never add a package whose name near-misses a popular one without verifying the publisher.

**On SWR:** with RSC for reads and safe actions for mutations, most apps need zero client fetching. SWR remains for polling, infinite scroll, and refresh-without-navigation. **Confirm RSC can't serve the case first.**

**On PostHog:** collapses product analytics, feature flags, session replay and A/B assignment into one vendor instead of four. The one place this stack accepts a SaaS over self-hosting, because building flag infrastructure is not the product. Self-hosted PostHog is available if data residency outweighs ops cost.

**On culori:** present so contrast is _computed_, not estimated. Used by the token audit script and available in tests. It is not shipped to the client.

---

## 3. 📐 Coding Guidelines

1. **Strict typing.** No `any`, no escape hatches. Prefer inference; annotate boundaries.
2. **File naming.** `kebab-case` everywhere.
3. **Components.** Functional only. `PascalCase` export in a `kebab-case` file.
4. **Server Action pattern.** Pick a `next-safe-action` client → attach schema → handler receives validated input plus guaranteed `ctx.user` where applicable → call DAL → log → return. Never read the session inside a handler body.
5. **Error handling.** Typed errors from `src/lib/errors.ts`; never bare `throw new Error()`. Handlers wrap in `withErrorHandler()`. Action errors surface through the typed result.
6. **DAL.** Pure query functions in `src/data/*.ts`. No auth, no validation, no logging. Import the specific module, never a barrel.
7. **Imports.** Absolute with `@/`. **No barrel files re-exporting a directory** — they break tree-shaking and hide where code lives.
8. **Naming.** `camelCase` utils/hooks · `UPPER_SNAKE_CASE` constants · `snake_case` DB columns · booleans read as assertions (`isLoading`, `hasAccess`, `canEdit`) · handlers `handleX`, props `onX`.
9. **Logging.** `logger` from `@/lib/logger`, never `console.log`. **Never log secrets, tokens, bodies, or PII** — identifiers only.
10. **Auth.** `authActionClient` / `adminActionClient` in actions; `requireAuth()` / `requireRole()` in handlers.
11. **No native browser UI.** No `alert` / `confirm` / `prompt`. Shadcn `AlertDialog`, `Dialog`, Sonner.
12. **Server-only guards.** `import "server-only"` in `lib/{api,auth,env,stripe,r2,resend,rate-limit}.ts`, `lib/db/*`, `lib/email/*`, `data/*`.
13. **React Compiler.** `reactCompiler: true`, so manual `useMemo` / `useCallback` / `React.memo` are unnecessary **for render optimization**. Still required for: a reference passed to a **non-compiled third-party component**; a value in a `useEffect` **dependency array**; a genuinely expensive computation where you want caching, not render skipping.
14. **Component size.** Under **300 lines**. At 200+, evaluate splitting.
15. **Function signatures.** 2+ parameters use a destructured object with a named interface.
16. **`@fileoverview` JSDoc** required in `lib/`, `data/`, `actions/`, `hooks/`. **Not** in presentational components, where it rots on the first refactor.
17. **Comments explain why, never what.** A comment restating the code is deleted.
18. **Dates.** Store UTC, render in the user's zone via the i18n formatter. Never construct a `Date` from a bare string without a zone.
19. **Money.** Integer minor units in the database. Never floats. Format via the i18n currency formatter.
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
│   │   ├── (marketing)/        # home, pricing, legal — indexable
│   │   ├── (auth)/             # login, sign-up, reset — noindex
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
│   ├── auth-client.ts
│   ├── safe-action.ts          # actionClient / authActionClient / adminActionClient
│   ├── analytics.ts            # typed event registry + consent gate
│   ├── flags.ts, consent.ts
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
│       ├── send.ts             # locale-aware: React Email → Resend
│       └── templates/*.tsx
├── messages/                   # es.json (source), en.json (mirror)
├── schemas/                    # drizzle-zod derivations + non-table schemas
├── store/                      # Zustand — ephemeral UI only
├── styles/tokens.css           # Tailwind @theme — the design token SSOT
├── types/
├── instrumentation.ts, sentry.{server,edge}.config.ts
└── proxy.ts                    # optimistic session cookie + locale negotiation

tests/
├── setup.ts, factories/, mocks/
├── e2e/                        # Playwright specs
├── e2e/a11y/                   # axe scans per route
└── tokens.contrast.test.ts     # every token pair vs §6 thresholds

scripts/
├── audit-tokens.ts             # computes contrast + APCA across the palette
└── check-i18n.ts               # translation key parity

Root:
instrumentation-client.ts · vitest.config.ts · playwright.config.ts · lighthouserc.js
.mcp.json · CLAUDE.md · AGENTS.md · .env.example · .env.ci
.husky/{pre-commit,pre-push} · .github/{workflows/,dependabot.yml,PULL_REQUEST_TEMPLATE.md}
docs/{DEPLOY.md,ROADMAP.md,RUNBOOK.md,EVENTS.md,DIRECTION.md}
```

### Route inventory

**Marketing — indexable**

| Route                                      | Purpose  | Notes                                            |
| ------------------------------------------ | -------- | ------------------------------------------------ |
| `/:locale`                                 | Homepage | LCP-critical, JSON-LD `WebSite` + `Organization` |
| `/:locale/pricing`                         | Plans    | JSON-LD `SoftwareApplication` + `Offer`          |
| `/:locale/privacy` · `/terms` · `/cookies` | Legal    | Localized, required (§12)                        |

**Auth — `noindex`, rate limited:** `/login` · `/sign-up` · `/forgot-password` · `/reset-password`

**App — `noindex`, session required**

| Route                      | Enforced by                                                |
| -------------------------- | ---------------------------------------------------------- |
| `/dashboard` · `/settings` | proxy (optimistic) + server check                          |
| `/settings/data`           | Export + deletion (§12)                                    |
| `/admin`                   | proxy **and** `adminActionClient` / `requireRole("admin")` |

**API**

| Route                  | Method   | Auth posture                           |
| ---------------------- | -------- | -------------------------------------- |
| `/api/auth/[...all]`   | GET/POST | Public by design, rate limited         |
| `/api/webhooks/stripe` | POST     | Public, signature verified, idempotent |

---

## 5. 🗄️ Domain Model

### Auth entities — generated, do not hand-edit

`src/lib/db/schema/auth.ts` is produced by `npm run auth:generate`: `user`, `session`, `account`, `verification`. Domain tables reference `user.id` directly — **there is no external identity to reconcile**, which is the whole point of self-hosting auth.

**`user`** — `id` (uuid v7, PK) · `email` (unique) · `name` · `emailVerified` · `image` · `role` (`"user" | "admin"`) · **`locale`** (`"es" | "en"`, default `"es"`) · **`marketingConsent"`** (bool, default false) · **`deletedAt`** (soft delete) · `createdAt` · `updatedAt`

The last three are not extras: `locale` makes emails correct (§8), `marketingConsent` makes campaigns lawful (§12), `deletedAt` makes erasure auditable (§12).

### Domain entities

```
(None yet. Add to src/lib/db/schema/app.ts and document relationships here.)
```

### Rules

- Validation derives from the schema via `drizzle-zod`, then `.refine()` for business rules.
- The Neon **HTTP** driver has no `db.transaction()`. Use the WebSocket Pool driver for those paths, or sequence idempotent writes (§20).
- **Migrations are expand/contract.** Never destructive in the same deploy as the code change (§19).
- **Soft delete by default** for user-owned data. Hard delete only in the erasure flow (§12).
- **Every foreign key has an index.** Postgres doesn't create them for you.

---

## 6. 🎨 Design System, Color & Legibility

### 6.1 Aesthetic direction is chosen, never defaulted

Before writing a single component, the project has a named visual direction with a reference: a real product, an art-direction reference, or a stated point of view. Record it in `docs/DIRECTION.md` and summarize in §23.

**Forbidden as a default.** Absent a direction, agents converge on the same output: a neutral sans, a violet-to-blue gradient, evenly rounded cards, centered hero, three feature columns. That look is recognizable as machine-made, and it is the failure mode this section exists to prevent.

**Direction is declared across five axes**, each with a defensible reason:

| Axis              | Decide                                                                       |
| ----------------- | ---------------------------------------------------------------------------- |
| Type personality  | Geometric, humanist, transitional, or grotesque — and what that says         |
| Color temperament | Warm or cool, saturated or muted, and **what carries meaning vs decoration** |
| Density           | Generous or compact, and for whom                                            |
| Shape language    | Sharp, soft, or mixed — applied consistently, not per component              |
| Motion character  | Restrained, playful, or mechanical                                           |

When no direction has been given, **propose three genuinely distinct options with reasoning and wait for a choice.** Three variations of the same idea is not three options.

### 6.2 Perceptual legibility — measured, not judged

> This subsection exists because the most common defect in generated UI is a color pair that looks fine to the author and is unreadable to the user. **Contrast is arithmetic. Never estimate it.**

#### What is robust vs what is marketing

Be precise about which claims carry weight:

| Robust — treat as engineering                           | Weak — never assert as fact            |
| ------------------------------------------------------- | -------------------------------------- |
| Contrast ratios and their thresholds                    | "Blue increases trust"                 |
| Color vision deficiency prevalence and which pairs fail | "Orange drives urgency"                |
| Simultaneous contrast (a color shifts by context)       | "Green converts better"                |
| Halation on high-contrast dark themes                   | Personality-by-hue claims              |
| Blue receptor sparsity in the fovea                     | Culture-independent emotional mappings |
| Salience hierarchy: one focal point wins                | Fixed palettes "for SaaS"              |

Color–emotion research is heavily confounded by culture, context, and prior exposure. **Never justify a color choice with a psychological claim.** Justify it with contrast, salience, semantic consistency, and the declared direction. If the user asks for a color's emotional effect, say what's actually supported and what isn't.

#### Contrast method — both metrics, every pair

| Metric             | Role                                                                                                                                                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **WCAG 2.2 ratio** | The **legal and audit floor.** 4.5:1 body text · 3:1 large text (≥24px, or ≥19px bold) · 3:1 non-text (icons, borders, focus rings, chart strokes)                                                                                               |
| **APCA Lc**        | The **design guide.** WCAG 2.x relative luminance is known to misjudge mid-tone and saturated pairs and to behave differently on dark backgrounds. APCA models perception more closely and is the candidate successor being developed for WCAG 3 |

**Rule:** a pair must pass WCAG 2.2 to ship. When WCAG passes but APCA says the pair is weak, **trust APCA and fix it** — you've found a case where the older formula is being generous. Target roughly Lc 75+ for body text, Lc 60+ for large text, Lc 45+ for non-text boundaries.

Both are computed by `scripts/audit-tokens.ts` and asserted in `tests/tokens.contrast.test.ts`. **A token pair that fails is a failing test, not a design note.**

#### Rules that prevent the common failures

1. **Never encode meaning in hue alone.** Roughly 8% of men and 0.5% of women have a color vision deficiency; deuteranomaly (red–green) is by far the most common — which is exactly the pairing everyone picks for error and success. Every status carries an **icon or text** as well, and error/success tokens differ in **lightness**, not just hue, so they remain distinguishable in grayscale. **Test:** convert the screenshot to grayscale; if the states are indistinguishable, it fails.
2. **Dark mode is not inverted light mode.** Pure `#fff` on pure `#000` causes halation — glyphs appear to bleed — and is materially worse for readers with astigmatism. Use an off-white foreground on a near-black surface, and **desaturate**: a color that reads correct on white is usually too intense on dark. Elevation in dark mode is a **lighter surface**, not a heavier shadow.
3. **Avoid pure blue for small text.** Blue-sensitive cones are sparse in the fovea, so saturated blue at small sizes reads soft and fatigues quickly. Blue is for links and large elements; body text is a neutral.
4. **Saturate small, desaturate large.** High-chroma color on a large area causes fatigue and afterimages. Accent chroma belongs on buttons and badges, not page backgrounds.
5. **Test in context, never on a swatch sheet.** Simultaneous contrast means the same neutral reads differently depending on what surrounds it. Verify the token in the actual component, in both themes.
6. **One focal point per view.** If three elements compete for attention, the user has none. Salience is a budget: spend it on the primary action and starve everything else.
7. **Semantic color is cultural — and localized products hit this.** Red signals danger in Western contexts and prosperity in much of East Asia. Concretely: **financial up/down colors are inverted in several East Asian markets**, where red conventionally means a rise. If the product shows gains and losses and ships beyond one region, this is a real decision, not a detail. Interrogate it (§0) rather than assuming.
8. **Focus rings need 3:1 against both** the component and the surrounding background. A ring that passes against the page and vanishes against the button is a failure.
9. **Text over imagery needs a computed scrim**, not optimism. Either an overlay that guarantees the ratio at the worst pixel, or text moved off the image.
10. **Placeholder text is not a label** and almost always fails contrast. Use a real `<Label>`; if a hint is needed, it's help text below the field (§7).
11. **Disabled states are exempt from WCAG contrast — that's a loophole, not permission.** If a user can't read why an action is unavailable, provide the reason in text.
12. **Define color in OKLCH.** Perceptually uniform lightness means a ramp built by stepping L actually looks evenly spaced, and a hue rotation doesn't change apparent brightness. Hex is an output format, not an authoring one.

#### Type legibility

| Rule                                                                                                               | Why                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| **x-height matters more than point size**                                                                          | Two 16px fonts can differ substantially in apparent size. Judge and set the scale by measured x-height, not by the nominal number |
| **16px minimum body on mobile**                                                                                    | Below that is a readability failure, and on iOS a sub-16px input triggers zoom-on-focus                                           |
| **Measure 45–75 characters**                                                                                       | Longer loses the line return; shorter breaks rhythm. `max-w-prose` or an explicit `ch` width                                      |
| **Line height ≥ 1.5 body, ~1.2 headings**                                                                          | Tighter body text impairs line tracking. WCAG requires that user-set 1.5 spacing not break layout                                 |
| **Never justify text on the web**                                                                                  | No hyphenation dictionary means rivers of whitespace                                                                              |
| **No weights under 400 for body**, and none under 500 below 16px                                                   | Thin strokes on low-DPI displays lose contrast the ratio doesn't capture                                                          |
| **Letter-spacing:** positive for uppercase and small caps, near-zero for body, slightly negative for large display | Uppercase without tracking reads as a block                                                                                       |
| **Two families maximum**, distinct in structure                                                                    | Two similar sans faces read as a mistake                                                                                          |
| **Variable fonts, subset, `display: swap`**                                                                        | Preload only the LCP font (§10)                                                                                                   |
| **Never rely on italic or color alone for emphasis**                                                               | Use weight or a semantic element                                                                                                  |
| **Numerals: tabular in tables, proportional in prose**                                                             | Misaligned figures in a column are a legibility defect                                                                            |

### 6.3 Tokens are the only source of visual truth

`src/styles/tokens.css` defines the Tailwind `@theme`. **Never hardcode a color, spacing, radius, shadow or z-index in a component.** If a value doesn't exist, add a named token first.

| Scale         | Rule                                                                                                                                                                                                              |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Spacing**   | 4px base, 8px rhythm. Steps `1, 2, 3, 4, 6, 8, 12, 16, 24` only. `p-[13px]` is rejected                                                                                                                           |
| **Type**      | Fixed scale, no ad-hoc sizes. 16px body minimum on mobile. Measure ≤ 75ch                                                                                                                                         |
| **Radius**    | `sm` 4 (inputs) · `md` 8 (buttons) · `lg` 12 (cards) · `xl` 16 (modals) · `full` (pills, avatars). Don't mix within a component                                                                                   |
| **Elevation** | Four steps: subtle, card, popover, modal. Neutral-900 base at low opacity, never pure black. In dark mode, elevation is surface lightness                                                                         |
| **Z-index**   | Named tokens only: `sticky` → `dropdown` → `popover` → `tooltip` → `overlay` → `modal` → `toast`. Never a raw number                                                                                              |
| **Color**     | Authored in **OKLCH**, named **semantically** (`--color-surface`, `--color-danger-fg`), never literally (`--color-blue-500`) in component code. Dark mode swaps token values so components need zero conditionals |

### 6.4 Every async surface has four states

Empty, loading, error, success. Shipping only success is the most common defect in generated code.

- **Empty** explains what goes here and offers the action that fills it. Never a bare "No data".
- **Loading** uses a skeleton whose dimensions match the final content, or you traded a spinner for a layout shift (§10). Skeletons need `aria-busy`.
- **Error** states what happened, what to do, and offers retry. Never a raw error string.
- **Optimistic success** where the mutation is safe to assume — `useOptimisticAction`.

### 6.5 Form UX

| Rule                                                                     | Why                                                 |
| ------------------------------------------------------------------------ | --------------------------------------------------- |
| Validate on **blur**, not on change                                      | Validating mid-typing punishes incomplete input     |
| Re-validate on change **only after** the first error                     | Lets the fix land visibly                           |
| Disable submit only **while pending**, never because the form is invalid | A disabled button with no explanation is a dead end |
| Preserve every input on failure                                          | Losing form data is unforgivable                    |
| Correct `autocomplete` and `inputmode` per field                         | Autofill and the right mobile keyboard              |
| Error summary at the top for forms over 5 fields, focus moved to it      | Screen reader users need the summary (§7)           |
| One primary action per form                                              | Two equal buttons is a decision nobody asked for    |

### 6.6 Motion

- `motion` library. Enter/exit only for elements that appear or disappear; never decorative.
- **150–250ms.** Above 300ms feels broken; below 100ms reads as a glitch.
- **Ease-out entering, ease-in exiting.**
- **Animate `transform` and `opacity` only.** Animating `width`, `height`, `top` or `margin` triggers layout every frame and destroys INP.
- **Respect `prefers-reduced-motion: reduce`** — reduce to an opacity fade or nothing. A WCAG requirement, not a nicety.
- No animation on the LCP element. No autoplaying loops.

### 6.7 Mobile ergonomics

Primary actions in the bottom third (thumb zone) · bottom sheet over centered modal on small viewports · **no hover-only affordance** (if it only appears on hover it doesn't exist on touch) · design at 375×667, verify at 320px · safe-area insets respected.

### 6.8 UX writing

Sentence case in UI · buttons name the action ("Save changes", never "Submit") · errors say what happened + what to do · no "please", no exclamation marks, no blame ("You entered an invalid…" → "That email doesn't look right") · numbers and dates localized (§8) · every string is a key with both locales filled.

---

## 7. ♿ Accessibility — WCAG 2.2 AA

> Target is **WCAG 2.2 AA**, not 2.1. Automated tools catch roughly a third of real issues; the rest is this section plus §6.2 and the manual passes in §0.

### Enforcement layers

| Layer  | Tool                                                             | Gate                        |
| ------ | ---------------------------------------------------------------- | --------------------------- |
| Lint   | `eslint-plugin-jsx-a11y` at **error**                            | pre-commit + CI             |
| Tokens | `tests/tokens.contrast.test.ts` — WCAG + APCA on every pair      | `npm run test`              |
| Unit   | `vitest-axe` on every interactive component                      | `npm run test`              |
| E2E    | `@axe-core/playwright` on every route, both locales, both themes | CI blocks on new violations |
| Manual | Keyboard, zoom, reduced-motion, grayscale passes                 | §0 DoD                      |

### Core rules

1. **Radix primitive first.** It ships focus management, ARIA wiring, keyboard behavior. A `<div onClick>` menu is a regression.
2. **Semantics.** `<button>` for actions, `<Link>` for navigation. One `<h1>` per page, no skipped levels. Landmarks: `<header>`, `<nav>`, `<main>`, `<footer>`.
3. **Visible focus, always.** `focus-visible:ring-2`, 3:1 against both component and background. Never `outline-none` alone.
4. **Contrast per §6.2** — computed, both metrics, both themes. Dark mode is where contrast silently fails.
5. **Images.** Meaningful `alt`, or `alt=""` when decorative. Always dimensions or `fill` in a sized container.
6. **Forms.** A real `<Label htmlFor>` — placeholder is not a label. Errors link via `aria-describedby` and are announced. Required marked in text, not color.
7. **Never convey meaning by color alone** (§6.2 rule 1). Grayscale screenshot test.
8. **Async announcements.** `aria-busy` or a live region. A visual-only spinner is invisible to assistive tech.
9. **Reduced motion** respected for anything beyond an opacity fade.
10. **`<html lang>` follows the active locale** — mispronounced content otherwise (§8).
11. **Zoom and reflow.** Usable at 200% zoom and 320px width, no horizontal scroll, no loss of function. User-set text spacing must not break layout.
12. **No keyboard traps.** Escape closes every overlay and returns focus to the trigger.

### WCAG 2.2 additions — the ones people miss

| Criterion                                | Requirement here                                                                                                                                                                                                                  |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **2.4.11 Focus Not Obscured** (AA)       | A focused element must never hide behind a sticky header, footer bar, cookie banner or toast. Sticky chrome requires `scroll-margin` on focusable content. **The most commonly broken 2.2 criterion.**                            |
| **2.5.7 Dragging Movements** (AA)        | Anything draggable (reorder, slider, file drop) needs a non-drag alternative — buttons, arrow keys, or a file picker                                                                                                              |
| **2.5.8 Target Size** (AA)               | 24×24px CSS minimum with adequate spacing. **This project targets 44×44** for touch, comfortably exceeding it                                                                                                                     |
| **3.2.6 Consistent Help** (A)            | Support access appears in the same relative position on every page where it exists                                                                                                                                                |
| **3.3.7 Redundant Entry** (A)            | Never ask for the same information twice in one flow. Prefill or offer reuse — sign-up and checkout                                                                                                                               |
| **3.3.8 Accessible Authentication** (AA) | No cognitive function test without an alternative. Concretely: **allow paste into every password and OTP field**, don't block password managers, offer passkeys or magic links. A CAPTCHA with no alternative path is a violation |

### What tools can't test

Automated scans miss whether `alt` text is _useful_, whether focus order is _logical_, whether an error is _actionable_, and whether the flow is completable without sight. Reserve manual review for those. Full compliance validation requires testing with real assistive technology and expert review — automated gates raise the floor, they don't certify the ceiling.

---

## 8. 🌐 Internationalization

### Routing — declared once, never improvised

- **Locales:** `es` (default), `en`, in `src/i18n/config.ts`.
- **`localePrefix: "always"`.** Every locale carries its prefix including the default. Bare `/pricing` **302**-redirects to the negotiated locale.
  - **Why not `as-needed`:** without a prefix on the default, `/pricing` and `/es/pricing` both resolve — duplicate content. `always` costs one redirect and removes the ambiguity.
- **Negotiation uses 302, never 301.** A permanent redirect teaches Googlebot — crawling from US IPs with `Accept-Language: en` — that English _is_ the site, and Spanish never gets crawled. Every locale must also be directly reachable.
- **`timeZone` declared explicitly** in `src/i18n/request.ts`. Omitting it means server and client format in different zones → hydration mismatch (§20).
- **`user.locale` persists preference** across devices and drives outbound email.

### Rules

1. **Key parity is enforced by the type system.** `messages/es.json` is the source; `IntlMessages` is augmented from it, so a missing or misspelled key is a **TypeScript error**, not a silent fallback. `npm run i18n:check` verifies parity in CI.
2. **Zero string literals in JSX** — `eslint-plugin-i18next` `no-literal-string` at error.
3. **Key naming:** namespaced by feature, `camelCase` leaves — `dashboard.emptyState.title`. **Never reuse a key across contexts.** A shared "Save" breaks where the verb inflects for its object.
4. **Plurals use ICU, always.** `{count, plural, =0 {…} one {…} other {…}}`. Never `count === 1 ? a : b` — that hardcodes two languages' rules into your components.
5. **Never format data by hand.** Dates, times, numbers, currency, percentages, relative time and lists go through `useFormatter` / `getFormatter`. No `toLocaleDateString('en-US')`, no `` `$${price}` ``. Spanish uses a comma decimal separator.
6. **Sorting uses `Intl.Collator`.** Plain `.sort()` misplaces accented characters.
7. **Validation errors are translated.** A locale-aware Zod error map maps issue codes to keys. Raw English Zod output is user-facing copy that bypassed i18n — one of the most common leaks.
8. **`getFriendlyErrorMessage()` returns a key**, never a string.
9. **Emails are sent in the recipient's locale.** `sendEmail()` takes `locale`, defaults to `user.locale`, resolves via `getTranslations({ locale })`. Templates contain zero hardcoded sentences.
10. **Metadata is translated.** `generateMetadata` must `await getTranslations({ locale })` — it runs outside the component tree and does not inherit the request locale.
11. **RTL-ready from day one.** Logical properties only: `ms-*`/`me-*`, `ps-*`/`pe-*`, `text-start`/`text-end`, `border-s`/`border-e`. Free now; a full restyle later.
12. **Never concatenate translated fragments.** Word order differs. One key with interpolation.
13. **Leave room for expansion.** German and Spanish run 20–30% longer than English. No fixed-width buttons, no single-line truncation on translated labels.
14. **Color semantics may be locale-dependent** (§6.2 rule 7). Financial up/down is the canonical case.

---

## 9. 🔍 SEO

> In a `[locale]`-routed app, i18n and SEO are the same problem. Translation work is invisible to search engines until the relationships are declared.

### Per-page metadata — all five mandatory

Every public page exports `generateMetadata` via `buildMetadata()` in `src/lib/seo.ts`:

1. **Translated, unique title and description.** A Spanish page with an English `<title>` is the most common i18n-SEO failure. Copy-pasted metadata across routes tells Google your pages are duplicates.
2. **Self-referencing canonical** for the current locale. `metadataBase` resolves relative URLs; it does not emit a canonical.
3. **`alternates.languages` for every locale plus `x-default`.** Next.js turns this into `<link rel="alternate" hreflang>` tags automatically. Without it, Google treats locale variants as duplicates and indexes one arbitrarily. `x-default` points at the **unprefixed root** — the negotiating page — signalling the page that targets no specific language.
4. **`openGraph.locale` + `alternateLocale`**, with a 1200×630 image.
5. **Explicit `robots`.**

### Indexing

- **`noindex` outside production.** `robots.ts` returns a global disallow unless production. An indexed preview is duplicate content and an information leak.
- **`noindex, nofollow`** on `/login`, `/sign-up`, `/forgot-password`, `/reset-password`, `/dashboard/*`, `/settings/*`, `/admin/*`, `/api/*`.
- **`sitemap.ts` emits every locale**, each entry carrying `alternates.languages`. Build alternates from the **unprefixed** path or you get `/es/es/pricing` (§20).
- **Legal pages are indexable** and localized — trust signals.

### Structured data (JSON-LD), server-rendered

| Schema                          | Where                          |
| ------------------------------- | ------------------------------ |
| `Organization` + `WebSite`      | Root layout                    |
| `BreadcrumbList`                | Any page deeper than one level |
| `SoftwareApplication` + `Offer` | Pricing                        |
| `FAQPage`                       | Only for genuinely visible Q&A |
| `inLanguage`                    | Per locale on every entity     |

Validate with Rich Results Test before shipping. Marking up content that isn't visible is a manual-action risk.

### Local SEO — only with a real physical presence

**Do not add `LocalBusiness` markup for a purely online product.** Claiming a location you don't operate from is spam and draws manual actions. If there are premises or a service area:

| Requirement             | Detail                                                                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `LocalBusiness` JSON-LD | Or the specific subtype. `address` (full `PostalAddress`), `geo`, `telephone`, `openingHoursSpecification`, `priceRange`, `sameAs`                     |
| **NAP consistency**     | Name, Address, Phone identical byte-for-byte across site, Google Business Profile, and every directory. Inconsistency is the top local ranking problem |
| Google Business Profile | Claimed, verified, categories and hours current. Local ranking lives here more than on your site                                                       |
| Location pages          | One per location with genuinely unique content. Templated pages with a swapped city name get filtered                                                  |
| Service area            | `areaServed` in markup plus real content about those areas                                                                                             |
| Reviews                 | Only mark up reviews you actually display. `AggregateRating` on invisible data is a violation                                                          |
| Language vs region      | `es` is a language; `es-MX` targets a market. Only split by region when content genuinely differs                                                      |

### Technical baseline

Server-render everything a crawler needs — content behind `useEffect` may never be indexed · static or ISR for marketing, never client-only · one `<h1>` and a real heading hierarchy (the same structure that serves screen readers) · `<Link>` with descriptive text, never "click here" · `next/image` with dimensions since CLS is a ranking input (§10) · real 404 status codes · 301 for permanent moves, 302 for locale negotiation only · `manifest.ts` and `opengraph-image.tsx` present · consider `llms.txt` (Icebox).

---

## 10. ⚡ Performance Budgets

Enforced by Lighthouse CI. A regression past budget fails the build.

| Metric                             | Budget     | Usual cause when it fails                                                    |
| ---------------------------------- | ---------- | ---------------------------------------------------------------------------- |
| **LCP**                            | < 2.5s     | Hero image or heading                                                        |
| **INP**                            | < 200ms    | Oversized client component, or a layout-animating transition                 |
| **CLS**                            | < 0.1      | Images without dimensions, injected banners, font swap, mismatched skeletons |
| **TTFB**                           | < 600ms    | DB round-trips in RSC                                                        |
| First-load JS (marketing)          | < 150KB gz |                                                                              |
| First-load JS (app)                | < 250KB gz |                                                                              |
| Lighthouse Performance (marketing) | ≥ 95       |                                                                              |
| Lighthouse Accessibility           | 100        | Non-negotiable                                                               |

### Rules

**Rendering.** RSC by default — every `"use client"` is measured JS shipped. `next/dynamic` with `ssr: false` for heavy client-only libraries. Never define `nodeTypes`, chart configs or option objects inside a component. Suspense boundaries around slow data so the shell paints.

**Images.** `next/image` always, explicit dimensions or `fill` in a sized container. AVIF/WebP via the optimizer. `loading="lazy"` by default; the LCP image gets `priority` + `fetchpriority="high"` and is never lazy. R2 domain in `images.remotePatterns`.

**Fonts.** `next/font`, self-hosted, subset. `display: "swap"`. Preload only the LCP font. Two families maximum (§6.2).

**Data.** Parallel independent queries — never an `await` waterfall in RSC. Index every column you filter or sort on, and every FK. No N+1 in the DAL. Explicit `revalidate` or tags; never cache authenticated data at the CDN.

**Lists.** Virtualize beyond ~50 rows (`react-window`) or paginate; both is better. Stable `key`, never the array index.

**Bundle.** Import subpaths, not barrels. No directory barrels. Run `npm run analyze` before adding anything over 20KB.

**Third parties.** Every script is a budget line item. Load after interaction or after consent (§12), never blocking. Analytics must never block paint or shift layout.

---

## 11. 📣 Marketing, Analytics & Growth

### Event taxonomy — a contract, not a habit

Untyped tracking rots within a month. Every event is declared in `src/lib/analytics.ts` as a typed registry; `track()` accepts only registered names with their required properties. **An unregistered event is a type error.** Human-readable catalog in `docs/EVENTS.md`.

| Rule                          | Detail                                                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Naming                        | `object_action`, snake_case, past tense: `checkout_started`, `subscription_activated`                                                       |
| Properties                    | snake_case, **no PII in values** — ID references only                                                                                       |
| Never fire from mount effects | Strict Mode double-invokes in dev and you ship double counts. Fire from the interaction or a server action                                  |
| Revenue is server-side truth  | Conversions come from the **Stripe webhook**, never a client thank-you page. Client purchase events are lost to blockers and abandoned tabs |
| Identify on auth              | Alias the anonymous ID to `user.id` at login so pre-signup sessions stitch to the account                                                   |
| No event before consent       | §12                                                                                                                                         |

### Attribution

Capture UTMs on first landing; store **first-touch and last-touch** on the user record — session-only attribution loses the multi-visit path, which is most B2B. Server-side conversion reporting where supported. Never let a tracking parameter create a crawlable URL variant (§9 canonical excludes query params).

### Experiments

Flags and A/B assignment via PostHog, **resolved server-side** — client-side variant swapping flashes the control and costs CLS (§10). Every experiment declares hypothesis, primary metric and minimum sample **before** launch; stopping early on a favorable peek ships noise. Flags are removed after the decision — a stale flag is a dead branch an agent will treat as live.

### Landing pages

One `<h1>` stating the value proposition above the fold · **one primary CTA** repeated, not five competing · proof near the ask · LCP element is text or a `priority` image, never a carousel or video · minimum form fields · one focal point (§6.2 rule 6) · copy obeys §6.8 and §8. A marketing page that only exists in English defeats the i18n work.

### Email

| Type                                               | Rules                                                                                                                                        |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Transactional** (receipts, resets, verification) | Sent regardless of marketing consent. Never contains promotional content, or it becomes marketing                                            |
| **Marketing** (campaigns, newsletters)             | Requires `user.marketingConsent === true`. One-click unsubscribe honored immediately. Physical address and unsubscribe link in every message |

Both localized via `user.locale` (§8). Separate sender identities so a marketing complaint never damages transactional deliverability. SPF, DKIM and DMARC verified before the first send.

---

## 12. 🔐 Privacy, Legal & Compliance

### Consent gate

**No non-essential cookie, script or event before explicit consent.** Analytics, replay and marketing pixels load _after_ opt-in. Essential cookies (session, locale, consent state) need no consent and are documented as such.

Consent is stored, versioned, and re-requested when the policy changes. **Rejecting is exactly as easy as accepting** — one click, equal visual weight. A pre-checked opt-in or a hidden reject button is not consent. The banner must not obscure focused content (§7, 2.4.11) and must be keyboard operable.

### Required pages — localized, indexable

Privacy Policy · Terms of Service · Cookie Policy, each listing the actual subprocessors below. A generic template naming services you don't use is worse than none.

### Subprocessor inventory

| Vendor                      | Data                      | Purpose                                             |
| --------------------------- | ------------------------- | --------------------------------------------------- |
| Vercel                      | Request metadata, IP      | Hosting                                             |
| Neon                        | All application data      | Database                                            |
| Better Auth _(self-hosted)_ | —                         | Runs in your infra; no third party sees credentials |
| Stripe                      | Name, email, payment data | Payments                                            |
| Resend                      | Email address, content    | Email                                               |
| Cloudflare R2               | Uploaded files            | Storage                                             |
| Upstash                     | IP hashes                 | Rate limiting                                       |
| Sentry                      | Error context, scrubbed   | Error monitoring                                    |
| PostHog                     | Behavioral events, replay | Analytics, flags                                    |

Keep current. A DPA is required with each, and the list must match reality — it's the first thing a data request asks for.

### User rights — implemented, not promised

| Right                    | Implementation                                                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| **Access / portability** | `/settings/data` exports all user data as JSON                                                                  |
| **Erasure**              | Hard-deletes PII, retains the legal/financial minimum, cascades deletion requests to Stripe, Sentry and PostHog |
| **Rectification**        | Editable profile                                                                                                |
| **Consent withdrawal**   | Settings toggle, effective immediately                                                                          |

Erasure is the one most boilerplates skip and the one most likely to be requested. **Both flows are E2E tested** (§14) — a broken export is a compliance failure, not a bug.

### Data minimization

Collect only what a feature needs today — "we might want it later" is not a basis · **never log PII**, identifiers only · Sentry `beforeSend` scrubbing and replay input masking configured **before** production · documented retention: logs 30d, sessions 90d, deleted accounts purged after the legal minimum · secrets never in code, never in client bundles, never in agent output.

---

## 13. 🛡️ Security Baseline

### ⚠️ Open items

| Item                               | Action                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`next` below the patched floor** | Upgrade to **`16.2.11+`**. The July 2026 advisory covers nine issues including SSRF, a **middleware/proxy authorization bypass**, DoS, and cache identifier disclosure, patched in `15.5.21` and `16.2.11` ([Netlify](https://www.netlify.com/changelog/2026-07-21-nextjs-security-vulnerabilities/), [release notes](https://releasebot.io/updates/vercel/next-js)). The middleware bypass is directly relevant because `/admin` navigation gating lives in `proxy.ts` — and is precisely why enforcement must also be server-side. After upgrading, verify a non-admin cannot reach `/admin`. Details paraphrased for licensing compliance. |
| Security headers / CSP             | `headers()` in `next.config.ts`: HSTS with preload, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, nonce-based CSP with `frame-ancestors 'none'`                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Sentry PII scrubbing               | `beforeSend` + replay masking before production                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

### Standing rules

1. **Authorization is server-side, always.** The proxy is optimistic UX. Every action and handler re-verifies via `authActionClient` / `adminActionClient` / `requireRole()`.
2. **Every Server Action is a public endpoint until proven otherwise.** Next.js provides CSRF defense, encrypted closures and rotating action IDs, but its own docs are explicit that these don't replace application-level authorization ([production patterns](https://www.digitalapplied.com/blog/nextjs-server-actions-production-patterns-2026-guide)); action-ID encryption is not authentication ([analysis](https://dev.to/shubhradev/nextjs-16-server-actions-security-the-auth-check-most-developers-miss-1ei1)). A 2026 review put the failure mode bluntly: without strict payload validation an author can create an unauthenticated RPC endpoint by accident ([dev.to](https://dev.to/adioof/server-actions-blur-the-client-server-line-and-juniors-are-paying-for-it-4plc)). Findings paraphrased for licensing compliance. **This is why `next-safe-action` is a constraint, not a convenience.**
3. **Validate at every trust boundary.** Actions, handlers, webhooks, env vars — all parse with Zod. Client validation is UX, never security.
4. **Verify every webhook signature before doing any work.** Reject 400, log it, never parse first.
5. **Never trust client-supplied identifiers.** Session-derived `userId`; server-generated storage keys.
6. **No internals in errors.** `getFriendlyErrorMessage()` for users; stack traces to Sentry.
7. **No secrets in client code.** `NEXT_PUBLIC_*` is public. Confirm the value is billboard-safe before adding the prefix.
8. **Rate-limit every public input path:** `/api/auth/*`, every `actionClient` action, uploads, contact forms, password reset.
9. **Sessions.** `BETTER_AUTH_SECRET` is 32+ random bytes, rotated on suspicion. Cookies `httpOnly`, `secure`, `sameSite: "lax"`.
10. **Auth hardening.** Rate-limit and progressively delay failed logins. Never reveal whether an email exists ("If that address is registered, we sent a link"). Reset tokens single-use and short-lived. **Allow paste and password managers** — blocking them is both a security and an accessibility failure (§7, 3.3.8).
11. **Uploads.** Validate MIME and size server-side. Serve user files from a separate origin so a malicious upload can't script against your session.
12. **Public endpoints are declared, not discovered.** Only `/api/auth/[...all]` (rate limited) and `/api/webhooks/stripe` (signature verified, idempotent). Adding one requires an entry in §4 with justification and mitigation.
13. **Dependencies.** Pin exact runtime versions. Vet maintenance status and typosquatting.

---

## 14. 🧪 Testing Strategy

> AI-generated code needs **more** verification, not less. `npm run build` proves it compiles and nothing else.

### Mandatory coverage

| Code                               | Required cases                                                           |
| ---------------------------------- | ------------------------------------------------------------------------ |
| Server Actions                     | Happy path · unauthenticated · wrong role · invalid input · rate limited |
| DAL functions                      | Correct data, correct filters                                            |
| Auth guards                        | **Especially the negative cases** — a broken guard is a breach           |
| `safe-action` middleware           | Everything else depends on it holding                                    |
| Zod / drizzle-zod schemas          | Valid and invalid input                                                  |
| **Zod locale error map**           | Errors render in `es` and `en`                                           |
| **Design tokens**                  | Every foreground/background pair vs WCAG + APCA, both themes (§6.2)      |
| Stripe webhook                     | Invalid signature rejected · duplicate `event.id` is a no-op             |
| Presign action                     | Oversized rejected · wrong MIME rejected · key generated server-side     |
| `sendEmail()`                      | Correct locale resolved from `user.locale`                               |
| **Data export & account deletion** | End-to-end — a broken export is a compliance failure (§12)               |
| Business logic in `lib/`           | Pure functions                                                           |
| Custom hooks                       | Stateful logic                                                           |
| Interactive components             | Behavior + `axe` assertion                                               |
| Presentational components          | Optional — covered by visual verification                                |
| `components/ui/` Shadcn            | No — upstream                                                            |
| `schema/auth.ts`                   | No — generated                                                           |

### Layers

**Unit + component — Vitest + RTL.** Query by accessible role and label, never test id or class. A test that can't find the button by its accessible name is telling you the component is inaccessible — fix the component, not the test. Every interactive component asserts `toHaveNoViolations()`.

**Network — MSW.** Mock at the network layer, not by stubbing modules. Never mock your own DAL in an action test; mock the external call.

**E2E — Playwright.** Thin, critical-path only: sign-up → dashboard · checkout → subscription active · admin denied to a non-admin · data export · account deletion. Matrix: Chromium, WebKit, Chromium mobile viewport. Both locales where copy matters.

**A11y — `@axe-core/playwright`.** Every route, both locales, both themes. CI blocks on new violations.

**Visual regression — Playwright snapshots.** Marketing pages and the component gallery at 375 / 768 / 1280, **in both themes**. Catches the CSS regression no assertion covers.

**Performance — Lighthouse CI.** Against a preview deploy, asserting §10 budgets, blocking on regression.

### Test data

**Factories, not fixtures** — `tests/factories/` builds objects with sensible defaults and explicit overrides so a test states only what it cares about. **A Neon branch per CI run**, seeded and destroyed; never a shared mutable test database. MSW is Vitest-only; E2E hits real routes against the seeded branch.

### Rules

Test behavior, not implementation — no call-count assertions unless the call _is_ the contract ("charged exactly once") · one assertion concept per test, names state expected behavior · no snapshot tests of large trees (they pass on breakage and fail on formatting) · deterministic: no real network, no real clock (`vi.useFakeTimers()`), no shared mutable state · **a failing test is fixed, never skipped**; a flaky test is quarantined with an issue and a deadline, never left to erode trust.

---

## 15. 🤖 Agent Toolchain

> Without a browser, an agent writes CSS blind and the human becomes the test runner. This section is what makes "verified" mean something.

### MCP servers — `.mcp.json`

| Server                                | Purpose                                                      | Use for                                                                                                                                                        |
| ------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Chrome DevTools MCP**               | Real browser: DOM, console, network, performance traces, CWV | **Primary verification tool.** Screenshots, layout checks, real LCP/INP/CLS, console errors, rendered metadata and JSON-LD inspection, computed color sampling |
| **Playwright MCP**                    | Deterministic scripted interaction                           | Authoring and debugging E2E specs, multi-step flows, cross-browser checks                                                                                      |
| **Docs MCP** (Context7 or equivalent) | Current library documentation                                | Verifying an API before using it instead of guessing from training data                                                                                        |
| **Figma MCP** (Dev Mode)              | Design source                                                | Extracting tokens and specs when a design exists                                                                                                               |

### Installed skills — external method, internal truth

| Skill             | Source                                                            | Purpose                                                | Triggers on                               |
| ----------------- | ----------------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------- |
| `grill-me`        | community (`ericgandrade/claude-superskills`, `tkersey/dotfiles`) | Socratic interrogation of a plan before implementation | New feature, entity, route, business rule |
| `superpowers`     | `obra/superpowers`                                                | Plan-first discipline; worktree-isolated execution     | Multi-step or risky work                  |
| `frontend-design` | Anthropic official                                                | Aesthetic direction before UI code                     | New surface or visual redesign            |
| `skill-creator`   | Anthropic official                                                | Authoring skills                                       | The §22 split                             |

**Governance — read before installing anything.**

1. **External skills provide method; this document provides truth.** On any conflict about stack, tokens, contrast method, accessibility target, security posture or testing requirements, **this document wins.** Say so out loud when you override a skill.
2. **Never install two skills that own the same decision.** `grill-me` and Superpowers' `brainstorming` both gate implementation behind questioning. **Pick one.** Overlapping skills produce contradictory instructions and the agent breaks the tie arbitrarily.
3. **Popularity is not a criterion.** Star counts for the same plugin vary by an order of magnitude across sources. Judge by whether the `description` is trigger-shaped and whether the body is narrow. The 2026 consensus is that the skills that work are the narrow ones.
4. **Every skill is a context cost.** One that fires on the wrong tasks is worse than not having it.
5. **Bundles are rejected by default.** Meta-plugins merging a dozen tools into one namespace install a dozen sets of opinions you didn't evaluate. Install the individual skill.
6. **Deferred deliberately:** heavyweight design skill suites (e.g. Impeccable's 18 interconnected skills) are **not** installed, because §6 already owns tokens, scales and legibility. Two design systems competing means the agent breaks the tie at random. If §6 proves insufficient after several features, evaluate such a suite as a **replacement** for §6, never a layer on top.
7. **Quarterly audit:** any skill that hasn't changed an outcome in three months is uninstalled.

### The verification loop — required for UI work

1. Build or change the UI
2. Render the affected route through Chrome DevTools MCP
3. **Read the console.** A clean-looking page with hydration errors is not done
4. Screenshot at **375, 768, 1280, 1920**, in **both themes**
5. **Sample computed colors and compute contrast** — WCAG ratio and APCA Lc for every new pair (§6.2). Never eyeball
6. **Grayscale check** — states must remain distinguishable without hue
7. Compare against intent — the direction in `docs/DIRECTION.md`, or the stated requirement
8. Keyboard pass: Tab order, visible focus, focus not obscured, Escape closes
9. Re-render with `prefers-reduced-motion: reduce`
10. Screenshot empty, loading and error states, not just success
11. If the change adds JS, an image or a dependency: performance trace against §10
12. On a public page: inspect rendered `<head>` for canonical, hreflang, JSON-LD (§9)
13. Fix and repeat until it matches

### Hooks

| Trigger                | Action                                                                  | Why                                       |
| ---------------------- | ----------------------------------------------------------------------- | ----------------------------------------- |
| `agentStop`            | `npm run typecheck && npm run lint`                                     | Closes the correction loop unasked        |
| `postToolUse` on write | `prettier --write` on the changed file                                  | Formatting never becomes a review comment |
| `preToolUse` on shell  | Warn on `rm -rf`, `db:push` against a non-local URL, `git push --force` | Destructive-command guard                 |

### Rules for agents

- **Never start a long-running process.** No `dev`, `test:watch`, `db:studio`, `email:dev`. Use `npm run test` and `npm run build`. For E2E, let Playwright's `webServer` manage the server.
- **Never claim a visual, contrast, or performance result you didn't measure.**
- **Read the console before declaring success.** Hydration and CSP errors don't fail the build.
- **Prefer the docs MCP over memory** for any API you're not certain about. A confidently wrong API call costs more than a lookup.
- **Report what you ran**, verbatim output for failures.
- **Delegate large fan-outs** (many files, many routes) to a subagent to keep the main context on implementation.

---

## 16. ⚙️ Environment & Secrets

_Never hardcode secrets. Never commit `.env`. Never echo a secret's value into logs or agent output — reference it by key name._

### Server-side — validated in `src/lib/env.ts`

| Variable                                                                         | Description                                |
| -------------------------------------------------------------------------------- | ------------------------------------------ |
| `DATABASE_URL`                                                                   | NeonDB connection string                   |
| `BETTER_AUTH_SECRET`                                                             | Signs sessions — `openssl rand -base64 32` |
| `BETTER_AUTH_URL`                                                                | Canonical base URL for auth callbacks      |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`                                      | OAuth (optional)                           |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`                                      | OAuth (optional)                           |
| `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET_NAME` | Cloudflare R2                              |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`                                    | Stripe                                     |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` / `RESEND_MARKETING_FROM_EMAIL`           | Email — separate senders (§11)             |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`                            | Rate limiting                              |
| `POSTHOG_API_KEY`                                                                | Server events and flag evaluation          |

### Client-side — validated in `src/lib/env.ts`

| Variable                                               | Description                                |
| ------------------------------------------------------ | ------------------------------------------ |
| `NEXT_PUBLIC_APP_URL`                                  | Base URL. **Must equal `BETTER_AUTH_URL`** |
| `NEXT_PUBLIC_R2_PUBLIC_URL`                            | R2 public bucket                           |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`                   | Stripe public key                          |
| `NEXT_PUBLIC_SENTRY_DSN`                               | Sentry DSN                                 |
| `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` | **Loaded only after consent** (§12)        |

### Intentionally outside `env.ts`

| Variable                                              | Used in                          | Why                           |
| ----------------------------------------------------- | -------------------------------- | ----------------------------- |
| `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` | `next.config.ts` (token CI-only) | Build-time source maps        |
| `DATABASE_URL`                                        | `drizzle.config.ts`              | Drizzle Kit runs outside Next |

**Notes.** `.env.local` for dev; provider secrets in production. `.env.example` committed with placeholders, in sync with these tables. Validation runs at import time and fails fast naming the missing key. **`SKIP_ENV_VALIDATION` is discouraged** — it converts a loud build failure into a silent production outage; CI uses a committed `.env.ci` of valid placeholders so validation actually runs (§20). Secrets rotate on staff change or suspected exposure; order in `docs/RUNBOOK.md`.

---

## 17. 🧰 Key Commands

| Command                                                        | Description                                                       |
| -------------------------------------------------------------- | ----------------------------------------------------------------- |
| `npm run dev`                                                  | Dev server — **agents never run this**                            |
| `npm run build` / `start`                                      | Production build / server                                         |
| `npm run lint` / `lint:fix`                                    | ESLint — zero warnings tolerated                                  |
| `npm run format` / `format:check`                              | Prettier                                                          |
| `npm run typecheck`                                            | `tsc --noEmit`                                                    |
| `npm run test`                                                 | Vitest, single run (includes token contrast + a11y assertions)    |
| `npm run test:watch`                                           | Watch — **manual only**                                           |
| `npm run test:e2e`                                             | Playwright                                                        |
| `npm run test:a11y`                                            | axe scan across routes                                            |
| `npm run test:visual`                                          | Visual regression, both themes                                    |
| `npm run audit:tokens`                                         | Compute WCAG + APCA across the whole palette (§6.2)               |
| `npm run lighthouse`                                           | Lighthouse CI against §10                                         |
| `npm run analyze`                                              | Bundle analyzer                                                   |
| `npm run i18n:check`                                           | Translation key parity                                            |
| `npm run validate`                                             | Full CI: typecheck + lint + format + i18n + tokens + test + build |
| `npm run clean`                                                | Delete `.next` (fixes stale type errors)                          |
| `npm run auth:generate`                                        | Regenerate the Better Auth schema                                 |
| `npm run db:push` / `generate` / `migrate` / `studio` / `seed` | Drizzle Kit                                                       |
| `npm run email:dev`                                            | React Email preview — **manual only**                             |
| `npx shadcn@latest add [component]`                            | Add a Shadcn component                                            |

---

## 18. 🔌 Third-Party Integrations

### Better Auth — self-hosted

- **Purpose:** sessions, email/password, OAuth, reset, roles. Users live in **your** Postgres.
- **Files:** `lib/auth.ts` (instance + `getSession`/`requireAuth`/`requireRole`), `lib/auth-client.ts`, `app/api/auth/[...all]/route.ts`, `lib/db/schema/auth.ts` (generated), `proxy.ts`
- **Why over a hosted vendor:** no external identity to reconcile — no foreign ID column, no sync webhook, no dual user store, no per-user bill. Covers email/password, OAuth, magic links, 2FA and organizations in one library rather than separate plugins ([overview](https://getnextjstemplates.com/blogs/best-nextjs-user-authentication-resources)), with a first-class Drizzle adapter ([docs](https://www.better-auth.com/docs/adapters/drizzle)).
- **Documented alternative — Clerk:** ships faster with prebuilt auth UI and a hosted dashboard; its free tier now covers 50,000 monthly retained users ([LogRocket](https://blog.logrocket.com/best-auth-library-nextjs-2026/)). The cost is a foreign identity plus a sync webhook you maintain. Choose deliberately — identity migration is the most expensive migration in the stack. Comparisons paraphrased for licensing compliance.
- **Critical:** never query the database inside `proxy.ts`. Use the session-cookie helper for an optimistic redirect, then verify server-side (§20).
- **Plan for it:** you build the login and sign-up UI. Those screens must satisfy §7 3.3.8 — paste allowed, password managers supported.

### next-safe-action

- **Purpose:** end-to-end type safety from input validation to result, with chainable middleware ([docs](https://next-safe-action.dev/docs/introduction)).
- **File:** `lib/safe-action.ts` — `actionClient` (public, rate limiting mandatory) · `authActionClient` (`ctx.user` guaranteed) · `adminActionClient` (role enforced)
- **Why it's a constraint:** §13.2. Structural enforcement beats documented convention, and that gap is where AI-generated code fails.

### Cloudflare R2 — presigned URLs

- **File:** `lib/r2.ts` — `presignPutUrl({ key, contentType, contentLength })`, `publicUrl(key)`
- **Flow:** client requests a presigned PUT from an `authActionClient` action → server validates type/size against `UPLOAD` and **generates the key itself** (`${user.id}/${uuid}.${ext}`), signs for ≤5 min → browser PUTs **directly to R2** with exactly the signed `Content-Type` and `Content-Length` → a second action persists the key.
- **Why not FormData through an action:** that routes bytes through your serverless function, capped around 4.5MB on Vercel. A 6MB phone photo fails opaquely, and you pay compute to relay bytes.
- **Requires:** R2 bucket CORS for all origins including previews (§20).

### Stripe

- **Files:** `lib/stripe.ts`, `app/api/webhooks/stripe/route.ts`
- **Critical:** handlers must be **idempotent** — Stripe retries, so anything granting credit or sending email fires twice unless you dedupe on `event.id` before side effects. Use `req.text()` for the raw body.
- Conversion events originate here, not client-side (§11).
- **Documented alternative:** Stripe leaves global VAT and sales tax to you. A merchant of record (Polar, Lemon Squeezy) takes a higher cut and absorbs that obligation — often worth it for solo developers selling internationally.

### Resend + React Email

- **Files:** `lib/resend.ts`, `lib/email/send.ts`, `lib/email/templates/*.tsx`
- **Why React Email:** email clients are a compatibility minefield — Outlook renders through Word, Gmail strips much of `<head>`, flexbox is unreliable. Hand-maintained HTML strings don't survive the second template. React Email ships the table layouts already solved, plus local preview.
- **Rules:** locale-aware (§8) · separate transactional and marketing senders (§11) · SPF/DKIM/DMARC verified before first send · never send an unvalidated user-supplied `to`.

### NeonDB

- **Files:** `lib/db/index.ts`, `lib/db/schema/`, `drizzle.config.ts`
- **Branching:** a branch per preview deploy and per CI run, so previews and tests never touch production data.

### Upstash Redis

- **File:** `lib/rate-limit.ts` · Applied to `/api/auth/*`, every public action, presign, contact.

### Sentry

- **Files:** `instrumentation-client.ts`, `instrumentation.ts`, `sentry.{server,edge}.config.ts`, `next.config.ts`, `global-error.tsx`, `lib/logger.ts`
- **Critical:** `beforeSend` scrubbing and replay masking **before** production (§12). Web Vitals report here. Release health tied to deploys so a regression is attributable to a commit.

### PostHog

- **Files:** `lib/analytics.ts`, `lib/flags.ts`
- **Loaded only after consent** (§12). Flags resolved **server-side** to avoid variant flash (§11). Collapses analytics, flags, replay and experiments into one vendor. Self-hosting available if data residency outweighs ops cost.

---

## 19. 🚀 Deployment & Operations

### Environments

| Environment | Branch           | Data                   | Keys     |
| ----------- | ---------------- | ---------------------- | -------- |
| Local       | —                | Neon dev branch        | Test     |
| Preview     | feature branches | **Neon branch per PR** | **Test** |
| Staging     | `develop`        | Staging branch         | Test     |
| Production  | `main`           | Production             | Live     |

**A preview wired to production credentials charges real cards and emails real users.** Verify test keys, a Neon branch, and preview OAuth callback URLs before the first preview deploy.

### CI pipeline

`typecheck → lint → format:check → i18n:check → audit:tokens → test → build → e2e → a11y → visual → lighthouse`

Uses `.env.ci` placeholders so env validation actually runs. Never `SKIP_ENV_VALIDATION`.

### Database migrations — expand/contract, always

Rollback reverts code, **not** the database, so every migration must be backward compatible with the previous release.

1. **Expand** — add the nullable column or new table. Deploy. Old code still works.
2. **Migrate** — backfill. Deploy code writing to both shapes.
3. **Contract** — once no running version reads the old shape, drop it. Separate deploy.

Renaming a column in one step is how you cause an outage on rollback.

### Release

Never push directly to `main`; PRs only, CI green · **deploy and release are decoupled** — ship dark behind a flag and enable separately, reducing a risky release to a config change · squash merge, conventional commits, `CHANGELOG.md` maintained · rollback is Vercel instant rollback, practiced before it's needed.

### Observability

| Signal      | Tool                                  | Alert                                              |
| ----------- | ------------------------------------- | -------------------------------------------------- |
| Errors      | Sentry                                | New production issue, or error rate above baseline |
| Performance | Sentry + Lighthouse CI                | CWV regression past §10                            |
| Uptime      | External check on `/` and `/api/auth` | Two consecutive failures                           |
| Webhooks    | Stripe dashboard + Sentry             | Delivery failure rate                              |
| Business    | PostHog                               | Signup or conversion drop                          |

Alerts route to a real channel. An alert nobody sees is a log line.

### Incidents

`docs/RUNBOOK.md` covers rollback steps, secret rotation order, Stripe webhook replay, Neon point-in-time restore, and per-vendor contacts. Written before the first incident, not during.

---

## 20. 🐛 Known Gotchas & Patterns

_The highest-value section in this file. Burned time on a surprising bug? Document it here._

### Gotchas

| Issue                                                                    | Solution                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Never query the DB in `proxy.ts`**                                     | Middleware runs on every matched request and may run at the edge. Use Better Auth's session-cookie helper for an optimistic redirect; verify server-side. A DB call here taxes every navigation and is unreliable at the edge.                  |
| **Hydration mismatch on dates**                                          | The cause in a next-intl app is a missing `timeZone` in `i18n/request.ts` — server and client format in different zones. Set it. **Do not reach for `suppressHydrationWarning`**: it hides the mismatch and leaves the date wrong for the user. |
| **Contrast looked fine, failed audit**                                   | It was judged by eye. Compute WCAG **and** APCA for every pair (§6.2). Same-luminance pairs are the classic trap.                                                                                                                               |
| **WCAG passes but text still reads weak**                                | WCAG 2.x misjudges mid-tone and saturated pairs. Trust APCA and fix it.                                                                                                                                                                         |
| **Dark mode text appears to bleed**                                      | Halation from pure white on pure black. Off-white on near-black, and desaturate the accents.                                                                                                                                                    |
| **Error and success indistinguishable for some users**                   | Encoded in hue alone. Red–green is the most common deficiency. Add an icon and differentiate lightness; verify with a grayscale screenshot.                                                                                                     |
| **A token passed in isolation and failed in the component**              | Simultaneous contrast. Always verify in context, both themes.                                                                                                                                                                                   |
| **Presigned PUT rejected by R2**                                         | The client must send exactly the signed `Content-Type` and `Content-Length`. Any mismatch is a signature failure.                                                                                                                               |
| **Browser PUT to R2 fails with CORS**                                    | Configure bucket CORS for every origin including previews, allowing `PUT` and `Content-Type`. Server-side signing succeeds regardless, so it's easy to miss.                                                                                    |
| **In-memory rate limiting doesn't work on Vercel**                       | Each invocation may be a fresh instance, so the counter resets and the limit effectively doesn't exist — worse than nothing, because it creates false confidence.                                                                               |
| **`next-safe-action` validation errors are a result field, not a throw** | Read `validationErrors` from the result. A `try/catch` silently misses them.                                                                                                                                                                    |
| **Auth schema is generated**                                             | Run `npm run auth:generate` after config changes. Hand edits to `schema/auth.ts` get overwritten.                                                                                                                                               |
| **Neon HTTP driver has no transactions**                                 | Use the WebSocket Pool driver for those paths, or sequence idempotent writes.                                                                                                                                                                   |
| **`nuqs` needs its adapter**                                             | Wrap the app in `NuqsAdapter` in the root layout or hooks throw at runtime.                                                                                                                                                                     |
| **`drizzle-zod` shouldn't carry business rules**                         | Derive shape from the table, `.refine()` separately. Business constraints in the schema couple validation to migrations.                                                                                                                        |
| **Stripe webhook needs the raw body**                                    | `req.text()`, not `req.json()`.                                                                                                                                                                                                                 |
| **Stripe retries webhooks**                                              | Dedupe on `event.id` before any side effect.                                                                                                                                                                                                    |
| **React Email must be rendered before sending**                          | `render()` the component to HTML inside `sendEmail()`.                                                                                                                                                                                          |
| **next-intl requires awaiting `params`**                                 | In Next 16 `params` is a Promise.                                                                                                                                                                                                               |
| **Metadata in the wrong language**                                       | `generateMetadata` runs outside the component tree and doesn't inherit the request locale. `await getTranslations({ locale })`.                                                                                                                 |
| **Translations exist but pages don't rank**                              | Missing `alternates.languages`. Without hreflang, Google treats locale variants as duplicates.                                                                                                                                                  |
| **`x-default` pointing at a prefixed URL**                               | It must point at the unprefixed root. Pointing it at `/en` tells Google English is everyone's fallback.                                                                                                                                         |
| **Sitemap alternates duplicating the locale**                            | Build alternates from the unprefixed path, or you emit `/es/es/pricing`.                                                                                                                                                                        |
| **Preview deploy in search results**                                     | `robots.ts` didn't check the environment.                                                                                                                                                                                                       |
| **Zod errors in English for Spanish users**                              | The locale-aware error map isn't installed.                                                                                                                                                                                                     |
| **Emails always in one language**                                        | `sendEmail()` called without a locale, or hardcoded template copy.                                                                                                                                                                              |
| **Analytics events firing twice in dev**                                 | Fired from a mount effect; Strict Mode double-invokes.                                                                                                                                                                                          |
| **Cookie banner obscuring focused content**                              | WCAG 2.2 2.4.11. Sticky chrome needs `scroll-margin` on focusable content.                                                                                                                                                                      |
| **CLS from a skeleton**                                                  | Skeleton dimensions don't match loaded content.                                                                                                                                                                                                 |
| **INP regression after adding a transition**                             | You animated a layout property. `transform` and `opacity` only.                                                                                                                                                                                 |
| **`next/image` needs remote domains**                                    | Add to `images.remotePatterns`, including the R2 public domain.                                                                                                                                                                                 |
| **Typecheck fails for deleted routes**                                   | `.next/types/validator.ts` references deleted files: `npm run clean` then `typecheck`.                                                                                                                                                          |
| **Zod date coercion for the DB**                                         | `z.coerce.date()` for form dates. Raw strings into Drizzle timestamps fail with `value.toISOString is not a function`.                                                                                                                          |
| **Drizzle config reads env directly**                                    | It runs outside Next.                                                                                                                                                                                                                           |
| **Sentry is optional**                                                   | Without a DSN, logger and instrumentation degrade to console-only.                                                                                                                                                                              |
| **`SKIP_ENV_VALIDATION` hides real failures**                            | Use `.env.ci` placeholders.                                                                                                                                                                                                                     |
| **MSW must not intercept Playwright**                                    | MSW is Vitest-only.                                                                                                                                                                                                                             |
| **OAuth breaks on previews**                                             | Each preview origin needs its callback registered and `BETTER_AUTH_URL` set to that origin.                                                                                                                                                     |
| **Rollback didn't fix it**                                               | Vercel reverts code, not the database. Hence expand/contract (§19).                                                                                                                                                                             |
| **Two skills gating the same decision**                                  | `grill-me` and Superpowers' `brainstorming` both block on questioning. With both installed the agent picks one arbitrarily and the guarantee is lost. Install one.                                                                              |
| **A design skill fighting the token system**                             | An opinionated design skill proposes its own scales. §6 is authoritative — take the direction, discard the tokens.                                                                                                                              |
| **Interrogation skipped on a "small" task**                              | The generic output almost always comes from a task nobody thought was worth questioning. If it introduces an entity, a route, a third-party call, or a visual pattern, it is not small.                                                         |

### Patterns

- **Safe Action:** pick the client → attach schema → handler gets validated input and guaranteed `ctx.user` → DAL → log → return.
- **DAL:** pure query functions. No auth, no validation, no logging.
- **Route Handler:** `withErrorHandler()` + `successResponse()`/`errorResponse()`. Reserved for webhooks, auth, and cases actions can't serve.
- **Client Action:** `useAction` / `useOptimisticAction`. Never hand-roll loading state.
- **Schema:** `createInsertSchema(table)`, `.omit()` server-managed columns, `.refine()` business rules.
- **URL State:** `useQueryState` / `useQueryStates`. Zustand only for ephemeral UI.
- **Upload:** presign action → direct browser PUT → persist-key action.
- **Email:** `sendEmail({ to, template, locale })`.
- **Auth Guard:** proxy for navigation, `authActionClient`/`adminActionClient`/`requireRole()` for enforcement. Both layers, always.
- **Rate Limit:** `checkRateLimit(identifier)` with `getClientIdentifier(headers)`.
- **Friendly Error:** `getFriendlyErrorMessage(error)` returns a translation key.
- **Metadata:** `buildMetadata({ locale, path, title, description })` from `lib/seo.ts`. Never hand-assemble.
- **Color:** author in OKLCH, name semantically, compute both contrast metrics, assert in `tests/tokens.contrast.test.ts`.
- **Analytics:** `track("event_name", props)` from the typed registry, after the consent gate.
- **Feature Flag:** `getFlag(name, user)` server-side; pass the resolved value as a prop.
- **Four States:** every async surface renders empty, loading, error, success.
- **Lazy Loading:** `next/dynamic` with `ssr: false` for heavy client libraries.
- **Code Quality:** pre-commit → lint-staged + typecheck. Pre-push → test + build. CI → `validate` + e2e + a11y + visual + lighthouse.

---

## 21. 📍 Project Status & Roadmap

_Keep status under 6 lines. Detailed planning in `docs/ROADMAP.md` or GitHub Issues._

- **Phase:** Boilerplate — hardening
- **Active Task:** None
- **Blockers:** None

### 🟡 Now — in order

0. [ ] **Bootstrap (§24):** install the §15 skill set, configure MCP and hooks, declare the §6.1 direction in `docs/DIRECTION.md`, verify `grill-me` fires before implementation on a throwaway task
1. [ ] `next` → `16.2.11+`; verify a non-admin cannot reach `/admin`
2. [ ] Better Auth: generate schema, mount handler, proxy cookie check, guards
3. [ ] `lib/safe-action.ts` clients; convert the example action
4. [ ] Security headers + CSP; Sentry PII scrubbing
5. [ ] Upstash rate limiting on `/api/auth/*` and every public action
6. [ ] Presigned upload flow + R2 CORS
7. [ ] `drizzle-zod` derivations; Zod locale error map
8. [ ] `styles/tokens.css` in OKLCH; `scripts/audit-tokens.ts`; `tests/tokens.contrast.test.ts`
9. [ ] `lib/seo.ts`: `buildMetadata()` with canonical + hreflang + `x-default`; multi-locale sitemap; env-aware robots; JSON-LD
10. [ ] `IntlMessages` typing + `i18n:check`; `eslint-plugin-i18next`
11. [ ] `jsx-a11y` at error; WCAG 2.2 audit including 2.4.11 and 3.3.8
12. [ ] Vitest + RTL + MSW + `vitest-axe`; the §14 mandatory table
13. [ ] Playwright: critical paths + `@axe-core/playwright` + visual snapshots both themes
14. [ ] Lighthouse CI with §10 budgets
15. [ ] Consent gate; PostHog behind it; typed event registry
16. [ ] Legal pages localized; data export + account deletion, E2E tested
17. [ ] React Email templates locale-aware; `nuqs` adapter mounted
18. [ ] `docs/RUNBOOK.md`

### ⬜ Next — your first feature

Interrogation (§0) → domain tables → `db:push` → `drizzle-zod` schemas → DAL → actions on `authActionClient` with tests → UI with four states, verified per §15.

### 🧊 Icebox

Dark mode polish pass · Better Auth passkeys / 2FA / organizations · dynamic OG images · `llms.txt` · Storybook past ~15 components · merchant-of-record billing · multi-region · self-hosted PostHog · evaluating a heavyweight design skill suite as a §6 replacement

---

## 22. 🧩 Skills Extraction Map

When this file is split into `.claude/skills/`, use this mapping. Load-map frequency determines what stays in `CLAUDE.md` versus what becomes on-demand.

| Skill                       | Sections            | Trigger description                                                                               |
| --------------------------- | ------------------- | ------------------------------------------------------------------------------------------------- |
| `CLAUDE.md` (always loaded) | 0, 1, 3             | Interrogation protocol, constraints, anti-patterns, DoR/DoD, coding rules. Target under 120 lines |
| `bootstrap`                 | 24                  | Initializing a new project from this document                                                     |
| `architecture`              | 4, 5                | Adding routes, entities, restructuring                                                            |
| `design-system`             | 6.1, 6.3–6.8        | Building or changing any component, layout, or visual treatment                                   |
| `color-and-legibility`      | 6.2                 | Choosing a color, verifying contrast, setting type, auditing tokens                               |
| `accessibility`             | 7                   | Any UI work — WCAG 2.2 AA rules and manual audits                                                 |
| `i18n`                      | 8                   | Strings, dates, numbers, currency, locales                                                        |
| `seo`                       | 9                   | Metadata, sitemap, structured data, canonical, hreflang                                           |
| `local-seo`                 | 9 (Local)           | Physical location, service area, Google Business Profile                                          |
| `performance`               | 10                  | Adding a dependency, image, list, or client component                                             |
| `analytics`                 | 11                  | Tracking, conversion, experiments, landing pages                                                  |
| `privacy-compliance`        | 12                  | Storing user data, cookies, third parties, erasure                                                |
| `security`                  | 13                  | Auth, API routes, webhooks, uploads, user input                                                   |
| `testing`                   | 14                  | Actions, DAL, guards, schemas, components                                                         |
| `agent-toolchain`           | 15                  | Verifying work; evaluating a skill                                                                |
| `integrations/*`            | 18 (one per vendor) | Touching that specific service                                                                    |
| `deployment`                | 19                  | Migrations, releases, incidents, flags                                                            |
| `gotchas`                   | 20                  | Debugging anything surprising — highest hit rate per token                                        |

### Boundary with external skills

| Domain                         | Owner                              | Rule                                                                         |
| ------------------------------ | ---------------------------------- | ---------------------------------------------------------------------------- |
| Stack, versions, architecture  | **This document**                  | No external skill overrides §2, §3, §4                                       |
| Design tokens, scales, states  | **This document (§6.3–6.8)**       | An external design skill may propose _direction_; tokens and scales are ours |
| Contrast method and legibility | **This document (§6.2)**           | WCAG + APCA computed. No skill substitutes its own heuristic                 |
| Accessibility target           | **This document (§7)**             | WCAG 2.2 AA is the floor regardless of what a skill suggests                 |
| Security posture, auth         | **This document (§13)**            | Never delegated                                                              |
| Testing requirements           | **This document (§14)**            | The §14 table is the minimum, not a suggestion                               |
| Interrogation method           | **External (`grill-me`)**          | We define _what_ to ask (§0); the skill supplies the _technique_             |
| Planning, worktree discipline  | **External (Superpowers)**         | Process, not policy                                                          |
| Aesthetic exploration          | **External (`frontend-design`)**   | Direction only; execution obeys §6                                           |
| PR structure                   | **External (Graphite)** if adopted | Doesn't change §19                                                           |

Resolution order on conflict: **§13 Security → §7 Accessibility → this document → external skill → agent judgment.**

### Split principles

Only §0, §1 and §3 load every turn. `name` and `description` are the only fields the runtime sees before activating a skill, so they must be trigger-shaped and specific, not generic. Keep each `SKILL.md` lean; push depth into `references/`. Anything deterministic (token audit, i18n parity, bundle check) belongs in `scripts/`, not prose.

---

## 23. 📚 References & Project Facts

### Aesthetic direction — **required before any UI work** (§6.1)

Full rationale in `docs/DIRECTION.md`. Summary:

- **Reference:** _(pending)_
- **Type personality:** _(pending)_
- **Color temperament:** _(pending — what carries meaning vs decoration)_
- **Density:** _(pending)_
- **Shape language:** _(pending)_
- **Motion character:** _(pending)_
- **Design source:** Figma via MCP, or N/A with the axes above filled

> An agent that finds these pending on a UI task proposes three distinct options and waits. It does not pick one silently.

### Project facts

- **Domain:** _(pending — blocks `BETTER_AUTH_URL`, canonical, OG, email sender)_
- **Legal entity & jurisdiction:** _(pending — blocks §12 legal pages and marketing email)_
- **Physical presence:** _(pending — determines `Organization` vs `LocalBusiness`, §9)_
- **Business model:** _(pending — subscription / one-time / seats / metered; determines schema and webhook handlers)_

### Documentation

`docs/DIRECTION.md` · `docs/ROADMAP.md` · `docs/RUNBOOK.md` · `docs/EVENTS.md` · `docs/DEPLOY.md`

### Library docs

_Agents use the docs MCP (§15) rather than following links._

Next.js · React · Tailwind v4 · Shadcn/UI · Radix · Motion · culori · Drizzle · drizzle-zod · Better Auth · next-safe-action · nuqs · Zod · React Hook Form · Stripe · Resend · React Email · Cloudflare R2 · aws4fetch · Upstash · next-intl · Zustand · SWR · Sentry · PostHog · Vitest · Playwright · Testing Library · axe-core · APCA · Lighthouse CI · WCAG 2.2 · Schema.org

---

## 24. 🚀 Bootstrap Protocol

> Triggered when the user says "start the project", "initialize", "set this up", or equivalent on an empty or near-empty repo. Execute the phases in order. **Do not skip Phase 2 to get to code faster.**

### Phase 0 — Orient and contract (no writes)

1. Read §0, §1, §2, §3 and this section.
2. Inspect the repo: is it empty, a bare `create-next-app`, or partially built? Never assume empty.
3. **Report back before touching anything:** what you understand the project to be, what you will install, what you will scaffold without asking, and the exact list of things only the user can answer.
4. Wait for a go-ahead.

### Phase 1 — Toolchain (install and verify)

Install in this order, verifying each before the next.

| Step | What                                                                                                                                                                                                                    |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | **Skills** from the §15 table. Add each marketplace/repo, install the skill, and **confirm the current install command from the skill's own README** rather than assuming a syntax. Report the resolved version of each |
| 2    | **Conflict check.** Confirm no two installed skills gate the same decision (§15 governance rule 2). If Superpowers' `brainstorming` and `grill-me` are both present, disable one and say which                          |
| 3    | **`.mcp.json`** with Chrome DevTools MCP, Playwright MCP, and a docs MCP. Add Figma MCP only if a Figma source exists                                                                                                   |
| 4    | **Hooks** from §15                                                                                                                                                                                                      |
| 5    | **`CLAUDE.md` and `AGENTS.md`** as thin pointers to this file. Do not duplicate content                                                                                                                                 |
| 6    | **Smoke test the toolchain.** Render any page through Chrome DevTools MCP and take one screenshot. If that fails, stop and fix it — the entire §0 DoD depends on it                                                     |
| 7    | **Smoke test `grill-me`.** Give it a throwaway feature request and confirm it interrogates instead of implementing                                                                                                      |

Report the result of steps 6 and 7 explicitly. An unverified toolchain means every later "verified" claim is hollow.

### Phase 2 — Interrogate (only what this document cannot answer)

Run the §0 Interrogation Protocol — one question per turn, with your recommendation after each answer.

**Ask exactly these four groups, in this order:**

| Group                | Questions                                                                                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Product**          | What does the app do, for whom, and what is the single primary journey? What are the domain entities and their lifecycle? What is explicitly out of scope for v1?                                             |
| **Business model**   | Subscription, one-time, seats, or metered? Trial? Free tier? This determines the schema and the Stripe webhook handlers, not just the pricing page                                                            |
| **Direction**        | Is there a Figma, a reference product, or a stated point of view? If none, propose three distinct directions across the five §6.1 axes and get a choice. Record in `docs/DIRECTION.md`                        |
| **Facts & accounts** | Domain name · legal entity and jurisdiction · physical presence (yes/no) · which OAuth providers · confirmation that Neon, Stripe, Resend, R2, Upstash, Sentry and PostHog accounts exist with keys available |

Write the answers into §5, §23, and `docs/DIRECTION.md` as you get them. **Never ask a question from the exclusion table below.**

#### ⛔ Never ask — this document already decided

| Do not ask                                    | Answer                                                     |
| --------------------------------------------- | ---------------------------------------------------------- |
| Which framework / router / language           | Next.js 16.2.11+, App Router, TypeScript strict (§2)       |
| Which styling or component library            | Tailwind v4 + Shadcn/Radix (§2)                            |
| Which auth solution                           | Better Auth, self-hosted (§2, §18)                         |
| Which ORM or database                         | Drizzle + NeonDB (§2)                                      |
| How to structure Server Actions               | `next-safe-action` clients (§3.4, §13.2)                   |
| Where API calls live                          | DAL in `src/data/` (§1, §3.6)                              |
| Which state manager                           | RSC → nuqs → Zustand, in that order of preference (§1, §3) |
| Whether to write tests                        | Yes, per the §14 mandatory table. Not negotiable           |
| Which accessibility standard                  | WCAG 2.2 AA (§7)                                           |
| How to measure contrast                       | WCAG ratio + APCA, computed (§6.2)                         |
| Which locales, and prefix strategy            | `es` default + `en`, `localePrefix: "always"` (§8)         |
| How to handle uploads                         | Presigned URLs, never FormData through an action (§18)     |
| Whether to use barrel files                   | No (§3.7)                                                  |
| Naming, file, or formatting conventions       | §3                                                         |
| Which package manager or version policy       | npm, exact pins for runtime deps (§2)                      |
| Whether to add rate limiting, CSP, or consent | Yes, all three, per §13 and §12                            |
| Performance targets                           | §10 budgets                                                |
| Migration strategy                            | Expand/contract (§19)                                      |
| Whether previews use production keys          | Never (§19)                                                |

If the user volunteers a change to any of these, that's a decision to record — update the document. But do not spend a turn asking.

### Phase 3 — Scaffold (product-agnostic first)

Build in this order. Everything here is independent of the Phase 2 answers except where noted, so it can proceed in parallel with account setup.

1. `create-next-app` at `16.2.11+`, TypeScript strict, App Router
2. `src/lib/env.ts` with Zod validation; `.env.example`; `.env.ci`
3. `src/styles/tokens.css` in OKLCH from the chosen direction; `scripts/audit-tokens.ts`; `tests/tokens.contrast.test.ts` — **tokens before components, always**
4. Tailwind v4 + Shadcn init; base primitives
5. i18n: config, `localePrefix: "always"`, explicit `timeZone`, `IntlMessages` typing, `scripts/check-i18n.ts`, Zod locale error map
6. Better Auth: instance, `auth:generate`, handler route, `proxy.ts` cookie check, guards
7. `src/lib/safe-action.ts` — the three clients
8. Drizzle + Neon; `drizzle-zod`; the `user` extensions from §5
9. `src/lib/seo.ts` — `buildMetadata()`, hreflang, `x-default`, JSON-LD builders; multi-locale `sitemap.ts`; env-aware `robots.ts`
10. Security: headers + CSP; Upstash rate limiting; Sentry with scrubbing
11. R2 presign + upload flow
12. Resend + React Email, locale-aware
13. Consent gate; PostHog behind it; typed event registry
14. Testing: Vitest + RTL + MSW + `vitest-axe`; Playwright + `@axe-core/playwright` + visual snapshots; Lighthouse CI
15. Husky, lint-staged, CI workflow, Dependabot, PR template
16. Legal pages (localized), data export, account deletion
17. `docs/` — DIRECTION, ROADMAP, RUNBOOK, EVENTS, DEPLOY

Only after all of the above: domain tables, DAL, actions, and UI from the Phase 2 answers.

### Phase 4 — Verify

Run the full gate and report verbatim results:

```bash
npm run validate        # typecheck + lint + format + i18n + tokens + test + build
npm run test:e2e
npm run test:a11y
npm run lighthouse
```

Then run the §15 verification loop against the homepage and one auth screen — including the contrast computation and the grayscale check. **A green build with an unverified screen is not done.**

### Phase 5 — Report

State plainly:

- What was installed, with resolved versions
- What was scaffolded
- What passed, and the verbatim output of anything that failed
- **Open items requiring the user:** missing keys, pending direction axes, unfilled §23 facts
- The next task from §21, and whether it needs interrogation first

Then update §21 Status and stop. Do not begin the first feature without a go-ahead.

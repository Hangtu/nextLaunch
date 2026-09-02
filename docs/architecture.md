# Architecture

> Read as intent, not inventory. The filesystem is authoritative — fix
> drift here when you find it.

## Request flow

```
Client Component
  → Server Action (requireAuth/requireRole → validate → DAL → logger → ActionResponse<T>)
    → DAL (src/data/) → Drizzle → Neon

Server Component
  → DAL directly → Drizzle → Neon

Route Handler (webhooks)
  → withErrorHandler → verify signature → dedupe on event id → handle
```

## Directory structure

```
src/
├── actions/                # Server Actions ("use server"), one file per feature
│   └── example.ts          # requireAuth → validate → DAL → logger → ActionResponse
├── app/
│   ├── [locale]/           # next-intl locale wrapper (es/en)
│   │   ├── layout.tsx      # ThemeProvider + ClerkProvider + NextIntlClientProvider + Footer + Analytics
│   │   ├── page.tsx
│   │   ├── loading.tsx     # Suspense fallback for this route segment
│   │   ├── privacy/page.tsx, terms/page.tsx  # placeholder legal pages — see docs/integrations.md
│   ├── api/webhooks/
│   │   ├── clerk/route.ts  # svix-verified — user.created/updated/deleted
│   │   └── stripe/route.ts # signature-verified — checkout/invoice/subscription events
│   ├── global-error.tsx, not-found.tsx
│   ├── robots.ts, sitemap.ts, manifest.ts
│   └── globals.css         # full light/dark token set already defined — see theme-provider.tsx
├── components/
│   ├── ui/                 # Shadcn primitives (button, card, input, label, sonner)
│   ├── theme-provider.tsx, theme-toggle.tsx  # dark mode — wired in the root layout
│   ├── footer.tsx           # privacy/terms links, mounted in the root layout
│   └── legal-page.tsx        # renders messages/*.json's `legal.<privacy|terms>` section
├── data/                   # DAL — pure query functions, no auth/validation/logging
│   ├── index.ts            # re-exports (not a barrel for the whole app — DAL only)
│   └── users.ts
├── hooks/
│   └── use-action.ts       # useAction() — loading/error state around a Server Action
├── i18n/                   # config, navigation, request, routing (next-intl)
├── lib/
│   ├── api.ts              # withErrorHandler, successResponse, errorResponse
│   ├── auth.ts              # getCurrentUser, requireAuth, requireRole (Clerk)
│   ├── constants.ts          # APP_CONFIG, ROLES, PAGINATION, UPLOAD, CACHE
│   ├── env.ts               # Zod-validated env vars + `integrations` flags
│   ├── errors.ts             # AppError and subclasses (NotFoundError, ValidationError, ...)
│   ├── error-messages.ts     # pattern-matches a raw error to a friendly message
│   ├── fetcher.ts            # typed fetcher for SWR
│   ├── logger.ts             # logger.info/warn/error/debug — forwards to Sentry if configured
│   ├── rate-limit.ts         # in-memory limiter, upgrades to Upstash Redis if configured
│   ├── utils.ts               # cn() and other small helpers
│   ├── stripe.ts, r2.ts, resend.ts  # optional integrations — throw a clear error if unconfigured
│   ├── db/
│   │   ├── index.ts          # Drizzle client
│   │   ├── schema.ts         # replace with your own tables
│   │   └── seed.ts
│   └── email/
│       ├── send.ts           # sendEmail() via Resend
│       └── templates/         # plain-HTML template functions
├── messages/                  # es.json (default), en.json
├── schemas/                   # Zod schemas (auth.ts, add one per entity)
├── store/                     # Zustand — ephemeral UI state only
├── types/index.ts              # ActionResponse<T>, PaginatedResponse<T>, ListParams
├── sentry.{server,edge}.config.ts, instrumentation.ts
└── proxy.ts                    # Clerk auth guard + next-intl locale negotiation
```

## Route inventory

| Route                                | Purpose                     | Auth                                       |
| ------------------------------------ | --------------------------- | ------------------------------------------ |
| `/:locale`                           | Homepage                    | Public                                     |
| `/:locale/privacy`, `/:locale/terms` | Placeholder legal pages     | Public, indexed                            |
| `/:locale/dashboard(.*)`             | Example protected area      | Clerk (`proxy.ts` + server-side check)     |
| `/:locale/admin(.*)`                 | Example admin area          | Clerk, intended for `requireRole("admin")` |
| `/:locale/settings(.*)`              | Example protected area      | Clerk                                      |
| `/api/webhooks/clerk`                | Sync Clerk users to your DB | Public, svix-verified                      |
| `/api/webhooks/stripe`               | Handle Stripe events        | Public, signature-verified                 |

`dashboard`, `admin` and `settings` are matched in `proxy.ts` but have no
pages yet — add them as the project needs them. Locale prefix is always
present (`/es/...`, `/en/...`); a bare path redirects to the default
locale (`es`).

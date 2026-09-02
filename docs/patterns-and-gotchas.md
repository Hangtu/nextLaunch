# Patterns & Gotchas

## Established patterns

- **Server Action:** `requireAuth()` (or `requireRole()`) → validate input
  → call a DAL function from `src/data/` → `logger.info`/`logger.error` →
  return `ActionResponse<T>`. See `src/actions/example.ts`. Never let a
  raw error escape an action — catch it and return
  `{ success: false, error }`.
- **DAL:** pure query functions in `src/data/*.ts`. No auth, no
  validation, no logging — those belong in the action or route handler
  that calls it.
- **Route Handler:** wrap with `withErrorHandler()` (`src/lib/api.ts`),
  which catches `AppError` subclasses and returns the right status code.
  Reserved for webhooks and anything a Server Action can't serve.
- **Client-side call:** `useAction()` (`src/hooks/use-action.ts`) wraps a
  Server Action with `isPending`/`error`/`data` state via `useTransition`
  — don't hand-roll loading state around an action call.
- **Auth guard:** `proxy.ts` gates navigation for `/dashboard`, `/admin`,
  `/settings` (see `docs/architecture.md`); **that's optimistic UX, not
  enforcement** — every action/handler must still call `requireAuth()` /
  `requireRole()` itself.
- **Errors:** throw a subclass of `AppError` (`src/lib/errors.ts`) for
  expected failures (`NotFoundError`, `ValidationError`, ...);
  `error-messages.ts` pattern-matches a raw error into a friendly string
  for the UI when you don't control the error shape (e.g. a thrown
  string from a third-party SDK).
- **Logging:** always `logger` from `@/lib/logger`, never `console.log`.
  It forwards to Sentry automatically when configured and degrades to
  console-only otherwise — don't special-case "Sentry might not be set up".
- **Webhooks:** verify the signature before doing any work (both the Clerk
  and Stripe example handlers already do this) and reject with 400 rather
  than parsing an unverified payload.
- **Theming:** `ThemeProvider` (`src/components/theme-provider.tsx`, a
  thin wrap of `next-themes`) is mounted in the root layout with
  `attribute="class"` — it toggles `.dark` on `<html>`, which
  `globals.css` already has full tokens for. `ThemeToggle`
  (`src/components/theme-toggle.tsx`) is the reference client component;
  it renders a disabled placeholder until mounted to avoid a hydration
  mismatch (the server can't know the resolved theme).
- **Security headers & CSP:** set in `next.config.mjs`'s `headers()` —
  HSTS, `X-Content-Type-Options`, `X-Frame-Options`/`frame-ancestors`,
  `Referrer-Policy`, `Permissions-Policy`, and a baseline CSP. The CSP's
  `script-src`/`connect-src`/`img-src`/`frame-src` are deliberately left
  open to any `https:` origin rather than allowlisting Clerk/Stripe/Sentry
  by name — see the gotcha below before tightening them.

## Known gotchas

| Issue                                                                                                                 | Solution                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Stripe webhook needs the raw body**                                                                                 | Use `req.text()`, not `req.json()` — the example handler already does this. Signature verification fails otherwise.                                                                                                                                                                                                                                                                                                               |
| **Stripe retries webhooks**                                                                                           | Dedupe on `event.id` before any side effect (granting access, sending email). Not yet implemented in the example handler — add it before charging real cards.                                                                                                                                                                                                                                                                     |
| **In-memory rate limiting doesn't survive serverless**                                                                | Set `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` (see `docs/integrations.md`) — `src/lib/rate-limit.ts` switches to a real distributed limiter automatically, no call-site change. Without them it's in-memory and resets per invocation on Vercel; fine for local/MVP use only.                                                                                                                                           |
| **Tightening the CSP `script-src` broke sign-in or checkout**                                                         | You allowlisted the wrong origin. Clerk and Stripe's exact origins depend on your account/region and change between their dev and production instances — verify each in the browser network tab (or their docs) before replacing the `https:` wildcard, and test sign-in _and_ checkout after every change.                                                                                                                       |
| **Dark mode toggle does nothing**                                                                                     | Confirm `<html suppressHydrationWarning>` still has `suppressHydrationWarning` (already set) and that `ThemeProvider` wraps the tree in the root layout — `next-themes` needs both to avoid a hydration warning and to actually apply the class.                                                                                                                                                                                  |
| **`robots.txt`/`sitemap.xml` 404 or crash**                                                                           | They live at `src/app/robots.ts`/`sitemap.ts`, outside `[locale]`, but `proxy.ts`'s matcher still catches them. Without the explicit `rootLevelFiles` bypass in `proxy.ts`, they either 307-redirect to a nonexistent `/es/robots.txt`, or — once routed through Clerk's middleware — fail if Clerk isn't configured yet. Any new root-level special file (another `.txt`/`.xml` route outside `[locale]`) needs the same bypass. |
| **`next-intl` requires `await`ing `params`**                                                                          | In the App Router, `params` is a Promise — `await params` before reading `locale`.                                                                                                                                                                                                                                                                                                                                                |
| **Metadata renders in the wrong language**                                                                            | `generateMetadata` runs outside the component tree and doesn't inherit the request locale — `await getTranslations({ locale })` explicitly inside it.                                                                                                                                                                                                                                                                             |
| **Hydration mismatch on dates**                                                                                       | Usually a missing explicit `timeZone` in `src/i18n/request.ts` — server and client format in different zones otherwise. Don't reach for `suppressHydrationWarning`; it hides the bug instead of fixing it.                                                                                                                                                                                                                        |
| **R2 presigned PUT rejected**                                                                                         | The client must send exactly the signed `Content-Type` and `Content-Length` — any mismatch is a signature failure.                                                                                                                                                                                                                                                                                                                |
| **R2 browser PUT fails with CORS**                                                                                    | Configure bucket CORS for every origin that uploads, including Vercel preview URLs. Server-side signing succeeds regardless, which makes this easy to miss until a real upload runs.                                                                                                                                                                                                                                              |
| **`npm run typecheck` fails for a route you just deleted**                                                            | `.next/types/validator.ts` still references it. Run `npm run clean` then `typecheck` again.                                                                                                                                                                                                                                                                                                                                       |
| **`drizzle.config.ts` reads `DATABASE_URL` directly**                                                                 | Drizzle Kit runs outside the Next.js runtime, so it can't go through `src/lib/env.ts`.                                                                                                                                                                                                                                                                                                                                            |
| **An optional integration throws at import, not at call time**                                                        | `stripe.ts` / `r2.ts` / `resend.ts` throw as soon as they're imported without their keys — by design, so a misconfiguration fails loudly near the feature that needs it instead of silently later. Check `integrations.<name>` from `@/lib/env` before importing one conditionally.                                                                                                                                               |
| **`SKIP_ENV_VALIDATION=true` hides real failures**                                                                    | It's set in CI's build step because CI doesn't have real secrets — don't reach for it locally to work around a validation error; fix the `.env.local` value instead.                                                                                                                                                                                                                                                              |
| **Console errors for `/_vercel/insights/script.js` and `/_vercel/speed-insights/script.js` (404, MIME type refused)** | Expected off Vercel — those paths only resolve on Vercel's edge network. `<Analytics />`/`<SpeedInsights />` no-op safely; this is noise, not a bug. Verified in a real browser against a production build.                                                                                                                                                                                                                       |
| **`clerkMiddleware()` hangs or 500s against a fake/placeholder Clerk key**                                            | It performs a real handshake with the Frontend API domain encoded in the key on every browser navigation (`curl` doesn't trigger this — it's gated on request headers a real browser sends). There's no local-only mode; testing Clerk-gated pages for real requires an actual Clerk instance, even a free dev one.                                                                                                               |

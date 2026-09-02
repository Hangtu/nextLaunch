# References

> Generated from `package.json`. Keep in sync when dependencies change —
> or better, treat `package.json` as authoritative and only skim this for
> "what's this package for again?".

## Runtime dependencies

| Package                                   | Version          | Purpose                                                                                       |
| ----------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------- |
| `next`                                    | 16.3.4           | Framework — 16.3+ for auto-generated `AGENTS.md` and bundled docs, see `docs/integrations.md` |
| `react` / `react-dom`                     | 19.2.3           | UI                                                                                            |
| `@clerk/nextjs`                           | ^6.12.12         | Auth                                                                                          |
| `svix`                                    | ^1.85.0          | Clerk webhook signature verification                                                          |
| `drizzle-orm`                             | ^0.40.1          | ORM                                                                                           |
| `@neondatabase/serverless`                | ^1.0.0           | Postgres driver (Neon)                                                                        |
| `zod`                                     | ^3.24.2          | Schema validation                                                                             |
| `react-hook-form` / `@hookform/resolvers` | ^7.55.0 / ^5.0.1 | Forms                                                                                         |
| `zustand`                                 | ^5.0.4           | Client state (ephemeral UI only)                                                              |
| `swr`                                     | ^2.3.3           | Server state / data fetching                                                                  |
| `stripe` / `@stripe/stripe-js`            | ^18.1.0 / ^7.3.0 | Payments — optional, see `docs/integrations.md`                                               |
| `resend`                                  | ^4.5.2           | Transactional email — optional                                                                |
| `@aws-sdk/client-s3`                      | ^3.738.0         | Cloudflare R2 (S3-compatible) — optional                                                      |
| `@sentry/nextjs`                          | ^10.51.0         | Error monitoring — optional                                                                   |
| `next-intl`                               | ^4.1.4           | i18n                                                                                          |
| `next-themes`                             | ^0.4.6           | Dark mode — wired via `theme-provider.tsx` in the root layout                                 |
| `sonner`                                  | ^2.0.3           | Toasts                                                                                        |
| `@vercel/analytics`                       | ^2.0.1           | Cookieless page-view analytics                                                                |
| `@vercel/speed-insights`                  | ^2.0.0           | Core Web Vitals reporting                                                                     |
| `@upstash/ratelimit` / `@upstash/redis`   | ^2.0.8 / ^1.38.3 | Rate limiting — optional, see `docs/integrations.md`                                          |
| `tailwind-merge` / `tw-animate-css`       | ^3.0.2 / ^1.2.9  | Styling helpers                                                                               |
| `class-variance-authority` / `clsx`       | ^0.7.1 / ^2.1.1  | Shadcn variant helpers                                                                        |
| `radix-ui`                                | ^1.4.3           | Headless UI primitives (Shadcn base)                                                          |
| `lucide-react`                            | ^0.483.0         | Icons                                                                                         |
| `shadcn`                                  | ^3.8.5           | Component generator CLI                                                                       |
| `server-only`                             | ^0.0.1           | Build-time guard against client bundling                                                      |

## Dev dependencies

| Package                                                    | Version                    | Purpose                                 |
| ---------------------------------------------------------- | -------------------------- | --------------------------------------- |
| `typescript`                                               | ^5                         | Types                                   |
| `eslint` / `eslint-config-next` / `eslint-config-prettier` | ^9 / 16.3.4 / ^10.1.8      | Linting                                 |
| `prettier` / `prettier-plugin-tailwindcss`                 | ^3.5.3 / ^0.6.12           | Formatting                              |
| `husky` / `lint-staged`                                    | ^9.1.7 / ^16.4.0           | Git hooks                               |
| `vitest` / `@vitejs/plugin-react` / `jsdom`                | ^4.1.5 / ^6.0.1 / ^29.1.1  | Unit testing                            |
| `@testing-library/react` / `dom` / `jest-dom`              | ^16.3.2 / ^10.4.1 / ^6.9.1 | Component testing                       |
| `@playwright/test`                                         | ^1.59.1                    | E2E testing                             |
| `drizzle-kit`                                              | ^0.31.1                    | Migrations / Drizzle Studio             |
| `tailwindcss` / `@tailwindcss/postcss`                     | ^4                         | Styling                                 |
| `babel-plugin-react-compiler`                              | ^1.0.0                     | React Compiler                          |
| `dotenv-cli`                                               | ^11.0.0                    | Loading `.env.prod` for prod DB scripts |

## External docs

Next.js · React · Tailwind v4 · Shadcn/UI · Radix · Drizzle · Clerk ·
Stripe · Resend · Cloudflare R2 · Sentry · next-intl · Zustand · SWR ·
Vitest · Playwright.

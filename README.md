# 🚀 NextLaunch

Production-ready Next.js 16 boilerplate with auth, payments, email, storage, i18n, and a clean architecture — skip setup and start building features immediately.

## ✨ What's Included

| Category | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) + React 19 |
| **Styling** | Tailwind CSS v4 + Shadcn/UI + Lucide Icons |
| **Database** | PostgreSQL via NeonDB + Drizzle ORM |
| **Auth** | Clerk (proxy + auth helpers + webhook) |
| **Payments** | Stripe (client + webhook) |
| **Email** | Resend (send function + HTML templates) |
| **Storage** | Cloudflare R2 (S3-compatible) |
| **i18n** | next-intl (Spanish default + English) |
| **State** | Zustand (client) + SWR (server) |
| **Forms** | React Hook Form + Zod validation |
| **Theming** | next-themes (dark mode ready) |
| **Toasts** | Sonner |

## 🏗️ Architecture Highlights

- **Environment Validation** — Zod schemas validate all env vars at startup. Fail fast with clear errors.
- **Auth Helpers** — `requireAuth()`, `requireRole()`, `getCurrentUser()` — no raw Clerk calls in business logic.
- **Error Hierarchy** — Typed error classes (`NotFoundError`, `ValidationError`, `ForbiddenError`, etc.) with automatic API error handling.
- **Structured Logger** — `logger.info/warn/error/debug` with timestamps and metadata. Swap to Pino/Axiom later without changing call sites.
- **Data Access Layer (DAL)** — All DB queries isolated in `src/data/`. UI never imports the DB client directly.
- **Typed Server Actions** — All actions return `ActionResponse<T>` (discriminated union). The `useAction()` hook handles loading/error state automatically.
- **API Route Helpers** — `withErrorHandler()` HOC catches errors and returns consistent JSON responses.
- **SWR Fetcher** — Typed `fetcher<T>` with `FetchError` class for data fetching.
- **Email System** — `sendEmail()` + HTML template functions. Easy to extend with new templates.
- **Webhook Routes** — Clerk (svix verified) + Stripe (signature verified), fully scaffolded.

## 🚀 Quick Start

### 1. Create Your Project from Template

Click **"Use this template"** on GitHub, or via CLI:

```bash
gh repo create my-project --template hwong/nextlaunch --clone
cd my-project
```

### 2. Run Setup Script

This renames all `NextLaunch` references to your project name:

```bash
chmod +x setup.sh
./setup.sh MyProjectName
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment

```bash
cp .env.example .env.local
```

Fill in your API keys:

| Service | Where to get keys |
|---|---|
| **NeonDB** | [console.neon.tech](https://console.neon.tech) |
| **Clerk** | [dashboard.clerk.com](https://dashboard.clerk.com) |
| **Stripe** | [dashboard.stripe.com](https://dashboard.stripe.com) |
| **Resend** | [resend.com](https://resend.com) |
| **Cloudflare R2** | [dash.cloudflare.com](https://dash.cloudflare.com) → R2 |

### 5. Push Database Schema

```bash
npm run db:push
```

### 6. (Optional) Seed Database

```bash
npm run db:seed
```

### 7. Start Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 📂 Project Structure

```
src/
├── actions/          # Server Actions (auth + validate + DAL + typed response)
├── app/              # App Router pages, layouts, API routes
│   ├── [locale]/     # i18n locale wrapper (es/en)
│   └── api/webhooks/ # Clerk + Stripe webhook handlers
├── components/ui/    # Shadcn/UI primitives (Button, Card, Input, Label, Sonner)
├── data/             # Data Access Layer — pure DB queries
├── hooks/            # Custom hooks (useAction)
├── i18n/             # Internationalization config + routing
├── lib/              # SDK clients, utils, logger, env, auth, errors, api helpers
│   ├── db/           # Drizzle ORM connection + schema + seed
│   └── email/        # Email send function + HTML templates
├── messages/         # Translation JSON files (es.json, en.json)
├── proxy.ts          # Clerk auth + next-intl locale proxy (Next.js 16)
├── schemas/          # Zod validation schemas
├── store/            # Zustand stores
└── types/            # Shared TypeScript types (ActionResponse, PaginatedResponse)
```

## 🧰 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run db:push` | Push schema to NeonDB |
| `npm run db:generate` | Generate migrations |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:seed` | Seed database |

## 🏁 How to Start Your Project

1. **Define your domain** — Edit `src/lib/db/schema.ts` with your tables.
2. **Push schema** — `npm run db:push`.
3. **Create DAL functions** — Add files in `src/data/` for each entity.
4. **Build Server Actions** — Add files in `src/actions/` following the example pattern.
5. **Build UI** — Create pages in `src/app/[locale]/` and components in `src/components/`.
6. **Update CONTEXT.MD** — Keep it updated as your single source of truth.

## 📖 CONTEXT.MD

This project includes a comprehensive `CONTEXT.MD` file that serves as the **Single Source of Truth (SSOT)** for any AI assistant or developer working on the project. It documents:

- Full tech stack and coding guidelines
- Complete directory structure and route inventory
- Database schema and DAL patterns
- All environment variables
- Known gotchas and architectural patterns
- Project roadmap and current status

**Always keep `CONTEXT.MD` updated** — it saves time for both humans and AI.

## 📄 License

MIT


# Roadmap

> Keep status under 6 lines. Read at the start of a session to know what's
> "current focus"; update it when a task completes. This file resets to
> the bootstrap state below every time this template is used to start a
> new project — fill it in with that project's actual plan.

- **Phase:** Template — not yet specialized into a product.
- **Active task:** None.
- **Blockers:** None.

## Now

- [ ] Run `./setup.sh <ProjectName>` and fill in `.env.local`.
- [ ] Decide which optional integrations (Stripe, R2, Resend, Sentry) this
      project actually needs — remove the rest per `docs/integrations.md`.
- [ ] Replace `src/lib/db/schema.ts`'s example `users` table with the
      project's real domain model; document it in `docs/domain-model.md`.

## Next

Domain tables → DAL (`src/data/`) → Server Actions
(`src/actions/`, following `example.ts`) → UI.

## Icebox

Nothing yet.

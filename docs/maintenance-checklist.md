# Maintenance Checklist

> Not relevant to a freshly cloned template — this is for a project that's
> live and needs a recurring health audit. Run monthly/quarterly once
> there are real users; update "Last run" below each time.

**Last run:** _(never — template state)_

## Security

- [ ] `npm audit` / Dependabot PRs reviewed and merged.
- [ ] Rotate any secret that's been exposed or that a former
      collaborator had access to.
- [ ] Confirm `SKIP_ENV_VALIDATION` isn't set in production.
- [ ] Confirm webhook routes (Clerk, Stripe) still verify signatures —
      a refactor is the most common way this silently regresses.
- [ ] Revisit the CSP in `next.config.mjs` — if you now know your exact
      Clerk/Stripe/Sentry origins, tighten `script-src`/`connect-src`
      from the `https:` wildcard default (see `docs/patterns-and-gotchas.md`).
- [ ] Confirm `/privacy` and `/terms` no longer show placeholder
      bracketed text or the "not legal advice" banner.

## Dependencies

- [ ] `npm outdated` — plan major-version bumps for `next`, `react`,
      `drizzle-orm`, `@clerk/nextjs` deliberately, don't let Dependabot
      auto-merge majors.
- [ ] After any `next` upgrade: run `npm run dev` once so its bundled
      docs and the `AGENTS.md` managed block stay version-matched — see
      `docs/integrations.md`'s "AI agent tooling" section.
- [ ] Remove any integration (`docs/integrations.md`) that ended up
      unused — an unused SDK is attack surface and a maintenance cost for
      no benefit.

## Data & backups

- [ ] Confirm Neon backups/point-in-time-restore window matches the
      project's actual recovery requirement.
- [ ] If Stripe is enabled: confirm webhook event handling is idempotent
      (dedupe on `event.id`) before it matters financially.

## SEO / correctness

- [ ] `robots.ts` still returns `noindex` outside production.
- [ ] `sitemap.ts` reflects current routes.
- [ ] Both locales (`es`, `en`) have complete translations — no silent
      fallback to English copy.

## Accessibility

- [ ] Spot-check keyboard navigation and focus visibility on any new UI
      shipped since the last run.
- [ ] Contrast check on any new color pairing — this template doesn't
      enforce WCAG/APCA automatically (see `docs/VISION.md` for what that
      would take to add).

## Performance

- [ ] `npm run build` output — check for an unexpectedly large route or
      first-load JS regression.
- [ ] Confirm images use `next/image` with real dimensions.

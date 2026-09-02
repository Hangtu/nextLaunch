# How to Contribute

## Local Development

Follow the **[README.md](README.md)** to set up the project locally.

## Before Committing

This repo uses **Husky** and **lint-staged**. When you run `git commit`:

1. **Prettier** formats staged files
2. **ESLint** auto-fixes staged `.ts/.tsx` files
3. **TypeScript** (`tsc --noEmit`) checks for type errors

If anything fails, the commit is aborted. Fix the errors and try again.

### If typecheck fails for stale routes

If you see errors in `.next/types/validator.ts` referencing deleted files/routes, it's stale cache:

```bash
npm run clean
npm run typecheck
```

## Commit messages

This repo enforces [Conventional Commits](https://www.conventionalcommits.org/)
(`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`, `style:`,
`perf:`, `ci:`, `build:`, `revert:`) via commitlint on the `commit-msg`
hook — see `commitlint.config.js`.

## Before Pushing

The `pre-push` hook blocks pushing directly to `main`/`master` and runs
`npm run lint`, `npm run typecheck` and `npm run build`. This prevents
broken builds on Vercel and keeps `main` behind a PR.

## Full Validation

To run the complete CI check locally (typecheck + lint + format + build):

```bash
npm run validate
```

## Code Formatting

- **Prettier** formats code on commit (via lint-staged). To format everything: `npm run format`. To check: `npm run format:check`.
- **EditorConfig** (`.editorconfig`): 2-space indent, LF, UTF-8. Your editor should pick it up automatically.

## Pull Request Checklist

- [ ] `npm run validate` passes locally
- [ ] No breaking changes introduced
- [ ] `AGENTS.md`/`docs/` updated if architecture, routes, or patterns changed

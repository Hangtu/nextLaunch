import "@testing-library/jest-dom";

// `src/lib/env.ts` parses `process.env` at import time — tests that
// transitively import it (rate-limit, integrations, anything under
// server-only libs) need these to exist. Real per-test overrides can
// still set specific vars before importing.
process.env.DATABASE_URL ??= "postgresql://user:pass@localhost:5432/test";
process.env.CLERK_SECRET_KEY ??= "sk_test_vitest_dummy_key";
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??= "pk_test_vitest_dummy_key";

// jsdom doesn't implement matchMedia — next-themes needs it for
// `enableSystem` to detect the OS color scheme preference.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

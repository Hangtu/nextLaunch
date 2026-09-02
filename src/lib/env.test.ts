import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";

// This is the core of "integrations are optional by construction"
// (AGENTS.md) — Stripe/R2/Resend/Upstash must stay disabled when unset,
// and flip on only once *all* of their required keys are present.
// `env.ts` reads `process.env` in a top-level IIFE, so each case needs a
// fresh module instance via `vi.resetModules()` + dynamic `import()`.

const REQUIRED_ENV = {
  DATABASE_URL: "postgresql://user:pass@localhost:5432/test",
  CLERK_SECRET_KEY: "sk_test_dummy",
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_dummy",
};

const originalEnv = { ...process.env };
const OPTIONAL_KEYS = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
] as const;

beforeEach(() => {
  vi.resetModules();
  // Keep the real ProcessEnv shape (NODE_ENV etc.) but reset every
  // optional-integration key so tests don't leak into each other.
  process.env = { ...originalEnv, ...REQUIRED_ENV };
  for (const key of OPTIONAL_KEYS) delete process.env[key];
});

afterAll(() => {
  process.env = originalEnv;
});

describe("integrations flags", () => {
  it("are all false when no optional keys are set", async () => {
    const { integrations } = await import("@/lib/env");
    expect(integrations).toEqual({
      stripe: false,
      r2: false,
      resend: false,
      upstash: false,
    });
  });

  it("flags stripe only when both its keys are set", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    const { integrations: partial } = await import("@/lib/env");
    expect(partial.stripe).toBe(false);

    vi.resetModules();
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_x";
    const { integrations: complete } = await import("@/lib/env");
    expect(complete.stripe).toBe(true);
  });

  it("flags r2 only when all four keys are set", async () => {
    process.env.R2_ACCOUNT_ID = "acct";
    process.env.R2_ACCESS_KEY_ID = "key";
    process.env.R2_SECRET_ACCESS_KEY = "secret";
    const { integrations: partial } = await import("@/lib/env");
    expect(partial.r2).toBe(false);

    vi.resetModules();
    process.env.R2_BUCKET_NAME = "bucket";
    const { integrations: complete } = await import("@/lib/env");
    expect(complete.r2).toBe(true);
  });

  it("flags resend only when both its keys are set", async () => {
    process.env.RESEND_API_KEY = "re_x";
    const { integrations: partial } = await import("@/lib/env");
    expect(partial.resend).toBe(false);

    vi.resetModules();
    process.env.RESEND_FROM_EMAIL = "hello@example.com";
    const { integrations: complete } = await import("@/lib/env");
    expect(complete.resend).toBe(true);
  });

  it("flags upstash only when both its keys are set", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    const { integrations: partial } = await import("@/lib/env");
    expect(partial.upstash).toBe(false);

    vi.resetModules();
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";
    const { integrations: complete } = await import("@/lib/env");
    expect(complete.upstash).toBe(true);
  });
});

describe("serverEnv", () => {
  it("throws a descriptive error when a required var is missing", async () => {
    delete process.env.DATABASE_URL;
    await expect(import("@/lib/env")).rejects.toThrow(/DATABASE_URL/);
  });
});

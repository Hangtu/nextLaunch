import { z } from "zod";

// =============================================================================
// Environment variable validation — fail fast with clear error messages
// =============================================================================

// Integrations below Clerk/Database are optional: this template ships with
// them wired up, but not every project needs payments, file storage, or
// transactional email. Leave the vars empty to disable a feature — see
// docs/integrations.md for what "disabled" means per integration and how to
// remove one entirely if you know you'll never need it.

const serverSchema = z.object({
  // Database — required
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),

  // Auth (Clerk) — required
  CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY is required"),

  // Cloudflare R2 — optional (file storage)
  R2_ACCOUNT_ID: z.string().min(1).optional(),
  R2_ACCESS_KEY_ID: z.string().min(1).optional(),
  R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  R2_BUCKET_NAME: z.string().min(1).optional(),

  // Stripe — optional (payments)
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),

  // Email (Resend) — optional
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z
    .string()
    .email("RESEND_FROM_EMAIL must be a valid email")
    .optional(),

  // Upstash Redis — optional (production-grade rate limiting; falls back
  // to an in-memory limiter that doesn't survive serverless when unset)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default("/login"),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default("/sign-up"),
  NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL: z.string().default("/"),
  NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL: z.string().default("/"),
  NEXT_PUBLIC_R2_PUBLIC_URL: z
    .string()
    .url("NEXT_PUBLIC_R2_PUBLIC_URL must be a valid URL")
    .optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
});

/**
 * Validated server-side environment variables.
 * Access via `serverEnv.DATABASE_URL` etc.
 * Throws at import-time if any variable is missing or invalid.
 */
export const serverEnv = (() => {
  // Skip validation during build (env vars may not be available)
  if (process.env.SKIP_ENV_VALIDATION === "true") {
    return process.env as unknown as z.infer<typeof serverSchema>;
  }

  const parsed = serverSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = parsed.error.issues
      .map((issue) => `  ✗ ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `❌ Invalid server environment variables:\n${formatted}\n\n` +
        `Check your .env.local file against .env.example.`
    );
  }

  return parsed.data;
})();

/**
 * Validated client-side environment variables (NEXT_PUBLIC_*).
 * Safe to use in both server and client components.
 */
export const clientEnv = (() => {
  if (process.env.SKIP_ENV_VALIDATION === "true") {
    return process.env as unknown as z.infer<typeof clientSchema>;
  }

  const parsed = clientSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = parsed.error.issues
      .map((issue) => `  ✗ ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `❌ Invalid client environment variables:\n${formatted}\n\n` +
        `Check your .env.local file against .env.example.`
    );
  }

  return parsed.data;
})();

/**
 * Which optional integrations have their required keys set. Use these to
 * gate feature code (e.g. hide a "Pay now" button) instead of letting an
 * unconfigured SDK throw deep in a request handler.
 */
export const integrations = {
  stripe: Boolean(
    serverEnv.STRIPE_SECRET_KEY && serverEnv.STRIPE_WEBHOOK_SECRET
  ),
  r2: Boolean(
    serverEnv.R2_ACCOUNT_ID &&
    serverEnv.R2_ACCESS_KEY_ID &&
    serverEnv.R2_SECRET_ACCESS_KEY &&
    serverEnv.R2_BUCKET_NAME
  ),
  resend: Boolean(serverEnv.RESEND_API_KEY && serverEnv.RESEND_FROM_EMAIL),
  upstash: Boolean(
    serverEnv.UPSTASH_REDIS_REST_URL && serverEnv.UPSTASH_REDIS_REST_TOKEN
  ),
} as const;

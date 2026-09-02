// @ts-check
import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // React Compiler — eliminates need for manual useMemo/useCallback
  reactCompiler: true,
  // Required for Docker multi-stage build optimization
  output: "standalone",
  experimental: {
    // Required for root-level not-found.tsx in Next.js 16
    globalNotFound: true,
    // Tree-shake heavy packages for smaller client bundles
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Baseline CSP: locks down the highest-value, lowest-breakage
          // directives (clickjacking via frame-ancestors, base-tag
          // hijacking, object/plugin injection). script-src/connect-src/
          // img-src/frame-src are deliberately left open to any https:
          // origin because Clerk, Stripe and Sentry each need specific
          // third-party origins that depend on which account/region
          // you're using — a wrong allowlist silently breaks sign-in or
          // checkout. Tighten these once you know your exact origins;
          // see docs/patterns-and-gotchas.md.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https: wss:",
              "frame-src https:",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

const configWithIntl = withNextIntl(nextConfig);

export default withSentryConfig(configWithIntl, {
  // Sentry organization slug — update after creating your Sentry project
  org: process.env.SENTRY_ORG,

  // Sentry project slug
  project: process.env.SENTRY_PROJECT,

  // Required in CI/Vercel to upload source maps
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers
  tunnelRoute: "/monitoring",

  webpack: {
    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});

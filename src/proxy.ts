import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

import { routing } from "@/i18n/routing";

// next-intl middleware for locale header/cookie handling
const intlMiddleware = createMiddleware(routing);

// Routes that require authentication (with and without locale prefix)
const isProtectedRoute = createRouteMatcher([
  "/:locale/dashboard(.*)",
  "/:locale/admin(.*)",
  "/:locale/settings(.*)",
]);

// Supported locales — must match i18n/config.ts
const locales = ["es", "en"];
const defaultLocale = "es";

function hasLocalePrefix(pathname: string): boolean {
  return locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
}

// Clerk middleware — only runs on locale-prefixed routes
const withClerk = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Run next-intl for locale header/cookie management
  return intlMiddleware(req);
});

// Root-level special files served by src/app/*.ts(x), outside [locale] and
// outside Clerk's concern — neither a locale redirect nor Clerk's own
// middleware initialization belongs on these. Without this, they either
// 307 to a nonexistent /es/robots.txt (breaking SEO discovery) or, once
// routed through Clerk's middleware, fail if Clerk isn't configured yet.
const rootLevelFiles = new Set(["/robots.txt", "/sitemap.xml"]);

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  const { pathname } = req.nextUrl;

  if (rootLevelFiles.has(pathname)) {
    return NextResponse.next();
  }

  // Skip locale processing for API and monitoring routes
  if (pathname.startsWith("/api") || pathname.startsWith("/monitoring")) {
    return withClerk(req, event);
  }

  // If the path has NO locale prefix, redirect to the default locale
  // e.g. / → /es, /login → /es/login, /dashboard → /es/dashboard
  if (!hasLocalePrefix(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url, 307);
  }

  // Path already has a locale prefix — run Clerk auth + intl middleware
  return withClerk(req, event);
}

export const config = {
  matcher: [
    // Root path — must be explicitly included for locale redirect
    "/",
    // All paths with locale prefix
    "/(es|en)/:path*",
    // All other dynamic paths (excluding static assets)
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // API routes
    "/(api|trpc)(.*)",
  ],
};

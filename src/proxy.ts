import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";

// next-intl middleware
const intlMiddleware = createMiddleware(routing);

// Routes that require authentication
const isProtectedRoute = createRouteMatcher([
    "/:locale/dashboard(.*)",
    "/:locale/admin(.*)",
    "/:locale/settings(.*)",
]);

// Routes that are always public (no auth needed)
const isPublicRoute = createRouteMatcher([
    "/:locale",
    "/:locale/login(.*)",
    "/:locale/sign-up(.*)",
    "/:locale/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
    // If it's a protected route, enforce authentication
    if (isProtectedRoute(req)) {
        await auth.protect();
    }

    // Run next-intl middleware for locale handling
    return intlMiddleware(req);
});

export const config = {
    // Match all pathnames except static files and Next.js internals
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};

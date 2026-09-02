import type { MetadataRoute } from "next";

import { APP_CONFIG } from "@/lib/constants";
import { routing } from "@/i18n/routing";

// path (no locale prefix) → priority. "" is the homepage.
const staticPaths: Record<string, number> = {
  "": 1,
  "/privacy": 0.3,
  "/terms": 0.3,
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // `localePrefix: "always"` (src/i18n/routing.ts) means every real route
  // is locale-prefixed — a bare `/privacy` 404s. Emit one entry per locale.
  const staticRoutes: MetadataRoute.Sitemap = routing.locales.flatMap(
    (locale) =>
      Object.entries(staticPaths).map(([path, priority]) => ({
        url: `${APP_CONFIG.url}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority,
      }))
  );

  // Dynamic routes — add database queries here when you have public content
  // Example:
  // const posts = await db.query.posts.findMany({
  //   where: eq(posts.published, true),
  //   columns: { slug: true, updated_at: true },
  // });
  // const dynamicRoutes = posts.map((p) => ({
  //   url: `${APP_CONFIG.url}/blog/${p.slug}`,
  //   lastModified: p.updated_at,
  //   changeFrequency: "weekly" as const,
  //   priority: 0.8,
  // }));

  return [...staticRoutes];
}

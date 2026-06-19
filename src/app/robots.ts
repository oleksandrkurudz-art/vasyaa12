import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/categories";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Адмінка, API і сторінки пошуку (малоцінні дублі) — не для індексації.
      disallow: ["/admin", "/api/", "/search"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

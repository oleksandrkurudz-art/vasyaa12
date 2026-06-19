import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { CATEGORIES, SITE_URL } from "@/lib/categories";

// Перегенеровуємо раз на годину (а не на кожен візит краулера) — карта сайту
// не мусить бути секунда-в-секунду свіжою.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await prisma.article.findMany({
    where: { status: "published" },
    select: {
      slug: true,
      updatedAt: true,
      category: { select: { slug: true } },
    },
    orderBy: { publishedAt: "desc" },
  });

  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "hourly", priority: 1 },
    ...CATEGORIES.map((c) => ({
      url: `${SITE_URL}/${c.slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];

  const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/${a.category.slug}/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...articlePages];
}

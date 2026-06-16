import { cache } from "react";
import { prisma } from "@/lib/db";

const PUBLISHED = { status: "published" as const };

/** Останні опубліковані новини (для головної). */
export function getLatestArticles(limit = 12) {
  return prisma.article.findMany({
    where: PUBLISHED,
    include: { category: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

/** Найпопулярніші новини за переглядами (для бічної колонки). */
export function getPopularArticles(limit = 5) {
  return prisma.article.findMany({
    where: PUBLISHED,
    include: { category: true },
    orderBy: { views: "desc" },
    take: limit,
  });
}

// `cache` дедуплікує однакові виклики в межах одного запиту
// (сторінки звертаються і з generateMetadata, і з самого компонента).

/** Опубліковані новини конкретного розділу. */
export const getArticlesByCategory = cache(async (slug: string) => {
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return null;

  const articles = await prisma.article.findMany({
    where: { ...PUBLISHED, categoryId: category.id },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
  });

  return { category, articles };
});

/** Одна стаття за slug (тільки опублікована). */
export const getArticleBySlug = cache((slug: string) => {
  return prisma.article.findFirst({
    where: { slug, ...PUBLISHED },
    include: { category: true },
  });
});

/** Збільшити лічильник переглядів. */
export function incrementViews(id: number) {
  return prisma.article.update({
    where: { id },
    data: { views: { increment: 1 } },
  });
}

/** Схожі новини (того ж розділу) для блоку «Читайте також». */
export function getRelatedArticles(
  article: { id: number; categoryId: number },
  limit = 3,
) {
  return prisma.article.findMany({
    where: {
      ...PUBLISHED,
      categoryId: article.categoryId,
      id: { not: article.id },
    },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

// УВАГА: SQLite `contains` чутливий до регістру для кирилиці (на відміну від ASCII).
// На Postgres варто додати `mode: "insensitive"`.
/** Пошук новин за заголовком, анонсом, текстом і тегами. */
export async function searchArticles(query: string) {
  const q = query.trim();
  if (!q) return [];
  return prisma.article.findMany({
    where: {
      ...PUBLISHED,
      OR: [
        { title: { contains: q } },
        { excerpt: { contains: q } },
        { body: { contains: q } },
        { tags: { contains: q.toLowerCase() } },
      ],
    },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
    take: 30,
  });
}

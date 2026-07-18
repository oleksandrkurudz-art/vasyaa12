import { cache } from "react";
import { prisma } from "@/lib/db";
import { getActiveCommunity, communityFilter } from "@/lib/community-filter";

const PUBLISHED = { status: "published" as const };

/** Останні опубліковані новини (для головної), відфільтровані за обраною громадою. */
export async function getLatestArticles(limit = 12) {
  const community = await getActiveCommunity();
  return prisma.article.findMany({
    where: { ...PUBLISHED, ...communityFilter(community?.id) },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

/** Термінові опубліковані новини (для червоної стрічки зверху). */
export function getBreakingArticles(limit = 3) {
  return prisma.article.findMany({
    where: { ...PUBLISHED, breaking: true },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

/** Найпопулярніші новини за переглядами (для бічної колонки), за обраною громадою. */
export async function getPopularArticles(limit = 5) {
  const community = await getActiveCommunity();
  return prisma.article.findMany({
    where: { ...PUBLISHED, ...communityFilter(community?.id) },
    include: { category: true },
    orderBy: { views: "desc" },
    take: limit,
  });
}

// `cache` дедуплікує однакові виклики в межах одного запиту
// (сторінки звертаються і з generateMetadata, і з самого компонента).

/** Скільки новин показуємо на одній сторінці розділу. */
export const CATEGORY_PAGE_SIZE = 12;

/** Опубліковані новини конкретного розділу (посторінково).
 *  Без ліміту вибірка тягла б усі новини розділу — з роками це повільно й дорого. */
export const getArticlesByCategory = cache(async (slug: string, page = 1) => {
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return null;

  const community = await getActiveCommunity();
  const where = {
    ...PUBLISHED,
    categoryId: category.id,
    ...communityFilter(community?.id),
  };

  const total = await prisma.article.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / CATEGORY_PAGE_SIZE));
  // Клампимо запитану сторінку в межі [1, totalPages] — ?page=999 покаже останню.
  const currentPage = Math.min(Math.max(1, Math.floor(page) || 1), totalPages);

  const articles = await prisma.article.findMany({
    where,
    include: { category: true },
    orderBy: { publishedAt: "desc" },
    skip: (currentPage - 1) * CATEGORY_PAGE_SIZE,
    take: CATEGORY_PAGE_SIZE,
  });

  return { category, articles, total, page: currentPage, totalPages };
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

/** Пошук новин за заголовком, анонсом, текстом і тегами.
 *  Postgres `contains` чутливий до регістру — тому `mode: "insensitive"`,
 *  інакше «Калуш» не знайде «калуш». */
export async function searchArticles(query: string) {
  // Обрізаємо надто довгі запити (захист від важких LIKE-сканів) і ігноруємо
  // односимвольні — вони збіглися б майже з усім і навантажували б базу дарма.
  const q = query.trim().slice(0, 100);
  if (q.length < 2) return [];
  return prisma.article.findMany({
    where: {
      ...PUBLISHED,
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
        { body: { contains: q, mode: "insensitive" } },
        { tags: { contains: q, mode: "insensitive" } },
      ],
    },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
    take: 30,
  });
}

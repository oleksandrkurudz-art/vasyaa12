import "server-only";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { formatTags } from "@/lib/tags";

/**
 * Гарантує унікальний slug статті (додає -2, -3 … при колізії).
 * Спільний для адмінки (saveArticle) і Telegram-бота.
 */
export async function uniqueSlug(
  base: string,
  excludeId?: number,
): Promise<string> {
  const root = slugify(base) || "novyna";
  let slug = root;
  let n = 1;
  while (true) {
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${root}-${++n}`;
  }
}

export type DraftInput = {
  title: string;
  excerpt: string;
  body: string;
  categorySlug: string;
  tags: string[];
  coverImage?: string | null;
  communityId?: number | null;
};

/**
 * Створює новину-чернетку (status="draft") з даних, які повернув копірайтер.
 * Мапить categorySlug → categoryId; невідома категорія → фолбек на першу.
 * Повертає id + slug створеної чернетки.
 */
export async function createArticleDraft(
  input: DraftInput,
): Promise<{ id: number; slug: string }> {
  const category =
    (await prisma.category.findUnique({
      where: { slug: input.categorySlug },
    })) ?? (await prisma.category.findFirst({ orderBy: { order: "asc" } }));

  if (!category) {
    throw new Error("У базі немає жодного розділу — спершу зробіть seed.");
  }

  const slug = await uniqueSlug(input.title);

  const article = await prisma.article.create({
    data: {
      slug,
      title: input.title,
      excerpt: input.excerpt,
      body: input.body,
      coverImage: input.coverImage ?? null,
      tags: formatTags(input.tags),
      status: "draft",
      categoryId: category.id,
      communityId: input.communityId ?? null,
    },
    select: { id: true, slug: true },
  });

  return article;
}

/**
 * Публікує чернетку: status="published" + publishedAt (якщо ще не стояла).
 * Повертає опубліковану статтю з категорією (для побудови URL) або null.
 */
export async function publishArticle(id: number) {
  const existing = await prisma.article.findUnique({
    where: { id },
    select: { publishedAt: true },
  });
  if (!existing) return null;
  return prisma.article.update({
    where: { id },
    data: {
      status: "published",
      publishedAt: existing.publishedAt ?? new Date(),
    },
    include: { category: true },
  });
}

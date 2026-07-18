import { prisma } from "@/lib/db";
import { parseTags } from "@/lib/tags";
import type { Ad, Advertiser } from "@/generated/prisma/client";

export type AdWithAdvertiser = Ad & { advertiser: Advertiser };

// Рівномірне перемішування (Фішер-Єйтс). `sort(() => Math.random() - 0.5)`
// дає зміщений розподіл — деякі позиції випадали б частіше.
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Рушій контекстної реклами.
 *
 * Підбирає банери до конкретної статті за принципом релевантності:
 *   score = (кількість спільних тегів) * 10 + (збіг категорії ? 3 : 0)
 *
 * Якщо релевантних банерів менше за `limit`, добираємо рештою активних
 * (загальна реклама), щоб місце під рекламу не пустувало.
 */
export async function getContextualAds(
  article: { tags: string; categoryId: number },
  limit = 3,
): Promise<AdWithAdvertiser[]> {
  const ads = await prisma.ad.findMany({
    where: { active: true },
    include: { advertiser: true },
  });

  const articleTags = new Set(parseTags(article.tags));

  const scored = ads.map((ad) => {
    const adTags = parseTags(ad.tags);
    const overlap = adTags.filter((t) => articleTags.has(t)).length;
    const categoryMatch = ad.categoryId === article.categoryId ? 1 : 0;
    const score = overlap * 10 + categoryMatch * 3;
    return { ad, score };
  });

  // Спочатку — релевантні (score > 0), за спаданням score.
  const relevant = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  // Добираємо загальною рекламою, якщо релевантних не вистачає.
  const filler = shuffle(scored.filter((s) => s.score === 0));

  return [...relevant, ...filler].slice(0, limit).map((s) => s.ad);
}

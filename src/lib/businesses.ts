import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { getActiveCommunity, communityFilter } from "@/lib/community-filter";

/** Скільки карток показуємо на одній сторінці каталогу. */
export const CATALOG_PAGE_SIZE = 12;

/** Prisma-where публічної видимості: активний І (безстроково АБО оплачено). */
export function businessVisibleWhere() {
  return {
    active: true,
    OR: [{ paidUntil: null }, { paidUntil: { gte: new Date() } }],
  };
}

/** Той самий предикат у JS — для вже завантажених записів (рушій реклами). */
export function isBusinessVisible(b: {
  active: boolean;
  paidUntil: Date | null;
}): boolean {
  return b.active && (b.paidUntil === null || b.paidUntil >= new Date());
}

/** Каталог: фільтр за категорією (?kat=) + громадою (cookie), посторінково.
 *  cache() — щоб generateMetadata і сам компонент не дублювали запит. */
export const getCatalogBusinesses = cache(
  async (categorySlug: string | null, page = 1) => {
    const community = await getActiveCommunity();
    // ВАЖЛИВО: і businessVisibleWhere(), і communityFilter() мають ключ `OR` —
    // через spread один затер би одного. Тому лише через AND.
    const where = {
      AND: [businessVisibleWhere(), communityFilter(community?.id)],
      ...(categorySlug ? { category: categorySlug } : {}),
    };

    const total = await prisma.business.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));
    const currentPage = Math.min(Math.max(1, Math.floor(page) || 1), totalPages);

    const businesses = await prisma.business.findMany({
      where,
      include: { community: true },
      orderBy: { name: "asc" },
      skip: (currentPage - 1) * CATALOG_PAGE_SIZE,
      take: CATALOG_PAGE_SIZE,
    });

    return { businesses, total, page: currentPage, totalPages };
  },
);

/** Одна картка за slug (тільки публічно видима — прострочена/вимкнена = null). */
export const getBusinessBySlug = cache((slug: string) => {
  return prisma.business.findFirst({
    where: { slug, ...businessVisibleWhere() },
    include: { community: true },
  });
});

/** Унікальний slug бізнесу (додає -2, -3… при колізії). */
export async function uniqueBusinessSlug(
  base: string,
  excludeId?: number,
): Promise<string> {
  const root = slugify(base) || "biznes";
  let slug = root;
  let n = 1;
  while (true) {
    const existing = await prisma.business.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${root}-${++n}`;
  }
}

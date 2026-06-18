import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

// Вибір громади користувачем зберігаємо в cookie (slug), щоб сервер одразу
// рендерив відфільтровану стрічку. Порожньо / немає cookie = весь район.
export const COMMUNITY_COOKIE = "community";

/** Активна громада з cookie. null = весь район (без фільтра).
 *  cache() — щоб кілька запитів за один рендер не дублювали лукап. */
export const getActiveCommunity = cache(async () => {
  const slug = (await cookies()).get(COMMUNITY_COOKIE)?.value;
  if (!slug) return null;
  return prisma.community.findUnique({ where: { slug } });
});

/** Усі громади за порядком. cache() — щоб Header і NavBar не дублювали запит
 *  за один рендер сторінки. */
export const getCommunities = cache(() =>
  prisma.community.findMany({ orderBy: { order: "asc" } }),
);

/** Фрагмент Prisma-where: новини обраної громади + загальнорайонні (null).
 *  Якщо громади не обрано — порожній фільтр (усе). */
export function communityFilter(communityId: number | null | undefined) {
  if (!communityId) return {};
  return { OR: [{ communityId }, { communityId: null }] };
}

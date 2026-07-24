// Канонічний список категорій каталогу бізнесу (/kataloh).
// Значення `slug` зберігається в Business.category (рядок, не enum — прецедент
// Advertiser.type). Класи badge — літеральні Tailwind-рядки (інакше сканер не
// згенерує), приглушені -50/-700 тони за колір-стратегією проєкту.
export type BusinessCategoryDef = {
  slug: string;
  name: string;
  badge: string;
};

export const BUSINESS_CATEGORIES: BusinessCategoryDef[] = [
  { slug: "torhivlia", name: "Торгівля та магазини", badge: "bg-emerald-50 text-emerald-700" },
  { slug: "kafe-restorany", name: "Кафе та ресторани", badge: "bg-amber-50 text-amber-700" },
  { slug: "budivnytstvo", name: "Будівництво та ремонт", badge: "bg-orange-50 text-orange-700" },
  { slug: "avto", name: "Авто та транспорт", badge: "bg-slate-100 text-slate-700" },
  { slug: "krasa", name: "Краса та здоров'я", badge: "bg-rose-50 text-rose-700" },
  { slug: "medytsyna", name: "Медицина та аптеки", badge: "bg-cyan-50 text-cyan-700" },
  { slug: "posluhy", name: "Побутові послуги", badge: "bg-violet-50 text-violet-700" },
  { slug: "silske", name: "Сільське господарство", badge: "bg-lime-50 text-lime-700" },
  { slug: "osvita", name: "Освіта та діти", badge: "bg-fuchsia-50 text-fuchsia-700" },
  { slug: "inshe", name: "Інше", badge: "bg-neutral-100 text-neutral-600" },
];

const FALLBACK = BUSINESS_CATEGORIES[BUSINESS_CATEGORIES.length - 1]; // «Інше»

/** Чи існує така категорія бізнесу. */
export function isBusinessCategory(slug: string): boolean {
  return BUSINESS_CATEGORIES.some((c) => c.slug === slug);
}

/** Людська назва категорії за slug (фолбек — «Інше»). */
export function businessCategoryName(slug: string): string {
  return BUSINESS_CATEGORIES.find((c) => c.slug === slug)?.name ?? FALLBACK.name;
}

/** Tailwind-класи badge за slug (фолбек — стиль «Інше»). */
export function businessCategoryBadge(slug: string): string {
  return BUSINESS_CATEGORIES.find((c) => c.slug === slug)?.badge ?? FALLBACK.badge;
}

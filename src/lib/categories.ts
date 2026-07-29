// Канонічний список розділів сайту (із ТЗ).
// Використовується для навігації та для наповнення БД (seed).
// `name` тут — ЄДИНЕ джерело відображуваної назви (картки, герой, хлібні крихти
// беруть її через `categoryName(slug)`, а не з БД) — тож перейменування суто в коді.
export type CategoryDef = {
  slug: string;
  name: string;
  // Рівень навігації: "primary" — у головній смузі меню; "more" — завжди під «Ще ▾».
  // Дворівнева навігація = маршрут читача, а не повний перелік рубрик.
  group: "primary" | "more";
};

export const CATEGORIES: CategoryDef[] = [
  { slug: "novyny", name: "Новини", group: "primary" },
  { slug: "polityka", name: "Влада", group: "primary" },
  { slug: "biznes", name: "Бізнес", group: "primary" },
  { slug: "afisha", name: "Події", group: "primary" },
  { slug: "lyudy", name: "Люди", group: "primary" },
  { slug: "ogoloshennya", name: "Оголошення", group: "primary" },
  { slug: "foto", name: "Фотогалерея", group: "more" },
  { slug: "vakansii", name: "Вакансії", group: "more" },
  { slug: "nekrolohy", name: "Пам'ять", group: "more" },
];

// Двa рівні навігації, похідні від `group`.
export const PRIMARY_CATEGORIES = CATEGORIES.filter((c) => c.group === "primary");
export const MORE_CATEGORIES = CATEGORIES.filter((c) => c.group === "more");

// Колірне кодування розділів. Класи — літеральні рядки (інакше сканер Tailwind
// їх не згенерує). Поля під різні контексти:
//  badge  — м'який чип (картки, «хлібна крихта» на статті);
//  solid  — залитий бейдж поверх фото (герой);
//  onDark — текст-підпис на темному тлі (другорядні в героєві);
//  text   — кольоровий текст (активний пункт меню, eyebrow);
//  border — кольоровий акцент-бордюр (шапка розділу, активний пункт меню).
//
// Стратегія кольору (маркетинг): бренд = ОДИН синій. Уся структура й акценти
// (герой, шапка розділу, активне меню, eyebrow) — завжди брендовий синій, щоб
// сайт мав впізнаваний колір і платні блоки/CTA мали на чому виділятися.
// Колір розділу лишається ЛИШЕ у дрібному `badge`-чипі — як тиха мітка для
// сканування стрічки, а не як декор на пів-екрана. Тому solid/onDark/text/border
// однакові (сині) для всіх розділів; відрізняється тільки `badge`.
export type CategoryStyle = {
  badge: string;
  solid: string;
  onDark: string;
  text: string;
  border: string;
};

// Брендові (сині) частини — спільні для всіх розділів. Літерали лишаються в
// коді, тож сканер Tailwind їх бачить.
const BRAND: Omit<CategoryStyle, "badge"> = {
  solid: "bg-brand-600 text-white",
  onDark: "text-brand-300",
  text: "text-brand-700",
  border: "border-brand-600",
};

export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  novyny: { ...BRAND, badge: "bg-brand-50 text-brand-700 hover:bg-brand-100" },
  polityka: {
    ...BRAND,
    badge: "bg-violet-50 text-violet-700 hover:bg-violet-100",
  },
  biznes: {
    ...BRAND,
    badge: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  },
  afisha: {
    ...BRAND,
    badge: "bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-100",
  },
  vakansii: { ...BRAND, badge: "bg-amber-50 text-amber-700 hover:bg-amber-100" },
  ogoloshennya: {
    ...BRAND,
    badge: "bg-orange-50 text-orange-700 hover:bg-orange-100",
  },
  foto: { ...BRAND, badge: "bg-cyan-50 text-cyan-700 hover:bg-cyan-100" },
  lyudy: { ...BRAND, badge: "bg-rose-50 text-rose-700 hover:bg-rose-100" },
  nekrolohy: {
    ...BRAND,
    badge: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  },
};

const DEFAULT_STYLE = CATEGORY_STYLES.novyny;

/** Стиль кольору для розділу за slug (з фолбеком на брендовий синій). */
export function categoryStyle(slug: string): CategoryStyle {
  return CATEGORY_STYLES[slug] ?? DEFAULT_STYLE;
}

/** Людська назва розділу за slug (фолбек — сам slug). */
export function categoryName(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}

export const SITE_NAME = "НРГ";
export const SITE_SLOGAN = "Незалежний регіональний голос";

// Базова адреса сайту — для абсолютних URL у метатегах (canonical, Open Graph).
// На Vercel можна задати NEXT_PUBLIC_SITE_URL; інакше — прод-домен за замовчуванням.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://vasyaa12.vercel.app";

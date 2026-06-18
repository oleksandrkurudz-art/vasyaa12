// Канонічний список розділів сайту (із ТЗ).
// Використовується для навігації та для наповнення БД (seed).
export type CategoryDef = {
  slug: string;
  name: string;
};

export const CATEGORIES: CategoryDef[] = [
  { slug: "novyny", name: "Новини громади" },
  { slug: "polityka", name: "Політика та рішення ради" },
  { slug: "biznes", name: "Бізнес громади" },
  { slug: "afisha", name: "Афіша подій" },
  { slug: "vakansii", name: "Вакансії" },
  { slug: "ogoloshennya", name: "Оголошення" },
  { slug: "foto", name: "Фотогалерея" },
  { slug: "lyudy", name: "Люди громади" },
  { slug: "nekrolohy", name: "Некрологи та співчуття" },
];

// Колірне кодування розділів. Класи — літеральні рядки (інакше сканер Tailwind
// їх не згенерує). Поля під різні контексти:
//  badge  — м'який чип (картки, «хлібна крихта» на статті);
//  solid  — залитий бейдж поверх фото (герой);
//  onDark — текст-підпис на темному тлі (другорядні в героєві);
//  text   — кольоровий текст (активний пункт меню, eyebrow);
//  border — кольоровий акцент-бордюр (шапка розділу, активний пункт меню).
export type CategoryStyle = {
  badge: string;
  solid: string;
  onDark: string;
  text: string;
  border: string;
};

export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  novyny: {
    badge: "bg-brand-50 text-brand-700 hover:bg-brand-100",
    solid: "bg-brand-600 text-white",
    onDark: "text-brand-300",
    text: "text-brand-700",
    border: "border-brand-600",
  },
  polityka: {
    badge: "bg-violet-50 text-violet-700 hover:bg-violet-100",
    solid: "bg-violet-600 text-white",
    onDark: "text-violet-300",
    text: "text-violet-700",
    border: "border-violet-600",
  },
  biznes: {
    badge: "bg-teal-50 text-teal-700 hover:bg-teal-100",
    solid: "bg-teal-600 text-white",
    onDark: "text-teal-300",
    text: "text-teal-700",
    border: "border-teal-600",
  },
  afisha: {
    badge: "bg-pink-50 text-pink-700 hover:bg-pink-100",
    solid: "bg-pink-600 text-white",
    onDark: "text-pink-300",
    text: "text-pink-700",
    border: "border-pink-600",
  },
  vakansii: {
    badge: "bg-amber-50 text-amber-700 hover:bg-amber-100",
    solid: "bg-amber-600 text-white",
    onDark: "text-amber-300",
    text: "text-amber-700",
    border: "border-amber-600",
  },
  ogoloshennya: {
    badge: "bg-orange-50 text-orange-700 hover:bg-orange-100",
    solid: "bg-orange-600 text-white",
    onDark: "text-orange-300",
    text: "text-orange-700",
    border: "border-orange-600",
  },
  foto: {
    badge: "bg-green-50 text-green-700 hover:bg-green-100",
    solid: "bg-green-600 text-white",
    onDark: "text-green-300",
    text: "text-green-700",
    border: "border-green-600",
  },
  lyudy: {
    badge: "bg-sky-50 text-sky-700 hover:bg-sky-100",
    solid: "bg-sky-600 text-white",
    onDark: "text-sky-300",
    text: "text-sky-700",
    border: "border-sky-600",
  },
  nekrolohy: {
    badge: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    solid: "bg-slate-600 text-white",
    onDark: "text-slate-300",
    text: "text-slate-700",
    border: "border-slate-600",
  },
};

const DEFAULT_STYLE = CATEGORY_STYLES.novyny;

/** Стиль кольору для розділу за slug (з фолбеком на брендовий синій). */
export function categoryStyle(slug: string): CategoryStyle {
  return CATEGORY_STYLES[slug] ?? DEFAULT_STYLE;
}

export const SITE_NAME = "Громада.Новини";
export const SITE_SLOGAN = "Новини, люди, бізнес — в одному місці";

// Базова адреса сайту — для абсолютних URL у метатегах (canonical, Open Graph).
// На Vercel можна задати NEXT_PUBLIC_SITE_URL; інакше — прод-домен за замовчуванням.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://vasyaa12.vercel.app";

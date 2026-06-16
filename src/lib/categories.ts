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
];

export const SITE_NAME = "Громада.Новини";
export const SITE_SLOGAN = "Новини, люди, бізнес — в одному місці";

// Базова адреса сайту — для абсолютних URL у метатегах (canonical, Open Graph).
// На Vercel можна задати NEXT_PUBLIC_SITE_URL; інакше — прод-домен за замовчуванням.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://vasyaa12.vercel.app";

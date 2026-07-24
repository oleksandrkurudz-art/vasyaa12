"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES, categoryStyle } from "@/lib/categories";

// Горизонтальне меню розділів для десктопа/планшета (на телефоні — бургер у шапці).
export default function NavLinks() {
  const pathname = usePathname();
  const isActive = (slug: string) => pathname === `/${slug}`;

  return (
    // На проміжних ширинах (планшети, малі ноутбуки) довгі назви не вміщаються —
    // меню скролиться ГОРИЗОНТАЛЬНО всередині смуги (overflow-x-auto), а не розтягує
    // сторінку. Тому БЕЗ min-w-max. Смугу прокрутки ховаємо — лишається свайп/тач.
    <ul className="flex gap-2 overflow-x-auto sm:gap-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {CATEGORIES.map((c) => (
        <li key={c.slug}>
          <Link
            href={`/${c.slug}`}
            className={`block whitespace-nowrap border-b-[3px] px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
              isActive(c.slug)
                ? `${categoryStyle(c.slug).border} ${categoryStyle(c.slug).text}`
                : "border-transparent text-neutral-600 hover:border-brand-300 hover:text-brand-700"
            }`}
          >
            {c.name}
          </Link>
        </li>
      ))}
      {/* Каталог бізнесу — грошовий продукт, акцентна синя пігулка (поза мапою). */}
      <li className="flex items-center">
        <Link
          href="/kataloh"
          className={`my-2 block whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold text-white transition-colors ${
            pathname.startsWith("/kataloh")
              ? "bg-brand-800"
              : "bg-brand-600 hover:bg-brand-700"
          }`}
        >
          Каталог бізнесу
        </Link>
      </li>
    </ul>
  );
}

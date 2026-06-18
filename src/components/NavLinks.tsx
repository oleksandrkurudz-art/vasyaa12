"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES, categoryStyle } from "@/lib/categories";
import CommunitySwitcher from "@/components/CommunitySwitcher";
import type { Community } from "@/generated/prisma/client";

export default function NavLinks({
  communities,
  activeCommunitySlug,
}: {
  communities: Community[];
  activeCommunitySlug: string | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (slug: string) => pathname === `/${slug}`;
  const activeName = CATEGORIES.find((c) => isActive(c.slug))?.name;

  // Закриваємо меню при зміні маршруту та по Escape.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // bg-колір для маркера-крапки розділу (перший клас із `solid` — літеральний,
  // тож сканер Tailwind його згенерує).
  const dotColor = (slug: string) => categoryStyle(slug).solid.split(" ")[0];

  return (
    <>
      {/* Десктоп/планшет — горизонтальне меню.
          На проміжних ширинах (планшети, малі ноутбуки) 7 довгих назв не
          вміщаються — меню скролиться ГОРИЗОНТАЛЬНО всередині смуги
          (overflow-x-auto), а не розтягує всю сторінку. Тому БЕЗ min-w-max:
          саме воно раніше робило <ul> ширшим за екран і давало горизонтальний
          скрол усієї сторінки. Смугу прокрутки ховаємо — лишається свайп/тач. */}
      <ul className="hidden gap-2 overflow-x-auto sm:flex sm:gap-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
      </ul>

      {/* Телефон — кнопка-бургер */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        className="flex w-full items-center justify-between py-3.5 text-sm font-bold text-neutral-800 sm:hidden"
      >
        <span className="flex items-center gap-2">
          <span className="text-neutral-400">Розділ:</span>
          <span className={activeName ? categoryStyle(CATEGORIES.find((c) => isActive(c.slug))!.slug).text : "text-neutral-800"}>
            {activeName ?? "усі"}
          </span>
        </span>
        <BurgerIcon open={open} />
      </button>

      {/* Затемнення під меню — клік закриває */}
      {open && (
        <button
          type="button"
          aria-hidden
          tabIndex={-1}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-20 cursor-default bg-black/30 backdrop-blur-[1px] sm:hidden"
        />
      )}

      {/* Випадне меню — плавне розкриття */}
      <div
        id="mobile-nav"
        className={`absolute inset-x-0 top-full z-30 origin-top overflow-hidden border-neutral-200 bg-white shadow-xl transition-all duration-200 ease-out sm:hidden ${
          open
            ? "max-h-[80vh] border-b opacity-100"
            : "pointer-events-none max-h-0 opacity-0"
        }`}
      >
        <div className="max-h-[80vh] overflow-y-auto overscroll-contain">
          {/* Перемикач громади — на телефоні живе тут, у бургері */}
          <div className="flex items-center gap-2 border-b border-neutral-200 bg-neutral-50 px-4 py-3">
            <span className="text-xs font-semibold text-neutral-500">
              Громада:
            </span>
            <CommunitySwitcher
              communities={communities}
              activeSlug={activeCommunitySlug}
              variant="light"
            />
          </div>

          <ul className="flex flex-col py-1.5">
            {CATEGORIES.map((c) => {
              const active = isActive(c.slug);
              return (
                <li key={c.slug}>
                  <Link
                    href={`/${c.slug}`}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 border-l-[3px] px-4 py-3 text-[0.95rem] font-semibold transition-colors ${
                      active
                        ? `${categoryStyle(c.slug).border} ${categoryStyle(c.slug).badge}`
                        : "border-transparent text-neutral-700 active:bg-neutral-100 hover:bg-neutral-100"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${dotColor(c.slug)}`}
                      aria-hidden
                    />
                    {c.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}

function BurgerIcon({ open }: { open: boolean }) {
  // Лінії плавно перетворюються на «хрестик».
  return (
    <span className="relative block h-[18px] w-[22px]" aria-hidden>
      <span
        className={`absolute left-0 block h-[2.5px] w-full rounded-full bg-current transition-all duration-300 ${
          open ? "top-[8px] rotate-45" : "top-0"
        }`}
      />
      <span
        className={`absolute left-0 top-[8px] block h-[2.5px] w-full rounded-full bg-current transition-all duration-200 ${
          open ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`absolute left-0 block h-[2.5px] w-full rounded-full bg-current transition-all duration-300 ${
          open ? "top-[8px] -rotate-45" : "top-[16px]"
        }`}
      />
    </span>
  );
}

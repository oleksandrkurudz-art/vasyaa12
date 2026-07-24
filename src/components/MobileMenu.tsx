"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import CommunityChips from "@/components/CommunityChips";
import type { Community } from "@/generated/prisma/client";

// Мобільне меню (бургер) у шапці: розділи + перемикач громади.
// На десктопі розділи живуть у липкій смузі NavBar, тож це лише для телефона.
export default function MobileMenu({
  communities,
  activeCommunitySlug,
}: {
  communities: Community[];
  activeCommunitySlug: string | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (slug: string) => pathname === `/${slug}`;

  // Пункти меню закривають його по кліку самі; це — підстраховка для навігації
  // не через них (напр. кнопка «назад»). Коригуємо стан під час рендера —
  // так радить React замість setState в ефекті (без зайвого циклу рендера).
  const [seenPath, setSeenPath] = useState(pathname);
  if (pathname !== seenPath) {
    setSeenPath(pathname);
    setOpen(false);
  }

  // Закриваємо по Escape, поки меню відкрите.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label="Меню розділів"
        className="-mr-1 flex h-9 w-9 items-center justify-center rounded-md text-white transition-colors hover:bg-white/10"
      >
        <BurgerIcon open={open} />
      </button>

      {/* Затемнення — під шапкою (не накриває бургер/хрестик), клік закриває */}
      {open && (
        <button
          type="button"
          aria-hidden
          tabIndex={-1}
          onClick={() => setOpen(false)}
          className="absolute inset-x-0 top-full z-30 h-screen cursor-default bg-black/30 backdrop-blur-[1px]"
        />
      )}

      {/* Випадне меню — темно-прозоре, як дропдаун громади на ПК. Плавне розкриття. */}
      <div
        id="mobile-nav"
        className={`absolute inset-x-0 top-full z-40 origin-top overflow-hidden bg-neutral-900/90 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur-md transition-all duration-200 ease-out ${
          open
            ? "max-h-[80vh] opacity-100"
            : "pointer-events-none max-h-0 opacity-0"
        }`}
      >
        <div className="max-h-[80vh] overflow-y-auto overscroll-contain">
          {/* Вибір громади — інлайн-чипи (без вкладеного дропдауна) */}
          <div className="border-b border-white/10 px-4 py-3">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Громада
            </span>
            <CommunityChips
              communities={communities}
              activeSlug={activeCommunitySlug}
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
                    className={`flex items-center border-l-[3px] px-4 py-3 text-[0.95rem] font-semibold transition-colors ${
                      active
                        ? "border-brand-500 bg-white/10 text-white"
                        : "border-transparent text-white hover:bg-white/5"
                    }`}
                  >
                    {c.name}
                  </Link>
                </li>
              );
            })}
            {/* Каталог бізнесу — окремо, відділений лінією (грошовий продукт). */}
            <li className="mt-1.5 border-t border-white/10 pt-1.5">
              <Link
                href="/kataloh"
                onClick={() => setOpen(false)}
                className={`flex items-center border-l-[3px] px-4 py-3 text-[0.95rem] font-semibold transition-colors ${
                  pathname.startsWith("/kataloh")
                    ? "border-brand-500 bg-white/10 text-white"
                    : "border-transparent text-white hover:bg-white/5"
                }`}
              >
                Каталог бізнесу
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
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

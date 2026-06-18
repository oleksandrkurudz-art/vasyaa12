"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES, categoryStyle } from "@/lib/categories";
import CommunitySwitcher from "@/components/CommunitySwitcher";
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

  // Закриваємо при зміні маршруту та по Escape.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // bg-колір крапки-маркера розділу (перший клас `solid` — літеральний).
  const dotColor = (slug: string) => categoryStyle(slug).solid.split(" ")[0];

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

      {/* Затемнення — клік закриває */}
      {open && (
        <button
          type="button"
          aria-hidden
          tabIndex={-1}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 cursor-default bg-black/30 backdrop-blur-[1px]"
        />
      )}

      {/* Випадне меню — плавне розкриття під шапкою */}
      <div
        id="mobile-nav"
        className={`absolute inset-x-0 top-full z-40 origin-top overflow-hidden border-neutral-200 bg-white text-neutral-900 shadow-xl transition-all duration-200 ease-out ${
          open
            ? "max-h-[80vh] border-b opacity-100"
            : "pointer-events-none max-h-0 opacity-0"
        }`}
      >
        <div className="max-h-[80vh] overflow-y-auto overscroll-contain">
          {/* Перемикач громади */}
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
                        : "border-transparent text-neutral-700 hover:bg-neutral-100 active:bg-neutral-100"
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

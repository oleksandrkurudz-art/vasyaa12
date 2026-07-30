"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import NavLinks from "@/components/NavLinks";
import CommunitySwitcher from "@/components/CommunitySwitcher";
import { PRIMARY_CATEGORIES, MORE_CATEGORIES } from "@/lib/categories";
import type { Community } from "@/generated/prisma/client";

// Липка смуга під чорним масthead-ом НРГ (десктоп/планшет). Два стани:
//  • верх сторінки — повна відцентрована навігація розділів (`NavLinks`);
//  • на скролі (масthead поза екраном) — компактний бар у стилі BBC:
//    [≡🔍 меню+пошук] · [НРГ по центру] · [район праворуч]. Одна іконка відкриває
//    панель із полем пошуку зверху + усіма розділами. Локацію тримає окремий
//    перемикач громади праворуч.
export default function StickyNav({
  communities,
  activeCommunitySlug,
}: {
  communities: Community[];
  activeCommunitySlug: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (slug: string) => pathname === `/${slug}`;

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // Фокус на поле пошуку, коли панель відкривається (пошук — головна дія іконки).
  useEffect(() => {
    if (menuOpen) searchRef.current?.focus();
  }, [menuOpen]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setMenuOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  // Щойно сторінка проїхала повз чорний масthead — вмикаємо компактний режим.
  useEffect(() => {
    const THRESHOLD = 64;
    const onScroll = () => setScrolled(window.scrollY > THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Закриваємо бургер при зміні сторінки, поверненні у повний режим, Escape.
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (!scrolled) setMenuOpen(false);
  }, [scrolled]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      {/* Повна навігація — липка, у потоці. На скролі її беззвучно накриває
          компактний бар (нижче), тож ховаємо її для клавіатури/скрінрідера. */}
      <div
        aria-hidden={scrolled}
        className={`sticky top-0 z-30 hidden sm:block ${
          scrolled ? "pointer-events-none" : ""
        }`}
      >
        <NavLinks />
      </div>

      {/* Компактний BBC-бар — фіксований, плавно зʼїжджає згори на скролі
          (translateY + fade), ніби «НРГ спускається» у смугу. */}
      <div
        aria-hidden={!scrolled}
        className={`fixed inset-x-0 top-0 z-40 hidden transition-all duration-300 ease-out sm:block ${
          scrolled
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-full opacity-0"
        }`}
      >
        <div className="relative border-b border-neutral-200 bg-neutral-100 shadow-md">
          {/* Компактний бар: три колонки, «НРГ» точно по центру. */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-2 sm:px-6">
            {/* Ліворуч — одна іконка «меню+пошук» (≡🔍), як у BBC. */}
            <div className="flex items-center justify-self-start">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-controls="sticky-nav-menu"
                aria-label="Меню і пошук"
                className="flex h-9 items-center gap-2 rounded-md px-2 text-neutral-700 transition-colors hover:bg-neutral-200"
              >
                <BurgerIcon open={menuOpen} />
                <SearchIcon
                  className={`transition-opacity duration-200 ${
                    menuOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
              </button>
            </div>

            {/* По центру — знак НРГ (чорні плашки на білому). */}
            <div className="justify-self-center">
              <Logo size="sm" tone="onLight" />
            </div>

            {/* Праворуч — локація (громада). */}
            <div className="justify-self-end">
              <CommunitySwitcher
                communities={communities}
                activeSlug={activeCommunitySlug}
                variant="light"
              />
            </div>
          </div>

          {/* Затемнення під баром — клік закриває меню. */}
          {menuOpen && (
            <button
              type="button"
              aria-hidden
              tabIndex={-1}
              onClick={() => setMenuOpen(false)}
              className="absolute inset-x-0 top-full z-30 h-screen cursor-default bg-black/20"
            />
          )}

          {/* Випадне меню розділів (світле). */}
          <div
            id="sticky-nav-menu"
            className={`absolute inset-x-0 top-full z-40 origin-top overflow-hidden bg-white text-neutral-800 shadow-2xl ring-1 ring-black/5 transition-all duration-200 ease-out ${
              menuOpen
                ? "max-h-[80vh] opacity-100"
                : "pointer-events-none max-h-0 opacity-0"
            }`}
          >
            <div className="max-h-[80vh] overflow-y-auto overscroll-contain">
              {/* Поле пошуку — зверху панелі (пошук «переїхав» сюди з окремої іконки). */}
              <form
                onSubmit={submitSearch}
                role="search"
                className="border-b border-neutral-100 p-3"
              >
                <div className="relative">
                  <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    ref={searchRef}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Пошук новин…"
                    aria-label="Пошук новин"
                    className="w-full rounded-full border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-500"
                  />
                </div>
              </form>

              <ul className="py-1.5">
                <MenuLink
                  href="/"
                  active={pathname === "/"}
                  onClick={() => setMenuOpen(false)}
                >
                  Головна
                </MenuLink>
              <MenuLink
                href="/kataloh"
                active={pathname.startsWith("/kataloh")}
                onClick={() => setMenuOpen(false)}
              >
                Каталог бізнесу
              </MenuLink>
              {PRIMARY_CATEGORIES.map((c) => (
                <MenuLink
                  key={c.slug}
                  href={`/${c.slug}`}
                  active={isActive(c.slug)}
                  onClick={() => setMenuOpen(false)}
                >
                  {c.name}
                </MenuLink>
              ))}
              {MORE_CATEGORIES.length > 0 && (
                <li className="mt-1 border-t border-neutral-100 px-4 pb-1 pt-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    Ще
                  </span>
                </li>
              )}
              {MORE_CATEGORIES.map((c) => (
                <MenuLink
                  key={c.slug}
                  href={`/${c.slug}`}
                  active={isActive(c.slug)}
                  onClick={() => setMenuOpen(false)}
                >
                  {c.name}
                </MenuLink>
              ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function MenuLink({
  href,
  active,
  onClick,
  children,
}: {
  href: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className={`flex items-center border-l-[3px] px-4 py-3 text-[0.95rem] font-semibold transition-colors ${
          active
            ? "border-brand-500 bg-brand-50 text-brand-700"
            : "border-transparent text-neutral-700 hover:bg-neutral-50"
        }`}
      >
        {children}
      </Link>
    </li>
  );
}

// Іконка лупи (спільна для комбінованої «≡🔍» та поля пошуку в панелі).
function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
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

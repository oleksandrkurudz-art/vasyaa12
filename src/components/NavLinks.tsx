"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CATEGORIES, categoryStyle, SITE_NAME } from "@/lib/categories";

// Горизонтальне меню розділів (десктоп/планшет). Priority+ навігація: скільки
// розділів влазить у смугу — показуємо, решту ховаємо під кнопку «Ще ▾».
// Каталог-пігулка (грошовий продукт) завжди видима. Кількість перераховується
// на зміну ширини (ResizeObserver) — тож і майбутні розділи обробляться самі.
const GAP = 4; // gap-1 (має збігатися з класом gap нижче)
const MORE_W = 64; // приблизна ширина кнопки «Ще ▾» + gap

export default function NavLinks() {
  const pathname = usePathname();
  const isActive = (slug: string) => pathname === `/${slug}`;

  const rowRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLUListElement>(null);
  const catalogRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const widthsRef = useRef<number[]>([]);

  const [visibleCount, setVisibleCount] = useState(CATEGORIES.length);
  const [moreOpen, setMoreOpen] = useState(false);
  // Коли темна шапка з лого прокручена вгору — показуємо компактне лого прямо
  // в липкій смузі розділів (лого «спускається» до категорій).
  const [scrolled, setScrolled] = useState(false);

  // Перерахунок кількості видимих розділів під поточну ширину смуги.
  function recalc() {
    const row = rowRef.current;
    const widths = widthsRef.current;
    if (!row || widths.length === 0) return;

    const total = row.clientWidth;
    const catalogW = catalogRef.current?.offsetWidth ?? 0;
    // Лого з'являється при скролі й забирає місце зліва — враховуємо його ширину.
    const logoW = logoRef.current?.offsetWidth ?? 0;

    // Чи влазять усі розділи без кнопки «Ще»?
    const sumAll = widths.reduce((a, w, i) => a + w + (i > 0 ? GAP : 0), 0);
    if (sumAll + GAP + catalogW + logoW <= total) {
      setVisibleCount(widths.length);
      return;
    }

    // Інакше резервуємо місце під «Ще» і рахуємо, скільки влазить.
    const avail = total - catalogW - logoW - GAP - MORE_W;
    let used = 0;
    let count = 0;
    for (let i = 0; i < widths.length; i++) {
      const w = widths[i] + (i > 0 ? GAP : 0);
      if (used + w <= avail) {
        used += w;
        count++;
      } else break;
    }
    setVisibleCount(Math.max(1, count));
  }

  // Заміряємо ширини пунктів (з прихованого повного списку) і слухаємо resize.
  useLayoutEffect(() => {
    if (measureRef.current) {
      widthsRef.current = Array.from(measureRef.current.children).map(
        (li) => (li as HTMLElement).offsetWidth,
      );
    }
    recalc();
    // Відкладаємо на кадр, щоб читати ширину ПІСЛЯ релейауту (інакше на resize
    // clientWidth ще старий). ResizeObserver — основний; window.resize — резерв.
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(recalc);
    };
    const ro = new ResizeObserver(schedule);
    if (rowRef.current) ro.observe(rowRef.current);
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Слухаємо скрол: щойно сторінка проїхала повз шапку — вмикаємо компактне лого.
  useEffect(() => {
    const THRESHOLD = 48; // ~висота, після якої темна шапка вже поза екраном
    const onScroll = () => setScrolled(window.scrollY > THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Поява/зникнення лого міняє доступну ширину — перераховуємо overflow.
  useEffect(() => {
    const raf = requestAnimationFrame(recalc);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrolled]);

  // Закриття «Ще» по кліку поза меню / Escape / зміні сторінки.
  useEffect(() => setMoreOpen(false), [pathname]);
  useEffect(() => {
    if (!moreOpen) return;
    function onPointer(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMoreOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  const visible = CATEGORIES.slice(0, visibleCount);
  const overflow = CATEGORIES.slice(visibleCount);
  const activeInOverflow = overflow.some((c) => isActive(c.slug));

  const linkClass = (slug: string) =>
    `block whitespace-nowrap border-b-[3px] px-3 py-3.5 text-sm font-semibold transition-all duration-200 ${
      isActive(slug)
        ? `${categoryStyle(slug).border} ${categoryStyle(slug).text}`
        : "border-transparent text-neutral-600 hover:border-brand-300 hover:text-brand-700"
    }`;

  return (
    <div ref={rowRef} className="relative flex items-center gap-1">
      {/* Компактне лого «спускається» в смугу розділів при скролі. Схлопнуте до
          нульової ширини, поки шапка на екрані, — тоді категорії тримають лівий край. */}
      <div
        ref={logoRef}
        className={`overflow-hidden transition-all duration-300 ease-out ${
          scrolled ? "mr-2 w-9 opacity-100" : "w-0 opacity-0"
        }`}
      >
        <Link
          href="/"
          aria-label={SITE_NAME}
          className={`flex h-9 w-9 items-center justify-center transition-transform duration-300 ease-out ${
            scrolled ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <span className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 shadow-sm ring-1 ring-inset ring-white/20">
            <span className="font-display text-lg font-black leading-none text-white">
              Г
            </span>
            <span className="absolute inset-x-1 bottom-[2px] h-[2px] rounded-full bg-white/55" />
          </span>
        </Link>
      </div>

      {/* Видимі розділи */}
      <ul className="flex items-center gap-1">
        {visible.map((c) => (
          <li key={c.slug}>
            <Link href={`/${c.slug}`} className={linkClass(c.slug)}>
              {c.name}
            </Link>
          </li>
        ))}
      </ul>

      {/* «Ще ▾» — розділи, що не влізли */}
      {overflow.length > 0 && (
        <div ref={moreRef} className="relative">
          <button
            type="button"
            aria-haspopup="true"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((v) => !v)}
            className={`flex items-center gap-1 whitespace-nowrap border-b-[3px] px-3 py-3.5 text-sm font-semibold transition-colors ${
              activeInOverflow
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-neutral-600 hover:text-brand-700"
            }`}
          >
            Ще
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden
              className={`transition-transform ${moreOpen ? "rotate-180" : ""}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {moreOpen && (
            <ul className="absolute left-0 top-full z-50 mt-0 min-w-[13rem] overflow-hidden rounded-b-lg border border-neutral-200 bg-white py-1 shadow-xl">
              {overflow.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/${c.slug}`}
                    className={`block px-4 py-2.5 text-sm font-medium transition-colors ${
                      isActive(c.slug)
                        ? "bg-neutral-50 text-brand-700"
                        : "text-neutral-700 hover:bg-neutral-50 hover:text-brand-700"
                    }`}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Каталог бізнесу — грошовий продукт, завжди видима акцентна пігулка. */}
      <div ref={catalogRef} className="ml-auto shrink-0 pl-2">
        <Link
          href="/kataloh"
          className={`block whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold text-white transition-colors ${
            pathname.startsWith("/kataloh")
              ? "bg-brand-800"
              : "bg-brand-600 hover:bg-brand-700"
          }`}
        >
          Каталог бізнесу
        </Link>
      </div>

      {/* Прихований повний список — лише для заміру ширин пунктів. */}
      <ul
        ref={measureRef}
        aria-hidden
        className="pointer-events-none invisible absolute left-0 top-0 flex gap-1"
      >
        {CATEGORIES.map((c) => (
          <li key={c.slug}>
            <span className={linkClass(c.slug)}>{c.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

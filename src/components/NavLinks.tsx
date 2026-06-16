"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";

export default function NavLinks() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (slug: string) => pathname === `/${slug}`;
  const activeName = CATEGORIES.find((c) => isActive(c.slug))?.name;

  return (
    <>
      {/* Десктоп — горизонтальне меню */}
      <ul className="hidden min-w-max gap-2 overflow-x-auto sm:flex sm:gap-4">
        {CATEGORIES.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/${c.slug}`}
              className={`block whitespace-nowrap border-b-[3px] px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
                isActive(c.slug)
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-neutral-600 hover:border-brand-300 hover:text-brand-700"
              }`}
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>

      {/* Телефон — кнопка-бургер + випадний список */}
      <div className="sm:hidden">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="flex w-full items-center justify-between py-3.5 text-sm font-semibold text-neutral-700"
        >
          <span>{activeName ?? "Розділи"}</span>
          <BurgerIcon open={open} />
        </button>

        {open && (
          <div
            id="mobile-nav"
            className="absolute inset-x-0 top-full border-b border-neutral-200 bg-neutral-100 shadow-md"
          >
            <ul className="flex flex-col px-4 py-1">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/${c.slug}`}
                    onClick={() => setOpen(false)}
                    className={`block border-l-[3px] py-2.5 pl-3 text-sm font-semibold transition-colors ${
                      isActive(c.slug)
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-transparent text-neutral-700 hover:bg-neutral-200/60"
                    }`}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}

function BurgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      {open ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
        </>
      ) : (
        <>
          <path d="M3 6h18" />
          <path d="M3 12h18" />
          <path d="M3 18h18" />
        </>
      )}
    </svg>
  );
}

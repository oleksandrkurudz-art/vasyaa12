import Link from "next/link";
import type { Metadata } from "next";
import BusinessCard from "@/components/BusinessCard";
import { getCatalogBusinesses } from "@/lib/businesses";
import {
  BUSINESS_CATEGORIES,
  isBusinessCategory,
} from "@/lib/business-categories";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Каталог бізнесу",
  description:
    "Підприємства, послуги та заклади громад Калущини в одному довіднику.",
  alternates: { canonical: "/kataloh" },
};

type Params = {
  searchParams: Promise<{ kat?: string; page?: string }>;
};

export default async function CatalogPage({ searchParams }: Params) {
  const { kat, page } = await searchParams;
  // Невідома категорія → показуємо всі (як «Усі»).
  const activeCat = kat && isBusinessCategory(kat) ? kat : null;
  const data = await getCatalogBusinesses(activeCat, Number(page) || 1);

  // Хелпер для збереження ?kat= у посиланнях пагінації.
  const pageHref = (p: number) => {
    const parts = [];
    if (activeCat) parts.push(`kat=${activeCat}`);
    if (p > 1) parts.push(`page=${p}`);
    return parts.length ? `/kataloh?${parts.join("&")}` : "/kataloh";
  };

  const chip = (active: boolean) =>
    `whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
      active
        ? "bg-brand-600 text-white"
        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
    }`;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <header className="border-l-4 border-brand-600 pl-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
          Довідник
        </p>
        <h1 className="mt-1 font-display text-3xl font-black tracking-tight text-neutral-900">
          Каталог бізнесу
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Підприємства та послуги громад Калущини в одному місці.
        </p>
      </header>

      {/* Фільтр за категорією */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/kataloh" className={chip(activeCat === null)}>
          Усі
        </Link>
        {BUSINESS_CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/kataloh?kat=${c.slug}`}
            className={chip(activeCat === c.slug)}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {data.businesses.length === 0 ? (
        <p className="py-16 text-center text-neutral-500">
          У цій категорії поки немає бізнесів.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.businesses.map((b) => (
            <BusinessCard key={b.id} business={b} />
          ))}
        </div>
      )}

      {data.totalPages > 1 && (
        <nav
          aria-label="Сторінки каталогу"
          className="mt-8 flex items-center justify-between border-t border-neutral-200 pt-5"
        >
          {data.page > 1 ? (
            <Link
              href={pageHref(data.page - 1)}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
            >
              ← Назад
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-neutral-500">
            Сторінка {data.page} з {data.totalPages}
          </span>
          {data.page < data.totalPages ? (
            <Link
              href={pageHref(data.page + 1)}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
            >
              Далі →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}

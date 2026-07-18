import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ArticleCard from "@/components/ArticleCard";
import Sidebar from "@/components/Sidebar";
import { getArticlesByCategory } from "@/lib/articles";
import { categoryStyle } from "@/lib/categories";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: Params): Promise<Metadata> {
  const { category } = await params;
  const { page } = await searchParams;
  const data = await getArticlesByCategory(category, Number(page) || 1);
  return { title: data?.category.name ?? "Розділ" };
}

export default async function CategoryPage({ params, searchParams }: Params) {
  const { category } = await params;
  const { page } = await searchParams;
  const data = await getArticlesByCategory(category, Number(page) || 1);

  if (!data) notFound();

  const style = categoryStyle(data.category.slug);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <header className={`border-l-4 pl-4 ${style.border}`}>
            <p
              className={`text-xs font-semibold uppercase tracking-wider ${style.text}`}
            >
              Розділ
            </p>
            <h1 className="mt-1 font-display text-3xl font-black tracking-tight text-neutral-900">
              {data.category.name}
            </h1>
          </header>

          {data.articles.length === 0 ? (
            <p className="py-12 text-center text-neutral-500">
              У цьому розділі поки немає новин.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {data.articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}

          {data.totalPages > 1 && (
            <nav
              aria-label="Сторінки розділу"
              className="flex items-center justify-between border-t border-neutral-200 pt-5"
            >
              {data.page > 1 ? (
                <Link
                  href={`/${data.category.slug}?page=${data.page - 1}`}
                  className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
                >
                  ← Новіші
                </Link>
              ) : (
                <span />
              )}
              <span className="text-sm text-neutral-500">
                Сторінка {data.page} з {data.totalPages}
              </span>
              {data.page < data.totalPages ? (
                <Link
                  href={`/${data.category.slug}?page=${data.page + 1}`}
                  className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
                >
                  Старіші →
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </div>

        <Sidebar />
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ArticleCard from "@/components/ArticleCard";
import Sidebar from "@/components/Sidebar";
import { getArticlesByCategory } from "@/lib/articles";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category } = await params;
  const data = await getArticlesByCategory(category);
  return { title: data?.category.name ?? "Розділ" };
}

export default async function CategoryPage({ params }: Params) {
  const { category } = await params;
  const data = await getArticlesByCategory(category);

  if (!data) notFound();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <header className="border-l-4 border-brand-600 pl-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
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
        </div>

        <Sidebar />
      </div>
    </div>
  );
}

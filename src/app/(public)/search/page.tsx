import type { Metadata } from "next";
import ArticleCard from "@/components/ArticleCard";
import SearchBox from "@/components/SearchBox";
import { searchArticles } from "@/lib/articles";

export const dynamic = "force-dynamic";

type Params = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({
  searchParams,
}: Params): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `Пошук: ${q}` : "Пошук" };
}

export default async function SearchPage({ searchParams }: Params) {
  const { q = "" } = await searchParams;
  const results = q.trim() ? await searchArticles(q) : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <header>
        <h1 className="font-display text-3xl font-black tracking-tight text-neutral-900">
          Пошук новин
        </h1>
        <div className="mt-4">
          <SearchBox className="max-w-md" />
        </div>
      </header>

      {q.trim() && (
        <p className="text-sm text-neutral-500">
          {results.length > 0
            ? `Знайдено ${results.length} за запитом «${q}»`
            : `Нічого не знайдено за запитом «${q}»`}
        </p>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import HeroBlock from "@/components/HeroBlock";
import Sidebar from "@/components/Sidebar";
import { getLatestArticles } from "@/lib/articles";

export const dynamic = "force-dynamic";

export default async function Home() {
  const articles = await getLatestArticles(13);

  if (articles.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">
          Поки що новин немає
        </h1>
        <p className="mt-2 text-neutral-500">
          Додайте першу новину через{" "}
          <Link href="/admin" className="text-brand-700 underline">
            кабінет редактора
          </Link>
          .
        </p>
      </div>
    );
  }

  const [featured, ...others] = articles;
  const secondary = others.slice(0, 3);
  const rest = others.slice(3);

  return (
    <>
      <h1 className="sr-only">Останні новини громади</h1>

      {/* Головний екран на всю ширину екрана, флеш під шапкою */}
      <HeroBlock featured={featured} secondary={secondary} />

      {/* Стрічка + бічна колонка — у контейнері */}
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-8">
            {rest.length > 0 && (
              <section>
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-5 w-1 rounded bg-brand-600" />
                  <h2 className="font-display text-xl font-black tracking-tight text-neutral-900">
                    Останні новини
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {rest.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </section>
            )}
          </div>

          <Sidebar />
        </div>
      </div>
    </>
  );
}

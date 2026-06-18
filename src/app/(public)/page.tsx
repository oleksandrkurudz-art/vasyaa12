import Link from "next/link";
import ArticleCard, { LeadArticleCard } from "@/components/ArticleCard";
import HeroBlock from "@/components/HeroBlock";
import NewsTicker from "@/components/NewsTicker";
import Sidebar from "@/components/Sidebar";
import { getLatestArticles } from "@/lib/articles";

export const dynamic = "force-dynamic";

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="h-5 w-1 rounded bg-brand-600" />
      <h2 className="font-display text-xl font-black tracking-tight text-neutral-900">
        {title}
      </h2>
    </div>
  );
}

export default async function Home() {
  const articles = await getLatestArticles(20);

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
  const feed = others.slice(3); // уся стрічка новин (текстом)
  // «Головні події» (з фото) — топ зі стрічки, показуємо ЛИШЕ на ПК.
  const mainEvents = feed.slice(0, 5);
  const [lead, ...tail] = mainEvents;

  return (
    <>
      <h1 className="sr-only">Останні новини громади</h1>

      {/* Головний екран на всю ширину екрана, флеш під шапкою */}
      <HeroBlock featured={featured} secondary={secondary} />

      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        {/* На телефоні (1 колонка) DOM-порядок: стрічка → (головні приховано) → сайдбар.
            На ПК: ліворуч (1fr) — «Головні події» (order-1), праворуч (340px) —
            стрічка + сайдбар (order-2). Тому «головні» в коді йдуть ПІСЛЯ стрічки. */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* ПРАВА колонка на ПК: стрічка новин (текст) + сайдбар */}
          <div className="space-y-8 lg:order-2">
            {feed.length > 0 && (
              <section>
                <SectionHeading title="Стрічка новин" />
                <NewsTicker articles={feed} />
              </section>
            )}
            <Sidebar />
          </div>

          {/* ЛІВА колонка — «Головні події» з фото, ЛИШЕ на ПК */}
          {mainEvents.length > 0 && (
            <section className="hidden lg:order-1 lg:block">
              <SectionHeading title="Головні події" />
              {lead && <LeadArticleCard article={lead} />}
              {tail.length > 0 && (
                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {tail.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </>
  );
}

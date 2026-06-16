import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import AdSlot from "@/components/AdSlot";
import ArticleCard from "@/components/ArticleCard";
import Cover from "@/components/Cover";
import ShareButtons from "@/components/ShareButtons";
import {
  getArticleBySlug,
  incrementViews,
  getRelatedArticles,
} from "@/lib/articles";
import { getContextualAds } from "@/lib/ads";
import { formatDate, formatViews, hasEnoughViews } from "@/lib/format";
import { parseTags } from "@/lib/tags";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ category: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Новину не знайдено" };
  return { title: article.title, description: article.excerpt };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  // Усі три операції незалежні — виконуємо паралельно.
  const [, ads, related] = await Promise.all([
    incrementViews(article.id),
    getContextualAds(article, 3),
    getRelatedArticles(article, 3),
  ]);
  const tags = parseTags(article.tags);
  const paragraphs = article.body.split(/\n{2,}/).filter((p) => p.trim());

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
        {/* Стаття */}
        <article className="min-w-0">
          <div className="flex items-center gap-3">
            <Link
              href={`/${article.category.slug}`}
              className="text-sm font-semibold uppercase tracking-wider text-brand-700 hover:underline"
            >
              {article.category.name}
            </Link>
          </div>
          <h1 className="font-display mt-2 text-3xl font-black leading-tight tracking-tight text-neutral-900 sm:text-[2.7rem] sm:leading-[1.12]">
            {article.title}
          </h1>
          <div className="mt-3 flex items-center gap-2 text-sm text-neutral-400">
            <time>{formatDate(article.publishedAt)}</time>
            {hasEnoughViews(article.views + 1) && (
              <>
                <span aria-hidden>·</span>
                <span>{formatViews(article.views + 1)} переглядів</span>
              </>
            )}
          </div>

          {article.coverImage && (
            <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-xl bg-neutral-100">
              <Cover
                src={article.coverImage}
                alt={article.title}
                sizes="(max-width: 1024px) 100vw, 700px"
                priority
                imgClassName="object-cover"
              />
            </div>
          )}

          <p className="mt-6 text-lg font-medium leading-relaxed text-neutral-700">
            {article.excerpt}
          </p>

          <div className="mt-4 space-y-4 text-base leading-relaxed text-neutral-800">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {/* Реклама в потоці (для мобільних) */}
          {ads.length > 0 && (
            <div className="mt-8 lg:hidden">
              <AdSlot ads={ads} />
            </div>
          )}

          {tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Поширення */}
          <div className="mt-8 border-t border-neutral-200 pt-6">
            <ShareButtons title={article.title} />
          </div>

          {/* Читайте також */}
          {related.length > 0 && (
            <section className="mt-12">
              <div className="mb-5 flex items-center gap-3">
                <span className="h-5 w-1 rounded bg-brand-600" />
                <h2 className="font-display text-xl font-black tracking-tight text-neutral-900">
                  Читайте також
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {related.map((a) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
            </section>
          )}
        </article>

        {/* Бічна колонка з контекстною рекламою (десктоп) */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <AdSlot ads={ads} />
          </div>
        </div>
      </div>
    </div>
  );
}

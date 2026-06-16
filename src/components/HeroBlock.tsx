import Link from "next/link";
import Cover from "@/components/Cover";
import { formatDate, formatViews, hasEnoughViews } from "@/lib/format";
import type { Article, Category } from "@/generated/prisma/client";

type ArticleWithCategory = Article & { category: Category };

/**
 * Головний екран у стилі ТСН: повноширинне фото головної новини
 * з накладеним заголовком і рядом другорядних новин поверх зображення.
 */
export default function HeroBlock({
  featured,
  secondary,
}: {
  featured: ArticleWithCategory;
  secondary: ArticleWithCategory[];
}) {
  const href = `/${featured.category.slug}/${featured.slug}`;

  return (
    <section className="relative overflow-hidden bg-neutral-900">
      {/* Фонове зображення головної новини */}
      <div className="absolute inset-0">
        <Cover
          src={featured.coverImage}
          alt={featured.title}
          sizes="100vw"
          priority
          imgClassName="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/20" />
      </div>

      <div className="relative mx-auto flex min-h-[480px] max-w-7xl flex-col justify-end px-4 py-8 sm:min-h-[600px] sm:px-6 sm:py-12">
        {/* Головна новина */}
        <Link href={href} className="group block max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="rounded bg-brand-600 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
              {featured.category.name}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-3 text-xs text-white/70">
            <time>{formatDate(featured.publishedAt)}</time>
            {hasEnoughViews(featured.views) && (
              <>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1">
                  <EyeIcon />
                  {formatViews(featured.views)}
                </span>
              </>
            )}
          </div>

          <h2 className="font-display mt-2 text-3xl font-black leading-tight text-white transition-colors group-hover:text-brand-200 sm:text-5xl sm:leading-[1.08]">
            {featured.title}
          </h2>
          <p className="mt-3 hidden max-w-2xl text-base text-white/80 sm:line-clamp-2 sm:block">
            {featured.excerpt}
          </p>
        </Link>

        {/* Ряд другорядних новин — поверх зображення */}
        {secondary.length > 0 && (
          <div className="mt-6 grid gap-px overflow-hidden rounded-xl bg-white/10 sm:mt-8 sm:grid-cols-3">
            {secondary.map((a) => (
              <Link
                key={a.id}
                href={`/${a.category.slug}/${a.slug}`}
                className="group flex gap-3 bg-black/30 p-3 backdrop-blur-sm transition-colors hover:bg-black/55"
              >
                <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-md bg-neutral-800">
                  <Cover
                    src={a.coverImage}
                    alt={a.title}
                    sizes="100px"
                    imgClassName="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-300">
                    {a.category.name}
                  </span>
                  <p className="mt-1 line-clamp-3 text-sm font-semibold leading-snug text-white transition-colors group-hover:text-brand-200">
                    {a.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function EyeIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

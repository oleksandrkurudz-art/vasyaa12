import Link from "next/link";
import Cover from "@/components/Cover";
import { formatDate, formatViews, hasEnoughViews } from "@/lib/format";
import type { Article, Category } from "@/generated/prisma/client";

type Props = {
  article: Article & { category: Category };
};

export default function ArticleCard({ article }: Props) {
  const href = `/${article.category.slug}/${article.slug}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <Link
        href={href}
        className="relative block aspect-[16/10] overflow-hidden bg-neutral-100"
      >
        <Cover
          src={article.coverImage}
          alt={article.title}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
          imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <CategoryBadge category={article.category} />
        <h3 className="font-display mt-2 text-lg font-bold leading-snug text-neutral-900">
          <Link href={href} className="transition-colors group-hover:text-brand-700">
            {article.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-neutral-600">
          {article.excerpt}
        </p>
        <Meta article={article} />
      </div>
    </article>
  );
}

function CategoryBadge({ category }: { category: Category }) {
  return (
    <Link
      href={`/${category.slug}`}
      className="w-fit rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700 transition-colors hover:bg-brand-100"
    >
      {category.name}
    </Link>
  );
}

function Meta({ article }: { article: Article }) {
  return (
    <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400">
      <time>{formatDate(article.publishedAt)}</time>
      {hasEnoughViews(article.views) && (
        <>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
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
            {formatViews(article.views)}
          </span>
        </>
      )}
    </div>
  );
}

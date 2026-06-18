import Link from "next/link";
import { categoryStyle } from "@/lib/categories";
import { formatDate } from "@/lib/format";
import type { Article, Category } from "@/generated/prisma/client";

type Item = Article & { category: Category };

// Текстова «стрічка новин» — компактний список заголовків без фото.
// На телефоні це основний спосіб перегляду стрічки; на ПК — права колонка.
export default function NewsTicker({ articles }: { articles: Item[] }) {
  return (
    <ul>
      {articles.map((a) => (
        <li
          key={a.id}
          className="group border-t border-brand-100 first:border-t-0"
        >
          <Link
            href={`/${a.category.slug}/${a.slug}`}
            className="block px-4 py-3 transition-colors hover:bg-neutral-50"
          >
            <div className="flex items-center gap-2 text-[11px] text-neutral-400">
              <span
                className={`font-semibold uppercase tracking-wide ${categoryStyle(a.category.slug).text}`}
              >
                {a.category.name}
              </span>
              <span aria-hidden>·</span>
              <time>{formatDate(a.publishedAt)}</time>
            </div>
            <h3 className="mt-1 text-sm font-semibold leading-snug text-neutral-800 transition-colors group-hover:text-brand-700">
              {a.title}
            </h3>
          </Link>
        </li>
      ))}
    </ul>
  );
}

import Link from "next/link";
import { getTickerArticles } from "@/lib/articles";

export default async function BreakingTicker() {
  const items = await getTickerArticles(6);
  if (items.length === 0) return null;

  // Дублюємо список, щоб анімація прокручувалася безшовно.
  const loop = [...items, ...items];

  return (
    <div className="border-b border-white/10 bg-neutral-900">
      <div className="ticker-pause flex items-center gap-3 overflow-hidden px-4 py-1 sm:px-6">
        {/* Бейдж замість суцільного блоку */}
        <span className="flex shrink-0 items-center gap-1.5 rounded bg-urgent-600 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          Терміново
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div className="animate-ticker flex w-max gap-8">
            {loop.map((a, i) => (
              <Link
                key={i}
                href={`/${a.category.slug}/${a.slug}`}
                className="flex shrink-0 items-center gap-2 text-xs text-neutral-300 transition-colors hover:text-white"
              >
                <span className="h-1 w-1 rounded-full bg-urgent-500" />
                {a.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

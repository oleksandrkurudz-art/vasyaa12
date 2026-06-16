import Link from "next/link";
import { getPopularArticles } from "@/lib/articles";
import { formatViews, hasEnoughViews } from "@/lib/format";

export default async function Sidebar() {
  const popular = await getPopularArticles(5);

  return (
    <aside className="space-y-6">
      {/* Популярне */}
      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-neutral-900">
          <span aria-hidden>🔥</span> Популярне
        </h2>
        <ol className="mt-4 space-y-4">
          {popular.map((a, i) => (
            <li key={a.id} className="flex gap-3">
              <span className="font-display text-xl font-black leading-none text-brand-200">
                {i + 1}
              </span>
              <div className="min-w-0">
                <Link
                  href={`/${a.category.slug}/${a.slug}`}
                  className="line-clamp-2 text-sm font-semibold text-neutral-800 transition-colors hover:text-brand-700"
                >
                  {a.title}
                </Link>
                {hasEnoughViews(a.views) && (
                  <p className="mt-1 text-xs text-neutral-400">
                    {formatViews(a.views)} переглядів
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Погода */}
      <section className="rounded-xl border border-neutral-200 bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-brand-100">Погода в громаді</p>
            <p className="mt-1 text-4xl font-black">+18°</p>
            <p className="text-sm text-brand-100">Хмарно з проясненнями</p>
          </div>
          <span className="text-5xl" aria-hidden>
            ⛅
          </span>
        </div>
        <div className="mt-4 flex justify-between border-t border-white/20 pt-3 text-xs text-brand-100">
          <span>Ранок +12°</span>
          <span>День +18°</span>
          <span>Вечір +14°</span>
        </div>
      </section>

      {/* Курси валют */}
      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="font-display text-lg font-bold text-neutral-900">
          Курси валют
        </h2>
        <table className="mt-3 w-full text-sm">
          <tbody className="divide-y divide-neutral-100">
            <tr>
              <td className="py-2 font-semibold text-neutral-700">USD</td>
              <td className="py-2 text-right text-neutral-500">купівля 41,20</td>
              <td className="py-2 text-right font-medium text-neutral-900">
                продаж 41,75
              </td>
            </tr>
            <tr>
              <td className="py-2 font-semibold text-neutral-700">EUR</td>
              <td className="py-2 text-right text-neutral-500">купівля 44,60</td>
              <td className="py-2 text-right font-medium text-neutral-900">
                продаж 45,30
              </td>
            </tr>
          </tbody>
        </table>
        <p className="mt-2 text-xs text-neutral-400">Дані оновлюються щодня</p>
      </section>
    </aside>
  );
}

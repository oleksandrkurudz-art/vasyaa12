import Link from "next/link";
import { getPopularArticles } from "@/lib/articles";
import { formatViews, hasEnoughViews } from "@/lib/format";
import { getWeather } from "@/lib/weather";
import { getRates, formatRateUk } from "@/lib/rates";

export default async function Sidebar() {
  // Джерела незалежні — тягнемо паралельно.
  const [popular, weather, rates] = await Promise.all([
    getPopularArticles(5),
    getWeather(),
    getRates(),
  ]);

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
              <span className="font-display text-xl font-black leading-none text-neutral-300">
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

      {/* Погода — спокійна біла картка, щоб не перетягувати увагу з контенту */}
      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500">
              Погода в громаді
            </p>
            <p className="mt-1 text-4xl font-black text-neutral-900">
              {fmtTemp(weather.temp)}
            </p>
            <p className="text-sm text-neutral-600">{weather.description}</p>
          </div>
          <span className="text-5xl" aria-hidden>
            {weather.emoji}
          </span>
        </div>
        {(weather.morning ?? weather.day ?? weather.evening) !== null && (
          <div className="mt-4 flex justify-between border-t border-neutral-100 pt-3 text-xs text-neutral-500">
            {weather.morning !== null && (
              <span>Ранок {fmtTemp(weather.morning)}</span>
            )}
            {weather.day !== null && <span>День {fmtTemp(weather.day)}</span>}
            {weather.evening !== null && (
              <span>Вечір {fmtTemp(weather.evening)}</span>
            )}
          </div>
        )}
      </section>

      {/* Курс валют — окрема спокійна плашка (перенесено з шапки). Джерело — НБУ. */}
      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <p className="text-sm font-medium text-neutral-500">Курс валют · НБУ</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="flex items-baseline justify-between rounded-lg bg-neutral-50 px-3 py-2">
            <span className="text-sm font-semibold text-neutral-500">USD</span>
            <span className="text-lg font-black tabular-nums text-neutral-900">
              {formatRateUk(rates.usd)}
            </span>
          </div>
          <div className="flex items-baseline justify-between rounded-lg bg-neutral-50 px-3 py-2">
            <span className="text-sm font-semibold text-neutral-500">EUR</span>
            <span className="text-lg font-black tabular-nums text-neutral-900">
              {formatRateUk(rates.eur)}
            </span>
          </div>
        </div>
      </section>
    </aside>
  );
}

// Температура зі знаком: 12 → «+12°», -3 → «−3°», 0 → «0°».
function fmtTemp(t: number): string {
  if (t > 0) return `+${t}°`;
  if (t < 0) return `−${Math.abs(t)}°`;
  return "0°";
}

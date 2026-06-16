import Link from "next/link";
import Logo from "@/components/Logo";
import { getRates, formatRate } from "@/lib/rates";

export default async function Header() {
  const rates = await getRates();
  // Обчислюємо при рендері, щоб дата не «застрягала» на момент старту сервера.
  const now = new Date();
  const weekday = new Intl.DateTimeFormat("uk-UA", { weekday: "short" }).format(
    now,
  );
  const dayMonth = new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "long",
  }).format(now);

  return (
    <header className="bg-neutral-900 text-white">
      {/* Логотип + сервіси (на всю ширину) */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Logo size="md" />
          {/* Дата — поруч із логотипом */}
          <span className="hidden whitespace-nowrap border-l border-white/15 pl-3 text-xs text-neutral-400 md:block">
            <span className="uppercase">{weekday}</span>, {dayMonth}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Курси валют — маленькі картки з прапорами */}
          <div className="hidden items-center gap-2 sm:flex">
            <span className="flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-1 text-xs">
              <span aria-hidden>🇺🇸</span>
              <span className="font-semibold text-white">
                {formatRate(rates.usd)}
              </span>
            </span>
            <span className="flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-1 text-xs">
              <span aria-hidden>🇪🇺</span>
              <span className="font-semibold text-white">
                {formatRate(rates.eur)}
              </span>
            </span>
          </div>

          {/* Пошук — пігулка з іконкою та підписом */}
          <Link
            href="/search"
            aria-label="Пошук новин"
            className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:border-white/40 hover:bg-white/5 hover:text-white"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <span className="hidden sm:inline">Пошук</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

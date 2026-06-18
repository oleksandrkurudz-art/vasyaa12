import Link from "next/link";
import Logo from "@/components/Logo";
import CommunitySwitcher from "@/components/CommunitySwitcher";
import MobileMenu from "@/components/MobileMenu";
import { getRates, formatRate } from "@/lib/rates";
import { getActiveCommunity, getCommunities } from "@/lib/community-filter";

export default async function Header() {
  const [rates, communities, activeCommunity] = await Promise.all([
    getRates(),
    getCommunities(),
    getActiveCommunity(),
  ]);
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
    // Липкий на телефоні (на десктопі фіксується NavBar). sticky = контейнер
    // для absolute-меню бургера.
    <header className="sticky top-0 z-40 bg-neutral-900 text-white sm:static sm:z-auto">
      {/* Логотип + сервіси (на всю ширину) */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Logo size="md" />
          {/* Дата — поруч із логотипом. На телефоні замінює прихований напис лого. */}
          <span className="whitespace-nowrap text-xs text-neutral-400 sm:border-l sm:border-white/15 sm:pl-3">
            <span className="uppercase">{weekday}</span>, {dayMonth}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Перемикач громади — на телефоні захований у бургер-меню (NavLinks) */}
          <div className="hidden sm:block">
            <CommunitySwitcher
              communities={communities}
              activeSlug={activeCommunity?.slug ?? null}
            />
          </div>

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

          {/* Бургер — лише на телефоні (розділи + громада) */}
          <MobileMenu
            communities={communities}
            activeCommunitySlug={activeCommunity?.slug ?? null}
          />
        </div>
      </div>
    </header>
  );
}

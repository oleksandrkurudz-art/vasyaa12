import Logo from "@/components/Logo";
import CommunitySwitcher from "@/components/CommunitySwitcher";
import HeaderSearch from "@/components/HeaderSearch";
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

          {/* Курси на телефоні — компактно біля дати, лише символ валюти (без прапорів) */}
          <span className="flex items-center gap-2 whitespace-nowrap text-xs tabular-nums text-neutral-400 sm:hidden">
            <span aria-hidden className="h-3 w-px bg-white/15" />
            <span className="flex items-baseline gap-0.5">
              <span className="text-neutral-500">$</span>
              <span className="font-semibold text-neutral-200">
                {formatRate(rates.usd)}
              </span>
            </span>
            <span className="flex items-baseline gap-0.5">
              <span className="text-neutral-500">€</span>
              <span className="font-semibold text-neutral-200">
                {formatRate(rates.eur)}
              </span>
            </span>
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

          {/* Курси валют НБУ — компактний тікер без «коробки» */}
          <div className="hidden items-center gap-3 text-xs tabular-nums sm:flex">
            <span className="flex items-baseline gap-1.5">
              <span aria-hidden>🇺🇸</span>
              <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                USD
              </span>
              <span className="font-semibold text-white">
                {formatRate(rates.usd)}
              </span>
              <span className="text-neutral-500">₴</span>
            </span>
            <span aria-hidden className="h-3.5 w-px bg-white/15" />
            <span className="flex items-baseline gap-1.5">
              <span aria-hidden>🇪🇺</span>
              <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                EUR
              </span>
              <span className="font-semibold text-white">
                {formatRate(rates.eur)}
              </span>
              <span className="text-neutral-500">₴</span>
            </span>
          </div>

          {/* Пошук — інлайн у шапці (розгортається по кліку, без окремої сторінки) */}
          <HeaderSearch />

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

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

  const dateLabel = (
    <>
      <span className="uppercase">{weekday}</span>, {dayMonth}
    </>
  );
  // Компактний курс: символ валюти + значення (без прапорів, приглушено).
  const rate = (symbol: string, value: number) => (
    <span className="flex items-baseline gap-0.5">
      <span className="text-neutral-500">{symbol}</span>
      <span className="font-semibold text-neutral-200">{formatRate(value)}</span>
    </span>
  );

  return (
    // Чорна шапка — фірмовий синій живе лише в плашці лого.
    // Липкий на телефоні (на десктопі фіксується NavBar); sticky = контейнер
    // для absolute-меню бургера.
    <header className="sticky top-0 z-40 bg-neutral-950 text-white sm:static sm:z-auto">
      {/* Три зони: [лого] … [ambient-інфо: дата·курси] │ [контроли: громада, пошук] */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:gap-5 sm:px-6">
        {/* Ліворуч — ідентичність. На телефоні поряд ще дата+курси (ambient).
            `self-stretch -my-3` тягне зону лого на всю висоту хедера (з'їдає
            вертикальний padding), щоб синя плашка знака сягала верху й низу. */}
        <div className="-my-3 flex min-w-0 items-center gap-3 self-stretch">
          <Logo size="md" variant="band" />
          <div className="flex items-center gap-2 whitespace-nowrap text-xs tabular-nums text-neutral-400 sm:hidden">
            <span className="border-l border-white/15 pl-3">{dateLabel}</span>
            <span aria-hidden className="h-3 w-px bg-white/15" />
            {rate("$", rates.usd)}
            {rate("€", rates.eur)}
          </div>
        </div>

        {/* Праворуч — згруповано: ambient-інфо, роздільник, контроли. */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Ambient-інфо (десктоп): дата · курси — приглушено, найнижчий пріоритет. */}
          <div className="hidden items-center gap-3 whitespace-nowrap text-xs tabular-nums text-neutral-400 lg:flex">
            <span>{dateLabel}</span>
            <span aria-hidden className="h-3.5 w-px bg-white/15" />
            <span className="flex items-baseline gap-2.5">
              {rate("$", rates.usd)}
              {rate("€", rates.eur)}
            </span>
          </div>

          {/* Роздільник між інформацією та контролами. */}
          <span aria-hidden className="hidden h-5 w-px bg-white/15 lg:block" />

          {/* Контроли (інтерактив) — перемикач громади + пошук, згруповані. */}
          <div className="hidden sm:block">
            <CommunitySwitcher
              communities={communities}
              activeSlug={activeCommunity?.slug ?? null}
            />
          </div>
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

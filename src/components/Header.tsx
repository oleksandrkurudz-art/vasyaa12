import Logo from "@/components/Logo";
import CommunitySwitcher from "@/components/CommunitySwitcher";
import HeaderSearch from "@/components/HeaderSearch";
import MobileMenu from "@/components/MobileMenu";
import { getActiveCommunity, getCommunities } from "@/lib/community-filter";

export default async function Header() {
  const [communities, activeCommunity] = await Promise.all([
    getCommunities(),
    getActiveCommunity(),
  ]);

  return (
    // Чорний масthead у стилі BBC: [пошук] — [НРГ по центру] — [громада].
    // Товста смуга-«газетна шапка»; уся навігація — окремою білою смугою нижче
    // (`NavBar`). Липкий на телефоні; на десктопі фіксується NavBar.
    <header className="sticky top-0 z-40 bg-neutral-950 text-white sm:static sm:z-auto">
      {/* Три колонки, щоб «НРГ» стояло точно по центру незалежно від ширини
          бічних груп. */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 sm:px-6 sm:py-4">
        {/* Ліворуч — пошук. */}
        <div className="flex justify-self-start">
          <HeaderSearch />
        </div>

        {/* По центру — знак НРГ (білі плашки на чорному). */}
        <div className="justify-self-center">
          <Logo size="md" tone="onDark" />
        </div>

        {/* Праворуч — локація (громада) + бургер на телефоні. */}
        <div className="flex items-center justify-end gap-3 justify-self-end">
          <div className="hidden sm:block">
            <CommunitySwitcher
              communities={communities}
              activeSlug={activeCommunity?.slug ?? null}
            />
          </div>
          <MobileMenu
            communities={communities}
            activeCommunitySlug={activeCommunity?.slug ?? null}
          />
        </div>
      </div>
    </header>
  );
}

import NavLinks from "@/components/NavLinks";
import { getActiveCommunity, getCommunities } from "@/lib/community-filter";

// Меню розділів окремою липкою смугою: лишається зверху при скролі,
// а темна шапка йде вгору. Винесене з <header>, щоб контейнером для
// sticky був увесь layout, а не лише шапка.
export default async function NavBar() {
  const [communities, activeCommunity] = await Promise.all([
    getCommunities(),
    getActiveCommunity(),
  ]);

  return (
    <div className="sticky top-0 z-30">
      {/* Синя акцент-лінія — тонкий «капелюх» липкої смуги */}
      <div className="h-0.5 bg-brand-600" />

      {/* Світло-сіра смуга меню: м'якший перехід від темного хедера, ніж різко-біла.
          Легка тінь відділяє її від контенту нижче. relative — щоб випадне
          мобільне меню позиціонувалось відносно смуги. */}
      <div className="relative border-b border-neutral-200 bg-neutral-100 shadow-md">
        <nav className="px-4 sm:px-6">
          <NavLinks
            communities={communities}
            activeCommunitySlug={activeCommunity?.slug ?? null}
          />
        </nav>
      </div>
    </div>
  );
}

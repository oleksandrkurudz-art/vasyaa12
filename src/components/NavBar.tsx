import StickyNav from "@/components/StickyNav";
import { getActiveCommunity, getCommunities } from "@/lib/community-filter";

// Липка смуга розділів під чорним масthead-ом НРГ (десктоп/планшет). Логіку двох
// станів (повна навігація ↔ компактний бар на скролі) тримає клієнтський
// `StickyNav`; тут лише тягнемо дані про громади для перемикача локації.
export default async function NavBar() {
  const [communities, activeCommunity] = await Promise.all([
    getCommunities(),
    getActiveCommunity(),
  ]);

  return (
    <StickyNav
      communities={communities}
      activeCommunitySlug={activeCommunity?.slug ?? null}
    />
  );
}

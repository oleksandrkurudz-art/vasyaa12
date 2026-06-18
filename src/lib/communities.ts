// Канонічний список громад Калущини.
// Використовується для наповнення БД (seed/upsert), вибору в адмінці/боті
// та (далі) для фільтра громад у шапці сайту.
// Новина без громади (communityId = null) — загальнорайонна, видно в усіх громадах.
export type CommunityDef = {
  slug: string;
  name: string;
};

export const COMMUNITIES: CommunityDef[] = [
  { slug: "dolynska", name: "Долинська" },
  { slug: "broshniv-osadska", name: "Брошнів-Осадська" },
  { slug: "vyhodska", name: "Вигодська" },
  { slug: "perehinska", name: "Перегінська" },
  { slug: "kaluska", name: "Калуська" },
];

// Підпис для загальнорайонних новин (communityId = null).
export const ALL_COMMUNITIES_LABEL = "Весь район";

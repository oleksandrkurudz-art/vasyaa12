import "server-only";

// Статус повітряної тривоги для Івано-Франківської області (Калущина в ній).
// Джерело — безкоштовне API UBilling Aerial Alerts (без ключа).
// УВАГА: API жорстко лімітує запити (429 при частих) — тому власний кеш ~60с
// на рівні модуля (той самий патерн, що в rates.ts/weather.ts), бо
// force-dynamic сторінки інакше били б у API щозапит.
export const AIR_RAID_REGION = "Івано-Франківська область";

const API = "https://ubilling.net.ua/aerialalerts/?json";
const TTL_MS = 60_000; // 1 хв

type RegionState = { alertnow?: boolean; changed?: string };
type AirRaid = { active: boolean; since: string | null };

let cache: { at: number; value: AirRaid } | null = null;

export async function getAirRaid(): Promise<AirRaid> {
  const now = Date.now();
  if (cache && now - cache.at < TTL_MS) return cache.value;

  try {
    const res = await fetch(API, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { states?: Record<string, RegionState> };
    const st = data.states?.[AIR_RAID_REGION];
    const active = Boolean(st?.alertnow);
    const value: AirRaid = { active, since: active ? (st?.changed ?? null) : null };
    cache = { at: now, value };
    return value;
  } catch {
    // На помилці не вигадуємо тривогу: якщо є кеш — віддаємо його,
    // інакше вважаємо, що тривоги немає (краще пропустити, ніж лякати хибно).
    if (cache) return cache.value;
    return { active: false, since: null };
  }
}

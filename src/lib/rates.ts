import { cache } from "react";

// Живі курси валют з офіційного API НБУ (без ключа).
// Документація: https://bank.gov.ua/ua/open-data/api-dev
// Кеш на рівні модуля (TTL ~1 год) — щоб не смикати API на кожен запит.
// Власний кеш, бо сторінки розділів/статей — force-dynamic, і там Next
// примусово ставить fetch `no-store` (next.revalidate ігнорується).

export type Rates = {
  /** Офіційний курс гривні за 1 USD. */
  usd: number;
  /** Офіційний курс гривні за 1 EUR. */
  eur: number;
  /** true, якщо це резервні значення (API недоступний). */
  fallback: boolean;
};

// Резервні значення на випадок недоступності API (узгоджені між шапкою й сайдбаром).
const FALLBACK: Rates = { usd: 41.3, eur: 44.85, fallback: true };

const TTL_MS = 60 * 60 * 1000;
const NBU_URL =
  "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json";

type NbuRate = { cc: string; rate: number };

let store: { data: Rates; at: number } | null = null;

async function load(): Promise<Rates> {
  const res = await fetch(NBU_URL, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`НБУ API: ${res.status}`);
  const list = (await res.json()) as NbuRate[];
  const find = (cc: string) => list.find((r) => r.cc === cc)?.rate;
  const usd = find("USD");
  const eur = find("EUR");
  if (typeof usd !== "number" || typeof eur !== "number") {
    throw new Error("НБУ API: немає USD/EUR у відповіді");
  }
  return { usd, eur, fallback: false };
}

/** Поточні курси НБУ. Кешуються ~1 год; за помилки — останнє вдале або резерв. */
export const getRates = cache(async (): Promise<Rates> => {
  if (store && Date.now() - store.at < TTL_MS) return store.data;
  try {
    const data = await load();
    store = { data, at: Date.now() };
    return data;
  } catch {
    return store?.data ?? FALLBACK;
  }
});

/** Формат для шапки: «41.30» (крапка, 2 знаки). */
export function formatRate(value: number): string {
  return value.toFixed(2);
}

/** Формат для сайдбара: «41,30» (кома — український запис). */
export function formatRateUk(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

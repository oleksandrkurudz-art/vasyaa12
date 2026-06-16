import { cache } from "react";

// Жива погода з open-meteo (безкоштовно, без ключа).
// Документація: https://open-meteo.com/en/docs
// Координати — Брошнів-Осадська громада (Івано-Франківська обл.).
// Кеш модуля (TTL ~1 год) + фолбек, з тих самих міркувань, що й у rates.ts.

const LAT = 48.79;
const LON = 24.32;

export type Weather = {
  /** Поточна температура, °C (округлено). */
  temp: number;
  /** Опис стану українською. */
  description: string;
  /** Емодзі-іконка стану. */
  emoji: string;
  /** Температура вранці / вдень / ввечері (°C) — для рядка прогнозу. */
  morning: number | null;
  day: number | null;
  evening: number | null;
  /** true, якщо це резервні значення (API недоступний). */
  fallback: boolean;
};

const FALLBACK: Weather = {
  temp: 18,
  description: "Хмарно з проясненнями",
  emoji: "⛅",
  morning: 12,
  day: 18,
  evening: 14,
  fallback: true,
};

const TTL_MS = 60 * 60 * 1000;
const URL =
  `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
  `&current=temperature_2m,weather_code&hourly=temperature_2m` +
  `&timezone=auto&forecast_days=1`;

// Мапінг WMO weather code → (опис, емодзі). https://open-meteo.com/en/docs
function describe(code: number): { description: string; emoji: string } {
  if (code === 0) return { description: "Ясно", emoji: "☀️" };
  if (code === 1) return { description: "Переважно ясно", emoji: "🌤️" };
  if (code === 2) return { description: "Мінлива хмарність", emoji: "⛅" };
  if (code === 3) return { description: "Хмарно", emoji: "☁️" };
  if (code === 45 || code === 48) return { description: "Туман", emoji: "🌫️" };
  if (code >= 51 && code <= 57) return { description: "Мряка", emoji: "🌦️" };
  if (code >= 61 && code <= 67) return { description: "Дощ", emoji: "🌧️" };
  if (code >= 71 && code <= 77) return { description: "Сніг", emoji: "🌨️" };
  if (code >= 80 && code <= 82) return { description: "Зливи", emoji: "🌦️" };
  if (code === 85 || code === 86)
    return { description: "Снігопад", emoji: "🌨️" };
  if (code >= 95) return { description: "Гроза", emoji: "⛈️" };
  return { description: "Мінлива хмарність", emoji: "⛅" };
}

type OpenMeteo = {
  current: { temperature_2m: number; weather_code: number };
  hourly: { time: string[]; temperature_2m: number[] };
};

let store: { data: Weather; at: number } | null = null;

// Температура для заданої години доби (з погодинного прогнозу на сьогодні).
function hourTemp(data: OpenMeteo, hour: number): number | null {
  const i = data.hourly.time.findIndex((t) => new Date(t).getHours() === hour);
  return i >= 0 ? Math.round(data.hourly.temperature_2m[i]) : null;
}

async function load(): Promise<Weather> {
  const res = await fetch(URL, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`open-meteo: ${res.status}`);
  const data = (await res.json()) as OpenMeteo;
  const { description, emoji } = describe(data.current.weather_code);
  return {
    temp: Math.round(data.current.temperature_2m),
    description,
    emoji,
    morning: hourTemp(data, 9),
    day: hourTemp(data, 15),
    evening: hourTemp(data, 19),
    fallback: false,
  };
}

/** Поточна погода в громаді. Кешується ~1 год; за помилки — останнє вдале або резерв. */
export const getWeather = cache(async (): Promise<Weather> => {
  if (store && Date.now() - store.at < TTL_MS) return store.data;
  try {
    const data = await load();
    store = { data, at: Date.now() };
    return data;
  } catch {
    return store?.data ?? FALLBACK;
  }
});

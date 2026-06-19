import "server-only";
import * as cheerio from "cheerio";

export type Extracted = {
  title: string;
  text: string;
  ogImage: string | null;
};

// Грубо вирізаємо «несмисловий» обвіс, щоб не слати весь HTML у Claude.
const STRIP = "script, style, noscript, nav, header, footer, aside, form, iframe";

/**
 * Завантажує сторінку за URL і витягує заголовок, основний текст і og:image.
 * Текст обрізаємо до ~8000 символів (економія токенів — Claude й так перепише).
 */
export async function fetchArticle(url: string): Promise<Extracted> {
  const res = await fetch(url, {
    headers: { "user-agent": "Mozilla/5.0 (GromadaNews bot)" },
    redirect: "follow",
    // Без таймауту повільна сторінка з'їла б увесь бюджет функції (maxDuration=60).
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Сторінка недоступна (HTTP ${res.status}).`);
  const contentType = (res.headers.get("content-type") || "").toLowerCase();
  if (contentType && !contentType.includes("html")) {
    throw new Error("За посиланням не вебсторінка (очікувався HTML).");
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  // og:image часто відносний ("/img/x.jpg") — робимо абсолютним відносно сторінки,
  // інакше next/image його відхилить.
  const ogImageRaw =
    $('meta[property="og:image"]').attr("content") ||
    $('meta[name="twitter:image"]').attr("content") ||
    null;
  let ogImage: string | null = null;
  if (ogImageRaw) {
    try {
      ogImage = new URL(ogImageRaw, res.url || url).href;
    } catch {
      ogImage = null;
    }
  }

  const title =
    $('meta[property="og:title"]').attr("content") ||
    $("title").first().text().trim() ||
    "";

  $(STRIP).remove();

  // Беремо <article> якщо є, інакше — увесь body.
  const root = $("article").length ? $("article") : $("body");
  const text = root
    .find("p, h1, h2, h3, li")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter((t) => t.length > 0)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .slice(0, 8000);

  return { title, text, ogImage };
}

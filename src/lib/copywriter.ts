import "server-only";
import OpenAI from "openai";
import { CATEGORIES } from "@/lib/categories";

// Модель за замовчуванням — gpt-4o-mini (дешево й добре для укр. рерайту).
// Змінюється через env OPENAI_MODEL (наприклад gpt-4o для вищої якості).
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug);

export type GeneratedArticle = {
  title: string;
  excerpt: string;
  body: string;
  categorySlug: string;
  tags: string[];
};

// Структуру віддаємо через json_schema (strict) — модель змушена повернути
// валідний JSON за схемою, без «балачок» навколо.
const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "excerpt", "body", "categorySlug", "tags"],
  properties: {
    title: {
      type: "string",
      description: "Заголовок новини (1 рядок, без крапки в кінці).",
    },
    excerpt: {
      type: "string",
      description: "Лід — 1–2 речення суті (анонс під заголовком).",
    },
    body: {
      type: "string",
      description:
        "Повний текст новини, кілька абзаців через порожній рядок. Чистий текст без HTML/Markdown.",
    },
    categorySlug: {
      type: "string",
      enum: CATEGORY_SLUGS,
      description: "Розділ сайту — один зі списку.",
    },
    tags: {
      type: "array",
      items: { type: "string" },
      description: "3–6 тегів у нижньому регістрі (для контекстної реклами).",
    },
  },
} as const;

const SYSTEM = `Ти — редактор українського локального новинного порталу «Громада.Новини» (Калущина, Івано-Франківська область).
Тобі дають сирий матеріал (текст або витяг зі статті). Перепиши його як НОВИНУ у стилі порталу.

Правила:
- Пиши українською, нейтрально-інформаційно, без «жовтизни» й без води.
- НЕ вигадуй фактів, цифр, цитат, імен чи дат — використовуй лише те, що є в матеріалі. Якщо чогось бракує — не згадуй.
- Заголовок — конкретний і ємкий.
- Лід (excerpt) — 1–2 речення, суть.
- Тіло (body) — кілька абзаців звичайним текстом (без Markdown і HTML), абзаци розділяй порожнім рядком.
- Обери ОДИН розділ зі списку доступних (categorySlug).
- Теги — 3–6 коротких слів у нижньому регістрі (міста, теми, бізнес — за ними добирається реклама).
- Не копіюй чужий текст дослівно — переказуй своїми словами (авторські права).`;

/**
 * Переписує сирий матеріал у структуровану новину через OpenAI.
 * Кидає помилку, якщо немає OPENAI_API_KEY або відповідь невалідна.
 */
export async function generateArticle(source: string): Promise<GeneratedArticle> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Не задано OPENAI_API_KEY.");

  const client = new OpenAI({ apiKey });

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Ось матеріал для переписування у новину:\n\n${source}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name: "article", strict: true, schema: SCHEMA },
    },
  });

  const message = completion.choices[0]?.message;
  if (message?.refusal) {
    throw new Error(`Модель відмовила: ${message.refusal}`);
  }
  const content = message?.content;
  if (!content) throw new Error("Порожня відповідь моделі.");

  const out = JSON.parse(content) as Partial<GeneratedArticle>;
  if (!out.title || !out.body || !out.categorySlug) {
    throw new Error("Неповна відповідь моделі (бракує полів).");
  }

  // Підстраховка: невідомий розділ → фолбек на перший.
  const categorySlug = CATEGORY_SLUGS.includes(out.categorySlug)
    ? out.categorySlug
    : CATEGORY_SLUGS[0];

  return {
    title: out.title,
    excerpt: out.excerpt || "",
    body: out.body,
    categorySlug,
    tags: Array.isArray(out.tags) ? out.tags : [],
  };
}

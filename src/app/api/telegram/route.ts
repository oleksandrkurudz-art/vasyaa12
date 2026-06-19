import { after } from "next/server";
import { revalidatePath } from "next/cache";
import {
  sendMessage,
  editMessageText,
  answerCallbackQuery,
  getFileBuffer,
  isAllowed,
  checkWebhookSecret,
  type InlineButton,
} from "@/lib/telegram";
import { generateArticle } from "@/lib/copywriter";
import { fetchArticle } from "@/lib/extract";
import { createArticleDraft, publishArticle } from "@/lib/article-write";
import { uploadImage } from "@/lib/storage";
import { categoryName, SITE_URL } from "@/lib/categories";

// Потрібні prisma/pg/sharp → лише Node-рантайм (не edge). До 60 с на генерацію.
export const runtime = "nodejs";
export const maxDuration = 60;

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const URL_RE = /https?:\/\/[^\s]+/i;

export async function POST(req: Request): Promise<Response> {
  if (!checkWebhookSecret(req.headers.get("x-telegram-bot-api-secret-token"))) {
    return new Response("forbidden", { status: 401 });
  }

  const update = (await req.json()) as TgUpdate;

  if (update.callback_query) {
    await handleCallback(update.callback_query);
    return Response.json({ ok: true });
  }

  const msg = update.message;
  if (msg?.chat) {
    if (!isAllowed(msg.from?.id)) {
      await sendMessage(msg.chat.id, "⛔ Доступ лише для редакторів порталу.");
      return Response.json({ ok: true });
    }
    // Важка робота (генерація) — у фоні, щоб одразу віддати 200 і Telegram не ретраїв.
    after(() => handleMessage(msg).catch(() => {}));
    return Response.json({ ok: true });
  }

  return Response.json({ ok: true });
}

async function handleMessage(msg: TgMessage): Promise<void> {
  const chatId = msg.chat!.id;
  try {
    const { source, coverImage } = await buildSource(msg);
    if (!source.trim()) {
      await sendMessage(
        chatId,
        "Надішліть текст новини, посилання на статтю або фото з підписом.",
      );
      return;
    }

    await sendMessage(chatId, "⏳ Готую новину…");

    const article = await generateArticle(source);
    const draft = await createArticleDraft({ ...article, coverImage });

    const preview =
      `📝 <b>${esc(article.title)}</b>\n` +
      `${esc(article.excerpt)}\n\n` +
      `Розділ: <b>${esc(categoryName(article.categorySlug))}</b>\n` +
      `Теги: ${esc(article.tags.join(", ") || "—")}\n` +
      (coverImage ? "🖼 Обкладинка: так\n" : "") +
      `\n${esc(article.body.slice(0, 400))}${article.body.length > 400 ? "…" : ""}`;

    const buttons: InlineButton[][] = [
      [
        { text: "✅ Опублікувати", callback_data: `pub:${draft.id}` },
        { text: "📝 Чернетка", callback_data: `keep:${draft.id}` },
      ],
      [{ text: "🗑 Видалити", callback_data: `del:${draft.id}` }],
    ];

    await sendMessage(chatId, preview, buttons);
  } catch (e) {
    const reason = e instanceof Error ? e.message : "невідома помилка";
    await sendMessage(chatId, `⚠️ Не вдалося: ${esc(reason)}`);
  }
}

// Визначає матеріал і обкладинку з повідомлення:
// фото з підписом → підпис = текст, фото = обкладинка;
// посилання → витяг сторінки + og:image;
// текст → як є.
async function buildSource(
  msg: TgMessage,
): Promise<{ source: string; coverImage: string | null }> {
  // Фото з підписом
  if (msg.photo?.length) {
    const largest = msg.photo[msg.photo.length - 1];
    const file = await getFileBuffer(largest.file_id);
    let coverImage: string | null = null;
    if (file) {
      const f = new File([new Uint8Array(file.buffer)], file.name, {
        type: "image/jpeg",
      });
      coverImage = await uploadImage(f, "telegram");
    }
    return { source: (msg.caption || "").trim(), coverImage };
  }

  const text = (msg.text || "").trim();
  const urlMatch = text.match(URL_RE);
  if (urlMatch) {
    const extracted = await fetchArticle(urlMatch[0]);
    const source = `${extracted.title}\n\n${extracted.text}`.trim();
    return { source, coverImage: extracted.ogImage };
  }

  return { source: text, coverImage: null };
}

async function handleCallback(cq: TgCallbackQuery): Promise<void> {
  const chatId = cq.message?.chat?.id;
  const messageId = cq.message?.message_id;
  if (!chatId || !messageId) {
    await answerCallbackQuery(cq.id);
    return;
  }
  if (!isAllowed(cq.from?.id)) {
    await answerCallbackQuery(cq.id, "Немає доступу");
    return;
  }

  const [action, idStr] = (cq.data || "").split(":");
  const id = Number(idStr);
  if (!id) {
    await answerCallbackQuery(cq.id);
    return;
  }

  try {
    if (action === "pub") {
      const published = await publishArticle(id);
      if (!published) {
        await editMessageText(chatId, messageId, "Новину не знайдено (видалена?).");
      } else {
        revalidatePath("/");
        revalidatePath(`/${published.category.slug}`);
        revalidatePath(`/${published.category.slug}/${published.slug}`);
        const url = `${SITE_URL}/${published.category.slug}/${published.slug}`;
        await editMessageText(
          chatId,
          messageId,
          `✅ Опубліковано: ${url}`,
        );
      }
    } else if (action === "del") {
      const { prisma } = await import("@/lib/db");
      await prisma.article.delete({ where: { id } }).catch(() => {});
      await editMessageText(chatId, messageId, "🗑 Видалено.");
    } else if (action === "keep") {
      await editMessageText(
        chatId,
        messageId,
        "📝 Лишилось чернеткою — доредагувати можна в адмінці (/admin/articles).",
      );
    }
    await answerCallbackQuery(cq.id, "Готово");
  } catch (e) {
    const reason = e instanceof Error ? e.message : "помилка";
    await answerCallbackQuery(cq.id, reason.slice(0, 180));
  }
}

/* ----------------------------- Типи апдейтів ----------------------------- */

type TgUser = { id: number };
type TgChat = { id: number };
type TgPhotoSize = { file_id: string };
type TgMessage = {
  chat?: TgChat;
  from?: TgUser;
  text?: string;
  caption?: string;
  photo?: TgPhotoSize[];
};
type TgCallbackQuery = {
  id: string;
  from?: TgUser;
  data?: string;
  message?: { message_id: number; chat?: TgChat };
};
type TgUpdate = {
  message?: TgMessage;
  callback_query?: TgCallbackQuery;
};

import "server-only";

const API = "https://api.telegram.org";

function token(): string {
  const t = process.env.TELEGRAM_BOT_TOKEN;
  if (!t) throw new Error("Не задано TELEGRAM_BOT_TOKEN.");
  return t;
}

async function call(method: string, body: unknown): Promise<unknown> {
  const res = await fetch(`${API}/bot${token()}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export type InlineButton = { text: string; callback_data: string };

export async function sendMessage(
  chatId: number,
  text: string,
  buttons?: InlineButton[][],
): Promise<void> {
  await call("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: buttons ? { inline_keyboard: buttons } : undefined,
  });
}

export async function editMessageText(
  chatId: number,
  messageId: number,
  text: string,
  buttons?: InlineButton[][],
): Promise<void> {
  await call("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: buttons ? { inline_keyboard: buttons } : undefined,
  });
}

export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string,
): Promise<void> {
  await call("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text,
  });
}

/** Завантажує фото з Telegram за file_id. Повертає байти + ім'я файлу. */
export async function getFileBuffer(
  fileId: string,
): Promise<{ buffer: Buffer; name: string } | null> {
  const meta = (await call("getFile", { file_id: fileId })) as {
    ok: boolean;
    result?: { file_path?: string };
  };
  const filePath = meta.result?.file_path;
  if (!meta.ok || !filePath) return null;

  const res = await fetch(`${API}/file/bot${token()}/${filePath}`);
  if (!res.ok) return null;
  const buffer = Buffer.from(await res.arrayBuffer());
  return { buffer, name: filePath.split("/").pop() || "photo.jpg" };
}

/** Чи дозволено цьому Telegram-користувачу публікувати (allowlist у env). */
export function isAllowed(userId: number | undefined): boolean {
  if (!userId) return false;
  const ids = (process.env.TELEGRAM_ALLOWED_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return ids.includes(String(userId));
}

/** Перевірка секретного заголовка вебхука від Telegram. */
export function checkWebhookSecret(headerValue: string | null): boolean {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  // Якщо секрет не заданий — не приймаємо нічого (безпечний дефолт).
  if (!secret) return false;
  return headerValue === secret;
}

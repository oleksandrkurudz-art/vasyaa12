import "server-only";
import { createClient } from "@supabase/supabase-js";

// Сховище зображень — Supabase Storage, публічний бакет `media`.
// Завантаження йде ТІЛЬКИ із серверних дій адмінки (під requireAuth),
// тому використовуємо service-role ключ (обходить RLS) — він серверний секрет.
const BUCKET = "media";

function client() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Не налаштовано сховище: задайте SUPABASE_URL і SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
]);

function extFor(type: string): string {
  return (
    { "image/jpeg": "jpg", "image/svg+xml": "svg" }[type] ??
    type.split("/")[1] ??
    "bin"
  );
}

/**
 * Завантажує зображення у бакет і повертає публічний URL.
 * Повертає null, якщо файл порожній (поле не заповнили).
 */
export async function uploadImage(
  file: File | null,
  prefix = "articles",
): Promise<string | null> {
  if (!file || file.size === 0) return null;

  if (!ALLOWED.has(file.type)) {
    throw new Error(`Непідтримуваний тип файлу: ${file.type || "невідомо"}.`);
  }

  const path = `${prefix}/${Date.now()}-${crypto.randomUUID()}.${extFor(file.type)}`;
  const supabase = client();

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(`Не вдалося завантажити фото: ${error.message}`);

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return publicUrl;
}

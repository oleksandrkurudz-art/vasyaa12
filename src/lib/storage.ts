import "server-only";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

// Сховище зображень — Supabase Storage, публічний бакет `media`.
// Завантаження йде ТІЛЬКИ із серверних дій адмінки (під requireAuth),
// тому використовуємо service-role ключ (обходить RLS) — він серверний секрет.
const BUCKET = "media";

// Растрові фото перед заливкою стискаємо: авто-поворот за EXIF,
// зменшення до цього розміру (бік) і конвертація у WebP.
const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 80;

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

// GIF (анімація) і SVG (вектор) не чіпаємо — стискати немає сенсу / зламає їх.
const PASSTHROUGH = new Set(["image/gif", "image/svg+xml"]);

type Optimized = { body: Buffer; contentType: string; ext: string };

async function optimize(input: Buffer, type: string): Promise<Optimized> {
  if (PASSTHROUGH.has(type)) {
    return { body: input, contentType: type, ext: type.split("/")[1] };
  }
  // Авто-поворот за EXIF + зменшення (без збільшення) + WebP.
  const body = await sharp(input)
    .rotate()
    .resize(MAX_DIMENSION, MAX_DIMENSION, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
  return { body, contentType: "image/webp", ext: "webp" };
}

/**
 * Стискає й завантажує зображення у бакет, повертає публічний URL.
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

  const original = Buffer.from(await file.arrayBuffer());
  const { body, contentType, ext } = await optimize(original, file.type);

  const path = `${prefix}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const supabase = client();

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, body, { contentType, upsert: false });
  if (error) throw new Error(`Не вдалося завантажити фото: ${error.message}`);

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return publicUrl;
}

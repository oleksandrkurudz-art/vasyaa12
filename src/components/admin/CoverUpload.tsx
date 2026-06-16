"use client";

import { useRef, useState } from "react";

// Клієнтське стиснення фото ПЕРЕД відправкою. Потрібне, бо Vercel обмежує
// тіло запиту до serverless-функції ~4.5 МБ — фото з телефона (5-8 МБ) інакше
// впаде з 413 ще до сервера. Зменшуємо до 1600px і кодуємо у WebP у канвасі,
// тоді на сервер іде ~100-400 КБ (а серверний sharp лишається запобіжником).
const MAX_DIMENSION = 1600;
const QUALITY = 0.82;

const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-500";

function kb(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} МБ`
    : `${Math.round(bytes / 1024)} КБ`;
}

async function compress(file: File): Promise<File> {
  // EXIF-орієнтація враховується через imageOrientation.
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });
  const scale = Math.min(
    1,
    MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
  );
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", QUALITY),
  );
  if (!blob) throw new Error("stomp");
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", {
    type: "image/webp",
  });
}

export default function CoverUpload({ defaultUrl }: { defaultUrl?: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(defaultUrl);
  const [note, setNote] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setNote("Стискаю…");
    try {
      const original = file.size;
      let out = file;
      // SVG/GIF не чіпаємо (анімація/вектор) — їх рідко вантажать як обкладинку.
      if (!/svg|gif/.test(file.type)) {
        out = await compress(file);
      }
      // Підміняємо вміст інпута стиснутим файлом — його й відправить форма.
      const dt = new DataTransfer();
      dt.items.add(out);
      fileRef.current!.files = dt.files;

      setPreview(URL.createObjectURL(out));
      setNote(
        out === file
          ? `Обрано: ${kb(original)}`
          : `Стиснуто: ${kb(original)} → ${kb(out.size)}`,
      );
    } catch {
      setNote("Не вдалося обробити фото — спробуйте інше.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
      <label className="block text-sm font-medium text-neutral-700">
        Обкладинка
      </label>

      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Прев'ю обкладинки"
          className="mt-2 h-40 w-full rounded-md border border-neutral-200 object-cover"
        />
      )}

      <input
        ref={fileRef}
        type="file"
        name="coverFile"
        accept="image/*"
        onChange={onPick}
        className="mt-2 block w-full text-sm text-neutral-700 file:mr-3 file:rounded-md file:border-0 file:bg-blue-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-800"
      />
      <p className="mt-1 text-xs text-neutral-500">
        Виберіть фото з галереї. Воно автоматично стискається у браузері
        (макс. 1600px, WebP), щоб не займало багато місця.
        {note && (
          <span
            className={`ml-1 font-medium ${busy ? "text-neutral-500" : "text-green-700"}`}
          >
            {note}
          </span>
        )}
      </p>

      <label className="mt-3 block text-xs font-medium text-neutral-500">
        …або вставте URL зображення
      </label>
      <input
        name="coverImage"
        defaultValue={defaultUrl ?? ""}
        placeholder="https://…"
        className={`mt-1 ${inputClass}`}
      />
    </div>
  );
}

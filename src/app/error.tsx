"use client";

import Link from "next/link";

// Глобальна межа помилок. Ловить збої рендера будь-якої сторінки та
// (public)-лейауту — напр. коли недоступна БД Supabase. Замість «голого»
// системного повідомлення показуємо зрозумілу сторінку з кнопкою повтору.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="font-display text-5xl font-black text-brand-600">Ой…</p>
      <h1 className="mt-4 text-2xl font-bold text-neutral-900">
        Щось пішло не так
      </h1>
      <p className="mt-3 text-neutral-600">
        Сталася тимчасова помилка. Спробуйте оновити сторінку — зазвичай це
        допомагає. Якщо повторюється, зайдіть трохи згодом.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-md bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Спробувати знову
        </button>
        <Link
          href="/"
          className="rounded-md border border-neutral-300 px-5 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
        >
          На головну
        </Link>
      </div>
      {error.digest && (
        <p className="mt-6 text-xs text-neutral-400">Код помилки: {error.digest}</p>
      )}
    </div>
  );
}

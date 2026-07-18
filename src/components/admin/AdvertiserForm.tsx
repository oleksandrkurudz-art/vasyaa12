"use client";

import { useActionState } from "react";
import { saveAdvertiser, type FormState } from "@/app/admin/actions";

const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-500";

export default function AdvertiserForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    saveAdvertiser,
    {},
  );

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <input name="name" required placeholder="Назва" className={inputClass} />
      <select name="type" className={inputClass} defaultValue="будмагазин">
        <option value="будмагазин">Будмагазин</option>
        <option value="АЗС">АЗС</option>
        <option value="кафе">Кафе</option>
        <option value="банк">Банк</option>
        <option value="аптека">Аптека</option>
        <option value="інше">Інше</option>
      </select>
      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
      >
        {pending ? "Додавання…" : "Додати"}
      </button>
    </form>
  );
}

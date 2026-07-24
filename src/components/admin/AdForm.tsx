"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveAd, type FormState } from "@/app/admin/actions";
import CoverUpload from "@/components/admin/CoverUpload";
import type { Ad, Category } from "@/generated/prisma/client";

const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-500";
const labelClass = "block text-sm font-medium text-neutral-700";

export default function AdForm({
  ad,
  businesses,
  categories,
}: {
  ad?: Ad;
  businesses: { id: number; name: string }[];
  categories: Category[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    saveAd,
    {},
  );

  return (
    <form action={formAction} encType="multipart/form-data" className="space-y-5">
      {ad && <input type="hidden" name="id" value={ad.id} />}

      <div>
        <label className={labelClass}>Заголовок банера</label>
        <input
          name="title"
          required
          defaultValue={ad?.title}
          className={`mt-1 ${inputClass}`}
        />
      </div>

      <div>
        <label className={labelClass}>Бізнес (кому належить банер)</label>
        <select
          name="businessId"
          required
          defaultValue={ad?.businessId}
          className={`mt-1 ${inputClass}`}
        >
          {businesses.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <CoverUpload
        fileName="bannerFile"
        urlName="imageUrl"
        label="Зображення банера"
        defaultUrl={ad?.imageUrl}
      />

      <div>
        <label className={labelClass}>
          Зовнішнє посилання (необов’язково — порожнє веде на картку бізнесу)
        </label>
        <input
          name="linkUrl"
          defaultValue={ad?.linkUrl}
          placeholder="https://… або лишіть порожнім"
          className={`mt-1 ${inputClass}`}
        />
      </div>

      <div>
        <label className={labelClass}>
          Теги через кому (за ними банер підбирається до новин)
        </label>
        <input
          name="tags"
          defaultValue={ad?.tags}
          placeholder="ремонт, будівництво, дорога"
          className={`mt-1 ${inputClass}`}
        />
      </div>

      <div>
        <label className={labelClass}>Пріоритетний розділ (необов’язково)</label>
        <select
          name="categoryId"
          defaultValue={ad?.categoryId ?? ""}
          className={`mt-1 ${inputClass}`}
        >
          <option value="">— не вказано —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          name="active"
          defaultChecked={ad?.active ?? true}
          className="h-4 w-4"
        />
        Активний (показувати на сайті)
      </label>

      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {pending ? "Збереження…" : "Зберегти"}
        </button>
        <Link
          href="/admin/ads"
          className="rounded-md border border-neutral-300 px-5 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
        >
          Скасувати
        </Link>
      </div>
    </form>
  );
}

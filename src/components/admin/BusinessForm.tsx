"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveBusiness, type FormState } from "@/app/admin/actions";
import CoverUpload from "@/components/admin/CoverUpload";
import { BUSINESS_CATEGORIES } from "@/lib/business-categories";
import type { Business, Community } from "@/generated/prisma/client";

const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-500";
const labelClass = "block text-sm font-medium text-neutral-700";

export default function BusinessForm({
  business,
  communities,
}: {
  business?: Business;
  communities: Community[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    saveBusiness,
    {},
  );

  return (
    <form action={formAction} encType="multipart/form-data" className="space-y-5">
      {business && <input type="hidden" name="id" value={business.id} />}

      <div>
        <label className={labelClass}>Назва бізнесу</label>
        <input
          name="name"
          required
          defaultValue={business?.name}
          className={`mt-1 ${inputClass}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Категорія</label>
          <select
            name="category"
            defaultValue={business?.category ?? "inshe"}
            className={`mt-1 ${inputClass}`}
          >
            {BUSINESS_CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Громада</label>
          <select
            name="communityId"
            defaultValue={business?.communityId ?? ""}
            className={`mt-1 ${inputClass}`}
          >
            <option value="">— Весь район —</option>
            {communities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Slug (необов’язково — згенерується з назви)
        </label>
        <input
          name="slug"
          defaultValue={business?.slug}
          placeholder="напр. kafe-zatyshok"
          className={`mt-1 ${inputClass}`}
        />
      </div>

      <CoverUpload label="Фото бізнесу" defaultUrl={business?.photo ?? undefined} />

      <div>
        <label className={labelClass}>Опис</label>
        <textarea
          name="description"
          required
          rows={6}
          defaultValue={business?.description}
          className={`mt-1 ${inputClass}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Телефон</label>
          <input
            name="phone"
            defaultValue={business?.phone ?? ""}
            placeholder="+380…"
            className={`mt-1 ${inputClass}`}
          />
        </div>
        <div>
          <label className={labelClass}>Адреса</label>
          <input
            name="address"
            defaultValue={business?.address ?? ""}
            placeholder="м. Калуш, вул. …"
            className={`mt-1 ${inputClass}`}
          />
        </div>
        <div>
          <label className={labelClass}>Сайт</label>
          <input
            name="website"
            defaultValue={business?.website ?? ""}
            placeholder="https://…"
            className={`mt-1 ${inputClass}`}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Теги через кому (за ними банер бізнесу підбирається до новин)
        </label>
        <input
          name="tags"
          defaultValue={business?.tags}
          placeholder="кафе, кава, випічка"
          className={`mt-1 ${inputClass}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>
            Оплачено до (порожньо = безстроково)
          </label>
          <input
            type="date"
            name="paidUntil"
            defaultValue={business?.paidUntil?.toISOString().slice(0, 10)}
            className={`mt-1 ${inputClass}`}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          name="active"
          defaultChecked={business?.active ?? true}
          className="h-4 w-4"
        />
        Активний (показувати в каталозі)
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
          href="/admin/businesses"
          className="rounded-md border border-neutral-300 px-5 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
        >
          Скасувати
        </Link>
      </div>
    </form>
  );
}

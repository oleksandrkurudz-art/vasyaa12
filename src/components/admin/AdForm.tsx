import Link from "next/link";
import { saveAd } from "@/app/admin/actions";
import type { Ad, Advertiser, Category } from "@/generated/prisma/client";

const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-500";
const labelClass = "block text-sm font-medium text-neutral-700";

export default function AdForm({
  ad,
  advertisers,
  categories,
}: {
  ad?: Ad;
  advertisers: Advertiser[];
  categories: Category[];
}) {
  return (
    <form action={saveAd} className="space-y-5">
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
        <label className={labelClass}>Рекламодавець</label>
        <select
          name="advertiserId"
          required
          defaultValue={ad?.advertiserId}
          className={`mt-1 ${inputClass}`}
        >
          {advertisers.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} ({a.type})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>URL зображення</label>
          <input
            name="imageUrl"
            required
            defaultValue={ad?.imageUrl}
            placeholder="https://…"
            className={`mt-1 ${inputClass}`}
          />
        </div>
        <div>
          <label className={labelClass}>Посилання (куди веде банер)</label>
          <input
            name="linkUrl"
            required
            defaultValue={ad?.linkUrl}
            placeholder="https://…"
            className={`mt-1 ${inputClass}`}
          />
        </div>
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

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="rounded-md bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Зберегти
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

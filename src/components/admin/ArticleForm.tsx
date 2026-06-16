import Link from "next/link";
import { saveArticle } from "@/app/admin/actions";
import type { Article, Category } from "@/generated/prisma/client";

const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-500";
const labelClass = "block text-sm font-medium text-neutral-700";

export default function ArticleForm({
  article,
  categories,
}: {
  article?: Article;
  categories: Category[];
}) {
  return (
    <form
      action={saveArticle}
      encType="multipart/form-data"
      className="space-y-5"
    >
      {article && <input type="hidden" name="id" value={article.id} />}

      <div>
        <label className={labelClass}>Заголовок</label>
        <input
          name="title"
          required
          defaultValue={article?.title}
          className={`mt-1 ${inputClass}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Розділ</label>
          <select
            name="categoryId"
            defaultValue={article?.categoryId}
            required
            className={`mt-1 ${inputClass}`}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Статус</label>
          <select
            name="status"
            defaultValue={article?.status ?? "draft"}
            className={`mt-1 ${inputClass}`}
          >
            <option value="draft">Чернетка</option>
            <option value="published">Опубліковано</option>
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          name="breaking"
          defaultChecked={article?.breaking ?? false}
          className="h-4 w-4"
        />
        Термінова новина (червоний бейдж «Терміново»)
      </label>

      <div>
        <label className={labelClass}>
          Slug (необов’язково — згенерується із заголовка)
        </label>
        <input
          name="slug"
          defaultValue={article?.slug}
          placeholder="напр. remont-dorohy"
          className={`mt-1 ${inputClass}`}
        />
      </div>

      <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
        <label className={labelClass}>Обкладинка</label>

        {article?.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.coverImage}
            alt="Поточна обкладинка"
            className="mt-2 h-40 w-full rounded-md border border-neutral-200 object-cover"
          />
        )}

        {/* Завантаження з галереї — має пріоритет над URL нижче */}
        <input
          type="file"
          name="coverFile"
          accept="image/*"
          className="mt-2 block w-full text-sm text-neutral-700 file:mr-3 file:rounded-md file:border-0 file:bg-blue-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-800"
        />
        <p className="mt-1 text-xs text-neutral-500">
          Виберіть фото з галереї (до 10 МБ). Воно автоматично стискається
          (макс. 1600px, WebP), щоб не займало багато місця. Завантажений файл
          замінить URL нижче.
        </p>

        <label className="mt-3 block text-xs font-medium text-neutral-500">
          …або вставте URL зображення
        </label>
        <input
          name="coverImage"
          defaultValue={article?.coverImage ?? ""}
          placeholder="https://…"
          className={`mt-1 ${inputClass}`}
        />
      </div>

      <div>
        <label className={labelClass}>Короткий анонс</label>
        <textarea
          name="excerpt"
          required
          rows={2}
          defaultValue={article?.excerpt}
          className={`mt-1 ${inputClass}`}
        />
      </div>

      <div>
        <label className={labelClass}>Текст новини</label>
        <textarea
          name="body"
          required
          rows={10}
          defaultValue={article?.body}
          className={`mt-1 ${inputClass}`}
        />
      </div>

      <div>
        <label className={labelClass}>
          Теги через кому (за ними підбирається реклама)
        </label>
        <input
          name="tags"
          defaultValue={article?.tags}
          placeholder="дорога, ремонт, інфраструктура"
          className={`mt-1 ${inputClass}`}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="rounded-md bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Зберегти
        </button>
        <Link
          href="/admin/articles"
          className="rounded-md border border-neutral-300 px-5 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
        >
          Скасувати
        </Link>
      </div>
    </form>
  );
}

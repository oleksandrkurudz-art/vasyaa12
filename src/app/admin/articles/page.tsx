import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { deleteArticle } from "@/app/admin/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Новини · Адмінка" };

export default async function AdminArticles() {
  await requireAuth();

  const articles = await prisma.article.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Новини</h1>
        <Link
          href="/admin/articles/new"
          className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          + Нова новина
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="px-4 py-2 font-medium">Заголовок</th>
              <th className="px-4 py-2 font-medium">Розділ</th>
              <th className="px-4 py-2 font-medium">Статус</th>
              <th className="px-4 py-2 font-medium">Дата</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {articles.map((a) => (
              <tr key={a.id} className="hover:bg-neutral-50">
                <td className="px-4 py-2 font-medium text-neutral-900">
                  {a.title}
                </td>
                <td className="px-4 py-2 text-neutral-600">{a.category.name}</td>
                <td className="px-4 py-2">
                  {a.status === "published" ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                      опубліковано
                    </span>
                  ) : (
                    <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs text-neutral-600">
                      чернетка
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-neutral-500">
                  {formatDate(a.publishedAt ?? a.createdAt)}
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/articles/${a.id}/edit`}
                      className="text-blue-700 hover:underline"
                    >
                      Редагувати
                    </Link>
                    <form action={deleteArticle}>
                      <input type="hidden" name="id" value={a.id} />
                      <button className="text-red-600 hover:underline">
                        Видалити
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                  Новин ще немає.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { saveAdvertiser, deleteAdvertiser } from "@/app/admin/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Рекламодавці · Адмінка" };

const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-500";

export default async function AdminAdvertisers() {
  await requireAuth();
  const advertisers = await prisma.advertiser.findMany({
    include: { _count: { select: { ads: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900">Рекламодавці</h1>
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-neutral-500">
              <tr>
                <th className="px-4 py-2 font-medium">Назва</th>
                <th className="px-4 py-2 font-medium">Тип</th>
                <th className="px-4 py-2 font-medium">Банерів</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {advertisers.map((a) => (
                <tr key={a.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-2 font-medium text-neutral-900">
                    {a.name}
                  </td>
                  <td className="px-4 py-2 text-neutral-600">{a.type}</td>
                  <td className="px-4 py-2 text-neutral-600">{a._count.ads}</td>
                  <td className="px-4 py-2 text-right">
                    <form action={deleteAdvertiser}>
                      <input type="hidden" name="id" value={a.id} />
                      <button className="text-red-600 hover:underline">
                        Видалити
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {advertisers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                    Рекламодавців ще немає.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <aside className="h-fit rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="text-lg font-bold text-neutral-900">Новий рекламодавець</h2>
        <form action={saveAdvertiser} className="mt-4 space-y-3">
          <input name="name" required placeholder="Назва" className={inputClass} />
          <select name="type" className={inputClass} defaultValue="будмагазин">
            <option value="будмагазин">Будмагазин</option>
            <option value="АЗС">АЗС</option>
            <option value="кафе">Кафе</option>
            <option value="банк">Банк</option>
            <option value="аптека">Аптека</option>
            <option value="інше">Інше</option>
          </select>
          <button
            type="submit"
            className="w-full rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Додати
          </button>
        </form>
      </aside>
    </div>
  );
}

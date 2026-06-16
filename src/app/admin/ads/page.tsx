import Link from "next/link";
import Cover from "@/components/Cover";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteAd } from "@/app/admin/actions";
import { parseTags } from "@/lib/tags";

export const dynamic = "force-dynamic";
export const metadata = { title: "Реклама · Адмінка" };

export default async function AdminAds() {
  await requireAuth();
  const ads = await prisma.ad.findMany({
    include: { advertiser: true, category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Рекламні банери</h1>
        <Link
          href="/admin/ads/new"
          className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          + Новий банер
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ads.map((ad) => (
          <div
            key={ad.id}
            className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
              <Cover
                src={ad.imageUrl}
                alt={ad.title}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                imgClassName="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-neutral-900">{ad.title}</p>
                {ad.active ? (
                  <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                    активний
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-neutral-200 px-2 py-0.5 text-xs text-neutral-600">
                    вимкнено
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-neutral-500">
                {ad.advertiser.name}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {parseTags(ad.tags).map((t) => (
                  <span
                    key={t}
                    className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex gap-3 border-t border-neutral-100 pt-3 text-sm">
                <Link
                  href={`/admin/ads/${ad.id}/edit`}
                  className="text-blue-700 hover:underline"
                >
                  Редагувати
                </Link>
                <form action={deleteAd}>
                  <input type="hidden" name="id" value={ad.id} />
                  <button className="text-red-600 hover:underline">Видалити</button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>

      {ads.length === 0 && (
        <p className="py-12 text-center text-neutral-500">Банерів ще немає.</p>
      )}
    </div>
  );
}

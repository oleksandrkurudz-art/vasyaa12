import Link from "next/link";
import Cover from "@/components/Cover";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteBusiness } from "@/app/admin/actions";
import { businessCategoryName } from "@/lib/business-categories";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Бізнес · Адмінка" };

// Бейдж статусу оплати/активності бізнесу.
function StatusBadge({
  active,
  paidUntil,
}: {
  active: boolean;
  paidUntil: Date | null;
}) {
  if (!active) {
    return (
      <span className="shrink-0 rounded-full bg-neutral-200 px-2 py-0.5 text-xs text-neutral-600">
        вимкнено
      </span>
    );
  }
  if (paidUntil && paidUntil < new Date()) {
    return (
      <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
        прострочено {formatDate(paidUntil)}
      </span>
    );
  }
  return (
    <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
      {paidUntil ? `до ${formatDate(paidUntil)}` : "активний"}
    </span>
  );
}

export default async function AdminBusinesses() {
  await requireAuth();
  const businesses = await prisma.business.findMany({
    include: { community: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Каталог бізнесу</h1>
        <Link
          href="/admin/businesses/new"
          className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          + Новий бізнес
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {businesses.map((b) => (
          <div
            key={b.id}
            className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
              {b.photo ? (
                <Cover
                  src={b.photo}
                  alt={b.name}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  imgClassName="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                  без фото
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-neutral-900">{b.name}</p>
                <StatusBadge active={b.active} paidUntil={b.paidUntil} />
              </div>
              <p className="mt-0.5 text-sm text-neutral-500">
                {businessCategoryName(b.category)} ·{" "}
                {b.community?.name ?? "Весь район"}
              </p>
              <div className="mt-3 flex gap-3 border-t border-neutral-100 pt-3 text-sm">
                <Link
                  href={`/admin/businesses/${b.id}/edit`}
                  className="text-blue-700 hover:underline"
                >
                  Редагувати
                </Link>
                <form action={deleteBusiness}>
                  <input type="hidden" name="id" value={b.id} />
                  <button className="text-red-600 hover:underline">Видалити</button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>

      {businesses.length === 0 && (
        <p className="py-12 text-center text-neutral-500">
          Бізнесів у каталозі ще немає.
        </p>
      )}
    </div>
  );
}

import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import AdForm from "@/components/admin/AdForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Новий банер · Адмінка" };

export default async function NewAd() {
  await requireAuth();
  const [businesses, categories] = await Promise.all([
    prisma.business.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (businesses.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-2xl font-bold text-neutral-900">Новий банер</h1>
        <p className="text-neutral-600">
          Спочатку додайте хоча б один{" "}
          <Link href="/admin/businesses" className="text-blue-700 underline">
            бізнес
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Новий банер</h1>
      <AdForm businesses={businesses} categories={categories} />
    </div>
  );
}

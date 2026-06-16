import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import AdForm from "@/components/admin/AdForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Новий банер · Адмінка" };

export default async function NewAd() {
  await requireAuth();
  const [advertisers, categories] = await Promise.all([
    prisma.advertiser.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (advertisers.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-2xl font-bold text-neutral-900">Новий банер</h1>
        <p className="text-neutral-600">
          Спочатку додайте хоча б одного{" "}
          <Link href="/admin/advertisers" className="text-blue-700 underline">
            рекламодавця
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Новий банер</h1>
      <AdForm advertisers={advertisers} categories={categories} />
    </div>
  );
}

import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import AdForm from "@/components/admin/AdForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Редагування банера · Адмінка" };

export default async function EditAd({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id } = await params;
  const [ad, businesses, categories] = await Promise.all([
    prisma.ad.findUnique({ where: { id: Number(id) } }),
    prisma.business.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (!ad) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">
        Редагування банера
      </h1>
      <AdForm ad={ad} businesses={businesses} categories={categories} />
    </div>
  );
}

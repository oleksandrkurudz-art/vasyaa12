import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import BusinessForm from "@/components/admin/BusinessForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Редагування бізнесу · Адмінка" };

export default async function EditBusiness({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id } = await params;
  const [business, communities] = await Promise.all([
    prisma.business.findUnique({ where: { id: Number(id) } }),
    prisma.community.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (!business) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">
        Редагування бізнесу
      </h1>
      <BusinessForm business={business} communities={communities} />
    </div>
  );
}

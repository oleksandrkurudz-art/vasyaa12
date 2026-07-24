import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import BusinessForm from "@/components/admin/BusinessForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Новий бізнес · Адмінка" };

export default async function NewBusiness() {
  await requireAuth();
  const communities = await prisma.community.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Новий бізнес</h1>
      <BusinessForm communities={communities} />
    </div>
  );
}

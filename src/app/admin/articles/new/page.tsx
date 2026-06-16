import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import ArticleForm from "@/components/admin/ArticleForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Нова новина · Адмінка" };

export default async function NewArticle() {
  await requireAuth();
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Нова новина</h1>
      <ArticleForm categories={categories} />
    </div>
  );
}

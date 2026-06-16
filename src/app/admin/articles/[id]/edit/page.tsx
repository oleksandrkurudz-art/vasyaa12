import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import ArticleForm from "@/components/admin/ArticleForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Редагування новини · Адмінка" };

export default async function EditArticle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id } = await params;
  const [article, categories] = await Promise.all([
    prisma.article.findUnique({ where: { id: Number(id) } }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (!article) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">
        Редагування новини
      </h1>
      <ArticleForm article={article} categories={categories} />
    </div>
  );
}

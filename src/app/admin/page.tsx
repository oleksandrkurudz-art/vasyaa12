import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Адмінка" };

export default async function AdminDashboard() {
  await requireAuth();

  const [articles, published, ads, advertisers] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: "published" } }),
    prisma.ad.count(),
    prisma.advertiser.count(),
  ]);

  const cards = [
    { label: "Усього новин", value: articles, href: "/admin/articles" },
    { label: "Опубліковано", value: published, href: "/admin/articles" },
    { label: "Рекламних банерів", value: ads, href: "/admin/ads" },
    { label: "Рекламодавців", value: advertisers, href: "/admin/advertisers" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-neutral-900">Панель керування</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-lg border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <p className="text-3xl font-extrabold text-neutral-900">{c.value}</p>
            <p className="mt-1 text-sm text-neutral-500">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/articles/new"
          className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          + Нова новина
        </Link>
        <Link
          href="/admin/ads/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700"
        >
          + Новий банер
        </Link>
      </div>
    </div>
  );
}

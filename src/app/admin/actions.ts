"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { formatTags } from "@/lib/tags";
import { uploadImage } from "@/lib/storage";

function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

async function uniqueSlug(base: string, excludeId?: number): Promise<string> {
  const root = slugify(base) || "novyna";
  let slug = root;
  let n = 1;
  // Гарантуємо унікальність slug.
  while (true) {
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${root}-${++n}`;
  }
}

/* ----------------------------- Новини ----------------------------- */

export async function saveArticle(formData: FormData) {
  await requireAuth();

  const id = Number(formData.get("id")) || null;
  const title = str(formData, "title");
  const categoryId = Number(formData.get("categoryId"));
  const customSlug = str(formData, "slug");
  const status = str(formData, "status") === "published" ? "published" : "draft";

  // Завантажене фото має пріоритет; інакше — значення поля «URL обкладинки».
  const uploaded = await uploadImage(formData.get("coverFile") as File | null);
  const coverImage = uploaded ?? (str(formData, "coverImage") || null);

  const data = {
    title,
    excerpt: str(formData, "excerpt"),
    body: str(formData, "body"),
    coverImage,
    tags: formatTags(str(formData, "tags").split(",")),
    categoryId,
    status,
    breaking: formData.get("breaking") === "on",
  };

  if (id) {
    const existing = await prisma.article.findUnique({
      where: { id },
      select: { publishedAt: true },
    });
    const slug = await uniqueSlug(customSlug || title, id);
    // Зберігаємо наявну дату публікації; ставимо «зараз» лише при першій публікації.
    const publishedAt =
      status !== "published"
        ? null
        : (existing?.publishedAt ?? new Date());
    await prisma.article.update({
      where: { id },
      data: { ...data, slug, publishedAt },
    });
  } else {
    const slug = await uniqueSlug(customSlug || title);
    const publishedAt = status === "published" ? new Date() : null;
    await prisma.article.create({ data: { ...data, slug, publishedAt } });
  }

  revalidatePath("/");
  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

export async function deleteArticle(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id"));
  if (id) await prisma.article.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/articles");
}

/* --------------------------- Рекламодавці --------------------------- */

export async function saveAdvertiser(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id")) || null;
  const data = { name: str(formData, "name"), type: str(formData, "type") };
  if (id) await prisma.advertiser.update({ where: { id }, data });
  else await prisma.advertiser.create({ data });
  revalidatePath("/admin/advertisers");
  redirect("/admin/advertisers");
}

export async function deleteAdvertiser(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id"));
  // Видаляємо банери рекламодавця, потім самого рекламодавця.
  if (id) {
    await prisma.ad.deleteMany({ where: { advertiserId: id } });
    await prisma.advertiser.delete({ where: { id } });
  }
  revalidatePath("/admin/advertisers");
  revalidatePath("/admin/ads");
}

/* ----------------------------- Реклама ----------------------------- */

export async function saveAd(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id")) || null;
  const categoryId = Number(formData.get("categoryId")) || null;

  const data = {
    title: str(formData, "title"),
    imageUrl: str(formData, "imageUrl"),
    linkUrl: str(formData, "linkUrl"),
    tags: formatTags(str(formData, "tags").split(",")),
    active: formData.get("active") === "on",
    advertiserId: Number(formData.get("advertiserId")),
    categoryId,
  };

  if (id) await prisma.ad.update({ where: { id }, data });
  else await prisma.ad.create({ data });

  revalidatePath("/admin/ads");
  redirect("/admin/ads");
}

export async function deleteAd(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id"));
  if (id) await prisma.ad.delete({ where: { id } });
  revalidatePath("/admin/ads");
}

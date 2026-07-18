"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { formatTags } from "@/lib/tags";
import { uploadImage } from "@/lib/storage";
import { uniqueSlug } from "@/lib/article-write";

// Стан форми для useActionState: якщо є error — форма показує його й не навігує,
// зберігаючи введені дані (на відміну від старого варіанта, де будь-яка проблема
// давала «голий» 500).
export type FormState = { error?: string };

function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

// Людське повідомлення з будь-якої помилки (для показу у формі).
function message(e: unknown): string {
  return e instanceof Error ? e.message : "Сталася помилка. Спробуйте ще раз.";
}

const ADVERTISER_TYPES = ["будмагазин", "АЗС", "кафе", "банк", "аптека", "інше"];

/* ----------------------------- Новини ----------------------------- */

export async function saveArticle(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAuth();

  const id = Number(formData.get("id")) || null;
  const title = str(formData, "title");
  const excerpt = str(formData, "excerpt");
  const body = str(formData, "body");
  const categoryId = Number(formData.get("categoryId"));
  const customSlug = str(formData, "slug");
  const status = str(formData, "status") === "published" ? "published" : "draft";
  // Громада новини; порожнє значення = загальнорайонна (communityId = null).
  const communityId = Number(formData.get("communityId")) || null;

  // --- Серверна валідація (HTML `required` можна обійти) ---
  if (!title) return { error: "Вкажіть заголовок новини." };
  if (!excerpt) return { error: "Вкажіть короткий анонс." };
  if (!body) return { error: "Текст новини не може бути порожнім." };
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return { error: "Оберіть розділ новини." };
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) return { error: "Обраний розділ не існує." };
    if (communityId) {
      const community = await prisma.community.findUnique({
        where: { id: communityId },
      });
      if (!community) return { error: "Обрана громада не існує." };
    }

    // Завантажене фото має пріоритет; інакше — значення поля «URL обкладинки».
    const uploaded = await uploadImage(formData.get("coverFile") as File | null);
    const coverImage = uploaded ?? (str(formData, "coverImage") || null);

    const data = {
      title,
      excerpt,
      body,
      coverImage,
      tags: formatTags(str(formData, "tags").split(",")),
      categoryId,
      communityId,
      breaking: formData.get("breaking") === "on",
      status,
    };

    if (id) {
      const existing = await prisma.article.findUnique({
        where: { id },
        select: { publishedAt: true },
      });
      const slug = await uniqueSlug(customSlug || title, id);
      // Дату ПЕРШОЇ публікації зберігаємо назавжди — навіть якщо новину повернули
      // в чернетку й опублікували знову. Інакше при повторній публікації дата й
      // позиція у стрічці «стрибали» б угору, а в Google мінялась би дата новини.
      const publishedAt =
        existing?.publishedAt ?? (status === "published" ? new Date() : null);
      await prisma.article.update({
        where: { id },
        data: { ...data, slug, publishedAt },
      });
    } else {
      const slug = await uniqueSlug(customSlug || title);
      const publishedAt = status === "published" ? new Date() : null;
      await prisma.article.create({ data: { ...data, slug, publishedAt } });
    }
  } catch (e) {
    return { error: message(e) };
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

export async function saveAdvertiser(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAuth();
  const id = Number(formData.get("id")) || null;
  const name = str(formData, "name");
  const type = str(formData, "type");

  if (!name) return { error: "Вкажіть назву рекламодавця." };
  const data = {
    name,
    type: ADVERTISER_TYPES.includes(type) ? type : "інше",
  };

  try {
    if (id) await prisma.advertiser.update({ where: { id }, data });
    else await prisma.advertiser.create({ data });
  } catch (e) {
    return { error: message(e) };
  }

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

export async function saveAd(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAuth();
  const id = Number(formData.get("id")) || null;
  const title = str(formData, "title");
  const imageUrl = str(formData, "imageUrl");
  const linkUrl = str(formData, "linkUrl");
  const advertiserId = Number(formData.get("advertiserId"));
  const categoryId = Number(formData.get("categoryId")) || null;

  if (!title) return { error: "Вкажіть заголовок банера." };
  if (!imageUrl) return { error: "Вкажіть URL зображення банера." };
  if (!linkUrl) return { error: "Вкажіть посилання, куди веде банер." };
  if (!Number.isInteger(advertiserId) || advertiserId <= 0) {
    return { error: "Оберіть рекламодавця." };
  }

  const data = {
    title,
    imageUrl,
    linkUrl,
    tags: formatTags(str(formData, "tags").split(",")),
    active: formData.get("active") === "on",
    advertiserId,
    categoryId,
  };

  try {
    const advertiser = await prisma.advertiser.findUnique({
      where: { id: advertiserId },
    });
    if (!advertiser) return { error: "Обраний рекламодавець не існує." };

    if (id) await prisma.ad.update({ where: { id }, data });
    else await prisma.ad.create({ data });
  } catch (e) {
    return { error: message(e) };
  }

  revalidatePath("/admin/ads");
  redirect("/admin/ads");
}

export async function deleteAd(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id"));
  if (id) await prisma.ad.delete({ where: { id } });
  revalidatePath("/admin/ads");
}

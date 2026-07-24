"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { formatTags } from "@/lib/tags";
import { uploadImage } from "@/lib/storage";
import { uniqueSlug } from "@/lib/article-write";
import { uniqueBusinessSlug } from "@/lib/businesses";
import { isBusinessCategory } from "@/lib/business-categories";

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

/* ----------------------------- Бізнес ----------------------------- */

export async function saveBusiness(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAuth();

  const id = Number(formData.get("id")) || null;
  const name = str(formData, "name");
  const description = str(formData, "description");
  const rawCategory = str(formData, "category");
  const customSlug = str(formData, "slug");
  // Громада бізнесу; порожнє значення = весь район (communityId = null).
  const communityId = Number(formData.get("communityId")) || null;

  if (!name) return { error: "Вкажіть назву бізнесу." };
  if (!description) return { error: "Додайте короткий опис бізнесу." };

  // Невідома категорія → фолбек «інше».
  const category = isBusinessCategory(rawCategory) ? rawCategory : "inshe";

  // «Оплачено до» — кінець дня включно (щоб «до 31.08» захоплювало 31 серпня).
  const rawPaid = str(formData, "paidUntil");
  let paidUntil: Date | null = null;
  if (rawPaid) {
    paidUntil = new Date(rawPaid + "T23:59:59");
    if (isNaN(paidUntil.getTime())) {
      return { error: 'Невірна дата "оплачено до".' };
    }
  }

  try {
    if (communityId) {
      const community = await prisma.community.findUnique({
        where: { id: communityId },
      });
      if (!community) return { error: "Обрана громада не існує." };
    }

    // Завантажене фото має пріоритет; інакше — значення поля «URL фото».
    const uploaded = await uploadImage(
      formData.get("coverFile") as File | null,
      "businesses",
    );
    const photo = uploaded ?? (str(formData, "coverImage") || null);

    const data = {
      name,
      description,
      category,
      phone: str(formData, "phone") || null,
      address: str(formData, "address") || null,
      website: str(formData, "website") || null,
      photo,
      tags: formatTags(str(formData, "tags").split(",")),
      active: formData.get("active") === "on",
      paidUntil,
      communityId,
    };

    const slug = await uniqueBusinessSlug(customSlug || name, id ?? undefined);

    if (id) await prisma.business.update({ where: { id }, data: { ...data, slug } });
    else await prisma.business.create({ data: { ...data, slug } });
  } catch (e) {
    return { error: message(e) };
  }

  revalidatePath("/kataloh");
  revalidatePath("/admin/businesses");
  redirect("/admin/businesses");
}

export async function deleteBusiness(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id"));
  // Банери бізнесу зникнуть каскадом (Ad.business onDelete: Cascade).
  if (id) await prisma.business.delete({ where: { id } });
  revalidatePath("/kataloh");
  revalidatePath("/admin/businesses");
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
  const linkUrl = str(formData, "linkUrl");
  const businessId = Number(formData.get("businessId"));
  const categoryId = Number(formData.get("categoryId")) || null;

  if (!title) return { error: "Вкажіть заголовок банера." };
  if (!Number.isInteger(businessId) || businessId <= 0) {
    return { error: "Оберіть бізнес, якому належить банер." };
  }

  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });
    if (!business) return { error: "Обраний бізнес не існує." };

    // Завантажений банер має пріоритет; інакше — поле «URL зображення».
    const uploaded = await uploadImage(
      formData.get("bannerFile") as File | null,
      "ads",
    );
    const imageUrl = uploaded ?? str(formData, "imageUrl");
    if (!imageUrl) {
      return { error: "Додайте зображення банера або вкажіть його URL." };
    }

    const data = {
      title,
      imageUrl,
      // Порожнє посилання = банер веде на картку бізнесу (/kataloh/{slug}).
      linkUrl,
      tags: formatTags(str(formData, "tags").split(",")),
      active: formData.get("active") === "on",
      businessId,
      categoryId,
    };

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

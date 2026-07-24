import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import Cover from "@/components/Cover";
import { getBusinessBySlug } from "@/lib/businesses";
import {
  businessCategoryName,
  businessCategoryBadge,
} from "@/lib/business-categories";
import { ALL_COMMUNITIES_LABEL } from "@/lib/communities";
import { SITE_NAME, SITE_URL } from "@/lib/categories";
import { parseTags } from "@/lib/tags";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);
  if (!business) return { title: "Бізнес не знайдено" };

  const url = `/kataloh/${business.slug}`;
  const images = business.photo ? [business.photo] : undefined;
  // Опис для сніпета: власний опис або згенерований.
  const description =
    business.description.slice(0, 160) ||
    `${business.name} — ${businessCategoryName(business.category)} у каталозі «${SITE_NAME}».`;

  return {
    title: business.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "uk_UA",
      title: business.name,
      description,
      url,
      images,
    },
  };
}

export default async function BusinessPage({ params }: Params) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);
  if (!business) notFound();

  const tags = parseTags(business.tags);
  const paragraphs = business.description.split(/\n{2,}/).filter((p) => p.trim());
  const canonical = `${SITE_URL}/kataloh/${business.slug}`;

  // Структуровані дані для Google (локальний бізнес).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    description: business.description || undefined,
    image: business.photo ? [business.photo] : undefined,
    telephone: business.phone || undefined,
    address: business.address || undefined,
    url: canonical,
    sameAs: business.website ? [business.website] : undefined,
    inLanguage: "uk-UA",
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="text-sm text-neutral-500">
        <Link href="/kataloh" className="hover:text-brand-700">
          Каталог бізнесу
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span className="text-neutral-700">{business.name}</span>
      </nav>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${businessCategoryBadge(business.category)}`}
        >
          {businessCategoryName(business.category)}
        </span>
        <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
          {business.community?.name ?? ALL_COMMUNITIES_LABEL}
        </span>
      </div>

      <h1 className="mt-3 font-display text-3xl font-black leading-tight tracking-tight text-neutral-900 sm:text-4xl">
        {business.name}
      </h1>

      {business.photo && (
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-xl bg-neutral-100">
          <Cover
            src={business.photo}
            alt={business.name}
            sizes="(max-width: 768px) 100vw, 768px"
            priority
            imgClassName="object-cover"
          />
        </div>
      )}

      {paragraphs.length > 0 && (
        <div className="mt-6 space-y-4 text-base leading-relaxed text-neutral-800">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}

      {/* Контакти */}
      {(business.phone || business.address || business.website) && (
        <div className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
          <h2 className="font-display text-lg font-bold text-neutral-900">
            Контакти
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            {business.phone && (
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 text-neutral-500">Телефон</dt>
                <dd>
                  <a
                    href={`tel:${business.phone.replace(/\s/g, "")}`}
                    className="font-medium text-brand-700 hover:underline"
                  >
                    {business.phone}
                  </a>
                </dd>
              </div>
            )}
            {business.address && (
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 text-neutral-500">Адреса</dt>
                <dd className="text-neutral-800">{business.address}</dd>
              </div>
            )}
            {business.website && (
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 text-neutral-500">Сайт</dt>
                <dd className="min-w-0">
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="break-all font-medium text-brand-700 hover:underline"
                  >
                    {business.website}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600"
            >
              #{t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

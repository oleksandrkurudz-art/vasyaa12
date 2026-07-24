import Link from "next/link";
import Cover from "@/components/Cover";
import {
  businessCategoryName,
  businessCategoryBadge,
} from "@/lib/business-categories";
import { ALL_COMMUNITIES_LABEL } from "@/lib/communities";
import type { Business, Community } from "@/generated/prisma/client";

type Props = {
  business: Business & { community: Community | null };
};

export default function BusinessCard({ business }: Props) {
  const href = `/kataloh/${business.slug}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <Link
        href={href}
        className="relative block aspect-[4/3] overflow-hidden bg-neutral-100"
      >
        {business.photo ? (
          <Cover
            src={business.photo}
            alt={business.name}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
            imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400">
            {business.name}
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <span
          className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${businessCategoryBadge(business.category)}`}
        >
          {businessCategoryName(business.category)}
        </span>
        <h3 className="font-display mt-2 text-lg font-bold leading-snug text-neutral-900">
          <Link
            href={href}
            className="transition-colors group-hover:text-brand-700"
          >
            {business.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-neutral-600">
          {business.description}
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400">
          <span>{business.community?.name ?? ALL_COMMUNITIES_LABEL}</span>
          {business.phone && (
            <>
              <span aria-hidden>·</span>
              <span>{business.phone}</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

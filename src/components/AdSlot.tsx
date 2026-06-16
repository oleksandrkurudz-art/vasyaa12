import Cover from "@/components/Cover";
import type { AdWithAdvertiser } from "@/lib/ads";

/**
 * Блок контекстної реклами поруч зі статтею.
 * Банери підбираються рушієм у `@/lib/ads`.
 */
export default function AdSlot({ ads }: { ads: AdWithAdvertiser[] }) {
  if (ads.length === 0) return null;

  return (
    <aside aria-label="Реклама" className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
        Реклама
      </p>
      {ads.map((ad) => (
        <a
          key={ad.id}
          href={ad.linkUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="group block overflow-hidden rounded-lg border border-neutral-200 bg-white transition-shadow hover:shadow-md"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
            <Cover
              src={ad.imageUrl}
              alt={ad.title}
              sizes="(max-width: 1024px) 100vw, 300px"
              imgClassName="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Бейдж прозорості: кожен банер окремо позначено як рекламу. */}
            <span className="absolute left-2 top-2 rounded bg-black/65 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
              Реклама
            </span>
          </div>
          <div className="p-3">
            <p className="text-sm font-semibold text-neutral-900">{ad.title}</p>
            <p className="mt-0.5 text-xs text-neutral-500">
              {ad.advertiser.name}
            </p>
          </div>
        </a>
      ))}
    </aside>
  );
}

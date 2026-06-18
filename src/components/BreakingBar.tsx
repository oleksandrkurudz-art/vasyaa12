import Link from "next/link";
import { getAirRaid, AIR_RAID_REGION } from "@/lib/airraid";
import { getBreakingArticles } from "@/lib/articles";

// Червона стрічка найвище на сторінці. Пріоритет:
//  1) АВТОМАТИЧНО — активна повітряна тривога в області (дані з API);
//  2) інакше — вручну позначена «термінова» новина (перекриття дороги,
//     відключення води тощо), якщо така є.
// Якщо нічого з цього — нічого не рендерить.
export default async function BreakingBar() {
  const air = await getAirRaid();
  if (air.active) return <AirRaidBar since={air.since} />;

  const [item] = await getBreakingArticles(1);
  if (!item) return null;
  return (
    <BarShell label="Терміново">
      <Link
        href={`/${item.category.slug}/${item.slug}`}
        className="truncate text-sm font-medium hover:underline"
      >
        {item.title}
      </Link>
    </BarShell>
  );
}

function AirRaidBar({ since }: { since: string | null }) {
  // `since` має формат "YYYY-MM-DD HH:MM:SS" (київський час від API) — беремо HH:MM.
  const time = since && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(since)
    ? since.slice(11, 16)
    : null;
  return (
    <BarShell label="Тривога" alert>
      <span className="truncate text-sm font-semibold">
        Повітряна тривога — {AIR_RAID_REGION}
        {time ? ` · з ${time}` : ""}
      </span>
    </BarShell>
  );
}

// Спільна оболонка червоної стрічки з пульсуючою крапкою-індикатором.
function BarShell({
  label,
  alert = false,
  children,
}: {
  label: string;
  alert?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div role={alert ? "alert" : undefined} className="bg-red-600 text-white">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-2">
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-sm bg-white/15 px-2 py-0.5 text-xs font-bold uppercase tracking-wide">
          <span className="relative flex h-2 w-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          {label}
        </span>
        {children}
      </div>
    </div>
  );
}

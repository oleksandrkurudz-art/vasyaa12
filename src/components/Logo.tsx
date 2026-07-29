import Link from "next/link";
import { SITE_NAME, SITE_SLOGAN } from "@/lib/categories";

/**
 * Фірмовий знак НРГ: словесний логотип «НРГ» + червоний бейдж «LIVE»
 * (знак живого ефіру з логотипа). Працює на темному тлі (шапка) і на
 * світлому (липка смуга меню, підвал) — через проп `tone`.
 *
 * Круглий «LIVE» з оригіналу адаптовано в пігулку: вертикальний текст у
 * колі стає нечитабельним на висоті ~28px, тож для вебу — горизонтальний
 * бейдж із пульсуючою крапкою.
 */
export default function Logo({
  size = "md",
  tone = "onDark",
}: {
  size?: "sm" | "md";
  tone?: "onDark" | "onLight";
}) {
  const md = size === "md";

  const word = md ? "text-2xl sm:text-3xl" : "text-xl";
  const wordTone = tone === "onDark" ? "text-white" : "text-brand-950";
  const badge = md
    ? "gap-1 px-1.5 py-0.5 text-[10px]"
    : "gap-[3px] px-1 py-px text-[9px]";
  const dot = md ? "h-1.5 w-1.5" : "h-1 w-1";

  return (
    <Link
      href="/"
      aria-label={`${SITE_NAME} — ${SITE_SLOGAN}`}
      className="flex min-w-0 shrink-0 items-center gap-1.5"
    >
      <span
        className={`font-display font-black leading-none tracking-tight ${word} ${wordTone}`}
      >
        {SITE_NAME}
      </span>
      {/* «LIVE» — червоний акцент бренду (єдине червоне в шапці). */}
      <span
        aria-hidden
        className={`inline-flex items-center rounded-sm bg-urgent-600 font-black uppercase leading-none tracking-wider text-white ${badge}`}
      >
        <span className={`rounded-full bg-white/90 ${dot}`} />
        Live
      </span>
    </Link>
  );
}

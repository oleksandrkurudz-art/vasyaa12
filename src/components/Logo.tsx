import Link from "next/link";
import { SITE_NAME, SITE_SLOGAN } from "@/lib/categories";

/**
 * Фірмовий знак НРГ у стилі BBC — три квадратні плашки з літерами «Н», «Р», «Г».
 * Плашки дають знаку вагу навіть дрібним/по центру (голі літери «губились»).
 * `tone`:
 *  • `onDark`  — на чорній шапці: білі плашки, чорні літери;
 *  • `onLight` — на світлому (підвал): чорні плашки, білі літери (як у BBC).
 * `size` керує кеглем/розміром плашок.
 */
export default function Logo({
  size = "md",
  tone = "onLight",
}: {
  size?: "sm" | "md";
  tone?: "onDark" | "onLight";
}) {
  const md = size === "md";
  const box = md
    ? "h-8 w-8 text-lg sm:h-10 sm:w-10 sm:text-[1.35rem]"
    : "h-7 w-7 text-sm";
  // На головному хедері (md) — ширший відступ між плашками; у компактному барі/
  // підвалі (sm) лишаємо щільніше.
  const gap = md ? "gap-3" : "gap-1.5";
  const colors =
    tone === "onDark" ? "bg-white text-neutral-950" : "bg-neutral-950 text-white";

  return (
    <Link
      href="/"
      aria-label={`${SITE_NAME} — ${SITE_SLOGAN}`}
      className={`flex shrink-0 items-center ${gap}`}
    >
      {SITE_NAME.split("").map((letter, i) => (
        <span
          key={i}
          aria-hidden
          className={`flex items-center justify-center font-display font-black leading-none ${box} ${colors}`}
        >
          {letter}
        </span>
      ))}
    </Link>
  );
}

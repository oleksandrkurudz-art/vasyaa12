import Link from "next/link";
import { SITE_NAME, SITE_SLOGAN } from "@/lib/categories";

/**
 * Фірмовий знак НРГ: біле «НРГ» на плашці фірмового синього.
 * - `variant="plate"` (типово) — компактна заокруглена плашка (підвал, смуга меню).
 * - `variant="band"` — плашка тягнеться на всю висоту контейнера (синя смуга
 *   згори донизу хедера). Потребує, щоб батько-flex був `items-stretch` (або
 *   сам знак діставав `self-stretch`), і щоб контейнер не мав вертикального
 *   padding-у, який має «з'їсти» смуга.
 */
export default function Logo({
  size = "md",
  variant = "plate",
}: {
  size?: "sm" | "md";
  variant?: "plate" | "band";
}) {
  const md = size === "md";
  const word = md ? "text-2xl sm:text-3xl" : "text-xl";
  const box =
    variant === "band"
      ? "self-stretch rounded-none px-4 sm:px-5"
      : md
        ? "rounded-md px-2.5 py-1"
        : "rounded-md px-2 py-0.5";

  return (
    <Link
      href="/"
      aria-label={`${SITE_NAME} — ${SITE_SLOGAN}`}
      className={`flex min-w-0 shrink-0 ${
        variant === "band" ? "items-stretch self-stretch" : "items-center"
      }`}
    >
      <span
        className={`inline-flex items-center bg-brand-600 font-display font-black leading-none tracking-tight text-white ${box} ${word}`}
      >
        {SITE_NAME}
      </span>
    </Link>
  );
}

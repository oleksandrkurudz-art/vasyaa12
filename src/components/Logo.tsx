import Link from "next/link";
import { SITE_NAME, SITE_SLOGAN } from "@/lib/categories";

/**
 * Фірмовий знак НРГ: біле «НРГ» на плашці фірмового темно-синього.
 * Знак несе власне тло, тож однаково працює на чорній шапці, світлій
 * смузі меню й у підвалі — окремих варіантів під тло не треба.
 */
export default function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const md = size === "md";
  const word = md ? "text-2xl sm:text-3xl" : "text-xl";
  // Рамка навколо знака — щедра, пропорційна самому напису.
  const plate = md ? "px-4 py-2.5 sm:px-5 sm:py-3" : "px-3 py-2";

  return (
    <Link
      href="/"
      aria-label={`${SITE_NAME} — ${SITE_SLOGAN}`}
      className="flex min-w-0 shrink-0 items-center"
    >
      <span
        className={`inline-flex items-center rounded-lg bg-brand-600 font-display font-black leading-none tracking-tight text-white ${plate} ${word}`}
      >
        {SITE_NAME}
      </span>
    </Link>
  );
}

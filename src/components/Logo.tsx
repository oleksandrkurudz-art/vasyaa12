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
  const plate = md ? "px-2.5 py-1" : "px-2 py-0.5";

  return (
    <Link
      href="/"
      aria-label={`${SITE_NAME} — ${SITE_SLOGAN}`}
      className="flex min-w-0 shrink-0 items-center"
    >
      <span
        className={`inline-flex items-center rounded-md bg-brand-950 font-display font-black leading-none tracking-tight text-white ${plate} ${word}`}
      >
        {SITE_NAME}
      </span>
    </Link>
  );
}

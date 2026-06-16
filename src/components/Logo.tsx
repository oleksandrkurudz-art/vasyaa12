import Link from "next/link";
import { SITE_NAME } from "@/lib/categories";

/**
 * Фірмовий знак: градієнтний бейдж із serif-«Г», внутрішнім обідком
 * і акцент-смужкою знизу — щоб виглядав як логотип, а не заглушка.
 */
export default function Logo({
  size = "md",
}: {
  size?: "sm" | "md";
}) {
  const md = size === "md";
  const box = md ? "h-10 w-10" : "h-8 w-8";
  const letter = md ? "text-2xl" : "text-lg";
  const accent = md ? "inset-x-1.5 bottom-[3px] h-[3px]" : "inset-x-1 bottom-[2px] h-[2px]";
  const name = md
    ? "text-2xl text-white sm:text-3xl"
    : "text-lg text-neutral-900";

  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5">
      <span
        className={`relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 shadow-sm ring-1 ring-inset ring-white/20 ${box}`}
      >
        <span
          className={`font-display ${letter} font-black leading-none text-white`}
        >
          Г
        </span>
        <span className={`absolute rounded-full bg-white/55 ${accent}`} />
      </span>
      <span className={`font-display font-black tracking-tight ${name}`}>
        {SITE_NAME}
      </span>
    </Link>
  );
}

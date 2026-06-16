"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <ul className="flex min-w-max gap-1">
      {CATEGORIES.map((c) => {
        const href = `/${c.slug}`;
        const active = pathname === href;
        return (
          <li key={c.slug}>
            <Link
              href={href}
              className={`block whitespace-nowrap border-b-[3px] px-3 py-3 text-sm font-semibold transition-all duration-200 ${
                active
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-neutral-600 hover:border-brand-300 hover:text-brand-700"
              }`}
            >
              {c.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

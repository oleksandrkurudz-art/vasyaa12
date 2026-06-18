"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setCommunity } from "@/app/(public)/community-actions";
import type { Community } from "@/generated/prisma/client";

// Перемикач громади у шапці. Зберігає вибір (cookie через server action)
// і оновлює сторінку, щоб стрічка перерендерилась відфільтрованою.
export default function CommunitySwitcher({
  communities,
  activeSlug,
  variant = "dark",
}: {
  communities: Community[];
  activeSlug: string | null;
  // dark — на темній шапці; light — у світлому бургер-меню на телефоні.
  variant?: "dark" | "light";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const light = variant === "light";

  return (
    <label
      className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs ${
        light ? "bg-neutral-200 text-neutral-800" : "bg-white/10 text-white"
      }`}
      title="Оберіть громаду"
    >
      {/* Брендова шпилька замість емодзі — однакова на всіх пристроях */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        aria-hidden
        className="shrink-0 text-brand-600"
      >
        <path
          fill="currentColor"
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        />
        <circle cx="12" cy="9" r="2.6" fill={light ? "#e5e7eb" : "#171717"} />
      </svg>
      <select
        aria-label="Громада"
        value={activeSlug ?? ""}
        disabled={pending}
        onChange={(e) => {
          const slug = e.target.value;
          startTransition(async () => {
            await setCommunity(slug);
            router.refresh();
          });
        }}
        className={`max-w-[9rem] cursor-pointer bg-transparent font-semibold outline-none [&>option]:text-neutral-900 ${
          light ? "text-neutral-900" : "text-white"
        }`}
      >
        <option value="">Весь район</option>
        {communities.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
}

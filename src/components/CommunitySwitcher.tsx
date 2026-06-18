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
      <span aria-hidden>📍</span>
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

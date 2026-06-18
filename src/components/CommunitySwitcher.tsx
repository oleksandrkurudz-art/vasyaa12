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
}: {
  communities: Community[];
  activeSlug: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <label
      className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-xs text-white"
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
        className="max-w-[9rem] cursor-pointer bg-transparent font-semibold text-white outline-none [&>option]:text-neutral-900"
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

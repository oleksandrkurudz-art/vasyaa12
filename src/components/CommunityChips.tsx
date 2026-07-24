"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setCommunity } from "@/app/(public)/community-actions";
import type { Community } from "@/generated/prisma/client";

// Вибір громади для бургер-меню на телефоні — інлайн-чипи замість вкладеного
// дропдауна (список усередині списку виглядав чужорідно). Логіка та сама:
// зберігаємо вибір (cookie через server action) і оновлюємо сторінку.
export default function CommunityChips({
  communities,
  activeSlug,
}: {
  communities: Community[];
  activeSlug: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const options = [
    { slug: "", name: "Весь район" },
    ...communities.map((c) => ({ slug: c.slug, name: c.name })),
  ];

  function choose(slug: string) {
    if (slug === (activeSlug ?? "")) return;
    startTransition(async () => {
      await setCommunity(slug);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.slug === (activeSlug ?? "");
        return (
          <button
            key={o.slug || "all"}
            type="button"
            onClick={() => choose(o.slug)}
            disabled={pending}
            aria-pressed={active}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60 ${
              active
                ? "bg-brand-600 text-white"
                : "border border-white/20 text-neutral-200 hover:bg-white/10 hover:text-white"
            }`}
          >
            {o.name}
          </button>
        );
      })}
    </div>
  );
}

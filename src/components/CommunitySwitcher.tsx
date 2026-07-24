"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { setCommunity } from "@/app/(public)/community-actions";
import type { Community } from "@/generated/prisma/client";

// Перемикач громади у шапці. Зберігає вибір (cookie через server action)
// і оновлює сторінку, щоб стрічка перерендерилась відфільтрованою.
// Власний випадаючий список (не нативний <select>) — щоб керувати розміром
// і зробити темно-прозоре меню замість дрібного білого від ОС.
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
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const light = variant === "light";

  // Закриття на клік поза меню та на Escape.
  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const options = [
    { slug: "", name: "Весь район" },
    ...communities.map((c) => ({ slug: c.slug, name: c.name })),
  ];
  const activeName =
    options.find((o) => o.slug === (activeSlug ?? ""))?.name ?? "Весь район";

  function choose(slug: string) {
    setOpen(false);
    if (slug === (activeSlug ?? "")) return;
    startTransition(async () => {
      await setCommunity(slug);
      router.refresh();
    });
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={pending}
        onClick={() => setOpen((v) => !v)}
        title="Оберіть громаду"
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60 ${
          light
            ? "bg-neutral-200 text-neutral-800 hover:bg-neutral-300"
            : "border border-white/15 text-white hover:border-white/40 hover:bg-white/5"
        }`}
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
        <span className="max-w-[9rem] truncate">{activeName}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden
          className={`shrink-0 opacity-70 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Громада"
          className={`absolute right-0 z-50 mt-2 max-h-[70vh] min-w-[15rem] overflow-auto rounded-xl p-1.5 text-sm shadow-2xl ring-1 backdrop-blur-md ${
            light
              ? "bg-white/95 text-neutral-800 ring-black/10"
              : "bg-neutral-900/85 text-white ring-white/10"
          }`}
        >
          {options.map((o) => {
            const isActive = o.slug === (activeSlug ?? "");
            return (
              <li key={o.slug || "all"} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onClick={() => choose(o.slug)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                    light ? "hover:bg-neutral-100" : "hover:bg-white/10"
                  } ${isActive ? "font-semibold" : "font-medium"}`}
                >
                  <span className="truncate">{o.name}</span>
                  {isActive && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      aria-hidden
                      className="shrink-0 text-brand-600"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

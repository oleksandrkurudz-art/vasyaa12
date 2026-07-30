"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Пошук у шапці. Клік по іконці розгортає поле прямо в шапці — вводиш запит і
// тиснеш Enter, потрапляючи одразу на результати. Раніше це було посилання,
// що кидало на порожню сторінку /search ще до введення запиту.
// `tone`: dark — на чорному масthead-і; light — у білій липкій смузі на скролі.
export default function HeaderSearch({
  tone = "dark",
}: {
  tone?: "dark" | "light";
}) {
  const router = useRouter();
  const light = tone === "light";
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Пошук новин"
        className={`flex items-center gap-1.5 px-1.5 py-1.5 text-sm font-medium transition-colors ${
          light
            ? "text-neutral-600 hover:text-neutral-900"
            : "text-neutral-100 hover:text-white"
        }`}
      >
        <SearchIcon />
        <span className="hidden sm:inline">Пошук</span>
      </button>
    );
  }

  return (
    <form onSubmit={submit} role="search" className="relative">
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
      <input
        ref={inputRef}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onBlur={() => q.trim() === "" && setOpen(false)}
        placeholder="Пошук новин…"
        aria-label="Пошук новин"
        className={`w-44 py-1.5 pl-9 pr-3 text-xs outline-none transition-colors placeholder:text-neutral-400 sm:w-60 ${
          light
            ? "border border-neutral-300 bg-white text-neutral-900 focus:border-neutral-500"
            : "border border-white/25 bg-white/10 text-white focus:border-white/50"
        }`}
      />
    </form>
  );
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

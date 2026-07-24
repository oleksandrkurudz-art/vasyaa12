"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Пошук у шапці. Клік по іконці розгортає поле прямо в шапці — вводиш запит і
// тиснеш Enter, потрапляючи одразу на результати. Раніше це було посилання,
// що кидало на порожню сторінку /search ще до введення запиту.
export default function HeaderSearch() {
  const router = useRouter();
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
        className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:border-white/40 hover:bg-white/5 hover:text-white"
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
        className="w-44 rounded-full border border-white/25 bg-white/10 py-1.5 pl-9 pr-3 text-xs text-white outline-none transition-colors placeholder:text-neutral-400 focus:border-white/50 sm:w-60"
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

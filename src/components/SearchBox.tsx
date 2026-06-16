"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBox({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (query) router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={submit} className={`relative ${className}`} role="search">
      <svg
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
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
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Пошук новин…"
        aria-label="Пошук новин"
        className="w-full rounded-full border border-neutral-300 bg-neutral-50 py-2 pl-9 pr-4 text-sm outline-none transition-colors focus:border-brand-600 focus:bg-white"
      />
    </form>
  );
}

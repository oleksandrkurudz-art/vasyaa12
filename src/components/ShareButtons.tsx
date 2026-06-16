"use client";

import { useState } from "react";

export default function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  function url() {
    return typeof window !== "undefined" ? window.location.href : "";
  }

  function open(target: string) {
    const u = encodeURIComponent(url());
    const t = encodeURIComponent(title);
    const map: Record<string, string> = {
      telegram: `https://t.me/share/url?url=${u}&text=${t}`,
      viber: `viber://forward?text=${t}%20${u}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    };
    window.open(map[target], "_blank", "noopener,noreferrer");
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  const btn =
    "flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium text-white transition-opacity hover:opacity-90";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-medium text-neutral-500">
        Поділитися:
      </span>
      <button onClick={() => open("telegram")} className={`${btn} bg-[#229ED9]`}>
        Telegram
      </button>
      <button onClick={() => open("viber")} className={`${btn} bg-[#7360F2]`}>
        Viber
      </button>
      <button onClick={() => open("facebook")} className={`${btn} bg-[#1877F2]`}>
        Facebook
      </button>
      <button
        onClick={copy}
        className="flex h-9 items-center gap-2 rounded-full border border-neutral-300 px-4 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
      >
        {copied ? "Скопійовано ✓" : "Копіювати"}
      </button>
    </div>
  );
}

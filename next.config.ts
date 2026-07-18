import type { NextConfig } from "next";

// Хост нашого Supabase Storage — єдине джерело, яке ми оптимізуємо через
// next/image. Береться з SUPABASE_URL, з фолбеком на відомий хост проєкту.
// Хостити довільні URL через оптимізатор небезпечно (відкритий проксі:
// будь-хто ганяв би свої зображення через наш /_next/image коштом Vercel),
// тому вставлені редактором зовнішні URL рендеряться як є (unoptimized) —
// див. src/components/Cover.tsx.
function supabaseHost(): string {
  try {
    return new URL(process.env.SUPABASE_URL ?? "").hostname;
  } catch {
    return "pruswnyuxxaqmxrchhzu.supabase.co";
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: supabaseHost(), pathname: "/storage/**" },
    ],
  },
  experimental: {
    // Дозволяємо вантажити фото обкладинок до 10 МБ через серверні дії (типово 1 МБ).
    serverActions: { bodySizeLimit: "10mb" },
  },
  // sharp — нативний модуль (бінарники в пакетах @img/*). Vercel не завжди тягне
  // його у бандл функції, тому явно включаємо у трасування для сторінок адмінки,
  // де працює завантаження/стиснення фото. Інакше — "Failed to load external module".
  outputFileTracingIncludes: {
    "/admin/**": ["node_modules/sharp/**/*", "node_modules/@img/**/*"],
    // Бот теж стискає завантажені фото через sharp.
    "/api/telegram/**": ["node_modules/sharp/**/*", "node_modules/@img/**/*"],
  },
};

export default nextConfig;

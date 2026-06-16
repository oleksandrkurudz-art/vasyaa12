import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Редактори вставляють довільні URL обкладинок/банерів, тому дозволяємо будь-який https-хост.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
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
  },
};

export default nextConfig;

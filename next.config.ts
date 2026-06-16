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
};

export default nextConfig;

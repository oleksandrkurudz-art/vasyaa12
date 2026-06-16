import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Редактори вставляють довільні URL обкладинок/банерів, тому дозволяємо будь-який https-хост.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;

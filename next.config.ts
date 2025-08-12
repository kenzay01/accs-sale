import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Налаштування для App Router
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Налаштування для загрузки файлів
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;

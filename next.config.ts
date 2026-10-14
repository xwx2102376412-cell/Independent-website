import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { formats: ["image/avif", "image/webp"] },
  turbopack: { root: process.cwd() },
  experimental: { optimizePackageImports: ["@phosphor-icons/react"] },
};

export default nextConfig;

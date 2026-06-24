import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    deviceSizes: [320, 480, 640, 750, 828, 1080, 1200, 1920],
    remotePatterns: [
      // Add any external image domains here if needed
    ],
  },
};

export default nextConfig;

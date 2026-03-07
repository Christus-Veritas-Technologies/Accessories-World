import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: "/feed.xml",
        headers: [{ key: "Content-Type", value: "application/rss+xml" }],
      },
    ];
  },
};

export default nextConfig;

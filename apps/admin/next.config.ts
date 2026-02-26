import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true
  },
   images: {
    remotePatterns: [new URL('https://7b71f489541fe72763c158b881ed7ccb.r2.cloudflarestorage.com/accessories-world/**')],
  },
};

export default nextConfig;

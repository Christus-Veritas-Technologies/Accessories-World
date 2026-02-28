import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
   typescript: {
    ignoreBuildErrors: true
  },
   images: {
    remotePatterns: [new URL('https://pub-f43930670c1848d38f9e9242a40ca7e2.r2.dev/**')],
  },
};

export default nextConfig;

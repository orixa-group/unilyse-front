import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  // Proxy Unilize : app/api/unilize/[...path]/route.ts (pas de rewrite ici —
  // les rewrites passent avant les route handlers et bloquaient le proxy en prod).
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;

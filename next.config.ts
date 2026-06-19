import type { NextConfig } from "next";

const unilizeUpstream =
  process.env.API_URL?.replace(/\/$/, "") ??
  "https://public-api-531732557398.europe-west9.run.app";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/unilize/:path*",
        destination: `${unilizeUpstream}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;

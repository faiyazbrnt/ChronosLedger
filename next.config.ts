import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  devIndicators: {
    position: "bottom-right",
  },
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;

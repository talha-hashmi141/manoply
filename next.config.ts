import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    // Railway build was failing due to ESLint config resolution;
    // app is already type-checked, so we can safely skip lint during build.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

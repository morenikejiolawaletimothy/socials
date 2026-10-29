import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundle only the icons each page uses.
  experimental: { optimizePackageImports: ["@phosphor-icons/react"] },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow local uploads
    remotePatterns: [],
  },
  // Required for better-sqlite3
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;

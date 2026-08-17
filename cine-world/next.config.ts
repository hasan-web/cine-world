import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  experimental: {
    // Server Actions cap request bodies at 1MB by default, which a Letterboxd diary export with
    // reviews can exceed. Raised deliberately, and only to 2MB — the import action enforces the
    // same ceiling itself so an oversized file gets a real message instead of a framework error.
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;

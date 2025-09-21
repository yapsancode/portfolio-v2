import type { NextConfig } from "next";
import { join } from "path";

const nextConfig: NextConfig = {
  /* other config options here */

  // Turbopack config
  turbopack: {
    // Ensure Next.js uses the correct root directory
    root: join(__dirname),
  },

  // Optional: enable strict mode for React
  reactStrictMode: true,
};

export default nextConfig;

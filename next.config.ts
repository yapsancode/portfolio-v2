import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this folder. Without it, Next.js picks up a
  // stray package-lock.json higher up (e.g. in the home folder) and the dev
  // server fails with "Could not find the module ... in the React Client Manifest".
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;

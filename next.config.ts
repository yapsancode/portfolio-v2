import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // three ships untranspiled ESM/examples; let Next compile it so the
  // 3D hero bundles cleanly in both server and client builds.
  transpilePackages: ["three"],
};

export default nextConfig;

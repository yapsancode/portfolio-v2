import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // three ships untranspiled ESM/examples; let Next compile it so the
  // 3D hero bundles cleanly in both server and client builds.
  transpilePackages: ["three"],

  images: {
    // Spotify album / episode art (the NowPlaying pill thumbnail) is served
    // from Spotify's CDN. Allow it so next/image can fetch + optimize it
    // server-side and serve it from our own origin — that avoids any
    // cross-origin hotlink/referrer failure in the browser. Album covers live
    // on i.scdn.co; podcast + playlist art use other *.scdn.co / *.spotifycdn
    // subdomains, so allow those too.
    remotePatterns: [
      { protocol: "https", hostname: "i.scdn.co" },
      { protocol: "https", hostname: "**.scdn.co" },
      { protocol: "https", hostname: "**.spotifycdn.com" },
    ],
  },
};

export default nextConfig;

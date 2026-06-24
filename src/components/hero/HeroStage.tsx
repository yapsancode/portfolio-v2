"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import HeroAvatar from "./HeroAvatar";

// Lazy-load the WebGL stage: client-only, split out of the initial bundle.
// Until it resolves (and on any failure) we show the flat SVG character.
const Scene3D = dynamic(() => import("./Scene3D"), {
  ssr: false,
  loading: () => <div className="flex h-full w-full items-center justify-center">
      <span className="text-xl font-extrabold uppercase tracking-widest text-charcoal/60">
        Loading...
      </span>
    </div>,
});

/**
 * Picks the hero focal element:
 *  - The lazy 3D <Scene3D/> on capable, motion-OK pointer devices.
 *  - The flat SVG <HeroAvatar/> (which has its own behaviors) for touch /
 *    prefers-reduced-motion, as the SSR / pre-hydration default, and as the
 *    permanent fallback if WebGL context is lost and can't recover.
 */
export default function HeroStage() {
  const [use3D, setUse3D] = useState(false);
  const [webglDead, setWebglDead] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(pointer: fine)");
    const decide = () => setUse3D(fine.matches && !reduce.matches);
    decide();
    reduce.addEventListener("change", decide);
    fine.addEventListener("change", decide);
    return () => {
      reduce.removeEventListener("change", decide);
      fine.removeEventListener("change", decide);
    };
  }, []);

  return (
    <div className="h-full w-full">
      {use3D && !webglDead ? (
        <Scene3D onContextUnrecoverable={() => setWebglDead(true)} />
      ) : (
        <HeroAvatar />
      )}
    </div>
  );
}

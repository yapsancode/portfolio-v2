"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Initials2D from "./Initials2D";

// Lazy-load the WebGL scene: client-only (no SSR) and split out of the
// initial bundle. Until it resolves we show the flat fallback as the loader.
const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => <Initials2D />,
});

/**
 * Decides what the hero focal element renders:
 *  - Flat <Initials2D/> for small screens or prefers-reduced-motion (and as the
 *    SSR / pre-hydration default, which avoids hydration mismatch).
 *  - The lazy 3D <Scene/> only on capable, motion-OK clients.
 */
export default function HeroVisual() {
  const [use3D, setUse3D] = useState(false);
  // Once WebGL proves unrecoverable, stay on the flat fallback for the session.
  const [webglDead, setWebglDead] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const small = window.matchMedia("(max-width: 768px)");

    const decide = () => setUse3D(!reduceMotion.matches && !small.matches);
    decide();

    // Re-evaluate if the user resizes or flips their motion preference.
    reduceMotion.addEventListener("change", decide);
    small.addEventListener("change", decide);
    return () => {
      reduceMotion.removeEventListener("change", decide);
      small.removeEventListener("change", decide);
    };
  }, []);

  return (
    <div className="h-[42vh] w-full sm:h-[52vh] md:h-full">
      {use3D && !webglDead ? (
        <Scene onContextUnrecoverable={() => setWebglDead(true)} />
      ) : (
        <Initials2D />
      )}
    </div>
  );
}

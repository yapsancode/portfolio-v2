"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import Initials3D from "./Initials3D";
import { site } from "@/config/site";

/**
 * The full R3F scene. Loaded lazily (client-only) by HeroVisual.
 *
 * Performance guards:
 *  - dpr capped at [1, 2] so retina displays don't render 3–4× the pixels.
 *  - frameloop flips to "never" when the canvas scrolls offscreen, so we stop
 *    burning GPU/CPU on a hero nobody is looking at.
 *
 * Resilience:
 *  - We do NOT request "high-performance": on hybrid-GPU laptops that hint can
 *    make the browser switch to the dGPU and lose the WebGL context. Letting the
 *    browser choose is far more stable.
 *  - We handle webglcontextlost/restored. three already tries to restore; if the
 *    context does not come back, we call onContextUnrecoverable so the hero can
 *    fall back to the flat initials instead of showing a dead canvas.
 */
export default function Scene({
  onContextUnrecoverable,
}: {
  onContextUnrecoverable?: () => void;
}) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const el = wrapper.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: "120px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapper} className="h-full w-full" aria-hidden="true">
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 8], fov: 42 }}
        gl={{ alpha: true, antialias: true }}
        // The lime page background shows through; keep the canvas transparent.
        style={{ background: "transparent" }}
        onCreated={({ gl }) => {
          const canvas = gl.domElement;
          let giveUpTimer: ReturnType<typeof setTimeout> | undefined;

          const onLost = (e: Event) => {
            // Tell the browser we want the context back (three does this too,
            // but being explicit is harmless and guards older paths).
            e.preventDefault();
            // If it hasn't restored shortly, degrade to the flat fallback.
            giveUpTimer = setTimeout(() => onContextUnrecoverable?.(), 2500);
          };
          const onRestored = () => {
            if (giveUpTimer) clearTimeout(giveUpTimer);
          };

          canvas.addEventListener("webglcontextlost", onLost, false);
          canvas.addEventListener("webglcontextrestored", onRestored, false);
        }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 6, 5]} intensity={2.1} />
        {/* Cool rim light to separate the matte charcoal from the lime field. */}
        <directionalLight position={[-6, -2, -4]} intensity={0.7} color="#bdf06a" />
        <Initials3D key={site.initials} />
      </Canvas>
    </div>
  );
}

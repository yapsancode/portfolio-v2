"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Float } from "@react-three/drei";
import Character3D from "./Character3D";

/**
 * R3F stage for the 3D character. Loaded lazily (client-only) by HeroStage.
 *
 * Performance: dpr capped at [1, 2]; frameloop pauses ("never") when scrolled
 * offscreen. Resilience: no "high-performance" hint (stable on hybrid GPUs) and
 * webglcontextlost/restored handling — if the context can't recover we call
 * onContextUnrecoverable so the hero degrades to the flat SVG character.
 */
export default function Scene3D({
  onContextUnrecoverable,
}: {
  onContextUnrecoverable?: () => void;
}) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const el = wrapper.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      rootMargin: "120px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapper} className="h-full w-full" aria-hidden="true">
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, 2]}
        camera={{ position: [0, 1.5, 6.0], fov: 36 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
        onCreated={({ gl, camera }) => {
          camera.lookAt(0, 1.45, 0); // aim at the character's mid-height
          const canvas = gl.domElement;
          let giveUp: ReturnType<typeof setTimeout> | undefined;
          canvas.addEventListener(
            "webglcontextlost",
            (e) => {
              e.preventDefault();
              giveUp = setTimeout(() => onContextUnrecoverable?.(), 2500);
            },
            false,
          );
          canvas.addEventListener(
            "webglcontextrestored",
            () => {
              if (giveUp) clearTimeout(giveUp);
            },
            false,
          );
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 7, 5]} intensity={2.1} />
        {/* warm-lime rim light to lift the matte charcoal off the lime field */}
        <directionalLight position={[-5, 2, -4]} intensity={0.8} color="#d7ff6b" />

        <Float speed={1.4} rotationIntensity={0.18} floatIntensity={0.5} floatingRange={[-0.05, 0.05]}>
          <Character3D />
        </Float>

        <ContactShadows
          position={[0, 0.02, 0]}
          opacity={0.35}
          scale={6}
          blur={2.6}
          far={4}
          color="#1a1b16"
        />
      </Canvas>
    </div>
  );
}

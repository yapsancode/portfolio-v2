"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Center, Text3D } from "@react-three/drei";
import type { Group } from "three";
import { site } from "@/config/site";

const FONT_URL = "/fonts/helvetiker_bold.typeface.json";

// Max tilt in radians and how quickly we ease toward the target each frame.
const MAX_TILT = 0.38;
const EASE = 3.2;

/**
 * Extruded initials (real TextGeometry letterforms, not placeholder boxes)
 * in a matte charcoal material, with a subtle mouse-follow tilt that smoothly
 * eases back to center. All animation runs through useFrame and mutates refs —
 * no React state in the render loop.
 */
export default function Initials3D() {
  const group = useRef<Group>(null);

  // Normalized pointer target in [-1, 1]; (0,0) === centered === neutral tilt.
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    // When the pointer leaves the window or the tab blurs, ease back to center.
    const recenter = () => {
      target.current.x = 0;
      target.current.y = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", recenter);
    window.addEventListener("blur", recenter);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", recenter);
      window.removeEventListener("blur", recenter);
    };
  }, []);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    // Frame-rate-independent easing toward the pointer-derived target.
    const t = Math.min(1, EASE * delta);
    const desiredX = target.current.y * MAX_TILT; // vertical mouse → pitch
    const desiredY = target.current.x * MAX_TILT; // horizontal mouse → yaw
    g.rotation.x += (desiredX - g.rotation.x) * t;
    g.rotation.y += (desiredY - g.rotation.y) * t;
  });

  return (
    <group ref={group}>
      <Center>
        <Text3D
          font={FONT_URL}
          size={2.4}
          height={0.7}
          curveSegments={14}
          bevelEnabled
          bevelThickness={0.05}
          bevelSize={0.035}
          bevelOffset={0}
          bevelSegments={5}
        >
          {site.initials}
          <meshStandardMaterial color="#1a1b16" roughness={0.62} metalness={0.08} />
        </Text3D>
      </Center>
    </group>
  );
}

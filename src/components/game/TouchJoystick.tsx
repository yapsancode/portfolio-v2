"use client";

import { useRef, useState } from "react";
import type { PointerEvent } from "react";
import { joystickVector, type StickVector } from "./touch-controls";

export default function TouchJoystick({ onMove }: { onMove: (value: StickVector) => void }) {
  const pointer = useRef<number | null>(null);
  const [thumb, setThumb] = useState({ x: 0, y: 0 });

  const move = (e: PointerEvent<HTMLButtonElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const radius = box.width * 0.3;
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    const distance = Math.hypot(x, y);
    const scale = distance > radius ? radius / distance : 1;
    setThumb({ x: x * scale, y: y * scale });
    onMove(joystickVector(x, y, radius));
  };

  const release = (e: PointerEvent<HTMLButtonElement>) => {
    if (pointer.current !== e.pointerId) return;
    pointer.current = null;
    setThumb({ x: 0, y: 0 });
    onMove({ x: 0, y: 0 });
  };

  return (
    <button
      type="button"
      className="olympus-joystick"
      aria-label="Movement joystick: drag to steer, release to stop"
      onPointerDown={(e) => {
        if (pointer.current !== null) return;
        e.preventDefault();
        pointer.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        move(e);
      }}
      onPointerMove={(e) => { if (pointer.current === e.pointerId) move(e); }}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span className="olympus-joystick-thumb" aria-hidden="true" style={{ transform: `translate(${thumb.x}px, ${thumb.y}px)` }} />
    </button>
  );
}

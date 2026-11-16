"use client";

import { useRef, useState } from "react";
import type { PointerEvent } from "react";
import { stickFromBox, type StickVector } from "./touch-controls";

export default function TouchJoystick({ onMove }: { onMove: (value: StickVector) => void }) {
  const pointer = useRef<number | null>(null);
  const [thumb, setThumb] = useState({ x: 0, y: 0 });

  const move = (e: PointerEvent<HTMLButtonElement>) => {
    const stick = stickFromBox(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect());
    setThumb(stick.thumb);
    onMove(stick.vector);
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
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // No live pointer (synthetic event): steering still works.
        }
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

"use client";

import { useEffect, useState } from "react";
import type { AnimationEvent } from "react";
import { site } from "@/config/site";
import { TASKBAR_HEIGHT } from "./Taskbar";

const COUNT_KEY = "isyraf98:stars";
const TIP_MS = 4500;

function loadCount(): number {
  try {
    return Number(localStorage.getItem(COUNT_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveCount(count: number) {
  try {
    localStorage.setItem(COUNT_KEY, String(count));
  } catch {
    // Storage blocked: the count just won't be remembered.
  }
}

function tipFor(count: number): string {
  const { milestones, other } = site.shootingStar;
  return (
    milestones.find((m) => m.count === count)?.text ??
    other.replace("{n}", String(count))
  );
}

/**
 * The shooting star that crosses the sky every ~11 seconds. It can be
 * caught: a pointer-only bonus, so it is not a Tab stop. Catching it shows
 * a tooltip above the clock and counts how many this visitor has caught.
 */
export default function ShootingStar() {
  // Caught on this pass: hidden until the animation loops round again.
  const [caught, setCaught] = useState(false);
  const [tip, setTip] = useState<string | null>(null);

  useEffect(() => {
    if (!tip) return;
    const timer = setTimeout(() => setTip(null), TIP_MS);
    return () => clearTimeout(timer);
  }, [tip]);

  // pointerdown, not click: the star moves too fast for a full click.
  const onCatch = () => {
    if (caught) return;
    const count = loadCount() + 1;
    saveCount(count);
    setCaught(true);
    setTip(tipFor(count));
  };

  const onIteration = (e: AnimationEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setCaught(false);
  };

  return (
    <>
      <div
        className={`shooting-star${caught ? " caught" : ""}`}
        aria-hidden="true"
        onPointerDown={onCatch}
        onAnimationIteration={onIteration}
      >
        <span className="shooting-star-trail" />
      </div>

      <div
        role="status"
        className="pointer-events-none fixed right-1 z-30"
        style={{ bottom: TASKBAR_HEIGHT + 4 }}
      >
        {tip && <div className="tray-tip">{tip}</div>}
      </div>
    </>
  );
}

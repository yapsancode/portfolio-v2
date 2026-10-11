"use client";

import { useEffect, useState } from "react";
import PixelIcon from "./PixelIcon";

/** A little longer than the CSS animation (1400ms wait + 250ms fade). */
const BOOT_MS = 1700;

/**
 * Short start-up screen shown on page load. The timing is pure CSS (see
 * `.boot-screen` in globals.css), so it shows from the first paint and
 * fades out by itself even if JavaScript never runs. This component only
 * adds "click or press a key to skip" and removes the node afterwards.
 * It is hidden entirely for visitors who prefer reduced motion.
 */
export default function BootScreen() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    const finish = () => setDone(true);
    const timer = setTimeout(finish, BOOT_MS);
    window.addEventListener("click", finish);
    window.addEventListener("keydown", finish);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", finish);
      window.removeEventListener("keydown", finish);
    };
  }, [done]);

  if (done) return null;

  return (
    <div className="boot-screen" aria-hidden="true">
      <div className="flex flex-col items-center">
        <PixelIcon name="logo" size={64} />
        <p className="boot-title">
          Isyraf <span className="boot-title-98">98</span>
        </p>
        <div className="boot-bar" />
        <p className="boot-caption">Starting up...</p>
      </div>
    </div>
  );
}

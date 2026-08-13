"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/**
 * Hand-drawn pixel icons on a 16x16 grid. shape-rendering: crispEdges
 * turns the diagonal fills into staircases, which is exactly the
 * pixel-art look we want — no image assets needed.
 */
const ICONS: Record<
  "person" | "briefcase" | "envelope" | "smiley" | "terminal",
  ReactNode
> = {
  person: (
    <>
      <rect x="5" y="1" width="6" height="2" fill="#5b3a1e" />
      <rect x="5" y="3" width="6" height="4" fill="#ffcf9e" />
      <rect x="6" y="4" width="1" height="1" fill="#000" />
      <rect x="9" y="4" width="1" height="1" fill="#000" />
      <rect x="7" y="7" width="2" height="1" fill="#ffcf9e" />
      <rect x="4" y="8" width="8" height="6" fill="#000080" />
      <rect x="7" y="8" width="2" height="1" fill="#fff" />
      <rect x="3" y="9" width="1" height="4" fill="#000080" />
      <rect x="12" y="9" width="1" height="4" fill="#000080" />
      <rect x="3" y="13" width="1" height="1" fill="#ffcf9e" />
      <rect x="12" y="13" width="1" height="1" fill="#ffcf9e" />
    </>
  ),
  briefcase: (
    <>
      <rect x="6" y="2" width="4" height="1" fill="#4a2f16" />
      <rect x="6" y="3" width="1" height="2" fill="#4a2f16" />
      <rect x="9" y="3" width="1" height="2" fill="#4a2f16" />
      <rect x="2" y="5" width="12" height="9" fill="#a0662c" />
      <rect x="2" y="5" width="12" height="1" fill="#c98d4b" />
      <rect x="2" y="13" width="12" height="1" fill="#4a2f16" />
      <rect x="2" y="5" width="1" height="9" fill="#4a2f16" />
      <rect x="13" y="5" width="1" height="9" fill="#4a2f16" />
      <rect x="2" y="9" width="12" height="1" fill="#4a2f16" />
      <rect x="7" y="8" width="2" height="2" fill="#ffd800" />
    </>
  ),
  envelope: (
    <>
      <rect x="2" y="4" width="12" height="9" fill="#fff" />
      <rect x="2" y="4" width="12" height="1" fill="#808080" />
      <rect x="2" y="12" width="12" height="1" fill="#808080" />
      <rect x="2" y="4" width="1" height="9" fill="#808080" />
      <rect x="13" y="4" width="1" height="9" fill="#808080" />
      <path d="M3 5 L8 9 L13 5 L13 6 L8 10 L3 6 Z" fill="#808080" />
      <rect x="11" y="5" width="2" height="2" fill="#e04040" />
    </>
  ),
  smiley: (
    <>
      <rect x="5" y="2" width="6" height="1" fill="#ffd800" />
      <rect x="4" y="3" width="8" height="1" fill="#ffd800" />
      <rect x="3" y="4" width="10" height="8" fill="#ffd800" />
      <rect x="4" y="12" width="8" height="1" fill="#ffd800" />
      <rect x="5" y="13" width="6" height="1" fill="#ffd800" />
      <rect x="5" y="6" width="2" height="2" fill="#000" />
      <rect x="9" y="6" width="2" height="2" fill="#000" />
      <rect x="4" y="10" width="1" height="1" fill="#000" />
      <rect x="11" y="10" width="1" height="1" fill="#000" />
      <rect x="5" y="11" width="6" height="1" fill="#000" />
    </>
  ),
  terminal: (
    <>
      <rect x="1" y="2" width="14" height="12" fill="#000" />
      <rect x="1" y="2" width="14" height="1" fill="#c0c0c0" />
      <rect x="1" y="2" width="1" height="12" fill="#c0c0c0" />
      <rect x="14" y="2" width="1" height="12" fill="#808080" />
      <rect x="1" y="13" width="14" height="1" fill="#808080" />
      <rect x="3" y="5" width="2" height="1" fill="#00ff00" />
      <rect x="6" y="5" width="6" height="1" fill="#00ff00" />
      <rect x="3" y="7" width="4" height="1" fill="#00ff00" />
      <rect x="8" y="7" width="4" height="1" fill="#00ff00" />
      <rect x="3" y="9" width="7" height="1" fill="#00ff00" />
      <rect x="11" y="9" width="1" height="1" fill="#00ff00" />
      <rect x="3" y="11" width="5" height="1" fill="#00ff00" />
    </>
  ),
};

export type DesktopIconProps = {
  label: string;
  icon: keyof typeof ICONS;
  /** Touch / small-screen fallback: a single tap opens instead of double-click. */
  isMobile: boolean;
  onOpen: () => void;
};

export default function DesktopIcon({
  label,
  icon,
  isMobile,
  onOpen,
}: DesktopIconProps) {
  const lastClick = useRef(0);
  const [selected, setSelected] = useState(false);

  // Deselect shortly after selecting, like letting go of an old desktop.
  useEffect(() => {
    if (!selected) return;
    const timer = setTimeout(() => setSelected(false), 1200);
    return () => clearTimeout(timer);
  }, [selected]);

  const handleClick = useCallback(() => {
    if (isMobile) {
      onOpen();
      return;
    }
    const now = Date.now();
    if (now - lastClick.current < 350) {
      lastClick.current = 0;
      setSelected(false);
      onOpen();
    } else {
      lastClick.current = now;
      setSelected(true);
    }
  }, [isMobile, onOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onOpen();
      }
    },
    [onOpen]
  );

  return (
    <button
      type="button"
      className={`desktop-icon${selected ? " selected" : ""}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <svg
        viewBox="0 0 16 16"
        className="icon-img"
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        {ICONS[icon]}
      </svg>
      <span className="icon-label">{label}</span>
    </button>
  );
}

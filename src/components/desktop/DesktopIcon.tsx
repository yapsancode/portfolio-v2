"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DesktopIconId } from "@/config/site";
import PixelIcon, { type PixelIconName } from "./PixelIcon";

export type DesktopIconProps = {
  id: DesktopIconId;
  label: string;
  icon: PixelIconName;
  /** Touch / small-screen fallback: a single tap opens instead of double-click. */
  isMobile: boolean;
  /** Shot down in Olympus: invisible (but keeps its place) until the game ends. */
  hidden?: boolean;
  onOpen: () => void;
};

export default function DesktopIcon({
  id,
  label,
  icon,
  isMobile,
  hidden = false,
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
      data-icon-id={id}
      style={hidden ? { visibility: "hidden" } : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <PixelIcon name={icon} className="icon-img" />
      <span className="icon-label">{label}</span>
    </button>
  );
}

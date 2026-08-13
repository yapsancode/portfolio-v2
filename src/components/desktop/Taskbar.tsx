"use client";

import { useEffect, useState } from "react";
import type { WindowId } from "@/config/site";
import { desktopIcons } from "@/config/site";
import SoundToggle from "./SoundToggle";

export const TASKBAR_HEIGHT = 36;

export type TaskbarWindow = {
  id: WindowId;
  title: string;
  minimized: boolean;
  active: boolean;
};

export type TaskbarProps = {
  windows: TaskbarWindow[];
  onTaskClick: (id: WindowId) => void;
  onOpenIcon: (id: WindowId) => void;
};

/** Little four-pane logo for the Start button, 12x12 pixel style. */
function StartGlyph() {
  return (
    <svg viewBox="0 0 12 12" width="14" height="14" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="1" y="2" width="4" height="4" fill="#e04040" />
      <rect x="6" y="1" width="4" height="4" fill="#40c040" />
      <rect x="1" y="7" width="4" height="4" fill="#4040e0" />
      <rect x="6" y="6" width="4" height="4" fill="#ffd800" />
    </svg>
  );
}

function Clock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })
      );
    tick();
    const interval = setInterval(tick, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bevel-well flex h-full items-center px-3 font-pixel text-base">
      {time}
    </div>
  );
}

export default function Taskbar({ windows, onTaskClick, onOpenIcon }: TaskbarProps) {
  const [startOpen, setStartOpen] = useState(false);

  return (
    <div
      className="taskbar fixed inset-x-0 bottom-0 z-30 flex items-stretch gap-1 p-1"
      style={{ height: TASKBAR_HEIGHT }}
    >
      {startOpen && (
        <>
          {/* click-away layer */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setStartOpen(false)}
            aria-hidden="true"
          />
          <div
            className="bevel-out absolute bottom-full left-1 z-50 mb-1 w-52 bg-win-face p-1"
            role="menu"
            aria-label="Start menu"
          >
            <div className="win-titlebar mb-1">
              <span className="title">Isyraf 98</span>
            </div>
            {desktopIcons.map((icon) => (
              <button
                key={icon.id}
                type="button"
                role="menuitem"
                className="flex w-full items-center px-2 py-1.5 text-left font-pixel text-base hover:bg-win-navy hover:text-white"
                onClick={() => {
                  setStartOpen(false);
                  onOpenIcon(icon.opens);
                }}
              >
                {icon.label}
              </button>
            ))}
          </div>
        </>
      )}

      <button
        type="button"
        className={`taskbar-btn font-bold${startOpen ? " active" : ""}`}
        aria-haspopup="menu"
        aria-expanded={startOpen}
        onClick={() => setStartOpen((open) => !open)}
      >
        <StartGlyph />
        Start
      </button>

      <div className="mx-1 w-px bg-win-shadow shadow-[1px_0_0_#fff]" aria-hidden="true" />

      {windows.map((win) => (
        <button
          key={win.id}
          type="button"
          className={`taskbar-btn min-w-0 flex-1 overflow-hidden${win.active && !win.minimized ? " active" : ""}`}
          style={{ maxWidth: 180 }}
          onClick={() => onTaskClick(win.id)}
        >
          <span className="truncate">{win.title}</span>
        </button>
      ))}

      <SoundToggle />
      <Clock />
    </div>
  );
}

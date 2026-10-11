"use client";

import { useEffect, useRef, useState } from "react";
import type { WindowId } from "@/config/site";
import MusicTray from "./MusicTray";
import PixelIcon, { type PixelIconName } from "./PixelIcon";
import StartMenu from "./StartMenu";

export const TASKBAR_HEIGHT = 36;

export type TaskbarWindow = {
  id: WindowId;
  title: string;
  icon: PixelIconName;
  minimized: boolean;
  active: boolean;
};

export type TaskbarProps = {
  windows: TaskbarWindow[];
  onTaskClick: (id: WindowId) => void;
  onOpenIcon: (id: WindowId) => void;
  onShutDown: () => void;
};

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

  return <span className="px-2 font-pixel text-base">{time}</span>;
}

export default function Taskbar({
  windows,
  onTaskClick,
  onOpenIcon,
  onShutDown,
}: TaskbarProps) {
  const [startOpen, setStartOpen] = useState(false);
  const startButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div
      className="taskbar fixed inset-x-0 bottom-0 z-30 flex items-stretch gap-1 p-1"
      style={{ height: TASKBAR_HEIGHT }}
    >
      {startOpen && (
        <StartMenu
          onClose={(restoreFocus) => {
            setStartOpen(false);
            if (restoreFocus) startButtonRef.current?.focus();
          }}
          onOpenWindow={onOpenIcon}
          onShutDown={onShutDown}
        />
      )}

      <button
        ref={startButtonRef}
        type="button"
        className={`taskbar-btn font-bold${startOpen ? " active" : ""}`}
        aria-haspopup="menu"
        aria-expanded={startOpen}
        onClick={() => setStartOpen((open) => !open)}
      >
        <PixelIcon name="logo" />
        Start
      </button>

      <div className="mx-1 w-px bg-win-shadow shadow-[1px_0_0_#fff]" aria-hidden="true" />

      {windows.map((win) => (
        <button
          key={win.id}
          type="button"
          className={`taskbar-btn min-w-0 flex-1 overflow-hidden${win.active && !win.minimized ? " active" : ""}`}
          style={{ maxWidth: 180 }}
          title={win.title}
          onClick={() => onTaskClick(win.id)}
        >
          <PixelIcon name={win.icon} className="shrink-0" />
          <span className="truncate">{win.title}</span>
        </button>
      ))}

      {/* Tray: music + clock */}
      <div className="bevel-well ml-auto flex h-full shrink-0 items-center">
        <MusicTray onOpen={() => onOpenIcon("music")} />
        <Clock />
      </div>
    </div>
  );
}

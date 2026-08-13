"use client";

import { useEffect, useReducer, useSyncExternalStore } from "react";
import Image from "next/image";
import { site, desktopIcons, windowDefaults } from "@/config/site";
import type { WindowId } from "@/config/site";
import Window from "@/components/window/Window";
import { windowRegistry } from "@/components/window/windowRegistry";
import DesktopIcon from "./DesktopIcon";
import Taskbar, { TASKBAR_HEIGHT } from "./Taskbar";

/* ------------------------------------------------------------------ */
/* Window state (single source of truth — see CLAUDE.md)               */
/* ------------------------------------------------------------------ */

type Rect = { x: number; y: number; width: number; height: number };

type WindowState = {
  id: WindowId;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  minimized: boolean;
  maximized: boolean;
  /** Bounds to restore after un-maximizing. */
  restore: Rect | null;
};

type State = {
  windows: WindowState[];
  nextZ: number;
  activeId: WindowId | null;
};

type Action =
  | { type: "OPEN"; id: WindowId; rect: Rect }
  | { type: "CLOSE"; id: WindowId }
  | { type: "CLOSE_ALL" }
  | { type: "FOCUS"; id: WindowId }
  | { type: "MINIMIZE"; id: WindowId }
  | { type: "TASK_CLICK"; id: WindowId }
  | { type: "TOGGLE_MAXIMIZE"; id: WindowId }
  | { type: "MOVE"; id: WindowId; x: number; y: number }
  | { type: "RESIZE"; id: WindowId } & Rect;

const initialState: State = { windows: [], nextZ: 10, activeId: null };

function topMost(windows: WindowState[]): WindowState | undefined {
  return windows.reduce<WindowState | undefined>(
    (top, w) => (!w.minimized && (!top || w.zIndex > top.zIndex) ? w : top),
    undefined
  );
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "OPEN": {
      const existing = state.windows.find((w) => w.id === action.id);
      if (existing) {
        // Already open: unminimize + bring to front, never duplicate.
        return {
          ...state,
          nextZ: state.nextZ + 1,
          activeId: action.id,
          windows: state.windows.map((w) =>
            w.id === action.id
              ? { ...w, minimized: false, zIndex: state.nextZ }
              : w
          ),
        };
      }
      const win: WindowState = {
        id: action.id,
        title: windowDefaults[action.id].title,
        ...action.rect,
        zIndex: state.nextZ,
        minimized: false,
        maximized: false,
        restore: null,
      };
      return {
        windows: [...state.windows, win],
        nextZ: state.nextZ + 1,
        activeId: action.id,
      };
    }

    case "CLOSE": {
      const windows = state.windows.filter((w) => w.id !== action.id);
      return {
        ...state,
        windows,
        activeId:
          state.activeId === action.id
            ? (topMost(windows)?.id ?? null)
            : state.activeId,
      };
    }

    case "CLOSE_ALL":
      return { ...state, windows: [], activeId: null };

    case "FOCUS": {
      return {
        ...state,
        nextZ: state.nextZ + 1,
        activeId: action.id,
        windows: state.windows.map((w) =>
          w.id === action.id
            ? { ...w, minimized: false, zIndex: state.nextZ }
            : w
        ),
      };
    }

    case "MINIMIZE": {
      const windows = state.windows.map((w) =>
        w.id === action.id ? { ...w, minimized: true } : w
      );
      return {
        ...state,
        windows,
        activeId:
          state.activeId === action.id
            ? (topMost(windows)?.id ?? null)
            : state.activeId,
      };
    }

    case "TASK_CLICK": {
      const win = state.windows.find((w) => w.id === action.id);
      if (!win) return state;
      if (win.minimized) return reducer(state, { type: "FOCUS", id: action.id });
      if (state.activeId === action.id)
        return reducer(state, { type: "MINIMIZE", id: action.id });
      return reducer(state, { type: "FOCUS", id: action.id });
    }

    case "TOGGLE_MAXIMIZE": {
      return {
        ...state,
        nextZ: state.nextZ + 1,
        activeId: action.id,
        windows: state.windows.map((w) => {
          if (w.id !== action.id) return w;
          if (w.maximized && w.restore) {
            return { ...w, ...w.restore, maximized: false, restore: null, zIndex: state.nextZ };
          }
          return {
            ...w,
            restore: { x: w.x, y: w.y, width: w.width, height: w.height },
            maximized: true,
            zIndex: state.nextZ,
          };
        }),
      };
    }

    case "MOVE":
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, x: action.x, y: action.y } : w
        ),
      };

    case "RESIZE":
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id
            ? { ...w, x: action.x, y: action.y, width: action.width, height: action.height }
            : w
        ),
      };

    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/* Mobile / touch detection                                            */
/* ------------------------------------------------------------------ */

function useIsMobile(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(max-width: 767px), (pointer: coarse)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () =>
      window.matchMedia("(max-width: 767px), (pointer: coarse)").matches,
    () => false
  );
}

/* ------------------------------------------------------------------ */
/* Desktop                                                             */
/* ------------------------------------------------------------------ */

export default function Desktop() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const isMobile = useIsMobile();

  const openWindow = (id: WindowId) => {
    if (isMobile) {
      // Touch fallback: one full-screen window at a time.
      dispatch({ type: "CLOSE_ALL" });
      const d = windowDefaults[id];
      dispatch({ type: "OPEN", id, rect: { x: 0, y: 0, width: d.width, height: d.height } });
      return;
    }
    const d = windowDefaults[id];
    const vw = window.innerWidth;
    const vh = window.innerHeight - TASKBAR_HEIGHT;
    const width = Math.min(d.width, vw - 16);
    const height = Math.min(d.height, vh - 16);
    const x = Math.max(8, Math.min(d.x, vw - width - 8));
    const y = Math.max(8, Math.min(d.y, vh - height - 8));
    dispatch({ type: "OPEN", id, rect: { x, y, width, height } });
  };

  // Escape closes the focused window.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && state.activeId !== null) {
        dispatch({ type: "CLOSE", id: state.activeId });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state.activeId]);

  const renderWindow = (win: WindowState) => {
    const Content = windowRegistry[win.id];
    return (
      <Window
        key={win.id}
        title={win.title}
        x={win.x}
        y={win.y}
        width={win.width}
        height={win.height}
        zIndex={win.zIndex}
        active={state.activeId === win.id}
        minimized={win.minimized}
        maximized={win.maximized}
        isMobile={isMobile}
        onFocus={() => dispatch({ type: "FOCUS", id: win.id })}
        onClose={() => dispatch({ type: "CLOSE", id: win.id })}
        onMinimize={() => dispatch({ type: "MINIMIZE", id: win.id })}
        onToggleMaximize={() => dispatch({ type: "TOGGLE_MAXIMIZE", id: win.id })}
        onMove={(x, y) => dispatch({ type: "MOVE", id: win.id, x, y })}
        onResize={(width, height, x, y) =>
          dispatch({ type: "RESIZE", id: win.id, x, y, width, height })
        }
      >
        <Content />
      </Window>
    );
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      <div className="nebula" aria-hidden="true" />
      <div className="stars" aria-hidden="true" />
      <div className="shooting-star" aria-hidden="true" />

      {/* Centered image (decorative, behind everything else) */}
      <div
        className="pointer-events-none absolute inset-0 z-0 grid place-items-center"
        aria-hidden="true"
      >
        <Image
          src={site.centerImage.src}
          alt={site.centerImage.alt}
          width={736}
          height={1472}
          priority
          className="max-h-[75vh] w-auto object-contain sm:max-h-[92vh]"
        />
      </div>

      {/* Icon column */}
      <nav
        aria-label="Desktop icons"
        className="absolute left-2 top-2 z-10 flex flex-col items-start gap-1"
      >
        {desktopIcons.map((icon) => (
          <DesktopIcon
            key={icon.id}
            label={icon.label}
            icon={icon.icon}
            onOpen={() => openWindow(icon.opens)}
          />
        ))}
      </nav>

      {/* Windows layer (drag bounds = desktop area above the taskbar) */}
      {isMobile ? (
        state.windows.map(renderWindow)
      ) : (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-20"
          style={{ bottom: TASKBAR_HEIGHT }}
        >
          {state.windows.map(renderWindow)}
        </div>
      )}

      <Taskbar
        windows={state.windows.map((w) => ({
          id: w.id,
          title: w.title,
          minimized: w.minimized,
          active: state.activeId === w.id,
        }))}
        onTaskClick={(id) => dispatch({ type: "TASK_CLICK", id })}
        onOpenIcon={openWindow}
      />
    </div>
  );
}

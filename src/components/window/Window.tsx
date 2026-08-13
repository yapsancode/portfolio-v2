"use client";

import type { ReactNode } from "react";
import { Rnd } from "react-rnd";

export type WindowProps = {
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  active: boolean;
  minimized: boolean;
  maximized: boolean;
  /** Touch/small-screen mode: fixed full-screen shell, no drag or resize. */
  isMobile: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (width: number, height: number, x: number, y: number) => void;
  children: ReactNode;
};

/* Pixel glyphs for the title-bar buttons (10x10, crisp edges). */
function MinimizeGlyph() {
  return (
    <svg viewBox="0 0 10 10" width="10" height="10" shapeRendering="crispEdges" aria-hidden="true">
      <path d="M1 7h8v2H1z" fill="#000" />
    </svg>
  );
}

function MaximizeGlyph() {
  return (
    <svg viewBox="0 0 10 10" width="10" height="10" shapeRendering="crispEdges" aria-hidden="true">
      <path fillRule="evenodd" d="M1 1h8v8H1V1zm1 2v5h6V3H2z" fill="#000" />
    </svg>
  );
}

function CloseGlyph() {
  return (
    <svg viewBox="0 0 10 10" width="10" height="10" shapeRendering="crispEdges" aria-hidden="true">
      <path
        d="M2 1l3 3 3-3 1 1-3 3 3 3-1 1-3-3-3 3-1-1 3-3-3-3z"
        fill="#000"
      />
    </svg>
  );
}

export default function Window({
  title,
  x,
  y,
  width,
  height,
  zIndex,
  active,
  minimized,
  maximized,
  isMobile,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  onMove,
  onResize,
  children,
}: WindowProps) {
  const titlebar = (
    <div className={`win-titlebar${active ? "" : " inactive"}`}>
      <span className="title">{title}</span>
      {!isMobile && (
        <>
          <button
            type="button"
            className="win-titlebtn"
            aria-label="Minimize"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
          >
            <MinimizeGlyph />
          </button>
          <button
            type="button"
            className="win-titlebtn"
            aria-label={maximized ? "Restore" : "Maximize"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleMaximize();
            }}
          >
            <MaximizeGlyph />
          </button>
        </>
      )}
      <button
        type="button"
        className="win-titlebtn"
        aria-label="Close"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <CloseGlyph />
      </button>
    </div>
  );

  const body = (
    <div className="win-content mt-[2px] min-h-0 flex-1">
      <div className="win-page bevel-in">{children}</div>
    </div>
  );

  // Mobile / touch fallback: one full-screen window, no chrome tricks.
  if (isMobile) {
    if (minimized) return null;
    return (
      <div
        className="win-window fixed inset-0 z-50 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {titlebar}
        {body}
      </div>
    );
  }

  return (
    <Rnd
      bounds="parent"
      position={maximized ? { x: 0, y: 0 } : { x, y }}
      size={maximized ? { width: "100%", height: "100%" } : { width, height }}
      minWidth={320}
      minHeight={220}
      dragHandleClassName="win-titlebar"
      cancel=".win-titlebtn"
      disableDragging={maximized}
      enableResizing={!maximized}
      onDragStop={(_e, d) => onMove(d.x, d.y)}
      onResizeStop={(_e, _dir, ref, _delta, pos) =>
        onResize(ref.offsetWidth, ref.offsetHeight, pos.x, pos.y)
      }
      style={{
        zIndex,
        display: minimized ? "none" : undefined,
        pointerEvents: "auto",
      }}
    >
      <section
        aria-label={title}
        className={`win-window bevel-out window-pop flex h-full w-full flex-col${active ? "" : " brightness-[0.98]"}`}
        onMouseDown={onFocus}
      >
        {titlebar}
        {body}
      </section>
    </Rnd>
  );
}

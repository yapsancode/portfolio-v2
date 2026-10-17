"use client";

import { useState } from "react";
import type { MouseEvent } from "react";
import { site } from "@/config/site";
import { loadBest, useGame } from "@/components/game/GameContext";

const copy = site.olympus;

const CONTROLS = [
  ["← →  or  A D", "Turn"],
  ["↑  or  W", "Thrust"],
  ["Space", "Fire"],
  ["P", "Pause"],
  ["Esc", "Quit and fix the desktop"],
] as const;

/** Win98 warning triangle. */
function WarningGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="32" height="32" shapeRendering="crispEdges" aria-hidden="true">
      <path d="M7 1h2v2h1v3h1v3h1v3h1v2h1v1H1v-1h1v-2h1V9h1V6h1V3h1V1z" fill="#000" />
      <path d="M7 2h2v2h1v3h1v3h1v3h1v1H2v-1h1v-3h1V7h1V4h1V2z" fill="#ffd800" />
      <rect x="7" y="5" width="2" height="5" fill="#000" />
      <rect x="7" y="11" width="2" height="2" fill="#000" />
    </svg>
  );
}

const button =
  "bevel-out min-w-20 bg-win-face px-4 py-1 font-pixel text-base leading-none focus-visible:outline-1 focus-visible:-outline-offset-4 focus-visible:outline-dotted focus-visible:outline-black active:translate-x-px active:translate-y-px";

export default function OlympusWindow() {
  const { start, cancel } = useGame();
  const [best] = useState(loadBest);

  // A mouse click spawns the ship where the pointer is; Enter starts it in the middle.
  const onStart = (e: MouseEvent<HTMLButtonElement>) =>
    start(e.detail === 0 ? null : { x: e.clientX, y: e.clientY });

  return (
    <div className="flex h-full min-h-0 flex-col bg-win-face p-3">
      <h1 className="sr-only">Olympus</h1>

      <div className="flex shrink-0 gap-3">
        <WarningGlyph />
        <div className="text-sm leading-snug">
          <p className="font-bold">{copy.warning}</p>
          <p className="mt-1">{copy.warningMore}</p>
        </div>
      </div>

      <div className="bevel-in win-scroll mt-3 min-h-0 flex-1 overflow-auto bg-white p-2 text-xs">
        <table className="w-full">
          <caption className="sr-only">Controls</caption>
          <tbody>
            {CONTROLS.map(([keys, action]) => (
              <tr key={action}>
                <td className="w-1/2 py-0.5 pr-2 font-pixel text-base leading-none">{keys}</td>
                <td className="py-0.5">{action}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-1 text-neutral-600">On a phone, use the buttons at the bottom of the screen.</p>
      </div>

      <div className="mt-3 flex shrink-0 items-center gap-2">
        <span className="mr-auto font-pixel text-base leading-none">
          Best: {best.toLocaleString("en")}
        </span>
        <button type="button" className={button} onClick={onStart} autoFocus>
          Start
        </button>
        <button type="button" className={button} onClick={cancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

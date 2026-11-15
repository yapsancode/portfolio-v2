"use client";

import { useState } from "react";
import type { MouseEvent } from "react";
import { site } from "@/config/site";
import { BEST_RUN_KEY, loadBest, useGame } from "@/components/game/GameContext";

const copy = site.olympus.title;

/** One key (or on-screen button), drawn as a grey Windows 98 keycap. */
function Key({ children }: { children: string }) {
  return <kbd className="olympus-key bevel-out">{children}</kbd>;
}

/**
 * The title screen of olympus.exe: an old DOS game running in a window.
 * Enter (or a tap) starts the game; the window's close button leaves.
 */
export default function OlympusWindow() {
  const { start, close } = useGame();
  const [best] = useState(() => loadBest());
  const [bestRun] = useState(() => loadBest(BEST_RUN_KEY));
  // Same test the game uses to show its on-screen buttons.
  const [touch] = useState(
    () => navigator.maxTouchPoints > 0 || window.matchMedia("(any-pointer: coarse)").matches
  );

  // A mouse click spawns the ship where the pointer is; Enter starts it in the middle.
  const onStart = (e: MouseEvent<HTMLButtonElement>) =>
    start(e.detail === 0 ? null : { x: e.clientX, y: e.clientY });

  return (
    <div className="olympus-title">
      <p className="olympus-title-dim">{copy.presents}</p>
      <h1 className="olympus-logo">OLYMPUS</h1>
      <p>{copy.tagline}</p>

      <div className="olympus-actions">
        <button type="button" className="olympus-button olympus-button-primary" onClick={onStart} autoFocus>
          Play
        </button>
        <button type="button" className="olympus-button" onClick={close}>Back to desktop</button>
      </div>

      {touch ? (
        <p className="olympus-title-keys">
          <span>
            <Key>◄</Key> <Key>►</Key> turn
          </span>
          <span>
            <Key>▲</Key> thrust
          </span>
          <span>
            <Key>FIRE</Key> fire
          </span>
          <span>
            <Key>Ⅱ</Key> pause / exit
          </span>
        </p>
      ) : (
        <p className="olympus-title-keys">
          <span>
            <Key>←</Key> <Key>→</Key> turn
          </span>
          <span>
            <Key>↑</Key> thrust
          </span>
          <span>
            <Key>Space</Key> fire
          </span>
          <span>
            <Key>P</Key> pause
          </span>
          <span>
            <Key>Esc</Key> menu
          </span>
        </p>
      )}

      {best > 0 && (
        <p className="olympus-title-score">
          HI-SCORE {String(best).padStart(6, "0")}
          {bestRun > 0 && ` · RUN ${bestRun}`}
        </p>
      )}
      <p className="olympus-title-dim">{copy.warning}</p>
      {touch && <p className="olympus-title-dim">Play in landscape — turn your phone sideways.</p>}
      <a className="olympus-shortcut" href="/olympus">Direct game shortcut · /olympus</a>
    </div>
  );
}

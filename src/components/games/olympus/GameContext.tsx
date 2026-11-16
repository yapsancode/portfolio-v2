"use client";

import type { Progress } from "@/lib/games/olympus/levels";
import { createContext, useContext } from "react";

/**
 * Lets the olympus.exe title screen start the game, which runs at the
 * desktop level (over every window), not inside its own window.
 */
export type GameControls = {
  /** Opens olympus.exe (from the Games folder). */
  open: () => void;
  close: () => void;
  /** `spawnAt` is where the pointer was, so the ship appears there. */
  start: (spawnAt: { x: number; y: number } | null, progress: Progress) => void;
};

export const GameContext = createContext<GameControls | null>(null);

export function useGame(): GameControls {
  const game = useContext(GameContext);
  if (!game) throw new Error("useGame must be used inside the desktop");
  return game;
}

export const BEST_SCORE_KEY = "isyraf98:olympus-best";
/** Legacy consecutive-win record; not used to unlock campaign levels. */
export const BEST_RUN_KEY = "isyraf98:olympus-best-run";

export function loadBest(key = BEST_SCORE_KEY): number {
  try {
    return Number(localStorage.getItem(key)) || 0;
  } catch {
    return 0;
  }
}

export function saveBest(value: number, key = BEST_SCORE_KEY) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // Storage blocked: the best just won't be remembered.
  }
}

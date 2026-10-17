"use client";

import { createContext, useContext } from "react";

/**
 * Lets the olympus.exe warning dialog start the game, which runs at the
 * desktop level (over every window), not inside its own window.
 */
export type GameControls = {
  /** `spawnAt` is where the pointer was, so the ship appears there. */
  start: (spawnAt: { x: number; y: number } | null) => void;
  /** Close the warning dialog without playing. */
  cancel: () => void;
};

export const GameContext = createContext<GameControls | null>(null);

export function useGame(): GameControls {
  const game = useContext(GameContext);
  if (!game) throw new Error("useGame must be used inside the desktop");
  return game;
}

export const BEST_SCORE_KEY = "isyraf98:olympus-best";

export function loadBest(): number {
  try {
    return Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function saveBest(score: number) {
  try {
    localStorage.setItem(BEST_SCORE_KEY, String(score));
  } catch {
    // Storage blocked: the best score just won't be remembered.
  }
}

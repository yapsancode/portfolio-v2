"use client";
import { createContext, useContext } from "react";

export type GameControls = { start: () => void };
export const GameContext = createContext<GameControls | null>(null);
export function useGame(): GameControls {
  const game = useContext(GameContext);
  if (!game) throw new Error("useGame must be used inside the desktop");
  return game;
}


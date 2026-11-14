import type { CSSProperties } from "react";
import { WIDTH, HEIGHT } from "./boards";
import { slide, type Game, type Direction } from "./olympus";

export function cellPosition(cell: number): CSSProperties {
  return { left: (cell % WIDTH) / WIDTH * 100 + "%", top: Math.floor(cell / WIDTH) / HEIGHT * 100 + "%" };
}
export function landingDescription(game: Game, direction: Direction): string {
  const path = slide(game, direction), end = path.at(-1);
  if (end === undefined) return "Blocked by marble";
  const objects = path.filter(i => game.remaining.includes(i)).length;
  return `${objects} object${objects === 1 ? "" : "s"}; ${game.warning.includes(end) ? "dangerous" : "safe"} landing`;
}
export const coordinate = (cell: number) => String.fromCharCode(65 + cell % WIDTH) + (Math.floor(cell / WIDTH) + 1);


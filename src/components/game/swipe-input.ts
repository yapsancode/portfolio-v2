import type { Direction } from "./olympus";

/** Short thumb flicks count; ambiguous diagonals and taps do not. */
export function swipeDirection(dx: number, dy: number): Direction | null {
  const x = Math.abs(dx), y = Math.abs(dy);
  if (Math.max(x, y) < 18 || Math.max(x, y) < Math.min(x, y) * 1.25) return null;
  return x > y ? dx > 0 ? "right" : "left" : dy > 0 ? "down" : "up";
}
export const KEY_DIRECTIONS: Record<string, Direction> = {
  ArrowUp: "up", w: "up", ArrowRight: "right", d: "right",
  ArrowDown: "down", s: "down", ArrowLeft: "left", a: "left",
};


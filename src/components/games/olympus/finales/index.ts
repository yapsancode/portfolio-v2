import { fullPlate } from "./armour";
import { doubleVision } from "./gaze";
import { closingCrown } from "./halo";
import { skyFalls } from "./rain";
import { marbleFist } from "./swarm";
import type { Finale } from "./types";

/** The Last Stand of a level's power, or null when it has none yet. Level 1 keeps its laser eye. */
export function finaleFor(level: number): Finale<unknown> | null {
  return [null, null, marbleFist, closingCrown, skyFalls, fullPlate, doubleVision][level] ?? null;
}

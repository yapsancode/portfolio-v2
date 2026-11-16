/**
 * The Last Stand contract. One finale per power, one file per finale.
 * Finale files import only types from the engine (never values), so there is no import loop.
 */
import type { GameEvent, Rock, World } from "../olympus";

/** Shared numbers: start at this share of health, reveal and stun in seconds. */
export const FINALE = { at: 0.35, reveal: 1.2, stun: 2 };

/** reveal (shots swallowed, nothing hurts) → warn → active → rest → warn …; beating the move → stun → warn. */
export type FinaleRun = { state: "reveal" | "rest" | "warn" | "active" | "stun"; t: number; data: unknown };

/** The engine helpers a finale may use. */
export type FinaleKit = {
  /** A pale, shootable marble piece, standing still. Push it to world.rocks yourself; set `hp` for more than one hit. */
  rock(world: World, size: 0 | 1 | 2, x: number, y: number): Rock;
  /** Move a rock along its heading until it is 60px from the ship. Call it on anything you launch. */
  keepOut(world: World, rock: Rock): Rock;
  /** Marble dust. */
  burst(world: World, x: number, y: number, count: number, speed: number): void;
  eye(world: World): { x: number; y: number };
  shoulder(world: World, side: -1 | 1): { x: number; y: number };
  /** The ship's collision radius on this device. */
  shipRadius(world: World): number;
  /** For hazards that are not rocks (beams): take a life. Check `world.ship.safe <= 0` first. */
  loseShip(world: World, events: GameEvent[]): void;
};

export type Finale<S> = {
  name: string;
  /** One short sentence: what the player should do. */
  hint: string;
  /** Fresh state. Runs when the reveal starts and again after a lost ship (the rocks are gone by then). */
  start(world: World, kit: FinaleKit): S;
  /** Lock and show the next attack. Nothing may hurt yet. */
  warn(world: World, s: S, kit: FinaleKit): void;
  /** The warning is over: release the attack. */
  launch(world: World, s: S, kit: FinaleKit): void;
  /** Every tick while active. "done" ends the cycle; "beaten" means the player beat the move and stuns the statue. */
  step(world: World, s: S, dt: number, events: GameEvent[], kit: FinaleKit): "active" | "done" | "beaten";
  /** Warnings and effects. Rocks are drawn by the engine. Must work with sound muted. */
  draw(ctx: CanvasRenderingContext2D, world: World, s: S, run: FinaleRun): void;
};

/** The engine stores the state as unknown; each finale keeps its own type inside its file. */
export function defineFinale<S>(finale: Finale<S>): Finale<unknown> {
  return finale as unknown as Finale<unknown>;
}

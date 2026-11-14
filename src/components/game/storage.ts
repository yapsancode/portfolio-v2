import { BOARD_COUNT, getBoard, WIDTH, HEIGHT } from "./boards";
import type { Game } from "./olympus";

export const SAVE_KEY = "isyraf98:olympus-swipe-v1";
export const SKINS = [
  { name: "Classic", colour: "#ffffff", clears: 0 },
  { name: "Amber", colour: "#ffd877", clears: 1 },
  { name: "Mint", colour: "#9ef2c5", clears: 3 },
  { name: "Lilac", colour: "#c8b5ff", clears: 6 },
] as const;
export type Profile = { best: number; completed: string[]; skin: number; muted: boolean };
export type Session = { version: 1; game: Game | null; profile: Profile };
export const emptySession = (): Session => ({ version: 1, game: null, profile: { best: 0, completed: [], skin: 0, muted: false } });
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const int = (v: unknown, min: number, max: number): v is number => typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;
const ids = (v: unknown): v is number[] => Array.isArray(v) && v.every(i => int(i, 0, WIDTH * HEIGHT - 1)) && new Set(v).size === v.length;
const runId = (v: unknown): v is string => typeof v === "string" && v.length > 0 && v.length <= 100;

export function validGame(v: unknown): v is Game {
  if (!object(v) || v.version !== 1 || !runId(v.id) || !int(v.board, 0, BOARD_COUNT - 1) ||
    !int(v.variant, 0, 3) || !int(v.seed, 1, 0xffffffff) || !int(v.random, 1, 0xffffffff) ||
    !int(v.position, 0, 29) || !ids(v.remaining) || !ids(v.warning) || !int(v.hearts, 0, 3) ||
    !int(v.score, 0, 1e9) || !int(v.moves, 0, 1e6) || !int(v.chain, 0, 6) ||
    !["playing", "won", "lost"].includes(String(v.phase))) return false;
  const board = getBoard(v.board, v.variant);
  return !board.walls.includes(v.position) && !v.remaining.includes(v.position) &&
    v.remaining.every(i => board.objects.includes(i)) &&
    (v.phase === "won" ? v.remaining.length === 0 && v.hearts > 0 :
      v.phase === "lost" ? v.hearts === 0 && v.remaining.length > 0 : v.hearts > 0 && v.remaining.length > 0) &&
    (v.phase === "playing" || v.warning.length === 0);
}

export function parseSession(raw: string | null): Session {
  const fallback = emptySession();
  if (!raw || raw.length > 2_000_000) return fallback;
  try {
    const value: unknown = JSON.parse(raw);
    if (!object(value) || value.version !== 1) return fallback;
    const p = value.profile;
    // Keep a valid profile even if an interrupted/old game snapshot is invalid.
    if (object(p) && int(p.best, 0, 1e9) && Array.isArray(p.completed) && p.completed.every(runId) &&
      new Set(p.completed).size === p.completed.length && int(p.skin, 0, SKINS.length - 1) &&
      typeof p.muted === "boolean") {
      fallback.profile = { best: p.best, completed: p.completed,
        skin: p.completed.length >= SKINS[p.skin].clears ? p.skin : 0, muted: p.muted };
    }
    if (validGame(value.game)) fallback.game = value.game;
    return fallback;
  } catch { return fallback; }
}

export function loadSession(): Session {
  try { return parseSession(localStorage.getItem(SAVE_KEY)); } catch { return emptySession(); }
}

/** One atomic record keeps the result and its completion credit together. */
export function credit(session: Session): Session {
  const { game, profile } = session;
  if (!game) return session;
  return { ...session, profile: { ...profile, best: Math.max(profile.best, game.score),
    completed: game.phase === "won" && !profile.completed.includes(game.id) ?
      [...profile.completed, game.id] : profile.completed } };
}
export function saveSession(session: Session): boolean {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(session)); return true; } catch { return false; }
}


/** Bump when scoring or difficulty changes; old results stay in the database. */
export const GAME_VERSION = "olympus-5";
export const SESSION_SECONDS = 60 * 60;

import type { Upgrades } from "./resources";

export type LevelTicket = { token: string; level: number; upgrades: Upgrades };
export type LevelResult = { score: number; durationMs: number; outcome: "won" | "lost" };
export type ScoreEntry = {
  id: string;
  name: string;
  score: number;
  level: number;
  outcome: "won" | "lost";
  createdAt: string;
  isYou: boolean;
};

export class LeaderboardError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export function parseName(value: unknown): string {
  if (typeof value !== "string" || !/^[A-Za-z0-9][A-Za-z0-9_]{2,15}$/.test(value.trim())) {
    throw new LeaderboardError("Use 3–16 letters, numbers or underscores. Start with a letter or number.");
  }
  return value.trim();
}

export function parseToken(value: unknown): string {
  if (typeof value !== "string" || !/^[a-f0-9]{64}$/.test(value)) {
    throw new LeaderboardError("This game session is invalid. Start a new game.");
  }
  return value;
}

export function parseResult(value: Record<string, unknown>): LevelResult {
  const { score, durationMs, outcome } = value;
  if (
    !Number.isSafeInteger(score) || typeof score !== "number" || score <= 0 || score > 100_000 || score % 10 !== 0 ||
    !Number.isSafeInteger(durationMs) || typeof durationMs !== "number" || durationMs < 1_000 || durationMs > SESSION_SECONDS * 1_000 ||
    (outcome !== "won" && outcome !== "lost")
  ) {
    throw new LeaderboardError("This marble haul could not be accepted.");
  }
  return { score, durationMs, outcome };
}

/**
 * Scoring limits of the real game, mirrored from TUNING in src/components/game/olympus.ts
 * (server code must not import the browser engine). scripts/olympus-resources.test.mjs checks they match.
 */
export const HAUL = {
  guardianHp: 38, powersHp: 48, hitScore: 100, crumbleScore: 5_000,
  windows: 8, windowHp: 14, windowHitScore: 50, windowCrashScore: 500, icons: 7, iconScore: 150,
  /** The most one repeatable shot earns (the smallest rock). */
  shotScore: 100,
  /** Fire interval with a fully upgraded blaster. */
  fastestShotMs: 120, bulletLifeMs: 800, awakenMs: 3_000, crumbleMs: 2_200,
};
const statueHp = (level: number) => level === 1 ? HAUL.guardianHp : HAUL.powersHp;

/** Every statue hit, the crumble, every window and icon once, and the best shot at the top fire rate. */
export function maxHaul(level: number, durationMs: number) {
  const desktop = HAUL.windows * ((HAUL.windowHp - 1) * HAUL.windowHitScore + HAUL.windowCrashScore) + HAUL.icons * HAUL.iconScore;
  const shots = Math.ceil(durationMs / HAUL.fastestShotMs) + 1;
  return Math.min(100_000, statueHp(level) * HAUL.hitScore + HAUL.crumbleScore + desktop + shots * HAUL.shotScore);
}

/** Wake-up, every hit at the top fire rate (shots may already be in flight), then the crumble. */
export function minWinMs(level: number) {
  return HAUL.awakenMs + (statueHp(level) - 1) * HAUL.fastestShotMs - HAUL.bulletLifeMs + HAUL.crumbleMs;
}

// Generous bounds that block obvious forgeries, not a claim that client gameplay is verified.
export function checkHaul(result: LevelResult, level: number) {
  const { score, durationMs, outcome } = result;
  if (score > maxHaul(level, durationMs) || (outcome === "won" &&
      (score < statueHp(level) * HAUL.hitScore + HAUL.crumbleScore || durationMs < minWinMs(level)))) {
    throw new LeaderboardError("This marble haul does not match the game.");
  }
}

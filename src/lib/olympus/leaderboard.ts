/** Bump when scoring or difficulty changes; old results stay in the database. */
export const GAME_VERSION = "olympus-4";
export const SESSION_SECONDS = 60 * 60;

export type LevelTicket = { token: string; level: number };
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
    throw new LeaderboardError("This score could not be accepted.");
  }
  // Deliberately generous bounds, not a claim that client gameplay is verified.
  // A bullet can earn up to 550 points (window crash), at roughly 5 shots/sec.
  const maxScore = 6_000 + Math.ceil(durationMs / 1_000) * 3_000;
  if (score > maxScore || (outcome === "won" && (score < 8_800 || durationMs < 8_000))) {
    throw new LeaderboardError("This score does not match the game duration.");
  }
  return { score, durationMs, outcome };
}

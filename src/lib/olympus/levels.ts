/** Level numbers choose powers, never difficulty multipliers. */
export const LEVELS = [
  { id: 1, name: "Marble Guardian", hint: "Dodge hot marble. Move when the eye beam locks." },
  { id: 2, name: "Marble Swarm", hint: "Three shoulder volleys. Watch each warning, move, and shoot an opening." },
  { id: 3, name: "Shattered Halo", hint: "Two expanding rings with shifting gaps. Follow the green openings." },
  { id: 4, name: "Meteor Rain", hint: "The storm targets your lane. Move before each warned wave falls." },
  { id: 5, name: "Orbiting Armour", hint: "Break shields to expose the statue. Dodge their warned launch." },
  { id: 6, name: "Sweeping Gaze", hint: "Watch the sweep direction and its warned return. Get outside the gold arc." },
] as const;

export const LAST_LEVEL = LEVELS.length;
export function validLevel(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= LAST_LEVEL;
}
export function levelInfo(level: number) { return LEVELS[validLevel(level) ? level - 1 : 0]; }

export type Progress = {
  version: 1;
  highestCompletedLevel: number;
  resumeLevel: number;
  completed: boolean;
  /** Server campaign generation. Reset invalidates all older attempts. Null is a guest save. */
  epoch: string | null;
};

export function progressAt(highestCompletedLevel = 0, epoch: string | null = null): Progress {
  return { version: 1, highestCompletedLevel, resumeLevel: Math.min(highestCompletedLevel + 1, LAST_LEVEL),
    completed: highestCompletedLevel >= LAST_LEVEL, epoch };
}

export function parseProgress(value: unknown): Progress {
  if (!value || typeof value !== "object") throw new Error("Saved level could not be read.");
  const p = value as Progress;
  if (p.version !== 1 || !Number.isInteger(p.highestCompletedLevel) || p.highestCompletedLevel < 0 ||
    p.highestCompletedLevel > LAST_LEVEL || !validLevel(p.resumeLevel) || typeof p.completed !== "boolean" ||
    (p.epoch !== null && (typeof p.epoch !== "string" || !/^[0-9a-f-]{36}$/.test(p.epoch)))) {
    throw new Error("Saved level is not supported by this version of Olympus.");
  }
  // An older completed catalogue can resume at its first newly shipped level.
  const expected = progressAt(p.highestCompletedLevel, p.epoch);
  if (p.completed ? p.resumeLevel !== p.highestCompletedLevel : (p.resumeLevel !== expected.resumeLevel || expected.completed)) {
    throw new Error("Saved level is inconsistent.");
  }
  return expected;
}

"use client";

import type { LevelResult, LevelTicket } from "./leaderboard";

import { parseProgress, progressAt, type Progress } from "./levels";
import type { SharedScore } from "./sharing";
import { collectMarble, purchaseRefit, upgradeCount, type Upgrade } from "./resources";

export type RankedAttempt = { ticket: LevelTicket | null; error: string | null };
export type ScoreSubmission = { record: () => Promise<Progress>; share: () => Promise<SharedScore> };

export async function leaderboardRequest<T>(path: string, method = "GET", data?: unknown): Promise<T> {
  try {
    const response = await fetch(`/api/olympus/${path}`, {
      method, keepalive: method === "PATCH", credentials: "same-origin", cache: "no-store", signal: AbortSignal.timeout(15_000),
      ...(data === undefined ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Olympus saves are temporarily offline.");
    return result as T;
  } catch (error) {
    if (error instanceof Error && error.name === "Error") throw error;
    throw new Error("Could not reach Olympus saves. Check your connection and try again.");
  }
}

export async function beginRankedAttempt(level: number, epoch: string | null): Promise<RankedAttempt> {
  try {
    if (!epoch) throw new Error("Guest play: marble and levels stay in this browser.");
    const ticket = await leaderboardRequest<LevelTicket>("session", "POST", { level, epoch });
    if (ticket.level !== level) throw new Error("Your saved level changed. Exit and reload the game.");
    return { ticket, error: null };
  } catch (error) {
    return { ticket: null, error: error instanceof Error ? error.message : "Saving is offline." };
  }
}

export function finishRankedAttempt(session: Promise<RankedAttempt>, result: LevelResult): ScoreSubmission {
  let pending: Promise<Progress> | null = null;
  const record = (): Promise<Progress> => {
    if (!pending) {
      pending = session.then(async ({ ticket, error }) => {
        if (!ticket) throw new Error(error ?? "This attempt could not connect to your save.");
        const data = await leaderboardRequest<{ progress: Progress }>("session", "PATCH", { token: ticket.token, ...result });
        return parseProgress(data.progress);
      }).catch((error) => {
        pending = null;
        throw error;
      });
    }
    return pending;
  };
  // Start saving at victory, even if the player immediately exits the screen.
  void record().catch(() => {});
  return { record, share: async () => {
    await record();
    const { ticket } = await session;
    if (!ticket) throw new Error("Save your haul before sharing it.");
    const data = await leaderboardRequest<{ share: SharedScore }>("share", "POST", { token: ticket.token });
    return data.share;
  } };
}

const GUEST_KEY = "isyraf98:olympus-progress:v1";
export function guestProgress(): { progress: Progress; notice: string } {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    const progress = raw ? parseProgress(JSON.parse(raw)) : progressAt();
    if (progress.epoch !== null) throw new Error();
    return { progress, notice: "Guest progress stays in this browser. It is separate from a named player’s save." };
  } catch {
    return { progress: progressAt(), notice: "Guest save could not be read. Starting at level 1; progress may not survive closing the game." };
  }
}
export function saveGuest(progress: Progress): string {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(progress));
    return "Guest level and marble saved in this browser.";
  } catch { return "Progress is only kept while this game is open. Browser storage is unavailable."; }
}

export async function startOver(progress: Progress): Promise<Progress> {
  if (progress.epoch === null) {
    const reset = progressAt(0, null, progress.resources);
    try { localStorage.setItem(GUEST_KEY, JSON.stringify(reset)); }
    catch { throw new Error("Could not reset your guest save because browser storage is unavailable. Your saved level was not changed."); }
    return reset;
  }
  const data = await leaderboardRequest<{ progress: Progress }>("player", "PATCH", { action: "reset", epoch: progress.epoch });
  return parseProgress(data.progress);
}

export function finishGuestAttempt(progress: Progress, result: LevelResult): Progress {
  const cleared = result.outcome === "won" ? progress.resumeLevel : 0;
  return progressAt(Math.max(progress.highestCompletedLevel, cleared), null, collectMarble(progress.resources, result.score, cleared));
}

export async function refitShip(progress: Progress, upgrade: Upgrade): Promise<Progress> {
  if (progress.epoch === null) {
    const latest = guestProgress().progress;
    if (JSON.stringify(latest) !== JSON.stringify(progress)) throw new Error("Your guest save changed. Go back and reload it before refitting.");
    const next = { ...progress, resources: purchaseRefit(progress.resources, upgrade) };
    // Do not report a purchase unless it was persisted successfully.
    localStorage.setItem(GUEST_KEY, JSON.stringify(next));
    return next;
  }
  const data = await leaderboardRequest<{ progress: Progress }>("upgrade", "POST", {
    epoch: progress.epoch, upgrade, expectedPurchases: upgradeCount(progress.resources),
  });
  return parseProgress(data.progress);
}

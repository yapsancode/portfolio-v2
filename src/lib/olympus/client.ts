"use client";

import type { RunResult, RunTicket } from "./leaderboard";

export type RankedRun = { ticket: RunTicket | null; error: string | null };
export type ScoreSubmission = { record: () => Promise<RunTicket> };

let continuation: Promise<RunTicket | null> | null = null;

export async function leaderboardRequest<T>(path: string, method = "GET", data?: unknown): Promise<T> {
  try {
    const response = await fetch(`/api/olympus/${path}`, {
      method, credentials: "same-origin", cache: "no-store", signal: AbortSignal.timeout(15_000),
      ...(data === undefined ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "High scores are temporarily offline.");
    return result as T;
  } catch (error) {
    if (error instanceof Error && error.name === "Error") throw error;
    throw new Error("Could not reach high scores. Check your connection and try again.");
  }
}

export async function beginRankedRun(level: number): Promise<RankedRun> {
  try {
    const previous = level > 1 ? await continuation : null;
    if (level > 1 && !previous) throw new Error("This streak could not connect. Start a fresh game to post scores.");
    if (level === 1) continuation = null;
    const ticket = await leaderboardRequest<RunTicket>("session", "POST", { previous: previous?.token ?? null });
    if (ticket.run !== level) throw new Error("This streak could not be recorded. Start a fresh game to post scores.");
    return { ticket, error: null };
  } catch (error) {
    return { ticket: null, error: error instanceof Error ? error.message : "High scores are offline." };
  }
}

export function finishRankedRun(session: Promise<RankedRun>, result: RunResult): ScoreSubmission {
  let pending: Promise<RunTicket> | null = null;
  const record = (): Promise<RunTicket> => {
    if (!pending) {
      pending = session.then(async ({ ticket, error }) => {
        if (!ticket) throw new Error(error ?? "This game could not connect to high scores.");
        await leaderboardRequest("session", "PATCH", { token: ticket.token, ...result });
        return ticket;
      }).catch((error) => {
        pending = null; // A failed network request can be retried with the same result.
        throw error;
      });
    }
    return pending;
  };
  // Replay can start while the result is still saving; wait for the recorded win.
  continuation = record().then((ticket) => result.outcome === "won" ? ticket : null).catch(() => null);
  return { record };
}

import type { NextRequest } from "next/server";
import { parseName, LeaderboardError } from "@/lib/olympus/leaderboard";
import { body, failure, limit, player, playerName, randomUUID, reserveName, progress, resetProgress, response, setPlayer } from "@/lib/olympus/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const id = player(request);
    const name = await playerName(id);
    const result = response({ name, progress: name && id ? await progress(id) : null });
    if (name && id) setPlayer(result, id);
    return result;
  } catch (error) { return failure(error); }
}

export async function POST(request: NextRequest) {
  try {
    const data = await body(request);
    const name = parseName(data.name);
    const id = player(request) ?? randomUUID();
    await limit(request, "name", id, 30);
    const reserved = await reserveName(id, name);
    const result = response({ name: reserved, progress: await progress(id) });
    setPlayer(result, id);
    return result;
  } catch (error) { return failure(error); }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = await body(request);
    const id = player(request);
    if (!id) throw new LeaderboardError("Your player session is missing. Reload the game.", 401);
    if (data.action !== "reset" || typeof data.epoch !== "string" || !/^[0-9a-f-]{36}$/.test(data.epoch)) throw new LeaderboardError("Invalid reset request.");
    await limit(request, "reset", id, 30);
    return response({ progress: await resetProgress(id, data.epoch) });
  } catch (error) { return failure(error); }
}

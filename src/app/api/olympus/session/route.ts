import type { NextRequest } from "next/server";
import { LeaderboardError, parseResult, parseToken } from "@/lib/olympus/leaderboard";
import { body, database, failure, finishSession, limit, player, response, setPlayer, startSession } from "@/lib/olympus/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const data = await body(request);
    database();
    const previous = data.previous == null ? null : parseToken(data.previous);
    const id = player(request);
    if (!id) throw new LeaderboardError("Choose your player name before starting a game.", 401);
    await limit(request, "start", id, 120);
    const ticket = await startSession(id, previous);
    const result = response(ticket, 201);
    setPlayer(result, id);
    return result;
  } catch (error) { return failure(error); }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = await body(request);
    const token = parseToken(data.token);
    const result = parseResult(data);
    const id = player(request);
    if (!id) throw new LeaderboardError("Your game session is missing. Allow cookies and start a new game.", 401);
    await limit(request, "finish", id, 240);
    await finishSession(id, token, result);
    return response({ recorded: true });
  } catch (error) { return failure(error); }
}

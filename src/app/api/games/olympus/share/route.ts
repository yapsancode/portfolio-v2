import type { NextRequest } from "next/server";
import { LeaderboardError, parseToken } from "@/lib/games/olympus/leaderboard";
import { body, createShare, failure, limit, player, response } from "@/lib/games/olympus/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const data = await body(request);
    const token = parseToken(data.token);
    const id = player(request);
    if (!id) throw new LeaderboardError("Return to the browser where you saved this score to share it.", 401);
    await limit(request, "share", id, 60);
    return response({ share: await createShare(id, token) });
  } catch (error) { return failure(error); }
}

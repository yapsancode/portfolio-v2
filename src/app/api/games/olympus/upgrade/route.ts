import type { NextRequest } from "next/server";
import { body, buyUpgrade, failure, limit, player, response } from "@/lib/games/olympus/server";
import { LeaderboardError } from "@/lib/games/olympus/leaderboard";
import { isUpgrade } from "@/lib/games/olympus/resources";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const data = await body(request);
    const id = player(request);
    if (!id) throw new LeaderboardError("Your player session is missing. Reload the game.", 401);
    if (!isUpgrade(data.upgrade) || typeof data.epoch !== "string" || !/^[0-9a-f-]{36}$/.test(data.epoch) ||
        typeof data.expectedPurchases !== "number") throw new LeaderboardError("Invalid refit request.");
    await limit(request, "refit", id, 60);
    return response({ progress: await buyUpgrade(id, data.epoch, data.upgrade, data.expectedPurchases) });
  } catch (error) { return failure(error); }
}

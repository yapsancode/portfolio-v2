import type { NextRequest } from "next/server";
import { GAME_VERSION } from "@/lib/olympus/leaderboard";
import { failure, player, response, scores } from "@/lib/olympus/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    return response({ entries: await scores(player(request)), version: GAME_VERSION });
  } catch (error) { return failure(error); }
}

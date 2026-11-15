import type { NextRequest } from "next/server";
import { parseName } from "@/lib/olympus/leaderboard";
import { body, failure, limit, player, playerName, randomUUID, reserveName, response, setPlayer } from "@/lib/olympus/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    return response({ name: await playerName(player(request)) });
  } catch (error) { return failure(error); }
}

export async function POST(request: NextRequest) {
  try {
    const data = await body(request);
    const name = parseName(data.name);
    const id = player(request) ?? randomUUID();
    await limit(request, "name", id, 30);
    const reserved = await reserveName(id, name);
    const result = response({ name: reserved });
    setPlayer(result, id);
    return result;
  } catch (error) { return failure(error); }
}

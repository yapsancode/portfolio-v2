import { sharedScore } from "@/lib/games/olympus/server";
import { scoreImage } from "@/lib/games/olympus/share-image";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const score = await sharedScore((await params).id);
    if (!score) return new Response("Haul not available.", { status: 404, headers: { "Cache-Control": "no-store" } });
    return await scoreImage(score);
  } catch {
    return new Response("Haul card is temporarily unavailable.", { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

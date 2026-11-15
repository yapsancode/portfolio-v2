import { sharedScore } from "@/lib/olympus/server";
import { scoreImage } from "@/lib/olympus/share-image";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const score = await sharedScore((await params).id);
    if (!score) return new Response("Score not available.", { status: 404, headers: { "Cache-Control": "no-store" } });
    return await scoreImage(score);
  } catch {
    return new Response("Score card is temporarily unavailable.", { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

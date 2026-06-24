import { getNowPlaying } from "@/lib/spotify";

// Always run fresh on the server — "now playing" is, by definition, live.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const data = await getNowPlaying();

  return Response.json(data, {
    headers: {
      // Don't let a CDN/browser pin a stale track; allow brief edge reuse.
      "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
    },
  });
}

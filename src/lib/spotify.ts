/* ============================================================================
 *  Spotify "now playing" — SERVER ONLY.
 *
 *  This module talks to the Spotify Web API using a long-lived refresh token.
 *  It must never be imported into a client component: it reads secrets from the
 *  environment (client id/secret/refresh token). The only consumer is the
 *  `/api/now-playing` route handler, which runs on the server.
 *
 *  One-time setup (get the refresh token) lives in:
 *    scripts/get-spotify-refresh-token.mjs   (see .env.example)
 * ========================================================================== */

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_ENDPOINT =
  "https://api.spotify.com/v1/me/player/currently-playing";

/** Normalized shape sent to the browser — no secrets, just what we render. */
export type NowPlaying =
  | { configured: false }
  | { configured: true; isPlaying: false }
  | {
      configured: true;
      isPlaying: true;
      id: string | null;
      kind: "track" | "episode";
      title: string;
      artist: string;
      album: string;
      albumImageUrl: string | null;
      songUrl: string | null;
    };

function getCreds() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;
  return { clientId, clientSecret, refreshToken };
}

/** Exchange the long-lived refresh token for a short-lived access token. */
async function getAccessToken(creds: NonNullable<ReturnType<typeof getCreds>>) {
  const basic = Buffer.from(
    `${creds.clientId}:${creds.clientSecret}`,
  ).toString("base64");

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: creds.refreshToken,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Spotify token request failed (${res.status})`);
  }
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("Spotify token response had no token");
  return data.access_token;
}

/** Shape of the bits of the Spotify currently-playing payload we read. */
type SpotifyImage = { url: string };
type SpotifyArtist = { name: string };
type SpotifyTrack = {
  id?: string;
  type?: string; // "track" | "episode"
  name?: string;
  artists?: SpotifyArtist[];
  album?: { name?: string; images?: SpotifyImage[] };
  external_urls?: { spotify?: string };
  // podcast episodes carry their own art + show instead of album/artists
  images?: SpotifyImage[];
  show?: { name?: string };
};
type CurrentlyPlaying = {
  is_playing?: boolean;
  item?: SpotifyTrack | null;
};

/**
 * Fetch what's currently playing. Returns a normalized, secret-free payload.
 * Never throws to the caller — on any failure it degrades to `isPlaying: false`
 * so the widget can quietly show "Not playing" instead of breaking the header.
 */
export async function getNowPlaying(): Promise<NowPlaying> {
  const creds = getCreds();
  if (!creds) return { configured: false };

  try {
    const accessToken = await getAccessToken(creds);

    const res = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    // 204 = nothing playing; 200 with body = something playing.
    if (res.status === 204) {
      return { configured: true, isPlaying: false };
    }
    // Any non-OK status (401 bad/expired token, 403, 429 rate limit, …) is a
    // real fault, not "nothing playing" — surface it in the server logs so we
    // can tell a config/credential problem apart from an idle player.
    if (!res.ok) {
      console.error(
        `[now-playing] Spotify currently-playing returned ${res.status} ${res.statusText}`,
      );
      return { configured: true, isPlaying: false };
    }

    const data = (await res.json()) as CurrentlyPlaying;
    const item = data.item;
    if (!data.is_playing || !item) {
      return { configured: true, isPlaying: false };
    }

    const artist =
      item.artists?.map((a) => a.name).join(", ") || item.show?.name || "";
    const albumImageUrl =
      item.album?.images?.[0]?.url ?? item.images?.[0]?.url ?? null;

    return {
      configured: true,
      isPlaying: true,
      id: item.id ?? null,
      kind: item.type === "episode" ? "episode" : "track",
      title: item.name ?? "Unknown",
      artist,
      album: item.album?.name ?? item.show?.name ?? "",
      albumImageUrl,
      songUrl: item.external_urls?.spotify ?? null,
    };
  } catch (err) {
    // Network hiccup, expired creds, rate limit — fail soft for the UI, but log
    // the cause server-side (e.g. "token request failed (400)") so it's
    // diagnosable. Never logs the tokens themselves.
    console.error("[now-playing]", err instanceof Error ? err.message : err);
    return { configured: true, isPlaying: false };
  }
}

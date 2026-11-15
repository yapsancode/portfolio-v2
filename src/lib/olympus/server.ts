import "server-only";

import { createHmac, createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";
import { GAME_VERSION, LeaderboardError, SESSION_SECONDS, type RunResult } from "./leaderboard";

const COOKIE = "olympus-player";

function environment() {
  return process.env.VERCEL_ENV === "production" ? "production"
    : process.env.VERCEL_ENV === "preview" ? "preview" : "development";
}

function scoreVersion() { return `${GAME_VERSION}:${environment()}`; }

function secret() {
  const value = process.env.OLYMPUS_SECRET;
  if (!value || value.length < 32) throw new LeaderboardError("High scores are temporarily offline. You can still play.", 503);
  return value;
}

export function database() {
  secret();
  if (!process.env.DATABASE_URL) throw new LeaderboardError("High scores are temporarily offline. You can still play.", 503);
  // Lazy creation lets builds and the rest of the portfolio run without credentials.
  return neon(process.env.DATABASE_URL, { fetchOptions: { signal: AbortSignal.timeout(10_000) } });
}

function signature(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function player(request: NextRequest): string | null {
  const [id, mac] = (request.cookies.get(COOKIE)?.value ?? "").split(".");
  if (!/^[0-9a-f-]{36}$/.test(id ?? "") || !/^[0-9a-f]{64}$/.test(mac ?? "")) return null;
  const expected = signature(id);
  return timingSafeEqual(Buffer.from(mac), Buffer.from(expected)) ? id : null;
}

export function setPlayer(response: NextResponse, id: string) {
  response.cookies.set(COOKIE, `${id}.${signature(id)}`, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict",
    path: "/api/olympus", maxAge: 60 * 60 * 24 * 365,
  });
}

export function response(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
}

export function failure(error: unknown) {
  // Do not log connection strings or raw driver errors (which can include queries).
  if (error instanceof LeaderboardError) {
    const result = response({ error: error.message }, error.status);
    if (error.status === 429) result.headers.set("Retry-After", "3600");
    return result;
  }
  console.error("Olympus leaderboard request failed.");
  return response({ error: "High scores are temporarily offline. Please try again." }, 503);
}

export async function body(request: NextRequest): Promise<Record<string, unknown>> {
  if (request.headers.get("origin") !== request.nextUrl.origin) throw new LeaderboardError("Request not allowed.", 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new LeaderboardError("Expected JSON.", 415);
  // Bound the stream too; Content-Length alone can be absent or dishonest.
  const reader = request.body?.getReader();
  if (!reader) throw new LeaderboardError("Missing request body.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 1024) {
        await reader.cancel();
        throw new LeaderboardError("Request is too large.", 413);
      }
      chunks.push(value);
    }
    const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    return parsed as Record<string, unknown>;
  } catch (error) {
    if (error instanceof LeaderboardError) throw error;
    throw new LeaderboardError("Invalid JSON.");
  } finally {
    reader.releaseLock();
  }
}

export function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function playerName(id: string | null): Promise<string | null> {
  const sql = database();
  if (!id) return null;
  const rows = await sql`SELECT name FROM olympus_players WHERE id = ${id} AND environment = ${environment()}`;
  return rows[0]?.name ?? null;
}

export async function reserveName(id: string, name: string): Promise<string> {
  const sql = database();
  // Both ownership and case-insensitive uniqueness are enforced by PostgreSQL,
  // including two visitors attempting to claim the same name simultaneously.
  const rows = await sql`INSERT INTO olympus_players (id, name, environment) VALUES (${id}, ${name}, ${environment()})
    ON CONFLICT DO NOTHING RETURNING name`;
  if (rows.length) return rows[0].name;
  const existing = await playerName(id);
  if (existing?.toLowerCase() === name.toLowerCase()) return existing;
  if (existing) throw new LeaderboardError(`This browser already plays as ${existing}. Continue with that name.`, 409);
  throw new LeaderboardError("That name is already taken. Try another one.", 409);
}

export async function limit(request: NextRequest, scope: string, id: string | null, maximum: number) {
  const sql = database();
  // Vercel overwrites x-vercel-forwarded-for. Never trust arbitrary x-forwarded-for.
  const ip = process.env.VERCEL ? request.headers.get("x-vercel-forwarded-for") ?? "unknown" : "local";
  const keys = [signature(`${scope}:ip:${ip}`), ...(id ? [signature(`${scope}:player:${id}`)] : [])];
  const counts = await sql`
    INSERT INTO olympus_limits (key, hits, resets_at)
    SELECT unnest(${keys}::text[]), 1, now() + interval '1 hour'
    ON CONFLICT (key) DO UPDATE SET
      hits = CASE WHEN olympus_limits.resets_at <= now() THEN 1 ELSE olympus_limits.hits + 1 END,
      resets_at = CASE WHEN olympus_limits.resets_at <= now() THEN now() + interval '1 hour' ELSE olympus_limits.resets_at END
    RETURNING hits
  `;
  if (counts.some((row) => row.hits > maximum)) throw new LeaderboardError("Too many attempts. Please try again later.", 429);
}

export async function startSession(id: string, previous: string | null) {
  const sql = database();
  if (!await playerName(id)) throw new LeaderboardError("Choose your player name before starting a game.", 403);
  const token = randomBytes(32).toString("hex");
  const hash = tokenHash(token);
  const publicId = randomUUID();
  if (!previous) {
    await sql`INSERT INTO olympus_sessions (token_hash, id, player_id, game_version, run)
      VALUES (${hash}, ${publicId}, ${id}, ${scoreVersion()}, 1)`;
    return { token, run: 1 };
  }
  const rows = await sql`
    INSERT INTO olympus_sessions (token_hash, id, player_id, game_version, run, previous_hash)
    SELECT ${hash}, ${publicId}, ${id}, ${scoreVersion()}, run + 1, token_hash
    FROM olympus_sessions
    WHERE token_hash = ${tokenHash(previous)} AND player_id = ${id} AND game_version = ${scoreVersion()}
      AND outcome = 'won' AND finished_at > now() - interval '1 hour' AND run < 1000
    ON CONFLICT (previous_hash) DO NOTHING
    RETURNING run
  `;
  if (!rows.length) throw new LeaderboardError("This winning streak has expired. Start a fresh game to post scores.", 409);
  return { token, run: rows[0].run as number };
}

export async function finishSession(id: string, token: string, result: RunResult) {
  const sql = database();
  const rows = await sql`
    UPDATE olympus_sessions SET score = ${result.score}, duration_ms = ${result.durationMs},
      outcome = ${result.outcome}, finished_at = COALESCE(finished_at, now()),
      player_name = (SELECT name FROM olympus_players WHERE id = ${id} AND environment = ${environment()}),
      published_at = COALESCE(published_at, now())
    WHERE token_hash = ${tokenHash(token)} AND player_id = ${id} AND game_version = ${scoreVersion()}
      AND started_at > now() - ${SESSION_SECONDS} * interval '1 second'
      AND ${result.durationMs} <= EXTRACT(EPOCH FROM (now() - started_at)) * 1000 + 2000
      AND (finished_at IS NULL OR (score = ${result.score} AND duration_ms = ${result.durationMs} AND outcome = ${result.outcome}))
      AND EXISTS (SELECT 1 FROM olympus_players WHERE id = ${id} AND environment = ${environment()})
    RETURNING id
  `;
  if (!rows.length) throw new LeaderboardError("This game could not be recorded. It may have expired or already been submitted.", 409);
}

export async function scores(id: string | null) {
  const sql = database();
  return sql`
    WITH best AS (
      SELECT DISTINCT ON (player_id) id, player_id, player_name, score, run, outcome, published_at
      FROM olympus_sessions
      WHERE game_version = ${scoreVersion()} AND published_at IS NOT NULL AND hidden = false
      ORDER BY player_id, score DESC, run DESC, published_at ASC, id ASC
    )
    SELECT id, player_name AS name, score, run, outcome, published_at AS "createdAt",
      COALESCE(player_id = ${id}::uuid, false) AS "isYou"
    FROM best ORDER BY score DESC, run DESC, published_at ASC, id ASC LIMIT 10
  `;
}

export { randomUUID };

import "server-only";

import { createHmac, createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";
import { GAME_VERSION, LeaderboardError, SESSION_SECONDS, type LevelResult } from "./leaderboard";

import { LAST_LEVEL, progressAt, type Progress } from "./levels";
import type { SharedScore } from "./sharing";

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

export async function progress(id: string): Promise<Progress> {
  const sql = database();
  if (!await playerName(id)) throw new LeaderboardError("Your player name is missing. Choose a name to save progress.", 403);
  const rows = await sql`INSERT INTO olympus_progress (player_id, environment, epoch)
    VALUES (${id}, ${environment()}, ${randomUUID()})
    ON CONFLICT (player_id, environment) DO UPDATE SET player_id = EXCLUDED.player_id
    RETURNING highest_completed, epoch`;
  if (rows[0].highest_completed > LAST_LEVEL) throw new LeaderboardError("Your save needs a newer version of Olympus. Refresh the game.", 409);
  return progressAt(rows[0].highest_completed, rows[0].epoch);
}

export async function resetProgress(id: string, epoch: string): Promise<Progress> {
  const sql = database();
  const rows = await sql`UPDATE olympus_progress SET highest_completed = 0, epoch = ${randomUUID()}, updated_at = now()
    WHERE player_id = ${id} AND environment = ${environment()} AND epoch = ${epoch}
    RETURNING epoch`;
  if (!rows.length) throw new LeaderboardError("Your campaign changed in another tab. Go back and reload your saved level.", 409);
  return progressAt(0, rows[0].epoch);
}

export async function startSession(id: string, level: number, epoch: string) {
  const sql = database();
  const token = randomBytes(32).toString("hex");
  const rows = await sql`INSERT INTO olympus_sessions (token_hash, id, player_id, game_version, run, campaign_epoch)
    SELECT ${tokenHash(token)}, ${randomUUID()}, ${id}, ${scoreVersion()}, ${level}, epoch
    FROM olympus_progress WHERE player_id = ${id} AND environment = ${environment()} AND epoch = ${epoch}
      AND LEAST(highest_completed + 1, ${LAST_LEVEL}) = ${level}
    RETURNING run`;
  if (!rows.length) throw new LeaderboardError("Your saved level changed. Exit and continue from the title screen.", 409);
  return { token, level };
}

export async function finishSession(id: string, token: string, result: LevelResult): Promise<Progress> {
  const sql = database();
  // Recording the result and advancing its checkpoint are one atomic statement.
  // A duplicate win cannot skip a level; an old tab cannot undo Start Over.
  const rows = await sql`
    WITH recorded AS (
      UPDATE olympus_sessions SET score = ${result.score}, duration_ms = ${result.durationMs},
        outcome = ${result.outcome}, finished_at = COALESCE(finished_at, now()),
        player_name = (SELECT name FROM olympus_players WHERE id = ${id} AND environment = ${environment()}),
        published_at = COALESCE(published_at, now())
      WHERE token_hash = ${tokenHash(token)} AND player_id = ${id} AND game_version = ${scoreVersion()}
        AND started_at > now() - ${SESSION_SECONDS} * interval '1 second'
        AND ${result.durationMs} <= EXTRACT(EPOCH FROM (now() - started_at)) * 1000 + 2000
        AND (finished_at IS NULL OR (score = ${result.score} AND duration_ms = ${result.durationMs} AND outcome = ${result.outcome}))
        AND EXISTS (SELECT 1 FROM olympus_players WHERE id = ${id} AND environment = ${environment()})
      RETURNING run, campaign_epoch
    ), advanced AS (
      UPDATE olympus_progress p SET highest_completed = CASE
          WHEN ${result.outcome} = 'won' AND p.highest_completed = r.run - 1 THEN r.run ELSE p.highest_completed END,
        updated_at = now()
      FROM recorded r WHERE p.player_id = ${id} AND p.environment = ${environment()} AND p.epoch = r.campaign_epoch
      RETURNING p.highest_completed, p.epoch
    ) SELECT * FROM advanced`;
  if (!rows.length) throw new LeaderboardError("This attempt could not update your save. It expired, was already submitted differently, or the campaign was reset. Exit and reload your saved level.", 409);
  return progressAt(rows[0].highest_completed, rows[0].epoch);
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
    SELECT id, player_name AS name, score, run AS level, outcome, published_at AS "createdAt",
      COALESCE(player_id = ${id}::uuid, false) AS "isYou"
    FROM best ORDER BY score DESC, run DESC, published_at ASC, id ASC LIMIT 10
  `;
}

export async function createShare(id: string, token: string): Promise<SharedScore> {
  const sql = database();
  // Rank this exact result, not a player's better result. Freeze the first snapshot.
  const rows = await sql`
    WITH best AS (
      SELECT DISTINCT ON (player_id) id, player_id, score, run, published_at
      FROM olympus_sessions
      WHERE game_version = ${scoreVersion()} AND published_at IS NOT NULL AND hidden = false
      ORDER BY player_id, score DESC, run DESC, published_at ASC, id ASC
    ), podium AS (
      SELECT id, row_number() OVER (ORDER BY score DESC, run DESC, published_at ASC, id ASC)::integer AS rank
      FROM best ORDER BY score DESC, run DESC, published_at ASC, id ASC LIMIT 3
    ), snapshot AS (
      INSERT INTO olympus_shares (session_id, rank)
      SELECT s.id, p.rank FROM olympus_sessions s LEFT JOIN podium p ON p.id = s.id
      WHERE s.token_hash = ${tokenHash(token)} AND s.player_id = ${id}
        AND s.game_version = ${scoreVersion()} AND s.published_at IS NOT NULL
        AND s.player_name IS NOT NULL AND s.hidden = false
      ON CONFLICT (session_id) DO UPDATE SET session_id = EXCLUDED.session_id
      RETURNING session_id, rank, shared_at
    )
    SELECT s.id, s.player_name AS name, s.score, s.run AS level, s.outcome,
      snapshot.rank, snapshot.shared_at AS "sharedAt"
    FROM snapshot JOIN olympus_sessions s ON s.id = snapshot.session_id`;
  if (!rows.length) throw new LeaderboardError("Only your saved, visible scores can be shared. Try saving this score again.", 409);
  return rows[0] as SharedScore;
}

export async function sharedScore(id: string): Promise<SharedScore | null> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) return null;
  const sql = database();
  // Historical shares survive game updates, but never cross environments or moderation.
  const rows = await sql`SELECT s.id, s.player_name AS name, s.score, s.run AS level, s.outcome,
      sh.rank, sh.shared_at AS "sharedAt"
    FROM olympus_shares sh JOIN olympus_sessions s ON s.id = sh.session_id
    WHERE s.id = ${id} AND s.game_version LIKE ${`%:${environment()}`}
      AND s.published_at IS NOT NULL AND s.player_name IS NOT NULL AND s.hidden = false`;
  return (rows[0] as SharedScore | undefined) ?? null;
}

export { randomUUID };

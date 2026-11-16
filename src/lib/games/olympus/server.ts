import "server-only";

import { createHmac, createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";
import { GAME_VERSION, LeaderboardError, SESSION_SECONDS, checkHaul, type LevelResult } from "./leaderboard";

import { LAST_LEVEL, progressAt, type Progress } from "./levels";
import type { SharedScore } from "./sharing";
import { UPGRADES, UPGRADE_BASE_COST, UPGRADE_INTERVAL, isUpgrade, type Upgrade } from "./resources";

const COOKIE = "olympus-player";

function environment() {
  return process.env.VERCEL_ENV === "production" ? "production"
    : process.env.VERCEL_ENV === "preview" ? "preview" : "development";
}

function scoreVersion() { return `${GAME_VERSION}:${environment()}`; }

function secret() {
  const value = process.env.OLYMPUS_SECRET;
  if (!value || value.length < 32) throw new LeaderboardError("Olympus saves are temporarily offline. You can still play.", 503);
  return value;
}

export function database() {
  secret();
  if (!process.env.DATABASE_URL) throw new LeaderboardError("Olympus saves are temporarily offline. You can still play.", 503);
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
    path: "/api/games/olympus", maxAge: 60 * 60 * 24 * 365,
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
  return response({ error: "Olympus saves are temporarily offline. Please try again." }, 503);
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

function rowProgress(row: Record<string, unknown>): Progress {
  return progressAt(Number(row.highest_completed), String(row.epoch), {
    marble: Number(row.marble), lifetimeMarble: Number(row.lifetime_marble), furthestLevel: Number(row.furthest_level),
    upgrades: { hull: Number(row.hull_level), blaster: Number(row.blaster_level), shield: Number(row.shield_level) },
  });
}

export async function progress(id: string): Promise<Progress> {
  const sql = database();
  if (!await playerName(id)) throw new LeaderboardError("Your player name is missing. Choose a name to save progress.", 403);
  const rows = await sql`INSERT INTO olympus_progress (player_id, environment, epoch)
    VALUES (${id}, ${environment()}, ${randomUUID()})
    ON CONFLICT (player_id, environment) DO UPDATE SET player_id = EXCLUDED.player_id
    RETURNING *`;
  if (rows[0].highest_completed > LAST_LEVEL) throw new LeaderboardError("Your save needs a newer version of Olympus. Refresh the game.", 409);
  return rowProgress(rows[0]);
}

export async function resetProgress(id: string, epoch: string): Promise<Progress> {
  const sql = database();
  const rows = await sql`UPDATE olympus_progress SET highest_completed = 0, epoch = ${randomUUID()}, updated_at = now()
    WHERE player_id = ${id} AND environment = ${environment()} AND epoch = ${epoch}
    RETURNING *`;
  if (!rows.length) throw new LeaderboardError("Your campaign changed in another tab. Go back and reload your saved level.", 409);
  return rowProgress(rows[0]);
}

export async function startSession(id: string, level: number, epoch: string) {
  const sql = database();
  const token = randomBytes(32).toString("hex");
  const rows = await sql`WITH opened AS (
    INSERT INTO olympus_sessions (token_hash, id, player_id, game_version, run, campaign_epoch)
    SELECT ${tokenHash(token)}, ${randomUUID()}, ${id}, ${scoreVersion()}, ${level}, epoch
    FROM olympus_progress WHERE player_id = ${id} AND environment = ${environment()} AND epoch = ${epoch}
      AND LEAST(highest_completed + 1, ${LAST_LEVEL}) = ${level}
    RETURNING run
  ) SELECT opened.run, p.hull_level, p.blaster_level, p.shield_level FROM opened, olympus_progress p
    WHERE p.player_id = ${id} AND p.environment = ${environment()}`;
  if (!rows.length) throw new LeaderboardError("Your saved level changed. Exit and continue from the title screen.", 409);
  return { token, level, upgrades: { hull: rows[0].hull_level, blaster: rows[0].blaster_level, shield: rows[0].shield_level } };
}

export async function finishSession(id: string, token: string, result: LevelResult): Promise<Progress> {
  const sql = database();
  const [session] = await sql`SELECT run FROM olympus_sessions WHERE token_hash = ${tokenHash(token)} AND player_id = ${id}`;
  if (!session) throw new LeaderboardError("This attempt could not update your save. Exit and reload your saved level.", 409);
  checkHaul(result, session.run);
  // Lock the save before the attempt: finish/reset/refit serialize on this row.
  // Capture the first finish under lock so retries cannot mint marble twice.
  // A first finish must still be the player's current level and newest attempt:
  // starting an attempt voids older unfinished ones, so parallel tabs cannot each bank marble.
  const rows = await sql`
    WITH saved AS MATERIALIZED (
      SELECT * FROM olympus_progress WHERE player_id = ${id} AND environment = ${environment()} FOR UPDATE
    ), eligible AS MATERIALIZED (
      SELECT s.token_hash, s.finished_at IS NULL AS first_finish FROM olympus_sessions s
      JOIN saved p ON p.epoch = s.campaign_epoch
      WHERE s.token_hash = ${tokenHash(token)} AND s.player_id = ${id} AND s.game_version = ${scoreVersion()}
        AND s.started_at > now() - ${SESSION_SECONDS} * interval '1 second'
        AND ${result.durationMs} <= EXTRACT(EPOCH FROM (now() - s.started_at)) * 1000 + 2000
        AND (s.finished_at IS NULL OR (s.score = ${result.score} AND s.duration_ms = ${result.durationMs} AND s.outcome = ${result.outcome}))
        AND (s.finished_at IS NOT NULL OR (LEAST(p.highest_completed + 1, ${LAST_LEVEL}) = s.run AND NOT EXISTS (
          SELECT 1 FROM olympus_sessions n WHERE n.player_id = s.player_id AND n.campaign_epoch = s.campaign_epoch
            AND (n.started_at, n.id) > (s.started_at, s.id))))
        AND EXISTS (SELECT 1 FROM olympus_players WHERE id = ${id} AND environment = ${environment()})
      FOR UPDATE OF s
    ), recorded AS (
      UPDATE olympus_sessions s SET score = ${result.score}, duration_ms = ${result.durationMs},
        outcome = ${result.outcome}, finished_at = COALESCE(s.finished_at, now()),
        player_name = (SELECT name FROM olympus_players WHERE id = ${id} AND environment = ${environment()}),
        published_at = COALESCE(s.published_at, now())
      FROM eligible e WHERE s.token_hash = e.token_hash
      RETURNING s.run, s.campaign_epoch, e.first_finish
    ), advanced AS (
      UPDATE olympus_progress p SET highest_completed = CASE
          WHEN ${result.outcome} = 'won' AND p.highest_completed = r.run - 1 THEN r.run ELSE p.highest_completed END,
        marble = p.marble + CASE WHEN r.first_finish THEN ${result.score} ELSE 0 END,
        lifetime_marble = p.lifetime_marble + CASE WHEN r.first_finish THEN ${result.score} ELSE 0 END,
        furthest_level = CASE WHEN ${result.outcome} = 'won' THEN GREATEST(p.furthest_level, r.run) ELSE p.furthest_level END,
        updated_at = now()
      FROM recorded r WHERE p.player_id = ${id} AND p.environment = ${environment()} AND p.epoch = r.campaign_epoch
      RETURNING p.*
    ) SELECT * FROM advanced`;
  if (!rows.length) throw new LeaderboardError("This attempt could not update your save. It expired, was already submitted differently, or the campaign was reset. Exit and reload your saved level.", 409);
  return rowProgress(rows[0]);
}

export async function buyUpgrade(id: string, epoch: string, upgrade: Upgrade, expectedPurchases: number): Promise<Progress> {
  if (!isUpgrade(upgrade) || !Number.isInteger(expectedPurchases) || expectedPurchases < 0 || expectedPurchases >= 10) {
    throw new LeaderboardError("Invalid refit request.");
  }
  const sql = database();
  const cost = UPGRADE_BASE_COST * (expectedPurchases + 1);
  // Compare-and-swap the purchase count: concurrent clicks cannot spend twice.
  const rows = await sql`UPDATE olympus_progress SET
      marble = marble - ${cost},
      hull_level = hull_level + ${upgrade === "hull" ? 1 : 0},
      blaster_level = blaster_level + ${upgrade === "blaster" ? 1 : 0},
      shield_level = shield_level + ${upgrade === "shield" ? 1 : 0}, updated_at = now()
    WHERE player_id = ${id} AND environment = ${environment()} AND epoch = ${epoch}
      AND hull_level + blaster_level + shield_level = ${expectedPurchases}
      AND furthest_level / ${UPGRADE_INTERVAL} > ${expectedPurchases} AND marble >= ${cost}
      AND CASE ${upgrade} WHEN 'hull' THEN hull_level < ${UPGRADES.hull.max}
        WHEN 'blaster' THEN blaster_level < ${UPGRADES.blaster.max} ELSE shield_level < ${UPGRADES.shield.max} END
    RETURNING *`;
  if (!rows.length) throw new LeaderboardError("Refit unavailable. You need an unused ten-level milestone, enough marble, and room for that upgrade. Reload your bank if another tab changed it.", 409);
  return rowProgress(rows[0]);
}

export async function scores(id: string | null) {
  const sql = database();
  // Campaign total: best haul per level, added up, so going further always counts.
  return sql`
    WITH level_best AS (
      -- Each player's best haul on each level; a level's ★ needs any win there, not the best haul.
      SELECT DISTINCT ON (player_id, run) id, player_id, player_name, score, run, duration_ms, published_at,
        bool_or(outcome = 'won') OVER (PARTITION BY player_id, run) AS cleared
      FROM olympus_sessions
      WHERE game_version = ${scoreVersion()} AND published_at IS NOT NULL AND hidden = false
      ORDER BY player_id, run, score DESC, duration_ms ASC, published_at ASC, id ASC
    ), campaign AS (
      SELECT player_id, min(player_name) AS name, sum(score)::integer AS score, max(run) AS level,
        (array_agg(cleared ORDER BY run DESC))[1] AS cleared, (array_agg(id ORDER BY run DESC))[1] AS id,
        sum(duration_ms) AS duration, max(published_at) AS updated
      FROM level_best GROUP BY player_id
    ), ranked AS (
      SELECT *, row_number() OVER (ORDER BY score DESC, level DESC, duration ASC, updated ASC, id ASC)::integer AS rank
      FROM campaign
    )
    -- Top 10, plus the viewer's own row when they rank lower.
    SELECT id, name, score, level, CASE WHEN cleared THEN 'won' ELSE 'lost' END AS outcome, updated AS "createdAt",
      rank, COALESCE(player_id = ${id}::uuid, false) AS "isYou"
    FROM ranked WHERE rank <= 10 OR player_id = ${id}::uuid ORDER BY rank
  `;
}

export async function createShare(id: string, token: string): Promise<SharedScore> {
  const sql = database();
  // A medal needs a podium campaign and a haul that counts toward it. Freeze the first snapshot.
  const rows = await sql`
    WITH level_best AS (
      -- Each player's best haul on each level; a level's ★ needs any win there, not the best haul.
      SELECT DISTINCT ON (player_id, run) id, player_id, player_name, score, run, duration_ms, published_at,
        bool_or(outcome = 'won') OVER (PARTITION BY player_id, run) AS cleared
      FROM olympus_sessions
      WHERE game_version = ${scoreVersion()} AND published_at IS NOT NULL AND hidden = false
      ORDER BY player_id, run, score DESC, duration_ms ASC, published_at ASC, id ASC
    ), campaign AS (
      SELECT player_id, min(player_name) AS name, sum(score)::integer AS score, max(run) AS level,
        (array_agg(cleared ORDER BY run DESC))[1] AS cleared, (array_agg(id ORDER BY run DESC))[1] AS id,
        sum(duration_ms) AS duration, max(published_at) AS updated
      FROM level_best GROUP BY player_id
    ), podium AS (
      SELECT player_id, row_number() OVER (ORDER BY score DESC, level DESC, duration ASC, updated ASC, id ASC)::integer AS rank
      FROM campaign ORDER BY score DESC, level DESC, duration ASC, updated ASC, id ASC LIMIT 3
    ), snapshot AS (
      INSERT INTO olympus_shares (session_id, rank)
      SELECT s.id, p.rank FROM olympus_sessions s
        LEFT JOIN podium p ON p.player_id = s.player_id AND s.id IN (SELECT id FROM level_best)
      WHERE s.token_hash = ${tokenHash(token)} AND s.player_id = ${id}
        AND s.game_version = ${scoreVersion()} AND s.published_at IS NOT NULL
        AND s.player_name IS NOT NULL AND s.hidden = false
      ON CONFLICT (session_id) DO UPDATE SET session_id = EXCLUDED.session_id
      RETURNING session_id, rank, shared_at
    )
    SELECT s.id, s.player_name AS name, s.score, s.run AS level, s.outcome,
      snapshot.rank, snapshot.shared_at AS "sharedAt"
    FROM snapshot JOIN olympus_sessions s ON s.id = snapshot.session_id`;
  if (!rows.length) throw new LeaderboardError("Only your saved, visible hauls can be shared. Try saving this haul again.", 409);
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

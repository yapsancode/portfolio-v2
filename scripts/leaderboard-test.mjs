import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import path from "node:path";
import ts from "typescript";
import { PGlite } from "@electric-sql/pglite";

// Execute the actual migration and repository SQL against PostgreSQL in WASM.
// Only the Neon transport is replaced; queries, constraints and routes are real.
const require = createRequire(import.meta.url);
const db = new PGlite();
const cache = new Map();
process.env.DATABASE_URL = "postgresql://test:test@localhost/test";
process.env.OLYMPUS_SECRET = "test-only-secret-not-for-deployment-123456789";
delete process.env.VERCEL;
delete process.env.VERCEL_ENV;

function load(relative) {
  const filename = path.resolve(relative);
  if (cache.has(filename)) return cache.get(filename);
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  });
  const compiled = { exports: {} };
  const localRequire = (name) => {
    if (name === "server-only") return {};
    if (name === "@neondatabase/serverless") return { neon: () => async (strings, ...params) => {
      const query = strings.reduce((text, part, i) => text + (i ? `$${i}` : "") + part, "");
      return (await db.query(query, params)).rows;
    } };
    if (name.startsWith("@/")) return load(`src/${name.slice(2)}.ts`);
    if (name.startsWith(".")) return load(path.resolve(path.dirname(filename), `${name}.ts`));
    return require(name);
  };
  new Function("require", "module", "exports", outputText)(localRequire, compiled, compiled.exports);
  cache.set(filename, compiled.exports);
  return compiled.exports;
}

let checks = 0;
async function test(name, fn) {
  await fn();
  checks++;
  console.log(`PASS ${name}`);
}

try {
  await db.exec(readFileSync("db/001-olympus.sql", "utf8"));
  await db.exec(readFileSync("db/001-olympus.sql", "utf8"));
  await db.exec(readFileSync("db/002-player-names.sql", "utf8"));
  await db.exec(readFileSync("db/002-player-names.sql", "utf8"));
  await db.exec(readFileSync("db/003-scoreboard-environments.sql", "utf8"));
  await db.exec(readFileSync("db/004-level-progress.sql", "utf8"));
  await db.exec(readFileSync("db/004-level-progress.sql", "utf8"));
  const validation = load("src/lib/olympus/leaderboard.ts");
  const server = load("src/lib/olympus/server.ts");
  const sessions = load("src/app/api/olympus/session/route.ts");
  const scores = load("src/app/api/olympus/scores/route.ts");
  const players = load("src/app/api/olympus/player/route.ts");
  const { NextRequest } = require("next/server");
  const origin = "http://localhost:3000";
  function request(endpoint, method = "GET", data, cookie, headers = {}) {
    return new NextRequest(`${origin}/api/olympus/${endpoint}`, {
      method, headers: { origin, "content-type": "application/json", ...(cookie ? { cookie } : {}), ...headers },
      ...(data === undefined ? {} : { body: JSON.stringify(data) }),
    });
  }
  async function age(token, seconds = 90) {
    await db.query("UPDATE olympus_sessions SET started_at = now() - $1 * interval '1 second' WHERE token_hash = $2", [seconds, server.tokenHash(token)]);
  }
  const win = { score: 12000, durationMs: 60000, outcome: "won" };
  let cookie, ticket, id, progress;

  await test("reject malformed names, non-integral scores and impossible wins", () => {
    assert.equal(validation.parseName(" Isyraf_98 "), "Isyraf_98");
    for (const value of ["<x>", "A".repeat(17), "", null, "A B", "ab", "_player"]) assert.throws(() => validation.parseName(value));
    for (const value of [-10, 1.5, 11, 100010, "12000", null]) assert.throws(() => validation.parseResult({ ...win, score: value }));
    assert.throws(() => validation.parseResult({ ...win, score: 8000 }));
    assert.throws(() => validation.parseResult({ ...win, durationMs: 2000 }));
    assert.deepEqual(validation.parseResult(win), win);
  });
  await test("reject cross-origin, oversized and malformed requests before database access", async () => {
    assert.equal((await sessions.POST(request("session", "POST", {}, null, { origin: "https://evil.test" }))).status, 403);
    assert.equal((await sessions.POST(request("session", "POST", { value: "x".repeat(1100) }))).status, 413);
    assert.equal((await sessions.POST(request("session", "POST", []))).status, 400);
  });
  await test("reserve a name before playing and remember signed, HTTP-only ownership", async () => {
    assert.equal((await sessions.POST(request("session", "POST", { level: 1, epoch: randomUUID() }))).status, 401);
    assert.equal((await (await players.GET(request("player"))).json()).name, null);
    const response = await players.POST(request("player", "POST", { name: "Isyraf_98" }));
    assert.equal(response.status, 200);
    const setCookie = response.headers.get("set-cookie");
    assert.match(setCookie, /HttpOnly/i);
    cookie = setCookie.split(";")[0];
    id = server.player(request("scores", "GET", undefined, cookie));
    assert.ok(id);
    assert.equal(server.player(request("scores", "GET", undefined, cookie.replace(id, randomUUID()))), null);
    assert.equal((await (await players.GET(request("player", "GET", undefined, cookie))).json()).name, "Isyraf_98");
    progress = (await (await players.GET(request("player", "GET", undefined, cookie))).json()).progress;
    const started = await sessions.POST(request("session", "POST", { level: 1, epoch: progress.epoch }, cookie));
    assert.equal(started.status, 201);
    ticket = await started.json();
    assert.equal(ticket.level, 1);
    validation.parseToken(ticket.token);
  });
  await test("names are case-insensitively unique, immutable and reusable only by their owner", async () => {
    assert.equal((await players.POST(request("player", "POST", { name: "isyraf_98" }))).status, 409);
    assert.equal((await players.POST(request("player", "POST", { name: "ISYRAF_98" }, cookie))).status, 200);
    assert.equal((await players.POST(request("player", "POST", { name: "NewName" }, cookie))).status, 409);
    const attempts = await Promise.all([
      server.reserveName(randomUUID(), "SharedName"), server.reserveName(randomUUID(), "sharedname"),
    ].map((promise) => promise.then(() => "claimed", () => "taken")));
    assert.deepEqual(attempts.sort(), ["claimed", "taken"]);
  });
  await test("cannot skip levels and unfinished games are not public", async () => {
    assert.equal((await sessions.POST(request("session", "POST", { level: 2, epoch: progress.epoch }, cookie))).status, 409);
    assert.equal((await (await scores.GET(request("scores", "GET", undefined, cookie))).json()).entries.length, 0);
  });
  await test("reject stolen sessions and durations exceeding server elapsed time", async () => {
    const other = await players.POST(request("player", "POST", { name: "OtherPlayer" }));
    const otherCookie = other.headers.get("set-cookie").split(";")[0];
    await age(ticket.token);
    assert.equal((await sessions.PATCH(request("session", "PATCH", { token: ticket.token, ...win }, otherCookie))).status, 409);
    assert.equal((await sessions.PATCH(request("session", "PATCH", { token: ticket.token, ...win, durationMs: 300000 }, cookie))).status, 409);
  });
  await test("finish is idempotent, but a recorded result cannot be changed", async () => {
    for (let i = 0; i < 2; i++) assert.equal((await sessions.PATCH(request("session", "PATCH", { token: ticket.token, ...win }, cookie))).status, 200);
    assert.equal((await sessions.PATCH(request("session", "PATCH", { token: ticket.token, ...win, score: 13000 }, cookie))).status, 409);
  });
  await test("finishing automatically publishes the reserved name without exposing identifiers", async () => {
    const data = await (await scores.GET(request("scores", "GET", undefined, cookie))).json();
    assert.equal(data.entries.length, 1);
    assert.equal(data.entries[0].name, "Isyraf_98");
    assert.equal(data.entries[0].isYou, true);
    assert.equal(data.entries[0].player_id, undefined);
    assert.equal(data.entries[0].token_hash, undefined);
    assert.equal((await (await scores.GET(request("scores"))).json()).entries[0].isYou, false);
  });
  await test("win saves level 2 immediately and concurrent duplicate wins cannot skip it", async () => {
    assert.equal((await server.progress(id)).resumeLevel, 2);
    const attempts = await Promise.all([1, 2].map(() => server.startSession(id, 2, progress.epoch)));
    for (const next of attempts) await age(next.token);
    await Promise.all(attempts.map(next => server.finishSession(id, next.token, win)));
    assert.equal((await server.progress(id)).resumeLevel, 3);
    assert.equal((await server.scores(id)).length, 1);
    assert.equal((await server.scores(id))[0].level, 2);
    // Reposting an older win cannot overwrite a newer checkpoint.
    await server.finishSession(id, ticket.token, win);
    assert.equal((await server.progress(id)).resumeLevel, 3);
  });
  await test("loss, exit and expired attempts keep the saved level", async () => {
    const lost = await server.startSession(id, 3, progress.epoch);
    await age(lost.token);
    await server.finishSession(id, lost.token, { ...win, outcome: "lost" });
    assert.equal((await server.progress(id)).resumeLevel, 3);
    const expired = await server.startSession(id, 3, progress.epoch);
    await age(expired.token, 3700);
    await assert.rejects(server.finishSession(id, expired.token, win));
    assert.equal((await server.progress(id)).resumeLevel, 3);
  });
  await test("final level stays replayable and never unlocks undefined content", async () => {
    for (let level = 3; level <= 6; level++) {
      const next = await server.startSession(id, level, progress.epoch);
      await age(next.token); await server.finishSession(id, next.token, win);
    }
    const final = await server.progress(id);
    assert.equal(final.resumeLevel, 6); assert.equal(final.completed, true);
    const replay = await server.startSession(id, 6, progress.epoch);
    await age(replay.token); await server.finishSession(id, replay.token, win);
    assert.equal((await server.progress(id)).highestCompletedLevel, 6);
    assert.equal((await sessions.POST(request("session", "POST", { level: 7, epoch: progress.epoch }, cookie))).status, 400);
  });
  await test("Start Over resets only campaign and invalidates older tabs and attempts", async () => {
    const old = await server.startSession(id, 6, progress.epoch);
    await age(old.token);
    const response = await players.PATCH(request("player", "PATCH", { action: "reset", epoch: progress.epoch }, cookie));
    assert.equal(response.status, 200);
    const reset = (await response.json()).progress;
    assert.equal(reset.resumeLevel, 1); assert.equal(reset.highestCompletedLevel, 0);
    assert.notEqual(reset.epoch, progress.epoch);
    await assert.rejects(server.finishSession(id, old.token, win));
    await assert.rejects(server.startSession(id, 6, progress.epoch));
    await assert.rejects(server.resetProgress(id, progress.epoch));
    assert.equal((await server.progress(id)).resumeLevel, 1);
    assert.equal((await server.scores(id))[0].score, win.score);
    assert.equal(await server.playerName(id), "Isyraf_98");
    progress = reset;
  });
  await test("top 10 is ordered, one best per browser, versioned and moderatable", async () => {
    for (let i = 0; i < 12; i++) {
      const visitor = randomUUID();
      await server.reserveName(visitor, `Player${i}`);
      const checkpoint = await server.progress(visitor);
      const run = await server.startSession(visitor, 1, checkpoint.epoch);
      await age(run.token);
      await server.finishSession(visitor, run.token, { ...win, score: 20000 + i * 100 });
    }
    const rows = await server.scores(id);
    assert.equal(rows.length, 10);
    assert.equal(rows[0].score, 21100);
    await db.query("UPDATE olympus_sessions SET hidden = true WHERE id = $1", [rows[0].id]);
    await db.query("UPDATE olympus_sessions SET game_version = 'old' WHERE id = $1", [rows[1].id]);
    assert.equal((await server.scores(id))[0].score, 20900);
  });
  await test("rate limits are atomic across concurrent requests and reset after expiry", async () => {
    const req = request("session", "POST", {}, cookie);
    const results = await Promise.allSettled([1, 2, 3, 4].map(() => server.limit(req, "test", id, 2)));
    assert.equal(results.filter((r) => r.status === "fulfilled").length, 2);
    await db.exec("UPDATE olympus_limits SET resets_at = now() - interval '1 second'");
    await server.limit(req, "test", id, 2);
  });
  await test("preview and development names cannot reserve production names or populate its board", async () => {
    process.env.VERCEL_ENV = "production";
    try {
      assert.equal(await server.playerName(id), null);
      assert.equal((await server.scores(id)).length, 0);
      await server.reserveName(randomUUID(), "Isyraf_98");
      await assert.rejects(server.startSession(id, 1, progress.epoch));
    } finally { delete process.env.VERCEL_ENV; }
    assert.equal(await server.playerName(id), "Isyraf_98");
  });
  await test("missing configuration returns a safe offline response", async () => {
    delete process.env.DATABASE_URL;
    const response = await scores.GET(request("scores"));
    assert.equal(response.status, 503);
    assert.match((await response.json()).error, /offline/);
  });
  console.log(`\n${checks} leaderboard checks passed against PostgreSQL.`);
} finally {
  await db.close();
}

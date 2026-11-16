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
  await db.exec(readFileSync("db/005-score-sharing.sql", "utf8"));
  await db.exec(readFileSync("db/005-score-sharing.sql", "utf8"));
  await db.exec(readFileSync("db/006-marble-resources.sql", "utf8"));
  await db.exec(readFileSync("db/006-marble-resources.sql", "utf8"));
  const validation = load("src/lib/games/olympus/leaderboard.ts");
  const server = load("src/lib/games/olympus/server.ts");
  const sessions = load("src/app/api/games/olympus/session/route.ts");
  const scores = load("src/app/api/games/olympus/scores/route.ts");
  const players = load("src/app/api/games/olympus/player/route.ts");
  const shares = load("src/app/api/games/olympus/share/route.ts");
  const upgrades = load("src/app/api/games/olympus/upgrade/route.ts");
  const { NextRequest } = require("next/server");
  const origin = "http://localhost:3000";
  function request(endpoint, method = "GET", data, cookie, headers = {}) {
    return new NextRequest(`${origin}/api/games/olympus/${endpoint}`, {
      method, headers: { origin, "content-type": "application/json", ...(cookie ? { cookie } : {}), ...headers },
      ...(data === undefined ? {} : { body: JSON.stringify(data) }),
    });
  }
  async function age(token, seconds = 90) {
    await db.query("UPDATE olympus_sessions SET started_at = now() - $1 * interval '1 second' WHERE token_hash = $2", [seconds, server.tokenHash(token)]);
  }
  const win = { score: 12000, durationMs: 60000, outcome: "won" };
  // A big haul needs a long fight to fit under the per-level cap.
  const long = (score) => ({ ...win, score, durationMs: 120000 });
  let cookie, ticket, id, progress;

  await test("reject malformed names, non-integral scores and impossible wins", () => {
    assert.equal(validation.parseName(" Isyraf_98 "), "Isyraf_98");
    for (const value of ["<x>", "A".repeat(17), "", null, "A B", "ab", "_player"]) assert.throws(() => validation.parseName(value));
    for (const value of [-10, 1.5, 11, 100010, "12000", null]) assert.throws(() => validation.parseResult({ ...win, score: value }));
    assert.throws(() => validation.checkHaul(validation.parseResult({ ...win, score: 8000 }), 1));
    assert.throws(() => validation.checkHaul({ ...win, score: 9000 }, 2)); // level 2+ statue has 48 hp
    assert.throws(() => validation.checkHaul(validation.parseResult({ ...win, durationMs: 8000 }), 1));
    assert.deepEqual(validation.parseResult(win), win);
    validation.checkHaul(win, 1);
  });
  await test("per-level haul cap rejects a forged 100000 and accepts real simulated hauls", () => {
    assert.throws(() => validation.checkHaul({ score: 100000, durationMs: 20000, outcome: "lost" }, 1), /does not match/);
    assert.throws(() => validation.checkHaul({ score: 50000, durationMs: 20000, outcome: "lost" }, 6));
    // Best and fastest aggressive-bot runs (full desktop, max upgrades): scripts/olympus-sim.mjs bots.
    validation.checkHaul({ score: 19040, durationMs: 47267, outcome: "won" }, 1);
    validation.checkHaul({ score: 18280, durationMs: 20433, outcome: "won" }, 1);
    validation.checkHaul({ score: 16850, durationMs: 18550, outcome: "won" }, 4);
    assert.equal(validation.maxHaul(1, 20000), 37000);
    assert.equal(validation.maxHaul(2, 20000), 38000);
    assert.equal(validation.maxHaul(1, 3600000), 100000);
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
    assert.equal((await server.progress(id)).resources.marble, win.score);
    assert.equal((await server.progress(id)).resources.lifetimeMarble, win.score);
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
    const finished = await Promise.allSettled(attempts.map(next => server.finishSession(id, next.token, win)));
    assert.deepEqual(finished.map(r => r.status).sort(), ["fulfilled", "rejected"]);
    assert.equal((await server.progress(id)).resumeLevel, 3);
    assert.equal((await server.scores(id)).length, 1);
    assert.equal((await server.scores(id))[0].level, 2);
    // Reposting an older win cannot overwrite a newer checkpoint.
    await server.finishSession(id, ticket.token, win);
    assert.equal((await server.progress(id)).resumeLevel, 3);
    assert.equal((await server.progress(id)).resources.marble, 2 * win.score);
  });
  await test("a new attempt voids older open ones: only the newest of 3 parallel sessions banks marble", async () => {
    const visitor = randomUUID();
    await server.reserveName(visitor, "ParallelTabs");
    const saved = await server.progress(visitor);
    const opened = await Promise.all([1, 2, 3].map(() => server.startSession(visitor, 1, saved.epoch)));
    for (const next of opened) await age(next.token);
    const newest = (await db.query("SELECT token_hash FROM olympus_sessions WHERE player_id = $1 ORDER BY started_at DESC, id DESC LIMIT 1", [visitor])).rows[0].token_hash;
    const lost = { ...win, outcome: "lost" };
    const results = await Promise.allSettled(opened.map(next => server.finishSession(visitor, next.token, lost)));
    assert.deepEqual(results.map((r, i) => r.status === "fulfilled" ? server.tokenHash(opened[i].token) : null).filter(Boolean), [newest]);
    assert.equal((await server.progress(visitor)).resources.marble, win.score);
    // A stale tab's win cannot bank again or replay a passed level.
    const [stale, current] = [await server.startSession(visitor, 1, saved.epoch), await server.startSession(visitor, 1, saved.epoch)];
    await age(stale.token); await age(current.token);
    await server.finishSession(visitor, current.token, win);
    await assert.rejects(server.finishSession(visitor, stale.token, win), /could not update/);
    const after = await server.progress(visitor);
    assert.equal(after.resources.marble, 2 * win.score);
    assert.equal(after.highestCompletedLevel, 1);
    // The forged leaderboard haul from the audit: 100000 marble for a 20 second loss.
    const real = await server.startSession(visitor, 2, saved.epoch);
    await age(real.token, 25);
    const player = (await players.POST(request("player", "POST", { name: "ForgedHaul" }))).headers.get("set-cookie").split(";")[0];
    const forgerId = server.player(request("player", "GET", undefined, player));
    const forgerSession = await server.startSession(forgerId, 1, (await server.progress(forgerId)).epoch);
    await age(forgerSession.token, 25);
    const reply = await sessions.PATCH(request("session", "PATCH", { token: forgerSession.token, score: 100000, durationMs: 20000, outcome: "lost" }, player));
    assert.equal(reply.status, 400);
    assert.equal((await server.progress(forgerId)).resources.marble, 0);
    await server.finishSession(visitor, real.token, { score: 18370, durationMs: 24683, outcome: "won" });
    assert.equal((await server.progress(visitor)).highestCompletedLevel, 2);
  });
  await test("loss, exit and expired attempts keep the saved level", async () => {
    const before = (await server.progress(id)).resources.marble;
    const lost = await server.startSession(id, 3, progress.epoch);
    await age(lost.token);
    await server.finishSession(id, lost.token, { ...win, outcome: "lost" });
    assert.equal((await server.progress(id)).resumeLevel, 3);
    assert.equal((await server.progress(id)).resources.marble, before + win.score);
    const expired = await server.startSession(id, 3, progress.epoch);
    await age(expired.token, 3700);
    await assert.rejects(server.finishSession(id, expired.token, win));
    assert.equal((await server.progress(id)).resumeLevel, 3);
    assert.equal((await server.progress(id)).resources.marble, before + win.score);
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
    const bank = (await server.progress(id)).resources;
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
    assert.deepEqual((await server.progress(id)).resources, bank);
    assert.equal((await db.query("SELECT finished_at FROM olympus_sessions WHERE token_hash = $1", [server.tokenHash(old.token)])).rows[0].finished_at, null);
    assert.equal((await server.scores(id)).find(row => row.isYou).score, 6 * win.score); // campaign total survives Start Over
    assert.equal(await server.playerName(id), "Isyraf_98");
    progress = reset;
  });
  await test("top 10 ranks campaign totals, one row per browser, versioned and moderatable", async () => {
    let lowest;
    for (let i = 0; i < 12; i++) {
      const visitor = randomUUID();
      lowest ??= visitor;
      await server.reserveName(visitor, `Player${i}`);
      const checkpoint = await server.progress(visitor);
      const run = await server.startSession(visitor, 1, checkpoint.epoch);
      await age(run.token);
      await server.finishSession(visitor, run.token, { ...win, score: 20000 + i * 100 });
    }
    const rows = await server.scores(id);
    assert.equal(rows.length, 10);
    assert.deepEqual(rows.map(row => row.rank), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    // A player below the top 10 also gets their own row, with their real rank.
    const own = await server.scores(lowest);
    assert.equal(own.length, 11);
    assert.deepEqual([own[10].name, own[10].isYou, own[10].rank > 10], ["Player0", true, true]);
    assert.equal(own.filter(row => row.isYou).length, 1);
    // Six cleared levels (best haul per level, added up) beat one bigger single haul.
    assert.deepEqual([rows[0].score, rows[0].level, rows[0].outcome, rows[0].isYou], [6 * win.score, 6, "won", true]);
    const singles = (list) => list.filter(row => row.name.startsWith("Player"));
    assert.equal(singles(rows)[0].score, 21100);
    await db.query("UPDATE olympus_sessions SET hidden = true WHERE id = $1", [singles(rows)[0].id]);
    await db.query("UPDATE olympus_sessions SET game_version = 'old' WHERE id = $1", [singles(rows)[1].id]);
    assert.equal(singles(await server.scores(id))[0].score, 20900);
  });
  await test("equal totals rank the faster campaign first; a level without a win has no star", async () => {
    for (const [name, durationMs, outcome] of [["SlowTie", 100000, "won"], ["NoStar", 95000, "lost"], ["FastTie", 90000, "won"]]) {
      const visitor = randomUUID();
      await server.reserveName(visitor, name);
      const run = await server.startSession(visitor, 1, (await server.progress(visitor)).epoch);
      await age(run.token, 130);
      await server.finishSession(visitor, run.token, { score: 30000, durationMs, outcome });
    }
    const rows = (await server.scores(id)).filter(row => row.score === 30000);
    assert.deepEqual(rows.map(row => [row.name, row.outcome]), [["FastTie", "won"], ["NoStar", "lost"], ["SlowTie", "won"]]);
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
  await test("only an owner can share a saved result; public reads never expose credentials", async () => {
    const visitor = randomUUID();
    await server.reserveName(visitor, "ShareHero");
    const saved = await server.progress(visitor);
    const attempt = await server.startSession(visitor, 1, saved.epoch);
    await assert.rejects(server.createShare(visitor, attempt.token));
    await age(attempt.token, 130);
    await server.finishSession(visitor, attempt.token, long(90000));
    assert.equal((await shares.POST(request("share", "POST", { token: attempt.token }))).status, 401);
    assert.equal((await shares.POST(request("share", "POST", { token: attempt.token }, cookie))).status, 409);
    assert.equal((await shares.POST(request("share", "POST", { token: attempt.token }, cookie, { origin: "https://evil.test" }))).status, 403);
    const [first, concurrent] = await Promise.all([server.createShare(visitor, attempt.token), server.createShare(visitor, attempt.token)]);
    assert.deepEqual(first, concurrent);
    assert.equal(first.rank, 1);
    assert.equal(first.level, 1);
    assert.equal(first.score, 90000);
    assert.deepEqual(Object.keys(first).sort(), ["id", "level", "name", "outcome", "rank", "score", "sharedAt"]);
    assert.deepEqual(await server.sharedScore(first.id), first);
    assert.equal(await server.sharedScore("bad-id"), null);
    assert.equal(await server.sharedScore(randomUUID()), null);
    process.env.VERCEL_ENV = "production";
    try { assert.equal(await server.sharedScore(first.id), null); }
    finally { delete process.env.VERCEL_ENV; }
    // An old link and medal stay stable after leaderboard movement and game updates.
    const rival = randomUUID();
    await server.reserveName(rival, "ShareRival");
    const rivalSave = await server.progress(rival);
    const rivalAttempt = await server.startSession(rival, 1, rivalSave.epoch);
    await age(rivalAttempt.token, 130);
    await server.finishSession(rival, rivalAttempt.token, long(95000));
    assert.equal((await server.scores(visitor))[0].name, "ShareRival");
    assert.deepEqual(await server.createShare(visitor, attempt.token), first);
    await db.query("UPDATE olympus_sessions SET game_version = 'older:development' WHERE id = $1", [first.id]);
    assert.deepEqual(await server.sharedScore(first.id), first);
    await db.query("UPDATE olympus_sessions SET hidden = true WHERE id = $1", [first.id]);
    assert.equal(await server.sharedScore(first.id), null);
  });
  await test("a lesser score does not borrow the player's medal; successful share API is idempotent", async () => {
    const current = await server.progress(id);
    const best = await server.startSession(id, current.resumeLevel, current.epoch);
    await age(best.token, 130);
    await server.finishSession(id, best.token, { ...long(99000), outcome: "lost" });
    const ownerShare = await shares.POST(request("share", "POST", { token: best.token }, cookie));
    assert.equal(ownerShare.status, 200);
    assert.equal((await ownerShare.json()).share.rank, 1);
    const lesser = await server.startSession(id, current.resumeLevel, current.epoch);
    await age(lesser.token);
    await server.finishSession(id, lesser.token, { ...win, score: 10000, outcome: "lost" });
    const share = await server.createShare(id, lesser.token);
    assert.equal(share.rank, null);
    assert.equal(share.score, 10000);
    assert.equal(share.outcome, "lost");
  });
  await test("concurrent copies of one result bank once and reloading preserves the private wallet", async () => {
    const saved = await server.progress(id);
    const attempt = await server.startSession(id, saved.resumeLevel, saved.epoch);
    await age(attempt.token);
    await Promise.all([1, 2, 3].map(() => server.finishSession(id, attempt.token, { ...win, outcome: "lost" })));
    const current = (await (await players.GET(request("player", "GET", undefined, cookie))).json()).progress;
    assert.equal(current.resources.marble, saved.resources.marble + win.score);
    assert.equal(current.resources.lifetimeMarble, saved.resources.lifetimeMarble + win.score);
    assert.equal(current.resumeLevel, saved.resumeLevel);
    const publicEntry = (await server.scores(id))[0];
    assert.equal(publicEntry.resources, undefined); assert.equal(publicEntry.marble, undefined);
  });
  await test("refit API rejects forged ownership, early milestones, bad input, and insufficient funds", async () => {
    const saved = await server.progress(id);
    const data = { epoch: saved.epoch, upgrade: "hull", expectedPurchases: 0 };
    assert.equal((await upgrades.POST(request("upgrade", "POST", data))).status, 401);
    assert.equal((await upgrades.POST(request("upgrade", "POST", data, cookie))).status, 409); // only six levels cleared
    assert.equal((await upgrades.POST(request("upgrade", "POST", data, cookie, { origin: "https://evil.test" }))).status, 403);
    assert.equal((await upgrades.POST(request("upgrade", "POST", { ...data, upgrade: "__proto__" }, cookie))).status, 400);
    assert.equal((await upgrades.POST(request("upgrade", "POST", { ...data, expectedPurchases: -1 }, cookie))).status, 400);
    const visitor = randomUUID();
    await server.reserveName(visitor, "EmptyBank");
    const poor = await server.progress(visitor);
    // Future-milestone fixture, not an unlocked playable level.
    await db.query("UPDATE olympus_progress SET furthest_level = 10 WHERE player_id = $1", [visitor]);
    await assert.rejects(server.buyUpgrade(visitor, poor.epoch, "hull", 0));
    assert.equal((await server.progress(visitor)).resources.marble, 0);
  });
  await test("one milestone buys one refit under concurrent clicks; reset preserves purchases and the bank", async () => {
    const saved = await server.progress(id);
    const best = (await server.scores(id)).find(row => row.isYou)?.score;
    await db.query("UPDATE olympus_progress SET furthest_level = 10 WHERE player_id = $1", [id]);
    const data = { epoch: saved.epoch, upgrade: "hull", expectedPurchases: 0 };
    const replies = await Promise.all([1, 2].map(() => upgrades.POST(request("upgrade", "POST", data, cookie))));
    assert.deepEqual(replies.map(reply => reply.status).sort(), [200, 409]);
    let current = await server.progress(id);
    assert.equal(current.resources.marble, saved.resources.marble - 10000);
    assert.equal(current.resources.lifetimeMarble, saved.resources.lifetimeMarble);
    assert.equal(current.resources.upgrades.hull, 1);
    await assert.rejects(server.buyUpgrade(id, saved.epoch, "shield", 1));
    const started = await server.startSession(id, current.resumeLevel, current.epoch);
    assert.deepEqual(started.upgrades, current.resources.upgrades);
    await age(started.token);
    await server.finishSession(id, started.token, win);
    assert.equal((await server.progress(id)).resources.furthestLevel, 10); // replay cannot re-earn a milestone
    current = await server.progress(id);
    const reset = await server.resetProgress(id, current.epoch);
    assert.deepEqual(reset.resources, current.resources);
    assert.equal(reset.resumeLevel, 1);
    assert.equal((await server.scores(id)).find(row => row.isYou)?.score, best);
    process.env.VERCEL_ENV = "production";
    try { await assert.rejects(server.buyUpgrade(id, reset.epoch, "blaster", 1)); }
    finally { delete process.env.VERCEL_ENV; }
    await db.query("UPDATE olympus_progress SET furthest_level = 20 WHERE player_id = $1", [id]);
    const next = await server.buyUpgrade(id, reset.epoch, "blaster", 1);
    assert.equal(next.resources.marble, reset.resources.marble - 20000);
    assert.equal(next.resources.upgrades.blaster, 1);
    assert.equal(next.resources.lifetimeMarble, reset.resources.lifetimeMarble);
    await assert.rejects(server.buyUpgrade(id, saved.epoch, "shield", 2));
    await db.query("UPDATE olympus_progress SET furthest_level = 100, hull_level = 3 WHERE player_id = $1", [id]);
    await assert.rejects(server.buyUpgrade(id, reset.epoch, "hull", 4));
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

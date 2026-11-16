import assert from "node:assert/strict";
import { test } from "node:test";
import { loadTs } from "./load-ts.mjs";
const g = loadTs("src/components/games/olympus/olympus.ts");
const { LEVELS, parseProgress, progressAt } = loadTs("src/lib/games/olympus/levels.ts");
const input = { left: false, right: false, thrust: false, fire: false };
const dt = 1 / 60;
function world(level, touch = false) {
  const w = touch ? 667 : 1280, h = touch ? 320 : 764;
  const result = g.createWorld({ w, h, level, touch, phoneMode: touch,
    statue: g.createStatue({ x: w * .4, y: h * .5, w: w * .22, h: h * .5 }, 16, 18, Array(288).fill(1)),
    random: g.seededRandom(42), particleScale: 0 });
  result.phase = "boss"; result.statue.wake = 1; result.rocks = [];
  result.ship.x = 90; result.ship.y = 75; result.ship.safe = 10000;
  return result;
}
function advance(w, seconds) { for (let i = 0; i < Math.ceil(seconds / dt); i++) g.step(w, input, dt); }

test("encounters use deliberate health tuning, three lives and unchanged original health thresholds", () => {
  for (const level of LEVELS) {
    const w = world(level.id);
    assert.equal(w.lives, 3); assert.equal(w.statue.hp, level.id === 1 ? 38 : 48);
    w.statue.hp = 20; assert.equal(g.bossStage(w), 2);
    w.statue.hp = 9; assert.equal(g.bossStage(w), 3);
  }
  assert.equal(g.TUNING.boss.runSpeedUp, undefined);
  assert.equal(g.TUNING.boss.laserAtPerRun, undefined);
  assert.equal(world(100).level, 1);
});

function until(w, predicate, limit = 2400) {
  for (let i = 0; i < limit; i++) { g.step(w, input, dt); if (predicate(w)) return; }
  assert.fail(`Level ${w.level} never reached the expected state`);
}

test("multi-wave powers warn before every launch, respect budgets, and finish with recovery", () => {
  for (const touch of [false, true]) for (const { id } of LEVELS.slice(1)) {
    const w = world(id, touch);
    let warningFrames = 0, launches = 0, recovered = false;
    for (let frame = 0; frame < 60 * 30; frame++) {
      const before = w.attack.state;
      g.step(w, input, dt);
      if (w.attack.state === "warn") warningFrames++;
      if (before === "warn" && w.attack.state === "active") {
        assert.ok(warningFrames >= Math.floor(g.powerWarning(w) / dt) - 1);
        warningFrames = 0; launches++;
      }
      assert.equal(w.statue.laser, null);
      assert.equal(w.statue.windup, 0);
      assert.ok(w.rocks.length <= g.hazardLimit(w));
      assert.ok(w.rocks.every(r => r.power && !r.thrown && r.size === 2 && r.life > 0));
      if (before === "active" && w.attack.state === "rest") {
        recovered = true;
        assert.equal(w.rocks.length, 0);
        assert.equal(w.attack.t, touch ? g.TUNING.powers.touchRecovery : g.TUNING.powers.recovery);
      }
    }
    assert.ok(launches >= 4); assert.ok(recovered);
  }
});

test("swarm fires three warned, alternating shoulder waves and fragments never split", () => {
  for (const touch of [false, true]) {
    const w = world(2, touch), origins = [];
    for (let wave = 0; wave < 3; wave++) {
      until(w, w => w.attack.state === "warn" && w.attack.wave === wave);
      origins.push(w.attack.x);
      const locked = w.attack.angle;
      advance(w, .2); assert.equal(w.attack.angle, locked);
      until(w, w => w.attack.state === "active" && w.attack.wave === wave);
      if (wave === 0) {
        assert.equal(w.rocks.length, touch ? 3 : 4);
        const rock = w.rocks[0], count = w.rocks.length;
        w.bullets = [{ x: rock.x + rock.vx * dt, y: rock.y + rock.vy * dt, vx: 0, vy: 0, life: 1 }];
        g.step(w, input, dt);
        assert.equal(w.rocks.length, count - 1); assert.equal(w.score, 100);
      }
    }
    assert.ok(origins[1] > origins[0] && origins[1] > origins[2]);
  }
});

test("halo gap is offset from the player and shifts for the second warned ring", () => {
  const w = world(3, true);
  until(w, w => w.attack.state === "warn");
  const first = w.attack.angle;
  const playerAngle = Math.atan2(w.ship.y - w.attack.y, w.ship.x - w.attack.x);
  assert.ok(Math.abs(first - playerAngle) > Math.PI * .2);
  until(w, w => w.attack.state === "warn" && w.attack.wave === 1);
  assert.ok(Math.abs(w.attack.angle - first) > .6);
});

test("rain targets the occupied lane, locks its warning, and leaves an adjacent escape lane", () => {
  for (const touch of [true, false]) for (let lane = 0; lane < 5; lane++) {
    const w = world(4, touch);
    w.ship.x = (lane + .5) * w.w / 5;
    until(w, w => w.attack.state === "warn");
    const lanes = [...w.attack.lanes];
    assert.ok(lanes.includes(lane));
    assert.ok(!lanes.includes((lane + 1) % 5));
    const warnedX = w.attack.targetX;
    w.ship.x = (lane + .8) * w.w / 5;
    advance(w, .25);
    assert.deepEqual(w.attack.lanes, lanes); assert.equal(w.attack.targetX, warnedX);
    until(w, w => w.attack.state === "active");
    assert.ok(w.rocks.length >= 4);
  }
  const stationary = world(4); stationary.ship.safe = 0;
  advance(stationary, 5);
  assert.ok(stationary.lives < 3, "the storm must punish remaining at its warned target");
});

test("armour absorbs shots without free boss damage; surviving shields warn then launch", () => {
  const w = world(5);
  until(w, w => w.attack.state === "active");
  const rock = w.rocks[0], count = w.rocks.length;
  const radius = g.orbitRadius(w), angle = rock.orbit + dt * 1.1;
  w.bullets = [{ x: w.attack.x + Math.cos(angle) * radius, y: w.attack.y + Math.sin(angle) * radius, vx: 0, vy: 0, life: 1 }];
  g.step(w, input, dt);
  assert.equal(w.statue.hp, 48); assert.equal(w.rocks.length, count - 1);
  until(w, w => w.attack.state === "warn" && w.attack.wave === 1);
  const shield = w.rocks[0]; const pos = {x: shield.x, y: shield.y, angle: shield.launchAngle};
  advance(w, .25);
  assert.equal(shield.x, pos.x); assert.equal(shield.y, pos.y);
  until(w, w => w.attack.state === "active" && w.attack.wave === 1);
  assert.equal(shield.orbit, undefined);
  assert.ok(Math.hypot(shield.vx, shield.vy) > 0);
  assert.equal(shield.launchAngle, pos.angle);
});

test("laser reverses only after a full warning, then alternates its next starting direction", () => {
  const w = world(6, true);
  until(w, w => w.attack.state === "active");
  const start = g.sweepAngle(w), firstDirection = w.attack.direction;
  advance(w, 1); const middle = g.sweepAngle(w);
  assert.equal(Math.sign(middle - start), firstDirection);
  until(w, w => w.attack.state === "warn" && w.attack.wave === 1);
  const centre = w.attack.angle; const returnStart = g.sweepAngle(w);
  w.ship.x += 50;
  advance(w, .3); assert.equal(w.attack.angle, centre);
  until(w, w => w.attack.state === "active" && w.attack.wave === 1);
  advance(w, 1);
  assert.equal(Math.sign(g.sweepAngle(w) - returnStart), -firstDirection);
  until(w, w => w.attack.state === "rest");
  until(w, w => w.attack.state === "warn");
  assert.equal(w.attack.direction, -firstDirection);
});

test("death and victory clear active hazards before another attempt (resize keeps them)", () => {
  for (const { id } of LEVELS.slice(1)) {
    const w = world(id); advance(w, 2.8);
    const state = w.attack.state;
    g.resize(w, 844, 390, { x: 350, y: 190, w: 140, h: 200 });
    assert.equal(w.attack.state, state);
    w.ship.safe = 0;
    w.rocks = [{ x: w.ship.x, y: w.ship.y, vx: 0, vy: 0, r: 20, size: 2, angle: 0, spin: 0, shape: [1,1,1] }];
    g.step(w, input, dt);
    assert.equal(w.lives, 2); assert.equal(w.rocks.length, 0); assert.equal(w.attack.state, "rest");
    w.ship.alive = true; w.ship.safe = 100; w.statue.hp = 1;
    const tile = w.statue.tiles.find(t => t.attached && t.solid);
    const p = g.tileOrigin(w.statue, tile);
    w.bullets = [{ x: p.x + p.w / 2, y: p.y + p.h / 2, vx: 0, vy: 0, life: 1 }];
    g.step(w, input, dt);
    assert.equal(w.phase, "crumbling"); assert.equal(w.rocks.length, 0);
    advance(w, 3); assert.equal(w.phase, "won");
  }
});

test("progress validates fields, ignores legacy streaks and migrates a smaller completed catalogue", () => {
  assert.deepEqual(parseProgress(progressAt(2)), progressAt(2));
  assert.equal(parseProgress(progressAt(6)).resumeLevel, 6);
  assert.equal(parseProgress({ ...progressAt(2), resumeLevel: 2, completed: true }).resumeLevel, 3);
  for (const value of [null, {}, { run: 100 }, { ...progressAt(), version: 2 },
    { ...progressAt(), resumeLevel: 100 }, { ...progressAt(), highestCompletedLevel: 1.5 },
    { ...progressAt(), completed: "yes" }, { ...progressAt(), epoch: "fake" },
    { ...progressAt(2), resumeLevel: 4 }]) assert.throws(() => parseProgress(value));
});

test("guest saves handle corruption/blocked storage and never touch best score or legacy streak", async () => {
  const client = loadTs("src/lib/games/olympus/client.ts");
  const values = new Map([["isyraf98:olympus-best", "12000"], ["isyraf98:olympus-best-run", "100"]]);
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  try {
    assert.equal(client.guestProgress().progress.resumeLevel, 1);
    assert.match(client.saveGuest(progressAt(2)), /saved/);
    assert.equal(client.guestProgress().progress.resumeLevel, 3);
    await client.startOver(progressAt(2));
    assert.equal(client.guestProgress().progress.resumeLevel, 1);
    assert.equal(values.get("isyraf98:olympus-best"), "12000");
    assert.equal(values.get("isyraf98:olympus-best-run"), "100");
    values.set("isyraf98:olympus-progress:v1", "broken JSON");
    assert.equal(client.guestProgress().progress.resumeLevel, 1);
    assert.match(client.guestProgress().notice, /could not be read/);
    globalThis.localStorage = { getItem() { throw Error(); }, setItem() { throw Error(); } };
    assert.match(client.saveGuest(progressAt(2)), /only kept while/);
    await assert.rejects(client.startOver(progressAt(2)), /Could not reset/);
    assert.equal(client.guestProgress().progress.resumeLevel, 1);
  } finally { delete globalThis.localStorage; }
});

test("victory starts saving immediately, shares duplicate requests, and allows a failed save to retry", async () => {
  const client = loadTs("src/lib/games/olympus/client.ts");
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async (_url, options) => {
    calls++;
    assert.equal(options.keepalive, true);
    return new Response(JSON.stringify(calls === 1 ? { error: "Temporary failure" } : { progress: progressAt(1) }),
      { status: calls === 1 ? 503 : 200, headers: { "Content-Type": "application/json" } });
  };
  try {
    const submission = client.finishRankedAttempt(Promise.resolve({ ticket: { token: "a".repeat(64), level: 1 }, error: null }),
      { score: 12000, durationMs: 60000, outcome: "won" });
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(calls, 1); // No Next level click was needed.
    const [a, b] = await Promise.all([submission.record(), submission.record()]);
    assert.equal(calls, 2);
    assert.equal(a.resumeLevel, 2); assert.deepEqual(a, b);
  } finally { globalThis.fetch = originalFetch; }
});

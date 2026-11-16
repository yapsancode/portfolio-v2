// Level 2 · Marble Fist, and the shared Last Stand rules it proves.
import assert from "node:assert/strict";
import { test } from "node:test";
import { dt, FINALE, finaleWorld, g, idle, still, survives, untilState } from "../olympus-finale.mjs";
import { loadTs } from "../load-ts.mjs";
const { finaleFor } = loadTs("src/components/games/olympus/finales/index.ts");

/** Reads the gold lane only: if inside it, steer straight out of the nearer edge. */
const leaveLane = (world, run) => {
  const s = run.data;
  if (run.state !== "warn" && run.state !== "active") return { x: 0, y: 0 };
  const dx = world.ship.x - s.x, dy = world.ship.y - s.y;
  const along = dx * Math.cos(s.angle) + dy * Math.sin(s.angle);
  const off = dy * Math.cos(s.angle) - dx * Math.sin(s.angle);
  if (along < -s.r || Math.abs(off) > s.r + 30) return { x: 0, y: 0 };
  const side = off >= 0 ? 1 : -1;
  return { x: -Math.sin(s.angle) * side, y: Math.cos(s.angle) * side };
};
const shotAt = (world, at) => world.bullets.push({ x: at.x, y: at.y, vx: 0, vy: 0, life: 1 });

test("Marble Fist: a bot that only reads the lane is never hit on a short phone", () => {
  survives(2, leaveLane);
});

test("the Last Stand starts once at 35% health, and its reveal swallows shots and cannot hurt", () => {
  const w = finaleWorld(2);
  // A leftover fragment sits on the ship: it flies home without hurting.
  w.rocks.push({ x: w.ship.x, y: w.ship.y, vx: 0, vy: 0, r: 13, size: 2, angle: 0, spin: 0, shape: [1, 1, 1], power: true });
  const first = g.step(w, still, dt);
  assert.deepEqual(first.filter((e) => e.type === "lastStand").map((e) => e.name), ["Marble Fist"]);
  assert.equal(w.finale.state, "reveal");
  const hp = w.statue.hp;
  for (let i = 0; i < 20; i++) {
    shotAt(w, g.eyePoint(w.statue));
    const events = g.step(w, still, dt);
    assert.ok(!events.some((e) => e.type === "shipLost" || e.type === "statueHit" || e.type === "lastStand"));
  }
  assert.equal(w.statue.hp, hp);
  untilState(w, "warn");
  assert.equal(w.rocks.length, 0, "the fragments are gone before the fist forms");
  shotAt(w, g.eyePoint(w.statue));
  g.step(w, still, dt);
  assert.equal(w.statue.hp, hp - 1, "after the reveal the statue can be hurt again");
});

test("levels without a finale yet keep their normal cycle at low health", (t) => {
  // Whichever levels are still without one, so this test never needs moving as finales ship.
  const level = [2, 3, 4, 5, 6].find((l) => !finaleFor(l));
  if (!level) { t.skip("every power has its finale"); return; }
  const w = finaleWorld(level);
  for (let i = 0; i < 120; i++) g.step(w, still, dt);
  assert.equal(w.finale, null);
  assert.notEqual(w.attack.state, "rest");
});

test("Marble Fist: the punch follows the locked lane, and a miss keeps the damage done", () => {
  const w = finaleWorld(2);
  w.ship.x = 80; w.ship.y = 60;
  untilState(w, "warn");
  const { angle } = w.finale.data;
  w.ship.x = 600; w.ship.y = 60; // moving after the lock does not turn the punch
  untilState(w, "active");
  const fist = w.finale.data.rock;
  assert.ok(Math.abs(Math.atan2(fist.vy, fist.vx) - angle) < 1e-9);
  shotAt(w, fist);
  const score = w.score;
  g.step(w, still, dt);
  assert.equal(w.score, score + 100, "a hit chips off bonus marble");
  untilState(w, "rest");
  assert.equal(w.finale.data.hp, 7);
  assert.equal(w.rocks.length, 0);
  untilState(w, "active");
  assert.equal(w.finale.data.rock.hp, 7);
});

test("Marble Fist: hugging the shoulder is not a safe spot, and the fist never starts inside the spawn bubble", () => {
  const w = finaleWorld(2);
  untilState(w, "warn");
  const s = w.finale.data;
  w.ship.x = s.x + 20; w.ship.y = s.y - 10; w.ship.vx = w.ship.vy = 0;
  let lost = false, start = null;
  for (let i = 0; i < 240 && !lost; i++) {
    lost = g.step(w, still, dt).some((e) => e.type === "shipLost");
    start ??= w.finale.data.rock && Math.hypot(w.finale.data.rock.x - w.ship.x, w.finale.data.rock.y - w.ship.y);
  }
  assert.ok(start >= 59, `the fist started ${start}px from the ship`);
  assert.ok(lost, "a ship that stays in the lane at the shoulder is punched");
});

test("Marble Fist: breaking the fist stuns the statue, then the finale carries on", () => {
  const w = finaleWorld(2);
  w.ship.x = 80; w.ship.y = 60;
  untilState(w, "active");
  const events = [];
  for (let i = 0; i < 9 && w.finale.state === "active"; i++) {
    const fist = w.finale.data.rock;
    if (fist) shotAt(w, fist);
    events.push(...g.step(w, still, dt));
  }
  assert.equal(events.filter((e) => e.type === "statueStunned").length, 1);
  assert.equal(w.finale.state, "stun");
  // Stunned: no attack for two seconds, and the statue takes damage.
  const hp = w.statue.hp;
  shotAt(w, g.eyePoint(w.statue));
  for (let i = 0; i < Math.floor(FINALE.stun / dt) - 2; i++) {
    g.step(w, still, dt);
    assert.equal(w.finale.state, "stun");
    assert.equal(w.rocks.length, 0);
  }
  assert.equal(w.statue.hp, hp - 1);
  untilState(w, "active");
  assert.equal(w.finale.data.rock.hp, 8, "a new fist starts whole");
});

test("a ship lost during the Last Stand restarts it quietly, and winning clears it", () => {
  const w = finaleWorld(2);
  w.ship.x = 80; w.ship.y = 60;
  untilState(w, "active");
  const fist = w.finale.data.rock;
  w.ship.x = fist.x; w.ship.y = fist.y;
  const events = g.step(w, still, dt);
  assert.ok(events.some((e) => e.type === "shipLost"));
  assert.equal(w.finale.state, "rest");
  assert.equal(w.rocks.length, 0);
  const later = untilState(w, "active", { ...idle, joystick: { x: 0, y: -1 } });
  assert.ok(!later.some((e) => e.type === "lastStand"), "no second reveal");
  w.statue.hp = 1;
  shotAt(w, g.eyePoint(w.statue));
  g.step(w, still, dt);
  assert.equal(w.phase, "crumbling");
  assert.equal(w.finale, null);
  assert.equal(w.rocks.length, 0);
});

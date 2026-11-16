// Level 3 · Closing Crown.
import assert from "node:assert/strict";
import { test } from "node:test";
import { loadTs } from "../load-ts.mjs";
import { dt, finaleWorld, g, still, survives, untilState } from "../olympus-finale.mjs";

const { ringPoint } = loadTs("src/components/games/olympus/finales/halo.ts");

/**
 * Reads the gap and the ring size only. Outside the ring: wait, it only moves away.
 * Inside: line up with the gap (staying clear of the ring), then fly out through it.
 */
const flyOut = (world, run) => {
  const s = run.data, { ship } = world;
  if (run.state !== "warn" && run.state !== "active") return { x: 0, y: 0 };
  const c = ringPoint(world, s, 0, 0), gap = ringPoint(world, s, s.gap, 1);
  const length = Math.hypot(gap.x - c.x, gap.y - c.y);
  const dx = ship.x - c.x, dy = ship.y - c.y;
  const k = Math.hypot(dx / (dx < 0 ? s.left : s.right), dy / (dy < 0 ? s.up : s.down));
  if (k > s.k + 45 / length) return { x: 0, y: 0 };
  const line = (at) => ({ x: c.x + (gap.x - c.x) * at, y: c.y + (gap.y - c.y) * at });
  const here = line(k);
  const target = Math.hypot(here.x - ship.x, here.y - ship.y) < 20
    ? line(s.k + 0.4)
    : line(Math.max(0.05, Math.min(k, s.k - 50 / length)));
  const tx = target.x - ship.x, ty = target.y - ship.y, d = Math.hypot(tx, ty) || 1;
  const speed = Math.min(1, d / 20);
  return { x: (tx / d) * speed, y: (ty / d) * speed };
};
const shotAt = (world, at) => world.bullets.push({ x: at.x, y: at.y, vx: 0, vy: 0, life: 1 });
const corner = (world) => { world.ship.x = 15; world.ship.y = 15; };

test("Closing Crown: a bot that only reads the gap and the ring size is never hit on a short phone", () => {
  survives(3, flyOut);
});

test("Closing Crown: a ship anywhere inside that waits out the warning still gets out through the gap", () => {
  for (let seed = 1; seed <= 30; seed++) {
    const w = finaleWorld(3, seed), place = g.seededRandom(seed + 2000);
    g.step(w, still, dt);
    const s = w.finale.data;
    Object.assign(w.ship, ringPoint(w, s, place(), 0.15 + place() * 0.75));
    let launched = false;
    for (let i = 0; i < 900 && !(launched && w.finale.state !== "active"); i++) {
      // Still until the pieces appear, so the gap is the only way out.
      const joystick = w.finale.state === "active" ? flyOut(w, w.finale) : { x: 0, y: 0 };
      const events = g.step(w, { ...still, joystick }, dt);
      assert.ok(!events.some((e) => e.type === "shipLost"), `seed ${seed}: hit at ${w.time.toFixed(2)}s`);
      launched ||= w.finale.state === "active";
    }
    assert.equal(w.finale.state, "rest", `seed ${seed}: the ring closed`);
  }
});

test("Closing Crown: reveal, then a locked warning where nothing hurts, then the ring, with the gap always on screen", () => {
  const w = finaleWorld(3);
  const first = g.step(w, still, dt);
  assert.deepEqual(first.filter((e) => e.type === "lastStand").map((e) => e.name), ["Closing Crown"]);
  assert.equal(w.finale.state, "reveal");
  untilState(w, "warn");
  const { gap } = w.finale.data;
  while (w.finale.state === "warn") {
    assert.equal(w.rocks.length, 0, "nothing exists to hurt during the warning");
    assert.equal(w.finale.data.gap, gap, "the gap is locked");
    g.step(w, still, dt);
  }
  assert.equal(w.finale.state, "active");
  const s = w.finale.data;
  assert.ok(s.pieces.length > 0 && s.pieces.length <= 24);
  assert.equal(w.rocks.length, s.pieces.length);
  for (const { rock } of s.pieces) assert.ok(Math.hypot(rock.x - w.ship.x, rock.y - w.ship.y) >= 60, "no piece starts on the ship");
  // A still ship is caught by the ring: the gap starts beside it and turns away.
  let lost = false;
  for (let i = 0; i < 400 && !lost && w.finale.state === "active"; i++) {
    const at = ringPoint(w, s, s.gap);
    assert.ok(at.x >= 0 && at.x <= w.w && at.y >= 0 && at.y <= w.h, `gap off screen at ${at.x},${at.y}`);
    lost = g.step(w, still, dt).some((e) => e.type === "shipLost");
  }
  assert.ok(lost, "standing still is not safe");
});

test("Closing Crown: a ship outside the ring is safe, and a ring that closes unbroken dissolves with nothing left", () => {
  const w = finaleWorld(3);
  corner(w);
  untilState(w, "active");
  const s = w.finale.data;
  // Three pieces broken is one short of the crown.
  for (const { rock } of s.pieces.slice(0, 3)) shotAt(w, rock);
  const events = untilState(w, "rest");
  assert.equal(s.broken, 3);
  assert.ok(!events.some((e) => e.type === "shipLost" || e.type === "statueStunned"));
  assert.equal(w.rocks.length, 0);
  assert.equal(s.pieces.length, 0);
});

test("Closing Crown: breaking 4 pieces crowns the statue and stuns it exactly once", () => {
  const w = finaleWorld(3);
  corner(w);
  untilState(w, "active");
  for (const { rock } of w.finale.data.pieces.slice(0, 4)) shotAt(w, rock);
  const events = untilState(w, "stun");
  assert.equal(events.filter((e) => e.type === "statueStunned").length, 1);
  assert.equal(w.rocks.length, 0, "the crown is drawn, not left as rocks");
  const later = untilState(w, "active");
  assert.ok(!later.some((e) => e.type === "statueStunned"));
  assert.equal(w.finale.data.broken, 0, "a new ring starts whole");
});

test("Closing Crown: a ship lost during the ring restarts it quietly", () => {
  const w = finaleWorld(3);
  corner(w);
  untilState(w, "active");
  const { rock } = w.finale.data.pieces[0];
  w.ship.x = rock.x; w.ship.y = rock.y;
  const events = g.step(w, still, dt);
  assert.ok(events.some((e) => e.type === "shipLost"));
  assert.equal(w.finale.state, "rest");
  assert.equal(w.rocks.length, 0);
  const later = untilState(w, "active");
  assert.ok(!later.some((e) => e.type === "lastStand"), "no second reveal");
  assert.ok(w.finale.data.pieces.length > 0);
});

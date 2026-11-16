// Level 6 · Double Vision: two beams close like scissors on one green pocket.
import assert from "node:assert/strict";
import { test } from "node:test";
import { loadTs } from "../load-ts.mjs";
import { dt, finaleWorld, g, idle, still, survives, untilState } from "../olympus-finale.mjs";

const { eyeAt } = loadTs("src/components/games/olympus/finales/gaze.ts");
const lost = (events) => events.some((e) => e.type === "shipLost");
const stuns = (events) => events.filter((e) => e.type === "statueStunned").length;
const SEEDS = 30;

/** Reads the locked pocket only: fly straight at its centre, never round the screen edge. */
const toPocket = (world, run) => {
  if (run.state !== "warn" && run.state !== "active") return { x: 0, y: 0 };
  const s = run.data, tx = s.x - world.ship.x, ty = s.y - world.ship.y, d = Math.hypot(tx, ty) || 1;
  const speed = Math.min(1, d / 20);
  return { x: (tx / d) * speed, y: (ty / d) * speed };
};
const bot = (world) => ({ ...idle, joystick: toPocket(world, world.finale) });

/** From the warning to the end of the pass with the ship pinned at a spot (a function of the world); returns every event. */
function parked(world, spot) {
  const events = [];
  for (let i = 0; i < 60 * 10 && (world.finale.state === "warn" || world.finale.state === "active"); i++) {
    const { x, y } = spot(world);
    Object.assign(world.ship, { x, y, vx: 0, vy: 0 });
    events.push(...g.step(world, still, dt));
  }
  return events;
}

test("Double Vision: a bot that only reads the locked pocket is never hit on a short phone", () => {
  survives(6, toPocket);
});

test("Double Vision: no still ship is safe outside the pocket: corners, centre, beside the head", () => {
  const spots = [
    () => ({ x: 2, y: 2 }), () => ({ x: 665, y: 2 }), () => ({ x: 2, y: 318 }), () => ({ x: 665, y: 318 }),
    () => ({ x: 333.5, y: 160 }),
    (w) => { const e = eyeAt(w, w.finale.data, 0); return { x: e.x - 24, y: e.y }; },
    (w) => { const e = eyeAt(w, w.finale.data, 1); return { x: e.x + 24, y: e.y }; },
  ];
  for (let seed = 1; seed <= SEEDS; seed++) {
    for (const [n, spot] of spots.entries()) {
      const w = finaleWorld(6, seed);
      untilState(w, "warn");
      assert.ok(lost(parked(w, spot)), `seed ${seed}: a ship parked at spot ${n} was never hit`);
    }
  }
});

test("Double Vision: a ship parked anywhere in the locked pocket is never hit, and the pass ends in a stun", () => {
  for (let seed = 1; seed <= SEEDS; seed++) {
    for (const [ox, oy] of [[0, 0], [-0.8, 0], [0.8, 0], [0, -0.8], [0, 0.8]]) {
      const w = finaleWorld(6, seed);
      untilState(w, "warn");
      const s = w.finale.data;
      const events = parked(w, () => ({ x: s.x + ox * 28, y: s.y + oy * 28 }));
      assert.ok(!lost(events), `seed ${seed}: hit in the pocket at ${ox},${oy}`);
      assert.equal(w.finale.state, "stun");
    }
  }
});

test("Double Vision: nothing hurts during the warning, and the pocket stays locked", () => {
  for (let seed = 1; seed <= SEEDS; seed++) {
    const w = finaleWorld(6, seed);
    untilState(w, "warn");
    const { x, y } = w.finale.data;
    for (let i = 0; w.finale.state === "warn"; i++) {
      // Sweep the ship over the whole screen while the warning runs.
      Object.assign(w.ship, { x: (i * 97) % w.w, y: (i * 41) % w.h, vx: 0, vy: 0 });
      assert.ok(!lost(g.step(w, still, dt)), `seed ${seed}: hit during the warning`);
      assert.deepEqual([w.finale.data.x, w.finale.data.y], [x, y], "the pocket is locked");
    }
    assert.equal(w.finale.state, "active");
  }
});

test("Double Vision: from any corner or edge the pocket is reached in time at phone speed, after a 0.2 s reaction", () => {
  const starts = [[12, 12], [655, 12], [12, 308], [655, 308], [333.5, 308], [12, 160], [655, 160], [333.5, 12]];
  for (let seed = 1; seed <= SEEDS; seed++) {
    for (const [x, y] of starts) {
      const w = finaleWorld(6, seed);
      untilState(w, "warn");
      Object.assign(w.ship, { x, y, vx: 0, vy: 0 });
      for (let i = 0; w.finale.state === "warn" || w.finale.state === "active"; i++) {
        const events = g.step(w, i * dt < 0.2 ? still : bot(w), dt);
        assert.ok(!lost(events), `seed ${seed}: hit from ${x},${y} at ${w.time.toFixed(2)}s`);
      }
    }
  }
});

test("Double Vision: every completed pass stuns exactly once", () => {
  const w = finaleWorld(6);
  g.step(w, still, dt);
  for (let pass = 0; pass < 3; pass++) {
    const events = [];
    while (w.finale.state !== "active") events.push(...g.step(w, bot(w), dt));
    while (w.finale.state === "active") events.push(...g.step(w, bot(w), dt));
    assert.ok(!lost(events));
    assert.equal(stuns(events), 1, `pass ${pass}`);
    assert.equal(w.finale.state, "stun");
  }
});

test("Double Vision: a ship lost mid-pass restarts the finale quietly, with no stun from that pass", () => {
  const w = finaleWorld(6);
  untilState(w, "warn");
  // Straight below the head, where both beams start.
  const events = parked(w, (world) => { const e = eyeAt(world, world.finale.data, 0); return { x: e.x, y: e.y + 60 }; });
  assert.ok(lost(events));
  assert.equal(stuns(events), 0);
  assert.equal(w.finale.state, "rest");
  const later = untilState(w, "active");
  assert.ok(!later.some((e) => e.type === "lastStand"), "no second reveal");
  const rest = [];
  while (w.finale.state === "active") rest.push(...g.step(w, bot(w), dt));
  assert.equal(stuns(rest), 1, "the next pass works");
});

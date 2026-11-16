// Level 3 · Closing Crown.
import assert from "node:assert/strict";
import { test } from "node:test";
import { loadTs } from "../load-ts.mjs";
import { dt, finaleWorld, g, still, survives, untilState } from "../olympus-finale.mjs";

const { gapAt, ringPoint, ringSize } = loadTs("src/components/games/olympus/finales/halo.ts");

/**
 * Reads the gap and the ring size only. Once the ring has passed: wait, it only moves away.
 * Before: stand on the gap's line, where the gap is wide and on screen, and follow it as it turns.
 */
const waitInGap = (world, run) => {
  if (run.state !== "warn" && run.state !== "active") return { x: 0, y: 0 };
  const s = run.data, { ship } = world;
  const k = ringSize(world, s, ship.x, ship.y);
  if (k > s.k) return { x: 0, y: 0 };
  const c = ringPoint(world, s, 0, 0), gap = ringPoint(world, s, s.gap, 1);
  const line = (at) => ({ x: c.x + (gap.x - c.x) * at, y: c.y + (gap.y - c.y) * at });
  const onScreen = (p) => p.x > 20 && p.x < world.w - 20 && p.y > 20 && p.y < world.h - 20;
  let at = Math.max(0.25, Math.min(k, 0.5));
  while (at > 0.1 && !onScreen(line(at))) at -= 0.02;
  const target = line(at);
  const tx = target.x - ship.x, ty = target.y - ship.y, d = Math.hypot(tx, ty) || 1;
  const speed = Math.min(1, d / 20);
  return { x: (tx / d) * speed, y: (ty / d) * speed };
};
const bot = (world) => ({ ...still, joystick: waitInGap(world, world.finale) });
const shotAt = (world, at) => world.bullets.push({ x: at.x, y: at.y, vx: 0, vy: 0, life: 1 });
const onScreen = (world, p) => p.x >= 0 && p.x <= world.w && p.y >= 0 && p.y <= world.h;

/** Play with the bot until `count` pieces are on screen; returns them. */
function piecesOnScreen(world, count) {
  for (let i = 0; i < 600; i++) {
    const seen = world.finale.data.pieces.filter(({ rock }) => world.rocks.includes(rock) && onScreen(world, rock));
    if (seen.length >= count) return seen.slice(0, count).map((p) => p.rock);
    g.step(world, bot(world), dt);
  }
  assert.fail("the pieces never came on screen");
}
const shootPieces = (world, count) => piecesOnScreen(world, count).forEach((rock) => shotAt(world, rock));

test("Closing Crown: a bot that only reads the gap and the ring size is never hit on a short phone", () => {
  survives(3, waitInGap);
});

test("Closing Crown: no still ship is safe, in any corner or the middle, without the gap", () => {
  for (let seed = 1; seed <= 30; seed++) {
    for (const [x, y] of [[2, 2], [665, 2], [2, 318], [665, 318], [333.5, 160]]) {
      const w = finaleWorld(3, seed);
      untilState(w, "warn");
      Object.assign(w.ship, { x, y, vx: 0, vy: 0 });
      let lost = false;
      for (let i = 0; i < 600 && !lost; i++) lost = g.step(w, still, dt).some((e) => e.type === "shipLost");
      assert.ok(lost, `seed ${seed}: a ship parked at ${x},${y} was never hit`);
    }
  }
});

test("Closing Crown: the green path tells the truth: a still ship parked on it is in the gap when the ring passes", () => {
  for (let seed = 1; seed <= 30; seed++) {
    for (const k of [0.3, 0.45, 0.6]) {
      const w = finaleWorld(3, seed);
      untilState(w, "warn");
      const s = w.finale.data, at = ringPoint(w, s, gapAt(s, k), k);
      if (!onScreen(w, at)) continue;
      Object.assign(w.ship, { x: at.x, y: at.y, vx: 0, vy: 0 });
      let launched = false;
      for (let i = 0; i < 900 && !(launched && w.finale.state !== "active"); i++) {
        assert.ok(!g.step(w, still, dt).some((e) => e.type === "shipLost"), `seed ${seed}: parked at k=${k}, hit`);
        launched ||= w.finale.state === "active";
      }
    }
  }
});

test("Closing Crown: a ship anywhere inside that waits out the warning still gets out through the gap", () => {
  for (let seed = 1; seed <= 30; seed++) {
    const w = finaleWorld(3, seed), place = g.seededRandom(seed + 2000);
    w.ship.x = 20 + place() * (w.w - 40);
    w.ship.y = 20 + place() * (w.h - 40);
    let launched = false;
    for (let i = 0; i < 900 && !(launched && w.finale.state !== "active"); i++) {
      // Still until the pieces appear.
      const input = w.finale?.state === "active" ? bot(w) : still;
      const events = g.step(w, input, dt);
      assert.ok(!events.some((e) => e.type === "shipLost"), `seed ${seed}: hit at ${w.time.toFixed(2)}s`);
      launched ||= w.finale.state === "active";
    }
    assert.equal(w.finale.state, "rest", `seed ${seed}: the ring closed`);
  }
});

test("Closing Crown: reveal, then a locked warning where nothing hurts, then the ring, with the gap on screen once in", () => {
  const w = finaleWorld(3);
  const first = g.step(w, still, dt);
  assert.deepEqual(first.filter((e) => e.type === "lastStand").map((e) => e.name), ["Closing Crown"]);
  assert.equal(w.finale.state, "reveal");
  untilState(w, "warn");
  const { gap } = w.finale.data;
  while (w.finale.state === "warn") {
    assert.equal(w.rocks.length, 0, "nothing exists to hurt during the warning");
    assert.equal(w.finale.data.gap, gap, "the gap is locked");
    g.step(w, bot(w), dt);
  }
  assert.equal(w.finale.state, "active");
  const s = w.finale.data;
  assert.ok(s.pieces.length > 0 && s.pieces.length <= 24);
  assert.equal(w.rocks.length, s.pieces.length);
  for (const { rock } of s.pieces) assert.ok(Math.hypot(rock.x - w.ship.x, rock.y - w.ship.y) >= 60, "no piece starts on the ship");
  let entered = false;
  while (w.finale.state === "active") {
    const at = ringPoint(w, s, s.gap);
    if (entered) assert.ok(onScreen(w, at), `the gap left the screen at ${at.x},${at.y}`);
    entered ||= onScreen(w, at);
    g.step(w, bot(w), dt);
  }
  assert.ok(entered);
});

test("Closing Crown: a ring with 3 pieces broken crumbles with nothing left", () => {
  const w = finaleWorld(3);
  untilState(w, "active");
  shootPieces(w, 3);
  const s = w.finale.data, events = [];
  while (w.finale.state === "active") events.push(...g.step(w, bot(w), dt));
  assert.equal(s.broken, 3);
  assert.equal(w.finale.state, "rest");
  assert.ok(!events.some((e) => e.type === "shipLost" || e.type === "statueStunned"));
  assert.equal(w.rocks.length, 0);
});

test("Closing Crown: breaking 4 pieces crowns the statue and stuns it exactly once", () => {
  const w = finaleWorld(3);
  untilState(w, "active");
  shootPieces(w, 4);
  const events = [];
  while (w.finale.state === "active") events.push(...g.step(w, bot(w), dt));
  assert.equal(w.finale.state, "stun");
  assert.equal(events.filter((e) => e.type === "statueStunned").length, 1);
  assert.ok(!events.some((e) => e.type === "shipLost"));
  assert.equal(w.rocks.length, 0, "the crown is drawn, not left as rocks");
  const later = untilState(w, "active");
  assert.ok(!later.some((e) => e.type === "statueStunned"));
  assert.equal(w.finale.data.broken, 0, "a new ring starts whole");
});

test("Closing Crown: a ship lost during the ring restarts it quietly", () => {
  const w = finaleWorld(3);
  untilState(w, "active");
  const [rock] = piecesOnScreen(w, 1);
  w.ship.x = rock.x; w.ship.y = rock.y; w.ship.vx = w.ship.vy = 0;
  const events = g.step(w, still, dt);
  assert.ok(events.some((e) => e.type === "shipLost"));
  assert.equal(w.finale.state, "rest");
  assert.equal(w.rocks.length, 0);
  const later = untilState(w, "active");
  assert.ok(!later.some((e) => e.type === "lastStand"), "no second reveal");
  assert.ok(w.finale.data.pieces.length > 0);
});

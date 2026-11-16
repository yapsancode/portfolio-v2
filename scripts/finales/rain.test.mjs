// Level 4 · The Sky Falls: one huge meteor over the three middle lanes.
import assert from "node:assert/strict";
import { test } from "node:test";
import { dt, finaleWorld, g, idle, still, survives, untilState } from "../olympus-finale.mjs";

const SIZES = [{ w: 667, h: 320 }, { w: 1280, h: 764 }];
const lost = (events) => events.some((e) => e.type === "shipLost");

/** Reads the warned lanes only: inside the three middle lanes, steer sideways to the nearer edge lane. */
const toEdge = (world, run) => {
  if (run.state !== "warn" && run.state !== "active") return { x: 0, y: 0 };
  const dx = world.ship.x - run.data.x;
  if (Math.abs(dx) > (world.w / 5) * 1.5 + 8) return { x: 0, y: 0 };
  return { x: dx < 0 ? -1 : 1, y: 0 };
};

/** Run one cycle from warn to its end with the ship parked at (x, y); true if it was hit. */
function parkedHit(world, x, y) {
  untilState(world, "warn");
  let hit = false;
  for (let i = 0; i < 60 * 15 && world.finale.state !== "rest"; i++) {
    world.ship.x = x; world.ship.y = y; world.ship.vx = world.ship.vy = 0;
    hit ||= lost(g.step(world, still, dt));
  }
  return hit;
}

/** Desktop play: no touch, no phone mode (bigger ship, 1.0 s warning). */
const desktop = (world) => { world.touch = false; world.phoneMode = false; return world; };

test("The Sky Falls: a bot that only reads the warned lanes is never hit on a short phone", () => {
  survives(4, toEdge);
});

test("The Sky Falls: nothing can hurt during the warning, and the meteor starts above the screen", () => {
  for (const size of SIZES) {
    const w = finaleWorld(4, 1, size);
    // Worst spot: the top of the middle lane.
    w.ship.x = size.w / 2; w.ship.y = -12;
    untilState(w, "warn");
    while (w.finale.state === "warn") {
      assert.equal(w.rocks.length, 0);
      g.step(w, still, dt);
    }
    const rock = w.finale.data.rock;
    assert.ok(rock.y + rock.r * 0.85 < 0, "the drawn meteor is still above the screen");
    assert.ok(Math.hypot(rock.x - w.ship.x, rock.y - w.ship.y) >= 60, "never inside the 60px spawn bubble");
  }
});

test("The Sky Falls: a ship in lane 0 or 4 is never hit; one in a middle lane is", () => {
  for (const size of SIZES) {
    for (const mode of [(w) => w, desktop]) {
      const lane = size.w / 5;
      for (const y of [-12, 0, size.h / 2, size.h - 10, size.h + 12]) {
        // Right at the edges of the safe lanes, and the far wall.
        for (const x of [-12, lane - 0.01, lane * 4, size.w + 12]) {
          assert.ok(!parkedHit(mode(finaleWorld(4, 1, size)), x, y), `${size.w}x${size.h} hit at ${x},${y}`);
        }
        for (const x of [lane + 6, size.w / 2, lane * 4 - 6]) {
          assert.ok(parkedHit(mode(finaleWorld(4, 1, size)), x, y), `${size.w}x${size.h} missed at ${x},${y}`);
        }
      }
    }
  }
});

test("The Sky Falls: from the middle of the screen an edge lane is reached in time at phone speed", () => {
  for (const size of SIZES) {
    for (let y = -12; y <= size.h + 12; y += 16) {
      const w = finaleWorld(4, 1, size);
      untilState(w, "warn");
      w.ship.x = size.w / 2; w.ship.y = y; w.ship.vx = w.ship.vy = 0;
      // Half a second to react, then straight left until inside lane 0.
      for (let i = 0; w.finale.state !== "rest"; i++) {
        const go = i * dt >= 0.5 && w.ship.x > size.w / 5 - 6 ? -1 : 0;
        assert.ok(!lost(g.step(w, { ...idle, joystick: { x: go, y: 0 } }, dt)), `${size.w}x${size.h} hit from y ${y}`);
      }
    }
  }
});

test("The Sky Falls: shooting it from below cracks it, stuns once and pays bonus marble", () => {
  for (const size of SIZES) {
    const w = finaleWorld(4, 1, size);
    untilState(w, "warn");
    // Under the meteor in lane 1 (clear of the statue), firing straight up.
    w.ship.x = size.w * 0.3; w.ship.y = size.h - 20; w.ship.angle = 0;
    const score = w.score, events = [];
    while (w.finale.state !== "stun") {
      const now = g.step(w, { ...idle, fire: true }, dt);
      assert.ok(!lost(now), `${size.w}x${size.h}: hit before it cracked`);
      events.push(...now);
    }
    assert.equal(events.filter((e) => e.type === "statueStunned").length, 1);
    assert.ok(w.score >= score + 9 * 100, "every chip pays bonus marble");
    assert.equal(w.rocks.length, 0, "it cracks into harmless dust");
    untilState(w, "active");
    assert.equal(w.finale.data.rock.hp, 10, "the next meteor starts whole");
  }
});

test("The Sky Falls: a meteor that reaches the bottom is removed and the cycle rests", () => {
  for (const size of SIZES) {
    const w = finaleWorld(4, 1, size);
    w.ship.x = 20; w.ship.y = size.h / 2;
    const events = untilState(w, "active");
    events.push(...untilState(w, "rest"));
    assert.equal(w.rocks.length, 0);
    assert.equal(w.finale.data.rock, null);
    assert.ok(!events.some((e) => e.type === "statueStunned" || e.type === "shipLost"));
  }
});

test("The Sky Falls: a ship lost under the meteor restarts it quietly", () => {
  const w = finaleWorld(4);
  w.ship.x = w.w / 2; w.ship.y = 0;
  untilState(w, "active");
  let hit = false;
  for (let i = 0; i < 120 && !hit; i++) hit = lost(g.step(w, still, dt));
  assert.ok(hit, "a ship parked under the meteor is hit");
  assert.equal(w.finale.state, "rest");
  assert.equal(w.rocks.length, 0);
  // The ship respawns at the top of the middle lane: leave for lane 0, then wait for the next meteor.
  const later = untilState(w, "active", { ...idle, joystick: { x: -1, y: 0 } });
  assert.ok(!later.some((e) => e.type === "lastStand"), "no second reveal");
  assert.equal(w.finale.data.rock.hp, 10);
  assert.equal(w.rocks.length, 1);
});

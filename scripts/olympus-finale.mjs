// Shared harness for Last Stand tests: a short landscape phone with the statue at its finale threshold.
import assert from "node:assert/strict";
import { loadTs } from "./load-ts.mjs";
export const g = loadTs("src/components/games/olympus/olympus.ts");
export const { FINALE } = loadTs("src/components/games/olympus/finales/types.ts");
export const dt = 1 / 60;
export const idle = { left: false, right: false, thrust: false, fire: false };
export const still = { ...idle, joystick: { x: 0, y: 0 } };

/** The statue stands on the screen bottom, centred, as in touch play. The next step starts the finale. */
export function finaleWorld(level, seed = 1, { w = 667, h = 320 } = {}) {
  const sh = h * 0.44, sw = sh * 0.92;
  const world = g.createWorld({ w, h, level, touch: true, phoneMode: true, random: g.seededRandom(seed), particleScale: 0,
    statue: g.createStatue({ x: (w - sw) / 2, y: h - sh, w: sw, h: sh }, 16, 18, Array(288).fill(1)) });
  world.phase = "boss"; world.statue.wake = 1; world.rocks = []; world.ship.safe = 0;
  world.statue.hp = Math.floor(world.statue.maxHp * FINALE.at);
  return world;
}

/** Step until the finale reaches `state`; returns every event on the way. */
export function untilState(world, state, input = still, limit = 1200) {
  const events = [];
  for (let i = 0; i < limit; i++) {
    events.push(...g.step(world, input, dt));
    if (world.finale?.state === state) return events;
  }
  assert.fail(`level ${world.level} finale never reached "${state}"`);
}

/**
 * The acceptance check. `bot(world, run)` returns a joystick vector using only what the warning shows
 * (the finale state that draw() uses). No ship may be lost over `cycles` launches, from a random start, in every seed.
 */
export function survives(level, bot, { seeds = 30, cycles = 4 } = {}) {
  for (let seed = 1; seed <= seeds; seed++) {
    const world = finaleWorld(level, seed), place = g.seededRandom(seed + 1000);
    world.ship.x = 20 + place() * (world.w - 40);
    world.ship.y = 20 + place() * (world.h - 40);
    let launches = 0, was = null;
    for (let i = 0; i < 60 * 90 && launches <= cycles; i++) {
      const run = world.finale;
      const events = g.step(world, { ...idle, joystick: run ? bot(world, run) : { x: 0, y: 0 } }, dt);
      assert.ok(!events.some((e) => e.type === "shipLost"), `level ${level} seed ${seed}: hit at ${world.time.toFixed(2)}s`);
      const now = world.finale?.state;
      if (now === "active" && was !== "active") launches++;
      was = now;
    }
    assert.ok(launches > cycles, `level ${level} seed ${seed}: only ${launches} launches`);
  }
}

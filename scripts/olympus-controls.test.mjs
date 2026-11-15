// Run with: node --test scripts/olympus-controls.test.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

async function load(name) {
  const source = readFileSync(new URL(`../src/components/game/${name}.ts`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}
const { createWorld, createStatue, seededRandom, step, TUNING } = await load("olympus");
const { joystickVector } = await load("touch-controls");
const neutral = { left: false, right: false, thrust: false, fire: false };
const makeWorld = () => createWorld({ w: 4000, h: 3000, statue: createStatue({ x: 3000, y: 2500, w: 100, h: 200 }, 1, 1, [1]), random: seededRandom(42) });
const advance = (world, joystick, frames = 60, fire = false) => {
  for (let i = 0; i < frames; i++) step(world, { ...neutral, joystick, fire }, 1 / 60);
};

test("joystick dead zone, diagonal limit and proportional travel", () => {
  assert.deepEqual(joystickVector(3, 2, 40), { x: 0, y: 0 });
  const diagonal = joystickVector(100, -100, 40);
  assert.ok(Math.abs(Math.hypot(diagonal.x, diagonal.y) - 1) < 1e-10);
  assert.ok(diagonal.x > 0 && diagonal.y < 0);
  assert.ok(joystickVector(20, 0, 40).x < joystickVector(30, 0, 40).x);
});

test("steers in all four directions and scales speed with joystick travel", () => {
  for (const [x, y, angle] of [[1, 0, Math.PI / 2], [-1, 0, -Math.PI / 2], [0, -1, 0], [0, 1, Math.PI]]) {
    const world = makeWorld();
    advance(world, { x, y });
    assert.ok(Math.abs(world.ship.angle - angle) < 1e-10);
    assert.ok(Math.abs(world.ship.vx - x * TUNING.joystick.maxSpeed) < 1);
    assert.ok(Math.abs(world.ship.vy - y * TUNING.joystick.maxSpeed) < 1);
  }
  const half = makeWorld();
  advance(half, { x: 0.5, y: 0 });
  assert.ok(Math.abs(half.ship.vx - TUNING.joystick.maxSpeed / 2) < 1);
});

test("release brakes to rest in 0.3 seconds with under 20px drift", () => {
  const world = makeWorld();
  advance(world, { x: 1, y: 0 });
  const startX = world.ship.x;
  advance(world, { x: 0, y: 0 }, 18);
  assert.equal(world.ship.vx, 0);
  assert.ok(world.ship.x - startX < 20);
  assert.equal(world.ship.thrusting, false);
});

test("reversing changes direction quickly; firing at rest creates no touch drift", () => {
  const world = makeWorld();
  advance(world, { x: 1, y: 0 });
  advance(world, { x: -1, y: 0 }, 12);
  assert.ok(world.ship.vx < -300);
  const resting = makeWorld();
  advance(resting, { x: 0, y: 0 }, 30, true);
  assert.equal(resting.ship.vx, 0);
  assert.equal(resting.ship.vy, 0);
  assert.ok(resting.bullets.length > 0);
});

test("desktop arrow turning, thrust, and drag retain their original physics", () => {
  const world = makeWorld();
  step(world, { ...neutral, right: true, thrust: true }, 1 / 60);
  const angle = TUNING.ship.turn / 60;
  const drag = Math.exp(-TUNING.ship.drag / 60);
  assert.equal(world.ship.angle, angle);
  assert.ok(Math.abs(world.ship.vx - Math.sin(angle) * TUNING.ship.thrust / 60 * drag) < 1e-10);
  assert.ok(Math.abs(world.ship.vy + Math.cos(angle) * TUNING.ship.thrust / 60 * drag) < 1e-10);
});

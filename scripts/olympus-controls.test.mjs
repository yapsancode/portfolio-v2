// Run with: node --test scripts/olympus-controls.test.mjs
import assert from "node:assert/strict";
import { test } from "node:test";
import { loadTs } from "./load-ts.mjs";
const { createWorld, createStatue, seededRandom, step, TUNING } = loadTs("src/components/games/olympus/olympus.ts");
const { joystickVector, stickFromBox } = loadTs("src/components/games/olympus/touch-controls.ts");
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

test("joystick reaches full speed only at the ring edge, and an unmeasured box never steers", () => {
  const box = { left: 0, top: 0, width: 124, height: 124 };
  const at = (dx) => stickFromBox(62 + dx, 62, box).vector.x;
  assert.ok(at(124 * 0.35) < 0.9);
  assert.ok(Math.abs(at(124 * 0.45) - 1) < 1e-10);
  assert.equal(stickFromBox(80, 80, box).thumb.x <= 124 * 0.45, true);
  for (const radius of [0, -5, NaN]) assert.deepEqual(joystickVector(10, 4, radius), { x: 0, y: 0 });
  assert.deepEqual(stickFromBox(5, 5, { left: 0, top: 0, width: 0, height: 0 }).vector, { x: 0, y: 0 });
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

test("desktop thrust follows turns without sideways drift and respects the speed limit", () => {
  const world = makeWorld();
  for (let i = 0; i < 60; i++) step(world, { ...neutral, thrust: true }, 1 / 60);
  assert.ok(Math.abs(Math.hypot(world.ship.vx, world.ship.vy) - TUNING.ship.maxSpeed) < 1e-10);
  for (const direction of ["right", "left"]) {
    const before = world.ship.angle;
    for (let i = 0; i < 10; i++) {
      step(world, { ...neutral, [direction]: true, thrust: true, fire: true }, 1 / 60);
      const speed = Math.hypot(world.ship.vx, world.ship.vy);
      assert.ok(speed <= TUNING.ship.maxSpeed + 1e-10);
      assert.ok(Math.abs(world.ship.vx / speed - Math.sin(world.ship.angle)) < 1e-10);
      assert.ok(Math.abs(world.ship.vy / speed + Math.cos(world.ship.angle)) < 1e-10);
    }
    assert.equal(Math.sign(world.ship.angle - before), direction === "right" ? 1 : -1);
  }
});

test("desktop release stops immediately; turning and firing at rest cannot move the ship", () => {
  const world = makeWorld();
  for (let i = 0; i < 60; i++) step(world, { ...neutral, thrust: true }, 1 / 60);
  const { x, y } = world.ship;
  for (let i = 0; i < 30; i++) {
    step(world, { ...neutral, right: true, fire: true }, 1 / 60);
    assert.equal(world.ship.vx, 0);
    assert.equal(world.ship.vy, 0);
    assert.equal(world.ship.x, x);
    assert.equal(world.ship.y, y);
    assert.equal(world.ship.thrusting, false);
  }
  assert.ok(world.bullets.length > 0);
  step(world, { ...neutral, thrust: true }, 1 / 60);
  assert.ok(Math.hypot(world.ship.x - x, world.ship.y - y) > 0);
  assert.ok(Math.hypot(world.ship.vx, world.ship.vy) < TUNING.ship.maxSpeed);
});

test("phones move 25% slower without changing tablet speed", () => {
  const phone = makeWorld();
  phone.phoneMode = true;
  const tablet = makeWorld();
  advance(phone, { x: 1, y: 0 });
  advance(tablet, { x: 1, y: 0 });
  assert.ok(Math.abs(phone.ship.vx - TUNING.phone.maxSpeed) < 1);
  assert.ok(Math.abs(phone.ship.vx / tablet.ship.vx - 0.75) < 1e-10);
});

test("phone collision radius matches its smaller ship", () => {
  for (const phoneMode of [false, true]) {
    const world = makeWorld();
    world.phoneMode = phoneMode;
    world.ship.safe = 0;
    world.rocks = [{ x: world.ship.x + 17, y: world.ship.y, vx: 0, vy: 0, size: 2, r: 10, angle: 0, spin: 0, shape: [1, 1, 1, 1] }];
    step(world, neutral, 1 / 60);
    assert.equal(world.ship.alive, phoneMode);
  }
});

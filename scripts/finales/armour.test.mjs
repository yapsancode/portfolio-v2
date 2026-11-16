// Level 5 · Full Plate.
import assert from "node:assert/strict";
import { test } from "node:test";
import { loadTs } from "../load-ts.mjs";
import { dt, finaleWorld, g, idle, still, survives, untilState } from "../olympus-finale.mjs";

const { FULL_PLATE } = loadTs("src/components/games/olympus/finales/armour.ts");
const { SLOTS, PLATE_HP, BREAK, SHELL } = FULL_PLATE;
const STEP = (Math.PI * 2) / SLOTS;
const lost = (events) => events.some((e) => e.type === "shipLost");
const shipR = g.TUNING.ship.radius * g.TUNING.phone.shipScale;
const turnTo = (a) => Math.atan2(Math.sin(a), Math.cos(a));
/** Clear of the shell's plates while they spin, with a margin. */
const clear = (s) => s.R + s.r * 0.85 + shipR + 20;
/** The point on the safe line the bot waits at: just outside the shell, kept on screen. */
function shelter(world, s) {
  const at = (d) => ({ x: s.x + Math.cos(s.safe) * d, y: s.y + Math.sin(s.safe) * d });
  let d = clear(s) + 10;
  while (d > clear(s) && (at(d).y < 16 || at(d).x < 16 || at(d).x > world.w - 16)) d -= 2;
  return at(d);
}

/**
 * Reads the shell centre, its size and the safe line only. Inside the shell: get out.
 * Otherwise circle round the shell to the safe line and wait on it.
 */
const hide = (world, run) => {
  if (run.state !== "warn" && run.state !== "active") return { x: 0, y: 0 };
  const s = run.data, { ship } = world;
  const dx = ship.x - s.x, dy = ship.y - s.y, d = Math.hypot(dx, dy) || 1, a = Math.atan2(dy, dx);
  if (d < clear(s)) return { x: dx / d, y: dy / d };
  const turn = turnTo(s.safe - a);
  if (Math.abs(turn) > 0.25) {
    // Round the shell, along the shortest way, holding a radius just outside it.
    const side = Math.sign(turn), out = Math.max(-1, Math.min(1, (clear(s) + 12 - d) / 20));
    const tx = -Math.sin(a) * side + Math.cos(a) * out, ty = Math.cos(a) * side + Math.sin(a) * out;
    const n = Math.hypot(tx, ty) || 1;
    return { x: tx / n, y: ty / n };
  }
  const t = shelter(world, s), tx = t.x - ship.x, ty = t.y - ship.y, n = Math.hypot(tx, ty) || 1;
  const speed = Math.min(1, n / 20);
  return { x: (tx / n) * speed, y: (ty / n) * speed };
};
const bot = (world) => ({ ...still, joystick: hide(world, world.finale) });
const plates = (w) => w.finale.data.plates.filter((p) => w.rocks.includes(p.rock));

/** Step until the shell has spun and the burst warning starts (the hole is on the safe line). */
function untilBrace(w) {
  untilState(w, "active");
  while (w.finale.data.t < SHELL) g.step(w, still, dt);
}

/** A shot from outside the shell straight at its centre, along angle `a`. */
function shootAlong(w, a) {
  const s = w.finale.data, d = s.R + s.r + 10;
  w.bullets.push({ x: s.x + Math.cos(a) * d, y: s.y + Math.sin(a) * d, vx: -Math.cos(a) * 700, vy: -Math.sin(a) * 700, life: 1 });
  const events = [];
  for (let i = 0; i < 20 && w.bullets.length; i++) events.push(...g.step(w, still, dt));
  return events;
}

test("Full Plate: a bot that only reads the shell and the safe line is never hit on a short phone", () => {
  survives(5, hide);
});

test("Full Plate: the burst leaves no safe spot in the corners or the open, away from the safe line", () => {
  const spots = [[2, 2], [665, 2], [2, 318], [665, 318], [333.5, 14], [40, 160], [627, 160], [150, 300], [520, 300], [120, 60], [550, 60]];
  let checked = 0;
  for (let seed = 1; seed <= 30; seed++) {
    // null = inside the shell, on the head: the ring tightens before it bursts.
    for (const spot of [...spots, null]) {
      const w = finaleWorld(5, seed);
      untilState(w, "warn");
      const s = w.finale.data, [x, y] = spot ?? [s.x, s.y + 1];
      // On (or beside) the safe line is meant to be safe.
      if (Math.abs(turnTo(Math.atan2(y - s.y, x - s.x) - s.safe)) < 0.5) continue;
      checked++;
      let hit = false, launched = false;
      for (let i = 0; i < 60 * 12 && !hit && !(launched && w.finale.state !== "active"); i++) {
        Object.assign(w.ship, { x, y, vx: 0, vy: 0 });
        hit = lost(g.step(w, still, dt));
        launched ||= w.finale.state === "active";
      }
      assert.ok(hit, `seed ${seed}: a ship parked at ${x},${y} was never hit`);
    }
  }
  assert.ok(checked > spots.length * 30 * 0.7, `only ${checked} spots checked`);
});

test("Full Plate: the green line tells the truth: a still ship parked on it is never hit", () => {
  for (let seed = 1; seed <= 30; seed++) {
    const w = finaleWorld(5, seed);
    untilState(w, "warn");
    const at = shelter(w, w.finale.data);
    let launched = false;
    for (let i = 0; i < 60 * 12 && !(launched && w.finale.state !== "active"); i++) {
      Object.assign(w.ship, { x: at.x, y: at.y, vx: 0, vy: 0 });
      assert.ok(!lost(g.step(w, still, dt)), `seed ${seed}: parked on the line at ${at.x.toFixed(0)},${at.y.toFixed(0)}, hit`);
      launched ||= w.finale.state === "active";
    }
    assert.equal(w.finale.state, "rest");
  }
});

test("Full Plate: from anywhere on a short phone the safe line is reached in time at phone speed", () => {
  for (let x = 10; x < 667; x += 40) {
    for (let y = 10; y < 320; y += 40) {
      const w = finaleWorld(5, 1 + ((x + y) % 7));
      untilState(w, "warn");
      Object.assign(w.ship, { x, y, vx: 0, vy: 0 });
      let launched = false;
      // Half a second to react, then the bot.
      for (let i = 0; i < 60 * 12 && !(launched && w.finale.state !== "active"); i++) {
        const input = i * dt < 0.5 ? still : bot(w);
        assert.ok(!lost(g.step(w, input, dt)), `from ${x},${y}: hit at ${w.time.toFixed(2)}s`);
        launched ||= w.finale.state === "active";
      }
    }
  }
});

test("Full Plate: nothing exists during the warning; the safe line is locked; the burst has its own full warning", () => {
  const w = finaleWorld(5);
  const first = g.step(w, still, dt);
  assert.deepEqual(first.filter((e) => e.type === "lastStand").map((e) => e.name), ["Full Plate"]);
  untilState(w, "warn");
  const s = w.finale.data, locked = { x: s.x, y: s.y, safe: s.safe };
  // Park beside where the shell forms: the plates there are left out instead of starting on the ship.
  const a = s.hole + 3 * STEP;
  Object.assign(w.ship, { x: s.x + Math.cos(a) * (s.R + 30), y: s.y + Math.sin(a) * (s.R + 30), vx: 0, vy: 0 });
  while (w.finale.state === "warn") {
    assert.equal(w.rocks.length, 0, "nothing exists to hurt during the warning");
    g.step(w, still, dt);
  }
  assert.ok(s.plates.length > 0 && s.plates.length < SLOTS);
  for (const { rock } of s.plates) assert.ok(Math.hypot(rock.x - w.ship.x, rock.y - w.ship.y) >= 60, "no plate starts on the ship");
  w.ship.x = s.x + Math.cos(s.safe) * 150; w.ship.y = s.y + Math.sin(s.safe) * 150;
  let braceFrom = null, burstAt = null;
  while (w.finale.state === "active") {
    assert.deepEqual({ x: s.x, y: s.y, safe: s.safe }, locked, "the safe line never moves");
    if (s.t >= SHELL) {
      braceFrom ??= w.time;
      assert.ok(Math.abs(turnTo(s.hole - s.safe)) < 1e-9, "the hole sits on the safe line through the burst warning");
    }
    if (s.burst) burstAt ??= w.time;
    g.step(w, bot(w), dt);
  }
  assert.ok(burstAt - braceFrom >= g.powerWarning(w) - 1e-9, `burst warning ${(burstAt - braceFrom).toFixed(3)}s`);
});

test("Full Plate: shots are swallowed by the plates but reach the statue through the hole", () => {
  for (let seed = 1; seed <= 10; seed++) {
    const w = finaleWorld(5, seed);
    w.ship.x = 20; w.ship.y = 20;
    untilBrace(w);
    const s = w.finale.data, hp = w.statue.hp;
    const through = shootAlong(w, s.safe);
    assert.equal(through.filter((e) => e.type === "statueHit").length, 1, `seed ${seed}: through the hole`);
    assert.ok(!through.some((e) => e.type === "rockBroken"));
    assert.equal(w.statue.hp, hp - 1);
    // At the plate next to the hole on the upper side, away from the statue's body.
    const a = [s.safe - STEP, s.safe + STEP].sort((p, q) => Math.sin(p) - Math.sin(q))[0];
    const blocked = shootAlong(w, a);
    assert.ok(!blocked.some((e) => e.type === "statueHit"), `seed ${seed}: through a plate`);
    assert.ok(blocked.some((e) => e.type === "rockBroken"), "the plate takes the shot");
  }
});

test(`Full Plate: breaking ${BREAK} plates collapses the shell and stuns the statue exactly once`, () => {
  const w = finaleWorld(5);
  w.ship.x = 20; w.ship.y = 20;
  untilState(w, "active");
  const s = w.finale.data;
  for (const { rock } of s.plates.slice(0, BREAK)) {
    for (let i = 0; i < PLATE_HP; i++) w.bullets.push({ x: rock.x, y: rock.y, vx: 0, vy: 0, life: 1 });
  }
  const events = [];
  while (w.finale.state === "active") events.push(...g.step(w, still, dt));
  assert.equal(w.finale.state, "stun");
  assert.equal(events.filter((e) => e.type === "statueStunned").length, 1);
  assert.ok(!lost(events));
  assert.equal(w.rocks.length, 0, "the shell collapses with nothing left");
  const later = untilState(w, "active");
  assert.ok(!later.some((e) => e.type === "statueStunned"));
  assert.equal(w.finale.data.broken, 0, "a new shell starts whole");
});

test(`Full Plate: ${BREAK - 1} broken plates are not enough; the burst ends with nothing left`, () => {
  const w = finaleWorld(5);
  while (w.finale?.state !== "active") g.step(w, w.finale ? bot(w) : still, dt);
  for (const { rock } of w.finale.data.plates.slice(0, BREAK - 1)) {
    for (let i = 0; i < PLATE_HP; i++) w.bullets.push({ x: rock.x, y: rock.y, vx: 0, vy: 0, life: 1 });
  }
  const events = [];
  while (w.finale.state === "active") events.push(...g.step(w, bot(w), dt));
  assert.equal(w.finale.data.broken, BREAK - 1);
  assert.equal(w.finale.state, "rest");
  assert.ok(!events.some((e) => e.type === "shipLost" || e.type === "statueStunned"));
  assert.equal(w.rocks.length, 0);
  assert.equal(w.finale.data.plates.length, 0);
});

test("Full Plate: a ship lost to the shell restarts it quietly", () => {
  const w = finaleWorld(5);
  untilState(w, "active");
  const [{ rock }] = plates(w);
  Object.assign(w.ship, { x: rock.x, y: rock.y, vx: 0, vy: 0 });
  assert.ok(lost(g.step(w, still, dt)));
  assert.equal(w.finale.state, "rest");
  assert.equal(w.rocks.length, 0);
  const later = untilState(w, "active", { ...idle, joystick: { x: 0, y: -1 } });
  assert.ok(!later.some((e) => e.type === "lastStand"), "no second reveal");
  assert.ok(w.finale.data.plates.length > 0);
  assert.equal(w.finale.data.burst, false);
});

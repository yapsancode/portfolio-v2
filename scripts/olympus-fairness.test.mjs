// Fairness fixes: resize, death, spawn safety, halo aim, piece lifetime, scoring, tunneling and small rules.
import assert from "node:assert/strict";
import { test } from "node:test";
import { loadTs } from "./load-ts.mjs";
const g = loadTs("src/components/game/olympus.ts");
const { drawWorld } = loadTs("src/components/game/draw.ts");
const input = { left: false, right: false, thrust: false, fire: false };
const still = { ...input, joystick: { x: 0, y: 0 } };
const dt = 1 / 60;
const box = (w, h) => ({ x: w * .4, y: h * .5, w: w * .22, h: h * .5 });
function make(level, { w = 1280, h = 764, touch = false, phone = false, random = g.seededRandom(42), upgrades } = {}) {
  return g.createWorld({ w, h, level, touch, phoneMode: phone, upgrades,
    statue: g.createStatue(box(w, h), 16, 18, Array(288).fill(1)), random, particleScale: 0 });
}
function boss(level, opts) {
  const w = make(level, opts);
  w.phase = "boss"; w.statue.wake = 1; w.rocks = [];
  w.ship.x = 90; w.ship.y = 75; w.ship.safe = 10000;
  return w;
}
function until(w, predicate, inp = input, limit = 3600) {
  for (let i = 0; i < limit; i++) { const ev = g.step(w, inp, dt); if (predicate(w, ev)) return ev; }
  assert.fail(`level ${w.level} never reached the expected state`);
}
const rockAt = (x, y, r = 20) => ({ x, y, vx: 0, vy: 0, r, size: 0, angle: 0, spin: 0, shape: [1, 1, 1] });
const TOUCH = { w: 1024, h: 768, touch: true };
const PHONE = { w: 667, h: 320, touch: true, phone: true };

test("resize keeps a charging laser, the throw timer and every warned power", () => {
  const w = boss(1); w.statue.hp = 9;
  until(w, w => w.statue.laser?.state === "charge");
  const { throwIn } = w.statue, { t } = w.statue.laser;
  g.resize(w, 1000, 700, box(1000, 700));
  assert.equal(w.statue.laser?.state, "charge"); assert.equal(w.statue.laser.t, t); assert.equal(w.statue.throwIn, throwIn);
  for (const level of [2, 3, 4, 5, 6]) {
    const p = boss(level);
    until(p, p => p.attack.state === "warn");
    const before = p.attack.t;
    g.resize(p, 600, 400, box(600, 400));
    assert.equal(p.attack.state, "warn"); assert.equal(p.attack.t, before);
    assert.ok(p.attack.x <= 570 && p.attack.y <= 400 - 46, "the warned origin is pulled inside the new playfield");
  }
});

test("a stage-3 death does not replay the stage announcement; a death before awakening keeps the rocks", () => {
  const w = boss(1); w.statue.hp = 9; w.lives = 5;
  let stages = 0;
  const count = ev => { stages += ev.filter(e => e.type === "bossStage").length; };
  count(g.step(w, input, dt)); assert.equal(stages, 1);
  w.ship.safe = 0; w.rocks.push(rockAt(w.ship.x, w.ship.y));
  count(g.step(w, input, dt)); assert.equal(w.lives, 4);
  for (let i = 0; i < 300; i++) count(g.step(w, input, dt));
  assert.equal(stages, 1);
  assert.ok(w.statue.laser, "the laser eye keeps working after a death");

  const p = make(1); p.ship.safe = 0;
  const chips = p.rocks.length; p.ship.x = p.rocks[0].x; p.ship.y = p.rocks[0].y;
  g.step(p, input, dt);
  assert.equal(p.lives, 2); assert.equal(p.rocks.length, chips);
});

test("a ship parked on the halo's eye still receives every ring piece, outside its 60px bubble", () => {
  for (const opts of [{}, PHONE]) {
    const w = boss(3, opts);
    const park = () => Object.assign(w.ship, g.eyePoint(w.statue));
    park();
    until(w, w => {
      if (w.attack.state === "active") return true;
      park(); return false;
    });
    assert.equal(w.rocks.length, opts.phone ? 6 : 8);
    for (const r of w.rocks) assert.ok(Math.hypot(r.x - w.ship.x, r.y - w.ship.y) >= 59.9);
  }
});

test("a ship parked on the statue is not killed by the 4.0s chip spawning on it", () => {
  const w = make(1, { random: () => 0.5 });
  const home = w.statue.home;
  w.rocks = []; w.ship.safe = 0;
  w.ship.x = home.x + home.w * .5; w.ship.y = home.y + home.h * .375; // where every chip starts with this random
  until(w, w => w.rocks.length > 0, input, 300);
  assert.ok(w.ship.alive);
  assert.ok(Math.hypot(w.rocks[0].x - w.ship.x, w.rocks[0].y - w.ship.y) >= 59.9);
  for (let i = 0; i < 30; i++) g.step(w, input, dt);
  assert.ok(w.ship.alive);
});

test("a ship parked on the throwing shoulder is not killed by the throw spawning on it", () => {
  const b = boss(1);
  until(b, b => b.statue.windup > 0);
  until(b, b => {
    const p = g.throwPoint(b.statue); b.ship.x = p.x + 15; b.ship.y = p.y; b.ship.safe = 0;
    return b.rocks.length > 0 || !b.ship.alive;
  });
  assert.ok(b.ship.alive);
  for (const r of b.rocks) assert.ok(Math.hypot(r.x - b.ship.x, r.y - b.ship.y) >= 59.9);
});

test("on a touch tablet a still ship far from the halo eye is hit or has to move", () => {
  for (const [dx, dy] of [[-330, -350], [400, -330], [-260, 0], [380, 100], [60, -300]]) {
    const w = boss(3, TOUCH);
    const eye = g.eyePoint(w.statue);
    w.ship.x = eye.x + dx; w.ship.y = eye.y + dy; w.ship.safe = 0; w.lives = 99;
    assert.ok(Math.hypot(dx, dy) > 217 && w.ship.y > 0 && w.ship.y < 768 - 136);
    until(w, (w, ev) => ev.some(e => e.type === "shipLost"), still, 60 * 12);
  }
});

test("level 4 on a 2560x1440 screen: every warned wave falls and reaches the bottom", () => {
  const w = boss(4, { w: 2560, h: 1440 });
  const seen = new WeakSet(); const perWave = []; let maxY = 0;
  for (let f = 0; f < 60 * 24; f++) {
    const before = w.attack.state;
    g.step(w, input, dt);
    let fresh = 0;
    for (const r of w.rocks) { if (!seen.has(r)) { seen.add(r); fresh++; } maxY = Math.max(maxY, r.y); }
    if (before === "warn" && w.attack.state === "active") perWave.push(fresh);
  }
  assert.ok(perWave.length >= 6);
  assert.ok(perWave.every(n => n === 6), `pieces per wave: ${perWave}`);
  assert.ok(maxY > 1440 * .95, `pieces only fell to ${Math.round(maxY)}px`);
});

test("no scoring or firing once the statue crumbles or the last ship is lost", () => {
  const w = boss(1); w.statue.hp = 1;
  const tile = w.statue.tiles.find(t => t.attached && t.solid), o = g.tileOrigin(w.statue, tile);
  w.bullets = [{ x: o.x + o.w / 2, y: o.y + o.h / 2, vx: 0, vy: 0, life: 1 }];
  g.step(w, input, dt); assert.equal(w.phase, "crumbling");
  const score = w.score;
  g.setTargets(w, [{ kind: "window", id: "win", x: 0, y: 0, w: 1280, h: 764 }]);
  w.bullets = [{ x: 300, y: 300, vx: 0, vy: 0, life: 1 }];
  for (let i = 0; i < 60; i++) assert.ok(!g.step(w, { ...input, fire: true }, dt).some(e => e.type === "shot"));
  assert.equal(w.score, score);

  const l = make(1); l.lives = 1; l.ship.safe = 0; l.spawnIn = 99;
  l.rocks = [rockAt(l.ship.x, l.ship.y)];
  g.setTargets(l, [{ kind: "icon", id: "icon", x: 100, y: 100, w: 40, h: 40 }]);
  g.step(l, input, dt); assert.equal(l.phase, "lost");
  const lost = l.score;
  l.bullets = [{ x: 120, y: 120, vx: 0, vy: 0, life: 1 }];
  const ev = g.step(l, input, dt);
  assert.ok(!ev.some(e => e.type === "iconDestroyed")); assert.equal(l.score, lost);
});

test("while it wakes the statue swallows shots; asleep, windows over it are hit first", () => {
  const w = make(1); w.rocks = []; w.spawnIn = 99;
  w.phase = "awakening"; w.phaseTime = 1;
  const home = w.statue.home;
  g.setTargets(w, [{ kind: "window", id: "behind", ...home }]);
  w.bullets = [{ x: home.x + home.w / 2, y: home.y + home.h / 2, vx: 0, vy: 0, life: 1 }];
  const ev = g.step(w, input, dt);
  assert.ok(!ev.some(e => e.type === "windowHit")); assert.equal(w.bullets.length, 0); assert.equal(w.statue.hp, w.statue.maxHp);

  const p = make(1); p.rocks = []; p.spawnIn = 99;
  g.setTargets(p, [{ kind: "window", id: "over", ...home }]);
  p.bullets = [{ x: home.x + home.w / 2, y: home.y + home.h / 2, vx: 0, vy: 0, life: 1 }];
  assert.ok(g.step(p, input, dt).some(e => e.type === "windowHit"));
  assert.equal(p.score, g.TUNING.window.hitScore);
});

test("fast shots cannot skip the smallest rock or a phone-sized statue tile", () => {
  let hits = 0;
  for (let k = 0; k < 400; k++) {
    const w = make(1, { w: 540, h: 700, random: g.seededRandom(k) });
    w.ship.safe = 1e9; w.spawnIn = 99;
    const rock = { ...rockAt(270, 150, 13 * w.scale), size: 2 }; // above the sleeping statue
    w.rocks = [rock];
    const a = k * 0.7, step = 1220 * dt, from = 60 + (k * 0.618 % 1) * step;
    w.bullets = [{ x: 270 + Math.cos(a) * from, y: 150 + Math.sin(a) * from, vx: -Math.cos(a) * 1220, vy: -Math.sin(a) * 1220, life: 0.8 }];
    for (let i = 0; i < 10; i++) if (g.step(w, input, dt).some(e => e.type === "rockBroken")) { hits++; break; }
  }
  assert.equal(hits, 400);

  let tileHits = 0;
  for (let k = 0; k < 100; k++) {
    const w = boss(1, { w: 844, h: 390, touch: true, phone: true });
    w.ship.alive = false; w.ship.respawn = 999;
    const keep = w.statue.tiles.find(t => t.solid && t.row === 9 && t.col === 8);
    for (const t of w.statue.tiles) t.attached = t === keep;
    const o = g.tileOrigin(w.statue, keep);
    w.bullets = [{ x: o.x + o.w / 2, y: o.y + o.h + 5 + (k * 0.618 % 1) * 970 * dt, vx: 0, vy: -970, life: 0.8 }];
    for (let i = 0; i < 6; i++) if (g.step(w, input, dt).some(e => e.type === "statueHit")) { tileHits++; break; }
  }
  assert.equal(tileHits, 100);
});

test("level 1 stage 3 starts charging the laser at once", () => {
  const w = boss(1); w.statue.hp = 9;
  const ev = g.step(w, input, dt);
  assert.equal(w.statue.laser?.state, "charge");
  assert.ok(ev.some(e => e.type === "laserCharge"));
});

test("respawn is below the top rain keep-out band", () => {
  const r = make(1, PHONE); r.ship.alive = false; r.ship.respawn = 0;
  g.step(r, still, dt); assert.ok(r.ship.y >= 80);
});

test("held fire keeps its leftover time, so upgrades give their promised rate", () => {
  for (const blaster of [0, 4]) {
    const w = make(1, { w: 4000, h: 3000, upgrades: { hull: 0, blaster, shield: 0 } });
    w.ship.safe = 1e9; w.spawnIn = 1e9;
    let shots = 0;
    for (let i = 0; i < 600; i++) { w.rocks = []; w.bullets = []; shots += g.step(w, { ...input, fire: true }, dt).filter(e => e.type === "shot").length; }
    const expected = 10 / (g.TUNING.bullet.cooldown - blaster * 0.02);
    assert.ok(Math.abs(shots - expected) <= 1, `blaster ${blaster}: ${shots} shots, expected ${expected}`);
  }
});

test("dt is clamped to [0, 0.1]", () => {
  const c = make(1); const t = c.time;
  g.step(c, input, 5); assert.equal(c.time, t + 0.1);
  g.step(c, input, -1); assert.equal(c.time, t + 0.1);
});

test("a phone keeps its slower speed with a keyboard", () => {
  const k = make(1, { w: 4000, h: 3000, phone: true });
  for (let i = 0; i < 60; i++) g.step(k, { ...input, thrust: true }, dt);
  assert.ok(Math.hypot(k.ship.vx, k.ship.vy) <= g.TUNING.phone.maxSpeed + 1e-9);
});

test("shots leave from the drawn cursor tip", () => {
  assert.ok(Math.abs(g.TUNING.ship.nose - Math.hypot(4, 11) * 2) < 0.5, "matches the drawn cursor tip in draw.ts");
  for (const phone of [false, true]) {
    const m = make(1, { w: 4000, h: 3000, phone }); m.rocks = [];
    g.step(m, { ...input, fire: true }, dt);
    const b = m.bullets[0], nose = g.TUNING.ship.nose * (phone ? g.TUNING.phone.shipScale : 1);
    assert.ok(Math.abs(Math.hypot(b.x - m.ship.x, b.y - m.ship.y) - g.TUNING.bullet.speed * dt - nose) < 1e-6);
  }
});

function mockCtx() {
  const calls = [];
  const ctx = new Proxy({}, {
    get: (t, k) => k in t ? t[k] : (...args) => { calls.push([k, ...args]); return { addColorStop() {} }; },
    set: (t, k, v) => { t[k] = v; return true; },
  });
  return { ctx, calls };
}

test("rain lanes and halo gap cues stay drawn while that wave's pieces are alive", () => {
  const w = boss(4);
  until(w, w => w.attack.state === "active");
  const first = [...w.attack.lanes];
  until(w, w => w.attack.state === "warn" && w.attack.wave === 1);
  const gone = first.filter(l => !w.attack.lanes.includes(l));
  assert.ok(gone.length > 0 && w.rocks.length > 0);
  const { ctx, calls } = mockCtx(); drawWorld(ctx, w, null, { x: 0, y: 0 });
  for (const lane of gone) assert.ok(calls.some(c => c[0] === "fillRect" && c[1] === lane * w.w / 5 && c[2] === 0), `lane ${lane} still highlighted`);

  const h = boss(3);
  until(h, h => h.attack.state === "active");
  const angle = h.attack.angle;
  until(h, h => h.attack.state === "warn" && h.attack.wave === 1);
  assert.ok(h.rocks.length > 0);
  const d = mockCtx(); drawWorld(d.ctx, h, null, { x: 0, y: 0 });
  assert.ok(d.calls.some(c => c[0] === "arc" && Math.abs(c[4] - (angle - Math.PI * .2)) < 1e-9 && c[3] > 28), "old ring's gap cue");
});

test("on touch the ship reaches the bottom middle but is pushed out of the control boxes", () => {
  const w = boss(1, PHONE);
  w.controls = [{ x: 16, y: 196, w: 112, h: 112 }, { x: 567, y: 224, w: 84, h: 84 }];
  w.ship.x = 333; w.ship.y = 300;
  g.step(w, still, dt);
  assert.equal(w.ship.y, 300); // the empty bottom middle is playfield now
  w.ship.x = 70; w.ship.y = 205; // just inside the joystick's top edge
  g.step(w, still, dt);
  assert.ok(w.ship.y < 196, "pushed up above the joystick");
  w.ship.x = 560; w.ship.y = 290; // just inside the fire button's left edge
  g.step(w, still, dt);
  assert.ok(w.ship.x < 567 && w.ship.y === 290, "pushed sideways, not up through the button");
});

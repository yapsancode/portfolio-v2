// Robot players for Olympus. They play the real rules (olympus.ts) a few
// hundred times with fixed seeds and check the balance numbers.
// Run: node scripts/olympus-sim.mjs
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const source = readFileSync(new URL("../src/components/game/olympus.ts", import.meta.url), "utf8");
const compiled = join(mkdtempSync(join(tmpdir(), "olympus-sim-")), "olympus.mjs");
writeFileSync(
  compiled,
  ts.transpileModule(source, { compilerOptions: { module: "ESNext", target: "ES2022" } }).outputText
);
const g = await import(pathToFileURL(compiled).href);

const COLS = 16;
const ROWS = 18;
const DT = 1 / 60;
const GAMES = 200;
const TASKBAR = 36;
const EYE = g.EYE ?? { x: 0.33, y: 0.265 };

// shortcut: a stand-in statue shape and one fake window, not the real page.
// Upgrade to the real picture's tile mask if the numbers stop matching playtests.
function makeWorld(seed, screen, run) {
  const { w, h } = screen;
  const solid = [];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      solid.push(r > 2 && Math.abs((c + 0.5) / COLS - 0.5) < 0.12 + r / ROWS / 3);
  const sh = (h + TASKBAR) * (screen.phone ? 0.44 : 0.58);
  const sw = sh * 0.92;
  const box = { x: (w - sw) / 2, y: h - sh, w: sw, h: sh };
  const world = g.createWorld({
    w,
    h,
    statue: g.createStatue(box, COLS, ROWS, solid),
    random: g.seededRandom(seed),
    run,
    shipFloor: screen.phone ? 100 : 0,
  });
  const targets = [0, 1, 2, 3, 4, 5].map((i) => ({ kind: "icon", id: "i" + i, x: 8, y: 8 + i * 92, w: 88, h: 84 }));
  if (!screen.phone) targets.unshift({ kind: "window", id: "about", x: 140, y: 50, w: 480, h: 380 });
  g.setTargets(world, targets);
  return world;
}

const norm = (a) => Math.atan2(Math.sin(a), Math.cos(a));

function eyeOf(world) {
  const { home, dx, dy } = world.statue;
  return { x: home.x + dx + EYE.x * home.w, y: home.y + dy + EYE.y * home.h };
}

/** Where to shoot: a close rock first, then the desktop, then the statue's head. */
function aimPoint(world) {
  const s = world.ship;
  let best = null;
  let bestD = 260;
  for (const r of world.rocks) {
    const d = Math.hypot(r.x - s.x, r.y - s.y);
    if (d < bestD) {
      bestD = d;
      best = { x: r.x + (r.vx * d) / 700, y: r.y + (r.vy * d) / 700 };
    }
  }
  if (best) return best;
  if (world.phase === "play" && world.targets.length) {
    const t = world.targets.reduce((a, b) =>
      Math.hypot(a.x + a.w / 2 - s.x, a.y + a.h / 2 - s.y) < Math.hypot(b.x + b.w / 2 - s.x, b.y + b.h / 2 - s.y) ? a : b
    );
    return { x: t.x + t.w / 2, y: t.y + t.h / 2 };
  }
  return eyeOf(world);
}

function turnTo(world, angle, slack = 0.05) {
  const d = norm(angle - world.ship.angle);
  return { left: d < -slack, right: d > slack, off: Math.abs(d) };
}

/** Turns and fires. Never thrusts. */
function idleBot(world) {
  const s = world.ship;
  const p = aimPoint(world);
  const t = turnTo(world, Math.atan2(p.x - s.x, -(p.y - s.y)));
  return { left: t.left, right: t.right, thrust: false, fire: true };
}

/** Like Idle, but flies out of the way of rocks and the laser. */
function dodgerBot(world) {
  const s = world.ship;
  let escape = null;
  let urgency = 0;
  for (const r of world.rocks) {
    const px = r.x - s.x;
    const py = r.y - s.y;
    const vx = r.vx - s.vx;
    const vy = r.vy - s.vy;
    const v2 = vx * vx + vy * vy || 1;
    const t = Math.max(0, Math.min(1.2, -(px * vx + py * vy) / v2));
    const cx = px + vx * t;
    const cy = py + vy * t;
    const d = Math.hypot(cx, cy);
    if (d > r.r + 30) continue;
    const u = 1 / (t + 0.1);
    if (u <= urgency) continue;
    urgency = u;
    // Away from where the rock will pass; straight sideways if it is dead on.
    escape = d > 1 ? Math.atan2(-cx, cy) : Math.atan2(-vy, -vx) + Math.PI / 2;
  }
  const laser = world.statue.laser;
  if (laser && laser.state !== "rest") {
    const eye = eyeOf(world);
    const bx = Math.cos(laser.angle);
    const by = Math.sin(laser.angle);
    const side = (s.x - eye.x) * -by + (s.y - eye.y) * bx;
    if (Math.abs(side) < 90) {
      const sign = side >= 0 ? 1 : -1;
      escape = Math.atan2(-by * sign, -(bx * sign));
      urgency = 99;
    }
  }
  if (escape !== null) {
    const t = turnTo(world, escape, 0.1);
    return { left: t.left, right: t.right, thrust: t.off < 0.7, fire: true };
  }
  return idleBot(world);
}

function play(seed, screen, bot, run = 1) {
  const world = makeWorld(seed, screen, run);
  const out = { end: "timeout", wake: 0, boss: 0, livesAtBoss: 0, windowTime: 0, tail: 0 };
  let bossStart = 0;
  let firstWindowHit = 0;
  let tailStart = 0;
  for (let t = 0; t < 240; t += DT) {
    for (const e of g.step(world, bot(world), DT)) {
      if (e.type === "statueAwake") out.wake = t;
      if (e.type === "windowHit" && !firstWindowHit) firstWindowHit = t;
      if (e.type === "windowCrashed") out.windowTime = t - firstWindowHit;
      if (e.type === "statueCrumbled") out.end = "won";
      if (e.type === "lost") out.end = "lost";
    }
    if (!bossStart && world.phase === "boss") {
      bossStart = t;
      out.livesAtBoss = world.lives;
    }
    if (!tailStart && bossStart && world.statue.hp <= world.statue.maxHp * 0.05) tailStart = t;
    if (out.end !== "timeout") {
      out.boss = bossStart ? t - bossStart : 0;
      out.tail = out.end === "won" && tailStart ? t - tailStart : 0;
      break;
    }
  }
  return out;
}

const median = (list) => [...list].sort((a, b) => a - b)[Math.floor(list.length / 2)] ?? 0;

function stats(screen, bot, run = 1) {
  const games = Array.from({ length: GAMES }, (_, i) => play(i + 1, screen, bot, run));
  const won = games.filter((x) => x.end === "won");
  const reached = games.filter((x) => x.livesAtBoss > 0);
  return {
    win: won.length / GAMES,
    wake: median(games.filter((x) => x.wake).map((x) => x.wake)),
    boss: median(won.map((x) => x.boss)),
    twoLives: reached.filter((x) => x.livesAtBoss >= 2).length / GAMES,
    windowTime: median(games.filter((x) => x.windowTime).map((x) => x.windowTime)),
    tail: Math.max(0, ...won.map((x) => x.tail)),
  };
}

const SCREENS = { desktop: { w: 1280, h: 684 }, phone: { w: 412, h: 780, phone: true } };
const BOTS = { idle: idleBot, dodger: dodgerBot };

const results = {};
for (const [screenName, screen] of Object.entries(SCREENS)) {
  for (const [botName, bot] of Object.entries(BOTS)) {
    const r = stats(screen, bot);
    results[`${screenName}.${botName}`] = r;
    console.log(
      `${screenName.padEnd(8)}${botName.padEnd(7)} wins ${(r.win * 100).toFixed(0).padStart(3)}%` +
        ` | wakes ${r.wake.toFixed(1)}s | boss ${r.boss.toFixed(1)}s | 2+ lives at boss ${(r.twoLives * 100).toFixed(0)}%` +
        ` | window lasts ${r.windowTime.toFixed(1)}s | slowest last-5% ${r.tail.toFixed(1)}s`
    );
  }
}

// Targets. Each roadmap step switches its own lines on.
const R = results;
const checks = [
  ["step 1: on a phone, Idle reaches the boss with 2+ lives in most games", R["phone.idle"].twoLives >= 0.7],
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) failed++;
}
process.exit(failed ? 1 : 0);

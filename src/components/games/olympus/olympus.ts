/**
 * Olympus — the game rules. No React, no DOM: the overlay feeds in the
 * screen size, where the windows and icons are, and the keys held down,
 * then calls step() 60 times a second and reacts to the events it returns.
 *
 * Phases: play (shoot the desktop, the statue gets angry) → awakening
 * (the statue wakes up) → boss (it throws marble, you chip it apart) →
 * crumbling → won. Losing every life at any point → lost.
 */

import { validLevel } from "../../../lib/games/olympus/levels";
import { emptyResources, type Upgrades } from "../../../lib/games/olympus/resources";

export type Phase = "play" | "awakening" | "boss" | "crumbling" | "won" | "lost";

export type Input = {
  left: boolean;
  right: boolean;
  thrust: boolean;
  fire: boolean;
  /** Present for touch steering, including the neutral position for braking. */
  joystick?: { x: number; y: number };
};

export type Rect = { x: number; y: number; w: number; h: number };

/** A window or desktop icon the ship can shoot. Sent in topmost first. */
export type TargetRect = Rect & { kind: "window" | "icon"; id: string };

export type Ship = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Radians; 0 points up. */
  angle: number;
  alive: boolean;
  /** Seconds of blinking safety left after (re)spawning. */
  safe: number;
  /** Seconds until the ship comes back after being hit. */
  respawn: number;
  thrusting: boolean;
};

export type Rock = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** 0 = big, 1 = medium, 2 = small. */
  size: 0 | 1 | 2;
  r: number;
  angle: number;
  spin: number;
  /** Radius multipliers for each corner, so every rock has its own shape. */
  shape: number[];
  /** Thrown by the statue: flies straight off the screen, and cannot be shot down. */
  thrown?: boolean;
  /** New powers use pale, shootable fragments with a finite lifetime. */
  power?: boolean;
  life?: number;
  orbit?: number;
  /** Level 5: where a shield will fly. Level 3: the gap centre of its ring (for the cue). */
  launchAngle?: number;
};

/** The statue's laser eye: it charges (following you), locks, fires, rests. */
export type Laser = {
  state: "rest" | "charge" | "lock" | "fire";
  /** Seconds left in this state. */
  t: number;
  /** Direction of the beam, radians (0 = right, clockwise on screen). */
  angle: number;
};

export type PowerAttack = {
  state: "rest" | "warn" | "active";
  t: number;
  elapsed: number;
  x: number;
  y: number;
  angle: number;
  lanes: number[];
  wave: number;
  direction: number;
  targetX: number;
};

export type Bullet = { x: number; y: number; vx: number; vy: number; life: number };

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  gravity: number;
};

/** A bullet hole in a window that is still open. */
export type Scar = { id: string; x: number; y: number };

/** A bit of wreckage left where a window or icon used to be. */
export type Debris = { x: number; y: number; size: number; color: string };

/** One tile of the statue image, still attached or flying off. */
export type Tile = {
  col: number;
  row: number;
  /** Enough marble to stop a bullet. Thin edge tiles are only drawn. */
  solid: boolean;
  attached: boolean;
  /** Only used once it has broken off. */
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  spin: number;
};

export type Statue = {
  /** Where the wallpaper statue sits on screen. */
  home: Rect;
  cols: number;
  rows: number;
  tiles: Tile[];
  /** Current offset from home (sway and rise). */
  dx: number;
  dy: number;
  /** Health in bullet hits. The attached tiles always match it. */
  hp: number;
  maxHp: number;
  /** Every tile, in the order they break off: furthest from the eye first. */
  breakOrder: Tile[];
  /** How many tiles of `breakOrder` have broken off. */
  broken: number;
  /** Boss phase: 1 throws, 2 fast spreads, 3 laser eye. */
  stage: 1 | 2 | 3;
  throwIn: number;
  /** Seconds left of the warning before a throw (0 = not winding up). */
  windup: number;
  /** Which side the next throw comes from: -1 left, 1 right. */
  side: -1 | 1;
  laser: Laser | null;
  /** 0 → 1 while it wakes up (eye glow, rise). */
  wake: number;
  time: number;
};

export type GameEvent =
  | { type: "shot" }
  | { type: "rockBroken"; size: 0 | 1 | 2 }
  | { type: "iconDestroyed"; id: string }
  /** `left` = hits the window can still take. */
  | { type: "windowHit"; id: string; left: number }
  | { type: "windowCrashed"; id: string }
  | { type: "statueAwake" }
  | { type: "statueHit" }
  | { type: "bossStage"; stage: 2 | 3 }
  | { type: "powerWarn" }
  | { type: "throwWarn" }
  | { type: "laserCharge" }
  | { type: "laserFire" }
  | { type: "statueCrumbled" }
  | { type: "shipLost"; livesLeft: number }
  | { type: "won" }
  | { type: "lost" };

export type World = {
  w: number;
  h: number;
  phase: Phase;
  /** Seconds spent in the current phase. */
  phaseTime: number;
  time: number;
  ship: Ship;
  phoneMode: boolean;
  rocks: Rock[];
  bullets: Bullet[];
  particles: Particle[];
  statue: Statue;
  targets: TargetRect[];
  /** Hits left per window id. */
  windowHp: Record<string, number>;
  destroyedIcons: string[];
  crashedWindows: string[];
  scars: Scar[];
  debris: Debris[];
  /** 0 → 100. At 100 the statue wakes up. */
  anger: number;
  lives: number;
  upgrades: Upgrades;
  score: number;
  /** Selects an attack profile, never a difficulty multiplier. */
  level: number;
  attack: PowerAttack;
  fireIn: number;
  spawnIn: number;
  /** Below 1 on small screens: rocks are smaller and slower there. */
  scale: number;
  /** On-screen touch controls: gentler power timings. */
  touch: boolean;
  /** Screen boxes of the touch buttons; the ship stays out of them. */
  controls: Rect[];
  /** 0 → 1, for fewer particles with reduced motion. */
  particleScale: number;
  random: () => number;
  /** The "lost" event has been sent. */
  lostSent: boolean;
};

/* ------------------------------------------------------------------ */
/* Tuning — all the numbers in one place (checked by simulation)       */
/* ------------------------------------------------------------------ */

export const TUNING = {
  lives: 3,
  joystick: { maxSpeed: 360, response: 14, brake: 22 },
  phone: { maxSpeed: 270, shipScale: 0.75 },
  ship: {
    radius: 10,
    turn: 5.4, // rad/s (~310°/s)
    thrust: 560, // px/s²
    maxSpeed: 520,
    safeTime: 2,
    respawnTime: 1.4,
    /** Centre to the drawn cursor tip (draw.ts: hypot(4, 11) * 2): the muzzle. */
    nose: 23,
  },
  bullet: { speed: 700, life: 0.8, max: 6, cooldown: 0.2 },
  rock: {
    radius: [40, 24, 13] as const,
    speed: [[40, 90], [70, 130], [100, 170]] as const,
    score: [20, 50, 100] as const,
    anger: [1.5, 1, 0.5] as const,
    start: 4,
    max: 8,
    spawnEvery: 4,
    recallSpeed: 700, // px/s, flying back into the waking statue
  },
  window: { hp: 14, hitScore: 50, crashScore: 500, hitAnger: 1, crashAnger: 12 },
  icon: { score: 150, anger: 6 },
  /** Anger comes from wrecking the desktop; time only adds a trickle. */
  angerPerSecond: 1,
  /** Safety net: the statue wakes by now even if nothing was shot. */
  maxPlayTime: 45,
  maxDebris: 400,
  /** The moment it wakes: everything stands still this long. */
  awakenFreeze: 0.6,
  awakenTime: 2.4,
  statue: {
    hp: 38, // bullet hits
    hitScore: 100,
    pokeScore: 10,
    pokeAnger: 0.4,
    crumbleScore: 5000,
    sway: 18,
    rise: 34,
    gravity: 900,
  },
  /** The fight has three stages, set by the statue's health. */
  boss: {
    /** Stage 2 starts at this share of health. */
    stage2At: 0.6,
    /** Fixed threshold for the original guardian. */
    laserAt: 0.25,
    /** Warning before each throw. */
    windup: 0.5,
    throwEvery: [1.5, 1.2, 1.7] as const, // per stage
    throwSpeed: [[210, 260], [270, 330], [230, 280]] as const, // per stage
    /** Stages 2 and 3 throw three at once, this far apart (radians). */
    spread: 0.2,
    laser: { charge: 1, lock: 0.45, fire: 0.5, rest: 0.8, halfWidth: 13 },
  },
  powers: { hp: 48, cap: 8, warning: 1, touchWarning: 1.2, recovery: 1, touchRecovery: 1.2, speed: 225, lifetime: 3.4,
    sweepDuration: 2.4, sweepArc: 2.1, shieldDuration: 2.4 },
  crumbleTime: 2.2,
  lostDelay: 1.2,
  maxParticles: 420,
};

/* ------------------------------------------------------------------ */
/* Setup                                                               */
/* ------------------------------------------------------------------ */

/** Where the statue's eye is, as a fraction of its box. */
export const EYE = { x: 0.33, y: 0.265 };

/** Small seeded random generator, so simulations can be repeated. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function between(random: () => number, min: number, max: number) {
  return min + random() * (max - min);
}

/**
 * The statue image cut into a grid. `cover[row * cols + col]` is how much
 * of that tile is statue, 0 → 1. Any tile with marble in it is drawn (so
 * the outline stays smooth); only well-filled tiles can be hit.
 */
export function createStatue(home: Rect, cols: number, rows: number, cover: number[]): Statue {
  const tiles: Tile[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const filled = cover[row * cols + col];
      if (filled < 0.02) continue;
      tiles.push({ col, row, solid: filled > 0.35, attached: true, x: 0, y: 0, vx: 0, vy: 0, angle: 0, spin: 0 });
    }
  }
  // Tiles break from the outside in, toward the eye, so the statue shrinks
  // to its head and never becomes a hollow shell that shots fly through.
  // Thin edge tiles go a little earlier, so what is left can always be hit.
  const far = (t: Tile) =>
    Math.hypot(t.col + 0.5 - EYE.x * cols, t.row + 0.5 - EYE.y * rows) + (t.solid ? 0 : 1.5);
  return {
    home,
    cols,
    rows,
    tiles,
    dx: 0,
    dy: 0,
    hp: TUNING.statue.hp,
    maxHp: TUNING.statue.hp,
    breakOrder: [...tiles].sort((a, b) => far(b) - far(a)),
    broken: 0,
    stage: 1,
    throwIn: TUNING.boss.throwEvery[0],
    windup: 0,
    side: 1,
    laser: null,
    wake: 0,
    time: 0,
  };
}

function makeRock(
  world: World,
  size: 0 | 1 | 2,
  x: number,
  y: number,
  direction?: number
): Rock {
  const { random, scale } = world;
  const [min, max] = TUNING.rock.speed[size];
  const speed = between(random, min, max) * scale;
  const angle = direction ?? random() * Math.PI * 2;
  const corners = 9 + Math.floor(random() * 3);
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size,
    r: TUNING.rock.radius[size] * scale,
    angle: random() * Math.PI * 2,
    spin: between(random, -1.2, 1.2),
    shape: Array.from({ length: corners }, () => between(random, 0.72, 1.12)),
  };
}

/** The rocks are chips of the statue: one breaks off its shoulders and drifts up and away. */
function chipFromStatue(world: World): Rock {
  const { random } = world;
  const { home } = world.statue;
  const x = home.x + home.w * between(random, 0.25, 0.75);
  const y = home.y + home.h * between(random, 0.3, 0.45);
  burst(world, x, y, 10, MARBLE, 120, 300);
  return keepOut(world, makeRock(world, 0, x, y, -Math.PI / 2 + between(random, -1.3, 1.3)));
}

/** Never start a hazard on the ship: slide it forward along its path to the edge of a 60px bubble. */
function keepOut(world: World, rock: Rock) {
  const { ship } = world;
  const rx = rock.x - ship.x, ry = rock.y - ship.y, speed = Math.hypot(rock.vx, rock.vy);
  if (!ship.alive || !speed || rx * rx + ry * ry >= 3600) return rock;
  const dx = rock.vx / speed, dy = rock.vy / speed, along = rx * dx + ry * dy;
  const t = Math.sqrt(along * along - rx * rx - ry * ry + 3600) - along;
  rock.x += dx * t;
  rock.y += dy * t;
  return rock;
}

function addDebris(world: World, t: TargetRect, count: number, colors: string[]) {
  const { random } = world;
  for (let i = 0; i < count && world.debris.length < TUNING.maxDebris; i++) {
    // Most of it lies along the bottom edge, like a pile.
    const drop = random() * random();
    world.debris.push({
      x: Math.round(t.x + random() * t.w),
      y: Math.round(t.y + t.h * (1 - drop * 0.6)),
      size: 3 + Math.floor(random() * 4),
      color: colors[Math.floor(random() * colors.length)],
    });
  }
}

export function createWorld(opts: {
  w: number;
  h: number;
  shipAt?: { x: number; y: number };
  statue: Statue;
  random: () => number;
  particleScale?: number;
  touch?: boolean;
  phoneMode?: boolean;
  level?: number;
  upgrades?: Upgrades;
}): World {
  const upgrades = { ...(opts.upgrades ?? emptyResources().upgrades) };
  const world: World = {
    w: opts.w,
    h: opts.h,
    phoneMode: opts.phoneMode ?? false,
    phase: "play",
    phaseTime: 0,
    time: 0,
    ship: {
      x: opts.shipAt?.x ?? opts.w / 2,
      y: opts.shipAt?.y ?? opts.h / 2,
      vx: 0,
      vy: 0,
      angle: 0,
      alive: true,
      safe: TUNING.ship.safeTime + upgrades.shield * 0.5,
      respawn: 0,
      thrusting: false,
    },
    rocks: [],
    bullets: [],
    particles: [],
    statue: opts.statue,
    targets: [],
    windowHp: {},
    destroyedIcons: [],
    crashedWindows: [],
    scars: [],
    debris: [],
    anger: 0,
    lives: TUNING.lives + upgrades.hull,
    upgrades,
    score: 0,
    level: validLevel(opts.level) ? opts.level : 1,
    attack: restingPower(opts.touch ?? false),
    fireIn: 0,
    spawnIn: TUNING.rock.spawnEvery,
    scale: Math.max(0.6, Math.min(1, opts.w / 900)),
    touch: opts.touch ?? false,
    controls: [],
    particleScale: opts.particleScale ?? 1,
    random: opts.random,
    lostSent: false,
  };
  // Let the revised encounters show more than one pattern before a focused burst wins.
  if (world.level > 1) world.statue.hp = world.statue.maxHp = TUNING.powers.hp;
  // The pointer "becomes" the ship.
  burst(world, world.ship.x, world.ship.y, 28, SPARK, 240);
  for (let i = 0; i < TUNING.rock.start; i++) world.rocks.push(chipFromStatue(world));
  return world;
}

/** Update where the windows and icons are (topmost first). Keeps their damage. */
export function setTargets(world: World, targets: TargetRect[]) {
  world.targets = targets.filter(
    (t) =>
      !(t.kind === "icon" && world.destroyedIcons.includes(t.id)) &&
      !(t.kind === "window" && world.crashedWindows.includes(t.id))
  );
}

/** The screen changed size. */
export function resize(world: World, w: number, h: number, statueHome: Rect) {
  world.w = w;
  world.h = h;
  world.statue.home = statueHome;
  world.scale = Math.max(0.6, Math.min(1, w / 900));
  // Live attacks carry on; pieces now off the screen leave in step(), a warned origin is pulled back in.
  clampOrigin(world);
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function wrap(world: World, o: { x: number; y: number }, margin: number) {
  const h = world.h;
  if (o.x < -margin) o.x += world.w + margin * 2;
  else if (o.x > world.w + margin) o.x -= world.w + margin * 2;
  if (o.y < -margin) o.y += h + margin * 2;
  else if (o.y > h + margin) o.y -= h + margin * 2;
}

/** Push the ship out of the touch-button boxes. They sit at the bottom corners, so it goes up or sideways, never under them. */
function avoidControls(world: World, ship: Ship) {
  const m = TUNING.ship.radius * (world.phoneMode ? TUNING.phone.shipScale : 1);
  for (const c of world.controls) {
    const left = ship.x - (c.x - m), right = c.x + c.w + m - ship.x, up = ship.y - (c.y - m);
    if (left <= 0 || right <= 0 || up <= 0 || ship.y >= c.y + c.h + m) continue;
    const min = Math.min(left, right, up);
    if (min === up) ship.y -= up;
    else if (min === left) ship.x -= left;
    else ship.x += right;
  }
}

function burst(
  world: World,
  x: number,
  y: number,
  count: number,
  colors: string[],
  speed: number,
  gravity = 0
) {
  const n = Math.round(count * world.particleScale);
  for (let i = 0; i < n && world.particles.length < TUNING.maxParticles; i++) {
    const a = world.random() * Math.PI * 2;
    const s = speed * (0.3 + world.random() * 0.7);
    const life = 0.4 + world.random() * 0.6;
    world.particles.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life,
      maxLife: life,
      color: colors[Math.floor(world.random() * colors.length)],
      size: world.random() < 0.3 ? 3 : 2,
      gravity,
    });
  }
}

const MARBLE = ["#f2f2f2", "#d8d8d8", "#b8b8b8", "#909090"];
const ICON_BITS = ["#ffd800", "#000080", "#e04040", "#40c040", "#ffffff", "#a0662c"];
const SPARK = ["#ffffe1", "#ffd800", "#ff8c1a"];
const WINDOW_BITS = ["#c0c0c0", "#000080", "#ffffff", "#808080"];

function addAnger(world: World, amount: number) {
  if (world.phase !== "play") return;
  world.anger = Math.min(100, world.anger + amount);
}

function setPhase(world: World, phase: Phase) {
  world.phase = phase;
  world.phaseTime = 0;
}

/** Where a statue tile is on screen right now (top-left corner). */
export function tileOrigin(statue: Statue, tile: Tile) {
  const tw = statue.home.w / statue.cols;
  const th = statue.home.h / statue.rows;
  if (!tile.attached) return { x: tile.x, y: tile.y, w: tw, h: th };
  return {
    x: statue.home.x + statue.dx + tile.col * tw,
    y: statue.home.y + statue.dy + tile.row * th,
    w: tw,
    h: th,
  };
}

function attachedTileAt(statue: Statue, x: number, y: number): Tile | undefined {
  const tw = statue.home.w / statue.cols;
  const th = statue.home.h / statue.rows;
  const col = Math.floor((x - statue.home.x - statue.dx) / tw);
  const row = Math.floor((y - statue.home.y - statue.dy) / th);
  if (col < 0 || row < 0 || col >= statue.cols || row >= statue.rows) return undefined;
  return statue.tiles.find((t) => t.attached && t.solid && t.col === col && t.row === row);
}

/** The eye on screen right now. */
export function eyePoint(statue: Statue) {
  return {
    x: statue.home.x + statue.dx + EYE.x * statue.home.w,
    y: statue.home.y + statue.dy + EYE.y * statue.home.h,
  };
}

/** Where the next throw leaves from: the shoulder, sliding toward the head as the statue shrinks. */
export function throwPoint(statue: Statue) {
  const left = statue.hp / statue.maxHp;
  const eye = eyePoint(statue);
  const shoulderX = statue.home.x + statue.dx + statue.home.w * (0.5 + statue.side * 0.26);
  const shoulderY = statue.home.y + statue.dy + statue.home.h * 0.38;
  return { x: eye.x + (shoulderX - eye.x) * left, y: eye.y + (shoulderY - eye.y) * left };
}

/** Boss stage from the statue's health: 1 throws, 2 fast spreads, 3 laser eye. */
export function bossStage(world: World): 1 | 2 | 3 {
  const left = world.statue.hp / world.statue.maxHp;
  const { laserAt, stage2At } = TUNING.boss;
  if (left <= laserAt) return 3;
  return left <= stage2At ? 2 : 1;
}

function loseShip(world: World, events: GameEvent[]) {
  const { ship } = world;
  ship.alive = false;
  ship.respawn = TUNING.ship.respawnTime;
  world.lives -= 1;
  burst(world, ship.x, ship.y, 40, SPARK, 260);
  burst(world, ship.x, ship.y, 20, ["#ffffff", "#000000"], 180);
  events.push({ type: "shipLost", livesLeft: world.lives });
  if (world.phase === "boss") clearAttacks(world);
  if (world.lives <= 0) setPhase(world, "lost");
}

/** The statue's turn: warn, throw, and (in stage 3) the laser eye. */
function bossAttack(world: World, dt: number, events: GameEvent[]) {
  const { ship, statue, random } = world;
  const B = TUNING.boss;

  const stage = bossStage(world);
  if (stage !== statue.stage) {
    statue.stage = stage;
    // No rest first: a good player reaches stage 3 at 9 hp and would win before a full cycle.
    if (stage === 3) statue.laser = { state: "rest", t: 0, angle: 0 };
    if (stage !== 1) events.push({ type: "bossStage", stage });
  }

  if (statue.windup > 0) {
    statue.windup -= dt;
    if (statue.windup <= 0) {
      statue.windup = 0;
      const from = throwPoint(statue);
      const aim = Math.atan2(ship.y - from.y, ship.x - from.x) + between(random, -0.03, 0.03);
      const [slow, quick] = B.throwSpeed[stage - 1];
      for (const turn of stage === 1 ? [0] : [-B.spread, 0, B.spread]) {
        const chunk = makeRock(world, stage === 1 && random() < 0.5 ? 1 : 2, from.x, from.y, aim + turn);
        // Only half the small-screen shrink and slow-down: a phone is narrow, but the ship is just as far away.
        const small = (1 + world.scale) / 2;
        const speed = between(random, slow, quick) * small;
        chunk.r = TUNING.rock.radius[chunk.size] * small;
        chunk.vx = Math.cos(aim + turn) * speed;
        chunk.vy = Math.sin(aim + turn) * speed;
        chunk.thrown = true;
        if (world.rocks.length < TUNING.powers.cap - (statue.laser ? 1 : 0)) world.rocks.push(keepOut(world, chunk));
      }
    }
  } else {
    statue.throwIn -= dt;
    if (statue.throwIn <= 0) {
      statue.throwIn = B.throwEvery[stage - 1];
      statue.windup = B.windup;
      statue.side = ship.x < statue.home.x + statue.dx + statue.home.w / 2 ? -1 : 1;
      events.push({ type: "throwWarn" });
    }
  }

  const laser = statue.laser;
  if (!laser) return;
  const eye = eyePoint(statue);
  laser.t -= dt;
  // While charging, the beam follows the ship. Once locked it stays put: that is the moment to move.
  if (laser.state === "charge") laser.angle = Math.atan2(ship.y - eye.y, ship.x - eye.x);
  if (laser.t <= 0) {
    if (laser.state === "rest") {
      laser.state = "charge";
      laser.t = B.laser.charge;
      laser.angle = Math.atan2(ship.y - eye.y, ship.x - eye.x);
      events.push({ type: "laserCharge" });
    } else if (laser.state === "charge") {
      laser.state = "lock";
      laser.t = B.laser.lock;
    } else if (laser.state === "lock") {
      laser.state = "fire";
      laser.t = B.laser.fire;
      events.push({ type: "laserFire" });
    } else {
      laser.state = "rest";
      laser.t = B.laser.rest;
    }
  }
  if (laser.state === "fire" && ship.safe <= 0) {
    const px = ship.x - eye.x;
    const py = ship.y - eye.y;
    const along = px * Math.cos(laser.angle) + py * Math.sin(laser.angle);
    const off = Math.abs(py * Math.cos(laser.angle) - px * Math.sin(laser.angle));
    if (along > 0 && off < B.laser.halfWidth + TUNING.ship.radius * (world.phoneMode ? TUNING.phone.shipScale : 1) * 0.5) loseShip(world, events);
  }
}

function restingPower(touch = false): PowerAttack {
  return { state: "rest", t: touch ? TUNING.powers.touchRecovery : TUNING.powers.recovery,
    elapsed: 0, x: 0, y: 0, angle: 0, lanes: [], wave: 0, direction: 1, targetX: 0 };
}

function clearAttacks(world: World) {
  world.attack = restingPower(world.touch);
  world.rocks = [];
  // The stage stays, so its announcement does not replay after a death.
  const { statue } = world;
  statue.laser = statue.stage === 3 ? { state: "rest", t: TUNING.boss.laser.rest, angle: 0 } : null;
  statue.windup = 0;
  statue.throwIn = TUNING.boss.throwEvery[statue.stage - 1];
}

/** Keep a power's origin inside the playfield, with room below for the halo's 28px start ring and the 18px floor margin. */
function clampOrigin(world: World) {
  const a = world.attack;
  a.x = Math.max(30, Math.min(world.w - 30, a.x));
  a.y = Math.max(30, Math.min(world.h - 46, a.y));
}

export function orbitRadius(world: World) {
  return Math.min(105, world.h * 0.23);
}
export function powerWarning(world: World) {
  return world.touch ? TUNING.powers.touchWarning : TUNING.powers.warning;
}
export function hazardLimit(world: World) {
  const touch = world.touch;
  if (world.level === 2) return touch ? 9 : 12;
  if (world.level === 3) return touch ? 12 : 16;
  if (world.level === 4) return 18; // three warned waves of six can all be falling on a tall screen
  if (world.level === 5) return 3;
  return TUNING.powers.cap;
}
export function sweepAngle(world: World) {
  const a = world.attack;
  const direction = a.direction * (a.wave === 0 ? 1 : -1);
  return a.angle + direction * TUNING.powers.sweepArc * (Math.min(1, a.elapsed / TUNING.powers.sweepDuration) - 0.5);
}

/** Long enough to cross the whole playfield, so pieces never vanish mid-air on a big screen. */
function pieceLife(world: World, speed: number) {
  return Math.max(TUNING.powers.lifetime, Math.hypot(world.w, world.h) / (speed * world.scale));
}

/** Halo ring layout. Turning the gap by half a gap plus half a step puts a piece on the line to a still ship. */
function halo(world: World) {
  const count = world.touch ? 6 : 8, gap = Math.PI * 0.4;
  return { count, gap, step: (Math.PI * 2 - gap) / count };
}

function fragment(world: World, x: number, y: number, angle: number, speed = TUNING.powers.speed) {
  if (world.rocks.length >= hazardLimit(world)) return null;
  const rock = makeRock(world, 2, x, y, angle);
  rock.power = true;
  rock.life = pieceLife(world, speed);
  rock.vx = Math.cos(angle) * speed * world.scale;
  rock.vy = Math.sin(angle) * speed * world.scale;
  world.rocks.push(keepOut(world, rock));
  return rock;
}

/** Lock a new, visible warning before each wave. Nothing tracks after this point. */
function warnPower(world: World, events: GameEvent[]) {
  const a = world.attack;
  const eye = eyePoint(world.statue), ring = halo(world);
  if (a.wave === 0 || world.level === 2) {
    const side = a.direction * (a.wave % 2 ? -1 : 1);
    a.x = world.level === 2 ? world.statue.home.x + world.statue.dx + world.statue.home.w * (0.5 + side * 0.26) : eye.x;
    a.y = world.level === 2 ? world.statue.home.y + world.statue.dy + world.statue.home.h * 0.38 : eye.y;
    clampOrigin(world);
    a.angle = Math.atan2(world.ship.y - a.y, world.ship.x - a.x);
    if (world.level === 3) a.angle += (a.direction * (ring.gap + ring.step)) / 2;
  } else if (world.level === 3) a.angle += a.direction * ring.step;
  if (world.level === 4) {
    const target = Math.max(0, Math.min(4, Math.floor(world.ship.x / world.w * 5)));
    a.targetX = world.ship.x;
    a.lanes = [target, (target + 2 + a.wave % 2) % 5];
  }
  if (world.level === 5 && a.wave === 1) {
    for (const rock of world.rocks) rock.launchAngle = Math.atan2(world.ship.y - rock.y, world.ship.x - rock.x);
  }
  a.state = "warn"; a.t = powerWarning(world); a.elapsed = 0;
  events.push({ type: "powerWarn" });
}

function launchPower(world: World, events: GameEvent[]) {
  const a = world.attack, P = TUNING.powers;
  const touch = world.touch;
  a.state = "active"; a.elapsed = 0;
  a.t = P.lifetime;
  if (world.level === 2) {
    const count = touch ? 3 : 4;
    for (const turn of count === 3 ? [-0.32, 0, 0.32] : [-0.45, -0.2, 0, 0.3]) fragment(world, a.x, a.y, a.angle + turn * a.direction);
    if (a.wave < 2) a.t = 0.4;
  } else if (world.level === 3) {
    const { count, gap, step } = halo(world);
    for (let i = 0; i < count; i++) {
      const angle = a.angle + gap / 2 + (i + 0.5) * step;
      const rock = fragment(world, a.x + Math.cos(angle) * 28, a.y + Math.sin(angle) * 28, angle, 190);
      if (rock) rock.launchAngle = a.angle;
    }
    if (a.wave === 0) a.t = 0.65;
  } else if (world.level === 4) {
    for (const lane of a.lanes) {
      const width = world.w / 5;
      const middle = lane === a.lanes[0] ? Math.max((lane + 0.1) * width, Math.min((lane + 0.9) * width, a.targetX)) : (lane + 0.5) * width;
      for (const x of [(lane + 0.2) * width, middle, (lane + 0.8) * width]) fragment(world, x, -8, Math.PI / 2, 245);
    }
    if (a.wave < 2) a.t = 0.55;
  } else if (world.level === 5) {
    if (a.wave === 0) {
      for (let i = 0; i < 3; i++) {
        const angle = a.angle + Math.PI / 3 + i * Math.PI * 2 / 3;
        const radius = orbitRadius(world);
        const rock = fragment(world, a.x + Math.cos(angle) * radius, a.y + Math.sin(angle) * radius, angle, 0);
        if (rock) { rock.orbit = angle; rock.life = P.shieldDuration + powerWarning(world) + 0.5; rock.r *= 1.65; }
      }
      a.t = P.shieldDuration;
    } else {
      for (const rock of world.rocks) {
        const angle = rock.launchAngle ?? 0;
        delete rock.orbit;
        rock.vx = Math.cos(angle) * 245 * world.scale;
        rock.vy = Math.sin(angle) * 245 * world.scale;
        rock.life = pieceLife(world, 245);
      }
    }
  } else if (world.level === 6) {
    a.t = P.sweepDuration;
    events.push({ type: "laserFire" });
  }
}

/** Distinct multi-wave patterns: each launch has its own locked warning and a bounded budget. */
function powerAttack(world: World, dt: number, events: GameEvent[]) {
  const a = world.attack;
  a.t -= dt;
  if (a.state === "rest") {
    if (a.t > 0) return;
    world.statue.side = world.statue.side === 1 ? -1 : 1;
    a.direction = world.statue.side;
    warnPower(world, events);
    return;
  }
  if (a.state === "warn") {
    if (a.t <= 0) launchPower(world, events);
    return;
  }
  a.elapsed += dt;
  if (world.level === 6 && world.ship.safe <= 0) {
    const angle = sweepAngle(world);
    const px = world.ship.x - a.x, py = world.ship.y - a.y;
    const along = px * Math.cos(angle) + py * Math.sin(angle);
    const off = Math.abs(py * Math.cos(angle) - px * Math.sin(angle));
    if (along > 0 && off < 9 + TUNING.ship.radius * (world.phoneMode ? TUNING.phone.shipScale : 1) * 0.5) {
      loseShip(world, events);
      return;
    }
  }
  if (world.level === 5 && world.rocks.length === 0) {
    world.attack = restingPower(world.touch);
    return;
  }
  if (a.t <= 0) {
    const waves = world.level === 2 || world.level === 4 ? 3 : 2;
    if (a.wave + 1 < waves) { a.wave++; warnPower(world, events); }
    // The last wave ends once its pieces have flown off or been shot, not mid-air.
    else if (world.rocks.length === 0) world.attack = restingPower(world.touch);
  }
}

function breakTile(world: World, tile: Tile, fromX: number, fromY: number) {
  const o = tileOrigin(world.statue, tile);
  tile.attached = false;
  tile.x = o.x;
  tile.y = o.y;
  const away = Math.atan2(o.y + o.h / 2 - fromY, o.x + o.w / 2 - fromX);
  const speed = between(world.random, 120, 320);
  tile.vx = Math.cos(away) * speed;
  tile.vy = Math.sin(away) * speed - 160;
  tile.spin = between(world.random, -6, 6);
}

/* ------------------------------------------------------------------ */
/* One tick                                                            */
/* ------------------------------------------------------------------ */

export function step(world: World, input: Input, dt: number): GameEvent[] {
  const events: GameEvent[] = [];
  dt = Math.min(0.1, Math.max(0, dt));
  const { ship, statue } = world;
  // After a loss the world keeps moving a little longer, so the explosion plays.
  if (world.phase === "won") return events;

  world.time += dt;
  world.phaseTime += dt;
  if (world.phase === "awakening" && world.phaseTime < TUNING.awakenFreeze) return events;

  /* Ship */
  if (ship.alive) {
    if (input.joystick) {
      const { x, y } = input.joystick;
      const magnitude = Math.hypot(x, y);
      const scale = magnitude > 1 ? 1 / magnitude : 1;
      ship.thrusting = magnitude > 0;
      if (ship.thrusting) ship.angle = Math.atan2(x, -y);
      const response = ship.thrusting ? TUNING.joystick.response : TUNING.joystick.brake;
      const blend = 1 - Math.exp(-response * dt);
      const maxSpeed = world.phoneMode ? TUNING.phone.maxSpeed : TUNING.joystick.maxSpeed;
      ship.vx += (x * scale * maxSpeed - ship.vx) * blend;
      ship.vy += (y * scale * maxSpeed - ship.vy) * blend;
      if (!ship.thrusting && Math.hypot(ship.vx, ship.vy) < 1) {
        ship.vx = 0;
        ship.vy = 0;
      }
    } else {
      if (input.left) ship.angle -= TUNING.ship.turn * dt;
      if (input.right) ship.angle += TUNING.ship.turn * dt;
      ship.thrusting = input.thrust;
      if (input.thrust) {
        // Accelerate along the current heading without sideways momentum.
        // A phone keeps its slower speed with a Bluetooth keyboard too.
        const maxSpeed = world.phoneMode ? TUNING.phone.maxSpeed : TUNING.ship.maxSpeed;
        const speed = Math.min(maxSpeed, Math.hypot(ship.vx, ship.vy) + TUNING.ship.thrust * dt);
        ship.vx = Math.sin(ship.angle) * speed;
        ship.vy = -Math.cos(ship.angle) * speed;
      } else {
        ship.vx = 0;
        ship.vy = 0;
      }
    }
    ship.x += ship.vx * dt;
    ship.y += ship.vy * dt;
    wrap(world, ship, 12);
    avoidControls(world, ship);
    ship.safe = Math.max(0, ship.safe - dt);

    world.fireIn -= dt;
    if (input.fire && !fightOver(world) && world.fireIn <= 0 && world.bullets.length < TUNING.bullet.max) {
      // Keep this tick's overshoot (an idle gun starts fresh), so the real rate matches the cooldown.
      world.fireIn = (world.fireIn > -dt ? world.fireIn : 0) + TUNING.bullet.cooldown - world.upgrades.blaster * 0.02;
      const dx = Math.sin(ship.angle);
      const dy = -Math.cos(ship.angle);
      const nose = TUNING.ship.nose * (world.phoneMode ? TUNING.phone.shipScale : 1);
      world.bullets.push({
        x: ship.x + dx * nose,
        y: ship.y + dy * nose,
        vx: dx * TUNING.bullet.speed + ship.vx,
        vy: dy * TUNING.bullet.speed + ship.vy,
        life: TUNING.bullet.life,
      });
      // Keep the muzzle flash without pushing the ship off course.
      burst(world, ship.x + dx * nose, ship.y + dy * nose, 4, SPARK, 110);
      events.push({ type: "shot" });
    }
  } else if (world.lives > 0) {
    ship.respawn -= dt;
    if (ship.respawn <= 0) {
      Object.assign(ship, {
        x: world.w / 2,
        // Below the level-4 rain's 60px keep-out band at the top.
        y: Math.max(80, world.h * 0.18),
        vx: 0,
        vy: 0,
        angle: 0,
        alive: true,
        safe: TUNING.ship.safeTime + world.upgrades.shield * 0.5,
      });
    }
  }

  /* Rocks */
  if (world.phase === "awakening") {
    // The chips fly home: the statue pulls itself back together, and the
    // fight that follows is only what it throws at you.
    const cx = statue.home.x + statue.home.w / 2;
    const cy = statue.home.y + statue.home.h * 0.45;
    for (const rock of world.rocks) {
      const d = Math.hypot(cx - rock.x, cy - rock.y) || 1;
      rock.vx = ((cx - rock.x) / d) * TUNING.rock.recallSpeed;
      rock.vy = ((cy - rock.y) / d) * TUNING.rock.recallSpeed;
    }
    world.rocks = world.rocks.filter((r) => Math.hypot(cx - r.x, cy - r.y) > 30);
  }
  for (const rock of world.rocks) {
    if (rock.life !== undefined) rock.life -= dt;
    if (rock.orbit !== undefined) {
      if (!(world.level === 5 && world.attack.state === "warn" && world.attack.wave === 1)) rock.orbit += dt * 1.1;
      const radius = orbitRadius(world);
      rock.x = world.attack.x + Math.cos(rock.orbit) * radius;
      rock.y = world.attack.y + Math.sin(rock.orbit) * radius;
    }
    rock.x += rock.vx * dt;
    rock.y += rock.vy * dt;
    rock.angle += rock.spin * dt;
    if (!rock.thrown && world.phase === "play") wrap(world, rock, rock.r);
  }
  // Thrown marble that missed leaves the screen for good.
  world.rocks = world.rocks.filter(
    (r) => (r.life === undefined || r.life > 0) && (!(r.thrown || r.power) || (r.x > -r.r && r.x < world.w + r.r && r.y > -r.r && r.y < world.h + r.r))
  );

  if (world.phase === "play") {
    world.spawnIn -= dt;
    if (world.spawnIn <= 0) {
      world.spawnIn = TUNING.rock.spawnEvery;
      if (world.rocks.length < TUNING.rock.max - 2) world.rocks.push(chipFromStatue(world));
    }
    addAnger(world, TUNING.angerPerSecond * dt);
    if (world.anger >= 100 || world.phaseTime >= TUNING.maxPlayTime) {
      world.anger = 100;
      setPhase(world, "awakening");
      events.push({ type: "statueAwake" });
    }
  }

  /* Statue */
  statue.time += dt;
  if (world.phase === "awakening") {
    statue.wake = Math.min(1, (world.phaseTime - TUNING.awakenFreeze) / TUNING.awakenTime);
    if (statue.wake >= 1) {
      world.rocks = [];
      setPhase(world, "boss");
    }
  }
  if (world.phase === "awakening" || world.phase === "boss") {
    statue.dx = Math.sin(statue.time * 0.8) * TUNING.statue.sway * statue.wake;
    statue.dy = -TUNING.statue.rise * statue.wake + Math.sin(statue.time * 1.7) * 4 * statue.wake;
  }
  if (world.phase === "boss" && ship.alive) {
    if (world.level === 1) bossAttack(world, dt, events);
    else powerAttack(world, dt, events);
  }
  for (const tile of statue.tiles) {
    if (tile.attached) continue;
    tile.vy += TUNING.statue.gravity * dt;
    tile.x += tile.vx * dt;
    tile.y += tile.vy * dt;
    tile.angle += tile.spin * dt;
  }
  // Forget pieces that have fallen off the screen.
  statue.tiles = statue.tiles.filter((t) => t.attached || t.y < world.h + 80);

  /* Bullets */
  const keep: Bullet[] = [];
  for (const b of world.bullets) {
    b.life -= dt;
    if (b.life <= 0) continue;
    // Short hops, so a fast shot cannot skip a small rock or a phone-sized statue tile.
    const hops = Math.ceil((Math.hypot(b.vx, b.vy) * dt) / 3) || 1;
    let hit = false;
    for (let i = 0; i < hops && !hit; i++) {
      b.x += (b.vx * dt) / hops;
      b.y += (b.vy * dt) / hops;
      wrap(world, b, 0);
      hit = hitSomething(world, b, events);
    }
    if (!hit) keep.push(b);
  }
  world.bullets = keep;

  /* Ship vs rocks (not while the chips fly home: that would be unfair) */
  if (ship.alive && ship.safe <= 0 && world.phase !== "awakening") {
    for (const rock of world.rocks) {
      const reach = rock.r * 0.85 + TUNING.ship.radius * (world.phoneMode ? TUNING.phone.shipScale : 1);
      if ((rock.x - ship.x) ** 2 + (rock.y - ship.y) ** 2 < reach * reach) {
        loseShip(world, events);
        break;
      }
    }
  }

  /* Particles */
  for (const p of world.particles) {
    p.vy += p.gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
  }
  world.particles = world.particles.filter((p) => p.life > 0);

  /* Phase endings */
  if (world.phase === "crumbling" && world.phaseTime >= TUNING.crumbleTime) {
    setPhase(world, "won");
    events.push({ type: "won" });
  }
  if (world.phase === "lost" && world.phaseTime >= TUNING.lostDelay && !world.lostSent) {
    world.lostSent = true;
    events.push({ type: "lost" });
  }

  return events;
}

function fightOver(world: World) {
  return world.phase === "crumbling" || world.phase === "lost";
}

/** Bullet collisions, topmost first: rocks, the awake statue, windows, icons, the sleeping wallpaper statue. */
function hitSomething(world: World, b: Bullet, events: GameEvent[]): boolean {
  const { random } = world;
  // Shots still in flight after the fight score nothing.
  if (fightOver(world)) return false;

  for (let i = 0; i < world.rocks.length; i++) {
    const rock = world.rocks[i];
    if ((rock.x - b.x) ** 2 + (rock.y - b.y) ** 2 > rock.r * rock.r) continue;
    // Thrown marble is too hot to break: the shot just sparks off it. Dodge it.
    if (rock.thrown) {
      burst(world, b.x, b.y, 4, SPARK, 120);
      return true;
    }
    world.rocks.splice(i, 1);
    world.score += TUNING.rock.score[rock.size];
    addAnger(world, TUNING.rock.anger[rock.size]);
    burst(world, rock.x, rock.y, 10 + (2 - rock.size) * 6, MARBLE, 160);
    events.push({ type: "rockBroken", size: rock.size });
    if (rock.size < 2 && !rock.power) {
      const next = (rock.size + 1) as 1 | 2;
      const heading = Math.atan2(rock.vy, rock.vx);
      for (const turn of [-0.6, 0.6]) {
        world.rocks.push(makeRock(world, next, rock.x, rock.y, heading + turn + between(random, -0.2, 0.2)));
      }
    }
    return true;
  }

  const { statue } = world;
  // Awake, the statue is drawn over the windows; while it wakes it only swallows the shot.
  if (world.phase !== "play" && attachedTileAt(statue, b.x, b.y)) {
    if (world.phase === "boss") damageStatue(world, b, events);
    return true;
  }

  for (const t of world.targets) {
    if (b.x < t.x || b.x > t.x + t.w || b.y < t.y || b.y > t.y + t.h) continue;
    if (t.kind === "icon") {
      world.destroyedIcons.push(t.id);
      world.score += TUNING.icon.score;
      addAnger(world, TUNING.icon.anger);
      burst(world, t.x + t.w / 2, t.y + t.h / 2, 26, ICON_BITS, 200, 300);
      addDebris(world, t, 14, ICON_BITS);
      events.push({ type: "iconDestroyed", id: t.id });
    } else {
      const hp = (world.windowHp[t.id] ?? TUNING.window.hp) - 1;
      world.windowHp[t.id] = hp;
      burst(world, b.x, b.y, 8, SPARK, 150);
      if (hp > 0) {
        world.score += TUNING.window.hitScore;
        addAnger(world, TUNING.window.hitAnger);
        world.scars.push({ id: t.id, x: Math.round(b.x), y: Math.round(b.y) });
        events.push({ type: "windowHit", id: t.id, left: hp });
      } else {
        world.crashedWindows.push(t.id);
        delete world.windowHp[t.id];
        world.score += TUNING.window.crashScore;
        addAnger(world, TUNING.window.crashAnger);
        burst(world, t.x + t.w / 2, t.y + t.h / 2, 30, WINDOW_BITS, 220, 300);
        world.scars = world.scars.filter((s) => s.id !== t.id);
        addDebris(world, t, 70, WINDOW_BITS);
        events.push({ type: "windowCrashed", id: t.id });
      }
    }
    const gone = t.kind === "icon" || world.crashedWindows.includes(t.id);
    if (gone) world.targets = world.targets.filter((x) => x !== t);
    return true;
  }

  // Poking the sleeping wallpaper statue (under every window) just makes it angrier.
  if (world.phase === "play" && attachedTileAt(statue, b.x, b.y)) {
    world.score += TUNING.statue.pokeScore;
    addAnger(world, TUNING.statue.pokeAnger);
    burst(world, b.x, b.y, 5, MARBLE, 90, 400);
    return true;
  }

  return false;
}

/** One bullet on the statue: lose a hit point and shed tiles until the picture matches the health bar. */
function damageStatue(world: World, b: Bullet, events: GameEvent[]) {
  const { statue } = world;
  statue.hp -= 1;
  world.score += TUNING.statue.hitScore;
  events.push({ type: "statueHit" });
  burst(world, b.x, b.y, 8, MARBLE, 140, 500);
  // Break tiles until the picture matches the health bar again.
  const keep = Math.ceil((statue.breakOrder.length * Math.max(0, statue.hp)) / statue.maxHp);
  while (statue.breakOrder.length - statue.broken > keep) {
    breakTile(world, statue.breakOrder[statue.broken++], b.x, b.y);
  }
  // (If only unhittable edge tiles were left, it would be over too.)
  if (statue.hp <= 0 || !statue.tiles.some((t) => t.attached && t.solid)) {
    for (const t of statue.tiles) if (t.attached) breakTile(world, t, b.x, b.y - 200);
    statue.hp = 0;
    clearAttacks(world);
    world.score += TUNING.statue.crumbleScore;
    world.rocks = [];
    setPhase(world, "crumbling");
    events.push({ type: "statueCrumbled" });
  }
}

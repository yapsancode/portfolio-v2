/**
 * Olympus — the game rules. No React, no DOM: the overlay feeds in the
 * screen size, where the windows and icons are, and the keys held down,
 * then calls step() 60 times a second and reacts to the events it returns.
 *
 * Phases: play (shoot the desktop, the statue gets angry) → awakening
 * (the statue wakes up) → boss (it throws marble, you chip it apart) →
 * crumbling → won. Losing every life at any point → lost.
 */

export type Phase = "play" | "awakening" | "boss" | "crumbling" | "won" | "lost";

export type Input = {
  left: boolean;
  right: boolean;
  thrust: boolean;
  fire: boolean;
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
};

/** The statue's laser eye: it charges (following you), locks, fires, rests. */
export type Laser = {
  state: "rest" | "charge" | "lock" | "fire";
  /** Seconds left in this state. */
  t: number;
  /** Direction of the beam, radians (0 = right, clockwise on screen). */
  angle: number;
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
  score: number;
  /** 1 on the first game; each win in a row makes the next run harder. */
  run: number;
  fireIn: number;
  spawnIn: number;
  /** Below 1 on small screens: rocks are smaller and slower there. */
  scale: number;
  /** Pixels at the bottom the ship stays out of (the touch buttons). */
  shipFloor: number;
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
  ship: {
    radius: 10,
    turn: 5.4, // rad/s (~310°/s)
    thrust: 560, // px/s²
    drag: 0.8, // per second
    maxSpeed: 520,
    safeTime: 2,
    respawnTime: 1.4,
    recoil: 4, // px/s per shot
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
    /** Stage 3 (laser eye) starts here on run 1, and earlier on every later run. */
    laserAt: 0.25,
    laserAtPerRun: 0.15,
    laserAtMax: 0.7,
    /** Every run after the first is this much faster. */
    runSpeedUp: 0.12,
    /** Warning before each throw. */
    windup: 0.5,
    throwEvery: [1.5, 1.2, 1.7] as const, // per stage
    throwSpeed: [[210, 260], [270, 330], [230, 280]] as const, // per stage
    /** Stages 2 and 3 throw three at once, this far apart (radians). */
    spread: 0.2,
    laser: { charge: 1, lock: 0.45, fire: 0.5, rest: 0.8, halfWidth: 13 },
  },
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
  return makeRock(world, 0, x, y, -Math.PI / 2 + between(random, -1.3, 1.3));
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
  shipFloor?: number;
  run?: number;
}): World {
  const world: World = {
    w: opts.w,
    h: opts.h,
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
      safe: TUNING.ship.safeTime,
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
    lives: TUNING.lives,
    score: 0,
    run: opts.run ?? 1,
    fireIn: 0,
    spawnIn: TUNING.rock.spawnEvery,
    scale: Math.max(0.6, Math.min(1, opts.w / 900)),
    shipFloor: opts.shipFloor ?? 0,
    particleScale: opts.particleScale ?? 1,
    random: opts.random,
    lostSent: false,
  };
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
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function wrap(world: World, o: { x: number; y: number }, margin: number, floor = 0) {
  const h = world.h - floor;
  if (o.x < -margin) o.x += world.w + margin * 2;
  else if (o.x > world.w + margin) o.x -= world.w + margin * 2;
  if (o.y < -margin) o.y += h + margin * 2;
  else if (o.y > h + margin) o.y -= h + margin * 2;
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
  const { laserAt, laserAtPerRun, laserAtMax, stage2At } = TUNING.boss;
  if (left <= Math.min(laserAtMax, laserAt + laserAtPerRun * (world.run - 1))) return 3;
  return left <= stage2At ? 2 : 1;
}

function loseShip(world: World, events: GameEvent[]) {
  const { ship, statue } = world;
  ship.alive = false;
  ship.respawn = TUNING.ship.respawnTime;
  world.lives -= 1;
  burst(world, ship.x, ship.y, 40, SPARK, 260);
  burst(world, ship.x, ship.y, 20, ["#ffffff", "#000000"], 180);
  events.push({ type: "shipLost", livesLeft: world.lives });
  // The laser starts over, so it never fires at an empty screen.
  if (statue.laser) statue.laser = { state: "rest", t: TUNING.boss.laser.rest, angle: 0 };
  statue.windup = 0;
  if (world.lives <= 0) setPhase(world, "lost");
}

/** The statue's turn: warn, throw, and (in stage 3) the laser eye. */
function bossAttack(world: World, dt: number, events: GameEvent[]) {
  const { ship, statue, random } = world;
  const B = TUNING.boss;
  const fast = 1 + B.runSpeedUp * (world.run - 1);

  const stage = bossStage(world);
  if (stage !== statue.stage) {
    statue.stage = stage;
    if (stage === 3) statue.laser = { state: "rest", t: B.laser.rest, angle: 0 };
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
        const speed = between(random, slow, quick) * small * fast;
        chunk.r = TUNING.rock.radius[chunk.size] * small;
        chunk.vx = Math.cos(aim + turn) * speed;
        chunk.vy = Math.sin(aim + turn) * speed;
        chunk.thrown = true;
        world.rocks.push(chunk);
      }
    }
  } else {
    statue.throwIn -= dt;
    if (statue.throwIn <= 0) {
      statue.throwIn = B.throwEvery[stage - 1] / fast;
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
      laser.t = B.laser.charge / fast;
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
      laser.t = B.laser.rest / fast;
    }
  }
  if (laser.state === "fire" && ship.safe <= 0) {
    const px = ship.x - eye.x;
    const py = ship.y - eye.y;
    const along = px * Math.cos(laser.angle) + py * Math.sin(laser.angle);
    const off = Math.abs(py * Math.cos(laser.angle) - px * Math.sin(laser.angle));
    if (along > 0 && off < B.laser.halfWidth + TUNING.ship.radius * 0.5) loseShip(world, events);
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
  const { ship, statue } = world;
  // After a loss the world keeps moving a little longer, so the explosion plays.
  if (world.phase === "won") return events;

  world.time += dt;
  world.phaseTime += dt;
  if (world.phase === "awakening" && world.phaseTime < TUNING.awakenFreeze) return events;

  /* Ship */
  if (ship.alive) {
    if (input.left) ship.angle -= TUNING.ship.turn * dt;
    if (input.right) ship.angle += TUNING.ship.turn * dt;
    ship.thrusting = input.thrust;
    if (input.thrust) {
      ship.vx += Math.sin(ship.angle) * TUNING.ship.thrust * dt;
      ship.vy -= Math.cos(ship.angle) * TUNING.ship.thrust * dt;
    }
    const drag = Math.exp(-TUNING.ship.drag * dt);
    ship.vx *= drag;
    ship.vy *= drag;
    const speed = Math.hypot(ship.vx, ship.vy);
    if (speed > TUNING.ship.maxSpeed) {
      ship.vx *= TUNING.ship.maxSpeed / speed;
      ship.vy *= TUNING.ship.maxSpeed / speed;
    }
    ship.x += ship.vx * dt;
    ship.y += ship.vy * dt;
    wrap(world, ship, 12, world.shipFloor);
    ship.safe = Math.max(0, ship.safe - dt);

    world.fireIn -= dt;
    if (input.fire && world.fireIn <= 0 && world.bullets.length < TUNING.bullet.max) {
      world.fireIn = TUNING.bullet.cooldown;
      const dx = Math.sin(ship.angle);
      const dy = -Math.cos(ship.angle);
      world.bullets.push({
        x: ship.x + dx * 14,
        y: ship.y + dy * 14,
        vx: dx * TUNING.bullet.speed + ship.vx,
        vy: dy * TUNING.bullet.speed + ship.vy,
        life: TUNING.bullet.life,
      });
      // Muzzle flash and a small kick backwards.
      burst(world, ship.x + dx * 18, ship.y + dy * 18, 4, SPARK, 110);
      ship.vx -= dx * TUNING.ship.recoil;
      ship.vy -= dy * TUNING.ship.recoil;
      events.push({ type: "shot" });
    }
  } else if (world.lives > 0) {
    ship.respawn -= dt;
    if (ship.respawn <= 0) {
      Object.assign(ship, {
        x: world.w / 2,
        y: (world.h - world.shipFloor) * 0.18,
        vx: 0,
        vy: 0,
        angle: 0,
        alive: true,
        safe: TUNING.ship.safeTime,
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
    rock.x += rock.vx * dt;
    rock.y += rock.vy * dt;
    rock.angle += rock.spin * dt;
    if (!rock.thrown && world.phase === "play") wrap(world, rock, rock.r);
  }
  // Thrown marble that missed leaves the screen for good.
  world.rocks = world.rocks.filter(
    (r) => !r.thrown || (r.x > -r.r && r.x < world.w + r.r && r.y > -r.r && r.y < world.h + r.r)
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
  if (world.phase === "boss" && ship.alive) bossAttack(world, dt, events);
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
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    wrap(world, b, 0);
    if (b.life <= 0) continue;
    if (hitSomething(world, b, events)) continue;
    keep.push(b);
  }
  world.bullets = keep;

  /* Ship vs rocks (not while the chips fly home: that would be unfair) */
  if (ship.alive && ship.safe <= 0 && world.phase !== "awakening") {
    for (const rock of world.rocks) {
      const reach = rock.r * 0.85 + TUNING.ship.radius;
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

/** Bullet collisions, topmost first: rocks, statue, windows, icons. */
function hitSomething(world: World, b: Bullet, events: GameEvent[]): boolean {
  const { random } = world;

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
    if (rock.size < 2) {
      const next = (rock.size + 1) as 1 | 2;
      const heading = Math.atan2(rock.vy, rock.vx);
      for (const turn of [-0.6, 0.6]) {
        world.rocks.push(makeRock(world, next, rock.x, rock.y, heading + turn + between(random, -0.2, 0.2)));
      }
    }
    return true;
  }

  const { statue } = world;
  // Poking the sleeping statue just makes it angrier.
  if (world.phase === "play" && attachedTileAt(statue, b.x, b.y)) {
    world.score += TUNING.statue.pokeScore;
    addAnger(world, TUNING.statue.pokeAnger);
    burst(world, b.x, b.y, 5, MARBLE, 90, 400);
    return true;
  }
  if (world.phase === "boss") {
    const tile = attachedTileAt(statue, b.x, b.y);
    if (tile) {
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
        statue.laser = null;
        statue.windup = 0;
        world.score += TUNING.statue.crumbleScore;
        world.rocks = [];
        setPhase(world, "crumbling");
        events.push({ type: "statueCrumbled" });
      }
      return true;
    }
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

  return false;
}

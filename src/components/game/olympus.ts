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

/** One tile of the statue image, still attached or flying off. */
export type Tile = {
  col: number;
  row: number;
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
  hp: number;
  maxHp: number;
  throwIn: number;
  /** 0 → 1 while it wakes up (eye glow, rise). */
  wake: number;
  time: number;
};

export type GameEvent =
  | { type: "iconDestroyed"; id: string }
  | { type: "windowHit"; id: string }
  | { type: "windowCrashed"; id: string }
  | { type: "statueAwake" }
  | { type: "statueHit" }
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
  /** 0 → 100. At 100 the statue wakes up. */
  anger: number;
  lives: number;
  score: number;
  fireIn: number;
  spawnIn: number;
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
    turn: 4.6, // rad/s (~260°/s)
    thrust: 480, // px/s²
    drag: 0.8, // per second
    maxSpeed: 520,
    safeTime: 2,
    respawnTime: 1.4,
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
  },
  window: { hp: 3, hitScore: 50, crashScore: 500, hitAnger: 1, crashAnger: 5 },
  icon: { score: 150, anger: 3 },
  angerPerSecond: 2.2,
  /** The statue never wakes before this, however fast you shoot. */
  minPlayTime: 20,
  awakenTime: 2.4,
  statue: {
    hp: 55,
    tilesPerHit: [1, 2] as const,
    hitScore: 100,
    pokeScore: 10,
    pokeAnger: 1,
    crumbleScore: 5000,
    throwEvery: [1.9, 1.1] as const, // undamaged → nearly broken
    throwSpeed: [190, 260] as const,
    sway: 18,
    rise: 20,
    gravity: 900,
  },
  crumbleTime: 2.2,
  lostDelay: 1.2,
  maxParticles: 420,
};

/* ------------------------------------------------------------------ */
/* Setup                                                               */
/* ------------------------------------------------------------------ */

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
 * The statue image cut into a grid. `solid[row * cols + col]` says whether
 * that tile has enough of the statue in it to be worth drawing and hitting.
 */
export function createStatue(home: Rect, cols: number, rows: number, solid: boolean[]): Statue {
  const tiles: Tile[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (!solid[row * cols + col]) continue;
      tiles.push({ col, row, attached: true, x: 0, y: 0, vx: 0, vy: 0, angle: 0, spin: 0 });
    }
  }
  return {
    home,
    cols,
    rows,
    tiles,
    dx: 0,
    dy: 0,
    hp: TUNING.statue.hp,
    maxHp: TUNING.statue.hp,
    throwIn: TUNING.statue.throwEvery[0],
    wake: 0,
    time: 0,
  };
}

function makeRock(
  random: () => number,
  size: 0 | 1 | 2,
  x: number,
  y: number,
  direction?: number
): Rock {
  const [min, max] = TUNING.rock.speed[size];
  const speed = between(random, min, max);
  const angle = direction ?? random() * Math.PI * 2;
  const corners = 9 + Math.floor(random() * 3);
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size,
    r: TUNING.rock.radius[size],
    angle: random() * Math.PI * 2,
    spin: between(random, -1.2, 1.2),
    shape: Array.from({ length: corners }, () => between(random, 0.72, 1.12)),
  };
}

/** A big rock drifting in from a random edge, roughly toward the middle. */
function rockFromEdge(world: World): Rock {
  const { random, w, h } = world;
  const r = TUNING.rock.radius[0];
  const side = Math.floor(random() * 4);
  const x = side === 0 ? -r : side === 1 ? w + r : random() * w;
  const y = side === 2 ? -r : side === 3 ? h + r : random() * h;
  const toMiddle = Math.atan2(h / 2 - y, w / 2 - x);
  return makeRock(random, 0, x, y, toMiddle + between(random, -0.6, 0.6));
}

export function createWorld(opts: {
  w: number;
  h: number;
  shipAt?: { x: number; y: number };
  statue: Statue;
  random: () => number;
  particleScale?: number;
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
    anger: 0,
    lives: TUNING.lives,
    score: 0,
    fireIn: 0,
    spawnIn: TUNING.rock.spawnEvery,
    particleScale: opts.particleScale ?? 1,
    random: opts.random,
    lostSent: false,
  };
  for (let i = 0; i < TUNING.rock.start; i++) world.rocks.push(rockFromEdge(world));
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

function wrap(world: World, o: { x: number; y: number }, margin: number) {
  if (o.x < -margin) o.x += world.w + margin * 2;
  else if (o.x > world.w + margin) o.x -= world.w + margin * 2;
  if (o.y < -margin) o.y += world.h + margin * 2;
  else if (o.y > world.h + margin) o.y -= world.h + margin * 2;
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
  return statue.tiles.find((t) => t.attached && t.col === col && t.row === row);
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
  const { random } = world;
  const { ship, statue } = world;
  // After a loss the world keeps moving a little longer, so the explosion plays.
  if (world.phase === "won") return events;

  world.time += dt;
  world.phaseTime += dt;

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
    wrap(world, ship, 12);
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
    }
  } else if (world.lives > 0) {
    ship.respawn -= dt;
    if (ship.respawn <= 0) {
      Object.assign(ship, {
        x: world.w / 2,
        y: world.h * 0.4,
        vx: 0,
        vy: 0,
        angle: 0,
        alive: true,
        safe: TUNING.ship.safeTime,
      });
    }
  }

  /* Rocks */
  for (const rock of world.rocks) {
    rock.x += rock.vx * dt;
    rock.y += rock.vy * dt;
    rock.angle += rock.spin * dt;
    wrap(world, rock, rock.r);
  }

  if (world.phase === "play") {
    world.spawnIn -= dt;
    if (world.spawnIn <= 0) {
      world.spawnIn = TUNING.rock.spawnEvery;
      if (world.rocks.length < TUNING.rock.max - 2) world.rocks.push(rockFromEdge(world));
    }
    addAnger(world, TUNING.angerPerSecond * dt);
    if (world.anger >= 100 && world.phaseTime >= TUNING.minPlayTime) {
      setPhase(world, "awakening");
      events.push({ type: "statueAwake" });
    }
  }

  /* Statue */
  statue.time += dt;
  if (world.phase === "awakening") {
    statue.wake = Math.min(1, world.phaseTime / TUNING.awakenTime);
    if (world.phaseTime >= TUNING.awakenTime) setPhase(world, "boss");
  }
  if (world.phase === "awakening" || world.phase === "boss") {
    statue.dx = Math.sin(statue.time * 0.8) * TUNING.statue.sway * statue.wake;
    statue.dy = -TUNING.statue.rise * statue.wake + Math.sin(statue.time * 1.7) * 4 * statue.wake;
  }
  if (world.phase === "boss" && ship.alive) {
    statue.throwIn -= dt;
    if (statue.throwIn <= 0) {
      const damage = 1 - statue.hp / statue.maxHp;
      const [slow, fast] = TUNING.statue.throwEvery;
      statue.throwIn = slow + (fast - slow) * damage;
      const { home } = statue;
      const left = ship.x < home.x + statue.dx + home.w / 2;
      const fromX = home.x + statue.dx + home.w * (left ? 0.24 : 0.76);
      const fromY = home.y + statue.dy + home.h * 0.38;
      const aim = Math.atan2(ship.y - fromY, ship.x - fromX) + between(random, -0.12, 0.12);
      if (world.rocks.length < TUNING.rock.max + 2) {
        const chunk = makeRock(random, random() < 0.5 ? 1 : 2, fromX, fromY, aim);
        const speed = between(random, ...TUNING.statue.throwSpeed);
        chunk.vx = Math.cos(aim) * speed;
        chunk.vy = Math.sin(aim) * speed;
        world.rocks.push(chunk);
      }
    }
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
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    wrap(world, b, 0);
    if (b.life <= 0) continue;
    if (hitSomething(world, b, events)) continue;
    keep.push(b);
  }
  world.bullets = keep;

  /* Ship vs rocks */
  if (ship.alive && ship.safe <= 0) {
    for (const rock of world.rocks) {
      const reach = rock.r * 0.85 + TUNING.ship.radius;
      if ((rock.x - ship.x) ** 2 + (rock.y - ship.y) ** 2 < reach * reach) {
        ship.alive = false;
        ship.respawn = TUNING.ship.respawnTime;
        world.lives -= 1;
        burst(world, ship.x, ship.y, 40, SPARK, 260);
        burst(world, ship.x, ship.y, 20, ["#ffffff", "#000000"], 180);
        events.push({ type: "shipLost", livesLeft: world.lives });
        if (world.lives <= 0) setPhase(world, "lost");
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
    world.rocks.splice(i, 1);
    world.score += TUNING.rock.score[rock.size];
    addAnger(world, TUNING.rock.anger[rock.size]);
    burst(world, rock.x, rock.y, 10 + (2 - rock.size) * 6, MARBLE, 160);
    if (rock.size < 2) {
      const next = (rock.size + 1) as 1 | 2;
      const heading = Math.atan2(rock.vy, rock.vx);
      for (const turn of [-0.6, 0.6]) {
        world.rocks.push(makeRock(random, next, rock.x, rock.y, heading + turn + between(random, -0.2, 0.2)));
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
      const [min, max] = TUNING.statue.tilesPerHit;
      const count = min + Math.floor(random() * (max - min + 1));
      const near = statue.tiles
        .filter((t) => t.attached)
        .map((t) => {
          const o = tileOrigin(statue, t);
          return { t, d: (o.x + o.w / 2 - b.x) ** 2 + (o.y + o.h / 2 - b.y) ** 2 };
        })
        .sort((p, q) => p.d - q.d)
        .slice(0, count);
      for (const { t } of near) breakTile(world, t, b.x, b.y);
      if (statue.hp <= 0) {
        for (const t of statue.tiles) if (t.attached) breakTile(world, t, b.x, b.y - 200);
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
      events.push({ type: "iconDestroyed", id: t.id });
    } else {
      const hp = (world.windowHp[t.id] ?? TUNING.window.hp) - 1;
      world.windowHp[t.id] = hp;
      burst(world, b.x, b.y, 8, SPARK, 150);
      if (hp > 0) {
        world.score += TUNING.window.hitScore;
        addAnger(world, TUNING.window.hitAnger);
        events.push({ type: "windowHit", id: t.id });
      } else {
        world.crashedWindows.push(t.id);
        delete world.windowHp[t.id];
        world.score += TUNING.window.crashScore;
        addAnger(world, TUNING.window.crashAnger);
        burst(world, t.x + t.w / 2, t.y + t.h / 2, 30, ["#c0c0c0", "#000080", "#ffffff"], 220, 300);
        events.push({ type: "windowCrashed", id: t.id });
      }
    }
    const gone = t.kind === "icon" || world.crashedWindows.includes(t.id);
    if (gone) world.targets = world.targets.filter((x) => x !== t);
    return true;
  }

  return false;
}

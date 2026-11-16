/** Level 5 · Orbiting Armour → Full Plate: a spinning shell of plates with one hole, then it bursts outward. */
import type { Rock } from "../olympus";
import { defineFinale, FINALE } from "./types";

type Shell = {
  /** Shell centre: the head without its sideways sway, fixed for the whole cycle. */
  x: number;
  y: number;
  /** Ring radius and plate radius (set once: they cover what is left of the statue). */
  R: number;
  r: number;
  /** The locked safe line: the hole stops on this angle before the burst. */
  safe: number;
  turn: -1 | 1;
  /** The hole's angle now, and the ring's radius now (it tightens before the burst). */
  hole: number;
  ring: number;
  /** Seconds since the shell formed; the burst's own warning lasts `brace` seconds. */
  t: number;
  warnedAt: number;
  brace: number;
  /** Each plate and its slot on the ring (the hole is slot 0). */
  plates: { rock: Rock; slot: number }[];
  broken: number;
  burst: boolean;
};

/** 10 slots, so 9 plates and a hole. Plates break in PLATE_HP hits; BREAK broken plates collapse the shell. */
const SLOTS = 10, PLATE_HP = 2, BREAK = 3;
/** Seconds the shell spins, and how fast (rad/s, the armour's orbit speed). */
const SHELL = 2.4, SPIN = 1.1;
/** Plate radius as a share of the ring: neighbours overlap (no gap for a shot), the hole still lets shots in. */
const PLATE = 0.42;
/** The ring tightens to this share before it bursts, so a ship inside the shell is not safe either. */
const TIGHT = 0.3;
/** Burst speed (px/s at full scale), and how far each plate's reach overlaps its neighbour's as it flies. */
const SPEED = 240, GROW = 1.2;
/** The head moves under the fixed shell: ±18 px of sway (TUNING.statue.sway) and a little bob. */
const SWAY = 20;
/** The safe line points up, within this angle of straight up: never into the floor or the thumbs. */
const CONE = 0.85;
const TAU = Math.PI * 2, STEP = TAU / SLOTS;

/** A plate's radius once it has flown `d` from the centre: wide enough that no ship fits between two plates. */
const grownRadius = (s: Shell, d: number, ship: number) => Math.max(s.r, (GROW * Math.sin(Math.PI / SLOTS) * d - ship) / 0.85);

export const fullPlate = defineFinale<Shell>({
  name: "Full Plate",
  hint: "Shoot through the gap or break 3 plates, then hide on the green line before the shell bursts.",

  start(world, kit) {
    const eye = kit.eye(world), { statue } = world;
    // The armour flies home. Nothing hurts during the reveal.
    for (const rock of world.rocks) {
      rock.vx = (eye.x - rock.x) / FINALE.reveal;
      rock.vy = (eye.y - rock.y) / FINALE.reveal;
      rock.life = FINALE.reveal;
      delete rock.orbit;
    }
    // The ring covers every tile the statue still has at the threshold (breakOrder ends with those nearest the eye).
    const { home, cols, rows, breakOrder } = statue, tw = home.w / cols, th = home.h / rows;
    const ex = eye.x - home.x - statue.dx, ey = eye.y - home.y - statue.dy;
    let far = 0;
    for (const t of breakOrder.slice(-Math.ceil(breakOrder.length * FINALE.at))) {
      if (t.solid) far = Math.max(far, Math.hypot(Math.abs((t.col + 0.5) * tw - ex) + tw / 2, Math.abs((t.row + 0.5) * th - ey) + th / 2));
    }
    const R = far + SWAY;
    return { x: 0, y: 0, R, r: R * PLATE, safe: -Math.PI / 2, turn: 1, hole: 0, ring: R, t: 0, warnedAt: 0, brace: 0,
      plates: [], broken: 0, burst: false };
  },

  warn(world, s, kit) {
    const eye = kit.eye(world);
    s.x = eye.x - world.statue.dx; s.y = eye.y;
    s.safe = -Math.PI / 2 + (world.random() * 2 - 1) * CONE;
    s.turn = world.random() < 0.5 ? -1 : 1;
    s.hole = s.safe - s.turn * SPIN * SHELL;
    s.ring = s.R; s.t = 0; s.plates = []; s.broken = 0; s.burst = false;
    s.warnedAt = world.time;
  },

  launch(world, s, kit) {
    // The burst gets a warning as long as this one: the engine's powerWarning (finale files cannot import engine values).
    s.brace = world.time - s.warnedAt;
    const { ship } = world;
    for (let slot = 1; slot < SLOTS; slot++) {
      const a = s.hole + slot * STEP, x = s.x + Math.cos(a) * s.R, y = s.y + Math.sin(a) * s.R;
      // Never on the ship: a ship hugging the shell gets a gap instead.
      if (ship.alive && (x - ship.x) ** 2 + (y - ship.y) ** 2 < 3600) continue;
      // Not `power` while it is a shell (the engine drops power pieces off-screen); size 2 never splits.
      const rock = kit.rock(world, 2, x, y);
      delete rock.power;
      rock.r = s.r; rock.hp = PLATE_HP; rock.spin = 0;
      // Drawn about as wide as the ship's collision circle (0.85r), so what you see is what hits you.
      rock.shape = rock.shape.map(() => 0.82 + world.random() * 0.06);
      s.plates.push({ rock, slot });
      world.rocks.push(rock);
    }
  },

  step(world, s, dt, _events, kit) {
    s.t += dt;
    // A plate missing from the rocks was shot or left the screen (a lost ship restarts the finale instead).
    const left = s.plates.filter((p) => world.rocks.includes(p.rock));
    if (!s.burst) {
      s.broken = s.plates.length - left.length;
      if (s.broken >= BREAK) {
        // Enough plates broken: the shell collapses before it can burst.
        world.rocks = world.rocks.filter((rock) => !left.some((p) => p.rock === rock));
        s.plates = [];
        kit.burst(world, s.x, s.y, 30, 200);
        return "beaten";
      }
      s.hole = s.safe - s.turn * SPIN * Math.max(0, SHELL - s.t);
      const u = Math.max(0, Math.min(1, (s.t - SHELL) / s.brace));
      s.ring = s.R * (1 - (1 - TIGHT) * u * u);
      for (const { rock, slot } of left) {
        rock.x = s.x + Math.cos(s.hole + slot * STEP) * s.ring;
        rock.y = s.y + Math.sin(s.hole + slot * STEP) * s.ring;
      }
      if (s.t < SHELL + s.brace) return "active";
      s.burst = true;
      for (const { rock, slot } of left) {
        const a = s.hole + slot * STEP;
        rock.power = true; // gone once off the screen
        rock.vx = Math.cos(a) * SPEED * world.scale;
        rock.vy = Math.sin(a) * SPEED * world.scale;
      }
      kit.burst(world, s.x, s.y, 20, 220);
    }
    const ship = kit.shipRadius(world);
    for (const { rock } of left) rock.r = grownRadius(s, Math.hypot(rock.x - s.x, rock.y - s.y), ship);
    s.plates = left;
    return left.length ? "active" : "done";
  },

  draw(ctx, world, s, run) {
    if (run.state !== "warn" && run.state !== "active") return;
    const warning = run.state === "warn";
    const brace = !warning && !s.burst && s.t >= SHELL;
    const glow = Math.floor(world.time * 16) % 2 ? "#ffd800" : "#ff8c1a";
    ctx.save();
    if (warning) {
      // Where the shell will form, with its hole: keep clear of the gold band.
      ctx.strokeStyle = "rgba(255,216,0,.13)"; ctx.lineWidth = s.r * 1.7;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.R, s.hole + STEP / 2, s.hole - STEP / 2 + TAU); ctx.stroke();
      ctx.strokeStyle = "#ffdb54"; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.arc(s.x, s.y, s.R + s.r, 0, TAU); ctx.stroke();
      ctx.setLineDash([]);
    } else if (!s.burst) {
      // The hole: shoot through it.
      ctx.strokeStyle = "#74ffbf"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.ring, s.hole - STEP / 3, s.hole + STEP / 3); ctx.stroke();
    }
    if (brace) {
      // The burst is coming: every plate's path flashes gold.
      ctx.strokeStyle = glow; ctx.lineWidth = 3;
      for (const { rock, slot } of s.plates) {
        const a = s.hole + slot * STEP, cos = Math.cos(a), sin = Math.sin(a);
        ctx.beginPath(); ctx.arc(rock.x, rock.y, rock.r * 0.9, 0, TAU); ctx.stroke();
        const from = s.ring + s.r * 1.1, to = from + 26;
        ctx.beginPath(); ctx.moveTo(s.x + cos * from, s.y + sin * from); ctx.lineTo(s.x + cos * to, s.y + sin * to); ctx.stroke();
      }
    }
    // The safe line: from the shell's edge to the screen edge. Faint until the burst warning, then bright.
    const reach = world.w + world.h, cos = Math.cos(s.safe), sin = Math.sin(s.safe), from = s.R + s.r;
    ctx.beginPath(); ctx.moveTo(s.x + cos * from, s.y + sin * from); ctx.lineTo(s.x + cos * reach, s.y + sin * reach);
    ctx.strokeStyle = "#74ffbf";
    ctx.globalAlpha = brace || s.burst ? 0.3 : 0.15; ctx.lineWidth = 24; ctx.stroke();
    ctx.globalAlpha = brace || s.burst ? 1 : 0.6; ctx.lineWidth = 2; ctx.stroke();
    ctx.globalAlpha = 1;
    if (!s.burst) {
      // Collapse progress above the shell: one pip per plate broken.
      const y = Math.max(10, s.y - s.R - s.r - 12);
      ctx.strokeStyle = "#ffd800"; ctx.lineWidth = 1;
      for (let i = 0; i < BREAK; i++) {
        ctx.beginPath(); ctx.arc(s.x + (i - (BREAK - 1) / 2) * 12, y, 4, 0, TAU);
        ctx.fillStyle = i < s.broken ? "#ffd800" : "rgba(255,216,0,.15)";
        ctx.fill(); ctx.stroke();
      }
    }
    ctx.restore();
  },
});

/** For tests. */
export const FULL_PLATE = { SLOTS, PLATE_HP, BREAK, SHELL };

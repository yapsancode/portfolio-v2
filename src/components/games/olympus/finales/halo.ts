/** Level 3 · Shattered Halo → Closing Crown: a ring of marble closes on the statue's head, with one turning green gap. */
import type { Rock, World } from "../olympus";
import { defineFinale, FINALE } from "./types";

type Crown = {
  /** The head (ring centre) as an offset from the statue's box, so the ring sways with the statue. */
  ox: number;
  oy: number;
  /** Full-size ring reach from the head on each side: past every screen corner, so no spot on screen is outside it. */
  left: number;
  right: number;
  up: number;
  down: number;
  /** Ring length at full size, and the share of it reached at each of STEPS + 1 even angles. */
  length: number;
  at: number[];
  /** The gap stays between these ring shares (see TOP and SPREAD). */
  lo: number;
  hi: number;
  /** Gap centre as a share of the ring (0–1), turning by `turn`. */
  gap: number;
  turn: -1 | 1;
  /** Ring size: 1 off-screen, 0 on the head. */
  k: number;
  /** Each piece and its place on the ring, as a share past the gap centre. */
  pieces: { rock: Rock; slot: number }[];
  broken: number;
};

/** 24 pieces in 27 even slots: the gap is 3 missing pieces wide. */
const PIECES = 24, SLOTS = 27, EDGE_SLOT = 2 / SLOTS;
/** Seconds to close, ring share turned per second, pieces to break for the crown. */
const CLOSE = 4, TURN = 0.025, CROWN_HITS = 4;
/** How far past the screen the ring starts (the 60 px spawn bubble plus the statue's 18 px sway), and table resolution. */
const PAD = 80, STEPS = 128;
/** A rounded square (|x|⁴ + |y|⁴ = 1): it sweeps the corners, unlike an oval. 2^¼ puts the screen corners inside it. */
const CORNER = Math.SQRT2 ** 0.5;
const TAU = Math.PI * 2;
/** The gap comes in from above the head, within SPREAD of straight up: well clear of the corners and the thumbs. */
const TOP = Math.PI * 1.5, SPREAD = 0.6;

function centre(world: World, s: Crown) {
  const { home, dx, dy } = world.statue;
  return { x: home.x + dx + s.ox, y: home.y + dy + s.oy };
}

/** The full-size ring at angle t, from the head. */
function shape(s: Crown, t: number) {
  const cos = Math.cos(t), sin = Math.sin(t);
  return {
    x: Math.sign(cos) * Math.sqrt(Math.abs(cos)) * (cos < 0 ? s.left : s.right),
    y: Math.sign(sin) * Math.sqrt(Math.abs(sin)) * (sin < 0 ? s.up : s.down),
  };
}

/** Even spacing along the ring: ring share → angle, and back. */
function angleAt(s: Crown, share: number) {
  const f = share - Math.floor(share);
  let i = 0;
  while (s.at[i + 1] < f) i++;
  return ((i + (f - s.at[i]) / (s.at[i + 1] - s.at[i])) * TAU) / STEPS;
}
function shareAt(s: Crown, angle: number) {
  const a = ((((angle % TAU) + TAU) % TAU) / TAU) * STEPS, i = Math.min(STEPS - 1, Math.floor(a));
  return s.at[i] + (a - i) * (s.at[i + 1] - s.at[i]);
}

/** A point on the ring at size k (k = 0 is the head). */
export function ringPoint(world: World, s: Crown, share: number, k = s.k) {
  const c = centre(world, s), p = shape(s, angleAt(s, share));
  return { x: c.x + p.x * k, y: c.y + p.y * k };
}

/** The ring size that passes through (x, y): inside the ring while it is below `k`. */
export function ringSize(world: World, s: Crown, x: number, y: number) {
  const c = centre(world, s), dx = x - c.x, dy = y - c.y;
  return Math.hypot((dx / (dx < 0 ? s.left : s.right)) ** 2, (dy / (dy < 0 ? s.up : s.down)) ** 2) ** 0.5;
}

/** Where the gap will be when the ring has closed to size k: the gap's whole path, as the warning shows it. */
export function gapAt(s: Crown, k: number) {
  return s.gap + s.turn * TURN * CLOSE * (s.k - k);
}

/** Pieces shrink with the ring but always overlap, so only the gap lets a ship through. */
const pieceRadius = (s: Crown, k: number) => Math.max(12, (0.55 * s.length * k) / SLOTS);

export const closingCrown = defineFinale<Crown>({
  name: "Closing Crown",
  hint: "Wait on the green path: only the gap lets you through. Shoot 4 pieces to crown the statue.",

  start(world, kit) {
    const eye = kit.eye(world);
    // The halo's loose pieces fly home. Nothing hurts during the reveal.
    for (const rock of world.rocks) {
      rock.vx = (eye.x - rock.x) / FINALE.reveal;
      rock.vy = (eye.y - rock.y) / FINALE.reveal;
      rock.life = FINALE.reveal;
      delete rock.orbit;
    }
    const { home, dx, dy } = world.statue;
    const ox = eye.x - home.x - dx, oy = eye.y - home.y - dy;
    // Sized from the head without sway, so the swaying ring still clears the far corners.
    const middle = home.x + ox;
    const s: Crown = {
      ox, oy,
      left: (middle + PAD) * CORNER, right: (world.w - middle + PAD) * CORNER,
      up: (eye.y + PAD) * CORNER, down: (world.h - eye.y + PAD) * CORNER,
      length: 0, at: [0], lo: 0, hi: 1, gap: 0, turn: 1, k: 1, pieces: [], broken: 0,
    };
    for (let i = 1; i <= STEPS; i++) {
      const a = shape(s, ((i - 1) * TAU) / STEPS), b = shape(s, (i * TAU) / STEPS);
      s.length += Math.hypot(b.x - a.x, b.y - a.y);
      s.at.push(s.length);
    }
    s.at = s.at.map((d) => d / s.length);
    s.lo = shareAt(s, TOP - SPREAD);
    s.hi = shareAt(s, TOP + SPREAD);
    return s;
  },

  warn(world, s) {
    const c = centre(world, s), { ship } = world;
    const sx = (ship.x - c.x) / (ship.x < c.x ? s.left : s.right), sy = (ship.y - c.y) / (ship.y < c.y ? s.up : s.down);
    // The ship's angle, from π/2 (below, left side) round the top to 5π/2 (below, right side).
    const t = (Math.atan2(Math.sign(sy) * sy * sy, Math.sign(sx) * sx * sx) + TAU - Math.PI / 2) % TAU + Math.PI / 2;
    const own = shareAt(s, Math.max(TOP - SPREAD, Math.min(TOP + SPREAD, t)));
    s.turn = own < (s.lo + s.hi) / 2 ? 1 : -1;
    // The gap's edge piece starts on the ship's line, so staying still is never safe; then the gap turns away.
    const travel = TURN * CLOSE;
    s.gap = Math.max(s.lo + (s.turn < 0 ? travel : 0), Math.min(s.hi - (s.turn > 0 ? travel : 0), own + s.turn * EDGE_SLOT));
    s.k = 1;
    s.pieces = [];
    s.broken = 0;
  },

  launch(world, s, kit) {
    const { ship } = world;
    for (let i = 0; i < PIECES; i++) {
      const slot = EDGE_SLOT + i / SLOTS, at = ringPoint(world, s, s.gap + slot, 1);
      // Never on the ship (the ring starts off-screen, so this is only a guard).
      if (ship.alive && (at.x - ship.x) ** 2 + (at.y - ship.y) ** 2 < 3600) continue;
      // Size 2 and not `power`: the engine drops power pieces that leave the screen, and a size 2 piece never splits.
      const rock = kit.rock(world, 2, at.x, at.y);
      delete rock.power;
      rock.r = pieceRadius(s, 1);
      s.pieces.push({ rock, slot });
      world.rocks.push(rock);
    }
  },

  step(world, s, dt, _events, kit) {
    s.gap = gapAt(s, Math.max(0, s.k - dt / CLOSE));
    s.k = Math.max(0, s.k - dt / CLOSE);
    // A piece missing from the rocks was shot (a lost ship restarts the finale instead).
    const left = s.pieces.filter((p) => world.rocks.includes(p.rock));
    s.broken = s.pieces.length - left.length;
    for (const p of left) {
      const at = ringPoint(world, s, s.gap + p.slot);
      p.rock.x = at.x; p.rock.y = at.y; p.rock.r = pieceRadius(s, s.k);
    }
    if (s.k > 0) return "active";
    world.rocks = world.rocks.filter((rock) => !left.some((p) => p.rock === rock));
    s.pieces = [];
    const c = centre(world, s);
    if (s.broken >= CROWN_HITS) {
      kit.burst(world, c.x, c.y, 14, 160);
      return "beaten";
    }
    // Not enough pieces broken: the ring crumbles on the head.
    kit.burst(world, c.x, c.y, 24, 140);
    return "done";
  },

  draw(ctx, world, s, run) {
    const c = centre(world, s);
    ctx.save();
    if (run.state === "stun") {
      // The ring sits on top of the head as a crown, above the engine's stun stars.
      const w = 20 * world.scale + 8, y = c.y - 32;
      ctx.fillStyle = "#ffd800"; ctx.strokeStyle = "#ff8c1a"; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c.x - w, y); ctx.lineTo(c.x - w, y - 14); ctx.lineTo(c.x - w / 2, y - 6);
      ctx.lineTo(c.x, y - 18); ctx.lineTo(c.x + w / 2, y - 6); ctx.lineTo(c.x + w, y - 14); ctx.lineTo(c.x + w, y);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (run.state === "warn" || run.state === "active") {
      const warning = run.state === "warn";
      /** Trace the ring at size k from one share to another. */
      const trace = (k: number, from: number, to: number, steps: number) => {
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const at = ringPoint(world, s, from + ((to - from) * i) / steps, k);
          if (i) ctx.lineTo(at.x, at.y); else ctx.moveTo(at.x, at.y);
        }
        ctx.stroke();
      };
      ctx.strokeStyle = "#ffdb54"; ctx.lineWidth = 2;
      if (warning) {
        // The ring starts off-screen: show it at the screen edge, with a ghost ring sliding in to show it closes.
        const edge = Math.min(c.x / s.left, (world.w - c.x) / s.right, c.y / s.up, (world.h - c.y) / s.down);
        ctx.setLineDash([6, 6]);
        trace(edge, 0, 1, 64);
        ctx.setLineDash([3, 12]);
        trace(edge * (0.55 + 0.45 * Math.max(0, Math.min(1, run.t))), 0, 1, 64);
      } else {
        ctx.globalAlpha = 0.35;
        trace(s.k, 0, 1, 64);
      }
      ctx.setLineDash([]);
      // The gap's path from here to the head: wherever the ring meets this line, the gap is on it.
      ctx.beginPath();
      for (let i = 0; i <= 24; i++) {
        const k = s.k * (1 - i / 24), at = ringPoint(world, s, gapAt(s, k), k);
        if (i) ctx.lineTo(at.x, at.y); else ctx.moveTo(at.x, at.y);
      }
      ctx.strokeStyle = "#74ffbf";
      ctx.globalAlpha = 0.25; ctx.lineWidth = 18; ctx.stroke();
      ctx.globalAlpha = 1; ctx.lineWidth = 2; ctx.stroke();
      if (!warning) {
        // The gap itself, as wide as the missing pieces.
        ctx.lineWidth = 5;
        trace(s.k, s.gap - 1.5 / SLOTS, s.gap + 1.5 / SLOTS, 8);
      }
      // Crown progress over the head: one pip per piece broken.
      ctx.strokeStyle = "#ffd800"; ctx.lineWidth = 1;
      for (let i = 0; i < CROWN_HITS; i++) {
        ctx.beginPath();
        ctx.arc(c.x + (i - (CROWN_HITS - 1) / 2) * 12, c.y - 40, 4, 0, TAU);
        ctx.fillStyle = i < s.broken ? "#ffd800" : "rgba(255,216,0,.15)";
        ctx.fill(); ctx.stroke();
      }
    }
    ctx.restore();
  },
});

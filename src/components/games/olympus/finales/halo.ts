/** Level 3 · Shattered Halo → Closing Crown: a ring of marble closes on the statue's head, with one turning green gap. */
import type { Rock, World } from "../olympus";
import { defineFinale, FINALE } from "./types";

type Crown = {
  /** The head (ring centre) as an offset from the statue's box, so the ring sways with the statue. */
  ox: number;
  oy: number;
  /** Full-size ring reach from the head on each side, so it fills the screen with the statue off-centre. */
  left: number;
  right: number;
  up: number;
  down: number;
  /** Ring length at full size, and the share of it reached at each of STEPS + 1 even angles. */
  length: number;
  at: number[];
  /** The gap stays between these ring shares: the upper half, on screen and clear of the thumbs. */
  lo: number;
  hi: number;
  /** Gap centre as a share of the ring (0–1), turning by `turn`. */
  gap: number;
  turn: -1 | 1;
  /** Ring size: 1 at the screen edge, `end` when it sits on the head. */
  k: number;
  end: number;
  /** Each piece and its place on the ring, as a share past the gap centre. */
  pieces: { rock: Rock; slot: number }[];
  broken: number;
};

/** 24 pieces in 27 even slots: the gap is 3 missing pieces wide. */
const PIECES = 24, SLOTS = 27, EDGE_SLOT = 2 / SLOTS;
/** Seconds to close, ring share turned per second, pieces to break for the crown. */
const CLOSE = 3.5, TURN = 0.025, CROWN_HITS = 4;
/** Screen margin (covers the statue's 18 px sway), the crown's half-width, and table resolution. */
const EDGE = 30, CROWN_R = 30, STEPS = 96;
const TAU = Math.PI * 2;

function centre(world: World, s: Crown) {
  const { home, dx, dy } = world.statue;
  return { x: home.x + dx + s.ox, y: home.y + dy + s.oy };
}

/** The full-size ring at angle t, from the head: four quarter-ovals that meet smoothly. */
function shape(s: Crown, t: number) {
  const cos = Math.cos(t), sin = Math.sin(t);
  return { x: cos * (cos < 0 ? s.left : s.right), y: sin * (sin < 0 ? s.up : s.down) };
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

/** Pieces shrink with the ring but always overlap, so only the gap lets a ship through. */
const pieceRadius = (s: Crown, k: number) => Math.max(8, (0.55 * s.length * k) / SLOTS);

export const closingCrown = defineFinale<Crown>({
  name: "Closing Crown",
  hint: "Fly out through the green gap, or shoot 4 pieces to crown the statue.",

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
    // Sized from the head without sway, so the swaying ring keeps its margin on both sides.
    const middle = home.x + ox;
    const s: Crown = {
      ox, oy, left: Math.max(EDGE, middle - EDGE), right: Math.max(EDGE, world.w - middle - EDGE),
      up: Math.max(EDGE, eye.y - EDGE), down: Math.max(EDGE, world.h - EDGE - eye.y),
      length: 0, at: [0], lo: 0, hi: 1, gap: 0, turn: 1, k: 1, end: 1, pieces: [], broken: 0,
    };
    for (let i = 1; i <= STEPS; i++) {
      const a = shape(s, ((i - 1) * TAU) / STEPS), b = shape(s, (i * TAU) / STEPS);
      s.length += Math.hypot(b.x - a.x, b.y - a.y);
      s.at.push(s.length);
    }
    s.at = s.at.map((d) => d / s.length);
    s.lo = shareAt(s, Math.PI + 0.3);
    s.hi = shareAt(s, TAU - 0.3);
    return s;
  },

  warn(world, s) {
    const c = centre(world, s), { ship } = world;
    const sx = ship.x - c.x, sy = ship.y - c.y;
    const t = (Math.atan2(sy / (sy < 0 ? s.up : s.down), sx / (sx < 0 ? s.left : s.right)) + TAU) % TAU;
    // Below the head the gap starts at the nearer end of the upper half.
    const own = t <= Math.PI / 2 || t >= TAU - 0.3 ? s.hi : t <= Math.PI + 0.3 ? s.lo : shareAt(s, t);
    s.turn = own < (s.lo + s.hi) / 2 ? 1 : -1;
    // The gap's edge piece starts on the ship's line, so staying still is never safe; then the gap turns away.
    const travel = TURN * CLOSE;
    s.gap = Math.max(s.lo + (s.turn < 0 ? travel : 0), Math.min(s.hi - (s.turn > 0 ? travel : 0), own + s.turn * EDGE_SLOT));
    s.k = 1;
    s.end = (CROWN_R * world.scale) / Math.min(s.left, s.right);
    s.pieces = [];
    s.broken = 0;
  },

  launch(world, s, kit) {
    const { ship } = world;
    for (let i = 0; i < PIECES; i++) {
      const slot = EDGE_SLOT + i / SLOTS, at = ringPoint(world, s, s.gap + slot, 1);
      // Never on the ship: that piece is left out, and the ring has a second gap there.
      if (ship.alive && (at.x - ship.x) ** 2 + (at.y - ship.y) ** 2 < 3600) continue;
      const rock = kit.rock(world, 1, at.x, at.y);
      rock.r = pieceRadius(s, 1);
      s.pieces.push({ rock, slot });
      world.rocks.push(rock);
    }
  },

  step(world, s, dt, _events, kit) {
    s.k = Math.max(s.end, s.k - ((1 - s.end) / CLOSE) * dt);
    s.gap += s.turn * TURN * dt;
    // A piece missing from the rocks was shot (a lost ship restarts the finale instead).
    const left = s.pieces.filter((p) => world.rocks.includes(p.rock));
    s.broken = s.pieces.length - left.length;
    for (const p of left) {
      const at = ringPoint(world, s, s.gap + p.slot);
      p.rock.x = at.x; p.rock.y = at.y; p.rock.r = pieceRadius(s, s.k);
    }
    if (s.k > s.end) return "active";
    world.rocks = world.rocks.filter((rock) => !left.some((p) => p.rock === rock));
    s.pieces = [];
    if (s.broken >= CROWN_HITS) {
      const c = centre(world, s);
      kit.burst(world, c.x, c.y, 14, 160);
      return "beaten";
    }
    // Not enough pieces broken: the ring dissolves on the head.
    for (const p of left) kit.burst(world, p.rock.x, p.rock.y, 3, 90);
    return "done";
  },

  draw(ctx, world, s, run) {
    const c = centre(world, s);
    ctx.save();
    if (run.state === "stun") {
      // The ring sits on the head as a crown.
      const w = 20 * world.scale + 8, y = c.y - 22;
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
      // The ring's path: dashed gold at the edge while it warns, with a ghost ring sliding in to show it closes.
      ctx.strokeStyle = "#ffdb54"; ctx.lineWidth = 2;
      ctx.setLineDash(warning ? [6, 6] : []);
      if (!warning) ctx.globalAlpha = 0.35;
      trace(s.k, 0, 1, 64);
      ctx.globalAlpha = 1;
      if (warning) {
        ctx.setLineDash([3, 12]);
        trace(0.55 + 0.45 * Math.max(0, Math.min(1, run.t)), 0, 1, 64);
      }
      ctx.setLineDash([]);
      // The green gap, as wide as the missing pieces.
      ctx.strokeStyle = "#74ffbf"; ctx.lineWidth = 5;
      trace(s.k, s.gap - 1.5 / SLOTS, s.gap + 1.5 / SLOTS, 8);
      // Crown progress over the head: one pip per piece broken.
      ctx.strokeStyle = "#ffd800"; ctx.lineWidth = 1;
      for (let i = 0; i < CROWN_HITS; i++) {
        ctx.beginPath();
        ctx.arc(c.x + (i - (CROWN_HITS - 1) / 2) * 12, c.y - 34, 4, 0, TAU);
        ctx.fillStyle = i < s.broken ? "#ffd800" : "rgba(255,216,0,.15)";
        ctx.fill(); ctx.stroke();
      }
    }
    ctx.restore();
  },
});

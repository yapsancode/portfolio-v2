/** Level 6 · Sweeping Gaze → Double Vision: both eyes fire, and two beams close like scissors on one green pocket. */
import type { World } from "../olympus";
import { defineFinale } from "./types";

type Gaze = {
  /** The main eye as an offset from the statue's box, so the beams sway with the statue. */
  ox: number;
  oy: number;
  /** A beam hits a ship whose centre is closer than this to it. */
  hit: number;
  /** The safe pocket's centre, locked in screen space at the warning. */
  x: number;
  y: number;
  /** Seconds the scissors have been closing. */
  t: number;
};

/** Seconds to close; pocket radius (a ship whose centre is inside is never hit). */
const SWEEP = 2.4, POCKET = 28;
/** Both beams start this far past pointing straight away from the pocket, crossed like open scissors, so nothing behind the head is missed. */
const OVER = 0.15;
/** Beam half-width, as the level 6 sweep. */
const HALF = 9;
/** The second eye: this share of the statue's width right of the first, the far eye of the profile face. */
const EYE2 = 0.05;
/** The pocket hugs the top edge, its centre in this band of the width: clear of the corners and the thumb controls. */
const LEFT = 0.28, SPAN = 0.44;
const TAU = Math.PI * 2;

/** Eye 0 (the picture's eye) sweeps one side, eye 1 the other. */
export function eyeAt(world: World, s: Gaze, i: 0 | 1) {
  const { home, dx, dy } = world.statue;
  return { x: home.x + dx + s.ox + i * EYE2 * home.w, y: home.y + dy + s.oy };
}

/** Beam i at progress p (0 → 1): it starts just past pointing away from the pocket and stops at the pocket's edge. */
export function beamAngle(world: World, s: Gaze, i: 0 | 1, p: number) {
  const from = eyeAt(world, s, i), side = i ? 1 : -1;
  const dir = Math.atan2(s.y - from.y, s.x - from.x);
  const edge = Math.asin(Math.min(1, (POCKET + s.hit) / Math.hypot(s.x - from.x, s.y - from.y)));
  return dir + side * (edge + (Math.PI + OVER - edge) * (1 - p));
}

export const doubleVision = defineFinale<Gaze>({
  name: "Double Vision",
  hint: "Fly into the green pocket before the two beams close on it.",

  start(world, kit) {
    const eye = kit.eye(world), { home, dx, dy } = world.statue;
    return { ox: eye.x - home.x - dx, oy: eye.y - home.y - dy, hit: HALF + kit.shipRadius(world) * 0.5, x: 0, y: 0, t: 0 };
  },

  warn(world, s) {
    s.x = world.w * (LEFT + SPAN * world.random());
    s.y = POCKET + 6;
  },

  launch(_world, s) {
    s.t = 0;
  },

  step(world, s, dt, events, kit) {
    const from = s.t / SWEEP;
    s.t = Math.min(SWEEP, s.t + dt);
    const to = s.t / SWEEP, { ship } = world, reach = Math.hypot(world.w, world.h);
    if (ship.safe <= 0) {
      for (const i of [0, 1] as const) {
        const eye = eyeAt(world, s, i), px = ship.x - eye.x, py = ship.y - eye.y;
        // The level 6 sweep's hit rule, checked in hops so a far ship cannot slip between two ticks.
        const hops = Math.max(1, Math.ceil((Math.abs(beamAngle(world, s, i, to) - beamAngle(world, s, i, from)) * reach) / s.hit));
        for (let h = 1; h <= hops; h++) {
          const angle = beamAngle(world, s, i, from + ((to - from) * h) / hops);
          const along = px * Math.cos(angle) + py * Math.sin(angle);
          const off = Math.abs(py * Math.cos(angle) - px * Math.sin(angle));
          if (along > 0 && off < s.hit) {
            // The engine restarts the finale; "done" so this pass cannot stun.
            kit.loseShip(world, events);
            return "done";
          }
        }
      }
    }
    // The scissors closed: the eyes tire and the statue is open.
    return s.t < SWEEP ? "active" : "beaten";
  },

  draw(ctx, world, s, run) {
    if (run.state !== "warn" && run.state !== "active") return;
    const warning = run.state === "warn";
    const reach = world.w + world.h;
    ctx.save();
    const ray = (x: number, y: number, angle: number) => {
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * reach, y + Math.sin(angle) * reach); ctx.stroke();
    };
    // Both eyes glow, brighter as they charge.
    const charge = warning ? 1 - Math.max(0, Math.min(1, run.t)) : 1;
    for (const i of [0, 1] as const) {
      const { x, y } = eyeAt(world, s, i);
      const r = (8 + world.statue.home.w * 0.02) * (1 + 1.4 * charge) * (0.85 + Math.sin(world.time * 12) * 0.15);
      const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
      glow.addColorStop(0, "rgba(255, 240, 240, 1)");
      glow.addColorStop(0.25, "rgba(255, 40, 40, 0.95)");
      glow.addColorStop(1, "rgba(255, 0, 0, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    for (const i of [0, 1] as const) {
      const eye = eyeAt(world, s, i), start = beamAngle(world, s, i, 0), end = beamAngle(world, s, i, 1);
      ctx.strokeStyle = "#ffdb54"; ctx.lineWidth = 2;
      // Where each beam stops: the edges of the pocket.
      ctx.setLineDash([6, 6]); ray(eye.x, eye.y, end);
      if (warning) {
        // Where it starts, and an arrow round the way it will sweep (as the level 6 sweep shows it).
        ray(eye.x, eye.y, start);
        const turn = end > start ? 1 : -1;
        ctx.beginPath(); ctx.arc(eye.x, eye.y, 60, start, end, turn < 0); ctx.stroke();
        const x = eye.x + Math.cos(end) * 60, y = eye.y + Math.sin(end) * 60;
        const tangent = end + (turn * Math.PI) / 2;
        const baseX = x - Math.cos(tangent) * 12, baseY = y - Math.sin(tangent) * 12;
        ctx.setLineDash([]); ctx.fillStyle = "#ffdb54";
        ctx.beginPath(); ctx.moveTo(x, y);
        ctx.lineTo(baseX - Math.sin(tangent) * 5, baseY + Math.cos(tangent) * 5);
        ctx.lineTo(baseX + Math.sin(tangent) * 5, baseY - Math.cos(tangent) * 5); ctx.fill();
      } else {
        const angle = beamAngle(world, s, i, s.t / SWEEP);
        ctx.setLineDash([]);
        ctx.lineWidth = HALF * 2; ctx.strokeStyle = "#ff5030"; ray(eye.x, eye.y, angle);
        ctx.lineWidth = 6; ctx.strokeStyle = "#fff8de"; ray(eye.x, eye.y, angle);
      }
    }
    // The pocket: a ship whose centre is inside is never hit.
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(s.x, s.y, POCKET, 0, TAU);
    ctx.fillStyle = warning ? "rgba(116,255,191,.25)" : "rgba(116,255,191,.12)"; ctx.fill();
    ctx.strokeStyle = "#74ffbf"; ctx.lineWidth = warning && Math.floor(world.time * 8) % 2 ? 4 : 2; ctx.stroke();
    ctx.fillStyle = "#74ffbf"; ctx.font = "12px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("SAFE", s.x, s.y);
    ctx.restore();
  },
});

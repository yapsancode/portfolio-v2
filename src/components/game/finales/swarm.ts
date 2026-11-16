/** Level 2 · Marble Swarm → Marble Fist: the fragments clump into one fist that punches down a marked lane. */
import type { Rock } from "../olympus";
import { defineFinale, FINALE } from "./types";

type Fist = {
  side: -1 | 1;
  /** Hits left; carried from punch to punch. */
  hp: number;
  /** Where the fist forms and the locked punch direction. */
  x: number;
  y: number;
  angle: number;
  /** Lane half-width, also the fist's radius. */
  r: number;
  rock: Rock | null;
};

const HITS = 8, SPEED = 480, RADIUS = 44;

export const marbleFist = defineFinale<Fist>({
  name: "Marble Fist",
  hint: "Leave the gold lane, or shoot the fist until it breaks.",

  start(world, kit) {
    const side = world.statue.side;
    const at = kit.shoulder(world, side);
    // Loose fragments fly home and clump. Nothing hurts during the reveal.
    for (const rock of world.rocks) {
      rock.vx = (at.x - rock.x) / FINALE.reveal;
      rock.vy = (at.y - rock.y) / FINALE.reveal;
      rock.life = FINALE.reveal;
      delete rock.orbit;
    }
    return { side, hp: HITS, x: at.x, y: at.y, angle: 0, r: RADIUS * world.scale, rock: null };
  },

  warn(world, s, kit) {
    const at = kit.shoulder(world, s.side);
    s.x = at.x; s.y = at.y; s.r = RADIUS * world.scale;
    s.angle = Math.atan2(world.ship.y - at.y, world.ship.x - at.x);
  },

  launch(world, s, kit) {
    const fist = kit.rock(world, 0, s.x, s.y);
    fist.r = s.r; fist.hp = s.hp; fist.spin = 0; fist.angle = s.angle;
    fist.vx = Math.cos(s.angle) * SPEED * world.scale;
    fist.vy = Math.sin(s.angle) * SPEED * world.scale;
    // Inside the 60px spawn bubble the fist winds up from further back (kept on screen),
    // so hugging the shoulder is not a safe spot: the punch still comes down the lane.
    const { ship } = world;
    const rx = s.x - ship.x, ry = s.y - ship.y, inside = 3600 - rx * rx - ry * ry;
    if (ship.alive && inside > 0) {
      const along = rx * Math.cos(s.angle) + ry * Math.sin(s.angle);
      const back = along + Math.sqrt(along * along + inside);
      fist.x = Math.max(0, Math.min(world.w, s.x - Math.cos(s.angle) * back));
      fist.y = Math.max(0, Math.min(world.h, s.y - Math.sin(s.angle) * back));
    }
    s.rock = fist;
    world.rocks.push(kit.keepOut(world, fist));
    kit.burst(world, s.x, s.y, 14, 180);
  },

  step(world, s) {
    const fist = s.rock;
    if (!fist) return "done";
    // Shot apart: the engine removed it.
    const shot = !world.rocks.includes(fist);
    // Gone = past an edge and still heading out (a wound-up fist may start on the edge).
    const gone = (fist.x <= 0 && fist.vx < 0) || (fist.x >= world.w && fist.vx > 0) ||
      (fist.y <= 0 && fist.vy < 0) || (fist.y >= world.h && fist.vy > 0);
    if (!shot && !gone) {
      s.hp = fist.hp ?? 1;
      return "active";
    }
    s.rock = null;
    s.side = s.side === 1 ? -1 : 1;
    if (shot) { s.hp = HITS; return "beaten"; }
    // Off the screen: it forms again at the other shoulder, keeping its damage.
    world.rocks = world.rocks.filter((rock) => rock !== fist);
    return "done";
  },

  draw(ctx, world, s, run) {
    if (run.state !== "warn" && run.state !== "active") return;
    const warning = run.state === "warn";
    const reach = world.w + world.h;
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle);
    // The lane: bright while it warns, faint while the fist flies.
    ctx.fillStyle = warning ? "rgba(255,216,0,.13)" : "rgba(255,216,0,.04)";
    ctx.fillRect(0, -s.r, reach, s.r * 2);
    ctx.strokeStyle = "#ffdb54"; ctx.lineWidth = 2;
    ctx.setLineDash(warning ? [6, 6] : []);
    ctx.strokeRect(0, -s.r, reach, s.r * 2);
    ctx.setLineDash([]);
    if (warning) {
      // The fist forming: a ring that closes as the warning runs out.
      const left = Math.max(0, Math.min(1, run.t));
      ctx.lineWidth = 3;
      ctx.strokeStyle = Math.floor(world.time * 16) % 2 ? "#ffd800" : "#ff8c1a";
      ctx.beginPath(); ctx.arc(0, 0, s.r * (1 + left), 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
    const fist = s.rock;
    if (!fist) return;
    // Knuckles on the leading edge, so the boulder reads as a fist.
    ctx.save();
    ctx.translate(fist.x, fist.y);
    ctx.rotate(s.angle);
    ctx.strokeStyle = "#404040"; ctx.lineWidth = 2;
    for (const k of [-0.6, -0.2, 0.2, 0.6]) {
      ctx.beginPath(); ctx.arc(fist.r * 0.55, k * fist.r, fist.r * 0.2, -Math.PI / 2, Math.PI / 2); ctx.stroke();
    }
    ctx.restore();
  },
});

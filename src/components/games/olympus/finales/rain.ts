/** Level 4 · Meteor Rain → The Sky Falls: one huge meteor falls over the three middle lanes. */
import type { Rock } from "../olympus";
import { defineFinale } from "./types";

type Sky = {
  /** Centre of the middle lane, where the meteor falls. */
  x: number;
  /** Collision reach of the meteor (its radius times the engine's 0.85, plus the ship's radius). */
  reach: number;
  rock: Rock | null;
};

/** Hits to crack it; fall speed in px/s at full scale. */
const HITS = 10, SPEED = 200;

export const skyFalls = defineFinale<Sky>({
  name: "The Sky Falls",
  hint: "Fly to an edge lane, or shoot the meteor until it cracks.",

  start() {
    return { x: 0, reach: 0, rock: null };
  },

  warn(world, s) {
    s.x = world.w / 2;
    // The engine hits a ship whose centre is closer than reach. Reach stops 1px short of the
    // edge lanes, so a ship whose centre is in lane 0 or 4 can never be hit.
    s.reach = (world.w / 5) * 1.5 - 1;
  },

  launch(world, s, kit) {
    const r = (s.reach - kit.shipRadius(world)) / 0.85;
    // Just inside the engine's off-screen limit (it drops power rocks above y = -r).
    const rock = kit.rock(world, 0, s.x, -r + 1);
    rock.r = r; rock.hp = HITS; rock.vy = SPEED * world.scale; rock.spin = 0.25;
    // Drawn no wider than the collision circle (0.85r), so what you see is what hits you.
    rock.shape = rock.shape.map(() => 0.8 + world.random() * 0.05);
    s.rock = rock;
    world.rocks.push(kit.keepOut(world, rock));
  },

  step(world, s, _dt, _events, kit) {
    const rock = s.rock;
    if (!rock) return "done";
    // Shot apart: the engine removed it. It cracks into harmless dust.
    if (!world.rocks.includes(rock)) {
      s.rock = null;
      kit.burst(world, rock.x, rock.y, 40, 260);
      return "beaten";
    }
    if (rock.y < world.h) return "active";
    // Its centre hit the ground: it smashes, unbroken.
    world.rocks = world.rocks.filter((r) => r !== rock);
    s.rock = null;
    kit.burst(world, rock.x, world.h, 30, 200);
    return "done";
  },

  draw(ctx, world, s, run) {
    if (run.state !== "warn" && run.state !== "active") return;
    const warning = run.state === "warn";
    const lane = world.w / 5;
    ctx.save();
    // The danger zone: the three middle lanes. Edge lanes stay clear.
    ctx.fillStyle = warning ? "rgba(255,216,0,.13)" : "rgba(255,216,0,.04)";
    ctx.fillRect(lane, 0, lane * 3, world.h);
    ctx.strokeStyle = "#ffdb54"; ctx.lineWidth = 2;
    ctx.setLineDash(warning ? [6, 6] : []);
    ctx.strokeRect(lane + 4, 4, lane * 3 - 8, world.h - 8);
    ctx.setLineDash([]);
    if (warning) {
      // The shadow grows from the middle until it fills all three lanes.
      const grow = 1 - Math.max(0, Math.min(1, run.t));
      const half = lane * 1.5 * (0.2 + 0.8 * grow);
      ctx.fillStyle = "rgba(0,0,0,.22)";
      ctx.fillRect(s.x - half, 0, half * 2, world.h);
      ctx.fillStyle = Math.floor(world.time * 16) % 2 ? "#ffd800" : "#ff8c1a";
      ctx.font = "14px monospace"; ctx.textAlign = "center";
      for (let i = 1; i <= 3; i++) ctx.fillText(i === 2 ? "↓ SKY FALLS" : "↓", (i + 0.5) * lane, 24);
      ctx.textAlign = "start";
    }
    const rock = s.rock;
    if (rock?.hp && rock.hp < HITS) {
      // Cracks spread as it is hit.
      ctx.translate(rock.x, rock.y);
      ctx.rotate(Math.round(rock.angle / (Math.PI / 8)) * (Math.PI / 8)); // turns with the engine's sprite
      ctx.strokeStyle = "#404040"; ctx.lineWidth = 3;
      for (let i = 0; i < HITS - rock.hp; i++) {
        const a = i * 2.4;
        ctx.beginPath(); ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * rock.r * 0.75, Math.sin(a) * rock.r * 0.75); ctx.stroke();
      }
    }
    ctx.restore();
  },
});

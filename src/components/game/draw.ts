import { tileOrigin, type Rock, type Ship, type World } from "./olympus";

/** The statue picture and the part of it the wallpaper shows. */
export type StatueArt = {
  image: CanvasImageSource;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
};

/** Where the statue's eye is, as a fraction of the visible picture. */
const EYE = { x: 0.33, y: 0.265 };

/**
 * The Win98 arrow pointer, tip at (0, 0). Its natural heading leans ~22°
 * left of straight up, so drawing rotates by that much extra.
 */
const CURSOR = [
  [0, 0],
  [0, 17],
  [4, 13],
  [7, 19],
  [10, 18],
  [7, 12],
  [12, 12],
] as const;
const CURSOR_CENTER = { x: 4, y: 11 };
const CURSOR_LEAN = Math.atan2(CURSOR_CENTER.x, CURSOR_CENTER.y);
const CURSOR_SCALE = 2;

function drawShip(ctx: CanvasRenderingContext2D, ship: Ship, time: number) {
  if (!ship.alive) return;
  ctx.save();
  // Flicker while it can't be hit (never fully invisible).
  if (ship.safe > 0 && Math.floor(time * 10) % 2 === 0) ctx.globalAlpha = 0.35;
  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.angle + CURSOR_LEAN);
  ctx.scale(CURSOR_SCALE, CURSOR_SCALE);
  ctx.translate(-CURSOR_CENTER.x, -CURSOR_CENTER.y);

  if (ship.thrusting) {
    // A flickering flame out of the tail.
    const flicker = 4 + Math.random() * 4;
    ctx.fillStyle = Math.random() < 0.5 ? "#ffd800" : "#ff8c1a";
    ctx.beginPath();
    ctx.moveTo(6, 16);
    ctx.lineTo(9, 19 + flicker);
    ctx.lineTo(11, 15);
    ctx.closePath();
    ctx.fill();
  }

  ctx.beginPath();
  CURSOR.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.lineWidth = 1.2;
  ctx.lineJoin = "miter";
  ctx.strokeStyle = "#000000";
  ctx.stroke();
  ctx.restore();
}

/** The rock's outline, scaled by `k`, with corners snapped to whole pixels. */
function rockPath(ctx: CanvasRenderingContext2D, rock: Rock, k: number) {
  const n = rock.shape.length;
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = rock.r * rock.shape[i] * k;
    const x = Math.round(Math.cos(a) * r);
    const y = Math.round(Math.sin(a) * r);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/** A marble chip in the Windows 98 look: flat colours, hard edges, no smooth shading. */
function drawRock(ctx: CanvasRenderingContext2D, rock: Rock) {
  ctx.save();
  ctx.translate(Math.round(rock.x), Math.round(rock.y));
  // Turn in 16 steps, like an old sprite.
  ctx.rotate(Math.round(rock.angle / (Math.PI / 8)) * (Math.PI / 8));
  rockPath(ctx, rock, 1);
  ctx.fillStyle = "#b8b8b8";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.lineJoin = "miter";
  ctx.strokeStyle = "#404040";
  ctx.stroke();
  // A lighter face toward the top-left.
  ctx.translate(-Math.round(rock.r * 0.14), -Math.round(rock.r * 0.14));
  rockPath(ctx, rock, 0.62);
  ctx.fillStyle = "#f2f2f2";
  ctx.fill();
  // A marble vein, as two straight strokes.
  const u = rock.r / 8;
  ctx.fillStyle = "#808080";
  ctx.fillRect(Math.round(-3 * u), Math.round(u), Math.round(3 * u), 2);
  ctx.fillRect(0, Math.round(u) + 2, Math.round(3 * u), 2);
  ctx.restore();
}

/** Wreckage and bullet holes: the damage stays on screen. */
function drawDamage(ctx: CanvasRenderingContext2D, world: World) {
  for (const d of world.debris) {
    ctx.fillStyle = d.color;
    ctx.fillRect(d.x, d.y, d.size, d.size);
  }
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#000000";
  for (const s of world.scars) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(s.x - 3, s.y - 3, 6, 6);
    ctx.fillStyle = "#808080";
    ctx.fillRect(s.x - 3, s.y - 3, 6, 1);
    // Four cracks; their directions come from the hole's position, so they don't flicker.
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = i * 1.57 + ((s.x * 7 + s.y * 13 + i * 5) % 10) / 8;
      const len = 7 + ((s.x + s.y * 3 + i * 11) % 9);
      ctx.moveTo(s.x + 0.5, s.y + 0.5);
      ctx.lineTo(Math.round(s.x + Math.cos(a) * len) + 0.5, Math.round(s.y + Math.sin(a) * len) + 0.5);
    }
    ctx.stroke();
  }
}

function drawStatue(ctx: CanvasRenderingContext2D, world: World, art: StatueArt) {
  const { statue } = world;
  const tw = art.sw / statue.cols;
  const th = art.sh / statue.rows;
  for (const tile of statue.tiles) {
    const o = tileOrigin(statue, tile);
    const sx = art.sx + tile.col * tw;
    const sy = art.sy + tile.row * th;
    if (tile.attached) {
      // The wallpaper fades into the taskbar; fade the bottom rows the same way.
      const fromBottom = (statue.rows - tile.row - 0.5) / statue.rows;
      ctx.globalAlpha = Math.min(1, fromBottom / 0.16);
      // +1 px hides hairline gaps between neighbouring tiles.
      ctx.drawImage(art.image, sx, sy, tw, th, o.x, o.y, o.w + 1, o.h + 1);
    } else {
      ctx.globalAlpha = 1;
      ctx.save();
      ctx.translate(o.x + o.w / 2, o.y + o.h / 2);
      ctx.rotate(tile.angle);
      ctx.drawImage(art.image, sx, sy, tw, th, -o.w / 2, -o.h / 2, o.w, o.h);
      ctx.restore();
    }
  }
  ctx.globalAlpha = 1;

  // The eye glows red while it wakes, as long as the eye is still there.
  if (statue.wake > 0) {
    const col = Math.floor(EYE.x * statue.cols);
    const row = Math.floor(EYE.y * statue.rows);
    const eyeLeft = statue.tiles.some((t) => t.attached && t.col === col && t.row === row);
    if (eyeLeft) {
      const x = statue.home.x + statue.dx + EYE.x * statue.home.w;
      const y = statue.home.y + statue.dy + EYE.y * statue.home.h;
      const pulse = 0.75 + Math.sin(world.time * 6) * 0.25;
      const r = (8 + statue.home.w * 0.02) * statue.wake * pulse;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
      glow.addColorStop(0, "rgba(255, 240, 240, 1)");
      glow.addColorStop(0.25, "rgba(255, 40, 40, 0.95)");
      glow.addColorStop(1, "rgba(255, 0, 0, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
  }
}

export function drawWorld(
  ctx: CanvasRenderingContext2D,
  world: World,
  art: StatueArt | null,
  shake: { x: number; y: number }
) {
  ctx.clearRect(0, 0, world.w, world.h);
  ctx.save();
  ctx.translate(shake.x, shake.y);

  // The canvas statue only replaces the wallpaper once it is awake.
  if (art && world.phase !== "play") drawStatue(ctx, world, art);

  drawDamage(ctx, world);

  for (const rock of world.rocks) drawRock(ctx, rock);

  // Bullets: a bright streak along the flight path.
  ctx.lineCap = "butt";
  for (const b of world.bullets) {
    const v = Math.hypot(b.vx, b.vy) || 1;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x - (b.vx / v) * 14, b.y - (b.vy / v) * 14);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#ff8c1a";
    ctx.stroke();
    ctx.fillStyle = "#ffffe1";
    ctx.fillRect(Math.round(b.x) - 3, Math.round(b.y) - 3, 6, 6);
  }

  for (const p of world.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
  }
  ctx.globalAlpha = 1;

  // "The pointer becomes the ship": a ring opens around it at the start.
  if (world.time < 0.7 && world.ship.alive) {
    const grow = world.time * 90;
    ctx.globalAlpha = 1 - world.time / 0.7;
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ffd800";
    ctx.strokeRect(
      Math.round(world.ship.x - 8 - grow),
      Math.round(world.ship.y - 8 - grow),
      Math.round(16 + grow * 2),
      Math.round(16 + grow * 2)
    );
    ctx.globalAlpha = 1;
  }

  drawShip(ctx, world.ship, world.time);
  ctx.restore();
}

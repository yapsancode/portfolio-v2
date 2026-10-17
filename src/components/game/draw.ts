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
const CURSOR_SCALE = 1.4;

function drawShip(ctx: CanvasRenderingContext2D, ship: Ship, time: number) {
  if (!ship.alive) return;
  // Blink while it can't be hit.
  if (ship.safe > 0 && Math.floor(time * 10) % 2 === 0) return;
  ctx.save();
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

function drawRock(ctx: CanvasRenderingContext2D, rock: Rock) {
  const n = rock.shape.length;
  ctx.save();
  ctx.translate(rock.x, rock.y);
  ctx.rotate(rock.angle);
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = rock.r * rock.shape[i];
    if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  const fill = ctx.createRadialGradient(-rock.r * 0.3, -rock.r * 0.3, 1, 0, 0, rock.r);
  fill.addColorStop(0, "#f4f4f4");
  fill.addColorStop(1, "#a8a8a8");
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#606060";
  ctx.stroke();
  // A marble vein.
  ctx.beginPath();
  ctx.moveTo(-rock.r * 0.5, -rock.r * 0.15);
  ctx.quadraticCurveTo(0, rock.r * 0.2, rock.r * 0.45, -rock.r * 0.05);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(90, 90, 90, 0.55)";
  ctx.stroke();
  ctx.restore();
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

  for (const rock of world.rocks) drawRock(ctx, rock);

  ctx.fillStyle = "#ffffe1";
  for (const b of world.bullets) ctx.fillRect(Math.round(b.x) - 1, Math.round(b.y) - 1, 3, 3);

  for (const p of world.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
  }
  ctx.globalAlpha = 1;

  drawShip(ctx, world.ship, world.time);
  ctx.restore();
}

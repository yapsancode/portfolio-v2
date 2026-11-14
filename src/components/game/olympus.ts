import { getBoard, WIDTH, HEIGHT } from "./boards";

export const DIRECTIONS = ["up", "right", "down", "left"] as const;
export type Direction = (typeof DIRECTIONS)[number];
export type Game = {
  version: 1;
  id: string;
  board: number;
  variant: number;
  seed: number;
  random: number;
  position: number;
  remaining: number[];
  warning: number[];
  hearts: number;
  score: number;
  moves: number;
  chain: number;
  phase: "playing" | "won" | "lost";
};
export type Turn = { game: Game; path: number[]; smashed: number[]; hit: boolean; fired: number[] };

export function createGame(board = 0, variant = 0, seed = 1, id = "game"): Game {
  const layout = getBoard(board, variant);
  return { version: 1, id, board, variant, seed: seed >>> 0 || 1, random: seed >>> 0 || 1,
    position: layout.start, remaining: [...layout.objects], warning: [], hearts: 3,
    score: 0, moves: 0, chain: 0, phase: "playing" };
}

/** Slides to the edge or a marble block. Breakables never stop the cursor. */
export function slide(game: Game, direction: Direction): number[] {
  const { walls } = getBoard(game.board, game.variant);
  const [dx, dy] = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] }[direction];
  let x = game.position % WIDTH, y = Math.floor(game.position / WIDTH);
  const path: number[] = [];
  while (true) {
    x += dx; y += dy;
    if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT || walls.includes(y * WIDTH + x)) break;
    path.push(y * WIDTH + x);
  }
  return path;
}

function nextRandom(state: number): number {
  let n = state;
  n ^= n << 13; n ^= n >>> 17; n ^= n << 5;
  return n >>> 0;
}

function warn(game: Game): Pick<Game, "warning" | "random"> {
  const random = nextRandom(game.random);
  const landings = [...new Set(DIRECTIONS.map(d => slide(game, d).at(-1)).filter((n): n is number => n !== undefined))];
  if (game.moves < 2 || landings.length < 2) return { warning: [], random };
  const target = landings[random % landings.length];
  const destroyed = getBoard(game.board, game.variant).objects.length - game.remaining.length;
  let warning = [target];
  if (destroyed >= 5) {
    const row = Math.floor(target / WIDTH), col = target % WIDTH;
    warning = Array.from({ length: WIDTH * HEIGHT }, (_, i) => i).filter(i =>
      random % 2 ? Math.floor(i / WIDTH) === row : i % WIDTH === col);
    if (destroyed >= 11) warning.push(landings[(random + 1) % landings.length]);
  }
  // Fairness is a rule, not a probability. Always leave an escape next turn.
  if (!landings.some(i => !warning.includes(i))) warning = [target];
  return { warning: [...new Set(warning)].sort((a, b) => a - b), random };
}

export function move(game: Game, direction: Direction): Turn {
  const unchanged: Turn = { game, path: [], smashed: [], hit: false, fired: [] };
  if (game.phase !== "playing") return unchanged;
  const path = slide(game, direction);
  if (!path.length) return unchanged;
  const position = path[path.length - 1];
  const smashed = path.filter(i => game.remaining.includes(i));
  const remaining = game.remaining.filter(i => !smashed.includes(i));
  // The last smash wins before retaliation. Crossing a warning is safe.
  const won = remaining.length === 0;
  const hit = !won && game.warning.includes(position);
  const hearts = game.hearts - Number(hit);
  const next: Game = { ...game, position, remaining, hearts, moves: game.moves + 1,
    score: game.score + smashed.length * 100 + Math.max(0, smashed.length - 1) * 75,
    chain: Math.max(game.chain, smashed.length), warning: [],
    phase: won ? "won" : hearts === 0 ? "lost" : "playing" };
  if (next.phase === "playing") Object.assign(next, warn(next));
  return { game: next, path, smashed, hit, fired: won ? [] : [...game.warning] };
}


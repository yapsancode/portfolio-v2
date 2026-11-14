export const WIDTH = 5;
export const HEIGHT = 6;
const layouts = [
  { name: "Unauthorized access", walls: [6, 8, 16, 19], start: 25 },
  { name: "Marble firewall", walls: [2, 11, 18, 22], start: 25 },
  { name: "System overload", walls: [6, 13, 16, 24], start: 25 },
  { name: "Divine permissions", walls: [2, 11, 13, 22], start: 25 },
  { name: "Temple of errors", walls: [7, 10, 19, 22], start: 25 },
  { name: "Final warning.exe", walls: [6, 9, 20, 23], start: 25 },
] as const;
export const BOARD_COUNT = layouts.length;

// Find swept cells, not just connected cells: sliding cannot stop anywhere.
function sweptCells(walls: readonly number[], start: number): number[] {
  const stops = new Set([start]), cells = new Set<number>();
  for (const stop of stops) {
    for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
      let x = stop % WIDTH, y = Math.floor(stop / WIDTH), end = stop;
      while (true) {
        x += dx; y += dy;
        const cell = y * WIDTH + x;
        if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT || walls.includes(cell)) break;
        cells.add(cell); end = cell;
      }
      stops.add(end);
    }
  }
  return [...cells].sort((a, b) => a - b);
}
const boards = layouts.map((layout, board) => ({ ...layout,
  objects: sweptCells(layout.walls, layout.start).filter(i => i !== layout.start && (i % 4 !== board % 4 || i === 26)),
}));

export function getBoard(index: number, variant = 0) {
  const board = boards[index];
  if (!board || !Number.isInteger(variant) || variant < 0 || variant > 3) throw new Error("Unknown Olympus board");
  const transform = (cell: number) => {
    const x = cell % WIDTH, y = Math.floor(cell / WIDTH);
    return (variant & 2 ? HEIGHT - 1 - y : y) * WIDTH + (variant & 1 ? WIDTH - 1 - x : x);
  };
  return { name: board.name, start: transform(board.start), walls: board.walls.map(transform), objects: board.objects.map(transform).sort((a, b) => a - b) };
}


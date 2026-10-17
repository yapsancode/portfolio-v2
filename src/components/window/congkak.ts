/**
 * Congkak rules — one round, no React.
 *
 * The board is one array of 16 numbers in sowing (clockwise) order, so
 * sowing is just "go to the next index", skipping the other player's house:
 *
 *        8  9 10 11 12 13 14          <- computer's holes (top row, sown left to right)
 *     7                       15      <- your house (left), computer's house (right)
 *        6  5  4  3  2  1  0          <- your holes (bottom row, sown right to left)
 *
 * Holes facing each other always add up to 14, so opposite(i) = 14 - i.
 */

export type Side = "you" | "computer";

export type GameState = {
  /** Marbles in each of the 16 places (see the diagram above). */
  board: number[];
  turn: Side;
  over: boolean;
};

/** One frame of a move, for the animation. */
export type Step = {
  board: number[];
  /** The place the hand is over. */
  at: number;
  /** Marbles still in the hand. */
  inHand: number;
};

export type Outcome =
  /** The last marble landed in the mover's own house. */
  | { kind: "extra-turn" }
  /** The last marble landed in an empty hole on the mover's side. */
  | { kind: "capture"; hole: number; taken: number }
  /** The last marble landed in an empty hole on the other side. */
  | { kind: "turn-over" };

export type MoveResult = {
  steps: Step[];
  outcome: Outcome;
  state: GameState;
};

export const HOLES = 7;
export const MARBLES_PER_HOLE = 7;
export const TOTAL_MARBLES = HOLES * MARBLES_PER_HOLE * 2;
export const YOUR_HOUSE = 7;
export const COMPUTER_HOUSE = 15;

/** Chain sowing always ends (every lap drops a marble in the mover's house), but cap it anyway. */
const MAX_STEPS = 20_000;
/**
 * How often the computer plays a random move instead of its best one. At
 * 0.4, a careful player wins about half the time (checked over 3,000
 * simulated games).
 */
const COMPUTER_SLIP = 0.4;

export function houseOf(side: Side): number {
  return side === "you" ? YOUR_HOUSE : COMPUTER_HOUSE;
}

/** The 7 hole indexes of a side, in sowing order. */
export function holesOf(side: Side): number[] {
  const first = side === "you" ? 0 : 8;
  return Array.from({ length: HOLES }, (_, i) => first + i);
}

export function sideOf(index: number): Side | null {
  if (index >= 0 && index <= 6) return "you";
  if (index >= 8 && index <= 14) return "computer";
  return null;
}

export function opposite(hole: number): number {
  return 14 - hole;
}

/** Hole number as players see it: 1-7, left to right on both rows. */
export function holeNumber(hole: number): number {
  return hole <= 6 ? 7 - hole : hole - 7;
}

export function newGame(): GameState {
  const board = Array<number>(16).fill(MARBLES_PER_HOLE);
  board[YOUR_HOUSE] = 0;
  board[COMPUTER_HOUSE] = 0;
  return { board, turn: "you", over: false };
}

export function legalMoves(state: GameState): number[] {
  if (state.over) return [];
  return holesOf(state.turn).filter((hole) => state.board[hole] > 0);
}

function sideIsEmpty(board: number[], side: Side): boolean {
  return holesOf(side).every((hole) => board[hole] === 0);
}

/**
 * Plays one move for the side whose turn it is. `record: false` skips the
 * animation frames (the computer uses that when it tries every move).
 */
export function playMove(
  state: GameState,
  hole: number,
  record = true
): MoveResult {
  const side = state.turn;
  if (state.over || sideOf(hole) !== side || state.board[hole] === 0) {
    throw new Error(`Illegal move: hole ${hole} for ${side}`);
  }

  const board = state.board.slice();
  const ownHouse = houseOf(side);
  const otherHouse = houseOf(side === "you" ? "computer" : "you");
  const steps: Step[] = [];
  const snap = (at: number, inHand: number) => {
    if (record) steps.push({ board: board.slice(), at, inHand });
  };

  let hand = board[hole];
  board[hole] = 0;
  let at = hole;
  snap(at, hand);

  let outcome: Outcome = { kind: "turn-over" };
  for (let count = 0; count < MAX_STEPS; count++) {
    // Drop one marble in each place, clockwise.
    while (hand > 0) {
      at = (at + 1) % 16;
      if (at === otherHouse) continue;
      board[at] += 1;
      hand -= 1;
      snap(at, hand);
    }

    if (at === ownHouse) {
      outcome = { kind: "extra-turn" };
      break;
    }

    // Landed on marbles: pick them all up and keep going.
    if (board[at] > 1) {
      hand = board[at];
      board[at] = 0;
      snap(at, hand);
      continue;
    }

    // Landed in an empty hole.
    if (sideOf(at) === side) {
      const across = opposite(at);
      const taken = board[across];
      board[ownHouse] += taken + 1;
      board[across] = 0;
      board[at] = 0;
      snap(at, 0);
      outcome = { kind: "capture", hole: across, taken };
    }
    break;
  }

  let next: GameState = {
    board,
    turn:
      outcome.kind === "extra-turn"
        ? side
        : side === "you"
          ? "computer"
          : "you",
    over: false,
  };

  // One side is empty: each player keeps what is left on their own side.
  if (sideIsEmpty(board, "you") || sideIsEmpty(board, "computer")) {
    for (const s of ["you", "computer"] as const) {
      for (const h of holesOf(s)) {
        board[houseOf(s)] += board[h];
        board[h] = 0;
      }
    }
    snap(at, 0);
    next = { ...next, over: true };
  }

  return { steps, outcome, state: next };
}

export function winner(state: GameState): Side | "draw" {
  const you = state.board[YOUR_HOUSE];
  const computer = state.board[COMPUTER_HOUSE];
  if (you === computer) return "draw";
  return you > computer ? "you" : "computer";
}

/** Computer's lead after a move, following its own extra turns a few moves deep. */
function score(state: GameState, hole: number, depth: number): number {
  const { state: next } = playMove(state, hole, false);
  const lead = next.board[COMPUTER_HOUSE] - next.board[YOUR_HOUSE];
  if (next.over) return lead + (lead > 0 ? 100 : lead < 0 ? -100 : 0);
  if (next.turn !== "computer" || depth === 0) return lead;
  return Math.max(...legalMoves(next).map((h) => score(next, h, depth - 1)));
}

/** The computer's pick: usually its best move, sometimes a random one. */
export function chooseComputerMove(
  state: GameState,
  random: () => number = Math.random
): number {
  const moves = legalMoves(state);
  if (moves.length === 0) throw new Error("No legal moves");
  if (random() < COMPUTER_SLIP) {
    return moves[Math.floor(random() * moves.length)];
  }
  const scored = moves.map((hole) => ({ hole, value: score(state, hole, 2) }));
  const best = Math.max(...scored.map((s) => s.value));
  const top = scored.filter((s) => s.value === best);
  return top[Math.floor(random() * top.length)].hole;
}

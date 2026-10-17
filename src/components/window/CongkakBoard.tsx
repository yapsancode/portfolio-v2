"use client";

import { useState } from "react";
import type { KeyboardEvent } from "react";
import {
  COMPUTER_HOUSE,
  YOUR_HOUSE,
  holeNumber,
  holesOf,
} from "./congkak";

export type CongkakBoardProps = {
  /** Marbles in each of the 16 places (see congkak.ts). */
  board: number[];
  /** The place the hand is over while a move plays, if any. */
  handAt: number | null;
  /** True when it's your turn and nothing is moving. */
  canPlay: boolean;
  onPlay: (hole: number) => void;
  opponent: string;
};

const GULI_COLORS = ["#e04040", "#40a0ff", "#40c040", "#ffd800", "#c040c0", "#ff8c1a"];
const MAX_IN_HOLE = 12;
const MAX_IN_HOUSE = 30;

/** Spread marbles in a small pile (golden-angle spiral), as % of the well. */
function pile(count: number, rx: number, ry: number) {
  return Array.from({ length: count }, (_, i) => {
    const r = Math.sqrt((i + 0.5) / count);
    const angle = i * 2.39996;
    return { left: 50 + rx * r * Math.cos(angle), top: 50 + ry * r * Math.sin(angle) };
  });
}

const HOLE_PILE = pile(MAX_IN_HOLE, 29, 29);
const HOUSE_PILE = pile(MAX_IN_HOUSE, 28, 34);

/** Left to right on screen. */
const TOP_ROW = holesOf("computer");
const BOTTOM_ROW = holesOf("you").reverse();

function Marbles({ count, place }: { count: number; place: number }) {
  const spots = place === YOUR_HOUSE || place === COMPUTER_HOUSE ? HOUSE_PILE : HOLE_PILE;
  return spots.slice(0, count).map((spot, i) => (
    <span
      key={i}
      className="guli"
      style={{
        left: `${spot.left}%`,
        top: `${spot.top}%`,
        backgroundColor: GULI_COLORS[(i + place) % GULI_COLORS.length],
      }}
    />
  ));
}

function plural(n: number) {
  return `${n} marble${n === 1 ? "" : "s"}`;
}

export default function CongkakBoard({
  board,
  handAt,
  canPlay,
  onPlay,
  opponent,
}: CongkakBoardProps) {
  // Roving focus: one Tab stop for your row, arrows move along it.
  const [focusCol, setFocusCol] = useState(0);

  const onRowKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    let next = -1;
    if (e.key === "ArrowRight") next = Math.min(focusCol + 1, 6);
    if (e.key === "ArrowLeft") next = Math.max(focusCol - 1, 0);
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = 6;
    if (next === -1) return;
    e.preventDefault();
    setFocusCol(next);
    document.getElementById(`congkak-hole-${next}`)?.focus();
  };

  const wellClass = (place: number, base: string) =>
    `${base}${handAt === place ? " hand" : ""}`;

  return (
    <div className="congkak-board" role="group" aria-label="Congkak board">
      {/* Row 1: the computer's counts, above its holes */}
      {TOP_ROW.map((hole, col) => (
        <span
          key={`count-${hole}`}
          className="congkak-count"
          style={{ gridRow: 1, gridColumn: col + 2 }}
          aria-hidden="true"
        >
          {board[hole]}
        </span>
      ))}
      <span
        className="congkak-count"
        style={{ gridRow: 1, gridColumn: 9 }}
        aria-hidden="true"
      >
        {board[COMPUTER_HOUSE]}
      </span>

      {/* Houses, each spanning both rows of holes */}
      <div
        role="img"
        aria-label={`Your house: ${plural(board[YOUR_HOUSE])}`}
        className={wellClass(YOUR_HOUSE, "congkak-house")}
        style={{ gridRow: "2 / 4", gridColumn: 1 }}
      >
        <Marbles count={Math.min(board[YOUR_HOUSE], MAX_IN_HOUSE)} place={YOUR_HOUSE} />
      </div>
      <div
        role="img"
        aria-label={`${opponent}'s house: ${plural(board[COMPUTER_HOUSE])}`}
        className={wellClass(COMPUTER_HOUSE, "congkak-house")}
        style={{ gridRow: "2 / 4", gridColumn: 9 }}
      >
        <Marbles count={Math.min(board[COMPUTER_HOUSE], MAX_IN_HOUSE)} place={COMPUTER_HOUSE} />
      </div>

      {/* Row 2: the computer's holes (not playable) */}
      {TOP_ROW.map((hole, col) => (
        <div
          key={hole}
          role="img"
          aria-label={`${opponent}'s hole ${holeNumber(hole)}: ${plural(board[hole])}`}
          className={wellClass(hole, "congkak-hole")}
          style={{ gridRow: 2, gridColumn: col + 2 }}
        >
          <Marbles count={Math.min(board[hole], MAX_IN_HOLE)} place={hole} />
        </div>
      ))}

      {/* Row 3: your holes */}
      <div
        className="contents"
        role="toolbar"
        aria-label="Your holes"
        onKeyDown={onRowKeyDown}
      >
        {BOTTOM_ROW.map((hole, col) => {
          const playable = canPlay && board[hole] > 0;
          return (
            <button
              key={hole}
              id={`congkak-hole-${col}`}
              type="button"
              tabIndex={col === focusCol ? 0 : -1}
              aria-label={`Hole ${holeNumber(hole)}: ${plural(board[hole])}`}
              aria-disabled={!playable}
              className={wellClass(hole, `congkak-hole${playable ? " playable" : ""}`)}
              style={{ gridRow: 3, gridColumn: col + 2 }}
              onFocus={() => setFocusCol(col)}
              onClick={() => playable && onPlay(hole)}
            >
              <Marbles count={Math.min(board[hole], MAX_IN_HOLE)} place={hole} />
            </button>
          );
        })}
      </div>

      {/* Row 4: your counts, below your holes */}
      <span
        className="congkak-count"
        style={{ gridRow: 4, gridColumn: 1 }}
        aria-hidden="true"
      >
        {board[YOUR_HOUSE]}
      </span>
      {BOTTOM_ROW.map((hole, col) => (
        <span
          key={`count-${hole}`}
          className="congkak-count"
          style={{ gridRow: 4, gridColumn: col + 2 }}
          aria-hidden="true"
        >
          {board[hole]}
        </span>
      ))}
    </div>
  );
}

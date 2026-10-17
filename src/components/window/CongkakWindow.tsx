"use client";

import { useEffect, useReducer, useState, useSyncExternalStore } from "react";
import type { KeyboardEvent } from "react";
import { site } from "@/config/site";
import CongkakBoard from "./CongkakBoard";
import {
  COMPUTER_HOUSE,
  YOUR_HOUSE,
  chooseComputerMove,
  holeNumber,
  newGame,
  playMove,
  sideOf,
  winner,
  type GameState,
  type MoveResult,
  type Side,
} from "./congkak";

const copy = site.congkak;
const opponent = copy.opponent;
const TALLY_KEY = "isyraf98:congkak";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const YOUR_TURN = "Your turn. Pick a hole in the bottom row.";

type Tally = { wins: number; losses: number; draws: number };

type State = {
  game: GameState;
  /** The move being animated, frame by frame. */
  move: { result: MoveResult; side: Side; frame: number } | null;
  /** The last thing that happened, in words (also read out by screen readers). */
  message: string;
  tally: Tally;
};

type Action =
  | { type: "start"; hole: number; animate: boolean }
  | { type: "frame" }
  | { type: "finish" }
  | { type: "new-game" };

function loadTally(): Tally {
  try {
    const saved = JSON.parse(localStorage.getItem(TALLY_KEY) ?? "null");
    if (saved && typeof saved.wins === "number") return saved;
  } catch {
    // Storage blocked or broken: start a fresh record.
  }
  return { wins: 0, losses: 0, draws: 0 };
}

function describe(result: MoveResult, side: Side): string {
  const { outcome, state } = result;
  if (state.over) {
    const you = state.board[YOUR_HOUSE];
    const them = state.board[COMPUTER_HOUSE];
    const verdict = winner(state);
    const line =
      verdict === "you" ? copy.result.win : verdict === "computer" ? copy.result.lose : copy.result.draw;
    return `${line} Final score ${you}–${them}.`;
  }
  const captured =
    outcome.kind === "capture" && outcome.taken > 0
      ? side === "you"
        ? `You captured ${outcome.taken} from ${opponent}'s hole ${holeNumber(outcome.hole)}. `
        : `${opponent} captured ${outcome.taken} from your hole ${holeNumber(outcome.hole)}. `
      : "";
  if (outcome.kind === "extra-turn") {
    return side === "you"
      ? "Last marble in your house. Go again."
      : `${opponent} landed in its house and goes again.`;
  }
  return side === "you" ? `${captured}${opponent}'s turn.` : `${captured}Your turn.`;
}

function finish(state: State, result: MoveResult, side: Side): State {
  let { tally } = state;
  if (result.state.over) {
    const verdict = winner(result.state);
    tally = {
      wins: tally.wins + (verdict === "you" ? 1 : 0),
      losses: tally.losses + (verdict === "computer" ? 1 : 0),
      draws: tally.draws + (verdict === "draw" ? 1 : 0),
    };
  }
  return { game: result.state, move: null, message: describe(result, side), tally };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "start": {
      const { game } = state;
      if (state.move || game.over) return state;
      if (sideOf(action.hole) !== game.turn || game.board[action.hole] === 0) return state;
      const result = playMove(game, action.hole);
      if (!action.animate) return finish(state, result, game.turn);
      return { ...state, move: { result, side: game.turn, frame: 0 } };
    }
    case "frame":
      if (!state.move) return state;
      return { ...state, move: { ...state.move, frame: state.move.frame + 1 } };
    case "finish":
      if (!state.move) return state;
      return finish(state, state.move.result, state.move.side);
    case "new-game":
      return { ...state, game: newGame(), move: null, message: YOUR_TURN };
    default:
      return state;
  }
}

/** Long chains play faster, so no move takes much more than ~5 seconds. */
function frameDelay(frames: number): number {
  return Math.max(20, Math.min(140, 5000 / frames));
}

function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(REDUCED_MOTION);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false
  );
}

const toolbarButton =
  "bevel-out shrink-0 bg-win-face px-3 py-1 font-pixel text-base leading-none focus-visible:outline-1 focus-visible:-outline-offset-4 focus-visible:outline-dotted focus-visible:outline-black active:translate-x-px active:translate-y-px";

function HowToPlay() {
  return (
    <article className="bevel-in win-scroll min-h-0 flex-1 overflow-auto bg-white p-3 leading-relaxed">
      <h2 className="mb-2 font-pixel text-xl leading-none">How to play</h2>
      {copy.howToPlay.intro.map((p) => (
        <p key={p.slice(0, 24)} className="mb-3">
          {p}
        </p>
      ))}
      <p className="mb-1">{copy.howToPlay.landingTitle}</p>
      <ul className="mb-3 list-disc pl-6">
        {copy.howToPlay.landing.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {copy.howToPlay.outro.map((p) => (
        <p key={p.slice(0, 24)} className="mb-3">
          {p}
        </p>
      ))}
    </article>
  );
}

export default function CongkakWindow() {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    game: newGame(),
    move: null,
    message: YOUR_TURN,
    tally: loadTally(),
  }));
  const [view, setView] = useState<"board" | "help">("board");
  const reducedMotion = useReducedMotion();
  const { game, move, message, tally } = state;

  // Play the current move one marble at a time.
  useEffect(() => {
    if (!move || view !== "board") return;
    const frames = move.result.steps.length;
    const last = move.frame >= frames - 1;
    const timer = setTimeout(
      () => dispatch({ type: last ? "finish" : "frame" }),
      last ? 300 : frameDelay(frames)
    );
    return () => clearTimeout(timer);
  }, [move, view]);

  // The computer takes its turn after a short pause.
  useEffect(() => {
    if (game.over || game.turn !== "computer" || move || view !== "board") return;
    const timer = setTimeout(
      () =>
        dispatch({
          type: "start",
          hole: chooseComputerMove(game),
          animate: !reducedMotion,
        }),
      reducedMotion ? 900 : 700
    );
    return () => clearTimeout(timer);
  }, [game, move, view, reducedMotion]);

  // Keep the win/loss record in this browser only.
  useEffect(() => {
    try {
      localStorage.setItem(TALLY_KEY, JSON.stringify(tally));
    } catch {
      // Storage blocked: the record just won't be remembered.
    }
  }, [tally]);

  const step = move ? move.result.steps[move.frame] : null;
  const board = step ? step.board : game.board;
  const canPlay = !move && !game.over && game.turn === "you";

  const play = (hole: number) =>
    dispatch({ type: "start", hole, animate: !reducedMotion });
  const skip = () => {
    if (move) dispatch({ type: "finish" });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (view !== "board") return;
    // Space skips to the end of a move that is playing.
    if (move && e.key === " ") {
      e.preventDefault();
      skip();
      return;
    }
    // 1-7 play your holes, left to right.
    const n = Number(e.key);
    if (canPlay && Number.isInteger(n) && n >= 1 && n <= 7) {
      const hole = 7 - n;
      if (board[hole] > 0) play(hole);
    }
  };

  let status = message;
  if (step) {
    status =
      move?.side === "you"
        ? `Sowing… ${step.inHand} in hand.`
        : `${opponent} is sowing… ${step.inHand} in hand.`;
  }

  let lcd = "YOUR TURN";
  if (game.over) {
    const verdict = winner(game);
    lcd = verdict === "you" ? "YOU WIN" : verdict === "computer" ? "YOU LOSE" : "SERI";
  } else if (move) {
    lcd = "SOWING";
  } else if (game.turn === "computer") {
    lcd = "THINKING";
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  const record = `${tally.wins}W ${tally.losses}L${tally.draws ? ` ${tally.draws}D` : ""}`;

  return (
    <div
      className="flex h-full min-h-0 flex-col bg-win-face p-2"
      onKeyDown={onKeyDown}
    >
      <h1 className="sr-only">Congkak</h1>

      <div className="mb-2 flex shrink-0 items-center gap-1">
        {view === "board" && (
          <button type="button" className={toolbarButton} onClick={() => dispatch({ type: "new-game" })}>
            New game
          </button>
        )}
        {/* One button that changes its label, so keyboard focus stays on it. */}
        <button
          type="button"
          className={toolbarButton}
          onClick={() => setView(view === "board" ? "help" : "board")}
        >
          {view === "board" ? "How to play" : "Back"}
        </button>
      </div>

      {view === "help" ? (
        <HowToPlay />
      ) : (
        <>
          <div className="bevel-in shrink-0 bg-win-face p-0.5">
            <div className="player-lcd flex items-baseline justify-between gap-3" aria-hidden="true">
              <span>YOU {pad(board[YOUR_HOUSE])}</span>
              <span className="truncate">{lcd}</span>
              <span>
                {opponent.toUpperCase()} {pad(board[COMPUTER_HOUSE])}
              </span>
            </div>
          </div>

          <div
            className="win-scroll congkak-table flex min-h-0 flex-1 items-center justify-center overflow-auto py-3"
            onClick={skip}
          >
            <CongkakBoard
              board={board}
              handAt={step ? step.at : null}
              canPlay={canPlay}
              onPlay={play}
              opponent={opponent}
            />
          </div>
        </>
      )}

      <div className="mt-2 flex shrink-0 gap-0.5 font-pixel text-base leading-none">
        <div className="bevel-well min-w-0 flex-1 px-2 py-0.5">{status}</div>
        <div className="bevel-well shrink-0 px-2 py-0.5">Record: {record}</div>
      </div>

      {/* Screen readers hear the result of each move, not every marble. */}
      <p role="status" className="sr-only">
        {message}
      </p>
    </div>
  );
}

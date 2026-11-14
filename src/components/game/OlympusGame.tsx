"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import PixelIcon from "@/components/desktop/PixelIcon";
import { BOARD_COUNT, getBoard } from "./boards";
import { createGame, DIRECTIONS, move, slide, type Direction, type Turn } from "./olympus";
import { cellPosition, coordinate, landingDescription } from "./draw";
import { KEY_DIRECTIONS, swipeDirection } from "./swipe-input";
import { credit, loadSession, saveSession, SAVE_KEY, SKINS, type Session } from "./storage";
import "./olympus.css";
import { playSound, setSoundVolume, unlockSound } from "./sound";

const subscribe = () => () => {};
const isClient = () => true;
const isServer = () => false;
const ARROWS = { up: "↑", right: "→", down: "↓", left: "←" };
const newId = () => crypto.randomUUID();
const copy = site.olympus.swipe;

type Props = { onExit?: () => void; volume?: number };
export default function OlympusGame(props: Props) {
  const client = useSyncExternalStore(subscribe, isClient, isServer);
  return client ? <GameSession {...props} /> : <div className="swipe-loading" role="status">Opening olympus.exe…</div>;
}

function GameSession({ onExit, volume = 1 }: Props) {
  const [session, setSession] = useState<Session>(() => {
    const saved = loadSession();
    return credit({ ...saved, game: saved.game ?? createGame(0, 0, 1, newId()) });
  });
  const game = session.game!;
  const board = getBoard(game.board, game.variant);
  const stateRef = useRef(session);
  const [paused, setPaused] = useState(game.phase === "playing" && game.moves > 0);
  const pausedRef = useRef(paused);
  const [turn, setTurn] = useState<Turn | null>(null);
  const [preview, setPreview] = useState<Direction | null>(null);
  const [buttons, setButtons] = useState(false);
  const [saving, setSaving] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  const root = useRef<HTMLElement>(null);
  const pointer = useRef<{ id: number; x: number; y: number } | null>(null);
  const busy = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewPath = preview ? slide(game, preview) : [];
  const destination = previewPath.at(-1);
  const broken = board.objects.length - game.remaining.length;
  const progress = broken / board.objects.length;
  const ended = game.phase !== "playing";
  const showResult = ended && !turn;

  const persist = useCallback((next: Session) => {
    const value = credit(next);
    stateRef.current = value;
    setSession(value);
    setSaving(saveSession(value));
  }, []);

  const clearInteraction = useCallback(() => {
    pointer.current = null;
    busy.current = false;
    if (timer.current) clearTimeout(timer.current);
    setPreview(null);
    setTurn(null);
  }, []);

  const pause = useCallback(() => {
    if (stateRef.current.game?.phase !== "playing") return;
    clearInteraction();
    pausedRef.current = true;
    setPaused(true);
    setSoundVolume(0);
  }, [clearInteraction]);

  const resume = () => {
    clearInteraction();
    pausedRef.current = false;
    setPaused(false);
    unlockSound();
    setSoundVolume(stateRef.current.profile.muted ? 0 : volume);
    root.current?.focus();
  };

  const act = useCallback((direction: Direction) => {
    const current = stateRef.current;
    if (!current.game || pausedRef.current || busy.current) return;
    const result = move(current.game, direction);
    if (result.game === current.game) {
      setAnnouncement("Marble in the way. Try another direction.");
      return;
    }
    unlockSound();
    setSoundVolume(current.profile.muted ? 0 : volume);
    busy.current = true;
    pointer.current = null;
    setPreview(null);
    persist({ ...current, game: result.game });
    setTurn(result);
    if (result.game.phase === "won") playSound("win");
    else if (result.hit) playSound("shipLost");
    else if (result.smashed.length > 1) playSound("windowCrash");
    else if (result.smashed.length) playSound("iconBreak");
    else playSound("shot");
    setAnnouncement(`Move ${result.game.moves}. ${result.smashed.length} smashed. ${result.hit ? "Hit! " : ""}${result.game.hearts} hearts. ${result.game.remaining.length} objects left.`);
    timer.current = setTimeout(() => { busy.current = false; setTurn(null); }, result.game.phase === "playing" ? 220 : 550);
  }, [persist, volume]);

  useEffect(() => {
    root.current?.focus();
    return () => { if (timer.current) clearTimeout(timer.current); setSoundVolume(volume); };
  }, [volume]);

  useEffect(() => {
    setSoundVolume(paused || session.profile.muted ? 0 : volume);
  }, [paused, session.profile.muted, volume]);

  useEffect(() => {
    if (paused || showResult) root.current?.querySelector<HTMLButtonElement>("[data-primary]")?.focus();
  }, [paused, showResult]);

  useEffect(() => {
    const visibility = () => { if (document.hidden) pause(); };
    const storage = (event: StorageEvent) => {
      if (event.key !== SAVE_KEY && event.key !== null) return;
      // Another tab owns the latest save. Reload it before accepting more moves.
      pause();
      const saved = loadSession();
      if (saved.game) { stateRef.current = saved; setSession(saved); }
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        const area = root.current?.querySelector<HTMLElement>("[data-overlay]") ?? root.current;
        const focusable = Array.from(area?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input, select') ?? [])
          .filter(el => el.offsetParent !== null && !el.closest("[inert]"));
        if (focusable?.length) {
          event.preventDefault();
          const current = focusable.indexOf(document.activeElement as HTMLElement);
          const next = current < 0 ? (event.shiftKey ? focusable.length - 1 : 0) :
            (current + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length;
          focusable[next].focus();
        }
        return;
      }
      if (event.key === "Escape" || event.key.toLowerCase() === "p") {
        event.preventDefault(); event.stopPropagation(); pause(); return;
      }
      const direction = KEY_DIRECTIONS[event.key] ?? KEY_DIRECTIONS[event.key.toLowerCase()];
      if (direction && !event.repeat && !(event.target instanceof HTMLSelectElement)) {
        event.preventDefault(); event.stopPropagation(); act(direction);
      }
    };
    window.addEventListener("keydown", key, true);
    window.addEventListener("blur", pause);
    window.addEventListener("resize", clearInteraction);
    window.addEventListener("storage", storage);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("keydown", key, true);
      window.removeEventListener("blur", pause);
      window.removeEventListener("resize", clearInteraction);
      window.removeEventListener("storage", storage);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [act, pause, clearInteraction]);

  const pointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (pointer.current || pausedRef.current || busy.current || ended || event.button > 0) return;
    pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* Pointer already cancelled by the browser. */ }
  };
  const pointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const p = pointer.current;
    if (p?.id !== event.pointerId) return;
    setPreview(swipeDirection(event.clientX - p.x, event.clientY - p.y));
  };
  const pointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    const p = pointer.current;
    if (p?.id !== event.pointerId) return;
    pointer.current = null;
    setPreview(null);
    const direction = swipeDirection(event.clientX - p.x, event.clientY - p.y);
    if (direction) act(direction);
  };
  const cancelPointer = (event: ReactPointerEvent<HTMLElement>) => {
    if (pointer.current?.id === event.pointerId) { pointer.current = null; setPreview(null); }
  };
  const gestureProps = { onPointerDown: pointerDown, onPointerMove: pointerMove, onPointerUp: pointerUp,
    onPointerCancel: cancelPointer, onLostPointerCapture: cancelPointer,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault() };

  const replay = (same: boolean) => {
    clearInteraction();
    const next = same ? createGame(game.board, game.variant, game.seed, newId()) :
      createGame((game.board + 1) % BOARD_COUNT, Math.floor(Math.random() * 4), crypto.getRandomValues(new Uint32Array(1))[0] || 1, newId());
    persist({ ...stateRef.current, game: next });
    pausedRef.current = false; setPaused(false);
    root.current?.focus();
  };
  const toggleSound = () => {
    unlockSound();
    persist({ ...stateRef.current, profile: { ...stateRef.current.profile, muted: !stateRef.current.profile.muted } });
  };
  const speech = game.phase === "won" ? copy.won :
    game.phase === "lost" ? copy.lost : turn?.hit ? copy.hit :
    turn && turn.smashed.length >= 3 ? copy.chain :
    game.moves === 0 ? copy.asleep :
    progress > .65 ? copy.angry : copy.awake;
  const firstDirection = (["right", "up", "left", "down"] as Direction[]).find(d => slide(game, d).some(i => game.remaining.includes(i))) ?? "right";
  const hint = destination !== undefined ? `Release: ${landingDescription(game, preview!)}` :
    game.moves === 0 ? `Swipe ${firstDirection} to smash your first files ${ARROWS[firstDirection]}` :
    game.moves < 2 ? "One swipe slides all the way. Marble stops you." :
    "Cross the stripes. Don’t land on them.";
  const exit = onExit ?
    <button type="button" onClick={onExit} aria-label="Exit to desktop">✕</button> :
    <Link href="/" aria-label="Exit to desktop">✕</Link>;

  return (
    <section ref={root} className="swipe-game" tabIndex={-1} aria-label="Olympus Swipe and Smash"
      role={onExit ? "dialog" : undefined} aria-modal={onExit ? true : undefined}
      data-phase={game.phase} data-moves={game.moves} data-position={game.position} data-hearts={game.hearts} data-busy={!!turn}>
      <div className="swipe-frame" inert={paused || ended}>
        <div className="swipe-chrome">
          <span><PixelIcon name="olympus" size={18} /> olympus.exe</span>
          <div><button type="button" onClick={toggleSound} aria-label={session.profile.muted ? "Enable sound" : "Mute sound"}>{session.profile.muted ? "SOUND OFF" : "SOUND ON"}</button>{exit}</div>
        </div>
        <header className="swipe-heading"><div><p>ISYRAF 98 PRESENTS</p><h1>OLYMPUS<span>SWIPE & SMASH</span></h1></div><span className="swipe-stamp">ONE THUMB.<br />ZERO RUSH.</span></header>
        <div className="swipe-stage">
          <div className={`swipe-boss ${turn?.smashed.length ? "swipe-boss-hit" : ""}`}>
            <div className={`swipe-sculpture ${ended ? "swipe-sculpture-ended" : ""}`} aria-hidden="true">
              <Image src={site.wallpaperImage.src} alt="" fill sizes="140px" unoptimized className="swipe-statue-image" loading="eager" />
              {progress > .25 && <svg className="swipe-cracks" viewBox="0 0 100 100"><path d="M50 10l-8 20 14 12-20 15 9 15-17 20M56 42l16 4 5 18" /></svg>}
              {game.moves > 0 && <span className="swipe-eye" />}
            </div>
            <div className="swipe-boss-copy"><span className="swipe-eyebrow">{ended ? "SYSTEM MESSAGE" : game.moves < 2 ? "DO NOT DISTURB" : "STATUE IS ONLINE"}</span>
              <p aria-live="off">“{speech}”</p>
              <div className="swipe-boss-meter" role="meter" aria-label="Statue health" aria-valuemin={0} aria-valuemax={board.objects.length} aria-valuenow={game.remaining.length}><span style={{ width: (1 - progress) * 100 + "%" }} /></div>
              <small>{game.remaining.length} FILES TO CRUMBLE</small>
            </div>
          </div>
          <div className="swipe-play-area">
            <div className="swipe-hud">
              <span><small>SCORE</small><strong>{String(game.score).padStart(5, "0")}</strong></span>
              <span className="swipe-board-label"><small>BOARD {game.board + 1} / {BOARD_COUNT}</small>{board.name}</span>
              <span className="swipe-hearts" aria-label={`${game.hearts} hearts`}>{[1, 2, 3].map(i => <span key={i} className={i > game.hearts ? "empty" : ""}>♥</span>)}</span>
            </div>
            <div className={`swipe-board ${turn?.hit ? "swipe-board-hit" : ""}`} {...gestureProps}
              role="img" aria-label={`Desktop board. Cursor at ${coordinate(game.position)}. ${game.remaining.length} files left. Danger: ${game.warning.map(coordinate).join(", ") || "none"}.`}>
              {Array.from({ length: 30 }, (_, cell) => {
                const wall = board.walls.includes(cell), object = game.remaining.includes(cell);
                const danger = (turn ? turn.fired : game.warning).includes(cell), smashed = turn?.smashed.includes(cell);
                return <div key={cell} className={`swipe-cell ${wall ? "marble" : ""} ${danger && !wall ? "danger" : ""} ${previewPath.includes(cell) ? "path" : ""}`} data-cell={cell} data-danger={danger} data-object={object}>
                  {wall ? <span className="swipe-marble-mark" /> : object ? <span className="swipe-object"><PixelIcon name={cell % 3 === 0 ? "terminal" : cell % 3 === 1 ? "folder" : "envelope"} size={32} /></span> :
                    board.objects.includes(cell) ? <span className={`swipe-debris ${smashed ? "fresh" : ""}`}>· ▪ ·</span> : null}
                  {danger && !wall && <span className="swipe-danger-mark">×</span>}
                  {turn?.fired.includes(cell) && !wall && <span className="swipe-blast" aria-hidden="true">✦</span>}
                  {cell === destination && <span className="swipe-destination">{game.warning.includes(cell) ? "!" : "◎"}</span>}
                </div>;
              })}
              <div className="swipe-cursor" style={cellPosition(game.position)}><svg viewBox="0 0 24 30" aria-hidden="true" style={{ fill: SKINS[session.profile.skin].colour }}><path d="M3 2v22l6-6 5 10 5-3-5-9h9Z" /></svg></div>
              {turn && turn.smashed.length > 1 && <div className="swipe-chain" key={game.moves}>{turn.smashed.length}× SMASH!</div>}
              {game.moves === 0 && game.board === 0 && game.variant === 0 && <div className="swipe-first-arrow" aria-hidden="true">→ → →</div>}
            </div>
            <div className="swipe-hint" aria-live="polite">{hint}</div>
          </div>
          <div className="swipe-controls">
            <div className="swipe-pad" {...gestureProps} aria-label="Swipe pad"><span>←</span><div>SWIPE HERE<small>The world waits for you.</small></div><span>→</span></div>
            {buttons && <div className="swipe-directions">{DIRECTIONS.map(d => <button key={d} type="button" disabled={ended || paused} onClick={() => act(d)} aria-label={`Slide ${d}. ${landingDescription(game, d)}`}>{ARROWS[d]}</button>)}</div>}
            <div className="swipe-toolbar"><button type="button" onClick={() => setButtons(!buttons)} aria-expanded={buttons}>{buttons ? "HIDE" : "SHOW"} BUTTONS</button><span>{game.moves} MOVES</span><button type="button" onClick={pause} disabled={ended}>PAUSE / HELP</button></div>
          </div>
        </div>
        <footer className="swipe-footer"><span>{saving ? "PROGRESS SAVES ON THIS DEVICE" : "SAVING UNAVAILABLE ON THIS DEVICE"}</span><span>© ISYRAF 98</span></footer>
      </div>

      {(paused || showResult) && <div className="swipe-overlay" data-overlay>
        <div className="swipe-dialog" role="dialog" aria-modal="true" aria-label={ended ? "Round result" : "Game paused"}>
          <div className="swipe-dialog-bar">{ended ? game.phase === "won" ? "operation_successful.exe" : "pointer_not_responding.exe" : "take_your_time.exe"}<span>▣</span></div>
          <div className="swipe-dialog-body">
            <span className="swipe-eyebrow">{ended ? "BOARD " + (game.board + 1) + " · " + game.moves + " MOVES" : "YOUR NEXT MOVE CAN WAIT"}</span>
            <h2>{ended ? game.phase === "won" ? "God complex. Fixed." : "The statue won." : "Right where you left off."}</h2>
            <p>{ended ? game.phase === "won" ? "It is now safe to turn off your statue." : "Same desktop. A fresh chance to wreck it." : "Swipe to the edge or a marble block. Smash every file. Stripes fire after your next move: cross them, but land somewhere safe."}</p>
            {ended ? <div className="swipe-result-stats"><span><small>SCORE</small>{game.score}</span><span><small>BEST</small>{session.profile.best}</span><span><small>CHAIN</small>{game.chain}×</span></div> : <p className="swipe-help">Arrow keys / WASD work too. No timer. No rush.</p>}
            <button data-primary type="button" className="swipe-primary" onClick={ended ? () => replay(game.phase === "lost") : resume}>{ended ? game.phase === "won" ? "SMASH ANOTHER →" : "TRY AGAIN →" : "KEEP PLAYING →"}</button>
            {ended && <button type="button" className="swipe-secondary" onClick={() => replay(game.phase === "won")}>{game.phase === "won" ? "Retry this board" : "Try a different board"}</button>}
            <div className="swipe-skins"><span>YOUR CURSOR · {session.profile.completed.length} CLEARS</span><div>{SKINS.map((skin, i) => <button type="button" key={skin.name} disabled={session.profile.completed.length < skin.clears} aria-label={skin.name + (skin.clears ? " — unlocks at " + skin.clears + " clears" : "")} aria-pressed={session.profile.skin === i} onClick={() => persist({ ...stateRef.current, profile: { ...stateRef.current.profile, skin: i } })} style={{ color: skin.colour }}>{session.profile.completed.length < skin.clears ? skin.clears : "↖"}</button>)}</div></div>
            {onExit ? <button type="button" className="swipe-secondary" onClick={onExit}>Return to desktop</button> : <Link className="swipe-secondary" href="/">Return to desktop</Link>}
          </div>
        </div>
      </div>}
      <p role="status" className="sr-only">{announcement}</p>
    </section>
  );
}


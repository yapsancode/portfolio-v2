"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { site, windowDefaults } from "@/config/site";
import type { DesktopIconId, WindowId } from "@/config/site";
import { TASKBAR_HEIGHT } from "@/components/desktop/Taskbar";
import { drawWorld, type StatueArt } from "./draw";
import { useMusic } from "@/components/desktop/music";
import { loadBest, saveBest } from "./GameContext";
import { playSound, setSoundVolume, suspendSound, unlockSound } from "./sound";
import { createDialogue, type DialogueEvent } from "./dialogue";
import TouchJoystick from "./TouchJoystick";
import FullscreenHelp from "./FullscreenHelp";
import { isPhoneTouchDevice, type StickVector } from "./touch-controls";
import { enterGameFullscreen } from "./fullscreen";
import { LESSON_DONE, nextLessonStep } from "./flight-school";
import { LAST_LEVEL, levelInfo, type Progress } from "@/lib/games/olympus/levels";
import { missionInfo } from "@/lib/games/olympus/missions";
import MarbleBank from "./MarbleBank";
import StartOver from "./StartOver";
import ScoreStatus from "./ScoreStatus";
import { attemptBlocker, beginRankedAttempt, finishRankedAttempt, saveGuestAttempt, type RankedAttempt, type ScoreSubmission } from "@/lib/games/olympus/client";
import {
  createStatue,
  createWorld,
  resize,
  setTargets,
  step,
  TUNING,
  type GameEvent,
  type Input,
  type Phase,
  type Rect,
  type TargetRect,
  type World,
} from "./olympus";

const copy = site.olympus;
const COLS = 16;
const ROWS = 18;
const DT = 1 / 60;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
/** Game time skipped on a kill, so it lands with a small "thud". */
const KILL_PAUSE_MS = 45;

export type OlympusGameProps = {
  /** Where the pointer was when Start was pressed: the ship appears there. */
  spawnAt: { x: number; y: number } | null;
  /** Touch rules for this fight, decided once when it starts. */
  touchDevice: boolean;
  /** Open windows, so the game knows which one is on top. */
  windows: { id: WindowId; zIndex: number; minimized: boolean }[];
  onIconDestroyed: (id: DesktopIconId) => void;
  onWindowCrashed: (id: WindowId) => void;
  onStatueAwake: () => void;
  /** Checkpoint selected by the returning player. Each attempt starts fresh. */
  progress: Progress;
  onEnd: (replay: boolean, progress?: Progress) => void;
};

type Hud = { score: number; lives: number; anger: number; statue: number; phase: Phase };
type Ending = { kind: "won" | "lost"; score: number; best: number; newBest: boolean; submission: ScoreSubmission | null; checkpoint: Progress | null; notice: string };
type Crash = { key: number; name: string; x: number; y: number };
type Control = "left" | "right" | "thrust" | "fire";

const KEYS: Record<string, Control> = {
  ArrowLeft: "left",
  a: "left",
  A: "left",
  ArrowRight: "right",
  d: "right",
  D: "right",
  ArrowUp: "thrust",
  w: "thrust",
  W: "thrust",
  " ": "fire",
};

const NO_INPUT: Input = { left: false, right: false, thrust: false, fire: false };

function lessonTip(step: number, touch: boolean): string {
  const tip = copy.flightSchool.steps[step];
  return typeof tip === "string" ? tip : tip[touch ? 1 : 0];
}

/* ------------------------------------------------------------------ */
/* Reading the desktop                                                 */
/* ------------------------------------------------------------------ */

function worldSize(touch: boolean) {
  return { w: window.innerWidth, h: Math.max(100, window.innerHeight - (touch ? 0 : TASKBAR_HEIGHT)) };
}

/** Screen boxes of the joystick and FIRE button (none while they are hidden). */
function readControls(): Rect[] {
  return Array.from(document.querySelectorAll(".olympus-joystick, .olympus-touch-fire"), (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  });
}

function statueBox(touch: boolean): Rect {
  const el = document.querySelector<HTMLElement>("[data-statue]");
  const r = el?.getBoundingClientRect();
  if (r && r.width > 0) return { x: r.left, y: r.top, w: r.width, h: r.height };
  const { w, h } = worldSize(touch);
  return { x: w * 0.35, y: h * 0.45, w: w * 0.3, h: h * 0.55 };
}

/** The same picture the wallpaper shows (already in the browser cache). */
async function loadStatueArt(box: Rect): Promise<StatueArt | null> {
  const dom = document.querySelector<HTMLImageElement>("[data-statue] img");
  const image = new Image();
  image.src = dom?.currentSrc || site.wallpaperImage.src;
  try {
    await image.decode();
  } catch {
    return null;
  }
  // The wallpaper box is narrower than the picture: it shows the full
  // width and crops from the top (object-cover + object-bottom).
  const sw = image.naturalWidth;
  const sh = Math.min(image.naturalHeight, (sw * box.h) / box.w);
  return { image, sx: 0, sy: image.naturalHeight - sh, sw, sh };
}

/** How much of each tile of the picture is statue (not empty background), 0 → 1. */
function tileCover(art: StatueArt | null): number[] {
  const solid: number[] = [];
  const k = 6;
  const canvas = document.createElement("canvas");
  canvas.width = COLS * k;
  canvas.height = ROWS * k;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!art || !ctx) {
    // No picture: a rough statue shape, so the game still works.
    for (let row = 0; row < ROWS; row++)
      for (let col = 0; col < COLS; col++)
        solid.push(row > 2 && Math.abs((col + 0.5) / COLS - 0.5) < 0.12 + row / ROWS / 3 ? 1 : 0);
    return solid;
  }
  ctx.drawImage(art.image, art.sx, art.sy, art.sw, art.sh, 0, 0, canvas.width, canvas.height);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      let alpha = 0;
      for (let y = 0; y < k; y++)
        for (let x = 0; x < k; x++) alpha += data[((row * k + y) * canvas.width + col * k + x) * 4 + 3];
      solid.push(alpha / (k * k) / 255);
    }
  }
  return solid;
}

function readTargets(windows: OlympusGameProps["windows"]): TargetRect[] {
  const targets: TargetRect[] = [];
  const open = windows.filter((w) => !w.minimized).sort((a, b) => b.zIndex - a.zIndex);
  for (const win of open) {
    const r = document.querySelector(`[data-window-id="${win.id}"]`)?.getBoundingClientRect();
    if (!r || r.width === 0) continue;
    targets.push({ kind: "window", id: win.id, x: r.left, y: r.top, w: r.width, h: r.height });
  }
  document.querySelectorAll<HTMLElement>("[data-icon-id]").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || getComputedStyle(el).visibility === "hidden") return;
    targets.push({ kind: "icon", id: el.dataset.iconId ?? "", x: r.left, y: r.top, w: r.width, h: r.height });
  });
  return targets;
}

/** Only phones need landscape. Uses the screen, not the window: an iPad in Split View is a tall window. */
function needsLandscape(touch: boolean) {
  return touch && Math.min(screen.width, screen.height) <= 600 && window.matchMedia("(orientation: portrait)").matches;
}

function fileName(id: WindowId) {
  return windowDefaults[id].title.split("\\").pop() ?? id;
}

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

function ErrorGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="32" height="32" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="4" y="1" width="8" height="14" fill="#c00000" />
      <rect x="2" y="3" width="12" height="10" fill="#c00000" />
      <rect x="1" y="4" width="14" height="8" fill="#c00000" />
      <path d="M5 4h2v1h1v1h0V5h1V4h2v2h-1v1h-1v2h1v1h1v2H9v-1H8v-1H7v1H6v1H4v-2h1V9h1V7H5V6H4V4z" fill="#fff" />
    </svg>
  );
}

/** One life: a tiny arrow pointer. */
function CursorGlyph() {
  return (
    <svg viewBox="0 0 13 20" width="10" height="16" aria-hidden="true">
      <path d="M0.5 0.5v17l4-4 3 6 3-1.5-3-6h5.5z" fill="#00e000" stroke="#000" />
    </svg>
  );
}

/**
 * The end of a game, full screen. Losing is the blue screen; winning is the
 * black "safe to turn off" screen. Enter plays again, Escape leaves.
 */
function EndScreen({
  ending,
  level,
  onReplay,
  onExit,
}: {
  ending: Ending;
  level: number;
  onReplay: (progress: Progress) => void;
  onExit: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [checkpoint, setCheckpoint] = useState(ending.checkpoint);
  const actions = useRef({ onReplay, onExit, checkpoint });
  const won = ending.kind === "won";

  useEffect(() => {
    actions.current = { onReplay, onExit, checkpoint };
  });

  useEffect(() => {
    ref.current?.focus();
    const shownAt = performance.now();
    const onKeyDown = (e: KeyboardEvent) => {
      // Ignore keys still held from playing.
      if (e.repeat || performance.now() - shownAt < 600) return;
      if (e.key !== "Enter" && e.key !== "Escape") return;
      if (e.key === "Enter" && e.target instanceof HTMLButtonElement) return;
      e.preventDefault();
      if (e.key === "Enter") {
        if (actions.current.checkpoint) actions.current.onReplay(actions.current.checkpoint);
      } else actions.current.onExit();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      ref={ref}
      className={won ? "bsod bsod-win" : "bsod"}
      role="alertdialog"
      aria-modal="true"
      onKeyDown={trapMenuFocus}
      aria-label={won ? "You won" : "Game over"}
      tabIndex={-1}
    >
      <div className="bsod-inner">
        {won ? (
          <p className="bsod-win-title">{copy.win.title}</p>
        ) : (
          <p className="bsod-title">
            <span>Olympus</span>
          </p>
        )}
        {(won ? copy.win.lines : copy.bsod).map((line) => (
          <p key={line}>{line}</p>
        ))}
        <p className="olympus-mission-brief">{won ? missionInfo(level).victory : missionInfo(level).retry}</p>
        <p>
          Marble collected: {ending.score.toLocaleString("en")} &nbsp;{" "}
          {ending.newBest ? "New best haul!" : `Best haul: ${ending.best.toLocaleString("en")}`}
          <> &nbsp; Level {level}</>
        </p>
        <div className="olympus-actions">
          <button type="button" className="olympus-button olympus-button-primary" disabled={!checkpoint} onClick={() => checkpoint && onReplay(checkpoint)}>
            {!checkpoint ? "Save to continue" : won ? (level === LAST_LEVEL ? `Replay level ${level}` : "Next level") : `Retry level ${level}`}
          </button>
          <button type="button" className="olympus-button" onClick={onExit}>Exit to desktop</button>
        </div>
        {won && <p className="olympus-menu-hint">{level === LAST_LEVEL ? "All available levels complete! More powers are planned." : `Level ${level} complete · Next: ${levelInfo(level + 1).name}`}</p>}
        {won && level < LAST_LEVEL && <p className="olympus-mission-brief">Next mission: {missionInfo(level + 1).briefing}</p>}
        {ending.notice && <p role="status" className="olympus-menu-hint">{ending.notice}</p>}
        {won && level === LAST_LEVEL && checkpoint && <StartOver progress={checkpoint} onReset={onReplay} />}
        {ending.submission && <ScoreStatus submission={ending.submission} onSaved={setCheckpoint} />}
        {checkpoint && <MarbleBank progress={checkpoint} onChange={setCheckpoint} />}
      </div>
    </div>
  );
}

function TouchPad({
  onPress,
  onMove,
}: {
  onPress: (control: Control, down: boolean) => void;
  onMove: (value: StickVector) => void;
}) {
  const firePointer = useRef<number | null>(null);
  const releaseFire = (pointerId: number) => {
    if (firePointer.current !== pointerId) return;
    firePointer.current = null;
    onPress("fire", false);
  };
  const button = (control: Control, label: string, name: string, extra = "") => (
    <button
      type="button"
      aria-label={name}
      className={`olympus-touch-btn bevel-out ${extra}`}
      onPointerDown={(e) => {
        if (firePointer.current !== null) return;
        e.preventDefault();
        firePointer.current = e.pointerId;
        try {
          // Keep receiving this finger's "up" even if it slides off the button.
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // No live pointer (synthetic event): the press still counts.
        }
        onPress(control, true);
      }}
      onPointerUp={(e) => releaseFire(e.pointerId)}
      onPointerCancel={(e) => releaseFire(e.pointerId)}
      onLostPointerCapture={(e) => releaseFire(e.pointerId)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {label}
    </button>
  );
  return (
    <>
      <div className="olympus-touch">
        <TouchJoystick onMove={onMove} />
        {button("fire", "FIRE", "Fire", "olympus-touch-fire")}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* The game                                                            */
/* ------------------------------------------------------------------ */

function trapMenuFocus(e: ReactKeyboardEvent<HTMLDivElement>) {
  if (e.key !== "Tab") return;
  const controls = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), textarea:not(:disabled), summary, a[href], [tabindex="0"]'));
  const first = controls[0];
  const last = controls[controls.length - 1];
  if (!first || !last) return;
  if (e.shiftKey && (document.activeElement === first || document.activeElement === e.currentTarget)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

export default function OlympusGame(props: OlympusGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef(props);
  const inputRef = useRef<Input>({ ...NO_INPUT });
  const pausedRef = useRef(false);
  const [rotateRequired, setRotateRequired] = useState(() => needsLandscape(props.touchDevice));
  const rotateRequiredRef = useRef(rotateRequired);
  const endedRef = useRef(false);
  const rankedAttemptRef = useRef<Promise<RankedAttempt> | null>(null);
  const retryStartRef = useRef<(() => void) | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const touchDevice = props.touchDevice;
  // Touch devices start with on-screen controls; a touch tap shows them mid-fight.
  // Keys never hide them, so the touch rules cannot flip mid-fight (the ship would jump).
  const [touch, setTouch] = useState(touchDevice);
  const touchRef = useRef(touch);

  const [hud, setHud] = useState<Hud>({ score: 0, lives: TUNING.lives, anger: 0, statue: 1, phase: "play" });
  const [paused, setPaused] = useState(false);
  const [preparing, setPreparing] = useState(true);
  const [ending, setEnding] = useState<Ending | null>(null);
  const [crashes, setCrashes] = useState<Crash[]>([]);
  const [speech, setSpeech] = useState<{ text: string; x: number; y: number } | null>(null);
  // Flight School: only for players who have never cleared level 1, even before a Start Over.
  const [lesson, setLesson] = useState(() =>
    props.progress.resumeLevel === 1 && props.progress.resources.furthestLevel === 0 ? 0 : LESSON_DONE);
  const lessonRef = useRef(lesson);
  const [announce, setAnnounce] = useState(() =>
    lesson < LESSON_DONE ? `Olympus started. ${copy.flightSchool.title}. ${lessonTip(0, touchDevice)}` : "Olympus started.");
  const { volume } = useMusic();

  // Game sounds follow the Music player's volume slider.
  useEffect(() => setSoundVolume(volume), [volume]);

  useEffect(() => {
    propsRef.current = props;
  });

  // The whole game loop lives in one effect: set up, run, clean up.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.focus();
    const touchDevice = propsRef.current.touchDevice;
    rankedAttemptRef.current ??= beginRankedAttempt(propsRef.current.progress.resumeLevel, propsRef.current.progress.epoch);

    const reducedMotion = window.matchMedia(REDUCED_MOTION).matches;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const later = (ms: number, fn: () => void) => {
      const t = setTimeout(() => {
        timers.delete(t);
        fn();
      }, ms);
      timers.add(t);
    };

    let world: World | null = null;
    let art: StatueArt | null = null;
    let startBlocked: string | null = null;
    let raf = 0;
    let disposed = false;
    let shakeUntil = 0;
    let shakeSize = 0;
    const dialogue = createDialogue(propsRef.current.progress.resumeLevel);
    let speechShown: string | null = null;
    let freezeUntil = 0;
    const killPause = () => {
      if (!reducedMotion) freezeUntil = performance.now() + KILL_PAUSE_MS;
    };

    const fit = () => {
      const portrait = needsLandscape(touchDevice);
      rotateRequiredRef.current = portrait;
      setRotateRequired(portrait);
      if (portrait) {
        // Preserve the attempt and require an explicit resume after rotation.
        pausedRef.current = true;
        inputRef.current = { ...NO_INPUT };
        setPaused(true);
        suspendSound();
      }
      const { w, h } = worldSize(touchDevice);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (world) {
        resize(world, w, h, statueBox(touchDevice));
        world.controls = readControls();
      }
    };
    fit();

    const shake = (size: number, ms: number) => {
      if (reducedMotion) return;
      shakeSize = size;
      shakeUntil = performance.now() + ms;
      // Big moments also buzz the phone; small hits would buzz five times a second.
      if (size >= 4) navigator.vibrate?.(Math.min(ms, 200));
    };

    const say = (event: DialogueEvent) => {
      const text = dialogue.line(event, world?.time ?? 0);
      if (!text) return;
      speechShown = text;
      const box = statueBox(touchDevice);
      setSpeech({ text, x: Math.max(132, Math.min(window.innerWidth - 132, box.x + box.w * 0.42)), y: Math.max(8, box.y + box.h * 0.06 - 48) });
    };

    let hintAnnounced = false;
    const announceHint = () => {
      if (hintAnnounced) return;
      hintAnnounced = true;
      const info = levelInfo(propsRef.current.progress.resumeLevel);
      setAnnounce(`${info.name}. ${info.hint}`);
    };

    const learn = (type: string) => {
      const next = nextLessonStep(lessonRef.current, type);
      if (next === lessonRef.current) return;
      lessonRef.current = next;
      setLesson(next);
      if (next < LESSON_DONE) setAnnounce(`${copy.flightSchool.title}. ${lessonTip(next, touchRef.current)}`);
    };

    const handle = (events: GameEvent[]) => {
      const p = propsRef.current;
      for (const e of events) {
        switch (e.type) {
          case "shot":
            playSound("shot");
            break;
          case "rockBroken":
            playSound("rock");
            if (e.size === 0) killPause();
            break;
          case "iconDestroyed":
            playSound("iconBreak");
            killPause();
            p.onIconDestroyed(e.id as DesktopIconId);
            break;
          case "windowHit": {
            playSound("hit");
            const el = document.querySelector(`[data-window-id="${e.id}"]`);
            if (el && !reducedMotion) {
              el.animate(
                [
                  { transform: "translate(0, 0)" },
                  { transform: "translate(-5px, 2px)" },
                  { transform: "translate(4px, -2px)" },
                  { transform: "translate(0, 0)" },
                ],
                { duration: 220 }
              );
              // Nearly dead: the title bar flickers.
              if (e.left <= 4)
                el.querySelector(".win-titlebar")?.animate(
                  [{ opacity: 1 }, { opacity: 0.25 }, { opacity: 1 }, { opacity: 0.25 }, { opacity: 1 }],
                  { duration: 260 }
                );
            }
            break;
          }
          case "windowCrashed": {
            playSound("windowCrash");
            killPause();
            const id = e.id as WindowId;
            const r = document.querySelector(`[data-window-id="${id}"]`)?.getBoundingClientRect();
            const key = performance.now();
            if (r) {
              const crash = { key, name: fileName(id), x: r.left + r.width / 2, y: r.top + r.height / 2 };
              setCrashes((list) => [...list, crash]);
              later(1800, () => setCrashes((list) => list.filter((c) => c.key !== key)));
            }
            p.onWindowCrashed(id);
            setAnnounce(`${fileName(id)} crashed.`);
            break;
          }
          case "statueAwake":
            // Swap the wallpaper for the canvas statue; then a beat of
            // silence (the rules freeze too) before it all breaks loose.
            p.onStatueAwake();
            playSound("rumble");
            shake(9, 2200);
            say("entrance");
            announceHint();
            break;
          case "statueHit":
            if (Math.random() < 0.12) say("hurt");
            playSound("statueHit");
            shake(2, 90);
            break;
          case "bossStage":
            shake(6, 500);
            say(e.stage === 3 ? "finale" : "attack");
            setAnnounce(e.stage === 2 ? "The statue throws faster." : "The statue's eye is charging a laser. Keep moving.");
            break;
          case "lastStand":
            shake(8, 600);
            say("finale");
            playSound("rumble");
            setAnnounce(`Last Stand: ${e.name}. ${e.hint}`);
            break;
          case "statueStunned":
            say("hurt");
            shake(4, 200);
            setAnnounce("The statue is stunned. Attack now.");
            break;
          case "powerWarn":
            say("attack");
            playSound("rumble");
            announceHint();
            break;
          case "throwWarn":
            playSound("throwWarn");
            break;
          case "laserCharge":
            playSound("laserCharge");
            break;
          case "laserFire":
            playSound("laserFire");
            shake(4, 450);
            break;
          case "statueCrumbled":
            playSound("crumble");
            killPause();
            shake(9, 900);
            say("defeat");
            setAnnounce("The statue crumbled.");
            break;
          case "shipLost":
            playSound("shipLost");
            shake(5, 300);
            if (world?.phase === "boss" && e.livesLeft > 0)
              say("taunt");
            setAnnounce(e.livesLeft > 0 ? `Hit. ${e.livesLeft} ${e.livesLeft === 1 ? "life" : "lives"} left.` : "Hit. No lives left.");
            break;
          case "won":
          case "lost": {
            if (!world) break;
            endedRef.current = true;
            const best = loadBest();
            const newBest = world.score > best;
            if (newBest) saveBest(world.score);
            if (e.type === "won") {
              playSound("win");
            }
            const submission = p.progress.epoch && world.score > 0 && rankedAttemptRef.current
              ? finishRankedAttempt(rankedAttemptRef.current, {
                  score: world.score, durationMs: Math.round(world.time * 1000), outcome: e.type,
                })
              : null;
            const guest = p.progress.epoch ? null
              : saveGuestAttempt(p.progress, { score: world.score, durationMs: Math.round(world.time * 1000), outcome: e.type });
            const checkpoint = guest ? guest.progress : submission ? null : p.progress;
            const notice = guest?.notice ?? "";
            setEnding({ kind: e.type, score: world.score, best: Math.max(best, world.score), newBest, submission, checkpoint, notice });
            setAnnounce(
              `${e.type === "won" ? "You won" : "Game over"}. Marble collected: ${world.score.toLocaleString("en")}.`
            );
            break;
          }
        }
        // After the switch's own announcements, so the new tip is the one read out.
        learn(e.type);
      }
    };

    let last = performance.now();
    let acc = 0;
    let nextSync = 0;
    let nextHud = 0;
    const frame = (now: number) => {
      // The end screen covers the canvas: one last frame, then stop drawing.
      if (!endedRef.current) raf = requestAnimationFrame(frame);
      if (!world) return;
      const elapsed = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!pausedRef.current && !rotateRequiredRef.current && !endedRef.current) {
        if (now >= nextSync) {
          nextSync = now + 250;
          setTargets(world, readTargets(propsRef.current.windows));
          world.controls = readControls();
        }
        if (now >= freezeUntil) acc += elapsed;
        const input = inputRef.current;
        // A held arrow key steers even while the touch controls are shown.
        const keySteer = input.left || input.right || input.thrust;
        if (keySteer || (touchRef.current && (input.joystick?.x || input.joystick?.y))) learn("steer");
        while (acc >= DT) {
          acc -= DT;
          handle(step(world, {
            ...input,
            joystick: touchRef.current && !keySteer ? (input.joystick ?? { x: 0, y: 0 }) : undefined,
          }, DT));
        }
      }
      if (speechShown && !dialogue.visible(world.time)) {
        speechShown = null;
        setSpeech(null);
      }
      const shaking = now < shakeUntil;
      const offset = shaking
        ? { x: (Math.random() - 0.5) * 2 * shakeSize, y: (Math.random() - 0.5) * 2 * shakeSize }
        : { x: 0, y: 0 };
      drawWorld(ctx, world, art, offset);

      if (now >= nextHud) {
        nextHud = now + 100;
        const w = world;
        setHud((h) => {
          const next = {
            score: w.score,
            lives: w.lives,
            anger: Math.round(w.anger),
            statue: w.statue.hp / w.statue.maxHp,
            phase: w.phase,
          };
          return h.score === next.score &&
            h.lives === next.lives &&
            h.anger === next.anger &&
            h.statue === next.statue &&
            h.phase === next.phase
            ? h
            : next;
        });
      }
    };

    // The server's elapsed-time check must start before the game's clock.
    // A slow connection may take a few seconds; never count that as play time.
    const box = statueBox(touchDevice);
    const artLoading = loadStatueArt(box);
    const begin = () => void Promise.all([artLoading, rankedAttemptRef.current]).then(([loaded, attempt]) => {
      if (disposed) return;
      // A named player's win could never be saved without a ticket: do not start the clock.
      startBlocked = attemptBlocker(propsRef.current.progress.epoch, attempt);
      setStartError(startBlocked);
      if (startBlocked) return;
      setPreparing(false);
      art = loaded;
      const { w, h } = worldSize(touchDevice);
      const spawn = propsRef.current.spawnAt;
      world = createWorld({
        w,
        h,
        shipAt: { x: Math.min(w - 20, spawn?.x ?? w / 2), y: Math.min(h - 20, spawn?.y ?? h / 2) },
        statue: createStatue(statueBox(touchDevice), COLS, ROWS, tileCover(loaded)),
        random: Math.random,
        particleScale: reducedMotion ? 0.35 : 1,
        touch: touchRef.current,
        phoneMode: isPhoneTouchDevice(touchDevice),
        level: propsRef.current.progress.resumeLevel,
        upgrades: attempt?.ticket?.upgrades ?? propsRef.current.progress.resources.upgrades,
      });
      setTargets(world, readTargets(propsRef.current.windows));
      last = performance.now();
      raf = requestAnimationFrame(frame);
    });
    // Retry asks the server for a fresh ticket; the failed one is never reused.
    retryStartRef.current = () => {
      if (!startBlocked) return; // already retrying
      startBlocked = null;
      setStartError(null);
      rankedAttemptRef.current = beginRankedAttempt(propsRef.current.progress.resumeLevel, propsRef.current.progress.epoch);
      begin();
    };
    begin();

    const pause = (value: boolean) => {
      if (endedRef.current) return;
      if (!value && rotateRequiredRef.current) return;
      pausedRef.current = value;
      inputRef.current = { ...NO_INPUT };
      setPaused(value);
      if (value) suspendSound();
      else {
        unlockSound();
        canvas.focus();
      }
    };

    // Listens in the capture phase and stops game keys there, so a focused
    // desktop icon or button never also reacts to Space or Enter.
    const onKeyDown = (e: KeyboardEvent) => {
      // The start-error buttons need normal Tab, Enter and Space.
      if (endedRef.current || startBlocked) return;
      if (e.key === "Escape" || e.key === "p" || e.key === "P") {
        if (e.repeat) return;
        e.preventDefault();
        e.stopPropagation();
        pause(!pausedRef.current);
        return;
      }
      // Let focused menu buttons handle Space/Enter normally while paused.
      if (pausedRef.current || rotateRequiredRef.current) return;
      if (e.key === "Tab" || e.key === "Enter") {
        // Playing: focus stays on the canvas, nothing behind it can be pressed.
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      const control = KEYS[e.key];
      if (!control) return;
      e.preventDefault();
      e.stopPropagation();
      unlockSound();
      inputRef.current = { ...inputRef.current, [control]: true };
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const control = KEYS[e.key];
      if (control) inputRef.current = { ...inputRef.current, [control]: false };
    };
    const onPointerDown = (e: PointerEvent) => {
      unlockSound();
      // pointerType, not (pointer: coarse): touch laptops and monitors have a fine primary pointer.
      if (touchRef.current || e.pointerType !== "touch") return;
      inputRef.current = { ...NO_INPUT };
      touchRef.current = true;
      setTouch(true);
      if (world) world.touch = true;
    };
    const onBlur = () => pause(true);
    const onVisibility = () => {
      if (document.hidden) pause(true);
    };
    const onFullscreenChange = () => {
      fit();
      if (touchDevice && !document.fullscreenElement) pause(true);
    };
    const preventSelection = (e: Event) => {
      // The name box and the share copy box must stay selectable.
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      e.preventDefault();
    };
    // iOS pinch-zoom while playing would move the whole game.
    const preventGesture = (e: Event) => e.preventDefault();
    window.getSelection()?.removeAllRanges();

    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("blur", onBlur);
    window.addEventListener("resize", fit);
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("selectstart", preventSelection);
    document.addEventListener("gesturestart", preventGesture);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      for (const t of timers) clearTimeout(t);
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("resize", fit);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("selectstart", preventSelection);
      document.removeEventListener("gesturestart", preventGesture);
    };
  }, []);

  const press = (control: Control, down: boolean) => {
    if (pausedRef.current || rotateRequiredRef.current || endedRef.current) return;
    inputRef.current = { ...inputRef.current, [control]: down };
  };

  const resume = () => {
    if (rotateRequiredRef.current) return;
    enterGameFullscreen();
    unlockSound();
    pausedRef.current = false;
    setPaused(false);
    canvasRef.current?.focus();
  };

  const steer = (joystick: StickVector) => {
    if (pausedRef.current || rotateRequiredRef.current || endedRef.current) return;
    inputRef.current = { ...inputRef.current, joystick };
  };

  const skipLesson = () => {
    lessonRef.current = LESSON_DONE;
    setLesson(LESSON_DONE);
    canvasRef.current?.focus();
  };

  const showPause = () => {
    inputRef.current = { ...NO_INPUT };
    pausedRef.current = true;
    setPaused(true);
    suspendSound();
  };

  const statueAwake = hud.phase !== "play";
  const meter = statueAwake ? hud.statue : hud.anger / 100;

  return (
    <div className="olympus">
      <canvas
        ref={canvasRef}
        className="olympus-canvas"
        style={{ height: touchDevice ? "100%" : `calc(100% - ${TASKBAR_HEIGHT}px)` }}
        onPointerDown={(e) => { if (e.pointerType === "touch") e.preventDefault(); }}
        tabIndex={paused || ending ? -1 : 0}
        role="application"
        aria-label="Olympus. Left and right arrows turn, up arrow thrusts, Space fires, P or Escape opens the pause menu."
      />

      {preparing && !startError && <p className="olympus-loading" role="status">Preparing your level...</p>}

      {startError && (
        <div className="olympus-paused" role="alertdialog" aria-modal="true" aria-label="Level not started" onKeyDown={trapMenuFocus}>
          <div className="olympus-pause-menu">
            <h2>NOT CONNECTED</h2>
            <p>Level {props.progress.resumeLevel} waits until your save is connected, so this attempt’s marble and progress can be saved.</p>
            <p role="status">{startError}</p>
            <div className="olympus-actions">
              <button type="button" className="olympus-button olympus-button-primary" autoFocus onClick={() => retryStartRef.current?.()}>Retry</button>
              <button type="button" className="olympus-button" onClick={() => props.onEnd(false)}>Back to desktop</button>
            </div>
          </div>
        </div>
      )}

      {statueAwake && <div className="olympus-dark" aria-hidden="true" />}

      {/* HUD, level name and Pause share one column, so they can never overlap. */}
      <div className="olympus-corner">
        <div className="olympus-hud bevel-out" aria-hidden="true">
          <div className="player-lcd">
            <div className="flex justify-between gap-4">
              <span>MARBLE {String(hud.score).padStart(6, "0")}</span>
              <span>LEVEL {props.progress.resumeLevel}</span>
              <span className="flex items-center gap-1">
                {Array.from({ length: Math.max(0, hud.lives) }, (_, i) => (
                  <CursorGlyph key={i} />
                ))}
              </span>
            </div>
            <div className="olympus-hud-meter mt-1 flex items-center gap-2">
              <span className="w-16 shrink-0">{statueAwake ? "STATUE" : "ANGER"}</span>
              <span className="olympus-meter">
                <span
                  className={statueAwake ? "olympus-meter-hp" : "olympus-meter-anger"}
                  style={{ width: `${Math.round(meter * 100)}%` }}
                />
              </span>
            </div>
          </div>
        </div>

        <div className="olympus-corner-row">
          <div className="olympus-power-label" aria-hidden="true">{levelInfo(props.progress.resumeLevel).name}</div>
          {!paused && !rotateRequired && !ending && !startError && (
            <button type="button" className="olympus-button olympus-pause-trigger" onClick={showPause} aria-label="Pause game">Ⅱ Pause</button>
          )}
        </div>
      </div>

      {crashes.map((c) => (
        <div
          key={c.key}
          className="olympus-crash win-window bevel-out"
          style={{ left: c.x, top: c.y }}
          aria-hidden="true"
        >
          <div className="win-titlebar">
            <span className="title">{c.name}</span>
          </div>
          <div className="flex items-start gap-3 p-3 font-content text-xs leading-snug">
            <ErrorGlyph />
            <p>{copy.crash.replace("{name}", c.name.toUpperCase())}</p>
          </div>
        </div>
      ))}

      {speech && (
        <div className="olympus-speech tray-tip" style={{ left: speech.x, top: speech.y }} aria-hidden="true">
          {speech.text}
        </div>
      )}

      {/* Touch: top left, clear of the joystick, FIRE and the HUD. The status line reads each tip. */}
      {lesson < LESSON_DONE && !preparing && !paused && !rotateRequired && !ending && !startError && (
        <div className={`olympus-hint tray-tip${touch ? " olympus-hint-top" : ""}`} style={touch ? undefined : { bottom: TASKBAR_HEIGHT + 12 }}>
          <span aria-hidden="true">
            <b>{copy.flightSchool.title} {lesson + 1}/{LESSON_DONE}</b> · {lessonTip(lesson, touch)}
          </span>
          <button type="button" className="olympus-hint-skip" onClick={skipLesson} aria-label={`${copy.flightSchool.skip} ${copy.flightSchool.title}`}>
            {copy.flightSchool.skip}
          </button>
        </div>
      )}

      {rotateRequired && !ending && (
        <div className="olympus-rotate">
          <div role="status">
            <span className="olympus-rotate-icon" aria-hidden="true">↻</span>
            <h2>Rotate to play Olympus</h2>
            <p>Turn your phone or tablet sideways to landscape.</p>
            <p>Your game is paused while you rotate.</p>
          </div>
          <button type="button" className="olympus-button" onClick={() => props.onEnd(false)}>
            Back to desktop
          </button>
        </div>
      )}

      {paused && !rotateRequired && !ending && !startError && (
        <div className="olympus-paused" role="dialog" aria-modal="true" aria-label="Game paused" onKeyDown={trapMenuFocus}>
          <div className="olympus-pause-menu">
            <p className="olympus-menu-hint">LEVEL {props.progress.resumeLevel} · MARBLE {String(hud.score).padStart(6, "0")}</p>
            <h2>PAUSED</h2>
            <p>{levelInfo(props.progress.resumeLevel).name}</p>
            <p className="olympus-mission-brief">{missionInfo(props.progress.resumeLevel).briefing}</p>
            <p className="olympus-menu-hint">{levelInfo(props.progress.resumeLevel).hint}</p>
            <p>Your level is on hold.</p>
            <div className="olympus-actions">
              <button type="button" className="olympus-button olympus-button-primary" autoFocus onClick={resume}>Resume</button>
              <button type="button" className="olympus-button" onClick={() => props.onEnd(false)}>Exit to desktop</button>
            </div>
            <FullscreenHelp duringGame />
          </div>
        </div>
      )}

      {touch && !paused && !rotateRequired && !ending && !startError && <TouchPad onPress={press} onMove={steer} />}

      {ending && (
        <EndScreen
          ending={ending}
          level={props.progress.resumeLevel}
          onReplay={(progress) => props.onEnd(true, progress)}
          onExit={() => props.onEnd(false)}
        />
      )}

      <p role="status" className="sr-only">
        {announce}
      </p>
    </div>
  );
}

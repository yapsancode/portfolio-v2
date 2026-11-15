"use client";

import { useEffect, useRef, useState } from "react";
import { site, windowDefaults } from "@/config/site";
import type { DesktopIconId, WindowId } from "@/config/site";
import { TASKBAR_HEIGHT } from "@/components/desktop/Taskbar";
import { drawWorld, type StatueArt } from "./draw";
import { useMusic } from "@/components/desktop/music";
import { BEST_RUN_KEY, loadBest, saveBest } from "./GameContext";
import { playSound, setSoundVolume, unlockSound } from "./sound";
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
/** Height of the strip the touch buttons use; the ship stays above it. */
const TOUCH_STRIP = 100;
/** Game time skipped on a kill, so it lands with a small "thud". */
const KILL_PAUSE_MS = 45;

export type OlympusGameProps = {
  /** Where the pointer was when Start was pressed: the ship appears there. */
  spawnAt: { x: number; y: number } | null;
  /** Phone layout: start with the on-screen buttons. (Any touch screen gets them too.) */
  touch: boolean;
  /** Open windows, so the game knows which one is on top. */
  windows: { id: WindowId; zIndex: number; minimized: boolean }[];
  onIconDestroyed: (id: DesktopIconId) => void;
  onWindowCrashed: (id: WindowId) => void;
  onStatueAwake: () => void;
  /** 1 on a fresh game. Each win in a row raises it, and the fight gets harder. */
  level: number;
  /** Put the desktop back; `replay` starts a fresh game straight away (a harder one after a win). */
  onEnd: (replay: boolean, won: boolean) => void;
};

type Hud = { score: number; lives: number; anger: number; statue: number; phase: Phase };
type Ending = { kind: "won" | "lost"; score: number; best: number; newBest: boolean };
type Crash = { key: number; name: string; x: number; y: number };
type Control = keyof Input;

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

/* ------------------------------------------------------------------ */
/* Reading the desktop                                                 */
/* ------------------------------------------------------------------ */

function worldSize() {
  return { w: window.innerWidth, h: Math.max(100, window.innerHeight - TASKBAR_HEIGHT) };
}

function statueBox(): Rect {
  const el = document.querySelector<HTMLElement>("[data-statue]");
  const r = el?.getBoundingClientRect();
  if (r && r.width > 0) return { x: r.left, y: r.top, w: r.width, h: r.height };
  const { w, h } = worldSize();
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

/**
 * Any touch screen, not only the main pointer. Tablets with a stylus or a
 * keyboard cover (and touch laptops) report a "fine" pointer like a mouse,
 * so the phone layout misses them.
 */
function hasTouchScreen() {
  return navigator.maxTouchPoints > 0 || window.matchMedia("(any-pointer: coarse)").matches;
}

function needsLandscape() {
  return hasTouchScreen() && window.matchMedia("(max-width: 767px) and (orientation: portrait)").matches;
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
 * black "safe to turn off" screen. Enter plays again, any other key leaves.
 */
function EndScreen({
  ending,
  level,
  touch,
  onReplay,
  onExit,
}: {
  ending: Ending;
  level: number;
  touch: boolean;
  onReplay: () => void;
  onExit: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const actions = useRef({ onReplay, onExit });
  const won = ending.kind === "won";

  useEffect(() => {
    actions.current = { onReplay, onExit };
  });

  useEffect(() => {
    ref.current?.focus();
    const shownAt = performance.now();
    const onKeyDown = (e: KeyboardEvent) => {
      // Ignore keys still held from playing.
      if (e.repeat || performance.now() - shownAt < 600) return;
      if (["Shift", "Control", "Alt", "Meta", "Tab"].includes(e.key)) return;
      e.preventDefault();
      if (e.key === "Enter") actions.current.onReplay();
      else actions.current.onExit();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const again = won ? `to play run ${level + 1} (harder)` : "to play again";
  return (
    <div
      ref={ref}
      className={won ? "bsod bsod-win" : "bsod"}
      role="alertdialog"
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
        <p>
          Score: {ending.score.toLocaleString("en")} &nbsp;{" "}
          {ending.newBest ? "New best!" : `Best: ${ending.best.toLocaleString("en")}`}
          {level > 1 && <> &nbsp; Run {level}</>}
        </p>
        <button type="button" className="bsod-option" onClick={onReplay}>
          {touch ? `* Tap here ${again}.` : `* Press Enter or click here ${again}.`}
        </button>
        <button type="button" className="bsod-option" onClick={onExit}>
          {touch ? "* Tap here to return to the desktop." : "* Press any other key to return to the desktop."}{" "}
          <span className="terminal-cursor" />
        </button>
      </div>
    </div>
  );
}

function TouchPad({
  onPress,
  onQuit,
}: {
  onPress: (control: Control, down: boolean) => void;
  onQuit: () => void;
}) {
  const button = (control: Control, label: string, name: string, extra = "") => (
    <button
      type="button"
      aria-label={name}
      className={`olympus-touch-btn bevel-out ${extra}`}
      onPointerDown={(e) => {
        try {
          // Keep receiving this finger's "up" even if it slides off the button.
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // No live pointer (synthetic event): the press still counts.
        }
        onPress(control, true);
      }}
      onPointerUp={() => onPress(control, false)}
      onPointerCancel={() => onPress(control, false)}
      onLostPointerCapture={() => onPress(control, false)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {label}
    </button>
  );
  return (
    <>
      {/* A touch screen has no Esc key. */}
      <button type="button" className="olympus-touch-quit bevel-out" aria-label="Quit the game" onClick={onQuit}>
        ✕
      </button>
      <div className="olympus-touch" style={{ bottom: TASKBAR_HEIGHT + 8 }}>
        <div className="flex gap-2">
          {button("left", "◄", "Turn left")}
          {button("right", "►", "Turn right")}
          {button("thrust", "▲", "Thrust")}
        </div>
        {button("fire", "FIRE", "Fire", "olympus-touch-fire")}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* The game                                                            */
/* ------------------------------------------------------------------ */

export default function OlympusGame(props: OlympusGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef(props);
  const inputRef = useRef<Input>({ ...NO_INPUT });
  const pausedRef = useRef(false);
  const [rotateRequired, setRotateRequired] = useState(needsLandscape);
  const rotateRequiredRef = useRef(rotateRequired);
  const endedRef = useRef(false);
  // On-screen buttons follow the last input used: a touch shows them, a game key hides them.
  const [touch, setTouch] = useState(() => props.touch || hasTouchScreen());
  const touchRef = useRef(touch);

  const [hud, setHud] = useState<Hud>({ score: 0, lives: TUNING.lives, anger: 0, statue: 1, phase: "play" });
  const [paused, setPaused] = useState(false);
  const [ending, setEnding] = useState<Ending | null>(null);
  const [crashes, setCrashes] = useState<Crash[]>([]);
  const [speech, setSpeech] = useState<{ text: string; x: number; y: number } | null>(null);
  const [hint, setHint] = useState(true);
  const [announce, setAnnounce] = useState("Olympus started.");
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
    let raf = 0;
    let disposed = false;
    let shakeUntil = 0;
    let shakeSize = 0;
    let taunts = 0;
    let freezeUntil = 0;
    const killPause = () => {
      if (!reducedMotion) freezeUntil = performance.now() + KILL_PAUSE_MS;
    };

    const fit = () => {
      const portrait = needsLandscape();
      rotateRequiredRef.current = portrait;
      setRotateRequired(portrait);
      if (portrait) {
        // Preserve the run and require an explicit resume after rotation.
        pausedRef.current = true;
        inputRef.current = { ...NO_INPUT };
        setPaused(true);
      }
      const { w, h } = worldSize();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (world) resize(world, w, h, statueBox());
    };
    fit();

    const shake = (size: number, ms: number) => {
      if (reducedMotion) return;
      shakeSize = size;
      shakeUntil = performance.now() + ms;
    };

    const say = (text: string) => {
      const box = statueBox();
      setSpeech({ text, x: box.x + box.w * 0.42, y: Math.max(8, box.y + box.h * 0.06 - 48) });
      later(3500, () => setSpeech((s) => (s?.text === text ? null : s)));
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
            later(TUNING.awakenFreeze * 1000, () => {
              playSound("rumble");
              shake(9, 2200);
              say(copy.statue.wakes);
            });
            setAnnounce("The statue woke up. Shoot it to break it.");
            break;
          case "statueHit":
            playSound("statueHit");
            shake(2, 90);
            break;
          case "bossStage":
            shake(6, 500);
            say(e.stage === 2 ? copy.statue.stage2 : copy.statue.stage3);
            setAnnounce(e.stage === 2 ? "The statue throws faster." : "The statue's eye is charging a laser. Keep moving.");
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
            say(copy.statue.falls);
            setAnnounce("The statue crumbled.");
            break;
          case "shipLost":
            playSound("shipLost");
            shake(5, 300);
            if (world?.phase === "boss" && e.livesLeft > 0)
              say(copy.statue.taunts[taunts++ % copy.statue.taunts.length]);
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
              if (propsRef.current.level > loadBest(BEST_RUN_KEY)) saveBest(propsRef.current.level, BEST_RUN_KEY);
            }
            setEnding({ kind: e.type, score: world.score, best: Math.max(best, world.score), newBest });
            setAnnounce(
              `${e.type === "won" ? "You won" : "Game over"}. Score ${world.score.toLocaleString("en")}.`
            );
            break;
          }
        }
      }
    };

    let last = performance.now();
    let acc = 0;
    let nextSync = 0;
    let nextHud = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!world) return;
      const elapsed = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!pausedRef.current && !rotateRequiredRef.current && !endedRef.current) {
        if (now >= nextSync) {
          nextSync = now + 250;
          setTargets(world, readTargets(propsRef.current.windows));
          world.shipFloor = touchRef.current ? TOUCH_STRIP : 0;
        }
        if (now >= freezeUntil) acc += elapsed;
        while (acc >= DT) {
          acc -= DT;
          handle(step(world, inputRef.current, DT));
        }
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

    // Load the statue picture, then start.
    const box = statueBox();
    void loadStatueArt(box).then((loaded) => {
      if (disposed) return;
      art = loaded;
      const { w, h } = worldSize();
      const spawn = propsRef.current.spawnAt;
      world = createWorld({
        w,
        h,
        shipAt: spawn ? { x: Math.min(w - 20, spawn.x), y: Math.min(h - 20, spawn.y) } : undefined,
        statue: createStatue(box, COLS, ROWS, tileCover(loaded)),
        random: Math.random,
        particleScale: reducedMotion ? 0.35 : 1,
        shipFloor: touchRef.current ? TOUCH_STRIP : 0,
        run: propsRef.current.level,
      });
      setTargets(world, readTargets(propsRef.current.windows));
      last = performance.now();
      raf = requestAnimationFrame(frame);
    });

    const pause = (value: boolean) => {
      if (endedRef.current) return;
      if (!value && rotateRequiredRef.current) return;
      pausedRef.current = value;
      inputRef.current = { ...NO_INPUT };
      setPaused(value);
    };

    // Listens in the capture phase and stops game keys there, so a focused
    // desktop icon or button never also reacts to Space or Enter.
    const onKeyDown = (e: KeyboardEvent) => {
      if (endedRef.current) return;
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        propsRef.current.onEnd(false, false);
        return;
      }
      if (e.key === "p" || e.key === "P") {
        e.stopPropagation();
        pause(!pausedRef.current);
        return;
      }
      const control = KEYS[e.key];
      if (!control) return;
      e.preventDefault();
      e.stopPropagation();
      unlockSound();
      setHint(false);
      if (touchRef.current) {
        // Hiding the buttons drops any press they still hold.
        touchRef.current = false;
        setTouch(false);
        inputRef.current = { ...NO_INPUT };
      }
      if (pausedRef.current || rotateRequiredRef.current) return;
      inputRef.current = { ...inputRef.current, [control]: true };
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const control = KEYS[e.key];
      if (control) inputRef.current = { ...inputRef.current, [control]: false };
    };
    const onPointerDown = (e: PointerEvent) => {
      unlockSound();
      if (touchRef.current || (e.pointerType !== "touch" && e.pointerType !== "pen")) return;
      touchRef.current = true;
      setTouch(true);
    };
    const onBlur = () => pause(true);
    const onVisibility = () => {
      if (document.hidden) pause(true);
    };

    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("blur", onBlur);
    window.addEventListener("resize", fit);
    document.addEventListener("visibilitychange", onVisibility);

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
    };
  }, []);

  const press = (control: Control, down: boolean) => {
    if (pausedRef.current || rotateRequiredRef.current || endedRef.current) return;
    inputRef.current = { ...inputRef.current, [control]: down };
  };

  const resume = () => {
    if (rotateRequiredRef.current) return;
    pausedRef.current = false;
    setPaused(false);
    canvasRef.current?.focus();
  };

  const statueAwake = hud.phase !== "play";
  const meter = statueAwake ? hud.statue : hud.anger / 100;

  return (
    <div className="olympus">
      <canvas
        ref={canvasRef}
        className="olympus-canvas"
        style={{ height: `calc(100% - ${TASKBAR_HEIGHT}px)` }}
        tabIndex={0}
        role="application"
        aria-label="Olympus. Left and right arrows turn, up arrow thrusts, Space fires, P pauses, Escape quits."
      />

      {statueAwake && <div className="olympus-dark" aria-hidden="true" />}

      <div className="olympus-hud bevel-out" aria-hidden="true">
        <div className="player-lcd">
          <div className="flex justify-between gap-4">
            <span>SCORE {String(hud.score).padStart(6, "0")}</span>
            {props.level > 1 && <span>RUN {props.level}</span>}
            <span className="flex items-center gap-1">
              {Array.from({ length: Math.max(0, hud.lives) }, (_, i) => (
                <CursorGlyph key={i} />
              ))}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
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

      {hint && !touch && !ending && (
        <div className="olympus-hint tray-tip" style={{ bottom: TASKBAR_HEIGHT + 12 }} aria-hidden="true">
          {copy.hint}
        </div>
      )}

      {rotateRequired && !ending && (
        <div className="olympus-rotate">
          <div role="status">
            <span className="olympus-rotate-icon" aria-hidden="true">↻</span>
            <h2>Rotate to play Olympus</h2>
            <p>Turn your phone sideways to landscape.</p>
            <p>Your game is paused while you rotate.</p>
          </div>
          <button type="button" className="bevel-out px-4 py-2" onClick={() => props.onEnd(false, false)}>
            Back to desktop
          </button>
        </div>
      )}

      {paused && !rotateRequired && !ending && (
        <button type="button" className="olympus-paused" onClick={resume}>
          <span className="win-window bevel-out px-6 py-3 font-pixel text-2xl leading-none">
            {touch ? "Paused — tap to continue" : "Paused — press P or click to continue"}
          </span>
        </button>
      )}

      {touch && !rotateRequired && !ending && <TouchPad onPress={press} onQuit={() => props.onEnd(false, false)} />}

      {ending && (
        <EndScreen
          ending={ending}
          level={props.level}
          touch={touch}
          onReplay={() => props.onEnd(true, ending.kind === "won")}
          onExit={() => props.onEnd(false, ending.kind === "won")}
        />
      )}

      <p role="status" className="sr-only">
        {announce}
      </p>
    </div>
  );
}

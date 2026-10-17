"use client";

import { useEffect, useRef, useState } from "react";
import { site, windowDefaults } from "@/config/site";
import type { DesktopIconId, WindowId } from "@/config/site";
import PixelIcon from "@/components/desktop/PixelIcon";
import { TASKBAR_HEIGHT } from "@/components/desktop/Taskbar";
import { drawWorld, type StatueArt } from "./draw";
import { loadBest, saveBest } from "./GameContext";
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

export type OlympusGameProps = {
  /** Where the pointer was when Start was pressed: the ship appears there. */
  spawnAt: { x: number; y: number } | null;
  /** Show on-screen buttons (phones, tablets). */
  touch: boolean;
  /** Open windows, so the game knows which one is on top. */
  windows: { id: WindowId; zIndex: number; minimized: boolean }[];
  onIconDestroyed: (id: DesktopIconId) => void;
  onWindowCrashed: (id: WindowId) => void;
  onStatueAwake: () => void;
  /** Put the desktop back; `replay` starts a fresh game straight away. */
  onEnd: (replay: boolean) => void;
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

/** Which tiles of the picture actually contain statue (not empty background). */
function solidTiles(art: StatueArt | null): boolean[] {
  const solid: boolean[] = [];
  const k = 6;
  const canvas = document.createElement("canvas");
  canvas.width = COLS * k;
  canvas.height = ROWS * k;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!art || !ctx) {
    // No picture: a rough statue shape, so the game still works.
    for (let row = 0; row < ROWS; row++)
      for (let col = 0; col < COLS; col++)
        solid.push(row > 2 && Math.abs((col + 0.5) / COLS - 0.5) < 0.12 + row / ROWS / 3);
    return solid;
  }
  ctx.drawImage(art.image, art.sx, art.sy, art.sw, art.sh, 0, 0, canvas.width, canvas.height);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      let alpha = 0;
      for (let y = 0; y < k; y++)
        for (let x = 0; x < k; x++) alpha += data[((row * k + y) * canvas.width + col * k + x) * 4 + 3];
      solid.push(alpha / (k * k) > 90);
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

const dialogButton =
  "bevel-out min-w-20 bg-win-face px-4 py-1 font-pixel text-base leading-none focus-visible:outline-1 focus-visible:-outline-offset-4 focus-visible:outline-dotted focus-visible:outline-black active:translate-x-px active:translate-y-px";

function BlueScreen({
  score,
  best,
  onReplay,
  onExit,
}: {
  score: number;
  best: number;
  onReplay: () => void;
  onExit: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const actions = useRef({ onReplay, onExit });

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

  return (
    <div ref={ref} className="bsod" role="alertdialog" aria-label="Game over" tabIndex={-1}>
      <div className="bsod-inner">
        <p className="bsod-title">
          <span>Olympus</span>
        </p>
        {copy.bsod.map((line) => (
          <p key={line}>{line}</p>
        ))}
        <p>
          Score: {score.toLocaleString("en")} &nbsp; Best: {best.toLocaleString("en")}
        </p>
        <button type="button" className="bsod-option" onClick={onReplay}>
          * Press Enter or click here to play again.
        </button>
        <button type="button" className="bsod-option" onClick={onExit}>
          * Press any other key to return to the desktop. <span className="terminal-cursor" />
        </button>
      </div>
    </div>
  );
}

function WinDialog({
  ending,
  onReplay,
  onExit,
}: {
  ending: Ending;
  onReplay: () => void;
  onExit: () => void;
}) {
  return (
    <div className="olympus-dialog-layer">
      <div
        className="win-window bevel-out w-[min(360px,calc(100vw-24px))]"
        role="alertdialog"
        aria-labelledby="olympus-win-title"
      >
        <div className="win-titlebar">
          <PixelIcon name="olympus" className="shrink-0" />
          <span className="title" id="olympus-win-title">
            olympus.exe
          </span>
        </div>
        <div className="flex gap-3 p-4 font-content text-sm leading-snug">
          <PixelIcon name="olympus" size={32} className="shrink-0" />
          <div>
            {copy.win.map((line) => (
              <p key={line} className="mb-1">
                {line}
              </p>
            ))}
            <p className="mt-2 font-bold">
              Score {ending.score.toLocaleString("en")}
              {ending.newBest ? " — new best!" : ` (best ${ending.best.toLocaleString("en")})`}
            </p>
          </div>
        </div>
        <div className="flex justify-center gap-2 pb-3">
          <button type="button" className={dialogButton} onClick={onReplay}>
            Play again
          </button>
          <button type="button" className={dialogButton} onClick={onExit} autoFocus>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

function TouchPad({ onPress }: { onPress: (control: Control, down: boolean) => void }) {
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
    <div className="olympus-touch" style={{ bottom: TASKBAR_HEIGHT + 8 }}>
      <div className="flex gap-2">
        {button("left", "◄", "Turn left")}
        {button("right", "►", "Turn right")}
        {button("thrust", "▲", "Thrust")}
      </div>
      {button("fire", "FIRE", "Fire", "olympus-touch-fire")}
    </div>
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
  const endedRef = useRef(false);

  const [hud, setHud] = useState<Hud>({ score: 0, lives: TUNING.lives, anger: 0, statue: 1, phase: "play" });
  const [paused, setPaused] = useState(false);
  const [ending, setEnding] = useState<Ending | null>(null);
  const [crashes, setCrashes] = useState<Crash[]>([]);
  const [speech, setSpeech] = useState<{ text: string; x: number; y: number } | null>(null);
  const [hint, setHint] = useState(true);
  const [announce, setAnnounce] = useState("Olympus started.");

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
    let saidHurt = false;

    const fit = () => {
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
          case "iconDestroyed":
            p.onIconDestroyed(e.id as DesktopIconId);
            break;
          case "windowHit": {
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
            }
            break;
          }
          case "windowCrashed": {
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
            p.onStatueAwake();
            shake(7, 1400);
            say(copy.statue.wakes);
            setAnnounce("The statue woke up. Shoot it to break it.");
            break;
          case "statueHit":
            shake(2, 90);
            if (!saidHurt && world && world.statue.hp <= world.statue.maxHp / 2) {
              saidHurt = true;
              say(copy.statue.hurt);
            }
            break;
          case "statueCrumbled":
            shake(9, 900);
            say(copy.statue.falls);
            setAnnounce("The statue crumbled.");
            break;
          case "shipLost":
            shake(5, 300);
            setAnnounce(e.livesLeft > 0 ? `Hit. ${e.livesLeft} ${e.livesLeft === 1 ? "life" : "lives"} left.` : "Hit. No lives left.");
            break;
          case "won":
          case "lost": {
            if (!world) break;
            endedRef.current = true;
            const best = loadBest();
            const newBest = world.score > best;
            if (newBest) saveBest(world.score);
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
      if (!pausedRef.current && !endedRef.current) {
        if (now >= nextSync) {
          nextSync = now + 250;
          setTargets(world, readTargets(propsRef.current.windows));
        }
        acc += elapsed;
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
        statue: createStatue(box, COLS, ROWS, solidTiles(loaded)),
        random: Math.random,
        particleScale: reducedMotion ? 0.35 : 1,
      });
      setTargets(world, readTargets(propsRef.current.windows));
      last = performance.now();
      raf = requestAnimationFrame(frame);
    });
    later(4500, () => setHint(false));

    const pause = (value: boolean) => {
      if (endedRef.current) return;
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
        propsRef.current.onEnd(false);
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
      if (pausedRef.current) return;
      inputRef.current = { ...inputRef.current, [control]: true };
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const control = KEYS[e.key];
      if (control) inputRef.current = { ...inputRef.current, [control]: false };
    };
    const onBlur = () => pause(true);
    const onVisibility = () => {
      if (document.hidden) pause(true);
    };

    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    window.addEventListener("resize", fit);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      for (const t of timers) clearTimeout(t);
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("resize", fit);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const press = (control: Control, down: boolean) => {
    if (pausedRef.current || endedRef.current) return;
    inputRef.current = { ...inputRef.current, [control]: down };
  };

  const resume = () => {
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

      <div className="olympus-hud bevel-out" aria-hidden="true">
        <div className="player-lcd">
          <div className="flex justify-between gap-4">
            <span>SCORE {String(hud.score).padStart(6, "0")}</span>
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

      {hint && !props.touch && !ending && (
        <div className="olympus-hint tray-tip" style={{ bottom: TASKBAR_HEIGHT + 12 }} aria-hidden="true">
          {copy.hint}
        </div>
      )}

      {paused && !ending && (
        <button type="button" className="olympus-paused" onClick={resume}>
          <span className="win-window bevel-out px-6 py-3 font-pixel text-2xl leading-none">
            Paused — press P or click to continue
          </span>
        </button>
      )}

      {props.touch && !ending && <TouchPad onPress={press} />}

      {ending?.kind === "won" && (
        <WinDialog ending={ending} onReplay={() => props.onEnd(true)} onExit={() => props.onEnd(false)} />
      )}
      {ending?.kind === "lost" && (
        <BlueScreen
          score={ending.score}
          best={ending.best}
          onReplay={() => props.onEnd(true)}
          onExit={() => props.onEnd(false)}
        />
      )}

      <p role="status" className="sr-only">
        {announce}
      </p>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";

/**
 * Centered hero character that:
 *  - follows the mouse and reacts with its face,
 *  - greets with a "hola" bubble on first load,
 *  - and, when the cursor goes idle, cycles through a small set of idle
 *    behaviors (wave / read / code / music) — one at a time, with pauses in
 *    between, never the same one twice in a row. Any pointer movement cancels
 *    the behavior immediately and returns to follow mode.
 *
 * The SVG is inlined so the eyes/mouth/arms/props can be rigged. All motion runs
 * in one requestAnimationFrame loop mutating DOM refs — no React state in the
 * loop. Follow + behaviors are gated behind (pointer:fine) and reduced-motion;
 * the greeting bubble shows for everyone.
 */

const MOUTH = {
  calm: "M129 113 q11 7 22 0",
  smile: "M125 111 q15 13 30 0",
  surprised: "M134 110 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0",
};

const IDLE_MS = 2400; // cursor-still time before idle behaviors begin

const BEHAVIORS = ["wave", "read", "code", "music"] as const;
type Behavior = (typeof BEHAVIORS)[number];
const DURATION: Record<Behavior, number> = { wave: 2.8, read: 4.6, code: 4.6, music: 4.2 };

export default function HeroAvatar() {
  const figure = useRef<HTMLDivElement>(null);
  const head = useRef<SVGGElement>(null);
  const leftEye = useRef<SVGGElement>(null);
  const rightEye = useRef<SVGGElement>(null);
  const leftPupil = useRef<SVGCircleElement>(null);
  const rightPupil = useRef<SVGCircleElement>(null);
  const mouth = useRef<SVGPathElement>(null);
  const pocketHandL = useRef<SVGEllipseElement>(null);
  const pocketHandR = useRef<SVGEllipseElement>(null);
  const waveArm = useRef<SVGGElement>(null);
  const bookArt = useRef<SVGGElement>(null);
  const laptopArt = useRef<SVGGElement>(null);
  const codeHands = useRef<SVGGElement>(null);
  const musicArt = useRef<SVGGElement>(null);

  // "hola" greeting bubble lifecycle (runs for all users, no motion required).
  const [bubbleMounted, setBubbleMounted] = useState(true);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setBubbleVisible(true), 350);
    const t2 = setTimeout(() => setBubbleVisible(false), 3600);
    const t3 = setTimeout(() => setBubbleMounted(false), 4100);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduce) return;

    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    let lastMove = performance.now();
    let mx = 0;
    let my = 0;
    const measure = () => {
      mx = Math.min(window.innerWidth * 0.26, 300);
      my = Math.min(window.innerHeight * 0.12, 120);
    };
    measure();

    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
      lastMove = performance.now();
    };
    const recenter = () => {
      target.x = 0;
      target.y = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", recenter);
    window.addEventListener("blur", recenter);
    window.addEventListener("resize", measure);

    // ----- idle behavior controller -----
    const props = [waveArm, bookArt, laptopArt, musicArt];
    const setDisplay = (r: typeof waveArm, v: string) => {
      if (r.current) r.current.style.display = v;
    };
    const showHands = (show: boolean) => {
      if (pocketHandL.current) pocketHandL.current.style.display = show ? "" : "none";
      if (pocketHandR.current) pocketHandR.current.style.display = show ? "" : "none";
    };
    const clearProps = () => props.forEach((r) => setDisplay(r, "none"));
    const resetPose = () => {
      clearProps();
      showHands(true);
      head.current?.removeAttribute("transform");
    };

    let behavior: Behavior | null = null;
    let last: Behavior | null = null;
    let elapsed = 0;
    let gap = 1.0; // pause before the first / next behavior

    const startBehavior = (b: Behavior) => {
      behavior = b;
      last = b;
      elapsed = 0;
      clearProps();
      if (b === "wave") {
        setDisplay(waveArm, "block");
        showHands(true);
        if (pocketHandL.current) pocketHandL.current.style.display = "none";
      } else if (b === "read") {
        setDisplay(bookArt, "block");
        showHands(false);
      } else if (b === "code") {
        setDisplay(laptopArt, "block");
        showHands(false);
      } else if (b === "music") {
        setDisplay(musicArt, "block");
        showHands(true);
      }
    };
    const endBehavior = () => {
      resetPose();
      behavior = null;
      gap = 1.4 + Math.random() * 1.8;
    };
    const pickNext = (): Behavior => {
      const opts = BEHAVIORS.filter((b) => b !== last);
      return opts[Math.floor(Math.random() * opts.length)];
    };

    let blinkCountdown = 3;
    let blinkElapsed = 0;
    let prev = performance.now();
    let raf = 0;

    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - prev) / 1000);
      prev = t;
      const idle = t - lastMove > IDLE_MS;

      if (idle) {
        target.x = 0;
        target.y = 0;
        if (!behavior) {
          gap -= dt;
          if (gap <= 0) startBehavior(pickNext());
        } else {
          elapsed += dt;
          if (behavior === "wave") {
            waveArm.current?.setAttribute("transform", `rotate(${Math.sin(t / 1000 * 6) * 14} 84 182)`);
          } else if (behavior === "music") {
            head.current?.setAttribute("transform", `rotate(${Math.sin(t / 1000 * 4) * 5} 140 96)`);
            musicArt.current?.setAttribute("transform", `translate(0 ${Math.sin(t / 1000 * 3) * -4})`);
          } else if (behavior === "read") {
            head.current?.setAttribute("transform", `translate(0 3) rotate(${3 + Math.sin(t / 1000 * 2.5) * 1.5} 140 96)`);
          } else if (behavior === "code") {
            codeHands.current?.setAttribute("transform", `translate(0 ${Math.sin(t / 1000 * 18) > 0 ? -1.5 : 0.6})`);
          }
          if (elapsed >= DURATION[behavior]) endBehavior();
        }
      } else if (behavior !== null) {
        // user moved mid-behavior → cancel and return to follow
        endBehavior();
        gap = 1.0;
      }

      // body follows cursor (eases to center while idle)
      const ease = Math.min(1, 6 * dt);
      cur.x += (target.x - cur.x) * ease;
      cur.y += (target.y - cur.y) * ease;
      if (figure.current) {
        figure.current.style.transform = `translate3d(${cur.x * mx}px, ${cur.y * my}px, 0) rotate(${cur.x * 3}deg)`;
      }

      // pupils track the cursor
      const px = cur.x * 2.6;
      const py = cur.y * 2.2;
      leftPupil.current?.setAttribute("transform", `translate(${px} ${py})`);
      rightPupil.current?.setAttribute("transform", `translate(${px} ${py})`);

      // expression (smiles while idle / busy)
      const surprised = !idle && target.y < -0.32;
      const grinning = idle || target.y > 0.32;
      if (mouth.current) {
        mouth.current.setAttribute("d", surprised ? MOUTH.surprised : grinning ? MOUTH.smile : MOUTH.calm);
        mouth.current.setAttribute("fill", surprised ? "#3a2410" : "none");
      }

      // blink
      blinkCountdown -= dt;
      let openY = 1;
      if (blinkCountdown <= 0) {
        blinkElapsed += dt;
        const half = 0.07;
        if (blinkElapsed < half) openY = 1 - blinkElapsed / half;
        else if (blinkElapsed < half * 2) openY = (blinkElapsed - half) / half;
        else {
          blinkCountdown = 2.5 + Math.random() * 3;
          blinkElapsed = 0;
          openY = 1;
        }
      }
      const scaleY = Math.max(0.08, openY * (surprised ? 1.18 : 1));
      leftEye.current?.setAttribute("transform", `translate(126 96) scale(1 ${scaleY})`);
      rightEye.current?.setAttribute("transform", `translate(154 96) scale(1 ${scaleY})`);

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", recenter);
      window.removeEventListener("blur", recenter);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div className="grid h-full w-full place-items-center">
      <div ref={figure} className="relative h-[clamp(16rem,46vh,32rem)] w-auto will-change-transform">
        {/* "hola" greeting bubble */}
        {bubbleMounted && (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute left-[58%] top-[1%] z-10 origin-bottom-left transition-all duration-300 ${
              bubbleVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-1 scale-90 opacity-0"
            }`}
          >
            <div className="relative rounded-2xl bg-charcoal px-4 py-2 font-display text-lg font-extrabold text-lime shadow-[0_8px_20px_rgba(26,27,22,0.25)]">
              hola
              <span className="absolute -bottom-1.5 left-5 h-3 w-3 rotate-45 bg-charcoal" />
            </div>
          </div>
        )}

        <svg viewBox="0 0 280 620" role="img" aria-label={site.avatar.alt} className="h-full w-auto drop-shadow-[0_18px_30px_rgba(26,27,22,0.18)]" fill="none">
          <defs>
            <clipPath id="hoodieClip">
              <rect x="60" y="150" width="160" height="230" rx="40" />
            </clipPath>
          </defs>

          {/* ground shadow */}
          <ellipse cx="140" cy="598" rx="86" ry="14" fill="#1a1b16" opacity="0.14" />

          {/* legs / pants */}
          <rect x="98" y="350" width="40" height="218" rx="17" fill="#16170f" />
          <rect x="142" y="350" width="40" height="218" rx="17" fill="#1d1e15" />

          {/* shoes */}
          <rect x="84" y="556" width="60" height="34" rx="15" fill="#f4f7e8" />
          <rect x="84" y="578" width="60" height="14" rx="7" fill="#c6f432" />
          <path d="M104 560 l18 0 M102 568 l22 0" stroke="#cfd3bb" strokeWidth="3" strokeLinecap="round" />
          <rect x="136" y="556" width="60" height="34" rx="15" fill="#f4f7e8" />
          <rect x="136" y="578" width="60" height="14" rx="7" fill="#c6f432" />
          <path d="M156 560 l18 0 M154 568 l22 0" stroke="#cfd3bb" strokeWidth="3" strokeLinecap="round" />

          {/* hood collar behind neck */}
          <path d="M104 150 q36 34 72 0 l6 26 q-42 30 -84 0 z" fill="#1a1b16" />

          {/* ===== head (rigged group: bobs/nods during behaviors) ===== */}
          <g ref={head}>
            <circle cx="140" cy="96" r="46" fill="#a4703f" />
            <path d="M94 96 a46 46 0 0 0 92 0 q-2 30 -46 30 q-44 0 -46 -30 z" fill="#90602f" opacity="0.35" />
            <path d="M96 86 q-4 -52 44 -54 q48 2 44 54 q-10 -20 -44 -20 q-34 0 -44 20 z" fill="#14150f" />
            <g ref={leftEye} transform="translate(126 96)">
              <ellipse rx="6.5" ry="7.5" fill="#f4f7e8" />
              <circle ref={leftPupil} r="3.2" fill="#14150f" />
            </g>
            <g ref={rightEye} transform="translate(154 96)">
              <ellipse rx="6.5" ry="7.5" fill="#f4f7e8" />
              <circle ref={rightPupil} r="3.2" fill="#14150f" />
            </g>
            <path ref={mouth} d={MOUTH.calm} stroke="#5e3c1c" strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* headphones */}
            <path d="M88 96 a52 52 0 0 1 104 0" stroke="#1a1b16" strokeWidth="9" fill="none" strokeLinecap="round" />
            <rect x="80" y="80" width="20" height="40" rx="9" fill="#1a1b16" />
            <rect x="180" y="80" width="20" height="40" rx="9" fill="#1a1b16" />
            <rect x="85" y="92" width="10" height="16" rx="5" fill="#c6f432" />
            <rect x="185" y="92" width="10" height="16" rx="5" fill="#c6f432" />
          </g>

          {/* sleeves */}
          <rect x="52" y="168" width="44" height="170" rx="22" fill="#22231b" transform="rotate(6 74 250)" />
          <rect x="184" y="168" width="44" height="170" rx="22" fill="#2a2b22" transform="rotate(-6 206 250)" />

          {/* hoodie body */}
          <rect x="60" y="150" width="160" height="230" rx="40" fill="#26271f" />
          <g clipPath="url(#hoodieClip)">
            <rect x="60" y="150" width="80" height="230" fill="#2c2d24" />
            <rect x="86" y="296" width="108" height="46" rx="20" fill="#1c1d17" />
            <rect x="86" y="296" width="108" height="10" fill="#171810" opacity="0.6" />
          </g>
          {/* hands tucked in pocket (toggled per behavior) */}
          <ellipse ref={pocketHandL} cx="98" cy="312" rx="13" ry="11" fill="#a4703f" />
          <ellipse ref={pocketHandR} cx="182" cy="312" rx="13" ry="11" fill="#90602f" />
          {/* drawstrings */}
          <path d="M132 158 l-4 46" stroke="#d8dcc4" strokeWidth="4" strokeLinecap="round" />
          <path d="M148 158 l4 46" stroke="#d8dcc4" strokeWidth="4" strokeLinecap="round" />
          <circle cx="128" cy="206" r="4" fill="#c6f432" />
          <circle cx="152" cy="206" r="4" fill="#c6f432" />

          {/* ===== idle behavior props (hidden by default) ===== */}

          {/* wave */}
          <g ref={waveArm} style={{ display: "none" }}>
            <path d="M84 182 L66 104" stroke="#22231b" strokeWidth="30" strokeLinecap="round" />
            <circle cx="66" cy="100" r="14" fill="#a4703f" />
          </g>

          {/* read a book */}
          <g ref={bookArt} style={{ display: "none" }}>
            <path d="M74 250 L96 318" stroke="#22231b" strokeWidth="26" strokeLinecap="round" />
            <path d="M206 250 L184 318" stroke="#2a2b22" strokeWidth="26" strokeLinecap="round" />
            <path d="M140 288 L94 298 L94 330 L140 322 Z" fill="#f4f7e8" />
            <path d="M140 288 L186 298 L186 330 L140 322 Z" fill="#e6ead4" />
            <line x1="140" y1="288" x2="140" y2="322" stroke="#bdbfa8" strokeWidth="2" />
            <path d="M104 306 l26 -4 M104 314 l26 -4" stroke="#c9cbb4" strokeWidth="2" strokeLinecap="round" />
            <path d="M150 302 l26 4 M150 310 l26 4" stroke="#cfd1bb" strokeWidth="2" strokeLinecap="round" />
            <ellipse cx="96" cy="322" rx="11" ry="9" fill="#a4703f" />
            <ellipse cx="184" cy="322" rx="11" ry="9" fill="#90602f" />
          </g>

          {/* code on a laptop */}
          <g ref={laptopArt} style={{ display: "none" }}>
            <path d="M76 252 L104 326" stroke="#22231b" strokeWidth="24" strokeLinecap="round" />
            <path d="M204 252 L176 326" stroke="#2a2b22" strokeWidth="24" strokeLinecap="round" />
            <rect x="106" y="280" width="68" height="44" rx="4" fill="#14150f" />
            <text x="140" y="308" textAnchor="middle" fontSize="20" fontWeight="800" fontFamily="monospace" fill="#c6f432">
              {"</>"}
            </text>
            <path d="M98 324 L182 324 L192 340 L88 340 Z" fill="#2a2b22" />
            <rect x="100" y="326" width="80" height="4" rx="2" fill="#3a3b30" />
            <g ref={codeHands}>
              <ellipse cx="116" cy="332" rx="10" ry="7" fill="#a4703f" />
              <ellipse cx="164" cy="332" rx="10" ry="7" fill="#90602f" />
            </g>
          </g>

          {/* music (bops head; notes float) */}
          <g ref={musicArt} style={{ display: "none" }}>
            <g fill="#1a1b16">
              <ellipse cx="196" cy="74" rx="6" ry="4.5" transform="rotate(-20 196 74)" />
              <rect x="200" y="50" width="3" height="26" />
              <path d="M203 50 q10 2 8 12 q-2 -7 -8 -7 z" />
            </g>
            <g fill="#1a1b16" opacity="0.75">
              <ellipse cx="216" cy="94" rx="5" ry="4" transform="rotate(-20 216 94)" />
              <rect x="219" y="74" width="2.5" height="22" />
              <path d="M221.5 74 q8 2 6 10 q-1.5 -6 -6 -6 z" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}

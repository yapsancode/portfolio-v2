"use client";

import { type RefObject, useEffect, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import type { Group, Mesh, MeshStandardMaterial } from "three";
import { onAvatarBehavior, playAvatarBehavior, type AvatarBehavior } from "./avatarBus";

/**
 * Procedural low-poly character (no external model) for the 3D hero.
 *
 * It cursor-follows + levitates by default, greets with a 3D "hola" bubble, and
 * plays one of several NAMED, individually-triggerable animation states:
 *   - "wave"    : forward, raised arm waving (hand in front of the body)
 *   - "reading" : sits down and reads a book (READING_SECONDS)
 *   - "coding"  : sits, laptop on lap, types (CODING_SECONDS)
 *   - "music"   : one hand on the headphones, head bobbing to a beat
 *
 * Trigger by name via the avatarBus (see ./avatarBus). When idle (cursor still)
 * it also auto-cycles these states. Everything animates in one useFrame loop via
 * damped refs — no React state in the loop (only the one-shot greeting bubble).
 */

// ---- tunables ----------------------------------------------------------------
const IDLE_MS = 2400; // cursor-still time before auto behaviors begin
const WAVE_SECONDS = 8;
const READING_SECONDS = 8; // "reads for about 8 seconds"
const CODING_SECONDS = 8;
const MUSIC_SECONDS = 6;
const FALL_SECONDS = 6; // click-to-fall: buckle/plop to a floor-sit → hold seated → get up

// Auto-cycled idle behaviors. "fall" is click-only (never auto), so it lives in
// AllBehavior but not in this list.
const BEHAVIORS = ["wave", "reading", "coding", "music"] as const;
type Behavior = (typeof BEHAVIORS)[number];
type AllBehavior = Behavior | "fall";
const DURATION: Record<AllBehavior, number> = {
  wave: WAVE_SECONDS,
  reading: READING_SECONDS,
  coding: CODING_SECONDS,
  music: MUSIC_SECONDS,
  fall: FALL_SECONDS,
};

// ---- palette (matte) ---------------------------------------------------------
const SKIN = "#e8b98c"; // warm light-tan — fine-tune this hex to taste
const CHARCOAL = "#26271f";
const CHARCOAL_DK = "#1a1b16";
const SLEEVE_L = "#22231b";
const SLEEVE_R = "#2a2b22";
const LIME = "#c6f432";
const PAPER = "#f4f7e8";

const damp = (cur: number, target: number, lambda: number, dt: number) =>
  cur + (target - cur) * (1 - Math.exp(-lambda * dt));

// 0→1 eased ramp as x crosses [a, b] (clamped outside). Subtracting two of these
// makes a 0→1→0 pulse — used to choreograph the multi-phase fall from one timer.
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// ---- facial expressions ------------------------------------------------------
// Reusable named presets built from a few simple eye/brow/mouth params. Reassign
// which expression a state wears in STATE_EXPRESSION below. All values are damped
// toward their target each frame, so expressions blend smoothly (never snap).
type ExprName = "neutral" | "happy" | "focused" | "concentrated" | "content";
type Expression = {
  eyeOpen: number; // eye vertical scale: 1 = wide, lower = narrowed, ~0.2 = squint/closed
  pupilY: number; // pupil vertical look offset: negative = looking down
  browY: number; // brow vertical offset from rest
  browTilt: number; // inner-end tilt: positive = furrow (concentration), negative = soft/raised
  mouthSmile: number; // 0 = flat line, 1 = full smile (crossfades the two mouth shapes)
  mouthWidth: number; // horizontal mouth scale: lower = pressed/tight
};
const EXPRESSIONS: Record<ExprName, Expression> = {
  neutral: { eyeOpen: 1.0, pupilY: 0, browY: 0, browTilt: 0, mouthSmile: 0.35, mouthWidth: 1 },
  happy: { eyeOpen: 0.82, pupilY: 0.005, browY: 0.02, browTilt: -0.04, mouthSmile: 1, mouthWidth: 1 },
  focused: { eyeOpen: 0.85, pupilY: -0.035, browY: -0.012, browTilt: 0.1, mouthSmile: 0.2, mouthWidth: 0.92 },
  // browTilt kept mild (0.16) — the old 0.26 furrow read as ANGRY, not focused
  concentrated: { eyeOpen: 0.6, pupilY: -0.008, browY: -0.03, browTilt: 0.16, mouthSmile: 0.15, mouthWidth: 0.85 },
  content: { eyeOpen: 0.2, pupilY: 0, browY: 0.015, browTilt: -0.06, mouthSmile: 0.85, mouthWidth: 1 },
};
// Which expression each animation state wears — reassign freely.
const STATE_EXPRESSION: Record<"idle" | Behavior, ExprName> = {
  idle: "happy", // cursor-follow resting face
  wave: "happy",
  reading: "focused",
  coding: "concentrated",
  music: "content",
};
const BROW_Y = 0.16; // brow rest height (matches the JSX position below)

// Two-segment arm (shoulder upper + elbow forearm) so it can bend naturally.
// Filler spheres at both pivots keep the joints visually connected at any bend:
// they sit AT the rotation origins, so they never move — the capsules rotate
// around them and the seam stays covered (no lime gap at shoulder or elbow).
function Arm({
  shoulder,
  elbow,
  color,
  x,
}: {
  shoulder: RefObject<Group | null>;
  elbow: RefObject<Group | null>;
  color: string;
  x: number;
}) {
  return (
    <group ref={shoulder} position={[x, 1.95, 0.05]}>
      {/* deltoid — bridges torso and upper arm when the arm raises */}
      <mesh>
        <sphereGeometry args={[0.17, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.75} />
      </mesh>
      <mesh position={[0, -0.28, 0]}>
        <capsuleGeometry args={[0.14, 0.34, 6, 14]} />
        <meshStandardMaterial color={color} roughness={0.75} />
      </mesh>
      <group ref={elbow} position={[0, -0.56, 0]}>
        {/* elbow filler — covers the bend seam between the two capsules */}
        <mesh>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color={color} roughness={0.75} />
        </mesh>
        <mesh position={[0, -0.26, 0]}>
          <capsuleGeometry args={[0.135, 0.32, 6, 14]} />
          <meshStandardMaterial color={color} roughness={0.75} />
        </mesh>
        <mesh position={[0, -0.52, 0]}>
          <sphereGeometry args={[0.145, 16, 16]} />
          <meshStandardMaterial color={SKIN} roughness={0.55} />
        </mesh>
      </group>
    </group>
  );
}

// Leg with the pivot at the hip so it can bend forward to sit.
function Leg({ legRef, x, color }: { legRef: RefObject<Group | null>; x: number; color: string }) {
  return (
    <group ref={legRef} position={[x, 1.12, 0]}>
      <mesh position={[0, -0.42, 0]}>
        <capsuleGeometry args={[0.15, 0.6, 6, 16]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <group position={[0, -0.86, 0.08]}>
        <RoundedBox args={[0.32, 0.17, 0.48]} radius={0.08} smoothness={3}>
          <meshStandardMaterial color={PAPER} roughness={0.5} />
        </RoundedBox>
        {/* sole — dark, NOT lime: when the character sits, the sole points at
            the camera and a lime sole vanishes into the lime background */}
        <mesh position={[0, -0.08, 0]}>
          <boxGeometry args={[0.34, 0.06, 0.5]} />
          <meshStandardMaterial color={CHARCOAL_DK} roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

// Floating notes for the "music" behavior. Three glyph shapes — eighth (♪),
// beamed pair (♫) and quarter — so the rising stream reads as varied music,
// not one repeated symbol. `scale` varies the size per instance.
function MusicNote({
  color,
  variant = "eighth",
  scale = 1,
}: {
  color: string;
  variant?: "eighth" | "beamed" | "quarter";
  scale?: number;
}) {
  if (variant === "beamed") {
    return (
      <group scale={scale}>
        {/* two note heads */}
        <mesh rotation={[0, 0, -0.35]} scale={[1, 0.78, 0.6]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color={color} roughness={0.6} transparent depthWrite={false} />
        </mesh>
        <mesh position={[0.19, 0.03, 0]} rotation={[0, 0, -0.35]} scale={[1, 0.78, 0.6]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color={color} roughness={0.6} transparent depthWrite={false} />
        </mesh>
        {/* stems */}
        <mesh position={[0.063, 0.16, 0]}>
          <boxGeometry args={[0.022, 0.32, 0.022]} />
          <meshStandardMaterial color={color} roughness={0.6} transparent depthWrite={false} />
        </mesh>
        <mesh position={[0.253, 0.19, 0]}>
          <boxGeometry args={[0.022, 0.32, 0.022]} />
          <meshStandardMaterial color={color} roughness={0.6} transparent depthWrite={false} />
        </mesh>
        {/* beam joining the stem tops */}
        <mesh position={[0.158, 0.335, 0]} rotation={[0, 0, 0.15]}>
          <boxGeometry args={[0.24, 0.05, 0.022]} />
          <meshStandardMaterial color={color} roughness={0.6} transparent depthWrite={false} />
        </mesh>
      </group>
    );
  }
  if (variant === "quarter") {
    return (
      <group scale={scale}>
        <mesh rotation={[0, 0, -0.35]} scale={[1, 0.78, 0.6]}>
          <sphereGeometry args={[0.075, 16, 16]} />
          <meshStandardMaterial color={color} roughness={0.6} transparent depthWrite={false} />
        </mesh>
        <mesh position={[0.068, 0.17, 0]}>
          <boxGeometry args={[0.022, 0.34, 0.022]} />
          <meshStandardMaterial color={color} roughness={0.6} transparent depthWrite={false} />
        </mesh>
      </group>
    );
  }
  // eighth (♪): head + stem + flag
  return (
    <group scale={scale}>
      {/* note head — flattened, tilted oval like a real note head */}
      <mesh rotation={[0, 0, -0.35]} scale={[1, 0.78, 0.6]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.6} transparent depthWrite={false} />
      </mesh>
      {/* stem rising from the head's right side */}
      <mesh position={[0.073, 0.18, 0]}>
        <boxGeometry args={[0.024, 0.36, 0.024]} />
        <meshStandardMaterial color={color} roughness={0.6} transparent depthWrite={false} />
      </mesh>
      {/* flag off the top of the stem */}
      <mesh position={[0.12, 0.33, 0]} rotation={[0, 0, -0.6]}>
        <boxGeometry args={[0.11, 0.05, 0.022]} />
        <meshStandardMaterial color={color} roughness={0.6} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function Character3D() {
  const root = useRef<Group>(null);
  const body = useRef<Group>(null);
  const head = useRef<Group>(null);
  // two-segment arms: shoulder (upper) + elbow (forearm)
  const lSh = useRef<Group>(null);
  const lEl = useRef<Group>(null);
  const rSh = useRef<Group>(null);
  const rEl = useRef<Group>(null);
  const lLeg = useRef<Group>(null);
  const rLeg = useRef<Group>(null);
  const book = useRef<Group>(null);
  const laptop = useRef<Group>(null);
  const notes = useRef<Group>(null);
  const stars = useRef<Group>(null);
  const screen = useRef<Mesh>(null);
  // facial features (driven by the expression presets)
  const lEye = useRef<Group>(null);
  const rEye = useRef<Group>(null);
  const lPupil = useRef<Mesh>(null);
  const rPupil = useRef<Mesh>(null);
  const lBrow = useRef<Mesh>(null);
  const rBrow = useRef<Mesh>(null);
  const mouthGrp = useRef<Group>(null);
  const mouthSmileMesh = useRef<Mesh>(null);
  const mouthFlatMesh = useRef<Mesh>(null);

  // Speech bubble: greets on load, says "Hola!" on EVERY wave, and shows a
  // line of code while coding. State is set only on behavior TRANSITIONS
  // (never per frame), so the no-React-state-in-the-loop rule still holds.
  const [bubble, setBubble] = useState<"hola" | "code" | null>("hola");
  const bubbleSrc = useRef<"greet" | "behavior" | null>("greet");
  useEffect(() => {
    const t = setTimeout(() => {
      // only auto-hide the LOAD greeting — never a behavior-driven bubble
      if (bubbleSrc.current === "greet") {
        bubbleSrc.current = null;
        setBubble(null);
      }
    }, 3600);
    return () => clearTimeout(t);
  }, []);

  const ctl = useRef({
    behavior: null as AllBehavior | null,
    prevBehavior: null as AllBehavior | null, // last frame's value — drives bubble transitions
    last: null as Behavior | null,
    forced: false,
    elapsed: 0,
    gap: 1.4,
    seat: 0, // 0 standing → 1 sitting
    lastMove: 0, // seeded to performance.now() on mount (see effect below)
    px: 0,
    py: 0,
  });

  // pointer + trigger wiring
  useEffect(() => {
    // Seed the idle timer at mount (kept out of render to stay pure). This runs
    // before the first useFrame, so the character isn't treated as idle at load.
    ctl.current.lastMove = performance.now();

    const onMove = (e: PointerEvent) => {
      const c = ctl.current;
      c.px = (e.clientX / window.innerWidth) * 2 - 1;
      c.py = (e.clientY / window.innerHeight) * 2 - 1;
      c.lastMove = performance.now();
    };
    const recenter = () => {
      ctl.current.px = 0;
      ctl.current.py = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", recenter);
    window.addEventListener("blur", recenter);

    // trigger states by name (forced = play full duration, ignore pointer)
    const off = onAvatarBehavior((b: AvatarBehavior) => {
      const c = ctl.current;
      if (b === "idle") {
        c.behavior = null;
        c.forced = false;
        c.gap = 1.0;
        c.lastMove = performance.now();
      } else {
        c.behavior = b;
        c.last = b;
        c.elapsed = 0;
        c.forced = true;
      }
    });
    // console convenience in dev
    (window as unknown as { playAvatarBehavior?: typeof playAvatarBehavior }).playAvatarBehavior =
      playAvatarBehavior;
    // dev convenience: knock the character over from the console (real users click it)
    (window as unknown as { fallDown?: () => void }).fallDown = () => {
      const c = ctl.current;
      if (c.behavior === "fall") return;
      c.behavior = "fall";
      c.elapsed = 0;
      c.forced = true;
      c.lastMove = performance.now();
    };

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", recenter);
      window.removeEventListener("blur", recenter);
      off();
    };
  }, []);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    const t = state.clock.elapsedTime;
    const c = ctl.current;
    const now = performance.now();
    const pointerIdle = now - c.lastMove > IDLE_MS;

    // ----- state machine -----
    if (c.behavior) {
      c.elapsed += d;
      const finished = c.elapsed >= DURATION[c.behavior];
      const interrupted = !c.forced && !pointerIdle; // auto behavior + user moved
      if (finished || interrupted) {
        c.behavior = null;
        c.forced = false;
        c.gap = 1.4 + Math.random() * 1.8;
      }
    } else if (pointerIdle) {
      c.gap -= d;
      if (c.gap <= 0) {
        const opts = BEHAVIORS.filter((b) => b !== c.last);
        c.behavior = opts[Math.floor(Math.random() * opts.length)];
        c.last = c.behavior;
        c.elapsed = 0;
        c.forced = false;
      }
    }
    const active = c.behavior;

    // ----- speech bubble (updated only when the behavior CHANGES) -----
    if (c.behavior !== c.prevBehavior) {
      c.prevBehavior = c.behavior;
      if (c.behavior === "wave") {
        bubbleSrc.current = "behavior";
        setBubble("hola");
      } else if (c.behavior === "coding") {
        bubbleSrc.current = "behavior";
        setBubble("code");
      } else if (bubbleSrc.current !== "greet") {
        // any other behavior (or back to idle) hides a behavior bubble, but
        // never cuts the on-load greeting short
        bubbleSrc.current = null;
        setBubble(null);
      }
    }

    // ----- pose targets -----
    let headP = 0;
    let headY = 0;
    let headR = 0;
    let bodyY = 0;
    let bodyZ = 0;
    let legX = 0;
    let legSplay = 0; // knees apart while seated so the legs read at an angle
    let sit = 0;
    // arm targets: shoulder {x,z} + elbow {x}
    let lShX = 0;
    let lShZ = 0.12;
    let lElX = -0.08;
    let rShX = 0;
    let rShZ = -0.12;
    let rElX = -0.08;
    const lElZ = 0;
    let rElZ = 0;
    let bookT = 0;
    let laptopT = 0;
    let notesT = 0;

    if (active === "wave") {
      // classic overhead wave: upper arm raised past the shoulder, forearm
      // folded UP in the same plane (elbow-Z, not elbow-X — an X fold tips the
      // forearm toward the camera, which foreshortens it into a "bent down"
      // look from the front). Slight shoulder-X keeps the hand in front.
      rShX = 0.25;
      rShZ = 2.25; // upper arm up and out
      rElX = -0.15;
      rElZ = 1.15 + Math.sin(t * 7) * 0.35; // hand above the head, waving side to side
      headY = 0.14;
      headP = -0.05;
    } else if (active === "reading") {
      sit = 1;
      legX = -1.05;
      legSplay = 0.22;
      lShX = -0.65;
      lShZ = 0.35;
      lElX = -0.9;
      rShX = -0.65;
      rShZ = -0.35;
      rElX = -0.9;
      headP = 0.32;
      bookT = 1;
      bodyZ = 0.1; // slight left lean while reading
    } else if (active === "coding") {
      sit = 1;
      legX = -1.05;
      legSplay = 0.22;
      // hands type BEHIND the lid, folded just enough that the fingertips
      // peek above the keyboard base (more fold pokes them through the screen)
      lShX = -0.35;
      lShZ = 0.45;
      lElX = -0.65 + Math.sin(t * 16 + Math.PI) * 0.12;
      rShX = -0.35;
      rShZ = -0.45;
      rElX = -0.65 + Math.sin(t * 16) * 0.12;
      headP = 0.26;
      laptopT = 1;
      bodyZ = 0.12; // slight LEFT lean while coding (positive = left, as in reading)
    } else if (active === "music") {
      // right hand raised to ear cup; natural shoulder lift + elbow bend
      rShX = -0.1;
      rShZ = 2.5; // raise the upper arm near-vertical so the elbow comes up to head height
      rElX = -1.3; // fold the forearm
      rElZ = 0.9; // swing the forearm inward so the hand lands by the headphone cup
      headR = Math.sin(t * 5) * 0.22;
      headP = Math.sin(t * 10) * 0.05 - 0.02;
      bodyY = Math.sin(t * 2.5) * 0.08;
      notesT = 1;
    } else if (active === "fall") {
      // lose balance → buckle at the knees → plop down to sit on the floor. The limbs
      // are damped (apply section) so this cross-fades smoothly out of whatever pose
      // was playing; the body's vertical drop is driven on the root, below.
      const e = c.elapsed;
      const seated = smooth(0, 0.42, e) - smooth(4.0, 4.9, e); // 0→1 plop, hold, →0 get-up
      const buckle = (smooth(0.04, 0.16, e) - smooth(0.16, 0.44, e)) * 0.35; // quick knee give-way
      const brace = smooth(0, 0.22, e) - smooth(0.22, 0.6, e); // arms shoot out to catch balance
      legX = seated * -1.1 - buckle; // fold the legs forward so they rest on the floor
      legSplay = seated * 0.28; // knees apart so the legs don't foreshorten into stumps
      const splay = seated * 0.32 + brace * 0.5;
      rShZ = -0.12 + splay; // hands brace, then settle out by the hips on the floor
      lShZ = 0.12 - splay;
      rShX = -0.1 * brace;
      lShX = -0.1 * brace;
      rElX = -0.2 - seated * 0.2;
      lElX = -0.2 - seated * 0.2;
      headP = seated * 0.12 + brace * 0.1; // head dips as it settles down
      headR = seated * Math.sin(t * 3.5) * 0.1; // gentle woozy sway while seated
    } else {
      // cursor-follow
      headY = c.px * 0.5;
      headP = c.py * 0.3;
      bodyY = c.px * 0.22;
    }

    // ----- apply (damped) -----
    const setRot = (g: Group | null, x: number, z: number, lambda = 9) => {
      if (!g) return;
      g.rotation.x = damp(g.rotation.x, x, lambda, d);
      g.rotation.z = damp(g.rotation.z, z, lambda, d);
    };
    if (head.current) {
      head.current.rotation.x = damp(head.current.rotation.x, headP, 9, d);
      head.current.rotation.y = damp(head.current.rotation.y, headY, 9, d);
      head.current.rotation.z = damp(head.current.rotation.z, headR, 9, d);
    }
    if (body.current) {
      body.current.rotation.y = damp(body.current.rotation.y, bodyY, 7, d);
      body.current.rotation.z = damp(body.current.rotation.z, bodyZ, 7, d);
    }
    setRot(lSh.current, lShX, lShZ, 10);
    setRot(rSh.current, rShX, rShZ, 11);
    if (lEl.current) {
      lEl.current.rotation.x = damp(lEl.current.rotation.x, lElX, 11, d);
      lEl.current.rotation.z = damp(lEl.current.rotation.z, lElZ, 11, d);
    }
    if (rEl.current) {
      rEl.current.rotation.x = damp(rEl.current.rotation.x, rElX, 12, d);
      rEl.current.rotation.z = damp(rEl.current.rotation.z, rElZ, 12, d);
    }
    if (lLeg.current) {
      lLeg.current.rotation.x = damp(lLeg.current.rotation.x, legX, 7, d);
      lLeg.current.rotation.z = damp(lLeg.current.rotation.z, -legSplay, 7, d);
    }
    if (rLeg.current) {
      rLeg.current.rotation.x = damp(rLeg.current.rotation.x, legX, 7, d);
      rLeg.current.rotation.z = damp(rLeg.current.rotation.z, legSplay, 7, d);
    }

    // ----- facial expression -----
    if (active !== "fall") {
      // damped toward the active state's preset
      const ex = EXPRESSIONS[STATE_EXPRESSION[active ?? "idle"]];
      const fl = 9; // facial damping rate
      const setEye = (g: Group | null) => {
        if (g) g.scale.y = damp(g.scale.y, ex.eyeOpen, fl, d);
      };
      setEye(lEye.current);
      setEye(rEye.current);
      // damp pupil-X back to centered (the fall swirls it) and look up/down via pupil-Y
      if (lPupil.current) {
        lPupil.current.position.x = damp(lPupil.current.position.x, 0, fl, d);
        lPupil.current.position.y = damp(lPupil.current.position.y, ex.pupilY, fl, d);
      }
      if (rPupil.current) {
        rPupil.current.position.x = damp(rPupil.current.position.x, 0, fl, d);
        rPupil.current.position.y = damp(rPupil.current.position.y, ex.pupilY, fl, d);
      }
      const setBrow = (g: Mesh | null, sign: number) => {
        if (!g) return;
        g.position.y = damp(g.position.y, BROW_Y + ex.browY, fl, d);
        g.rotation.z = damp(g.rotation.z, sign * ex.browTilt, fl, d);
      };
      setBrow(lBrow.current, -1);
      setBrow(rBrow.current, 1);
      // "Hola" lip-sync at the start of a wave: two mouth-open pulses timed to
      // the syllables (Ho… la), synced with the bubble popping in. The mouth
      // also narrows while open so the big pulse reads as an "O".
      let mouthOpenT = 1;
      if (active === "wave") {
        const we = c.elapsed;
        mouthOpenT =
          1 +
          (smooth(0.05, 0.2, we) - smooth(0.3, 0.5, we)) * 1.7 + // "Ho"
          (smooth(0.55, 0.7, we) - smooth(0.8, 1.05, we)) * 1.2; // "la"
      }
      if (mouthGrp.current) {
        const widthT = ex.mouthWidth * (1 - (mouthOpenT - 1) * 0.15);
        mouthGrp.current.scale.x = damp(mouthGrp.current.scale.x, widthT, fl, d);
        // snappier rate than the rest of the face so the syllables don't blur
        mouthGrp.current.scale.y = damp(mouthGrp.current.scale.y, mouthOpenT, 14, d);
      }
      if (mouthSmileMesh.current) {
        const m = mouthSmileMesh.current.material as MeshStandardMaterial;
        m.opacity = damp(m.opacity, ex.mouthSmile, fl, d);
      }
      if (mouthFlatMesh.current) {
        const m = mouthFlatMesh.current.material as MeshStandardMaterial;
        m.opacity = damp(m.opacity, 1 - ex.mouthSmile, fl, d);
      }
    } else {
      // fall reaction: quick "oof" surprise → woozy daze while seated → sheepish smile getting up
      const e = c.elapsed;
      const oof = smooth(0, 0.16, e) - smooth(0.45, 0.85, e);
      const dazed = smooth(0.7, 1.05, e) - smooth(3.55, 3.95, e);
      const relief = smooth(4.3, 4.7, e) - smooth(5.3, 5.5, e);
      const ff = 13; // snappier than normal so the "oof" lands fast
      const eyeOpenT = 1 + oof * 0.35 - dazed * 0.4; // pops, then half-lidded daze
      const pxT = Math.cos(t * 7) * 0.04 * dazed; // pupils drift woozily while seated
      const pyT = Math.sin(t * 7) * 0.03 * dazed + oof * 0.025;
      const browYt = oof * 0.05 + relief * 0.03;
      const browTiltT = -0.2 * oof - 0.05 * relief; // raised inner = surprise/sheepish
      const mouthOpenT = 1 + oof * 1.8 + dazed * (0.6 + Math.sin(t * 9) * 0.25);
      const mouthSmileT = relief * 0.7;
      const mouthWidthT = 1 - oof * 0.15 + dazed * 0.08;
      if (lEye.current) lEye.current.scale.y = damp(lEye.current.scale.y, eyeOpenT, ff, d);
      if (rEye.current) rEye.current.scale.y = damp(rEye.current.scale.y, eyeOpenT, ff, d);
      if (lPupil.current) {
        lPupil.current.position.x = damp(lPupil.current.position.x, pxT, ff, d);
        lPupil.current.position.y = damp(lPupil.current.position.y, pyT, ff, d);
      }
      if (rPupil.current) {
        rPupil.current.position.x = damp(rPupil.current.position.x, pxT, ff, d);
        rPupil.current.position.y = damp(rPupil.current.position.y, pyT, ff, d);
      }
      const setBrowF = (g: Mesh | null, sign: number) => {
        if (!g) return;
        g.position.y = damp(g.position.y, BROW_Y + browYt, ff, d);
        g.rotation.z = damp(g.rotation.z, sign * browTiltT, ff, d);
      };
      setBrowF(lBrow.current, -1);
      setBrowF(rBrow.current, 1);
      if (mouthGrp.current) {
        mouthGrp.current.scale.x = damp(mouthGrp.current.scale.x, mouthWidthT, ff, d);
        mouthGrp.current.scale.y = damp(mouthGrp.current.scale.y, mouthOpenT, ff, d);
      }
      if (mouthSmileMesh.current) {
        const m = mouthSmileMesh.current.material as MeshStandardMaterial;
        m.opacity = damp(m.opacity, mouthSmileT, ff, d);
      }
      if (mouthFlatMesh.current) {
        const m = mouthFlatMesh.current.material as MeshStandardMaterial;
        m.opacity = damp(m.opacity, 1 - mouthSmileT, ff, d);
      }
    }

    // sit: ease the whole character down (legs already bend forward via legX)
    c.seat = damp(c.seat, sit, 6, d);
    const bob = Math.sin(t * 1.4) * 0.04 * (1 - c.seat * 0.6);
    if (root.current) {
      if (active === "fall") {
        // buckle + plop straight down to a floor-sit (no topple). Damping toward the
        // target is the cross-fade — it eases the body down over ~0.4s.
        const e = c.elapsed;
        const seated = smooth(0, 0.42, e) - smooth(4.0, 4.9, e);
        const land = (smooth(0.36, 0.44, e) - smooth(0.44, 0.78, e)) * 0.08; // little rebound on impact
        const getupLean = (smooth(4.0, 4.3, e) - smooth(4.3, 4.9, e)) * 0.18; // lean in to push up
        const wobble = Math.sin(t * 2) * 0.014 * seated; // subtle alive-while-seated settle
        const floorY = seated * -0.9 + land + wobble + bob * (1 - seated);
        root.current.position.y = damp(root.current.position.y, floorY, 14, d);
        root.current.rotation.x = damp(root.current.rotation.x, seated * -0.08 + getupLean, 11, d);
        root.current.rotation.z = damp(root.current.rotation.z, 0, 10, d);
        root.current.position.x = damp(root.current.position.x, 0, 10, d);
      } else {
        root.current.position.y = -c.seat * 0.7 + bob;
        // ease any leftover fall transform back to standing
        root.current.rotation.z = damp(root.current.rotation.z, 0, 8, d);
        root.current.rotation.x = damp(root.current.rotation.x, 0, 8, d);
        root.current.position.x = damp(root.current.position.x, 0, 8, d);
      }
    }
    if (body.current) body.current.scale.y = 1 + Math.sin(t * 1.8) * 0.012;

    const pop = (g: Group | null, target: number) => {
      if (!g) return;
      const s = damp(g.scale.x, target, 12, d);
      g.scale.setScalar(s);
      g.visible = s > 0.02;
    };
    pop(book.current, bookT);
    pop(laptop.current, laptopT);

    if (notes.current) {
      const s = damp(notes.current.scale.x, notesT, 10, d);
      notes.current.scale.setScalar(s);
      notes.current.visible = s > 0.02;
      notes.current.children.forEach((child, i) => {
        // 0.37 stagger over a 1.5 cycle → 2–3 notes visible at once, at
        // different heights, so the varied glyphs actually read as a stream
        const phase = (t * 0.6 + i * 0.37) % 1.5;
        // short rise: keeps the notes inside the camera frame — they fade out
        // around head height instead of clipping at the canvas top
        child.position.y = 0.08 + phase * 0.55;
        child.position.x = 0.3 + (i % 2) * 0.18 + Math.sin((t + i) * 2) * 0.1;
        child.rotation.z = Math.sin((t + i) * 1.6) * 0.25; // gentle sway as they rise
        const op = Math.max(0, 1 - phase / 1.5);
        child.traverse((o) => {
          const mm = (o as Mesh).material as MeshStandardMaterial | undefined;
          if (mm) mm.opacity = op;
        });
      });
    }
    if (screen.current) {
      const mat = screen.current.material as MeshStandardMaterial;
      const want = laptopT > 0.5 ? 0.7 + Math.sin(t * 8) * 0.25 : 0.25;
      mat.emissiveIntensity = damp(mat.emissiveIntensity, want, 8, d);
    }

    // "seeing stars" — sparkles orbit the head during the fall's dizzy phase
    if (stars.current) {
      const dizzyStars =
        active === "fall" ? smooth(1.0, 1.4, c.elapsed) - smooth(3.4, 3.8, c.elapsed) : 0;
      const s = damp(stars.current.scale.x, dizzyStars, 12, d);
      stars.current.scale.setScalar(s);
      stars.current.visible = s > 0.02;
      const n = stars.current.children.length;
      stars.current.children.forEach((star, i) => {
        const a = t * 3 + (i / n) * Math.PI * 2;
        star.position.set(Math.cos(a) * 0.5, 0.45 + Math.sin(a) * 0.16, 0.2);
        star.rotation.z = t * 4 + i;
        star.scale.setScalar(0.7 + Math.sin(t * 6 + i) * 0.3); // twinkle
      });
    }
  });

  // Click/tap the character to knock it over. Forced so it plays the full
  // topple→dizzy→get-up sequence; extra clicks mid-fall are ignored.
  const triggerFall = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const c = ctl.current;
    if (c.behavior === "fall") return;
    c.behavior = "fall";
    c.elapsed = 0;
    c.forced = true;
    c.lastMove = performance.now();
  };

  return (
    <group
      ref={root}
      onPointerDown={triggerFall}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <group ref={body}>
        {/* ===== legs ===== */}
        <Leg legRef={lLeg} x={-0.22} color={CHARCOAL_DK} />
        <Leg legRef={rLeg} x={0.22} color="#1d1e15" />

        {/* ===== hoodie torso ===== */}
        <RoundedBox args={[1.05, 1.15, 0.62]} radius={0.26} smoothness={4} position={[0, 1.5, 0]}>
          <meshStandardMaterial color={CHARCOAL} roughness={0.7} />
        </RoundedBox>
        <RoundedBox args={[0.62, 0.3, 0.14]} radius={0.1} smoothness={3} position={[0, 1.2, 0.34]}>
          <meshStandardMaterial color={CHARCOAL_DK} roughness={0.8} />
        </RoundedBox>
        <mesh position={[0, 2.0, -0.05]} rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[0.34, 0.1, 10, 24]} />
          <meshStandardMaterial color={CHARCOAL_DK} roughness={0.8} />
        </mesh>
        <mesh position={[-0.12, 1.78, 0.33]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color={LIME} emissive={LIME} emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0.12, 1.78, 0.33]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color={LIME} emissive={LIME} emissiveIntensity={0.3} />
        </mesh>

        {/* ===== head ===== */}
        <group ref={head} position={[0, 2.5, 0]}>
          <mesh>
            <sphereGeometry args={[0.5, 28, 28]} />
            <meshStandardMaterial color={SKIN} roughness={0.55} />
          </mesh>
          {/* hair cap — small + raised so the full face & both eyes are clear */}
          <mesh position={[0, 0.12, -0.02]}>
            <sphereGeometry args={[0.515, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
            <meshStandardMaterial color="#14150f" roughness={0.85} />
          </mesh>
          {/* eyes — the focal point: white sclera + dark pupil. eyeOpen scales group.y */}
          <group ref={lEye} position={[-0.17, 0.02, 0.44]}>
            <mesh scale={[1, 1, 0.5]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color={PAPER} roughness={0.4} />
            </mesh>
            <mesh ref={lPupil} position={[0, 0, 0.07]}>
              <sphereGeometry args={[0.055, 14, 14]} />
              <meshStandardMaterial color="#14150f" />
            </mesh>
          </group>
          <group ref={rEye} position={[0.17, 0.02, 0.44]}>
            <mesh scale={[1, 1, 0.5]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color={PAPER} roughness={0.4} />
            </mesh>
            <mesh ref={rPupil} position={[0, 0, 0.07]}>
              <sphereGeometry args={[0.055, 14, 14]} />
              <meshStandardMaterial color="#14150f" />
            </mesh>
          </group>
          {/* brows — position.y + rotation.z driven by the expression */}
          <mesh ref={lBrow} position={[-0.17, 0.16, 0.47]}>
            <boxGeometry args={[0.16, 0.03, 0.03]} />
            <meshStandardMaterial color="#14150f" />
          </mesh>
          <mesh ref={rBrow} position={[0.17, 0.16, 0.47]}>
            <boxGeometry args={[0.16, 0.03, 0.03]} />
            <meshStandardMaterial color="#14150f" />
          </mesh>
          {/* mouth — two shapes crossfaded by mouthSmile (0 = flat line, 1 = smile) */}
          <group ref={mouthGrp} position={[0, -0.2, 0.45]}>
            {/* smile arc (fades in for happy / content); offset so its curve centers on the line */}
            <mesh ref={mouthSmileMesh} position={[0, 0.102, 0]} rotation={[0, 0, -Math.PI / 2 - 0.8]}>
              <torusGeometry args={[0.12, 0.02, 8, 20, 1.6]} />
              <meshStandardMaterial color="#9a6b3f" roughness={0.6} transparent opacity={1} depthWrite={false} />
            </mesh>
            {/* flat line (fades in for focused / concentrated / neutral) */}
            <mesh ref={mouthFlatMesh}>
              <boxGeometry args={[0.18, 0.035, 0.04]} />
              <meshStandardMaterial color="#9a6b3f" roughness={0.6} transparent opacity={0} depthWrite={false} />
            </mesh>
          </group>
          {/* headphones */}
          <mesh position={[0, 0.05, 0]}>
            <torusGeometry args={[0.54, 0.055, 12, 32, Math.PI]} />
            <meshStandardMaterial color={CHARCOAL_DK} roughness={0.6} />
          </mesh>
          <mesh position={[-0.52, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.16, 0.16, 0.14, 20]} />
            <meshStandardMaterial color={CHARCOAL_DK} roughness={0.6} />
          </mesh>
          <mesh position={[0.52, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.16, 0.16, 0.14, 20]} />
            <meshStandardMaterial color={CHARCOAL_DK} roughness={0.6} />
          </mesh>
          <mesh position={[-0.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.03, 16]} />
            <meshStandardMaterial color={LIME} emissive={LIME} emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.03, 16]} />
            <meshStandardMaterial color={LIME} emissive={LIME} emissiveIntensity={0.6} />
          </mesh>

          {bubble && (
            <Html position={[-0.8, 0.6, 0]} center distanceFactor={8} occlude={false}>
              {/* grey bubble with a solid under-lip shadow so it reads as a
                  chunky 3D element floating with the character, not flat UI */}
              <div
                aria-hidden="true"
                className="pointer-events-none relative whitespace-nowrap rounded-2xl px-4 py-2"
                style={{
                  background: "#d9dad6",
                  color: "#1a1b16",
                  boxShadow: "0 4px 0 #a9aaa4, 0 12px 22px rgba(26,27,22,0.25)",
                }}
              >
                {bubble === "hola" ? (
                  <span className="font-display text-base font-extrabold">Hola!</span>
                ) : (
                  <span className="font-mono text-sm font-bold">{`print("Hello World")`}</span>
                )}
                {/* tail sits bottom-right, pointing back toward the head */}
                <span
                  className="absolute -bottom-1 right-4 h-3 w-3 rotate-45"
                  style={{ background: "#d9dad6" }}
                />
              </div>
            </Html>
          )}

          {/* "seeing stars" sparkles — orbit the head during the fall's dizzy phase.
              Off-white so they read against the lime background (lime would vanish). */}
          <group ref={stars} scale={0}>
            {[0, 1, 2, 3].map((i) => (
              <mesh key={i} rotation={[0, 0, Math.PI / 4]}>
                <boxGeometry args={[0.12, 0.12, 0.03]} />
                <meshStandardMaterial color={PAPER} emissive={PAPER} emissiveIntensity={0.45} transparent />
              </mesh>
            ))}
          </group>
        </group>

        {/* ===== arms (two-segment) ===== */}
        <Arm shoulder={lSh} elbow={lEl} color={SLEEVE_L} x={-0.6} />
        <Arm shoulder={rSh} elbow={rEl} color={SLEEVE_R} x={0.6} />

        {/* ===== behavior props ===== */}
        {/* book — held open with the red COVERS toward the camera (so the
            title is visible) and the pages toward the character's lowered
            gaze. The "C++" title is built from primitive boxes to match the
            low-poly style (no font asset needed). */}
        <group ref={book} position={[0, 1.5, 0.74]} rotation={[0.45, 0, 0]} scale={0}>
          {/* left half — outer edge folds back toward the reader */}
          <group rotation={[0, -0.3, 0]}>
            <mesh position={[-0.2, 0, 0.02]}>
              <boxGeometry args={[0.42, 0.52, 0.03]} />
              <meshStandardMaterial color="#bf3f3f" roughness={0.7} />
            </mesh>
            <mesh position={[-0.19, 0, -0.005]}>
              <boxGeometry args={[0.38, 0.48, 0.025]} />
              <meshStandardMaterial color={PAPER} />
            </mesh>
          </group>
          {/* right half — carries the front-cover title */}
          <group rotation={[0, 0.3, 0]}>
            <mesh position={[0.2, 0, 0.02]}>
              <boxGeometry args={[0.42, 0.52, 0.03]} />
              <meshStandardMaterial color="#bf3f3f" roughness={0.7} />
            </mesh>
            <mesh position={[0.19, 0, -0.005]}>
              <boxGeometry args={[0.38, 0.48, 0.025]} />
              <meshStandardMaterial color="#e6ead4" />
            </mesh>
            {/* "C++" — C */}
            <mesh position={[0.07, 0.02, 0.045]}>
              <boxGeometry args={[0.028, 0.13, 0.02]} />
              <meshStandardMaterial color={PAPER} roughness={0.5} />
            </mesh>
            <mesh position={[0.1, 0.072, 0.045]}>
              <boxGeometry args={[0.065, 0.028, 0.02]} />
              <meshStandardMaterial color={PAPER} roughness={0.5} />
            </mesh>
            <mesh position={[0.1, -0.032, 0.045]}>
              <boxGeometry args={[0.065, 0.028, 0.02]} />
              <meshStandardMaterial color={PAPER} roughness={0.5} />
            </mesh>
            {/* "C++" — first + */}
            <mesh position={[0.185, 0.02, 0.045]}>
              <boxGeometry args={[0.075, 0.026, 0.02]} />
              <meshStandardMaterial color={PAPER} roughness={0.5} />
            </mesh>
            <mesh position={[0.185, 0.02, 0.045]}>
              <boxGeometry args={[0.026, 0.075, 0.02]} />
              <meshStandardMaterial color={PAPER} roughness={0.5} />
            </mesh>
            {/* "C++" — second + */}
            <mesh position={[0.27, 0.02, 0.045]}>
              <boxGeometry args={[0.075, 0.026, 0.02]} />
              <meshStandardMaterial color={PAPER} roughness={0.5} />
            </mesh>
            <mesh position={[0.27, 0.02, 0.045]}>
              <boxGeometry args={[0.026, 0.075, 0.02]} />
              <meshStandardMaterial color={PAPER} roughness={0.5} />
            </mesh>
          </group>
          {/* spine */}
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[0.02, 0.5, 0.045]} />
            <meshStandardMaterial color="#992f2f" />
          </mesh>
        </group>

        {/* laptop on the lap — the group is flipped 180° so the LID BACK faces
            the camera and the screen faces the character (the old orientation
            aimed the lime emissive screen at the viewer, which read as a hole
            punched through the torso against the lime background). */}
        <group ref={laptop} position={[0, 1.16, 0.65]} rotation={[0, Math.PI, 0]} scale={0}>
          {/* keyboard base — flat horizontal slab (light grey, MacBook-ish) */}
          <mesh>
            <boxGeometry args={[0.76, 0.04, 0.54]} />
            <meshStandardMaterial color="#8e8e96" roughness={0.6} />
          </mesh>
          {/* touchpad detail (nearest the character after the flip) */}
          <mesh position={[0, 0.025, 0.1]}>
            <boxGeometry args={[0.26, 0.01, 0.16]} />
            <meshStandardMaterial color="#7c7c84" roughness={0.5} />
          </mesh>
          {/* screen — hinged at the camera-side edge, tilted to face the
              character's lowered gaze; its glow spills up toward the face */}
          <mesh ref={screen} position={[0, 0.24, -0.19]} rotation={[-0.52, 0, 0]}>
            <boxGeometry args={[0.70, 0.46, 0.025]} />
            <meshStandardMaterial color="#0a0b08" emissive={LIME} emissiveIntensity={0.6} />
          </mesh>
          {/* screen bezel / lid back (this face is what the camera sees) */}
          <mesh position={[0, 0.235, -0.205]} rotation={[-0.52, 0, 0]}>
            <boxGeometry args={[0.76, 0.52, 0.018]} />
            <meshStandardMaterial color="#84848c" roughness={0.55} />
          </mesh>
          {/* little glowing logo so the lid back isn't a featureless slab */}
          <mesh position={[0, 0.235, -0.218]} rotation={[-0.52, 0, 0]}>
            <boxGeometry args={[0.1, 0.1, 0.015]} />
            <meshStandardMaterial color={LIME} emissive={LIME} emissiveIntensity={0.5} />
          </mesh>
        </group>

        {/* music notes — a varied charcoal stream (♪ ♫ quarter) that rises and
            fades as the character listens; staggered so several show at once */}
        <group ref={notes} position={[0.2, 2.6, 0.2]} scale={0}>
          <MusicNote color={CHARCOAL} variant="eighth" />
          <MusicNote color={CHARCOAL} variant="beamed" scale={1.1} />
          <MusicNote color={CHARCOAL} variant="quarter" scale={0.9} />
          <MusicNote color={CHARCOAL} variant="eighth" scale={0.75} />
        </group>
      </group>
    </group>
  );
}

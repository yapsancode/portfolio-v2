"use client";

import { type RefObject, useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import type { Group, Mesh, MeshStandardMaterial } from "three";
import { site } from "@/config/site";
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
const WAVE_SECONDS = 2.8;
const READING_SECONDS = 8; // "reads for about 8 seconds"
const CODING_SECONDS = 8;
const MUSIC_SECONDS = 6;

const BEHAVIORS = ["wave", "reading", "coding", "music"] as const;
type Behavior = (typeof BEHAVIORS)[number];
const DURATION: Record<Behavior, number> = {
  wave: WAVE_SECONDS,
  reading: READING_SECONDS,
  coding: CODING_SECONDS,
  music: MUSIC_SECONDS,
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

// Two-segment arm (shoulder upper + elbow forearm) so it can bend naturally.
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
      <mesh position={[0, -0.28, 0]}>
        <capsuleGeometry args={[0.14, 0.34, 6, 14]} />
        <meshStandardMaterial color={color} roughness={0.75} />
      </mesh>
      <group ref={elbow} position={[0, -0.56, 0]}>
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
        <mesh position={[0, -0.08, 0]}>
          <boxGeometry args={[0.34, 0.06, 0.5]} />
          <meshStandardMaterial color={LIME} emissive={LIME} emissiveIntensity={0.15} />
        </mesh>
      </group>
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
  const screen = useRef<Mesh>(null);

  const [greeting, setGreeting] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setGreeting(false), 3600);
    return () => clearTimeout(t);
  }, []);

  const ctl = useRef({
    behavior: null as Behavior | null,
    last: null as Behavior | null,
    forced: false,
    elapsed: 0,
    gap: 1.4,
    seat: 0, // 0 standing → 1 sitting
    lastMove: performance.now(),
    px: 0,
    py: 0,
  });

  // pointer + trigger wiring
  useEffect(() => {
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

    // ----- pose targets -----
    let headP = 0;
    let headY = 0;
    let headR = 0;
    let bodyY = 0;
    let bodyZ = 0;
    let legX = 0;
    let sit = 0;
    // arm targets: shoulder {x,z} + elbow {x}
    let lShX = 0;
    let lShZ = 0.12;
    let lElX = -0.08;
    let rShX = 0;
    let rShZ = -0.12;
    let rElX = -0.08;
    let lElZ = 0;
    let rElZ = 0;
    let bookT = 0;
    let laptopT = 0;
    let notesT = 0;

    if (active === "wave") {
      // raised, brought FORWARD and out so the hand reads in front of the body
      rShX = -0.6; // forward (+z)
      rShZ = 2.0; // up and out to the side (positive lifts the right arm)
      rElX = -1.0 + Math.sin(t * 7) * 0.45; // forearm bent up, waving
      headY = 0.14;
      headP = -0.05;
    } else if (active === "reading") {
      sit = 1;
      legX = -1.35;
      lShX = -0.95;
      lShZ = 0.18;
      lElX = -1.0;
      rShX = -0.95;
      rShZ = -0.18;
      rElX = -1.0;
      headP = 0.32;
      bookT = 1;
      bodyZ = 0.1; // slight left lean while reading
    } else if (active === "coding") {
      sit = 1;
      legX = -1.35;
      lShX = -0.82;
      lShZ = 0.12;
      lElX = -1.2 + Math.sin(t * 16 + Math.PI) * 0.1;
      rShX = -0.82;
      rShZ = -0.12;
      rElX = -1.2 + Math.sin(t * 16) * 0.12;
      headP = 0.26;
      laptopT = 1;
      bodyZ = -0.1; // slight right lean while coding
    } else if (active === "music") {
      // right hand raised to ear cup; natural shoulder lift + elbow bend
      rShX = -0.15;
      rShZ = 1.75; // arm past horizontal, angling up toward the headphone cup
      rElX = -1.05; // elbow bends to bring hand to ear
      // rElZ stays 0 — no Z-twist (that was causing the broken-arm look)
      headR = Math.sin(t * 5) * 0.22;
      headP = Math.sin(t * 10) * 0.05 - 0.02;
      bodyY = Math.sin(t * 2.5) * 0.08;
      notesT = 1;
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
    if (lLeg.current) lLeg.current.rotation.x = damp(lLeg.current.rotation.x, legX, 7, d);
    if (rLeg.current) rLeg.current.rotation.x = damp(rLeg.current.rotation.x, legX, 7, d);

    // sit: ease the whole character down (legs already bend forward via legX)
    c.seat = damp(c.seat, sit, 6, d);
    const bob = Math.sin(t * 1.4) * 0.04 * (1 - c.seat * 0.6);
    if (root.current) root.current.position.y = -c.seat * 0.7 + bob;
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
        const m = child as Mesh;
        const phase = (t * 0.6 + i * 0.45) % 1.5;
        m.position.y = 0.1 + phase * 1.4;
        m.position.x = 0.35 + Math.sin((t + i) * 2) * 0.12;
        (m.material as MeshStandardMaterial).opacity = Math.max(0, 1 - phase / 1.5);
      });
    }
    if (screen.current) {
      const mat = screen.current.material as MeshStandardMaterial;
      const want = laptopT > 0.5 ? 0.7 + Math.sin(t * 8) * 0.25 : 0.25;
      mat.emissiveIntensity = damp(mat.emissiveIntensity, want, 8, d);
    }
  });

  return (
    <group ref={root}>
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
          {/* eyes — the focal point: white sclera + dark pupil */}
          <group position={[-0.17, 0.02, 0.44]}>
            <mesh scale={[1, 1, 0.5]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color={PAPER} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0, 0.07]}>
              <sphereGeometry args={[0.055, 14, 14]} />
              <meshStandardMaterial color="#14150f" />
            </mesh>
          </group>
          <group position={[0.17, 0.02, 0.44]}>
            <mesh scale={[1, 1, 0.5]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color={PAPER} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0, 0.07]}>
              <sphereGeometry args={[0.055, 14, 14]} />
              <meshStandardMaterial color="#14150f" />
            </mesh>
          </group>
          {/* brows for a touch of expression */}
          <mesh position={[-0.17, 0.16, 0.47]}>
            <boxGeometry args={[0.16, 0.03, 0.03]} />
            <meshStandardMaterial color="#14150f" />
          </mesh>
          <mesh position={[0.17, 0.16, 0.47]}>
            <boxGeometry args={[0.16, 0.03, 0.03]} />
            <meshStandardMaterial color="#14150f" />
          </mesh>
          {/* mouth */}
          <mesh position={[0, -0.2, 0.45]}>
            <boxGeometry args={[0.2, 0.035, 0.04]} />
            <meshStandardMaterial color="#9a6b3f" />
          </mesh>
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

          {greeting && (
            <Html position={[0.8, 0.55, 0]} center distanceFactor={8} occlude={false}>
              <div
                aria-hidden="true"
                className="pointer-events-none whitespace-nowrap rounded-2xl bg-charcoal px-4 py-2 font-display text-base font-extrabold text-lime shadow-[0_8px_20px_rgba(26,27,22,0.3)]"
              >
                hola
              </div>
            </Html>
          )}
        </group>

        {/* ===== arms (two-segment) ===== */}
        <Arm shoulder={lSh} elbow={lEl} color={SLEEVE_L} x={-0.62} />
        <Arm shoulder={rSh} elbow={rEl} color={SLEEVE_R} x={0.62} />

        {/* ===== behavior props ===== */}
        {/* book */}
        <group ref={book} position={[0, 1.44, 0.72]} scale={0}>
          {/* cover — warm red so it reads clearly against the dark character */}
          <mesh rotation={[Math.PI / 2.6, 0, 0]}>
            <boxGeometry args={[0.78, 0.58, 0.07]} />
            <meshStandardMaterial color="#bf3f3f" roughness={0.7} />
          </mesh>
          {/* pages */}
          <mesh position={[0, 0.03, 0.035]} rotation={[Math.PI / 2.6, 0, 0]}>
            <boxGeometry args={[0.68, 0.50, 0.04]} />
            <meshStandardMaterial color={PAPER} />
          </mesh>
          {/* spine line */}
          <mesh position={[0, 0.06, 0.045]} rotation={[Math.PI / 2.6, 0, 0]}>
            <boxGeometry args={[0.012, 0.50, 0.05]} />
            <meshStandardMaterial color="#bdbfa8" />
          </mesh>
        </group>

        {/* laptop on the lap */}
        <group ref={laptop} position={[0, 1.16, 0.65]} scale={0}>
          {/* keyboard base — flat horizontal slab */}
          <mesh>
            <boxGeometry args={[0.76, 0.04, 0.54]} />
            <meshStandardMaterial color="#2a2b22" roughness={0.8} />
          </mesh>
          {/* touchpad detail */}
          <mesh position={[0, 0.025, 0.1]}>
            <boxGeometry args={[0.26, 0.01, 0.16]} />
            <meshStandardMaterial color="#222318" roughness={0.6} />
          </mesh>
          {/* screen — hinges from back edge, angled up toward viewer (L-shape) */}
          <mesh ref={screen} position={[0, 0.24, -0.19]} rotation={[0.52, 0, 0]}>
            <boxGeometry args={[0.70, 0.46, 0.025]} />
            <meshStandardMaterial color="#0a0b08" emissive={LIME} emissiveIntensity={0.6} />
          </mesh>
          {/* screen bezel / lid back */}
          <mesh position={[0, 0.235, -0.205]} rotation={[0.52, 0, 0]}>
            <boxGeometry args={[0.76, 0.52, 0.018]} />
            <meshStandardMaterial color="#1a1b12" roughness={0.75} />
          </mesh>
        </group>

        {/* music notes */}
        <group ref={notes} position={[0.2, 2.7, 0.2]} scale={0}>
          {[0, 1, 2].map((i) => (
            <mesh key={i}>
              <sphereGeometry args={[0.07, 12, 12]} />
              <meshStandardMaterial color={LIME} emissive={LIME} emissiveIntensity={0.7} transparent opacity={1} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

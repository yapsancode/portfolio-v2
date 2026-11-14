/**
 * Olympus sound effects, made by the browser (Web Audio): no sound files.
 * Every sound is a short beep (a tone that slides) and/or a puff of noise.
 */

export type SoundName =
  | "shot"
  | "hit"
  | "rock"
  | "windowCrash"
  | "iconBreak"
  | "shipLost"
  | "rumble"
  | "statueHit"
  | "throwWarn"
  | "laserCharge"
  | "laserFire"
  | "crumble"
  | "win";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;
let volume = 1;

/** Browsers only allow sound after a click or key press: call this from one. */
export function unlockSound() {
  try {
    if (!ctx) {
      ctx = new AudioContext();
      master = ctx.createGain();
      master.gain.value = 0.5 * volume;
      master.connect(ctx.destination);
      noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    // No Web Audio: the game is just silent.
  }
}

/** 0 → 1. Follows the Music player's volume slider. */
export function setSoundVolume(value: number) {
  volume = value;
  if (master) master.gain.value = 0.5 * value;
}

function tone(type: OscillatorType, from: number, to: number, seconds: number, gain: number, delay = 0) {
  if (!ctx || !master) return;
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(to, t + seconds);
  amp.gain.setValueAtTime(gain, t);
  amp.gain.exponentialRampToValueAtTime(0.001, t + seconds);
  osc.connect(amp).connect(master);
  osc.start(t);
  osc.stop(t + seconds);
}

function noise(seconds: number, gain: number, cutoff: number, delay = 0) {
  if (!ctx || !master || !noiseBuffer) return;
  const t = ctx.currentTime + delay;
  const src = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const amp = ctx.createGain();
  src.buffer = noiseBuffer;
  src.loop = true;
  filter.type = "lowpass";
  filter.frequency.value = cutoff;
  amp.gain.setValueAtTime(gain, t);
  amp.gain.exponentialRampToValueAtTime(0.001, t + seconds);
  src.connect(filter).connect(amp).connect(master);
  src.start(t);
  src.stop(t + seconds);
}

const SOUNDS: Record<SoundName, () => void> = {
  shot: () => tone("square", 880, 220, 0.08, 0.1),
  hit: () => tone("square", 240, 120, 0.05, 0.12),
  rock: () => noise(0.14, 0.3, 1400),
  // The Windows "error" feeling: two flat notes and a thud.
  windowCrash: () => {
    tone("square", 440, 435, 0.28, 0.14);
    tone("square", 349, 345, 0.28, 0.14);
    noise(0.35, 0.35, 700);
  },
  iconBreak: () => {
    tone("triangle", 700, 160, 0.16, 0.25);
    noise(0.1, 0.2, 3000);
  },
  shipLost: () => {
    tone("sawtooth", 440, 50, 0.55, 0.22);
    noise(0.45, 0.4, 900);
  },
  rumble: () => {
    noise(2.6, 0.9, 140);
    tone("sine", 60, 38, 2.6, 0.5);
  },
  statueHit: () => {
    noise(0.07, 0.3, 2200);
    tone("triangle", 170, 110, 0.07, 0.2);
  },
  throwWarn: () => tone("square", 330, 495, 0.14, 0.1),
  laserCharge: () => tone("sawtooth", 180, 1300, 1.3, 0.07),
  laserFire: () => {
    tone("sawtooth", 1500, 260, 0.5, 0.2);
    noise(0.5, 0.25, 5000);
  },
  crumble: () => {
    noise(2, 0.9, 500);
    tone("sine", 90, 30, 1.8, 0.5);
  },
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone("square", f, f, 0.16, 0.12, i * 0.13)),
};

export function playSound(name: SoundName) {
  if (!ctx || volume <= 0) return;
  try {
    SOUNDS[name]();
  } catch {
    // A sound that fails must never stop the game.
  }
}

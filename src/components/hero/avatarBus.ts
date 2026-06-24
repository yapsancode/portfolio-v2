/**
 * Tiny event bus to trigger the 3D character's animation states by name.
 *
 * Usage from anywhere (e.g. an onClick handler):
 *   import { playAvatarBehavior } from "@/components/hero/avatarBus";
 *   playAvatarBehavior("reading");
 *
 * Or from the browser console (exposed in dev by Character3D):
 *   window.playAvatarBehavior("coding")
 *
 * Names: "idle" | "wave" | "reading" | "coding" | "music".
 * "idle" returns the character to cursor-follow / auto-idle behavior.
 */

export type AvatarBehavior = "idle" | "wave" | "reading" | "coding" | "music";

type Listener = (behavior: AvatarBehavior) => void;
const listeners = new Set<Listener>();

export function playAvatarBehavior(behavior: AvatarBehavior) {
  listeners.forEach((l) => l(behavior));
}

export function onAvatarBehavior(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

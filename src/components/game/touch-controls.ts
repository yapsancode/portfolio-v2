export type StickVector = { x: number; y: number };

/** Primary touch input identifies phones/tablets, not narrow desktop windows. */
export function usesTouchControls(): boolean {
  return window.matchMedia("(pointer: coarse)").matches;
}

/** `touch` is the fight's touch decision, so the answer cannot change mid-fight. */
export function isPhoneTouchDevice(touch: boolean): boolean {
  return touch && Math.min(window.innerWidth, window.innerHeight) <= 600;
}

export function joystickVector(x: number, y: number, radius: number): StickVector {
  // A box that is not laid out yet has no radius: no steering instead of NaN.
  if (!(radius > 0)) return { x: 0, y: 0 };
  const distance = Math.hypot(x, y);
  const magnitude = Math.min(1, distance / radius);
  const deadZone = 0.14;
  if (magnitude <= deadZone) return { x: 0, y: 0 };
  const strength = (magnitude - deadZone) / (1 - deadZone);
  return { x: (x / distance) * strength, y: (y / distance) * strength };
}

/** A finger on the joystick box: steering, and where to draw the thumb. Full speed at the ring edge. */
export function stickFromBox(clientX: number, clientY: number, box: { left: number; top: number; width: number; height: number }) {
  const radius = box.width * 0.45;
  const x = clientX - box.left - box.width / 2;
  const y = clientY - box.top - box.height / 2;
  const distance = Math.hypot(x, y);
  const scale = distance > radius ? radius / distance : 1;
  return { vector: joystickVector(x, y, radius), thumb: { x: x * scale, y: y * scale } };
}

export type StickVector = { x: number; y: number };

/** Primary touch input identifies phones/tablets, not narrow desktop windows. */
export function usesTouchControls(): boolean {
  return window.matchMedia("(pointer: coarse)").matches;
}

export function joystickVector(x: number, y: number, radius: number): StickVector {
  const distance = Math.hypot(x, y);
  const magnitude = Math.min(1, distance / radius);
  const deadZone = 0.14;
  if (magnitude <= deadZone) return { x: 0, y: 0 };
  const strength = (magnitude - deadZone) / (1 - deadZone);
  return { x: (x / distance) * strength, y: (y / distance) * strength };
}

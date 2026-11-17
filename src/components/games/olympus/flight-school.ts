// Flight School: level 1 tips, one at a time. Each step waits for one kind of event.
// "steer" is not a game event: OlympusGame sends it on the first turn, thrust or stick push.
const WAITS_FOR: readonly (readonly string[])[] = [
  ["steer"],
  ["rockBroken", "iconDestroyed", "windowHit"],
  ["statueAwake"],
  ["statueHit"],
];
const FIRST_BOSS_STEP = 2;

/** The step after this one: equal to LESSON_DONE when the lesson has ended. */
export const LESSON_DONE = WAITS_FOR.length;

export function nextLessonStep(step: number, type: string): number {
  const at = WAITS_FOR.findIndex((types, i) => i >= step && types.includes(type));
  // Boss events may skip ahead, so an old tip never stays up during the fight.
  return at === step || at >= FIRST_BOSS_STEP ? at + 1 : step;
}

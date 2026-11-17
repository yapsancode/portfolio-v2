// Run with: node --test scripts/olympus-flight-school.test.mjs
import assert from "node:assert/strict";
import { test } from "node:test";
import { loadTs } from "./load-ts.mjs";
const { nextLessonStep, LESSON_DONE } = loadTs("src/components/games/olympus/flight-school.ts");
const run = (types, step = 0) => types.reduce(nextLessonStep, step);

test("each tip waits for its own action, in order", () => {
  assert.equal(LESSON_DONE, 4);
  assert.equal(run(["steer"]), 1);
  for (const hit of ["rockBroken", "iconDestroyed", "windowHit"]) assert.equal(run(["steer", hit]), 2);
  assert.equal(run(["steer", "rockBroken", "statueAwake"]), 3);
  assert.equal(run(["steer", "rockBroken", "statueAwake", "statueHit"]), LESSON_DONE);
});

test("unrelated events and early hits never move the lesson", () => {
  assert.equal(run(["shot", "shipLost", "rockBroken", "windowHit"]), 0);
  assert.equal(run(["steer", "steer", "shot", "bossStage"], 1), 1);
  assert.equal(run(["steer", "statueAwake", "statueHit"], LESSON_DONE), LESSON_DONE);
});

test("boss events skip a stale tip", () => {
  assert.equal(run(["statueAwake"]), 3);
  assert.equal(run(["statueAwake"], 1), 3);
  assert.equal(run(["statueHit"]), LESSON_DONE);
});

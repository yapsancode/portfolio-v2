import assert from "node:assert/strict";
import { test } from "node:test";
import { loadTs } from "./load-ts.mjs";
const { DIALOGUE, createDialogue } = loadTs("src/components/game/dialogue.ts");

test("each playable level has eighteen distinct, short, event-specific lines", () => {
  const all = [];
  for (let level = 1; level <= 6; level++) {
    const pools = DIALOGUE[level];
    assert.equal(Object.keys(pools).length, 6);
    const lines = Object.values(pools).flat();
    assert.equal(new Set(lines).size, 18);
    assert.ok(lines.every(line => line.length <= 65));
    all.push(...lines);
  }
  assert.equal(new Set(all).size, 108);
});

test("shuffle bags use every alternative before repeating and avoid repeat on a new attempt", () => {
  for (let level = 1; level <= 6; level++) {
    const voice = createDialogue(level, () => .4);
    const lines = [0, 6, 12].map(time => voice.line("attack", time));
    assert.equal(new Set(lines).size, 3);
    const next = voice.line("attack", 18);
    assert.notEqual(next, lines[2]);
    assert.notEqual(createDialogue(level, () => .4).line("attack", 0), next);
  }
});

test("hit spam cannot replace entrances or flood bubbles; simulation time controls expiry", () => {
  const voice = createDialogue(2);
  const entrance = voice.line("entrance", 10);
  for (let i = 0; i < 100; i++) {
    assert.equal(voice.line("hurt", 10 + i * .01), null);
    assert.equal(voice.visible(10), entrance); // Paused simulation does not expire speech.
  }
  assert.equal(voice.visible(13.3), null);
  assert.equal(voice.line("hurt", 14), null);
  assert.ok(voice.line("attack", 15));
});

test("defeat takes priority and every level uses its own voice", () => {
  for (let level = 1; level <= 6; level++) {
    const voice = createDialogue(level);
    voice.line("entrance", 0);
    const defeat = voice.line("defeat", 1);
    assert.ok(DIALOGUE[level].defeat.includes(defeat));
    assert.equal(voice.line("attack", 2), null);
    assert.equal(voice.visible(2), defeat);
  }
});

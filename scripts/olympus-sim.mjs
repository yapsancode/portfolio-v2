import assert from "node:assert/strict";
import { loadRules } from "./olympus-test-utils.mjs";
import { solve } from "./olympus-solver.mjs";
const g = loadRules();
let count = 0, lengths = [];
for (let board = 0; board < g.BOARD_COUNT; board++) {
  for (let variant = 0; variant < 4; variant++) {
    for (const seed of [1, 7, 42, 2026]) {
      let state = g.createGame(board, variant, seed);
      const path = solve(g, state);
      assert.ok(path, "No winning route: board " + board + ", variant " + variant + ", seed " + seed);
      for (const direction of path) {
        state = g.move(state, direction).game;
        if (state.phase === "playing") {
          const landings = g.DIRECTIONS.map(d => g.slide(state, d).at(-1)).filter(n => n !== undefined);
          assert.ok(landings.some(n => !state.warning.includes(n)), "Unavoidable hit");
        }
      }
      assert.equal(state.phase, "won");
      lengths.push(path.length); count++;
    }
  }
}
console.log("PASS " + count + " board / mirror / attack-seed combinations solved with real damage.");
console.log("Winning routes: " + Math.min(...lengths) + "–" + Math.max(...lengths) + " swipes (solver, not a human playtime estimate).");

let state = g.createGame();
assert.equal(g.move(state, "down").game, state, "Wall bumps do not consume turns");
const first = g.move(state, "right");
assert.ok(first.smashed.length > 0);
assert.equal(first.game.hearts, 3);
assert.deepEqual(first.game.warning, []);
assert.deepEqual(g.move(state, "right"), first, "Deterministic replay");
state = { ...g.createGame(), position: 25, warning: [26, 27], remaining: [26, 27, 28, 0] };
assert.equal(g.move(state, "right").hit, false, "Crossing a warning is safe");
state.warning = [29];
assert.equal(g.move(state, "right").game.hearts, 2, "Landing loses exactly one heart");
state.remaining = [26, 27, 28];
state.hearts = 1;
const won = g.move(state, "right").game;
assert.equal(won.phase, "won", "Final smash cancels retaliation");
assert.equal(won.hearts, 1);
assert.equal(g.move(won, "left").game, won);
assert.equal(g.swipeDirection(17, 0), null);
assert.equal(g.swipeDirection(30, 29), null);
assert.equal(g.swipeDirection(-25, 4), "left");
const session = g.credit({ ...g.emptySession(), game: won });
assert.equal(g.credit(session).profile.completed.length, 1);
assert.deepEqual(g.parseSession(JSON.stringify(session)), session);
assert.equal(g.parseSession("{broken").game, null);
assert.equal(g.parseSession(JSON.stringify({ ...session, game: { ...won, position: 90 } })).game, null);
assert.equal(g.parseSession(JSON.stringify({ ...session, game: { ...won, position: 90 } })).profile.completed.length, 1);
assert.equal(g.parseSession(JSON.stringify({ ...session, version: 99 })).game, null);
for (const d of g.DIRECTIONS) {
  const moved = g.move({ ...first.game, remaining: [12], warning: [] }, d);
  if (!moved.smashed.length) assert.equal(moved.game.score, first.game.score, "Empty movement earns no score");
}
console.log("PASS turn ordering, input, deterministic replay, scoring, terminal state and save validation.");


import assert from "node:assert/strict";
import { test } from "node:test";
import { loadTs } from "./load-ts.mjs";
const { emptyResources, collectMarble, parseResources, purchaseRefit, refitAllowances, refitCost } = loadTs("src/lib/olympus/resources.ts");
const { progressAt, parseProgress } = loadTs("src/lib/olympus/levels.ts");
const client = loadTs("src/lib/olympus/client.ts");
const { createWorld, createStatue, seededRandom, step, TUNING } = loadTs("src/components/game/olympus.ts");
const { missionInfo } = loadTs("src/lib/olympus/missions.ts");

test("marble banks across wins and losses; legacy guest saves start with an empty bank", () => {
  const old = { version: 1, highestCompletedLevel: 2, resumeLevel: 3, completed: false, epoch: null };
  assert.deepEqual(parseProgress(old).resources, emptyResources(2));
  const won = client.finishGuestAttempt(progressAt(), { score: 12000, durationMs: 60000, outcome: "won" });
  const lost = client.finishGuestAttempt(won, { score: 500, durationMs: 60000, outcome: "lost" });
  assert.equal(lost.resumeLevel, 2);
  assert.equal(lost.resources.marble, 12500);
  assert.equal(lost.resources.lifetimeMarble, 12500);
  assert.equal(lost.resources.furthestLevel, 1);
  for (const patch of [{ marble: -1 }, { marble: 1.2 }, { lifetimeMarble: 100 }, { furthestLevel: 101 }, { upgrades: { hull: 99 } }]) {
    assert.throws(() => parseResources({ ...lost.resources, ...patch }));
  }
});

test("refits unlock once per ten distinct cleared levels, charge the bank, and preserve lifetime haul", () => {
  let bank = collectMarble(emptyResources(), 100000, 9);
  assert.equal(refitAllowances(bank), 0);
  assert.throws(() => purchaseRefit(bank, "hull"));
  bank = collectMarble(bank, 0, 10);
  assert.equal(refitAllowances(bank), 1);
  assert.equal(refitCost(bank), 10000);
  bank = purchaseRefit(bank, "hull");
  assert.equal(bank.marble, 90000); assert.equal(bank.lifetimeMarble, 100000);
  assert.equal(refitAllowances(collectMarble(bank, 0, 10)), 0);
  assert.throws(() => purchaseRefit(bank, "shield"));
  bank = collectMarble(bank, 0, 20);
  assert.equal(refitCost(bank), 20000);
  bank = purchaseRefit(bank, "blaster");
  assert.equal(bank.marble, 70000);
  assert.equal(bank.upgrades.blaster, 1);
  assert.throws(() => purchaseRefit({ ...bank, marble: 0, furthestLevel: 30 }, "shield"));
  assert.throws(() => purchaseRefit({ ...bank, furthestLevel: 100, upgrades: { hull: 3, blaster: 1, shield: 0 } }, "hull"));
});

test("guest reload and Start Over preserve marble and upgrades; blocked storage cannot report a refit", async () => {
  const store = new Map();
  const previous = globalThis.localStorage;
  globalThis.localStorage = { getItem: key => store.get(key) ?? null, setItem: (key, value) => store.set(key, value) };
  try {
    const saved = progressAt(6, null, collectMarble(emptyResources(), 50000, 10));
    client.saveGuest(saved);
    const refitted = await client.refitShip(client.guestProgress().progress, "shield");
    assert.equal(refitted.resources.marble, 40000);
    assert.equal(client.guestProgress().progress.resources.upgrades.shield, 1);
    const reset = await client.startOver(refitted);
    assert.equal(reset.resumeLevel, 1);
    assert.deepEqual(reset.resources, refitted.resources);
    assert.deepEqual(client.guestProgress().progress, reset);
    client.saveGuest(progressAt(0, null, collectMarble(emptyResources(), 50000, 10)));
    globalThis.localStorage.setItem = () => { throw new Error("blocked"); };
    await assert.rejects(client.refitShip(client.guestProgress().progress, "hull"));
    assert.equal(client.guestProgress().progress.resources.upgrades.hull, 0);
  } finally { globalThis.localStorage = previous; }
});

test("ship upgrades change lives, fire cooldown and respawn protection without changing movement", () => {
  const neutral = { left: false, right: false, thrust: false, fire: false };
  const make = upgrades => createWorld({ w: 4000, h: 3000, statue: createStatue({ x: 3000, y: 2500, w: 100, h: 200 }, 1, 1, [1]), random: seededRandom(42), upgrades });
  const base = make();
  const upgraded = make({ hull: 2, blaster: 4, shield: 3 });
  assert.equal(upgraded.lives, base.lives + 2);
  for (const world of [base, upgraded]) step(world, { ...neutral, thrust: true, fire: true }, 1 / 60);
  assert.equal(base.ship.vy, upgraded.ship.vy);
  assert.ok(Math.abs(upgraded.fireIn - 0.12) < 1e-10);
  upgraded.ship.alive = false; upgraded.ship.respawn = 0;
  step(upgraded, neutral, 1 / 60);
  assert.equal(upgraded.ship.safe, TUNING.ship.safeTime + 1.5);
});

test("all six missions have distinct briefings, victory and retry wording", () => {
  for (const field of ["briefing", "victory", "retry"]) {
    const lines = Array.from({ length: 6 }, (_, i) => missionInfo(i + 1)[field]);
    assert.equal(new Set(lines).size, 6);
    assert.ok(lines.every(line => line.length < 115));
  }
});

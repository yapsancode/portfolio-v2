import assert from "node:assert/strict";
import { test } from "node:test";
import { loadTs } from "./load-ts.mjs";
const { emptyResources, collectMarble, parseResources, purchaseRefit, refitAllowances, refitCost } = loadTs("src/lib/games/olympus/resources.ts");
const { progressAt, parseProgress } = loadTs("src/lib/games/olympus/levels.ts");
const client = loadTs("src/lib/games/olympus/client.ts");
const { createWorld, createStatue, seededRandom, step, TUNING } = loadTs("src/components/games/olympus/olympus.ts");
const { missionInfo } = loadTs("src/lib/games/olympus/missions.ts");

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

test("guest reload and Start Over preserve marble; refits wait for a real level 10; blocked storage cannot report a refit", async () => {
  const store = new Map();
  const previous = globalThis.localStorage;
  globalThis.localStorage = { getItem: key => store.get(key) ?? null, setItem: (key, value) => store.set(key, value) };
  try {
    // A level 10 milestone is capped to this version's last level, so it earns no refit yet.
    client.saveGuest(progressAt(6, null, collectMarble(emptyResources(), 50000, 10)));
    await assert.rejects(client.refitShip(client.guestProgress().progress, "shield"));
    const loaded = client.guestProgress().progress;
    assert.equal(loaded.resources.furthestLevel, 6);
    const reset = await client.startOver(loaded);
    assert.equal(reset.resumeLevel, 1);
    assert.deepEqual(reset.resources, loaded.resources);
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

function withStorage(fn) {
  const store = new Map();
  const previous = globalThis.localStorage;
  globalThis.localStorage = { getItem: key => store.get(key) ?? null, setItem: (key, value) => store.set(key, String(value)) };
  return Promise.resolve().then(() => fn(store)).finally(() => { globalThis.localStorage = previous; });
}
const GUEST_KEY = "isyraf98:olympus-progress:v1";

test("a named player cannot start the level clock without a ticket; guests need none", () => {
  const epoch = "00000000-0000-4000-8000-000000000000";
  assert.equal(client.attemptBlocker(null, { ticket: null, error: "Guest play" }), null);
  assert.equal(client.attemptBlocker(epoch, { ticket: { token: "t", level: 1, upgrades: {} }, error: null }), null);
  assert.equal(client.attemptBlocker(epoch, { ticket: null, error: "Too many attempts." }), "Too many attempts.");
  assert.ok(client.attemptBlocker(epoch, null));
});

test("server haul limits mirror the real game's tuning, desktop and fastest blaster", () => {
  const { HAUL } = loadTs("src/lib/games/olympus/leaderboard.ts");
  const { desktopIcons, windowDefaults } = loadTs("src/config/site.ts");
  const { UPGRADES } = loadTs("src/lib/games/olympus/resources.ts");
  assert.deepEqual(HAUL, {
    guardianHp: TUNING.statue.hp, powersHp: TUNING.powers.hp, hitScore: TUNING.statue.hitScore, crumbleScore: TUNING.statue.crumbleScore,
    windows: Object.keys(windowDefaults).length, windowHp: TUNING.window.hp, windowHitScore: TUNING.window.hitScore,
    windowCrashScore: TUNING.window.crashScore, icons: desktopIcons.length, iconScore: TUNING.icon.score,
    shotScore: Math.max(...TUNING.rock.score, TUNING.statue.pokeScore, TUNING.window.hitScore),
    fastestShotMs: HAUL.fastestShotMs, bulletLifeMs: TUNING.bullet.life * 1000,
    awakenMs: (TUNING.awakenFreeze + TUNING.awakenTime) * 1000, crumbleMs: TUNING.crumbleTime * 1000,
  });
  const fastest = createWorld({ w: 4000, h: 3000, statue: createStatue({ x: 3000, y: 2500, w: 100, h: 200 }, 1, 1, [1]),
    random: seededRandom(1), upgrades: { hull: 0, blaster: UPGRADES.blaster.max, shield: 0 } });
  step(fastest, { left: false, right: false, thrust: false, fire: true }, 1 / 60);
  assert.ok(Math.abs(fastest.fireIn * 1000 - HAUL.fastestShotMs) < 1e-6);
});

test("two guest tabs add their hauls to the stored save instead of overwriting it", () => withStorage(async () => {
  const loaded = client.guestProgress().progress; // both tabs load the same empty save
  client.saveGuestAttempt(loaded, { score: 20000, durationMs: 60000, outcome: "won" });
  const b = client.saveGuestAttempt(loaded, { score: 3000, durationMs: 30000, outcome: "lost" });
  for (const saved of [b.progress, client.guestProgress().progress]) {
    assert.equal(saved.resumeLevel, 2);
    assert.equal(saved.resources.marble, 23000);
  }
  // A stale tab plays from the newer save, and Start Over resets only the level, keeping the stored bank.
  assert.equal(client.latestGuest(loaded).resumeLevel, 2);
  const reset = await client.startOver(loaded);
  assert.equal(reset.resumeLevel, 1);
  assert.equal(reset.resources.marble, 23000);
  assert.deepEqual(client.guestProgress().progress, reset);
}));

test("an unreadable guest save is backed up before anything overwrites it", () => withStorage(store => {
  for (const raw of ["{", JSON.stringify({ version: 2, marble: 5 })]) {
    store.set(GUEST_KEY, raw);
    const read = client.guestProgress();
    assert.equal(read.progress.resumeLevel, 1);
    assert.equal(store.get(client.GUEST_BACKUP_KEY), raw);
    client.saveGuestAttempt(read.progress, { score: 500, durationMs: 9000, outcome: "lost" });
    assert.equal(store.get(client.GUEST_BACKUP_KEY), raw);
  }
  assert.match(client.guestProgress().notice, /Guest progress stays/);
  store.set(GUEST_KEY, JSON.stringify({ version: 2 }));
  assert.match(client.guestProgress().notice, /newer version.*Refresh/);
}));

test("guest saves from a newer catalogue keep the bank, capped to this version's levels", () => withStorage(store => {
  store.set(GUEST_KEY, JSON.stringify({ version: 1, highestCompletedLevel: 8, resumeLevel: 9, completed: false, epoch: null,
    resources: { marble: 50000, lifetimeMarble: 60000, furthestLevel: 8, upgrades: { hull: 0, blaster: 0, shield: 0 } } }));
  const read = client.guestProgress();
  assert.match(read.notice, /newer version.*Refresh/);
  assert.equal(read.progress.highestCompletedLevel, 6); assert.equal(read.progress.resumeLevel, 6);
  assert.equal(read.progress.resources.marble, 50000); assert.equal(read.progress.resources.furthestLevel, 6);
  // A tampered milestone cannot unlock refits that need level 10.
  store.set(GUEST_KEY, JSON.stringify({ ...read.progress, resources: { ...read.progress.resources, furthestLevel: 100 } }));
  assert.equal(client.guestProgress().progress.resources.furthestLevel, 6);
  assert.equal(refitAllowances(client.guestProgress().progress.resources), 0);
}));

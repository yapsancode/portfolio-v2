export const UPGRADE_INTERVAL = 10;
export const UPGRADE_BASE_COST = 10_000;
export const UPGRADES = {
  hull: { name: "Extra life", description: "+1 starting life", max: 3 },
  blaster: { name: "Rapid fire", description: "Fire 0.02 seconds sooner", max: 4 },
  shield: { name: "Recovery shield", description: "+0.5 seconds of protection after a hit", max: 4 },
} as const;
export type Upgrade = keyof typeof UPGRADES;
export type Upgrades = Record<Upgrade, number>;
export type Resources = { marble: number; lifetimeMarble: number; furthestLevel: number; upgrades: Upgrades };

export function emptyResources(furthestLevel = 0): Resources {
  return { marble: 0, lifetimeMarble: 0, furthestLevel, upgrades: { hull: 0, blaster: 0, shield: 0 } };
}
export function upgradeCount(resources: Resources) {
  return resources.upgrades.hull + resources.upgrades.blaster + resources.upgrades.shield;
}
export function refitCost(resources: Resources) { return UPGRADE_BASE_COST * (upgradeCount(resources) + 1); }
export function refitAllowances(resources: Resources) {
  return Math.max(0, Math.floor(resources.furthestLevel / UPGRADE_INTERVAL) - upgradeCount(resources));
}
export function isUpgrade(value: unknown): value is Upgrade {
  return typeof value === "string" && Object.hasOwn(UPGRADES, value);
}
export function parseResources(value: unknown): Resources {
  if (!value || typeof value !== "object") throw new Error("Your marble bank could not be read.");
  const r = value as Resources;
  if (!Number.isSafeInteger(r.marble) || r.marble < 0 || !Number.isSafeInteger(r.lifetimeMarble) || r.lifetimeMarble < r.marble ||
      !Number.isInteger(r.furthestLevel) || r.furthestLevel < 0 || r.furthestLevel > 100 || !r.upgrades ||
      (Object.keys(UPGRADES) as Upgrade[]).some(key => !Number.isInteger(r.upgrades[key]) || r.upgrades[key] < 0 || r.upgrades[key] > UPGRADES[key].max) ||
      upgradeCount(r) > Math.floor(r.furthestLevel / UPGRADE_INTERVAL)) {
    throw new Error("Your marble bank is not valid. Reload your save.");
  }
  return { marble: r.marble, lifetimeMarble: r.lifetimeMarble, furthestLevel: r.furthestLevel,
    upgrades: { hull: r.upgrades.hull, blaster: r.upgrades.blaster, shield: r.upgrades.shield } };
}

/** Guest-only calculation. Named players use the atomic server update. */
export function collectMarble(resources: Resources, amount: number, clearedLevel: number): Resources {
  return parseResources({ ...resources, marble: resources.marble + amount,
    lifetimeMarble: resources.lifetimeMarble + amount, furthestLevel: Math.max(resources.furthestLevel, clearedLevel) });
}
export function purchaseRefit(resources: Resources, upgrade: Upgrade): Resources {
  if (!refitAllowances(resources)) throw new Error("Clear level 10, 20, 30 and beyond to earn a refit.");
  if (resources.upgrades[upgrade] >= UPGRADES[upgrade].max) throw new Error("That upgrade is already at its maximum.");
  const cost = refitCost(resources);
  if (resources.marble < cost) throw new Error(`Collect ${cost.toLocaleString("en")} marble for this refit.`);
  return parseResources({ ...resources, marble: resources.marble - cost,
    upgrades: { ...resources.upgrades, [upgrade]: resources.upgrades[upgrade] + 1 } });
}

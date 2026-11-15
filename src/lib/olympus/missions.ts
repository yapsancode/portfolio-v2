const MISSIONS = [
  { briefing: "Earth needs its first shipment. Unfortunately, the marble has an owner.",
    victory: "First shipment secured. The rebuilding begins.", retry: "Earth is still waiting. Repair the ship and try again." },
  { briefing: "Earth requested a bulk delivery. The guardian took that personally.",
    victory: "Swarm collected. Construction crews send their thanks.", retry: "The delivery fought back. Your next shipment is still out there." },
  { briefing: "Our orbital station needs repairs. That halo looks suspiciously useful.",
    victory: "Halo recovered. Earth's orbital repairs can begin.", retry: "The station can wait a little longer. Find the gap and return." },
  { briefing: "Supply reserves are running low. Today's forecast: falling resources.",
    victory: "Storm survived. Earth's stockpiles are filling up.", retry: "Caught in the storm. Regroup before the next marble shower." },
  { briefing: "Our supply ships need stronger hulls. His armour might fit.",
    victory: "Armour salvaged. The next fleet will travel safer.", retry: "His armour held this time. Break an opening on your next attempt." },
  { briefing: "Earth needs a new navigation beacon. He seems rather attached to the light.",
    victory: "Shipment secured. A little of his brilliance will guide ships home.", retry: "That was too much brilliance. Watch the return sweep next time." },
] as const;

export function missionInfo(level: number) { return MISSIONS[level - 1] ?? MISSIONS[0]; }

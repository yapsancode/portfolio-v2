"use client";

import { useState } from "react";
import { LAST_LEVEL, type Progress } from "@/lib/olympus/levels";
import { refitShip } from "@/lib/olympus/client";
import { UPGRADES, UPGRADE_INTERVAL, refitAllowances, refitCost, upgradeCount, type Upgrade } from "@/lib/olympus/resources";

export default function MarbleBank({ progress, onChange }: { progress: Progress; onChange: (progress: Progress) => void }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const resources = progress.resources;
  const allowances = refitAllowances(resources);
  const cost = refitCost(resources);
  const nextMilestone = (Math.floor(resources.furthestLevel / UPGRADE_INTERVAL) + 1) * UPGRADE_INTERVAL;
  const purchased = upgradeCount(resources);
  return <section className="olympus-marble-bank" aria-label="Marble bank and ship refits">
    <p className="olympus-bank-total">MARBLE BANK <strong>{resources.marble.toLocaleString("en")}</strong></p>
    <p className="olympus-scores-note">Bank marble when you finish an attempt, even if you lose. Leaving early does not bank this attempt.</p>
    {purchased > 0 && <p className="olympus-scores-note">Ship: {3 + resources.upgrades.hull} lives · fire every {(0.2 - resources.upgrades.blaster * 0.02).toFixed(2)}s · {2 + resources.upgrades.shield * 0.5}s protection</p>}
    {allowances > 0 ? <>
      <p>{allowances} refit{allowances === 1 ? "" : "s"} available · Next upgrade: {cost.toLocaleString("en")} marble</p>
      <div className="olympus-refit-options">
        {(Object.entries(UPGRADES) as [Upgrade, typeof UPGRADES[Upgrade]][]).map(([key, upgrade]) => <button
          key={key} type="button" className="olympus-button" disabled={busy || resources.marble < cost || resources.upgrades[key] >= upgrade.max}
          onClick={async () => {
            if (busy) return;
            setBusy(true); setMessage("");
            try {
              onChange(await refitShip(progress, key));
              setMessage(`${upgrade.name} installed. Ready for your next attempt.`);
            } catch (error) { setMessage(error instanceof Error ? error.message : "Refit failed. Go back and reload your bank."); }
            finally { setBusy(false); }
          }}>
          <span>{upgrade.name} · {resources.upgrades[key]}/{upgrade.max}</span><small>{upgrade.description}</small>
        </button>)}
      </div>
      {resources.marble < cost && <p className="olympus-scores-note">Collect {(cost - resources.marble).toLocaleString("en")} more marble, or keep playing and refit later.</p>}
    </> : <p className="olympus-scores-note">{nextMilestone <= 100 ? `Next refit after clearing level ${nextMilestone}. One upgrade choice every 10 levels.` : "All ten refit milestones used."}</p>}
    {LAST_LEVEL < UPGRADE_INTERVAL && <p className="olympus-scores-note">Levels 1–{LAST_LEVEL} are playable now. Save marble for the level 10 expansion.</p>}
    {busy && <p role="status">Installing upgrade...</p>}
    {message && <p role="status">{message}</p>}
  </section>;
}

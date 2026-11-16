"use client";

import { useState } from "react";
import { startOver } from "@/lib/games/olympus/client";
import type { Progress } from "@/lib/games/olympus/levels";

export default function StartOver({ progress, onReset }: { progress: Progress; onReset: (progress: Progress) => void }) {
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!confirm) return <button type="button" className="olympus-score-link" onClick={() => setConfirm(true)}>Start Over</button>;
  return <div className="olympus-reset" role="group" aria-label="Confirm Start Over" onKeyDown={(event) => {
    if (event.key === "Escape" || event.key === "Enter") event.stopPropagation();
    if (event.key === "Escape" && !busy) setConfirm(false);
  }}>
    <p>Start again at level 1? Your saved level progress will reset. Your marble bank, upgrades and best haul will stay.</p>
    <div className="olympus-actions">
      <button type="button" className="olympus-button" autoFocus disabled={busy} onClick={() => setConfirm(false)}>Cancel</button>
      <button type="button" className="olympus-button olympus-button-primary" disabled={busy} onClick={async () => {
        setBusy(true); setError("");
        try {
          const reset = await startOver(progress);
          setConfirm(false); onReset(reset);
        } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not reset. Try again."); }
        finally { setBusy(false); }
      }}>{busy ? "Resetting..." : "Start Over"}</button>
    </div>
    {error && <p role="status">{error}</p>}
  </div>;
}

"use client";

import { useEffect, useRef, useState } from "react";
import type { Progress } from "@/lib/games/olympus/levels";
import type { ScoreSubmission } from "@/lib/games/olympus/client";
import HighScores from "./HighScores";
import ShareScore from "./ShareScore";

export default function ScoreStatus({ submission, onSaved }: { submission: ScoreSubmission; onSaved: (progress: Progress) => void }) {
  const [status, setStatus] = useState<"saving" | "saved" | "error">("saving");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [showScores, setShowScores] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const shareButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let active = true;
    submission.record().then(
      (progress) => { if (active) { setStatus("saved"); onSaved(progress); } },
      (reason) => { if (active) { setStatus("error"); setError(`This attempt’s marble and progress were not saved. ${reason.message}`); } },
    );
    return () => { active = false; };
  }, [submission, attempt, onSaved]);

  return (
    <div className="olympus-score-entry">
      <p role="status">{status === "saving" ? "Banking your marble and saving your level..." : status === "saved" ? "Marble banked and level saved. Your best haul counts toward the top 10." : error}</p>
      {status === "error" && <button type="button" className="olympus-score-link" onClick={() => {
        setStatus("saving"); setAttempt((value) => value + 1);
      }}>Retry saving</button>}
      <div className="olympus-score-tools">
      {status === "saved" && <button ref={shareButton} type="button" className="olympus-button olympus-button-primary" aria-expanded={showShare} onClick={() => { setShowShare(!showShare); setShowScores(false); }}>Share haul</button>}
      <button type="button" className="olympus-score-link" aria-expanded={showScores} onClick={() => { setShowScores(!showScores); setShowShare(false); }}>
        {showScores ? "Hide top collectors" : "View top collectors"}
      </button>
      </div>
      {showShare && <ShareScore submission={submission} onClose={() => { setShowShare(false); shareButton.current?.focus(); }} />}
      {showScores && <HighScores />}
    </div>
  );
}

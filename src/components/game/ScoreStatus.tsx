"use client";

import { useEffect, useState } from "react";
import type { Progress } from "@/lib/olympus/levels";
import type { ScoreSubmission } from "@/lib/olympus/client";
import HighScores from "./HighScores";

export default function ScoreStatus({ submission, onSaved }: { submission: ScoreSubmission; onSaved: (progress: Progress) => void }) {
  const [status, setStatus] = useState<"saving" | "saved" | "error">("saving");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [showScores, setShowScores] = useState(false);

  useEffect(() => {
    let active = true;
    submission.record().then(
      (progress) => { if (active) { setStatus("saved"); onSaved(progress); } },
      (reason) => { if (active) { setStatus("error"); setError(`This attempt’s score and progress were not saved. ${reason.message}`); } },
    );
    return () => { active = false; };
  }, [submission, attempt, onSaved]);

  return (
    <div className="olympus-score-entry">
      <p role="status">{status === "saving" ? "Saving your score and level..." : status === "saved" ? "Score and level saved. Your best score counts toward the top 10." : error}</p>
      {status === "error" && <button type="button" className="olympus-score-link" onClick={() => {
        setStatus("saving"); setAttempt((value) => value + 1);
      }}>Retry saving</button>}
      <button type="button" className="olympus-score-link" aria-expanded={showScores} onClick={() => setShowScores(!showScores)}>
        {showScores ? "Hide high scores" : "View high scores"}
      </button>
      {showScores && <HighScores />}
    </div>
  );
}

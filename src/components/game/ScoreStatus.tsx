"use client";

import { useEffect, useRef, useState } from "react";
import type { Progress } from "@/lib/olympus/levels";
import type { ScoreSubmission } from "@/lib/olympus/client";
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
      <div className="olympus-score-tools">
      {status === "saved" && <button ref={shareButton} type="button" className="olympus-button olympus-button-primary" aria-expanded={showShare} onClick={() => { setShowShare(!showShare); setShowScores(false); }}>Share score</button>}
      <button type="button" className="olympus-score-link" aria-expanded={showScores} onClick={() => { setShowScores(!showScores); setShowShare(false); }}>
        {showScores ? "Hide high scores" : "View high scores"}
      </button>
      </div>
      {showShare && <ShareScore submission={submission} onClose={() => { setShowShare(false); shareButton.current?.focus(); }} />}
      {showScores && <HighScores />}
    </div>
  );
}

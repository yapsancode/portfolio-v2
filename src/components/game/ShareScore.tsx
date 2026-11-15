"use client";

import { useEffect, useState } from "react";
import type { ScoreSubmission } from "@/lib/olympus/client";
import type { SharedScore } from "@/lib/olympus/sharing";
import ShareActions from "./ShareActions";

export default function ShareScore({ submission, onClose }: { submission: ScoreSubmission; onClose: () => void }) {
  const [score, setScore] = useState<SharedScore | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    submission.share().then(data => { if (active) setScore(data); }, reason => { if (active) setError(reason.message); });
    return () => { active = false; };
  }, [submission, attempt]);

  return (
    <section className="olympus-share-panel" aria-label="Share your score" onKeyDown={event => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); onClose(); }
      // Keep game-over shortcuts from replaying while a link or copy field is focused.
      if (event.key === "Enter") event.stopPropagation();
    }}>
      <div className="olympus-share-heading"><h2>SEND YOUR CHALLENGE</h2>
        <button type="button" className="olympus-share-close" onClick={onClose} aria-label="Close score sharing" autoFocus>×</button>
      </div>
      {score ? <ShareActions score={score} /> : <div className="olympus-share-loading">
        <p role="status">{error || "Retrieving your saved result..."}</p>
        {error && <button className="olympus-score-link" type="button" onClick={() => { setError(""); setAttempt(value => value + 1); }}>Try again</button>}
      </div>}
    </section>
  );
}

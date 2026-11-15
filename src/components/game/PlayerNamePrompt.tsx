"use client";

import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { guestProgress, leaderboardRequest, saveGuest } from "@/lib/olympus/client";
import { levelInfo, parseProgress, progressAt, type Progress } from "@/lib/olympus/levels";
import StartOver from "./StartOver";
import { parseName } from "@/lib/olympus/leaderboard";

export default function PlayerNamePrompt({ onPlay, onBack }: {
  onPlay: (event: MouseEvent<HTMLButtonElement>, progress: Progress) => void;
  onBack: () => void;
}) {
  const [progress, setProgress] = useState<Progress>(progressAt);
  const [notice, setNotice] = useState("");
  const [name, setName] = useState("");
  const [reserved, setReserved] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [offline, setOffline] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const playButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let active = true;
    leaderboardRequest<{ name: string | null; progress: Progress | null }>("player").then((data) => {
      if (!active) return;
      if (data.name) setProgress(parseProgress(data.progress));
      setName(data.name ?? ""); setReserved(Boolean(data.name)); setBusy(false);
    }).catch((reason) => {
      if (!active) return;
      const guest = guestProgress(); setProgress(guest.progress); setNotice(guest.notice);
      setError(reason.message); setOffline(true); setBusy(false);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!busy) (reserved ? playButton.current : input.current)?.focus();
  }, [busy, reserved]);

  const reserve = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    try {
      const chosen = parseName(name);
      setBusy(true); setError("");
      const data = await leaderboardRequest<{ name: string }>("player", "POST", { name: chosen });
      // Confirm the browser retained the ownership cookie before starting play.
      const owner = await leaderboardRequest<{ name: string | null; progress: Progress }>("player");
      if (owner.name !== data.name) throw new Error("Allow cookies to keep your player name, then try again.");
      setProgress(parseProgress(owner.progress));
      setName(data.name); setReserved(true); setOffline(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not reserve your name. Try again.");
    } finally { setBusy(false); }
  };

  const play = (event: MouseEvent<HTMLButtonElement>) => {
    if (!progress.epoch) setNotice(saveGuest(progress));
    onPlay(event, progress);
  };
  const label = progress.completed ? `Replay level ${progress.resumeLevel}`
    : progress.highestCompletedLevel > 0 ? `Continue — Level ${progress.resumeLevel}` : "Play — Level 1";

  return (
    <div className="olympus-title olympus-name-prompt" onKeyDown={(event) => {
      if (event.key === "Escape") { event.stopPropagation(); if (!busy) onBack(); }
    }}>
      <h1 className="olympus-guide-heading">{reserved ? "READY, PLAYER?" : "ENTER YOUR NAME"}</h1>
      {reserved ? (
        <>
          <p className="olympus-player-name">{name}</p>
          <p>{progress.completed ? "All available levels complete." : `Level ${progress.resumeLevel} · ${levelInfo(progress.resumeLevel).name}`}</p>
          <div className="olympus-actions">
            {/* A fresh click keeps fullscreen and sound inside a user gesture. */}
            <button ref={playButton} type="button" className="olympus-button olympus-button-primary" onClick={play}>{label}</button>
            <button type="button" className="olympus-button" onClick={onBack}>Back</button>
          </div>
          <p className="olympus-scores-note">{levelInfo(progress.resumeLevel).hint}</p>
          <p className="olympus-scores-note">Continue starts the level with three lives. Your level and score save to this player.</p>
          {progress.highestCompletedLevel > 0 && <StartOver progress={progress} onReset={setProgress} />}
        </>
      ) : (
        <form className="olympus-name-form" onSubmit={reserve}>
          <p>Claim a unique name for the leaderboard.</p>
          <label htmlFor="olympus-player-name">Player name</label>
          <input ref={input} id="olympus-player-name" value={name} onChange={(event) => setName(event.target.value)}
            minLength={3} maxLength={16} pattern="[A-Za-z0-9][A-Za-z0-9_]{2,15}" required
            autoComplete="off" autoCapitalize="off" spellCheck={false} disabled={busy}
            aria-describedby="olympus-name-help olympus-name-error" />
          <p id="olympus-name-help" className="olympus-scores-note">3–16 letters, numbers or underscores. Names are unique regardless of capital letters.</p>
          <div className="olympus-actions">
            <button type="submit" className="olympus-button olympus-button-primary" disabled={busy}>{busy ? "Connecting..." : "Reserve name"}</button>
            <button type="button" className="olympus-button" onClick={onBack} disabled={busy}>Back</button>
          </div>
          <p id="olympus-name-error" role="status">{error}</p>
          {offline && <>
            <button type="button" className="olympus-score-link" onClick={play}>{label} · guest</button>
            {progress.highestCompletedLevel > 0 && <StartOver progress={progress} onReset={setProgress} />}
          </>}
        </form>
      )}
      {notice && <p role="status" className="olympus-scores-note">{notice}</p>}
      <p className="olympus-scores-note">Your name and score are public. This browser remembers your name; clearing cookies loses access to it and its level save. Other browsers and Home Screen installs may use separate cookies.</p>
    </div>
  );
}

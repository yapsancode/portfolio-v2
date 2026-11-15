"use client";

import { useEffect, useRef, useState } from "react";
import { LEVELS, type Progress } from "@/lib/olympus/levels";
import type { MouseEvent } from "react";
import { site } from "@/config/site";
import { loadBest, useGame } from "@/components/game/GameContext";
import { usesTouchControls } from "@/components/game/touch-controls";
import FullscreenHelp from "@/components/game/FullscreenHelp";
import { missionInfo } from "@/lib/olympus/missions";
import HighScores from "@/components/game/HighScores";
import PlayerNamePrompt from "@/components/game/PlayerNamePrompt";

const copy = site.olympus.title;
const guide = site.olympus.guide;

/** One key (or on-screen button), drawn as a grey Windows 98 keycap. */
function Key({ children }: { children: string }) {
  return <kbd className="olympus-key bevel-out">{children}</kbd>;
}

/**
 * The title screen of olympus.exe: an old DOS game running in a window.
 * Enter (or a tap) starts the game; the window's close button leaves.
 */
export default function OlympusWindow() {
  const { start, close } = useGame();
  const [best] = useState(() => loadBest());
  // Same test the game uses to show its on-screen buttons.
  const [touch] = useState(usesTouchControls);
  const [showGuide, setShowGuide] = useState(false);
  const [showScores, setShowScores] = useState(false);
  const [showName, setShowName] = useState(false);
  const guideHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (showGuide) guideHeading.current?.focus();
  }, [showGuide]);

  // A mouse click spawns the ship where the pointer is; Enter starts it in the middle.
  const play = (e: MouseEvent<HTMLButtonElement>, progress: Progress) =>
    start(e.detail === 0 ? null : { x: e.clientX, y: e.clientY }, progress);
  const onStart = () => setShowName(true);

  if (showName) return <PlayerNamePrompt onPlay={play} onBack={() => setShowName(false)} />;
  if (showScores) return (
    <div className="olympus-title olympus-scores-screen" onKeyDown={(event) => {
      if (event.key === "Escape") { event.stopPropagation(); setShowScores(false); }
    }}>
      <HighScores />
      <button type="button" className="olympus-button" autoFocus onClick={() => setShowScores(false)}>Back to game</button>
    </div>
  );

  if (showGuide) return (
    <div className="olympus-title olympus-guide" onKeyDown={(e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setShowGuide(false);
      }
    }}>
      <h1 ref={guideHeading} tabIndex={-1} className="olympus-guide-heading">{guide.title}</h1>
      <div className="olympus-guide-content" tabIndex={0} role="region" aria-label="Olympus story and instructions">
        <section className="olympus-guide-story">
          <h2>{guide.storyTitle}</h2>
          <p>{guide.story}</p>
        </section>
        <div className="olympus-guide-columns">
          <section>
            <h2>{guide.missionTitle}</h2>
            <ol>
              {guide.steps.map((step) => <li key={step.title}><h3>{step.title}</h3><p>{step.text}</p></li>)}
            </ol>
          </section>
          <section>
            <h2>{guide.controlsTitle}</h2>
            <dl>
              {(touch ? guide.touch : guide.keyboard).map((control) => (
                <div key={control.title}><dt>{control.title}</dt><dd>{control.text}</dd></div>
              ))}
            </dl>
            <p className="olympus-guide-tip">{guide.tip}</p>
          </section>
        </div>
        <section>
          <h2>Six encounters, six missions</h2>
          <ol>{LEVELS.map((level) => <li key={level.id}><h3>Level {level.id} · {level.name}</h3><p>{missionInfo(level.id).briefing}</p><p>{level.hint}</p></li>)}</ol>
          <p>Each level reveals a different guardian power, with its own patterns and challenge. Continue restarts your saved level; Start Over resets the campaign and keeps your marble bank, upgrades and best haul.</p>
        </section>
        <section><h2>Marble bank & ship upgrades</h2><p>{guide.resourceTip}</p></section>
        <p className="olympus-guide-reassurance">{guide.reassurance}</p>
      </div>
      <div className="olympus-actions olympus-guide-actions">
        <button type="button" className="olympus-button" onClick={() => setShowGuide(false)}>{guide.back}</button>
        <button type="button" className="olympus-button olympus-button-primary" onClick={onStart}>{guide.play}</button>
      </div>
    </div>
  );

  return (
    <div className="olympus-title">
      <p className="olympus-title-dim">{copy.presents}</p>
      <h1 className="olympus-logo">OLYMPUS</h1>
      <p>{copy.tagline}</p>

      <div className="olympus-actions">
        <button type="button" className="olympus-button olympus-button-primary" onClick={onStart} autoFocus>
          Play
        </button>
        <button type="button" className="olympus-button" onClick={close}>Back to desktop</button>
      </div>
      <button type="button" className="olympus-guide-link" onClick={() => setShowGuide(true)}>{guide.label}</button>
      <button type="button" className="olympus-score-link" onClick={() => setShowScores(true)}>Top collectors</button>
      <FullscreenHelp />

      {touch ? (
        <p className="olympus-title-keys">
          <span>
            <Key>Joystick</Key> steer · release to stop
          </span>
          <span>
            <Key>FIRE</Key> fire
          </span>
          <span>
            <Key>Ⅱ</Key> pause / exit
          </span>
        </p>
      ) : (
        <p className="olympus-title-keys">
          <span>
            <Key>←</Key> <Key>→</Key> turn
          </span>
          <span>
            <Key>↑</Key> thrust
          </span>
          <span>
            <Key>Space</Key> fire
          </span>
          <span>
            <Key>P</Key> pause
          </span>
          <span>
            <Key>Esc</Key> menu
          </span>
        </p>
      )}

      {best > 0 && (
        <p className="olympus-title-score">
          BEST HAUL {String(best).padStart(6, "0")}
        </p>
      )}
      <p className="olympus-title-dim">{copy.warning}</p>
      {touch && <p className="olympus-title-dim">Play in landscape — turn your phone or tablet sideways.</p>}
      <a className="olympus-shortcut" href="/olympus">Direct game shortcut · /olympus</a>
    </div>
  );
}

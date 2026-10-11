"use client";

import { site } from "@/config/site";
import { useMusic } from "@/components/desktop/music";

function formatTime(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  const minutes = String(Math.floor(whole / 60)).padStart(2, "0");
  const rest = String(whole % 60).padStart(2, "0");
  return `${minutes}:${rest}`;
}

/* Pixel glyphs for the transport buttons (10x10, crisp edges). */
function PlayGlyph() {
  return (
    <svg viewBox="0 0 10 10" width="10" height="10" shapeRendering="crispEdges" aria-hidden="true">
      <path d="M2 1h1v1h1v1h1v1h1v1h1v1H6v1H5v1H4v1H3v1H2z" fill="#000" />
    </svg>
  );
}

function PauseGlyph() {
  return (
    <svg viewBox="0 0 10 10" width="10" height="10" shapeRendering="crispEdges" aria-hidden="true">
      <path d="M2 1h2v8H2zM6 1h2v8H6z" fill="#000" />
    </svg>
  );
}

function StopGlyph() {
  return (
    <svg viewBox="0 0 10 10" width="10" height="10" shapeRendering="crispEdges" aria-hidden="true">
      <path d="M2 2h6v6H2z" fill="#000" />
    </svg>
  );
}

const transportButton =
  "bevel-out grid h-10 w-12 place-items-center bg-win-face sm:h-7 sm:w-9 focus-visible:outline-1 focus-visible:-outline-offset-4 focus-visible:outline-dotted focus-visible:outline-black active:translate-x-px active:translate-y-px";

export default function MusicWindow() {
  const { playing, time, duration, volume, toggle, stop, seek, setVolume } =
    useMusic();

  const state = playing ? "Playing" : time > 0 ? "Paused" : "Stopped";

  return (
    <div className="flex h-full min-h-0 flex-col bg-win-face p-2">
      <h1 className="sr-only">Music player</h1>

      {/* Display */}
      <div className="bevel-in shrink-0 bg-win-face p-0.5">
        <div className="player-lcd">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-4xl leading-none">{formatTime(time)}</span>
            <span>{duration ? formatTime(duration) : "--:--"}</span>
          </div>
          <div className="player-title">
            <span className={playing ? "player-marquee" : undefined}>
              {site.music}
            </span>
          </div>
        </div>
      </div>

      <input
        type="range"
        className="win-slider mt-2 w-full shrink-0"
        aria-label="Position in track"
        min={0}
        max={duration || 1}
        step={1}
        value={Math.min(time, duration || 1)}
        disabled={!duration}
        onChange={(e) => seek(Number(e.target.value))}
      />

      <div className="mt-1 flex shrink-0 items-center gap-1">
        <button
          type="button"
          className={transportButton}
          aria-label={playing ? "Pause" : "Play"}
          onClick={toggle}
        >
          {playing ? <PauseGlyph /> : <PlayGlyph />}
        </button>
        <button
          type="button"
          className={transportButton}
          aria-label="Stop"
          onClick={stop}
        >
          <StopGlyph />
        </button>
        <label className="ml-auto flex items-center gap-2 font-pixel text-base">
          Vol
          <input
            type="range"
            className="win-slider w-24"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
          />
        </label>
      </div>

      <div
        role="status"
        className="bevel-well mt-auto shrink-0 px-2 py-0.5 font-pixel text-base leading-none"
      >
        {state}
      </div>
    </div>
  );
}

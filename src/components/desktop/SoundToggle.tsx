"use client";

import { useRef, useState } from "react";

const MUSIC_URL = "/sounds/les-instrumental.mp3";

/** Pixel speaker glyph. Shows sound waves when on, a mute X when off. */
function SpeakerGlyph({ playing }: { playing: boolean }) {
  return (
    <svg viewBox="0 0 12 12" width="14" height="14" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="1" y="4" width="2" height="4" fill="#000" />
      <path d="M3 4 L6 3 L6 9 L3 8 Z" fill="#000" />
      {playing ? (
        <>
          <rect x="8" y="3" width="1" height="6" fill="#000" />
          <rect x="10" y="2" width="1" height="8" fill="#000" />
        </>
      ) : (
        <>
          <path d="M8 3 L11 9 M11 3 L8 9" stroke="#000" strokeWidth="1" />
        </>
      )}
    </svg>
  );
}

export default function SoundToggle() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      // Must run inside the user gesture — autoplay-with-sound is blocked.
      void audio.play().then(
        () => setPlaying(true),
        () => setPlaying(false)
      );
    }
  };

  return (
    <div className="bevel-well ml-auto flex h-full items-center px-1">
      <button
        type="button"
        className="flex h-full items-center gap-1 px-1 font-pixel text-base"
        aria-pressed={playing}
        aria-label={playing ? "Pause music" : "Play music"}
        title={playing ? "Pause music" : "Play music"}
        onClick={toggle}
      >
        <SpeakerGlyph playing={playing} />
        <span className="pr-1">{playing ? "Pause" : "Play music"}</span>
      </button>
      <audio ref={audioRef} src={MUSIC_URL} loop preload="none" />
    </div>
  );
}

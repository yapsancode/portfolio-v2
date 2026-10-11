"use client";

import { useMusic } from "./music";

/** Pixel speaker glyph. Shows sound waves while music is playing. */
function SpeakerGlyph({ playing }: { playing: boolean }) {
  return (
    <svg viewBox="0 0 12 12" width="14" height="14" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="1" y="4" width="2" height="4" fill="#000" />
      <path d="M3 4 L6 3 L6 9 L3 8 Z" fill="#000" />
      {playing && (
        <>
          <rect x="8" y="3" width="1" height="6" fill="#000" />
          <rect x="10" y="2" width="1" height="8" fill="#000" />
        </>
      )}
    </svg>
  );
}

/** The speaker in the taskbar tray. It opens the music player window. */
export default function MusicTray({ onOpen }: { onOpen: () => void }) {
  const { playing } = useMusic();
  const label = playing ? "Music player (playing)" : "Music player";

  return (
    <button
      type="button"
      className="grid h-full w-7 place-items-center focus-visible:outline-1 focus-visible:-outline-offset-2 focus-visible:outline-dotted focus-visible:outline-black"
      aria-label={label}
      title={label}
      onClick={onOpen}
    >
      <SpeakerGlyph playing={playing} />
    </button>
  );
}

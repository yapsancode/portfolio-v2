"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { site } from "@/config/site";

/**
 * The one audio element for the whole desktop. It lives here, not inside
 * the music player window, so the track keeps playing when that window is
 * closed or minimized. The taskbar tray and the player both read from it.
 */
export type Music = {
  playing: boolean;
  /** Current position, in seconds. */
  time: number;
  /** Track length in seconds; 0 until the file has started loading. */
  duration: number;
  /** 0 to 1. */
  volume: number;
  toggle: () => void;
  stop: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
};

const MusicContext = createContext<Music | null>(null);

export function useMusic(): Music {
  const music = useContext(MusicContext);
  if (!music) throw new Error("useMusic must be used inside <MusicProvider>");
  return music;
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      // Must run inside a user gesture — autoplay-with-sound is blocked.
      void audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setTime(0);
  }, []);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = seconds;
    setTime(seconds);
  }, []);

  const setVolume = useCallback((next: number) => {
    const audio = audioRef.current;
    if (audio) audio.volume = next;
    setVolumeState(next);
  }, []);

  const value = useMemo(
    () => ({ playing, time, duration, volume, toggle, stop, seek, setVolume }),
    [playing, time, duration, volume, toggle, stop, seek, setVolume]
  );

  return (
    <MusicContext value={value}>
      {children}
      <audio
        ref={audioRef}
        src={site.musicSrc}
        loop
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onDurationChange={(e) => {
          const next = e.currentTarget.duration;
          setDuration(Number.isFinite(next) ? next : 0);
        }}
      />
    </MusicContext>
  );
}

"use client";

import PixelIcon from "@/components/desktop/PixelIcon";
import { useGame } from "@/components/games/olympus/GameContext";

export default function GamesWindow() {
  const game = useGame();

  return (
    <div className="flex h-full min-h-0 flex-col bg-win-face p-1">
      <div className="mb-1 flex shrink-0 items-center gap-2">
        <span className="shrink-0 font-pixel text-base">Address</span>
        <div className="bevel-in min-w-0 flex-1 truncate bg-white px-2 py-1 font-content text-xs">
          C:\isyraf\games
        </div>
      </div>

      <div className="bevel-in min-h-0 flex-1 overflow-auto bg-white">
        <div className="grid grid-cols-3 gap-3 p-3 sm:grid-cols-4">
          <button
            type="button"
            aria-label="Open olympus.exe"
            className="flex min-w-0 flex-col items-center gap-1 border border-dotted border-transparent p-1 text-center hover:border-win-navy hover:bg-win-navy hover:text-white focus-visible:border-win-navy focus-visible:bg-win-navy focus-visible:text-white focus-visible:outline-none"
            onClick={game.open}
          >
            <PixelIcon name="olympus" size={48} />
            <span className="font-pixel text-base leading-none">olympus.exe</span>
          </button>
        </div>
      </div>
    </div>
  );
}

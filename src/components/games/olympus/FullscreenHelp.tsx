"use client";

import { useState } from "react";
import Image from "next/image";
import { usesTouchControls } from "./touch-controls";

/** Recommend a Home Screen launch for the full mobile game experience. */
export default function FullscreenHelp({ duringGame = false }: { duringGame?: boolean }) {
  const [platform] = useState(() => {
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const standalone = (navigator as Navigator & { standalone?: boolean }).standalone ||
      window.matchMedia("(display-mode: standalone), (display-mode: fullscreen)").matches;
    return !standalone && (ios || usesTouchControls()) ? (ios ? "ios" : "android") : null;
  });

  if (!platform) return null;
  return (
    <aside className="olympus-install" aria-label="Get the full Olympus experience">
      <div className="olympus-install-heading">
        <Image src="/olympus-icon-192.png" width={48} height={48} alt="Olympus app icon" unoptimized />
        <div>
          <h2>Get the full Olympus experience</h2>
          <p>Add Olympus to your Home Screen for full-screen play without browser bars.</p>
        </div>
      </div>
      <details className="olympus-fullscreen-help">
      <summary>How to add to Home Screen</summary>
      {duringGame ? (
        <p>After this run, open the /games/olympus shortcut{platform === "ios" ? " in Safari" : " in your browser"}.</p>
      ) : (
        <p>Open <a href="/games/olympus">the Olympus shortcut</a>{platform === "ios" ? " in Safari" : " in your browser"}.</p>
      )}
      <ol>
        {platform === "ios" ? <>
          <li>Tap Share, then Add to Home Screen (under More if needed).</li>
          <li>Keep Open as Web App on, if shown, then tap Add.</li>
        </> : <>
          <li>Open the browser menu and choose Add to Home Screen or Install app.</li>
          <li>Confirm Add or Install when prompted.</li>
        </>}
        <li>Launch Olympus from your Home Screen and rotate to landscape.</li>
      </ol>
      </details>
    </aside>
  );
}

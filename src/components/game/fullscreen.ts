import { usesTouchControls } from "./touch-controls";

let active = false;
let owned = false;
let pending = false;

/** Call directly from Play/Resume so browsers receive a user gesture. */
export function enterGameFullscreen() {
  active = true;
  if (!usesTouchControls() || document.fullscreenElement || pending || !document.documentElement.requestFullscreen) return;
  pending = true;
  void document.documentElement.requestFullscreen({ navigationUI: "hide" }).then(() => {
    owned = true;
    // The visitor may have exited while the browser was entering fullscreen.
    if (!active) leaveGameFullscreen();
  }).catch(() => {
    // Unsupported or denied: the game still fills the available viewport.
  }).finally(() => { pending = false; });
}

export function leaveGameFullscreen() {
  active = false;
  if (owned && document.fullscreenElement === document.documentElement) {
    void document.exitFullscreen().catch(() => {});
  }
  owned = false;
}

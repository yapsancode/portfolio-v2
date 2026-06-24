import { site } from "@/config/site";

/**
 * Flat, non-canvas fallback for mobile and prefers-reduced-motion users.
 * Renders the same initials as crisp, static display type — no WebGL, no
 * animation, no main-thread cost. Decorative (the accessible name lives in the
 * hero's visually-hidden <h1>), so it's aria-hidden.
 */
export default function Initials2D() {
  return (
    <div
      aria-hidden="true"
      className="flex h-full w-full items-center justify-center select-none"
    >
      <span
        className="font-display font-black leading-none text-charcoal"
        style={{
          fontSize: "clamp(6rem, 26vw, 18rem)",
          letterSpacing: "-0.04em",
          // A flat "extruded" hint via a hard offset shadow — no blur.
          textShadow: "0.12em 0.12em 0 color-mix(in srgb, var(--charcoal) 22%, transparent)",
        }}
      >
        {site.initials}
      </span>
    </div>
  );
}

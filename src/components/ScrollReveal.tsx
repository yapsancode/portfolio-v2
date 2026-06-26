"use client";

/**
 * ScrollReveal — a stacked-sticky "slide-up reveal" wrapper.
 *
 * The hero is PINNED in place (via GSAP ScrollTrigger), and this section —
 * holding whatever `children` you pass — scrolls UP over it. The content slides
 * up to cover the hero with no empty gap, because the hero stays visible behind
 * the rising content.
 *
 * Mechanics:
 *  - ScrollTrigger pins the hero (`pinTargetId`, default "top") with
 *    `pinSpacing: false`, so this section overlaps it instead of being pushed
 *    down. The section sits above the pinned hero via `z-10`, so the natural
 *    upward scroll reads as the content translating up over the hero.
 *  - Lenis provides smooth scroll, wired into GSAP's ticker + ScrollTrigger so
 *    they share one clock. Modern Lenis updates the real scroll position (not a
 *    CSS transform on <body>), so it does NOT fight the hero's React Three Fiber
 *    canvas — R3F's IntersectionObserver still parks its render loop once the
 *    hero is fully scrolled past.
 *  - GSAP + Lenis are dynamically imported, keeping them out of the hero's
 *    critical JS bundle.
 *  - prefers-reduced-motion: no pin, no smooth scroll — the content is just a
 *    normal section below the hero.
 *  - Everything (the ScrollTrigger/pin, the Lenis instance, the ticker
 *    callback) is torn down on unmount, so fast refresh can't leak or
 *    double-register.
 */

import { useEffect, useRef, type ReactNode } from "react";
import type Lenis from "lenis";

// Module-scoped guard so the page is only ever driven by ONE Lenis instance,
// even if this component is mounted more than once. (Verified: no other Lenis
// exists in the app.) Reset to null on teardown.
let activeLenis: Lenis | null = null;

type ScrollRevealProps = {
  /** Content revealed as it slides up over the pinned hero. */
  children: ReactNode;
  /** Optional id for the revealed section (anchor links). */
  id?: string;
  /** Extra classes for the section (background, padding, etc.). */
  className?: string;
  /** id of the section to pin behind the rising content (the hero). */
  pinTargetId?: string;
};

export default function ScrollReveal({
  children,
  id,
  className = "",
  pinTargetId = "top",
}: ScrollRevealProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | null = null;

    (async () => {
      // Dynamic import keeps GSAP + Lenis out of the hero's initial bundle.
      const [{ default: gsap }, { ScrollTrigger }, { default: LenisCtor }] =
        await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
          import("lenis"),
        ]);

      if (disposed || !sectionRef.current) return;
      const hero = document.getElementById(pinTargetId);
      if (!hero) return; // Degrades to a normal section if the hero is absent.

      // Idempotent — safe to re-run on every mount / fast refresh.
      gsap.registerPlugin(ScrollTrigger);

      const mm = gsap.matchMedia();
      cleanup = () => mm.revert(); // kills the ScrollTrigger/pin + restores the DOM

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Smooth scroll. Guarded so a second mount won't spin up a second Lenis.
        let raf: ((time: number) => void) | null = null;
        let onScroll: (() => void) | null = null;
        if (!activeLenis) {
          const lenis = new LenisCtor({ duration: 1.2, smoothWheel: true });
          activeLenis = lenis;
          onScroll = () => ScrollTrigger.update();
          lenis.on("scroll", onScroll);
          raf = (time: number) => lenis.raf(time * 1000); // GSAP ticker → ms
          gsap.ticker.add(raf);
          gsap.ticker.lagSmoothing(0);
        }

        // Pin the hero; this section (z-10) scrolls up over it. The hero stays
        // visible behind the content the whole time — no empty gap.
        const st = ScrollTrigger.create({
          trigger: hero,
          start: "top top",
          end: "+=100%",
          pin: true,
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });

        // Per-context teardown (also invoked by mm.revert()).
        return () => {
          st.kill();
          if (activeLenis && raf && onScroll) {
            gsap.ticker.remove(raf);
            gsap.ticker.lagSmoothing(500, 33); // restore GSAP default
            activeLenis.off("scroll", onScroll);
            activeLenis.destroy();
            activeLenis = null;
          }
        };
      });
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [pinTargetId]);

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`relative z-10 min-h-dvh w-full ${className}`}
    >
      {children}
    </section>
  );
}

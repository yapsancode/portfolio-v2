"use client";

/**
 * ScrollReveal — a stacked-sticky "slide-up reveal" section.
 *
 * The hero is PINNED in place (via GSAP ScrollTrigger), and this full-bleed
 * image section scrolls UP over it — the image slides up to cover the hero with
 * no empty gap, because the hero stays visible behind the rising image. The
 * image never scales.
 *
 * Mechanics:
 *  - ScrollTrigger pins the hero (`pinTargetId`, default "top") with
 *    `pinSpacing: false`, so the following image section overlaps it instead of
 *    being pushed down. This section sits above the pinned hero via `z-10`, so
 *    the natural upward scroll reads as the image translating up over the hero.
 *  - Lenis provides smooth scroll, wired into GSAP's ticker + ScrollTrigger so
 *    they share one clock. Modern Lenis updates the real scroll position (not a
 *    CSS transform on <body>), so it does NOT fight the hero's React Three Fiber
 *    canvas — R3F's IntersectionObserver still parks its render loop once the
 *    hero is fully scrolled past.
 *  - GSAP + Lenis are dynamically imported, keeping them out of the hero's
 *    critical JS bundle.
 *  - prefers-reduced-motion: no pin, no smooth scroll — the image is just a
 *    normal section below the hero.
 *  - Everything (the ScrollTrigger/pin, the Lenis instance, the ticker
 *    callback) is torn down on unmount, so fast refresh can't leak or
 *    double-register.
 */

import { useEffect, useRef } from "react";
import Image from "next/image";
import type Lenis from "lenis";
import { site } from "@/config/site";

// Module-scoped guard so the page is only ever driven by ONE Lenis instance,
// even if this component is mounted more than once. (Verified: no other Lenis
// exists in the app.) Reset to null on teardown.
let activeLenis: Lenis | null = null;

type ScrollRevealProps = {
  /** Collage images to reveal. Defaults to the configured set in site.ts. */
  images?: readonly { src: string; alt: string }[];
  /** id of the section to pin behind the rising collage (the hero). */
  pinTargetId?: string;
};

export default function ScrollReveal({
  images = site.reveal.images,
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
      if (!hero) return; // Degrades to a normal image section if the hero is absent.

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

        // Pin the hero; this image section (z-10) scrolls up over it. The hero
        // stays visible behind the image the whole time — no empty gap.
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
      aria-label="Photo collage"
      className="relative z-10 h-dvh w-full overflow-hidden bg-charcoal"
    >
      <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-2 sm:grid-cols-4 sm:grid-rows-1">
        {images.map((img) => (
          <div key={img.src} className="relative overflow-hidden">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(min-width: 640px) 25vw, 50vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

/**
 * SelectedProjects — a hover-reveal project list. Live entries get the full
 * treatment (cursor-tracked preview image, letter spread, arrow slide-in);
 * not-yet-live entries render as inert text with a "Coming soon" badge.
 *
 * Content is injected via the `projects` prop — see src/config/site.ts.
 */

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight } from "lucide-react";

export interface SelectedProject {
  heading: string;
  subheading: string;
  year?: string;
  stack?: readonly string[];
  /** Free-text pill next to the year (e.g. "Details on request"). Null = none. */
  badge?: string | null;
  /** Preview image, revealed on hover. Only ever rendered for live entries. */
  imgSrc: string;
  /** Fallback if `imgSrc` 404s (e.g. a screenshot that isn't shot yet). */
  imgFallbackSrc?: string;
  href?: string | null;
  isLive: boolean;
}

interface SelectedProjectsProps {
  projects: readonly SelectedProject[];
  title?: string;
}

/**
 * True only on real hover-capable pointers. The preview image is a hover-only
 * affordance, so on touch we skip rendering it entirely rather than shipping an
 * image that can never be seen.
 */
function usePointerFine() {
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return fine;
}

export function SelectedProjects({
  projects,
  title = "Selected work",
}: SelectedProjectsProps) {
  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="font-display text-sm font-extrabold uppercase tracking-widest text-charcoal/50">
        {title}
      </h2>
      <div className="mt-10 border-t border-charcoal/15">
        {projects.map((project) => (
          <ProjectLink key={project.heading} {...project} />
        ))}
      </div>
    </div>
  );
}

function ProjectLink({
  heading,
  subheading,
  year,
  stack,
  badge,
  imgSrc,
  imgFallbackSrc,
  href,
  isLive,
}: SelectedProject) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const pointerFine = usePointerFine();
  const reduceMotion = useReducedMotion();
  const [src, setSrc] = useState(imgSrc);

  // The cursor-tracked preview only exists for live entries, on hover-capable
  // pointers, when motion is welcome.
  const showPreview = isLive && pointerFine && !reduceMotion;
  // Letter spread / arrow slide are decorative; drop them under reduced motion.
  const animate = isLive && !reduceMotion;

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const top = useTransform(mouseYSpring, [0.5, -0.5], ["40%", "60%"]);
  const left = useTransform(mouseXSpring, [0.5, -0.5], ["60%", "40%"]);

  // aria-label overrides the link's inner content as its accessible name, so the
  // year and stack have to be restated here or they're lost to screen readers.
  const label =
    `${heading}${year ? `, ${year}` : ""} — ${subheading}` +
    (stack?.length ? `. Built with ${stack.join(", ")}.` : "");

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  return (
    <motion.a
      ref={ref}
      href={isLive && href ? href : undefined}
      target={isLive ? "_blank" : undefined}
      rel={isLive ? "noopener noreferrer" : undefined}
      aria-disabled={!isLive}
      aria-label={isLive ? label : undefined}
      onMouseMove={showPreview ? handleMouseMove : undefined}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      initial="initial"
      whileHover="whileHover"
      className={`group relative flex items-center justify-between border-b border-charcoal/15 py-8 transition-colors duration-500 ${
        isLive
          ? "cursor-pointer hover:border-charcoal"
          : "pointer-events-none cursor-default opacity-60"
      }`}
    >
      <div>
        {(year || badge) && (
          <span className="relative z-10 mb-3 flex flex-wrap items-center gap-3 text-sm font-semibold text-charcoal/50">
            {year && <span className="tabular-nums">{year}</span>}
            {badge && (
              <span className="rounded-full border border-charcoal/25 px-2 py-0.5 text-xs uppercase tracking-wide">
                {badge}
              </span>
            )}
          </span>
        )}

        <h3 className="relative z-10 block font-display text-3xl font-black tracking-tight text-charcoal/50 transition-colors duration-500 group-hover:text-charcoal sm:text-5xl md:text-6xl">
          {/* Real text for assistive tech; the split letters below are visual only. */}
          <span className="sr-only">{heading}</span>
          <motion.span
            aria-hidden="true"
            variants={{ initial: { x: 0 }, whileHover: { x: animate ? -16 : 0 } }}
            transition={{
              type: "spring",
              staggerChildren: 0.075,
              delayChildren: 0.25,
            }}
            className="block"
          >
            {/* Split per word, then per letter: each letter is an inline-block,
                which is a break opportunity, so splitting the raw string lets
                long titles wrap mid-word. The nowrap wrapper keeps words whole
                and the text node between them stays a real, breakable space. */}
            {heading.split(" ").map((word, w, words) => (
              <span key={w}>
                <motion.span
                  variants={{ initial: {}, whileHover: {} }}
                  className="inline-block whitespace-nowrap"
                >
                  {word.split("").map((letter, i) => (
                    <motion.span
                      key={i}
                      variants={{ initial: { x: 0 }, whileHover: { x: animate ? 16 : 0 } }}
                      transition={{ type: "spring" }}
                      className="inline-block"
                    >
                      {letter}
                    </motion.span>
                  ))}
                </motion.span>
                {w < words.length - 1 ? " " : null}
              </span>
            ))}
          </motion.span>
        </h3>

        <span className="relative z-10 mt-2 block text-charcoal/60 transition-colors duration-500 group-hover:text-charcoal">
          {subheading}
        </span>

        {stack && stack.length > 0 && (
          <ul className="relative z-10 mt-4 flex flex-wrap gap-2">
            {stack.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-charcoal/25 px-3 py-1 text-xs font-semibold text-charcoal/70"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>

      {showPreview && (
        <motion.img
          style={{ top, left, translateX: "-10%", translateY: "-50%" }}
          variants={{
            initial: { scale: 0, rotate: "-12.5deg" },
            whileHover: { scale: 1, rotate: "12.5deg" },
          }}
          transition={{ type: "spring" }}
          src={src}
          onError={() => imgFallbackSrc && setSrc(imgFallbackSrc)}
          alt=""
          aria-hidden="true"
          /**
           * Deliberately NOT loading="lazy". The image sits at scale(0) until
           * hover, so lazy defers the fetch until the pointer arrives — the
           * preview then pops in late on first hover (worse here, where a
           * remote URL means a round-trip, and worse still while it 404s into
           * the fallback). fetchPriority="low" keeps it from competing with
           * anything critical. Only desktop pointers ever render this at all.
           */
          fetchPriority="low"
          decoding="async"
          className="pointer-events-none absolute z-0 h-24 w-32 rounded-lg object-cover shadow-lg md:h-48 md:w-64"
        />
      )}

      {isLive && (
        <div className="overflow-hidden">
          <motion.div
            variants={{
              initial: { x: animate ? "100%" : "0%", opacity: animate ? 0 : 1 },
              whileHover: { x: "0%", opacity: 1 },
            }}
            transition={{ type: "spring" }}
            className="relative z-10 p-4"
          >
            <ArrowRight className="size-8 text-charcoal md:size-12" aria-hidden="true" />
          </motion.div>
        </div>
      )}
    </motion.a>
  );
}

export default SelectedProjects;

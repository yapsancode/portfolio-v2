import HeroStage from "@/components/hero/HeroStage";
import JsonLd from "@/components/seo/JsonLd";
import NowPlaying from "@/components/NowPlaying";
import PhotoGallery from "@/components/PhotoGallery";
import ScrollReveal from "@/components/ScrollReveal";
import { site } from "@/config/site";

/* External-link safety helper. */
const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

export default function Home() {
  return (
    <>
      {/* Schema.org structured data for search + answer engines. */}
      <JsonLd />

      {/* ===================== HERO ===================== */}
      <section
        id="top"
        className="relative flex min-h-dvh flex-col overflow-hidden bg-lime text-charcoal"
      >
        {/* Decorative dotted grid wash behind everything. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage:
              "radial-gradient(color-mix(in srgb, var(--charcoal) 16%, transparent) 1.2px, transparent 1.2px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* The page's true heading for the document outline / screen readers.
            The visible name is rendered as a decorative ghost below. */}
        <h1 className="sr-only">
          {site.fullName} — {site.role}
        </h1>

        {/* Top meta bar */}
        <header className="z-20 flex items-center justify-between px-6 pt-6 sm:px-10">
          <span className="font-display text-sm font-extrabold tracking-tight uppercase">
            {site.fullName}
          </span>
          <div className="flex items-center gap-4 sm:gap-6">
            <nav aria-label="Sections" className="hidden gap-6 text-sm font-semibold sm:flex">
              <a className="hover:underline underline-offset-4" href="#about">
                About
              </a>
              <a className="hover:underline underline-offset-4" href="#work">
                Work
              </a>
              <a className="hover:underline underline-offset-4" href="#contact">
                Contact
              </a>
            </nav>
            {/* Live "what I'm listening to" pill. Self-hides until configured. */}
            <NowPlaying />
          </div>
        </header>

        {/* Focal stage: giant ghost name behind, 3D / fallback initials in front */}
        <div className="relative grid flex-1 place-items-center">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center px-2 text-center font-display font-black uppercase leading-[0.82] text-ghost select-none"
            style={{ fontSize: "clamp(3.5rem, 17vw, 16rem)", letterSpacing: "-0.03em" }}
          >
            {site.fullName}
          </span>

          <div className="relative z-10 h-full w-full">
            <HeroStage />
          </div>
        </div>

        {/* Hero footer: mixed-weight tagline + meta row */}
        <div className="z-20 flex flex-col gap-8 px-6 pb-10 sm:px-10 md:flex-row md:items-end md:justify-between">
          <p className="max-w-2xl text-balance font-display leading-[1.05]">
            <span className="block text-xl font-normal text-charcoal/70 sm:text-2xl">
              {site.tagline.intro}
            </span>
            <span className="block text-3xl font-black tracking-tight sm:text-5xl">
              {site.tagline.statement}
            </span>
          </p>

          <div className="flex flex-col gap-3 md:items-end">
            <span className="text-xs font-extrabold uppercase tracking-widest text-charcoal/60">
              Reach out
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={site.resumeUrl}
                {...ext}
                className="cursor-pointer rounded-full bg-charcoal px-5 py-2.5 text-sm font-bold text-lime transition-transform duration-200 hover:-translate-y-0.5"
              >
                Résumé ↗
              </a>
              {site.socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  {...(s.href.startsWith("http") ? ext : {})}
                  className="cursor-pointer rounded-full border-2 border-charcoal px-5 py-2.5 text-sm font-bold transition-colors duration-200 hover:bg-charcoal hover:text-lime"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== GALLERY slides up over the pinned hero (ScrollReveal) ===== */}
      <ScrollReveal id="gallery" className="bg-charcoal py-16 sm:py-24">
        <PhotoGallery />
      </ScrollReveal>

      {/* ===================== ABOUT ===================== */}
      <section id="about" className="bg-paper px-6 py-24 text-charcoal sm:px-10 sm:py-32">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-sm font-extrabold uppercase tracking-widest text-charcoal/50">
            The name is Isyraf
          </h2>
          <div className="mt-6 space-y-6 text-lg leading-relaxed sm:text-xl">
            {site.about.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== WORK ===================== */}
      <section id="work" className="bg-paper px-6 pb-24 text-charcoal sm:px-10 sm:pb-32">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-sm font-extrabold uppercase tracking-widest text-charcoal/50">
            Selected work
          </h2>
          <ul className="mt-10 divide-y divide-charcoal/15 border-y border-charcoal/15">
            {site.projects.map((project) => (
              <li key={project.title}>
                <article className="grid gap-4 py-8 md:grid-cols-[1fr_auto] md:items-start md:gap-10">
                  <div>
                    <div className="flex items-baseline gap-3">
                      <h3 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                        {project.title}
                      </h3>
                      <span className="text-sm font-semibold text-charcoal/50 tabular-nums">
                        {project.year}
                      </span>
                    </div>
                    <p className="mt-2 max-w-xl text-charcoal/80">{project.description}</p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {project.stack.map((tag) => (
                        <li
                          key={tag}
                          className="rounded-full border border-charcoal/25 px-3 py-1 text-xs font-semibold"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-4 text-sm font-bold md:flex-col md:items-end md:gap-2">
                    {project.live && (
                      <a
                        href={project.live}
                        {...ext}
                        className="cursor-pointer underline-offset-4 hover:underline"
                        aria-label={`${project.title} — view live site`}
                      >
                        Live ↗
                      </a>
                    )}
                    {project.code && (
                      <a
                        href={project.code}
                        {...ext}
                        className="cursor-pointer underline-offset-4 hover:underline"
                        aria-label={`${project.title} — view source code`}
                      >
                        Code ↗
                      </a>
                    )}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===================== CONTACT ===================== */}
      <section
        id="contact"
        className="bg-charcoal px-6 py-24 text-lime sm:px-10 sm:py-32"
      >
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-sm font-extrabold uppercase tracking-widest text-lime/60">
            Want to know me more?
          </h2>
          <a
            href={`mailto:${site.email}`}
            className="mt-6 inline-block max-w-full break-words cursor-pointer font-display text-3xl font-black tracking-tight underline-offset-8 hover:underline sm:text-6xl"
          >
            {site.email}
          </a>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm font-bold">
            {site.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                {...(s.href.startsWith("http") ? ext : {})}
                className="cursor-pointer underline-offset-4 hover:underline"
              >
                {s.label} ↗
              </a>
            ))}
          </div>
          <p className="mt-16 text-xs font-semibold text-lime/50">
            © {new Date().getFullYear()} {site.fullName}. Built with Next.js + React Three Fiber.
          </p>
        </div>
      </section>
    </>
  );
}

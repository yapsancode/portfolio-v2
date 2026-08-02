/* ============================================================================
 *  ✏️  EDIT ME — this is the single source of truth for your portfolio.
 *  Everything user-facing (name, tagline, projects, links) lives here.
 *  Change values below; you should not need to touch the components.
 * ========================================================================== */

export const site = {
  /** Your full name. Used for the giant ghosted hero name + <title>. */
  fullName: "Isyraf Afifi",

  /** Initials (kept for the dormant 3D hero variant + the generated icons). */
  initials: "IA",

  /**
   * Production URL — the single source of truth for canonical links, Open
   * Graph/Twitter tags, the sitemap, robots, and JSON-LD structured data.
   *
   * ⚠️ CHANGE THIS to your real domain before launch. On Vercel you can set
   * `NEXT_PUBLIC_SITE_URL` in the project's env vars and it wins automatically
   * (e.g. a custom domain) without editing code. No trailing slash.
   */
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://my-website-portfolio.vercel.app",

  /** BCP-47-ish locale for <html lang> stays "en"; this is the OG/HTML locale. */
  locale: "en_US",

  /** Where you're based — fuels Person structured data + local relevance. */
  location: "Malaysia",

  /**
   * SEO keywords. Also feed `Person.knowsAbout` in the JSON-LD, so keep them
   * accurate to what you actually do (search/answer engines cross-check).
   */
  keywords: [
    "Isyraf Afifi",
    "Muhammad Isyraf Afifi",
    "Software Engineer",
    "Fullstack Developer",
    "Frontend Developer",
    "Web Developer Malaysia",
    "Next.js",
    "React",
    "TypeScript",
    "Three.js",
    "FastAPI",
  ],

  /**
   * Centered hero avatar. Drop a transparent-background PNG into /public and
   * point `src` at it (e.g. "/avatar.png"); the SVG below is a placeholder.
   * `alt` is real, meaningful alt text (the avatar is content, not decoration).
   */
  avatar: {
    src: "/avatar.svg",
    alt: "Illustrated portrait of Isyraf Afifi wearing headphones and a hoodie",
  },

  /**
   * Interactive bento gallery (src/components/PhotoGallery.tsx →
   * components/ui/interactive-bento-gallery). Edit titles/desc/order here.
   * `type` is "image" or "video"; `span` controls each tile's footprint in the
   * bento grid (Tailwind col-/row-span classes at the sm/md breakpoints).
   */
  gallery: {
    title: "Beyond the code",
    description: "A few frames from life in Malaysia — drag to rearrange, tap to expand.",
    items: [
      {
        type: "image",
        title: "Isyraf Afifi",
        desc: "The person behind the code",
        src: "/images/isyraf-afifi.jpg",
        span: "md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2",
      },
      {
        type: "image",
        title: "Deep work",
        desc: "Shipping features over coffee",
        src: "/images/work.jpeg",
        span: "md:col-span-2 md:row-span-2 col-span-1 sm:col-span-2 sm:row-span-2",
      },
      {
        type: "image",
        title: "Stillness",
        desc: "A quiet moment at the mosque",
        src: "/images/masjid.jpeg",
        span: "md:col-span-1 md:row-span-3 sm:col-span-2 sm:row-span-2",
      },
      {
        type: "image",
        title: "Off the grid",
        desc: "Chasing waterfalls with the crew",
        src: "/images/waterfall.jpeg",
        span: "md:col-span-2 md:row-span-2 sm:col-span-1 sm:row-span-2",
      },
      {
        type: "image",
        title: "Everyday carry",
        desc: "Laptop, headphones, anywhere",
        src: "/images/tech-gear.jpeg",
        span: "md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2",
      },
      {
        type: "image",
        title: "Home roads",
        desc: "Shah Alam to Klang at golden hour",
        src: "/images/signboard.jpeg",
        span: "md:col-span-2 md:row-span-2 sm:col-span-1 sm:row-span-2",
      },
      {
        type: "image",
        title: "Throttle therapy",
        desc: "Two wheels, open road",
        src: "/images/motor.jpeg",
        span: "md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2",
      },
    ],
  },

  /** Short role label shown in the header / meta row. */
  role: "Software Engineer",

  /** Hero tagline: a light intro line + a heavy statement line. */
  tagline: {
    intro: "I'm a software engineer",
    statement: "leveling up into AI, shipping fast things for the web.",
  },

  /** About section copy. Each string is a paragraph. */
  about: [
    "Currently SWE, transitioning to AI Engineer, which if I'm being honest, mostly means surviving chaos and believing in things before the results bother to show up lol XD. Right now, I build web applications end to end: the data models, the APIs, the AI bits in the middle, and the pixels people actually touch.",

    "My music taste? It has no theme and no shame. Phonk on the way to debug something, jazz when the bug wins, Malay indie when I'm feeling sentimental, some random brainrot songs 'du bisqut genunggg' when the algorithm gives up on me lmao. If it slaps, it's in the rotation.",

    "I also think out loud, constantly. Half my best ideas start as something dumb I said mid-sentence; the other half are just FastAPI and Postgres quietly holding everything together while I overthink the front-end. Somewhere between the random thoughts and the late-night refactors",
  ],

  /** Résumé link (PDF in /public, or an external URL). */
  resumeUrl: "/resume.pdf",

  /** Contact email. */
  email: "muhammadisyrafafifi@gmail.com",

  /**
   * Spotify "now playing" header pill. The live track is fetched server-side
   * via env vars (SPOTIFY_CLIENT_ID / _SECRET / _REFRESH_TOKEN — see
   * .env.example); nothing secret lives here. `profileUrl` is just where the
   * pill links when nothing is playing. Leave it null to skip that link.
   */
  spotify: {
    profileUrl: null as string | null,
  },

  /** Social / meta-row links. Edit, reorder, or remove freely. */
  socials: [
    { label: "GitHub", href: "https://github.com/yapsancode" },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/muhammad-isyraf-afifi",
    },
    { label: "Email", href: "mailto:muhammadisyrafafifi@gmail.com" },
  ],

  /**
   * Projects — rendered by the Work section (src/components/SelectedProjects.tsx).
   *
   * - `tagline` is the SHORT one-liner shown in the list. Keep it to one line;
   *   long copy wraps badly against the giant display type.
   * - `description` is the longer version — it feeds the JSON-LD structured data
   *   (along with `year` and `stack`), so keep it accurate even though the Work
   *   section doesn't render it.
   * - `live: null` means there's no public link: the row renders inert (not
   *   clickable, no hover preview). Give it a URL to light it up.
   * - `badge` is the free-text pill shown next to the year — ✏️ WRITE YOUR OWN.
   *   It's whatever you want to say about a row ("Private", "NDA", "Case study
   *   on request", "In progress"). Set it to `null` for no pill at all.
   * - `image` is the hover preview — a local file in /public/projects or a
   *   remote URL. It's only ever loaded for live projects on hover-capable
   *   pointers. `imageFallback` renders if `image` 404s.
   */
  projects: [
    {
      title: "Baymax — AI GCP Deployment Assistant",
      year: "2026",
      tagline: "AI Chrome extension that guides GCP Console deployments step by step",
      description:
        "AI Chrome extension that highlights the exact GCP Console button to click, guiding developers through cloud deployments in real time — 1st place, Gamuda AI Academy Capstone Demo Day.",
      stack: ["React 19", "FastAPI", "LangChain", "Gemini API", "Chrome Extension (MV3)", "Cloud Run"],
      badge: "Open source",
      // GitHub's auto-generated social preview for the repo, so the hover
      // card shows a real image instead of a generic placeholder.
      image: "https://opengraph.githubassets.com/1/yapsancode/baymax",
      imageFallback: "https://placehold.co/800x600/1a1b16/c6f432?text=Baymax",
      live: "https://github.com/yapsancode/baymax",
      code: "https://github.com/yapsancode/baymax",
    },
    {
      title: "Job Kit / KerjaKit",
      year: "2026",
      tagline: "Open-source resume tailor CLI plus a live web app, kerjakit.com",
      description:
        "Resume tailor product in two forms: an open-source CLI (31 GitHub stars) and a live web app with 10 registered users — paste a job posting, get an honest match report and an ATS-safe one-page resume.",
      stack: ["Next.js 16", "Supabase", "Tailwind v4", "Typst", "DeepSeek", "Cloud Run"],
      badge: null,
      image: "https://placehold.co/800x600/1a1b16/c6f432?text=KerjaKit",
      imageFallback: null,
      live: "https://kerjakit.com",
      code: "https://github.com/yapsancode/job-kit",
    },
    {
      title: "Esportorium",
      year: "2026",
      tagline: "Malaysia's curated home for Mobile Legends tournaments",
      description:
        "Full-stack MLBB esports tournament platform centralizing scattered tournament listings across Malaysia, with organiser accounts, JWT tenant isolation, and AI-assisted poster-to-tournament ingest.",
      stack: ["Next.js", "FastAPI", "PostgreSQL", "Cloud Run", "Cloudflare R2"],
      badge: null,
      /**
       * Esportorium's own live OG image — so this preview tracks that site
       * instead of going stale against a checked-in screenshot.
       *
       * ⚠️ As of 2026-07-16 this 404s: esportorium.com ships og:title and
       * og:description but NO og:image (and declares twitter:card=
       * "summary_large_image", so its link previews are blank everywhere it's
       * shared). Until an `app/opengraph-image.tsx` lands in THAT repo, the
       * fallback below renders instead. Once it does, this picks it up with no
       * change here.
       */
      image: "https://esportorium.com/opengraph-image",
      imageFallback:
        "https://placehold.co/800x600/1a1b16/c6f432?text=Esportorium",
      live: "https://esportorium.com",
      code: null,
    },
    {
      title: "Medical Clinic Booking Platform",
      year: "2025",
      tagline: "Production appointment booking for real clinic patients",
      description:
        "Production appointment booking system serving real patients at Klinik Mekar — booking UX, admin interface, and SEO shipped end-to-end.",
      stack: ["Next.js", "Vercel"],
      badge: null,
      image: "https://placehold.co/800x600/1a1b16/c6f432?text=Klinik+Mekar",
      imageFallback: null,
      live: "https://klinikmekar.com",
      code: null,
    },
    {
      title: "The Sifu Path",
      year: "2026",
      tagline: "A five-level path from junior CRUD dev to AI-era engineer",
      description:
        "Shareable course web app for junior devs leveling up into the AI era — five levels, fourteen modules (teach → do → quiz → challenge), with local progress tracking and an optional live leaderboard.",
      stack: ["Vite", "React", "TypeScript", "Tailwind v4", "Supabase", "Cloudflare Workers"],
      badge: null,
      image: "https://placehold.co/800x600/1a1b16/c6f432?text=The+Sifu+Path",
      imageFallback: null,
      live: "https://the-sifu-path.isyraf-dev.workers.dev/",
      code: "https://github.com/yapsancode/the-sifu-path",
    },
    {
      title: "Claude Code × OpenCode Go Bridge",
      year: "2026",
      tagline: "API bridge letting Claude Code run open models via OpenCode Go",
      description:
        "Lightweight API proxy letting Claude Code run open models via OpenCode Go — translates Anthropic's /v1/messages format to OpenAI-compatible calls, including streaming and tool use.",
      stack: ["Python", "FastAPI", "LiteLLM"],
      badge: "Open source",
      image: "https://placehold.co/800x600/1a1b16/c6f432?text=CC+x+OpenCode",
      imageFallback: null,
      live: "https://github.com/yapsancode/claudecode-X-opencode",
      code: "https://github.com/yapsancode/claudecode-X-opencode",
    },
    {
      title: "Speed Trap Monitoring System",
      year: "2024",
      tagline: "ESP32-based IoT speed monitor with a live Flutter dashboard",
      description:
        "IoT speed monitoring system for a final year project — ESP32 and an IR sensor stream live vehicle-speed readings to a Flutter dashboard via Firebase with 1s latency.",
      stack: ["ESP32", "Arduino", "Flutter", "Firebase"],
      badge: "Final year project",
      image: "https://placehold.co/800x600/1a1a1a/999999?text=Speed+Trap",
      imageFallback: null,
      live: null,
      code: null,
    },
    {
      title: "AI Poster — MLBB Grassroots Poster Intelligence",
      year: "2026",
      tagline: "AI art-direction pipeline for grassroots MLBB tournament posters",
      description:
        "Design-intelligence pipeline turning a structured art-direction brief into tournament posters for Malaysian grassroots MLBB scenes. Not yet production-ready.",
      stack: ["LLM Art-Direction Pipeline", "Image Models"],
      badge: "In progress",
      image: "https://placehold.co/800x600/1a1a1a/999999?text=AI+Poster",
      imageFallback: null,
      live: null,
      code: null,
    },
  ],
} as const;

export type Project = (typeof site.projects)[number];

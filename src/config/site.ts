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

  /** Projects — a clean, scannable list. `live`/`code` are optional. */
  projects: [
    {
      title: "Esportorium",
      year: "2026",
      description:
        "Full-stack MLBB esports tournament platform — bracket management, team registration, and live match tracking for competitive play.",
      stack: ["Next.js", "FastAPI", "PostgreSQL", "Cloud Run"],
      live: null,
      code: null,
    },
    {
      title: "Baymax",
      year: "2026",
      description:
        "Chrome extension that automates AI model deployment to GCP. RAG pipeline + Gemini integration cuts deploy friction from hours to minutes.",
      stack: ["Chrome Extension", "RAG", "Gemini", "GCP"],
      live: null,
      code: null,
    },
    {
      title: "Medical Clinic Booking Platform",
      year: "2025",
      description:
        "Production booking system serving real patients — appointment scheduling, practitioner management, and clinic ops in one platform.",
      stack: ["Flutter Web", "FastAPI", "PostgreSQL"],
      live: null,
      code: null,
    },
  ],
} as const;

export type Project = (typeof site.projects)[number];

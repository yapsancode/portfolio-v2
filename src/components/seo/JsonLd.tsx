import { site } from "@/config/site";

/**
 * Schema.org JSON-LD — the machine-readable layer of the page.
 *
 * This is what answer/generative engines (Google AI Overviews, Perplexity,
 * ChatGPT search, etc.) read to understand *who* this site is about and *what*
 * has been built. A connected `@graph` is more legible to crawlers than loose
 * nodes:
 *   WebSite  ──published by──▶  Person  ◀──main entity──  ProfilePage
 *   Person  ◀──creator──  CreativeWork (one per project)
 *
 * All values come from `site` config, so the structured data can never drift
 * from the visible page.
 */
export default function JsonLd() {
  const base = site.url;
  const personId = `${base}/#person`;
  const siteId = `${base}/#website`;
  const pageId = `${base}/#webpage`;

  // External profiles (GitHub/LinkedIn/...) = `sameAs`, the strongest signal
  // for tying this page to a real-world entity in the knowledge graph.
  const sameAs = site.socials
    .map((s) => s.href)
    .filter((href) => href.startsWith("http"));

  // De-duped union of every project's stack → "things this person knows about".
  const knowsAbout = Array.from(new Set(site.projects.flatMap((p) => p.stack)));

  const person = {
    "@type": "Person",
    "@id": personId,
    name: site.fullName,
    alternateName: site.initials,
    url: `${base}/`,
    image: {
      "@type": "ImageObject",
      url: `${base}/opengraph-image`,
      width: 1200,
      height: 630,
    },
    jobTitle: site.role,
    description: site.about[0],
    email: site.email,
    knowsAbout,
    sameAs,
    address: {
      "@type": "PostalAddress",
      addressCountry: site.location,
    },
  };

  const website = {
    "@type": "WebSite",
    "@id": siteId,
    url: `${base}/`,
    name: `${site.fullName} — ${site.role}`,
    description: site.tagline.statement,
    inLanguage: "en",
    publisher: { "@id": personId },
  };

  const profilePage = {
    "@type": "ProfilePage",
    "@id": pageId,
    url: `${base}/`,
    name: `${site.fullName} — ${site.role}`,
    isPartOf: { "@id": siteId },
    about: { "@id": personId },
    mainEntity: { "@id": personId },
    inLanguage: "en",
  };

  const works = site.projects.map((project) => ({
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    dateCreated: project.year,
    keywords: project.stack.join(", "),
    creator: { "@id": personId },
    ...(project.live ? { url: project.live } : {}),
    ...(project.code ? { codeRepository: project.code } : {}),
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [website, person, profilePage, ...works],
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe to inline; no user input is interpolated.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

import type { MetadataRoute } from "next";
import { site } from "@/config/site";

/**
 * robots.txt — served at /robots.txt.
 *
 * Allow everything: the whole site is public, recruiter-facing content. The
 * blanket `*` rule intentionally welcomes AI answer-engine crawlers (GPTBot,
 * ClaudeBot, PerplexityBot, Google-Extended, etc.) so the site can be surfaced
 * and cited by generative search — that's the point of a public portfolio.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}

import type { MetadataRoute } from "next";
import { site } from "@/config/site";

/**
 * sitemap.xml — served at /sitemap.xml.
 *
 * Single-page site, so a single URL. The on-page sections (#about, #work,
 * #contact) are fragments of this one document, not separate URLs, so they
 * don't belong here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: site.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}

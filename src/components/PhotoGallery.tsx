"use client";

/**
 * PhotoGallery — adapts the site.ts gallery config to the interactive bento
 * gallery primitive (components/ui/interactive-bento-gallery). Content lives in
 * site.ts; this file maps it to the component's `MediaItemType` shape and
 * lazy-loads the (framer-motion-heavy) gallery so it stays out of the initial
 * JS bundle.
 */

import dynamic from "next/dynamic";
import { site } from "@/config/site";

const InteractiveBentoGallery = dynamic(
  () => import("@/components/ui/interactive-bento-gallery"),
  {
    ssr: false,
    // Reserve height so the gallery loading in doesn't shift the page.
    loading: () => <div className="min-h-[60vh]" aria-hidden />,
  },
);

const mediaItems = site.gallery.items.map((item, i) => ({
  id: i + 1,
  type: item.type,
  title: item.title,
  desc: item.desc,
  url: item.src, // the component expects `url`; site.ts uses `src`
  span: item.span,
}));

export default function PhotoGallery() {
  return (
    <InteractiveBentoGallery
      mediaItems={mediaItems}
      title={site.gallery.title}
      description={site.gallery.description}
    />
  );
}

# Project preview images

Hover previews for the Work section (`src/components/ui/selected-projects.tsx`),
referenced from `site.projects[].image` in `src/config/site.ts`.

`image` can be a local file dropped here (e.g. `/projects/foo.jpg`) or a remote
URL. Esportorium currently points at its own live OG image
(`https://esportorium.com/opengraph-image`) so the preview tracks that site
rather than going stale — see the note in `site.ts`.

`imageFallback` covers the primary `image` 404ing, so a missing file degrades to
a placeholder instead of a broken image.

- Rendered at 256×192 CSS px (`md:h-48 md:w-64`), so ~800×600 is plenty.
- Only loaded for **live** projects, on hover-capable pointers.

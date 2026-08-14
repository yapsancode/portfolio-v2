import { site } from "@/config/site";

export default function AboutWindow() {
  return (
    <article className="p-4 leading-relaxed">
      <h1 className="mb-1 text-lg font-bold">{site.name}</h1>
      <p className="mb-4 text-sm text-neutral-600">
        {site.role} — {site.tagline}
      </p>
      {site.about.map((paragraph) => (
        <p key={paragraph.slice(0, 24)} className="mb-3">
          {paragraph}
        </p>
      ))}
      <p className="mt-2 text-xs text-neutral-500">music: {site.music}</p>
      <p className="mt-2 border-t border-win-shadow pt-2 text-xs text-neutral-600">
        {site.inspiration.label}{" "}
        <a
          href={site.inspiration.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-win-navy underline"
        >
          {site.inspiration.url.replace(/^https?:\/\//, "")}
        </a>
      </p>
    </article>
  );
}

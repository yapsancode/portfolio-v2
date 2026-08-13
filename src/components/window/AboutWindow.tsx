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
    </article>
  );
}

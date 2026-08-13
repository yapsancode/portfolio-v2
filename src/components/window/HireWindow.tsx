import { site } from "@/config/site";

export default function HireWindow() {
  return (
    <article className="p-4 leading-relaxed">
      <p className="mb-1 text-xs uppercase tracking-wide text-neutral-600">
        Now interviewing for
      </p>
      <h1 className="mb-1 text-lg font-bold">{site.hireMe.role}</h1>
      <p className="mb-3 text-sm text-neutral-600">{site.hireMe.pitch}</p>

      <ul className="mb-3 space-y-2 text-sm">
        {site.hireMe.wins.map((win) => (
          <li key={win} className="bevel-well bg-win-face p-2">
            <span className="mr-1 text-win-navy">»</span>
            {win}
          </li>
        ))}
      </ul>

      <p className="mb-3 text-sm italic">{site.hireMe.note}</p>
      <p className="mb-3 text-sm">{site.hireMe.cta}</p>

      <p className="flex gap-4 text-sm">
        <a
          href={`mailto:${site.email}`}
          className="text-win-navy underline"
        >
          {site.email}
        </a>
        <a
          href={site.resumeUrl}
          className="text-win-navy underline"
        >
          See my master résumé
        </a>
      </p>
    </article>
  );
}

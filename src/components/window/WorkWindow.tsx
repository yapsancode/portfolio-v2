import { projects } from "@/config/site";

export default function WorkWindow() {
  return (
    <article className="p-4">
      <h1 className="mb-3 text-lg font-bold">Things I&apos;ve shipped</h1>
      <ul className="space-y-4">
        {projects.map((project) => (
          <li key={project.name} className="bevel-well bg-win-face p-3">
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <h2 className="font-bold">{project.name}</h2>
              <span className="text-xs text-neutral-600">{project.year}</span>
            </div>
            <p className="mb-2 text-sm leading-relaxed">{project.impact}</p>
            {project.origin && (
              <p className="mb-2 text-sm leading-relaxed text-neutral-600">{project.origin}</p>
            )}
            <p className="mb-2 flex flex-wrap gap-1">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="bevel-well bg-win-face px-1.5 py-0.5 text-xs"
                >
                  {tech}
                </span>
              ))}
            </p>
            <p className="flex gap-3 text-sm">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-win-navy underline"
                >
                  Live site
                </a>
              )}
              {project.codeUrl && (
                <a
                  href={project.codeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-win-navy underline"
                >
                  Source code
                </a>
              )}
            </p>
          </li>
        ))}
      </ul>
    </article>
  );
}

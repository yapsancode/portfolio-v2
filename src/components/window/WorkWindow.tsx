"use client";

import Image from "next/image";
import { useState } from "react";
import { projects, type Project } from "@/config/site";

const WORK_PATH = "C:\\isyraf\\work";

/** Small pixel prompt, used as the thumbnail for projects with no screenshot. */
function PromptGlyph() {
  return (
    <svg
      viewBox="0 0 16 10"
      className="h-full w-full bg-black"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <g fill="#00ff00">
        <rect x="3" y="2" width="1" height="1" />
        <rect x="4" y="3" width="1" height="1" />
        <rect x="5" y="4" width="1" height="1" />
        <rect x="4" y="5" width="1" height="1" />
        <rect x="3" y="6" width="1" height="1" />
        <rect x="7" y="6" width="4" height="1" />
      </g>
    </svg>
  );
}

function Thumbnail({ project }: { project: Project }) {
  return (
    <span className="bevel-out block h-[70px] w-28 shrink-0 bg-win-face p-1">
      {project.image ? (
        <Image
          src={project.image.src}
          alt=""
          width={224}
          height={140}
          sizes="112px"
          className="h-full w-full object-cover object-top"
        />
      ) : (
        <PromptGlyph />
      )}
    </span>
  );
}

/** The big picture at the top of a project: its screenshot, or a console. */
function Preview({ project }: { project: Project }) {
  if (project.image) {
    return (
      <div className="bevel-in bg-win-face p-0.5">
        {/* Fixed height, so the project's name and description stay in view
            below the picture without scrolling. */}
        <div className="relative h-48 w-full bg-[#202020] sm:h-60">
          <Image
            src={project.image.src}
            alt={project.image.alt}
            fill
            sizes="400px"
            className="object-contain"
          />
        </div>
      </div>
    );
  }

  if (!project.console) return null;

  return (
    <div className="bevel-in bg-win-face p-0.5">
      <div className="bg-black px-3 py-3 font-pixel text-lg leading-tight text-[#00ff00]">
        <p>
          {WORK_PATH}&gt; {project.slug}
        </p>
        {project.console.map((line) => (
          <p key={line}>{line}</p>
        ))}
        <p aria-hidden="true">_</p>
      </div>
    </div>
  );
}

const linkButton =
  "bevel-out bg-win-face px-3 py-1.5 font-pixel text-base leading-none text-black focus-visible:outline-1 focus-visible:-outline-offset-4 focus-visible:outline-dotted focus-visible:outline-black active:translate-x-px active:translate-y-px";

export default function WorkWindow() {
  const [selected, setSelected] = useState<Project | null>(null);
  // Remembers which project was open, so keyboard focus returns to its row.
  const [lastOpened, setLastOpened] = useState<string | null>(null);

  const address = selected ? `${WORK_PATH}\\${selected.slug}` : WORK_PATH;

  return (
    <div className="flex h-full min-h-0 flex-col bg-win-face p-1">
      <div className="mb-1 flex shrink-0 items-center gap-2">
        {selected && (
          <button
            type="button"
            autoFocus
            className="bevel-out shrink-0 bg-win-face px-3 py-1 font-pixel text-base leading-none active:translate-x-px active:translate-y-px"
            onClick={() => setSelected(null)}
          >
            Back
          </button>
        )}
        <span className="shrink-0 font-pixel text-base">Address</span>
        <div className="bevel-in min-w-0 flex-1 truncate bg-white px-2 py-1 font-content text-xs">
          {address}
        </div>
      </div>

      {/* Keyed so the scroll position resets when moving between views. */}
      <div
        key={selected?.slug ?? "folder"}
        className="bevel-in min-h-0 flex-1 overflow-auto bg-white"
      >
        {selected ? (
          <article className="mx-auto max-w-2xl p-3">
            <Preview project={selected} />
            <div className="mt-3 flex items-baseline justify-between gap-3">
              <h1 className="text-lg font-bold">{selected.name}</h1>
              <span className="shrink-0 font-pixel text-lg leading-none text-neutral-600">
                {selected.year}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed">{selected.impact}</p>
            {selected.story && (
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                {selected.story}
              </p>
            )}
            <p className="mt-3 flex flex-wrap gap-1">
              {selected.stack.map((tech) => (
                <span
                  key={tech}
                  className="bevel-well bg-win-face px-1.5 py-0.5 text-xs"
                >
                  {tech}
                </span>
              ))}
            </p>
            {(selected.liveUrl || selected.codeUrl) && (
              <p className="mt-4 flex flex-wrap gap-2">
                {selected.liveUrl && (
                  <a
                    href={selected.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkButton}
                  >
                    Live site
                  </a>
                )}
                {selected.codeUrl && (
                  <a
                    href={selected.codeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkButton}
                  >
                    Source code
                  </a>
                )}
              </p>
            )}
          </article>
        ) : (
          <div className="p-2">
            <h1 className="px-2 pt-1 text-lg font-bold">Things I&apos;ve shipped</h1>
            <p className="mb-2 px-2 text-sm text-neutral-600">
              Open a project to see more.
            </p>
            <ul>
              {projects.map((project) => (
                <li key={project.slug}>
                  <button
                    type="button"
                    autoFocus={lastOpened === project.slug}
                    className="group flex w-full items-center gap-3 border border-dotted border-transparent p-2 text-left hover:border-win-navy hover:bg-win-navy hover:text-white focus-visible:border-win-navy focus-visible:bg-win-navy focus-visible:text-white focus-visible:outline-none"
                    onClick={() => {
                      setLastOpened(project.slug);
                      setSelected(project);
                    }}
                  >
                    <Thumbnail project={project} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="font-bold">{project.name}</span>
                        <span className="shrink-0 font-pixel text-base leading-none text-neutral-600 group-hover:text-white group-focus-visible:text-white">
                          {project.year}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-sm leading-snug text-neutral-700 group-hover:text-white group-focus-visible:text-white">
                        {project.summary}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="bevel-well mt-1 shrink-0 px-2 py-0.5 font-pixel text-base leading-none">
        {selected
          ? `${selected.name} (${selected.year})`
          : `${projects.length} object(s)`}
      </div>
    </div>
  );
}

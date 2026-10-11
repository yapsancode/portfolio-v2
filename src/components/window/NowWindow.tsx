import { now } from "@/config/site";

const PROMPT = "C:\\isyraf>";

export default function NowWindow() {
  return (
    <article className="terminal min-h-full p-3">
      <p className="terminal-dim" aria-hidden="true">
        {PROMPT} type now.txt
      </p>
      <h1 className="terminal-bright mt-2">What I&apos;m doing now</h1>
      <p className="terminal-dim mb-4">
        Last updated: Sep 2026. A snapshot of what has my attention right now.
      </p>
      <ol className="space-y-4">
        {now.map((item, index) => (
          <li key={item.label}>
            <p className="terminal-bright">
              <span aria-hidden="true">[{index + 1}] </span>
              {item.label}
            </p>
            <p className="pl-[2.2em]">{item.detail}</p>
          </li>
        ))}
      </ol>
      <p className="terminal-dim mt-4" aria-hidden="true">
        {PROMPT} <span className="terminal-cursor" />
      </p>
    </article>
  );
}

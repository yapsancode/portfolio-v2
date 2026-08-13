import { now } from "@/config/site";

export default function NowWindow() {
  return (
    <article className="p-4 leading-relaxed">
      <h1 className="mb-1 text-lg font-bold">What I&apos;m doing now</h1>
      <p className="mb-4 text-sm text-neutral-600">
        Last updated: Aug 2026. The honest version of &quot;currently
        exploring opportunities&quot;.
      </p>
      <ul className="space-y-3">
        {now.map((item) => (
          <li key={item.label} className="bevel-well bg-win-face p-3">
            <p className="mb-1 text-sm font-bold">{item.label}</p>
            <p className="text-sm leading-relaxed">{item.detail}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}

import { site } from "@/config/site";

export default function ContactWindow() {
  return (
    <article className="p-4 leading-relaxed">
      <h1 className="mb-1 text-lg font-bold">Say hello</h1>
      <p className="mb-4 text-sm">
        I&apos;m open to junior fullstack / frontend roles — remote or in
        Malaysia, Singapore, or anywhere in between.
      </p>

      <ul className="mb-4 space-y-2 text-sm">
        <li>
          <span className="font-bold">Email: </span>
          <a
            href={`mailto:${site.email}`}
            className="text-win-navy underline"
          >
            {site.email}
          </a>
        </li>
        {site.socials.map((social) => (
          <li key={social.label}>
            <span className="font-bold">{social.label}: </span>
            <a
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-win-navy underline"
            >
              {social.url.replace(/^https?:\/\//, "")}
            </a>
          </li>
        ))}
      </ul>

      <a
        href={site.resumeUrl}
        className="taskbar-btn inline-flex"
        style={{ height: "28px" }}
      >
        Download résumé
      </a>
    </article>
  );
}

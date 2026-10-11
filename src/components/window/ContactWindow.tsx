"use client";

import { useState } from "react";
import { site } from "@/config/site";

const toolButton =
  "bevel-out bg-win-face px-3 py-1 font-pixel text-base leading-none text-black focus-visible:outline-1 focus-visible:-outline-offset-4 focus-visible:outline-dotted focus-visible:outline-black active:translate-x-px active:translate-y-px";

const field =
  "bevel-in min-w-0 bg-white px-2 py-1 font-content text-base focus:outline-1 focus:outline-win-navy sm:text-sm";

/** Status bar messages. */
const STATUS = {
  idle: "Send opens your email app.",
  copied: "Address copied.",
  blocked: "Could not copy. Select the address above instead.",
} as const;

/** Builds the link that hands the draft to the visitor's own email app. */
function buildMailto(subject: string, message: string): string {
  const params: string[] = [];
  if (subject.trim()) params.push(`subject=${encodeURIComponent(subject)}`);
  if (message.trim()) params.push(`body=${encodeURIComponent(message)}`);
  return `mailto:${site.email}${params.length ? `?${params.join("&")}` : ""}`;
}

export default function ContactWindow() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string>(STATUS.idle);

  const copyAddress = () => {
    // Some browsers block clipboard access; say so instead of failing silently.
    void navigator.clipboard
      .writeText(site.email)
      .then(
        () => setStatus(STATUS.copied),
        () => setStatus(STATUS.blocked)
      )
      .then(() => setTimeout(() => setStatus(STATUS.idle), 3000));
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-win-face p-1">
      <h1 className="sr-only">Contact {site.shortName}</h1>

      {/* Toolbar */}
      <div className="mb-1 flex shrink-0 flex-wrap items-center gap-1">
        <a href={buildMailto(subject, message)} className={toolButton}>
          Send
        </a>
        <button type="button" className={toolButton} onClick={copyAddress}>
          Copy address
        </button>
      </div>

      {/* Message header */}
      <div className="mb-1 grid shrink-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2 gap-y-1">
        <span className="font-pixel text-base">To:</span>
        <div className={`${field} truncate`}>
          <a href={`mailto:${site.email}`} className="text-win-navy underline">
            {site.email}
          </a>
        </div>

        <span className="font-pixel text-base">Also at:</span>
        <ul className="flex flex-wrap gap-x-3 gap-y-1 px-2 py-1 text-sm">
          {site.socials.map((social) => (
            <li key={social.label}>
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-win-navy underline"
              >
                {social.label}
              </a>
            </li>
          ))}
        </ul>

        <label htmlFor="contact-subject" className="font-pixel text-base">
          Subject:
        </label>
        <input
          id="contact-subject"
          type="text"
          autoComplete="off"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={field}
        />
      </div>

      <label htmlFor="contact-message" className="sr-only">
        Message
      </label>
      <textarea
        id="contact-message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write your message here."
        className={`${field} win-scroll min-h-24 flex-1 resize-none leading-relaxed`}
      />

      <div
        role="status"
        className="bevel-well mt-1 shrink-0 px-2 py-0.5 font-pixel text-base leading-none"
      >
        {status}
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { challengeText, shareDate, shareImagePath, sharePath, type SharedScore } from "@/lib/games/olympus/sharing";

export default function ShareActions({ score }: { score: SharedScore }) {
  const [image, setImage] = useState<{ file: File; url: string } | null>(null);
  const [imageError, setImageError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [nativeShare, setNativeShare] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [message, setMessage] = useState("");
  const [manualCopy, setManualCopy] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | undefined;
    // Fetch first; the final Share click must retain the browser's user activation.
    fetch(shareImagePath(score.id), { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15_000)]) }).then(async (response) => {
      if (!response.ok || !response.headers.get("content-type")?.startsWith("image/png")) throw new Error();
      const blob = await response.blob();
      if (controller.signal.aborted) return;
      const file = new File([blob], `olympus-${score.name}-${score.score}.png`, { type: "image/png" });
      objectUrl = URL.createObjectURL(blob);
      setImage({ file, url: objectUrl });
      setNativeShare(typeof navigator.share === "function");
    }).catch(() => { if (!controller.signal.aborted) { setImageError(true); setNativeShare(typeof navigator.share === "function"); } });
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [score.id, score.name, score.score, attempt]);

  const url = () => new URL(sharePath(score.id), window.location.origin).href;
  const share = async () => {
    if (sharing) return;
    setSharing(true); setMessage("");
    try {
      if (image && navigator.canShare?.({ files: [image.file] })) {
        await navigator.share({ files: [image.file], title: "Olympus · Challenge accepted", text: challengeText(score), url: url() });
      } else {
        await navigator.share({ title: "Beat my Olympus haul", text: challengeText(score), url: url() });
      }
      setMessage("Handed to your share menu. Finish posting in your chosen app.");
    } catch (error) {
      // Closing the share sheet is normal; never start another share automatically.
      if (!(error instanceof Error && error.name === "AbortError")) setMessage("Sharing is unavailable here. Save the image or copy the challenge instead.");
    } finally { setSharing(false); }
  };
  const copy = async () => {
    const text = `${challengeText(score)}\n${url()}`;
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Challenge copied. Paste it into your post or message.");
      setManualCopy("");
    } catch {
      setManualCopy(text);
      setMessage("Select and copy the challenge below.");
    }
  };

  return (
    <div className="olympus-share-content">
      <div className="olympus-share-preview" aria-busy={!image && !imageError}>
        {image ? <Image unoptimized src={image.url} width={1200} height={630}
          alt={`${score.name}: ${score.score.toLocaleString("en")} marble collected, level ${score.level} ${score.outcome === "won" ? "cleared" : "reached"}${score.rank ? `, number ${score.rank} when this card was created on ${shareDate(score.sharedAt)}` : ""}. Think you can beat it?`} />
          : imageError ? <div><p>The card couldn’t load. You can still copy the challenge.</p>
            <button className="olympus-score-link" type="button" onClick={() => { setImageError(false); setAttempt(value => value + 1); }}>Retry card</button></div>
            : <p role="status">Preparing your haul card<span aria-hidden="true">...</span></p>}
      </div>
      <div className="olympus-share-actions">
        {nativeShare && <button type="button" className="olympus-button olympus-button-primary" disabled={sharing} onClick={share}>{sharing ? "Sharing..." : "Share"}</button>}
        {image && <a className={`olympus-button${nativeShare ? "" : " olympus-button-primary"}`} href={image.url} download={image.file.name}>Save image</a>}
        <button type="button" className="olympus-button" onClick={copy}>Copy challenge</button>
      </div>
      <p className="olympus-share-feedback" role="status">{message || "Your haul. Their next challenge."}</p>
      {manualCopy && <textarea className="olympus-share-copy" aria-label="Challenge text to copy" readOnly value={manualCopy} onFocus={event => event.target.select()} />}
      <p className="olympus-share-note">{score.rank ? `#${score.rank} when this card was created · ${shareDate(score.sharedAt)} (UTC). Rankings can change.` : "A saved result from Olympus."} Save the image to post it to Stories.</p>
    </div>
  );
}

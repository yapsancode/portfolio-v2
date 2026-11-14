import type { Metadata } from "next";
import OlympusGame from "@/components/game/OlympusGame";
import { site } from "@/config/site";

const title = "Olympus — Swipe & Smash";
const description = "Swipe. Smash the desktop. Annoy a god. A free one-thumb game with no timer. Play a little, pick it up later.";
export const metadata: Metadata = {
  title, description,
  alternates: { canonical: `${site.url}/olympus` },
  openGraph: { title, description, url: `${site.url}/olympus`, type: "website" },
  twitter: { card: "summary", title, description },
};

export default function OlympusPage() {
  return <OlympusGame />;
}

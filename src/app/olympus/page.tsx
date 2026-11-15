import type { Metadata } from "next";
import Desktop from "@/components/desktop/Desktop";

export const metadata: Metadata = {
  title: "Play Olympus",
  description: "Play Olympus, a retro arcade game on Isyraf's desktop. Rotate your phone to landscape to play.",
  alternates: { canonical: "/olympus" },
  openGraph: {
    title: "Play Olympus",
    description: "A retro arcade battle on Isyraf's desktop.",
    url: "/olympus",
  },
};

export default function OlympusPage() {
  return <Desktop launchOlympus />;
}

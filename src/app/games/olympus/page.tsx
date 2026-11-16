import type { Metadata } from "next";
import Desktop from "@/components/desktop/Desktop";

export const metadata: Metadata = {
  title: "Play Olympus",
  manifest: "/olympus.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Olympus",
    statusBarStyle: "black-translucent",
  },
  description: "Play Olympus, a retro arcade game on Isyraf's desktop. Rotate your phone to landscape to play.",
  alternates: { canonical: "/games/olympus" },
  openGraph: {
    title: "Play Olympus",
    description: "A retro arcade battle on Isyraf's desktop.",
    url: "/games/olympus",
  },
};

export default function OlympusPage() {
  return <Desktop launch="olympus" />;
}

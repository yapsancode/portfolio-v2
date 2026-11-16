import type { Metadata } from "next";
import Desktop from "@/components/desktop/Desktop";

export const metadata: Metadata = {
  title: "Games",
  description: "Games on Isyraf's retro desktop.",
  alternates: { canonical: "/games" },
};

export default function GamesPage() {
  return <Desktop launch="games" />;
}

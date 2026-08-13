import type { ComponentType } from "react";
import type { WindowId } from "@/config/site";
import AboutWindow from "./AboutWindow";
import WorkWindow from "./WorkWindow";
import ContactWindow from "./ContactWindow";
import NowWindow from "./NowWindow";

/**
 * Maps a window id to the component rendered inside the window frame.
 * Adding a new window = one registry entry + one content component.
 * No changes needed in Desktop.tsx or Window.tsx.
 */
export const windowRegistry: Record<WindowId, ComponentType> = {
  about: AboutWindow,
  work: WorkWindow,
  contact: ContactWindow,
  now: NowWindow,
};

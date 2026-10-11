"use client";

import { useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import type { WindowId } from "@/config/site";
import { desktopIcons } from "@/config/site";
import PixelIcon, { type PixelIconName } from "./PixelIcon";
import { useMusic } from "./music";

export type StartMenuProps = {
  /** `restoreFocus` is true when the menu was closed from the keyboard. */
  onClose: (restoreFocus: boolean) => void;
  onOpenWindow: (id: WindowId) => void;
  onShutDown: () => void;
};

function Item({
  icon,
  label,
  onClick,
}: {
  icon: PixelIconName;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className="start-menu-item"
      onClick={onClick}
    >
      <PixelIcon name={icon} size={32} className="shrink-0" />
      {label}
    </button>
  );
}

export default function StartMenu({
  onClose,
  onOpenWindow,
  onShutDown,
}: StartMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { stop } = useMusic();

  const items = () =>
    Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []
    );

  // Opening the menu puts keyboard focus on its first item.
  useEffect(() => {
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      // Keep Escape from also closing the active window behind the menu.
      e.stopPropagation();
      onClose(true);
      return;
    }
    if (e.key === "Tab") {
      onClose(false);
      return;
    }
    const all = items();
    const index = all.indexOf(document.activeElement as HTMLElement);
    let next = -1;
    if (e.key === "ArrowDown") next = (index + 1) % all.length;
    if (e.key === "ArrowUp") next = (index - 1 + all.length) % all.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = all.length - 1;
    if (next === -1) return;
    e.preventDefault();
    all[next]?.focus();
  };

  const open = (id: WindowId) => {
    onClose(false);
    onOpenWindow(id);
  };

  return (
    <>
      {/* click-away layer */}
      <div
        className="fixed inset-0 z-40"
        onClick={() => onClose(false)}
        aria-hidden="true"
      />
      <div
        ref={menuRef}
        className="start-menu bevel-out absolute bottom-full left-1 z-50 mb-1"
        role="menu"
        aria-label="Start menu"
        onKeyDown={onKeyDown}
      >
        <div className="start-menu-strip" aria-hidden="true">
          <span>
            Isyraf <span className="start-menu-strip-98">98</span>
          </span>
        </div>
        <div className="min-w-0 flex-1">
          {desktopIcons.map((icon) => (
            <Item
              key={icon.id}
              icon={icon.icon}
              label={icon.label}
              onClick={() => open(icon.opens)}
            />
          ))}
          <div className="start-menu-separator" role="separator" />
          <Item icon="cd" label="Music player" onClick={() => open("music")} />
          <div className="start-menu-separator" role="separator" />
          <Item
            icon="power"
            label="Shut Down..."
            onClick={() => {
              onClose(false);
              stop();
              onShutDown();
            }}
          />
        </div>
      </div>
    </>
  );
}

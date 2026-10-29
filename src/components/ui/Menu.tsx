"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type MenuItem = { label: string; href?: string; onSelect?: () => void };

const GAP = 8;
const EDGE = 16;

/**
 * Small dropdown menu. It opens in a layer above the page, so a card can never clip it, and it opens
 * upwards when there is not enough room below (bottom of the screen, above the phone's bottom bar).
 * Closes on outside click, Escape, scroll or selection.
 */
export function Menu({
  trigger,
  label,
  items,
  header,
  triggerClassName = "flex items-center rounded-full focus-visible:focus-ring",
  align = "end",
}: {
  trigger: React.ReactNode;
  label: string;
  items: MenuItem[];
  header?: React.ReactNode;
  triggerClassName?: string;
  /** Which edge of the trigger the menu lines up with. "start" for menus on the left of a card. */
  align?: "start" | "end";
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; up: boolean } | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  const place = useCallback(() => {
    const b = button.current?.getBoundingClientRect();
    const m = menu.current;
    if (!b || !m) return;
    const h = m.offsetHeight;
    const w = m.offsetWidth;
    // The phone's floating bottom bar covers the last part of the screen.
    const bottomBar = document.querySelector<HTMLElement>("[data-bottom-bar]")?.getBoundingClientRect();
    const floor = bottomBar && bottomBar.height > 0 ? bottomBar.top : window.innerHeight;
    const below = floor - b.bottom - GAP;
    const above = b.top - GAP;
    const up = below < h + EDGE && above > below;
    const left = Math.min(Math.max(EDGE, align === "end" ? b.right - w : b.left), window.innerWidth - w - EDGE);
    setPos({ top: up ? b.top - GAP - h : b.bottom + GAP, left, up });
  }, [align]);

  useLayoutEffect(() => {
    if (open) place();
    else setPos(null);
  }, [open, place]);

  // Keyboard: focus the first item on open; arrows move, Home and End jump, Tab closes.
  useEffect(() => {
    if (open && pos) menu.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, [open, pos]);
  const onMenuKey = (e: React.KeyboardEvent) => {
    const items = Array.from(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    const i = items.indexOf(document.activeElement as HTMLElement);
    const go = (n: number) => {
      e.preventDefault();
      items[(n + items.length) % items.length]?.focus();
    };
    if (e.key === "ArrowDown") go(i + 1);
    else if (e.key === "ArrowUp") go(i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(items.length - 1);
    else if (e.key === "Tab") {
      setOpen(false);
      button.current?.focus();
    }
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!button.current?.contains(t) && !menu.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const close = () => setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const itemClass = "flex min-h-10 w-full items-center rounded-sm px-3 text-left text-body-sm text-primary hover:bg-primary-50 focus-visible:focus-ring";

  return (
    <>
      <button ref={button} type="button" aria-label={label} aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((o) => !o)} className={triggerClassName}>
        {trigger}
      </button>
      {open &&
        createPortal(
          <div
            ref={menu}
            role="menu"
            aria-label={label}
            onKeyDown={onMenuKey}
            style={{ top: pos?.top ?? 0, left: pos?.left ?? 0 }}
            className={`fixed z-50 w-64 rounded-md border border-border bg-card p-2 shadow-lg ${pos ? "visible" : "invisible"}`}
          >
            {header && <div className="mb-2 border-b border-border px-3 pb-3 pt-1">{header}</div>}
            {items.map((item) =>
              item.href ? (
                <Link key={item.label} href={item.href} role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  className={itemClass}
                  onClick={() => {
                    setOpen(false);
                    item.onSelect?.();
                  }}
                >
                  {item.label}
                </button>
              ),
            )}
          </div>,
          document.body,
        )}
    </>
  );
}

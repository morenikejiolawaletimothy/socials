"use client";

import type { Icon } from "@phosphor-icons/react";
import { Info } from "@phosphor-icons/react/dist/ssr";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const GAP = 8;
const EDGE = 16;

/**
 * Info icon that shows a short explanation on hover, keyboard focus or tap.
 * Use it beside a card title (`Card info=...`) for notes that explain how something works.
 * The text opens in a layer above the page, so a card can never clip it, and flips above the icon near the bottom.
 */
export function InfoTip({ children, label = "More information", icon: IconCmp = Info }: { children: React.ReactNode; label?: string; icon?: Icon }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  const id = useId();

  const place = useCallback(() => {
    const b = button.current?.getBoundingClientRect();
    const t = tip.current;
    if (!b || !t) return;
    const h = t.offsetHeight;
    const w = t.offsetWidth;
    const below = window.innerHeight - b.bottom - GAP;
    const up = below < h + EDGE && b.top > below;
    const left = Math.min(Math.max(EDGE, b.left + b.width / 2 - w / 2), window.innerWidth - w - EDGE);
    setPos({ top: up ? b.top - GAP - h : b.bottom + GAP, left });
  }, []);

  useLayoutEffect(() => {
    if (open) place();
    else setPos(null);
  }, [open, place]);

  // Close on Escape, scroll, or a tap outside.
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onDown = (e: PointerEvent) => {
      if (!button.current?.contains(e.target as Node)) close();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <>
      <button
        ref={button}
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-primary-600 transition-colors hover:text-primary-700 focus-visible:focus-ring"
      >
        <IconCmp className="size-5" aria-hidden />
      </button>
      {open &&
        createPortal(
          <div
            ref={tip}
            id={id}
            role="tooltip"
            style={{ top: pos?.top ?? 0, left: pos?.left ?? 0, visibility: pos ? "visible" : "hidden" }}
            className="pointer-events-none fixed z-50 w-max max-w-xs rounded-md bg-dark px-3 py-2 font-sans text-body-sm text-inverse shadow-md"
          >
            {children}
          </div>,
          // Inside a modal dialog the tooltip must render in the dialog, which sits above the page.
          button.current?.closest("dialog") ?? document.body,
        )}
    </>
  );
}

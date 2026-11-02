"use client";

import Link from "next/link";
import { createContext, useContext } from "react";

const Flush = createContext(false);

/**
 * A compact list inside a card (invoices, settings, a team, activity): one hairline-bordered group, rows divided
 * by lines, 16px side padding. Use Tiles instead when each item needs a footer or a picture.
 * `flush` drops the outer border for a list that fills a card with `padding="none"` (rows then use 24px sides).
 */
export function Rows({ children, flush = false, label, className = "" }: { children: React.ReactNode; flush?: boolean; label?: string; className?: string }) {
  return (
    <Flush.Provider value={flush}>
      <ul aria-label={label} className={`flex flex-col ${flush ? "" : "overflow-hidden rounded-md border border-border"} ${className}`}>
        {children}
      </ul>
    </Flush.Provider>
  );
}

const rowBase = "flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border last:border-b-0";

/**
 * One row of `Rows`: content on the left (title 14px medium or 16px, a grey line under it), then whatever sits on
 * the right (amount, Badge, a small button or an icon button). With `href` the whole row is the link.
 */
export function Row({ href, children, className = "" }: { href?: string; children: React.ReactNode; className?: string }) {
  const pad = useContext(Flush) ? "px-6 py-4" : "px-4 py-3";
  if (href) {
    return (
      <li className="border-b border-border last:border-b-0">
        <Link href={href} className={`${rowBase} ${pad} border-b-0 transition-colors hover:bg-primary-50 focus-visible:focus-ring ${className}`}>
          {children}
        </Link>
      </li>
    );
  }
  return <li className={`${rowBase} ${pad} ${className}`}>{children}</li>;
}

/** The text block at the start of a row or tile: a title and an optional grey line. */
export function RowText({ title, sub, size = "sm" }: { title: React.ReactNode; sub?: React.ReactNode; size?: "sm" | "md" }) {
  return (
    <span className="flex min-w-0 flex-1 flex-col gap-1">
      <span className={`${size === "md" ? "text-body" : "text-body-sm"} font-medium text-primary`}>{title}</span>
      {sub && <span className={`${size === "md" ? "text-body-sm" : "text-caption"} text-secondary`}>{sub}</span>}
    </span>
  );
}

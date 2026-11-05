"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { pageName } from "./nav";

/**
 * Remembers the page the person was on before this one, so a breadcrumb can take them back to exactly where they
 * came from (Home, Messages, Notifications...) instead of one fixed route. Kept for the browser tab only.
 */
const KEY = "bluecut:came-from";
type Trail = { current?: string; previous?: string };

function read(): Trail {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? "{}") as Trail;
  } catch {
    return {};
  }
}

/** Called once in the app shell: records every page change. */
export function useTrackPath() {
  const pathname = usePathname();
  useEffect(() => {
    const t = read();
    if (t.current !== pathname) sessionStorage.setItem(KEY, JSON.stringify({ previous: t.current, current: pathname }));
  }, [pathname]);
}

/**
 * The page the person came from, as a crumb, or `fallback` when it is unknown (opened directly, or a page without a name).
 * Pages render before the shell records the change, so the last recorded page may still be the one before this.
 */
export function useCameFrom(fallback: { label: string; href?: string }) {
  const pathname = usePathname();
  const [crumb, setCrumb] = useState(fallback);
  useEffect(() => {
    const t = read();
    const from = t.current && t.current !== pathname ? t.current : t.previous;
    const label = from && from !== pathname ? pageName(from) : undefined;
    if (from && label && label !== "Bluecut Socials") setCrumb({ label, href: from });
    // Only on arrival: the fallback object is recreated on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  return crumb;
}

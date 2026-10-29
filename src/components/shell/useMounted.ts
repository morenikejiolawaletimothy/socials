"use client";

import { useEffect, useState } from "react";

/**
 * Phase 1: demo data lives in the browser (and dates are relative to now), so pages render after mount.
 * Moving to another page waits a moment as if loading from the server, so loading states are seen and designed.
 * Phase 2 replaces this with real loading (Next.js loading.tsx and data fetching).
 */
// The first page shows as soon as the demo data is read; only moves between pages show the loading state.
let firstShown = false;

export function usePageReady(key: string, ms = 300) {
  const [readyKey, setReadyKey] = useState<string | null>(null);
  useEffect(() => {
    const wait = firstShown ? ms : 0;
    const t = setTimeout(() => {
      firstShown = true;
      setReadyKey(key);
    }, wait);
    return () => clearTimeout(t);
  }, [key, ms]);
  return readyKey === key;
}

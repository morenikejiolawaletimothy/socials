"use client";

import { useEffect, useState } from "react";

/**
 * Phase 1: demo data lives in the browser (and dates are relative to now), so pages render after mount.
 * Each page also waits a moment as if loading from the server, so loading states are seen and designed.
 * Phase 2 replaces this with real loading (Next.js loading.tsx and data fetching).
 */
export function usePageReady(key: string, ms = 400) {
  const [readyKey, setReadyKey] = useState<string | null>(null);
  useEffect(() => {
    const t = setTimeout(() => setReadyKey(key), ms);
    return () => clearTimeout(t);
  }, [key, ms]);
  return readyKey === key;
}

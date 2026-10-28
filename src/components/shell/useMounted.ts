"use client";

import { useEffect, useState } from "react";

/**
 * Phase 1: demo data lives in the browser (and dates are relative to now), so pages render after mount.
 * This avoids server and browser showing different text. Phase 2 data comes from the server and drops this.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

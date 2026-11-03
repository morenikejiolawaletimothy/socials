// The swap between steps of one auth form (email, then password). Short and quiet.
export const step = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
  transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const },
};

/**
 * C18: where to go after signing in. A notification link opened while signed out comes here as
 * /signin?next=/tasks/t1, and the person lands on that exact page, not Home. Only paths on this site are used.
 */
export function afterSignIn(home: string) {
  if (typeof window === "undefined") return home;
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : home;
}

/** Keeps ?next= when moving between sign-in steps. */
export function keepNext(path: string) {
  if (typeof window === "undefined") return path;
  const next = new URLSearchParams(window.location.search).get("next");
  return next ? `${path}?next=${encodeURIComponent(next)}` : path;
}

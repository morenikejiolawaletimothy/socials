const fallback = ["Africa/Lagos", "Africa/Accra", "Africa/Nairobi", "Africa/Johannesburg", "Europe/London", "America/Toronto", "America/New_York"];

/**
 * Every time zone the browser knows (about 400), grouped by region as the names already are.
 * Falls back to a short list on old browsers. Always includes `current`, so a saved zone never disappears.
 */
export function timeZones(current?: string) {
  let all: string[] = fallback;
  try {
    all = Intl.supportedValuesOf("timeZone");
  } catch {
    // Older browsers: the short list.
  }
  return current && !all.includes(current) ? [current, ...all] : all;
}

/** "America/New_York" as "America, New York". */
export const zoneLabel = (z: string) => z.replaceAll("_", " ").replace("/", ", ").replaceAll("/", ", ");

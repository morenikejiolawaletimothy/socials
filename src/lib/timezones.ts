/** Time zones people can choose in Account and Profile. Phase 2 can widen this to the full IANA list. */
export const zones = ["Africa/Lagos", "Africa/Accra", "Africa/Nairobi", "Africa/Johannesburg", "Europe/London", "America/Toronto", "America/New_York"];

/** "Africa/Lagos" as "Africa, Lagos". */
export const zoneLabel = (z: string) => z.replace("_", " ").replace("/", ", ");

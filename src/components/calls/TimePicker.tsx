"use client";

import { day, time } from "@/lib/format";
import { slotTimes } from "@/lib/slots";

/** Bookable times for the next `days` days, from the manager's open slots (M10). */
export const openTimes = (slots: string[], from: number, days = 14) => slotTimes(slots, from, days);

/**
 * Times grouped by day: one bordered group, a row per day with the day on the left and its
 * times in an even grid. Shared by onboarding (C3) and the ongoing "book a call" flow.
 */
export function TimePicker({
  times,
  value,
  onChange,
  maxDays = 6,
}: {
  times: string[];
  value: string | null;
  onChange: (t: string) => void;
  maxDays?: number;
}) {
  const days = times.reduce<Record<string, string[]>>((acc, t) => {
    const k = day(t);
    (acc[k] ??= []).push(t);
    return acc;
  }, {});
  return (
    <div className="flex flex-col divide-y divide-border rounded-md border border-border">
      {Object.entries(days)
        .slice(0, maxDays)
        .map(([d, ts]) => (
          <div key={d} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-6">
            <span className="text-body-sm font-medium text-primary sm:w-28 sm:shrink-0 sm:pt-3">{d}</span>
            <div className="grid flex-1 grid-cols-3 gap-2 sm:grid-cols-4">
              {ts.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={value === t}
                  onClick={() => onChange(t)}
                  className={`min-h-11 w-full rounded-md border px-3 text-body-sm font-medium transition-colors focus-visible:focus-ring ${
                    value === t ? "border-primary-600 bg-primary-600 text-inverse" : "border-border-strong bg-card text-primary-700 hover:border-primary-300 hover:bg-primary-50"
                  }`}
                >
                  {time(t)}
                </button>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

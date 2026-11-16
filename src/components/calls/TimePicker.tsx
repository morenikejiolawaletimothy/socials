"use client";

import { day, time } from "@/lib/format";
import type { Call } from "@/lib/mock";
import { slotTimes } from "@/lib/slots";

/** Bookable times for the next `days` days, from the manager's open slots (M10). */
export const openTimes = (slots: string[], from: number, days = 14) => slotTimes(slots, from, days);

/** Times already held by a manager's live calls (pending or booked), so no two clients take the same slot. */
export const takenTimes = (calls: Call[], managerId: string, exceptCallId?: string) =>
  new Set(
    calls
      .filter((c) => c.managerId === managerId && (c.status === "booked" || c.status === "pending") && c.id !== exceptCallId)
      .map((c) => c.at),
  );

/** Open times for the next `days` days with the manager's held times removed. */
export const availableTimes = (slots: string[], from: number, taken: Set<string>, days = 14) =>
  openTimes(slots, from, days).filter((t) => !taken.has(t));

/**
 * Times grouped by day: one bordered group, a row per day with the day on the left and its times in an
 * even grid. Shared by onboarding (C3), booking and the negotiation flow. Pass `selected` (an array) to
 * let the person pick several times; otherwise it is a single-choice picker.
 */
export function TimePicker({
  times,
  value,
  onChange,
  selected,
  maxDays = 6,
}: {
  times: string[];
  value?: string | null;
  onChange: (t: string) => void;
  /** When given, the picker is multi-select and highlights every time in this list. */
  selected?: string[];
  maxDays?: number;
}) {
  const days = times.reduce<Record<string, string[]>>((acc, t) => {
    const k = day(t);
    (acc[k] ??= []).push(t);
    return acc;
  }, {});
  const isOn = (t: string) => (selected ? selected.includes(t) : value === t);
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
                  aria-pressed={isOn(t)}
                  onClick={() => onChange(t)}
                  className={`min-h-11 w-full rounded-md border px-3 text-body-sm font-medium transition-colors focus-visible:focus-ring ${
                    isOn(t) ? "border-primary-600 bg-primary-600 text-inverse" : "border-border-strong bg-card text-primary-700 hover:border-primary-300 hover:bg-primary-50"
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

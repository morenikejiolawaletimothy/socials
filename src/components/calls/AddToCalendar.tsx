"use client";

import { CalendarPlus } from "@phosphor-icons/react";
import { Menu, useToast } from "@/components/ui";
import { downloadCall, googleCalendarUrl, outlookCalendarUrl, type CalEvent } from "@/lib/calendar";

/**
 * #51: one "Add to calendar" control that fits every calendar app. Google and Outlook open a prefilled event in a new
 * tab; Apple and others download a universal .ics file. Shown on the booking confirmation and on the Calls page.
 */
export function AddToCalendar({ event, align = "start" }: { event: CalEvent; align?: "start" | "end" }) {
  const toast = useToast();
  const open = (url: string) => window.open(url, "_blank", "noopener,noreferrer");
  return (
    <Menu
      label="Add to calendar"
      align={align}
      triggerClassName="inline-flex items-center gap-2 rounded-sm text-body-sm font-medium text-primary-700 hover:text-primary-900 hover:underline focus-visible:focus-ring"
      trigger={
        <>
          <CalendarPlus className="size-4" aria-hidden /> Add to calendar
        </>
      }
      header={<span className="text-caption text-secondary">Save this call to your calendar</span>}
      items={[
        { label: "Google Calendar", onSelect: () => open(googleCalendarUrl(event)) },
        { label: "Outlook", onSelect: () => open(outlookCalendarUrl(event)) },
        {
          label: "Apple or other (.ics)",
          onSelect: () => {
            downloadCall(event);
            toast("Calendar file downloaded. Open it to add the call.");
          },
        },
      ]}
    />
  );
}

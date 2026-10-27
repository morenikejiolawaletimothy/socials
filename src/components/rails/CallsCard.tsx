import { Card } from "@/components/ui";

/** Right-column card on manager pages. Filled with real calls in batch 1.5. */
export function CallsCard() {
  return (
    <Card className="flex flex-col gap-3">
      <p className="font-display text-display-lg text-primary">Calls today</p>
      <p className="text-body-sm text-secondary">No calls today. Booked calls appear here with a Join button.</p>
    </Card>
  );
}

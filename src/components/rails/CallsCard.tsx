import { Card } from "@/components/ui";

/** Right-column card on manager pages. Filled with real calls in batch 1.5. */
export function CallsCard() {
  return (
    <Card title="Calls today">
      <p className="text-body-sm text-secondary">No calls today. Booked calls appear here with a Join button.</p>
    </Card>
  );
}

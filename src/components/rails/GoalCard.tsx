"use client";

import { Card } from "@/components/ui";
import { useDb, useSession } from "@/lib/mock";

/** Left-column card under the profile card: the goal the client agreed with us. */
export function GoalCard() {
  const { role, user } = useSession();
  const client = useDb((db) => db.clients.find((c) => c.userId === user?.id));
  if (role !== "client" || !client?.goal) return null;

  return (
    <Card title="My goal">
      <p className="text-body-sm text-secondary">{client.goal}</p>
    </Card>
  );
}

"use client";

import { Badge, Button, Card, Pill, Tile, TileFooter, useTask } from "@/components/ui";
import { agoIn, fullName } from "@/lib/format";
import { act, useData, type AccessAlert } from "@/lib/mock";

const kindLabel: Record<AccessAlert["kind"], string> = {
  "no-notify": "Signed in without notifying the client",
  "security-page": "Reached the account security pages",
  "off-hours": "Session outside working hours",
  bulk: "Bulk or rapid data access",
  devtools: "Developer tools opened in the session",
};

/** D: owner view of delegated-access breach signals (insider-threat monitoring). Only shows when there are open alerts. */
export function AccessAlertsCard() {
  const db = useData();
  const { run, pending } = useTask();
  const open = (db.accessAlerts ?? []).filter((a) => !a.resolved);
  if (!open.length) return null;

  const clientName = (clientId: string) => fullName(db.users.find((u) => u.id === db.clients.find((c) => c.id === clientId)?.userId));

  return (
    <Card
      title="Account access alerts"
      info="Automatic signals from full-service sessions. Review each one; take it up with the account manager if needed."
      action={<Pill>{open.length}</Pill>}
    >
      <div className="flex flex-col gap-4">
        <ul className="flex flex-col gap-3">
          {open.map((al) => (
            <li key={al.id}>
              <Tile>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="flex flex-wrap items-center gap-2 text-body font-medium text-primary">
                    {kindLabel[al.kind]} <Badge status="warning">{al.managerName}</Badge>
                  </span>
                  <span className="text-body-sm text-secondary">
                    {clientName(al.clientId)} · {al.detail} · {agoIn(al.at)}
                  </span>
                </span>
                <TileFooter>
                  <span />
                  <Button size="sm" variant="secondary" loading={pending(al.id)} onClick={() => run(al.id, () => act.resolveAccessAlert(al.id), "Marked reviewed.")}>
                    Mark reviewed
                  </Button>
                </TileFooter>
              </Tile>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

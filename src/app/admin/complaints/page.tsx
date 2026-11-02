"use client";

import { CalendarBlank } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { AssignDialog } from "@/components/admin/AssignDialog";
import { ClientCell, complaintKind, managerName } from "@/components/admin/parts";
import { Badge, Banner, Button, Card, Meta, PageHeader, Pill, Tile, TileFooter, buttonClass } from "@/components/ui";
import { agoIn, plural } from "@/lib/format";
import { act, useData, type ManagerChangeRequest } from "@/lib/mock";

/** A6 Complaints: open complaints and manager change requests, newest first. */
export default function ComplaintsPage() {
  const db = useData();
  const [changing, setChanging] = useState<ManagerChangeRequest | null>(null);
  const changingClient = db.clients.find((c) => c.id === changing?.clientId);
  const list = [...db.complaints].sort((a, b) => b.at.localeCompare(a.at));
  const requests = db.changeRequests.filter((r) => r.status === "open");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Complaints" description="Every complaint has a timeline that shows who was waiting on whom." />
      <Card title="Complaints" action={<Pill>{list.filter((c) => c.status !== "resolved").length} open</Pill>}>
        <ul className="flex flex-col gap-3">
          {list.map((c) => (
            <li key={c.id}>
              <Tile>
                <span className="flex flex-wrap items-start justify-between gap-3">
                  <ClientCell db={db} clientId={c.clientId} sub={`Manager: ${managerName(db, db.clients.find((x) => x.id === c.clientId)?.managerId)}`} />
                  <Badge status={c.status === "resolved" ? "success" : c.status === "in-review" ? "info" : "warning"}>
                    {c.status === "resolved" ? "Resolved" : c.status === "in-review" ? "In review" : "Open"}
                  </Badge>
                </span>
                <span className="flex flex-col gap-1">
                  <span className="text-body font-medium text-primary">{complaintKind[c.kind]}</span>
                  <span className="line-clamp-2 text-body-sm text-secondary">{c.text}</span>
                </span>
                <TileFooter>
                  <Meta icon={CalendarBlank}>Raised {agoIn(c.at)}</Meta>
                  <Link href={`/admin/complaints/${c.id}`} className={buttonClass("secondary", "sm")}>
                    Open
                  </Link>
                </TileFooter>
              </Tile>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Manager change requests" action={requests.length > 0 && <Pill>{plural(requests.length, "request")}</Pill>}>
        {requests.length ? (
          <ul className="flex flex-col gap-3">
            {requests.map((r) => (
              <li key={r.id}>
                <Tile>
                  <ClientCell db={db} clientId={r.clientId} sub={`Now: ${managerName(db, db.clients.find((x) => x.id === r.clientId)?.managerId)}`} />
                  <Banner tone="info">&ldquo;{r.reason}&rdquo;</Banner>
                  <TileFooter>
                    <Meta icon={CalendarBlank}>Asked {agoIn(r.at)}</Meta>
                    <Button size="sm" onClick={() => setChanging(r)}>
                      Change manager
                    </Button>
                  </TileFooter>
                </Tile>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body-sm text-secondary">No open requests.</p>
        )}
      </Card>
      {changing && changingClient && (
        <AssignDialog db={db} client={changingClient} title="Choose their new manager" onAssign={(managerId) => act.resolveChangeRequest(changing.id, managerId)} onClose={() => setChanging(null)} />
      )}
    </div>
  );
}

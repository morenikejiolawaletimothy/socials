"use client";

import { CalendarBlank } from "@phosphor-icons/react";
import { useState } from "react";
import { AssignDialog } from "@/components/admin/AssignDialog";
import { complaintKind, managerName } from "@/components/admin/parts";
import { Avatar, Badge, Card, Meta, PageHeader, Pill, Tabs, Tile, TileAction, TileFooter } from "@/components/ui";
import { agoIn, fullName, plural } from "@/lib/format";
import { act, useData, type ManagerChangeRequest } from "@/lib/mock";

/** A6 Complaints: open complaints and manager change requests, newest first. */
export default function ComplaintsPage() {
  const db = useData();
  const [changing, setChanging] = useState<ManagerChangeRequest | null>(null);
  const changingClient = db.clients.find((c) => c.id === changing?.clientId);
  const list = [...db.complaints].sort((a, b) => b.at.localeCompare(a.at));
  const requests = db.changeRequests.filter((r) => r.status === "open");
  const openCount = list.filter((c) => c.status !== "resolved").length;
  const [tab, setTab] = useState<"complaints" | "requests">("complaints");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Complaints" />
      {/* Same tab card as the Overview: one card at a time under it. */}
      <div className="rounded-lg border border-border bg-card p-2">
        <Tabs
          label="Complaints sections"
          value={tab}
          onChange={setTab}
          className="max-w-none w-full bg-neutral-50!"
          tabs={[
            { value: "complaints", label: "Complaints", count: openCount },
            { value: "requests", label: "Change requests", count: requests.length },
          ]}
        />
      </div>
      {tab === "complaints" && (
      <Card title="Complaints" info="Each complaint has a timeline that shows who was waiting on whom." action={<Pill>{openCount} open</Pill>}>
        {/* As on the client Home: one clickable tile per complaint, 12px apart. Who and status on top,
            the complaint under it, then the footer under a divider (when it was raised left, Open right). */}
        <ul className="flex flex-col gap-3" aria-label="Complaints">
          {list.map((c) => {
            const client = db.clients.find((x) => x.id === c.clientId);
            const u = db.users.find((x) => x.id === client?.userId);
            return (
              <li key={c.id}>
                <Tile href={`/admin/complaints/${c.id}`} done={c.status === "resolved"}>
                  <span className="flex items-start justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-3">
                      <Avatar name={fullName(u)} src={u?.photo} />
                      <span className="flex min-w-0 flex-col gap-1">
                        <span className="truncate text-body font-medium text-primary">{fullName(u)}</span>
                        <span className="truncate text-body-sm text-secondary">Manager: {managerName(db, client?.managerId)}</span>
                      </span>
                    </span>
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
                    <TileAction>Open</TileAction>
                  </TileFooter>
                </Tile>
              </li>
            );
          })}
          {!list.length && <li className="text-body-sm text-secondary">No complaints.</li>}
        </ul>
      </Card>
      )}
      {tab === "requests" && (
      <Card title="Manager change requests" action={requests.length > 0 && <Pill>{plural(requests.length, "request")}</Pill>}>
        {requests.length ? (
          <ul className="flex flex-col gap-3">
            {requests.map((r) => {
              const client = db.clients.find((x) => x.id === r.clientId);
              const u = db.users.find((x) => x.id === client?.userId);
              return (
                <li key={r.id}>
                  {/* Same tile as a complaint: who and status on top, the reason under it, when and the action in the footer. */}
                  <Tile onClick={() => setChanging(r)}>
                    <span className="flex items-start justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-3">
                        <Avatar name={fullName(u)} src={u?.photo} />
                        <span className="flex min-w-0 flex-col gap-1">
                          <span className="truncate text-body font-medium text-primary">{fullName(u)}</span>
                          <span className="truncate text-body-sm text-secondary">Manager: {managerName(db, client?.managerId)}</span>
                        </span>
                      </span>
                      <Badge status="warning">Open</Badge>
                    </span>
                    <span className="flex flex-col gap-1">
                      <span className="text-body font-medium text-primary">Wants a new manager</span>
                      <span className="line-clamp-2 text-body-sm text-secondary">&ldquo;{r.reason}&rdquo;</span>
                    </span>
                    <TileFooter>
                      <Meta icon={CalendarBlank}>Asked {agoIn(r.at)}</Meta>
                      <TileAction>Change manager</TileAction>
                    </TileFooter>
                  </Tile>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-body-sm text-secondary">No open requests.</p>
        )}
      </Card>
      )}
      {changing && changingClient && (
        <AssignDialog db={db} client={changingClient} title="Choose their new manager" onAssign={(managerId) => act.resolveChangeRequest(changing.id, managerId)} onClose={() => setChanging(null)} />
      )}
    </div>
  );
}

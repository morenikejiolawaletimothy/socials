"use client";

import Link from "next/link";
import { ClientCell, complaintKind, linkClass, managerName } from "@/components/admin/parts";
import { Badge, Card, PageHeader, useToast } from "@/components/ui";
import { ago } from "@/lib/format";
import { useData } from "@/lib/mock";

/** A6 Complaints: open complaints and manager change requests, newest first. */
export default function ComplaintsPage() {
  const db = useData();
  const toast = useToast();
  const list = [...db.complaints].sort((a, b) => b.at.localeCompare(a.at));
  const requests = db.changeRequests.filter((r) => r.status === "open");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Complaints" description="Every complaint has a timeline that shows who was waiting on whom." />
      <Card title="Complaints">
        <ul className="flex flex-col">
          {list.map((c) => (
            <li key={c.id} className="flex flex-col gap-3 border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0 sm:flex-row sm:items-center">
              <div className="sm:w-56">
                <ClientCell db={db} clientId={c.clientId} sub={`Manager: ${managerName(db, db.clients.find((x) => x.id === c.clientId)?.managerId)}`} />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-body-sm font-medium text-primary">{complaintKind[c.kind]}</span>
                <span className="line-clamp-2 text-body-sm text-secondary">{c.text}</span>
                <span className="text-caption text-secondary">{ago(c.at)}</span>
              </div>
              <Badge status={c.status === "resolved" ? "success" : c.status === "in-review" ? "info" : "warning"}>{c.status === "resolved" ? "Resolved" : c.status === "in-review" ? "In review" : "Open"}</Badge>
              <Link href={`/admin/complaints/${c.id}`} className={linkClass}>
                Open
              </Link>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Manager change requests">
        {requests.length ? (
          <ul className="flex flex-col">
            {requests.map((r) => (
              <li key={r.id} className="flex flex-col gap-3 border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0 sm:flex-row sm:items-center">
                <div className="sm:w-56">
                  <ClientCell db={db} clientId={r.clientId} sub={`Now: ${managerName(db, db.clients.find((x) => x.id === r.clientId)?.managerId)}`} />
                </div>
                <p className="flex-1 text-body-sm text-primary">&ldquo;{r.reason}&rdquo;</p>
                <button type="button" onClick={() => toast("A handover summary is prepared for the new manager.")} className={linkClass}>
                  Change manager
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body-sm text-secondary">No open requests.</p>
        )}
      </Card>
    </div>
  );
}

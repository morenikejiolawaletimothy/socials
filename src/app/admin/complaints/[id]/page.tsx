"use client";

import { use, useState } from "react";
import { ClientCell, complaintKind, managerName } from "@/components/admin/parts";
import { Badge, Banner, Button, Card, EmptyState, PageHeader, Textarea, useConfirm } from "@/components/ui";
import { dayTime } from "@/lib/format";
import { act, useData } from "@/lib/mock";

const outcomes = ["No action", "Credit", "Partial refund", "Warning to the manager", "Change of manager"];
const whoLabel = {
  client: "Client",
  manager: "Manager",
  owner: "You",
  system: "Bluecut",
};
const whoTone = {
  client: "bg-info",
  manager: "bg-warning",
  owner: "bg-success",
  system: "bg-neutral-400",
};

/** A6 Complaint page: the timeline, whose delay it was, and the outcome sent to the client. */
export default function ComplaintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const db = useData();
  const confirm = useConfirm();
  const c = db.complaints.find((x) => x.id === id);
  const [outcome, setOutcome] = useState("");
  const [note, setNote] = useState("");
  if (!c) return <EmptyState title="Complaint not found">Go back to Complaints.</EmptyState>;
  const client = db.clients.find((x) => x.id === c.clientId);
  const managerDelay = c.timeline.some((t) => t.who === "manager" && /late|missed/i.test(t.text));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={complaintKind[c.kind]} description={c.text} crumbs={[{ label: "Complaints", href: "/admin/complaints" }, { label: complaintKind[c.kind] }]} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Timeline" className="lg:col-span-2">
          <div className="flex flex-col gap-4">
            <Banner tone="info" title={managerDelay ? "The delay was on the manager" : "No delay on the manager's side"}>
              {managerDelay ? "Work reached the client late." : "Work reached the client on time. The client approved before it went live."}
            </Banner>
            <ol className="flex flex-col">
              {c.timeline.map((t, i) => (
                <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < c.timeline.length - 1 && <span aria-hidden className="absolute left-1.5 top-4 h-full w-px bg-border" />}
                  <span className={`relative mt-1.5 size-3 shrink-0 rounded-full ${whoTone[t.who]}`} aria-hidden />
                  <span className="flex flex-col gap-1">
                    <span className="text-body-sm text-primary">{t.text}</span>
                    <span className="text-caption text-secondary">
                      {whoLabel[t.who]}, {dayTime(t.at)}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </Card>
        <div className="flex flex-col gap-4">
          <Card title="Client">
            <div className="flex flex-col gap-3">
              <ClientCell db={db} clientId={c.clientId} />
              <span className="text-body-sm text-secondary">Manager: {managerName(db, client?.managerId)}</span>
              <Badge status={c.status === "resolved" ? "success" : "warning"}>{c.status === "resolved" ? "Resolved" : "Open"}</Badge>
            </div>
          </Card>
          <Card title="Outcome">
            {c.status === "resolved" ? (
              <p className="text-body-sm text-primary">{c.outcome}</p>
            ) : (
              <div className="flex flex-col gap-4">
                <fieldset className="flex flex-col gap-2">
                  <legend className="sr-only">Outcome</legend>
                  {outcomes.map((o) => (
                    <label key={o} className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 ${outcome === o ? "border-primary-600 bg-primary-50" : "border-border"}`}>
                      <input type="radio" name="outcome" checked={outcome === o} onChange={() => setOutcome(o)} className="size-4 accent-primary-600" />
                      <span className="text-body-sm text-primary">{o}</span>
                    </label>
                  ))}
                </fieldset>
                <Textarea label="Message to the client" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
                <Button
                  disabled={!outcome || !note.trim()}
                  onClick={() =>
                    confirm({
                      title: "Send this outcome?",
                      body: `${outcome}. The client gets your message by email and in the app, and the complaint closes.`,
                      warning: "A closed complaint cannot be reopened here. The client can raise a new one.",
                      confirmLabel: "Send outcome",
                      action: () => act.resolveComplaint(c.id, outcome),
                      success: "Outcome sent to the client.",
                    })
                  }
                >
                  Send outcome
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

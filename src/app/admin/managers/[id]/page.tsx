"use client";

import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { ClientCell, Stats, managerName, managerStatus } from "@/components/admin/parts";
import { Badge, Banner, Button, Card, Dialog, EmptyState, PageHeader, useToast } from "@/components/ui";
import { dayTime, fullName } from "@/lib/format";
import { act, useData } from "@/lib/mock";
import { statusBadge } from "@/lib/status";

const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/** A3 Manager page: clients, availability, performance, missed-deadline reasons, training, step in, suspend. */
export default function ManagerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const toast = useToast();
  const db = useData();
  const m = db.managers.find((x) => x.id === id);
  const [suspending, setSuspending] = useState(false);
  if (!m) return <EmptyState title="Manager not found">Go back to Managers.</EmptyState>;
  const u = db.users.find((x) => x.id === m.userId);
  const clients = db.clients.filter((c) => c.managerId === id);
  const s = managerStatus[m.status];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={fullName(u)}
        description={m.intro || "Has not written an intro yet."}
        crumbs={[{ label: "Managers", href: "/admin/managers" }, { label: fullName(u) }]}
        action={
          m.status === "active" &&
          clients.length > 0 && (
            <Button
              variant="secondary"
              onClick={() => {
                act.setCovering(id);
                router.push("/manager");
              }}
            >
              Step in for all {clients.length} clients
            </Button>
          )
        }
      />

      {m.status === "waiting-for-training" && (
        <Banner
          tone="warning"
          title={m.trainingAt ? `Training call booked: ${dayTime(m.trainingAt)}` : "Book their training call"}
          action={
            <Button
              variant="secondary"
              onClick={async () => {
                await act.markTrainingDone(id);
                toast(`${u?.firstName} can now be assigned clients.`);
              }}
            >
              Mark training done
            </Button>
          }
        >
          A 60-minute onboarding call with you, off the platform. Until you mark it done, they see only their training call and cannot be given clients.
        </Banner>
      )}
      {m.status === "invited" && <Banner tone="info" title="Invite sent">They have not set up their account yet. The link expires in 7 days.</Banner>}

      <Stats
        items={[
          { label: "Status", value: s.label },
          { label: "Clients", value: `${clients.length} of ${m.maxClients}` },
          { label: "On time", value: m.status === "active" ? `${m.stats.onTime}%` : "None yet" },
          { label: "Approved first time", value: m.status === "active" ? `${m.stats.firstTimeApproval}%` : "None yet" },
          { label: "Missed this month", value: m.stats.missed, tone: m.stats.missed >= 3 ? "danger" : undefined },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Clients">
          {clients.length ? (
            <ul className="flex flex-col">
              {clients.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 border-b border-border py-3 first:pt-0 last:border-b-0 last:pb-0">
                  <ClientCell db={db} clientId={c.id} />
                  <Badge status={statusBadge[c.status].tone}>{statusBadge[c.status].label}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body-sm text-secondary">No clients yet.</p>
          )}
        </Card>

        <Card title="Availability">
          <ul className="flex flex-col gap-2">
            {days.map((d) => {
              const open = (m.slots ?? []).filter((x) => x.startsWith(d)).map((x) => x.split("-")[1]);
              return (
                <li key={d} className="flex items-center gap-3 text-body-sm">
                  <span className="w-10 font-medium capitalize text-primary">{d}</span>
                  <span className="text-secondary">{open.length ? open.join(", ") : "Closed"}</span>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card title="Missed due times">
          {m.stats.missed ? (
            <ul className="flex flex-col gap-3 text-body-sm text-primary">
              <li>&ldquo;Client sent the photos late, so the post slipped a day.&rdquo; Tobi Akin, last week</li>
              <li>&ldquo;Was ill on Monday.&rdquo; Musa Ibrahim, 2 weeks ago</li>
              <li>No reason given. Kemi Ola, 3 weeks ago</li>
            </ul>
          ) : (
            <p className="text-body-sm text-secondary">None this month.</p>
          )}
        </Card>

        <Card title="Complaints">
          {db.complaints.filter((c) => clients.some((x) => x.id === c.clientId)).length ? (
            <ul className="flex flex-col gap-3">
              {db.complaints
                .filter((c) => clients.some((x) => x.id === c.clientId))
                .map((c) => (
                  <li key={c.id} className="flex flex-col gap-1">
                    <span className="text-body-sm text-primary">{c.text}</span>
                    <span className="text-caption text-secondary">{c.status === "resolved" ? `Resolved: ${c.outcome}` : "Open"}</span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-body-sm text-secondary">No complaints.</p>
          )}
        </Card>
      </div>

      {m.status !== "suspended" && (
        <Card title="Suspend">
          <div className="flex flex-col gap-3">
            <p className="text-body-sm text-secondary">Access ends at once. Their clients are listed for reassignment, with suggestions and a handover summary for each new manager.</p>
            <Button variant="ghost" className="self-start" onClick={() => setSuspending(true)}>
              Suspend {u?.firstName}
            </Button>
          </div>
        </Card>
      )}

      <Dialog open={suspending} onClose={() => setSuspending(false)} title={`Suspend ${fullName(u)}?`}>
        <p className="text-body text-secondary">
          {managerName(db, id)} loses access now. {clients.length ? `${clients.length} clients need a new manager. Clients are told who their new manager is.` : ""}
        </p>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setSuspending(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setSuspending(false);
              toast("Demo only: in the live app access would end now.");
            }}
          >
            Suspend
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

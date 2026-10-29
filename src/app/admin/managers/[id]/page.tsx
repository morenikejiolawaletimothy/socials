"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { ClientCell, Stats, managerName, managerStatus } from "@/components/admin/parts";
import { Badge, Banner, Button, Card, EmptyState, PageHeader, useConfirm, useToast } from "@/components/ui";
import { dayIn, dayTime, fullName } from "@/lib/format";
import { act, useData, type Db } from "@/lib/mock";
import { statusBadge } from "@/lib/status";

const clientNameOf = (db: Db, clientId: string) => fullName(db.users.find((u) => u.id === db.clients.find((c) => c.id === clientId)?.userId));

const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/** A3 Manager page: clients, availability, performance, missed-deadline reasons, training, step in, suspend. */
export default function ManagerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const db = useData();
  const m = db.managers.find((x) => x.id === id);
  if (!m) return <EmptyState title="Manager not found">Go back to Managers.</EmptyState>;
  const u = db.users.find((x) => x.id === m.userId);
  const clients = db.clients.filter((c) => c.managerId === id);
  const s = managerStatus[m.status];
  const missed = db.managerTasks.filter((t) => t.managerId === id && t.missed).sort((a, b) => b.dueAt.localeCompare(a.dueAt));

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
              onClick={async () => {
                const ok = await confirm({
                  title: `Step in for ${u?.firstName}?`,
                  body: `You see their ${clients.length} clients as they do and can act for them. Clients see "Your account team", not your name.`,
                  warning: "Everything you do is recorded in the audit log.",
                  confirmLabel: "Step in",
                });
                if (!ok) return;
                act.setCovering(id);
                toast(`You are covering for ${u?.firstName}. Use the banner to stop.`, "info");
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
              onClick={() =>
                confirm({
                  title: `Mark ${u?.firstName}'s training as done?`,
                  body: "They get full access and can be given clients. They are told by email.",
                  confirmLabel: "Mark done",
                  action: () => act.markTrainingDone(id),
                  success: `${u?.firstName} can now be assigned clients.`,
                })
              }
            >
              Mark training done
            </Button>
          }
        >
          A 60-minute onboarding call with you, off the platform. Until you mark it done, they see only their training call and cannot be given clients.
        </Banner>
      )}
      {m.status === "invited" && (
        <Banner tone="info" title="Invite sent">
          They have not set up their account yet. The link expires in 7 days.
        </Banner>
      )}

      <Stats
        items={[
          { label: "Status", value: s.label },
          { label: "Clients", value: `${clients.length} of ${m.maxClients}` },
          {
            label: "On time",
            value: m.status === "active" ? `${m.stats.onTime}%` : "None yet",
          },
          {
            label: "Approved first time",
            value: m.status === "active" ? `${m.stats.firstTimeApproval}%` : "None yet",
          },
          {
            label: "Missed this month",
            value: m.stats.missed,
            tone: m.stats.missed >= 3 ? "danger" : undefined,
          },
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
          {missed.length ? (
            <ul className="flex flex-col">
              {missed.map((t) => (
                <li key={t.id} className="flex flex-col gap-1 border-b border-border py-3 first:pt-0 last:border-b-0 last:pb-0">
                  <span className="text-body font-medium text-primary">{t.missed!.reason ? `“${t.missed!.reason}”` : "No reason given"}</span>
                  <span className="text-body-sm text-secondary">
                    {t.title}, {clientNameOf(db, t.clientId)}. Due {dayIn(t.dueAt)}.
                  </span>
                </li>
              ))}
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
            <Banner tone="warning">Access ends at once. Their clients are listed for reassignment, with suggestions and a handover summary for each new manager.</Banner>
            <Button
              variant="ghost"
              className="self-start"
              onClick={() =>
                confirm({
                  title: `Suspend ${fullName(u)}?`,
                  body: `${managerName(db, id)} loses access now.${clients.length ? ` ${clients.length} clients need a new manager. Clients are told who their new manager is.` : ""}`,
                  warning: "Drafts they had not sent stay with each client for the next manager. You can reinstate them later, but their clients do not come back automatically.",
                  confirmLabel: "Suspend",
                  tone: "danger",
                  action: () => act.suspendManager(id),
                  success: clients.length ? `${u?.firstName} is suspended. Assign their clients from Clients.` : `${u?.firstName} is suspended.`,
                })
              }
            >
              Suspend {u?.firstName}
            </Button>
          </div>
        </Card>
      )}

      {m.status === "suspended" && (
        <Card title="Suspended">
          <div className="flex flex-col gap-3">
            <Banner tone="neutral">{u?.firstName} cannot sign in. Reinstate to give their access back. They start with no clients.</Banner>
            <Button
              variant="secondary"
              className="self-start"
              onClick={() =>
                confirm({
                  title: `Reinstate ${fullName(u)}?`,
                  body: "They can sign in again and be given clients. They are told by email.",
                  confirmLabel: "Reinstate",
                  action: () => act.reinstateManager(id),
                  success: `${u?.firstName} is reinstated.`,
                })
              }
            >
              Reinstate {u?.firstName}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

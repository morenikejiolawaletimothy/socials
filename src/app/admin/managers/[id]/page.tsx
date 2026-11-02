"use client";

import Link from "next/link";
import { CalendarBlank } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { ClientCell, Stats, managerName, managerStatus } from "@/components/admin/parts";
import { Badge, Banner, Button, Card, EmptyState, Meta, PageHeader, Pill, Row, Rows, Tile, TileAction, TileFooter, buttonClass, useConfirm, useToast } from "@/components/ui";
import { dayIn, dayTime, fullName, plural } from "@/lib/format";
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
  if (!m) return <EmptyState title="Manager not found" action={<Link href="/admin/managers" className={buttonClass("secondary")}>Go to Managers</Link>}>They may have been removed, or the link is wrong.</EmptyState>;
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
        <Card title="Clients" action={<Pill>{clients.length} of {m.maxClients}</Pill>}>
          {clients.length ? (
            <Rows>
              {clients.map((c) => (
                <Row key={c.id} className="justify-between">
                  <ClientCell db={db} clientId={c.id} />
                  <Badge status={statusBadge[c.status].tone}>{statusBadge[c.status].label}</Badge>
                </Row>
              ))}
            </Rows>
          ) : (
            <p className="text-body-sm text-secondary">No clients yet.</p>
          )}
        </Card>

        <Card title="Availability" action={<Pill>{plural((m.slots ?? []).length, "slot")}</Pill>}>
          <Rows>
            {days.map((d) => {
              const open = (m.slots ?? []).filter((x) => x.startsWith(d)).map((x) => x.split("-")[1]);
              return (
                <Row key={d} className="justify-between">
                  <span className="text-body-sm font-medium capitalize text-primary">{d}</span>
                  <span className="text-body-sm capitalize text-secondary">{open.length ? open.join(", ") : "Closed"}</span>
                </Row>
              );
            })}
          </Rows>
        </Card>

        <Card title="Missed due times" action={<Pill>{m.stats.missed} this month</Pill>}>
          {missed.length ? (
            <ul className="flex flex-col gap-3">
              {missed.map((t) => (
                <li key={t.id}>
                  <Tile>
                    <span className="flex flex-col gap-1">
                      <span className="text-body font-medium text-primary">{t.missed!.reason ? `“${t.missed!.reason}”` : "No reason given"}</span>
                      <span className="text-body-sm text-secondary">
                        {t.title}, {clientNameOf(db, t.clientId)}
                      </span>
                    </span>
                    <TileFooter>
                      <Meta icon={CalendarBlank}>Was due {dayIn(t.dueAt)}</Meta>
                    </TileFooter>
                  </Tile>
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
                  <li key={c.id}>
                    <Tile href={`/admin/complaints/${c.id}`}>
                      <span className="text-body-sm text-primary">{c.text}</span>
                      <TileFooter>
                        <Badge status={c.status === "resolved" ? "success" : "warning"}>{c.status === "resolved" ? "Resolved" : "Open"}</Badge>
                        <TileAction>Open</TileAction>
                      </TileFooter>
                    </Tile>
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
              variant="remove"
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

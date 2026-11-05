"use client";

import Link from "next/link";
import { CalendarBlank, Timer, Users, WarningCircle } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { ClientCell, StatTile, managerName, managerStatus } from "@/components/admin/parts";
import { Badge, Banner, Button, Card, EmptyState, Meta, PageHeader, Pill, ProgressBar, Row, Rows, Tabs, Tile, TileAction, TileFooter, buttonClass, useConfirm, useToast } from "@/components/ui";
import { day, dayTime, dayTimeIn, fullName, plural, time } from "@/lib/format";
import { act, useData, type Db } from "@/lib/mock";
import { slotTimes } from "@/lib/slots";
import { statusBadge } from "@/lib/status";

type Section = "clients" | "availability" | "missed" | "complaints" | "access";

const clientNameOf = (db: Db, clientId: string) => fullName(db.users.find((u) => u.id === db.clients.find((c) => c.id === clientId)?.userId));

/** A3 Manager page: clients, availability, performance, missed-deadline reasons, training, step in, suspend. */
export default function ManagerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const db = useData();
  const [section, setSection] = useState<Section>("clients");
  const m = db.managers.find((x) => x.id === id);
  if (!m) return <EmptyState title="Manager not found" action={<Link href="/admin/managers" className={buttonClass("secondary")}>Go to Managers</Link>}>They may have been removed, or the link is wrong.</EmptyState>;
  const u = db.users.find((x) => x.id === m.userId);
  const clients = db.clients.filter((c) => c.managerId === id);
  const s = managerStatus[m.status];
  const missed = db.managerTasks.filter((t) => t.managerId === id && t.missed).sort((a, b) => b.dueAt.localeCompare(a.dueAt));
  // Open call times for the next two weeks, grouped by date ("Thu 12 Nov": 9am, 10am).
  const openByDay = Object.entries(
    slotTimes(m.slots ?? [], Date.now(), 14).reduce<Record<string, string[]>>((acc, t) => {
      (acc[day(t)] ??= []).push(t);
      return acc;
    }, {}),
  );
  const active = m.status === "active";
  const complaints = db.complaints.filter((c) => clients.some((x) => x.id === c.clientId));
  const openComplaints = complaints.filter((c) => c.status !== "resolved").length;

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

      {/* As on the Overview: the hero card across two columns and two rows, four small number cards beside it (two across on phones). */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        <section aria-labelledby="mgr-performance" className="col-span-2 flex flex-col gap-6 rounded-lg border border-border bg-card p-6 lg:row-span-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <h2 id="mgr-performance" className="text-body-sm text-secondary">
                On time this month
              </h2>
              <Badge status={s.tone}>{s.label}</Badge>
            </div>
            <p className="font-display text-display-3xl text-primary">{active ? `${m.stats.onTime}%` : "None yet"}</p>
            <p className="text-body-sm text-secondary">Tasks done before their due time</p>
          </div>
          {active && <ProgressBar value={m.stats.onTime} tone={m.stats.onTime >= 90 ? "success" : m.stats.onTime >= 60 ? "brand" : "warning"} />}
          <ul className="flex flex-col gap-4 border-t border-border pt-6">
            {[
              { label: "Approved first time", value: active ? m.stats.firstTimeApproval : 0, text: active ? `${m.stats.firstTimeApproval}%` : "None yet", max: 100 },
              { label: "Clients", value: clients.length, text: `${clients.length} of ${m.maxClients}`, max: m.maxClients },
            ].map((p) => (
              <li key={p.label} className="flex flex-col gap-2">
                <span className="flex items-center justify-between gap-3 text-body-sm">
                  <span className="text-secondary">{p.label}</span>
                  <span className="font-medium text-primary">{p.text}</span>
                </span>
                <ProgressBar value={p.value} max={Math.max(p.max, 1)} />
              </li>
            ))}
          </ul>
        </section>

        <StatTile icon={Users} label="Places free" value={Math.max(m.maxClients - clients.length, 0)} />
        <StatTile icon={CalendarBlank} label="Days with open call times" value={openByDay.length} />
        <StatTile icon={Timer} label="Missed this month" value={m.stats.missed} tone={m.stats.missed >= 3 ? "danger" : m.stats.missed ? "warning" : undefined} />
        <StatTile icon={WarningCircle} label="Open complaints" value={openComplaints} tone={openComplaints ? "warning" : undefined} />
      </div>

      {/* Under the numbers: one card at a time, picked from this tab row (same tab card as the Overview). */}
      <div className="rounded-lg border border-border bg-card p-2">
        <Tabs<Section>
          label="Manager sections"
          value={section}
          onChange={setSection}
          className="max-w-none w-full bg-neutral-50!"
          tabs={[
            { value: "clients", label: "Their clients", count: clients.length },
            { value: "availability", label: "Open times" },
            { value: "missed", label: "Missed tasks", count: missed.length },
            { value: "complaints", label: "Complaints", count: openComplaints },
            { value: "access", label: "Their access" },
          ]}
        />
      </div>

      {section === "clients" && (
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
      )}

      {section === "availability" && (
        <Card title="Availability" action={<Pill>{plural(openByDay.length, "day")} open</Pill>} info="Open call times for the next two weeks, as the manager set them.">
          {openByDay.length ? (
            <Rows>
              {openByDay.map(([d, ts]) => (
                <Row key={d} className="justify-between">
                  <span className="text-body-sm font-medium text-primary">{d}</span>
                  <span className="text-body-sm text-secondary">{ts.map(time).join(", ")}</span>
                </Row>
              ))}
            </Rows>
          ) : (
            <p className="text-body-sm text-secondary">No open times in the next two weeks.</p>
          )}
        </Card>
      )}

      {section === "missed" && (
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
                      <Meta icon={Timer}>Was due {dayTimeIn(t.dueAt)}</Meta>
                    </TileFooter>
                  </Tile>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body-sm text-secondary">None this month.</p>
          )}
        </Card>
      )}

      {section === "complaints" && (
        <Card title="Complaints" action={complaints.length > 0 && <Pill>{plural(complaints.length, "complaint")}</Pill>}>
          {complaints.length ? (
            <ul className="flex flex-col gap-3">
              {complaints.map((c) => (
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
      )}

      {section === "access" && m.status !== "suspended" && (
        <Card title="Suspend" info="Access ends at once. Their clients are listed for reassignment, with suggestions and a handover summary for each new manager.">
          <div className="flex flex-col gap-3">
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

      {section === "access" && m.status === "suspended" && (
        <Card title="Suspended" info={`${u?.firstName} cannot sign in. Reinstate to give their access back. They start with no clients.`}>
          <div className="flex flex-col gap-3">
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

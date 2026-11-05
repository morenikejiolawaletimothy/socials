"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ClientCell, Table, managerName, tdFlush } from "@/components/admin/parts";
import { AssignDialog, suggest } from "@/components/admin/AssignDialog";
import { Avatar, Badge, Button, Card, PageHeader, Pill, ProgressBar, Row, Rows, Select, textActionClass } from "@/components/ui";
import { daysFrom, fullName, plural } from "@/lib/format";
import { useData, type Client } from "@/lib/mock";
import { statusBadge } from "@/lib/status";

function ClientsPage() {
  const db = useData();
  const initial = useSearchParams().get("filter") === "unassigned" ? "unassigned" : "all";
  const [status, setStatus] = useState<string>(initial);
  const [manager, setManager] = useState("all");
  const [assigning, setAssigning] = useState<Client | null>(null);
  const list = db.clients.filter(
    (c) => (status === "all" || (status === "unassigned" ? !c.managerId : status === "at-risk" ? Boolean(c.atRisk) : c.status === status)) && (manager === "all" || c.managerId === manager),
  );
  const waiting = db.clients.filter((c) => !c.managerId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Clients" />

      {waiting.length > 0 && (
        <Card title="Waiting for a manager" padding="none" action={<Pill>{plural(waiting.length, "client")}</Pill>}>
          {/* Edge to edge, two sides per client: who on the left, the suggested manager and Assign on the right. Stacks on phones. */}
          <Rows flush>
            {waiting.map((c) => {
              const top = suggest(db, c)[0];
              const u = db.users.find((x) => x.id === c.userId);
              return (
                <Row key={c.id} className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                  <span className="flex min-w-0 items-center gap-3">
                    <Avatar name={fullName(u)} src={u?.photo} size="lg" />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-body font-medium text-primary">{fullName(u)}</span>
                      <span className="truncate text-body-sm text-secondary">
                        {c.industry} · joined {plural(-daysFrom(c.joinedAt), "day")} ago
                      </span>
                    </span>
                  </span>
                  <span className="flex items-center justify-between gap-4 pl-17 sm:justify-end sm:pl-0">
                    <span className="text-body-sm text-secondary">Suggested: {managerName(db, top?.m.id) || "none"}</span>
                    <Button size="sm" onClick={() => setAssigning(c)}>
                      Assign
                    </Button>
                  </span>
                </Row>
              );
            })}
          </Rows>
        </Card>
      )}

      <Card title="All clients" padding="none" action={<Pill>{plural(list.length, "client")}</Pill>}>
        {/* Filters on their own strip under the header, then the table edge to edge. */}
        <div className="flex flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center">
          <Select size="sm" aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="setting-up">Setting up</option>
            <option value="free">Free</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="at-risk">At risk</option>
            <option value="unassigned">No manager</option>
          </Select>
          <Select size="sm" aria-label="Manager" value={manager} onChange={(e) => setManager(e.target.value)}>
            <option value="all">All managers</option>
            {db.managers
              .filter((m) => m.status === "active")
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {managerName(db, m.id)}
                </option>
              ))}
          </Select>
        </div>
        {list.length ? (
          <Table label="Clients" flush head={["Client", "Manager", "This week", "At risk", "Status"]}>
            {list.map((c) => {
              const b = statusBadge[c.status];
              const w = db.progress.find((p) => p.clientId === c.id);
              const d = w ? w.posts.done + w.comments.done + w.connections.done : 0;
              const t = w ? w.posts.target + w.comments.target + w.connections.target : 0;
              return (
                <tr key={c.id}>
                  <td className={tdFlush}>
                    <ClientCell db={db} clientId={c.id} />
                  </td>
                  <td className={tdFlush}>
                    {c.managerId ? (
                      <span className="text-primary">{managerName(db, c.managerId)}</span>
                    ) : (
                      <button type="button" onClick={() => setAssigning(c)} className={textActionClass}>
                        Assign
                      </button>
                    )}
                  </td>
                  <td className={tdFlush}>
                    {w ? (
                      <span className="flex w-28 flex-col gap-1">
                        <span className="text-caption text-secondary">
                          {d} of {t}
                        </span>
                        <ProgressBar value={d} max={t} />
                      </span>
                    ) : (
                      <span className="text-secondary">Not started</span>
                    )}
                  </td>
                  <td className={`${tdFlush} text-secondary`}>{c.atRisk ?? ""}</td>
                  <td className={tdFlush}>
                    <span className="flex flex-wrap items-center gap-2">
                      <Badge status={b.tone}>{c.status === "paused" ? `Paused ${-daysFrom(c.pausedAt ?? c.joinedAt)} days` : b.label}</Badge>
                      {c.service === "full-service" && <Pill>Full-service</Pill>}
                    </span>
                  </td>
                </tr>
              );
            })}
          </Table>
        ) : (
          <p className="px-6 py-4 text-body-sm text-secondary">No clients match these filters.</p>
        )}
      </Card>

      {assigning && <AssignDialog db={db} client={assigning} onClose={() => setAssigning(null)} />}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <ClientsPage />
    </Suspense>
  );
}

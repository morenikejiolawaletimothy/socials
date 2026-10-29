"use client";

import { Sparkle } from "@phosphor-icons/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ClientCell, Table, managerName, td } from "@/components/admin/parts";
import { AssignDialog, suggest } from "@/components/admin/AssignDialog";
import { Badge, Button, Card, PageHeader, ProgressBar, Select } from "@/components/ui";
import { daysFrom, plural } from "@/lib/format";
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
      <PageHeader title="Clients" description="Every client, their manager and how they are doing." />

      {waiting.length > 0 && (
        <Card title="Waiting for a manager">
          <ul className="flex flex-col">
            {waiting.map((c) => {
              const top = suggest(db, c)[0];
              return (
                <li key={c.id} className="flex flex-col gap-3 border-b border-border py-3 first:pt-0 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                  <ClientCell db={db} clientId={c.id} sub={`${c.industry}, joined ${plural(-daysFrom(c.joinedAt), "day")} ago`} />
                  <span className="flex items-center gap-1 text-body-sm text-secondary">
                    <Sparkle className="size-4 text-primary-600" aria-hidden /> Suggested: {managerName(db, top?.m.id)}
                  </span>
                  <Button onClick={() => setAssigning(c)}>Assign</Button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <Card
        title="All clients"
        action={
          <span className="flex flex-wrap gap-2">
            <Select size="sm" aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="setting-up">Setting up</option>
              <option value="free">Free 2 weeks</option>
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
          </span>
        }
      >
        <Table label="Clients" head={["Client", "Status", "Manager", "This week", "At risk"]}>
          {list.map((c) => {
            const b = statusBadge[c.status];
            const w = db.progress.find((p) => p.clientId === c.id);
            const d = w ? w.posts.done + w.comments.done + w.connections.done : 0;
            const t = w ? w.posts.target + w.comments.target + w.connections.target : 0;
            return (
              <tr key={c.id}>
                <td className={td}>
                  <ClientCell db={db} clientId={c.id} />
                </td>
                <td className={td}>
                  <Badge status={b.tone}>{c.status === "paused" ? `Paused ${-daysFrom(c.pausedAt ?? c.joinedAt)} days` : b.label}</Badge>
                </td>
                <td className={td}>
                  {c.managerId ? (
                    managerName(db, c.managerId)
                  ) : (
                    <button type="button" onClick={() => setAssigning(c)} className="rounded-sm font-medium text-primary-600 hover:underline focus-visible:focus-ring">
                      Assign
                    </button>
                  )}
                </td>
                <td className={td}>
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
                <td className={`${td} text-danger`}>{c.atRisk ?? ""}</td>
              </tr>
            );
          })}
        </Table>
        {!list.length && <p className="pt-4 text-body-sm text-secondary">No clients match these filters.</p>}
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

"use client";

import { Sparkle } from "@phosphor-icons/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ClientCell, Table, managerName, selectClass, td } from "@/components/admin/parts";
import { Badge, Banner, Button, Card, Dialog, PageHeader, ProgressBar, useToast } from "@/components/ui";
import { daysFrom, fullName, plural } from "@/lib/format";
import { act, useData, type Client, type Db } from "@/lib/mock";
import { statusBadge } from "@/lib/status";

/** A2: the platform suggests a manager by free capacity, industry and time zone. Full managers cannot be chosen. */
function suggest(db: Db, c: Client) {
  return db.managers
    .filter((m) => m.status === "active")
    .map((m) => {
      const load = db.clients.filter((x) => x.managerId === m.id).length;
      const industry = m.industries.includes(c.industry);
      const tz = db.users.find((u) => u.id === m.userId)?.timeZone === db.users.find((u) => u.id === c.userId)?.timeZone;
      return { m, load, full: load >= m.maxClients, industry, tz, score: (industry ? 3 : 0) + (tz ? 2 : 0) + (m.maxClients - load) / 10 };
    })
    .sort((a, b) => b.score - a.score);
}

function AssignDialog({ db, client, onClose }: { db: Db; client: Client; onClose: () => void }) {
  const toast = useToast();
  const options = suggest(db, client);
  const [pick, setPick] = useState(options.find((o) => !o.full)?.m.id ?? "");
  const top = options[0];
  return (
    <Dialog open onClose={onClose} title={`Assign a manager to ${fullName(db.users.find((u) => u.id === client.userId))}`}>
      {top && (
        <Banner tone="info" title={`Suggested: ${managerName(db, top.m.id)}`}>
          {[top.industry && `Works in ${client.industry.toLowerCase()}`, top.tz && "Same time zone", `${top.m.maxClients - top.load} places free`].filter(Boolean).join(". ")}.
        </Banner>
      )}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-body-sm font-medium text-primary">Choose a manager</legend>
        {options.map((o) => (
          <label key={o.m.id} className={`flex items-center gap-3 rounded-md border p-3 ${o.full ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${pick === o.m.id ? "border-primary-600 bg-primary-50" : "border-border"}`}>
            <input type="radio" name="manager" disabled={o.full} checked={pick === o.m.id} onChange={() => setPick(o.m.id)} className="size-4 accent-primary-600" />
            <span className="flex flex-1 flex-col">
              <span className="text-body-sm font-medium text-primary">
                {managerName(db, o.m.id)} {o === top && <span className="text-caption text-primary-600">Suggested</span>}
              </span>
              <span className="text-caption text-secondary">
                {o.load} of {o.m.maxClients} clients. {o.m.industries.join(", ")}.{o.full ? " Full." : ""}
              </span>
            </span>
          </label>
        ))}
      </fieldset>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={!pick}
          onClick={async () => {
            await act.assignManager(client.id, pick);
            onClose();
            toast(`${managerName(db, pick)} assigned. The client is told who their manager is.`);
          }}
        >
          Confirm
        </Button>
      </div>
    </Dialog>
  );
}

function ClientsPage() {
  const db = useData();
  const initial = useSearchParams().get("filter") === "unassigned" ? "unassigned" : "all";
  const [status, setStatus] = useState<string>(initial);
  const [manager, setManager] = useState("all");
  const [assigning, setAssigning] = useState<Client | null>(null);
  const list = db.clients.filter(
    (c) =>
      (status === "all" || (status === "unassigned" ? !c.managerId : status === "at-risk" ? Boolean(c.atRisk) : c.status === status)) &&
      (manager === "all" || c.managerId === manager),
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
            <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
              <option value="all">All statuses</option>
              <option value="setting-up">Setting up</option>
              <option value="free">Free 2 weeks</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="at-risk">At risk</option>
              <option value="unassigned">No manager</option>
            </select>
            <select aria-label="Manager" value={manager} onChange={(e) => setManager(e.target.value)} className={selectClass}>
              <option value="all">All managers</option>
              {db.managers
                .filter((m) => m.status === "active")
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {managerName(db, m.id)}
                  </option>
                ))}
            </select>
          </span>
        }
      >
        <Table head={["Client", "Status", "Manager", "This week", "At risk"]}>
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

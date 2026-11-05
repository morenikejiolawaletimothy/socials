"use client";

import { useState } from "react";
import { managerName } from "@/components/admin/parts";
import { Avatar, Badge, Button, Dialog, Pill, useTask } from "@/components/ui";
import { fullName } from "@/lib/format";
import { act, type Client, type Db } from "@/lib/mock";

/** A2: the platform suggests a manager by free capacity, industry and time zone. Full managers cannot be chosen. */
export function suggest(db: Db, c: Client) {
  return db.managers
    .filter((m) => m.status === "active")
    .map((m) => {
      const load = db.clients.filter((x) => x.managerId === m.id).length;
      const industry = m.industries.includes(c.industry);
      const tz = db.users.find((u) => u.id === m.userId)?.timeZone === db.users.find((u) => u.id === c.userId)?.timeZone;
      return {
        m,
        load,
        full: load >= m.maxClients,
        industry,
        tz,
        score: (industry ? 3 : 0) + (tz ? 2 : 0) + (m.maxClients - load) / 10,
      };
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * Pick a manager for a client, with the platform's suggestion first. Used for new clients (A2)
 * and for a client's request to change manager (A6), which leaves out the current manager.
 */
export function AssignDialog({ db, client, onClose, onAssign, title }: { db: Db; client: Client; onClose: () => void; onAssign?: (managerId: string) => Promise<void>; title?: string }) {
  const { run, pending } = useTask();
  const options = suggest(db, client).filter((o) => o.m.id !== client.managerId);
  const [pick, setPick] = useState(options.find((o) => !o.full)?.m.id ?? "");
  const top = options[0];
  return (
    <Dialog
      open
      onClose={onClose}
      title={title ?? `Assign a manager to ${fullName(db.users.find((u) => u.id === client.userId))}`}
    >
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-body font-medium text-primary">Choose a manager</legend>
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border">
          {options.map((o) => {
            const name = managerName(db, o.m.id);
            return (
              <label
                key={o.m.id}
                className={`flex items-center gap-3 p-4 ${o.full ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-primary-50"} ${pick === o.m.id ? "bg-primary-50" : ""}`}
              >
                <input type="radio" name="manager" disabled={o.full} checked={pick === o.m.id} onChange={() => setPick(o.m.id)} className="size-4 shrink-0 accent-primary-600 focus-visible:focus-ring" />
                <Avatar name={name} />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-body font-medium text-primary">{name}</span>
                    {o === top && !o.full && <Pill>Suggested</Pill>}
                    {o.full && <Badge>Full</Badge>}
                  </span>
                  <span className="text-body-sm text-secondary">
                    {o.load} of {o.m.maxClients} clients · {o.m.industries.join(", ")}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <div className="-mx-6 flex flex-col-reverse gap-3 border-t border-border px-6 pt-4 sm:flex-row sm:justify-end">
        <Button variant="cancel" onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={!pick}
          loading={pending("assign")}
          onClick={async () => {
            const ok = await run(
              "assign",
              () => (onAssign ? onAssign(pick) : act.assignManager(client.id, pick)),
              `${managerName(db, pick)} assigned. The client is told who their manager is, and a handover summary is prepared.`,
            );
            if (ok) onClose();
          }}
        >
          Confirm
        </Button>
      </div>
    </Dialog>
  );
}

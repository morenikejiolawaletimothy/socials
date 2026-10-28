"use client";

import { useState } from "react";
import { Table, selectClass, td } from "@/components/admin/parts";
import { Button, Card, PageHeader, useToast } from "@/components/ui";
import { dayTime } from "@/lib/format";
import { useData, type AuditEntry } from "@/lib/mock";

const kinds: { value: AuditEntry["kind"] | "all"; label: string }[] = [
  { value: "all", label: "Everything" },
  { value: "assignment", label: "Assignments" },
  { value: "refund", label: "Refunds" },
  { value: "setting", label: "Settings" },
  { value: "account", label: "Accounts" },
  { value: "content", label: "Content" },
  { value: "step-in", label: "Step in" },
];

/** A8 Audit log: every admin and system action, who, what and when. Records the real actor, including step-in. */
export default function AuditPage() {
  const db = useData();
  const toast = useToast();
  const [kind, setKind] = useState<AuditEntry["kind"] | "all">("all");
  const list = [...db.audit].filter((a) => kind === "all" || a.kind === kind).sort((a, b) => b.at.localeCompare(a.at));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Audit log" description="Every admin and system action. Nothing here can be changed." action={<Button variant="secondary" onClick={() => toast("Exporting the log as a CSV file.")}>Export</Button>} />
      <Card
        title="Actions"
        action={
          <select aria-label="Filter" value={kind} onChange={(e) => setKind(e.target.value as AuditEntry["kind"] | "all")} className={selectClass}>
            {kinds.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        }
      >
        <Table head={["When", "Who", "What", "On"]}>
          {list.map((a) => (
            <tr key={a.id}>
              <td className={`${td} whitespace-nowrap text-secondary`}>{dayTime(a.at)}</td>
              <td className={`${td} whitespace-nowrap font-medium text-primary`}>{a.who}</td>
              <td className={`${td} text-primary`}>{a.action}</td>
              <td className={`${td} whitespace-nowrap text-secondary`}>{a.target}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

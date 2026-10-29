"use client";

import { useState } from "react";
import { Table, td } from "@/components/admin/parts";
import { Button, Card, PageHeader, Select, useTask } from "@/components/ui";
import { dayTime } from "@/lib/format";
import { delay, useData, type AuditEntry } from "@/lib/mock";

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
  const { run, pending } = useTask();
  const [kind, setKind] = useState<AuditEntry["kind"] | "all">("all");
  const list = [...db.audit].filter((a) => kind === "all" || a.kind === kind).sort((a, b) => b.at.localeCompare(a.at));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Audit log"
        description="Every admin and system action. Nothing here can be changed."
        action={
          <Button
            variant="secondary"
            loading={pending("export")}
            onClick={() =>
              run(
                "export",
                async () => {
                  await delay(600);
                  const cell = (v: string) => `"${v.replaceAll('"', '""')}"`;
                  const csv = ["When,Who,What,On,Kind", ...list.map((a) => [a.at, a.who, a.action, a.target, a.kind].map((v) => cell(String(v ?? ""))).join(","))].join("\n");
                  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
                  const link = Object.assign(document.createElement("a"), {
                    href: url,
                    download: "bluecut-audit-log.csv",
                  });
                  link.click();
                  URL.revokeObjectURL(url);
                },
                `Exported ${list.length} actions as a CSV file.`,
              )
            }
          >
            Export
          </Button>
        }
      />
      <Card
        title="Actions"
        action={
          <Select size="sm" aria-label="Filter" value={kind} onChange={(e) => setKind(e.target.value as AuditEntry["kind"] | "all")}>
            {kinds.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </Select>
        }
      >
        <Table label="Audit log" head={["When", "Who", "What", "On"]}>
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

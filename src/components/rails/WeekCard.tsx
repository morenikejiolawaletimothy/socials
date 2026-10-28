"use client";

import Link from "next/link";
import { Card, ProgressBar } from "@/components/ui";
import { useMyClient } from "@/lib/mock";

/** Right-column card on the client's Home: this week's targets from the strategy against what was done. */
export function WeekCard() {
  const { week, client } = useMyClient();
  if (!week || client?.stage !== "running") return null;
  const rows = [
    { label: "Posts", ...week.posts },
    { label: "Comments", ...week.comments },
    { label: "Connection requests", ...week.connections },
  ];
  return (
    <Card title="This week" action={<Link href="/progress" className="rounded-sm text-body-sm font-medium text-primary-600 hover:text-primary-700 hover:underline focus-visible:focus-ring">Progress</Link>}>
      <ul className="flex flex-col gap-4">
        {rows.map((r) => (
          <li key={r.label} className="flex flex-col gap-2">
            <span className="flex items-center justify-between text-body-sm">
              <span className="text-primary">{r.label}</span>
              <span className="text-secondary">
                {r.done} of {r.target}
              </span>
            </span>
            <ProgressBar value={r.done} max={r.target} tone={r.done >= r.target ? "success" : "brand"} />
          </li>
        ))}
      </ul>
    </Card>
  );
}

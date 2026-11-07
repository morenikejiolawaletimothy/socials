"use client";

import Link from "next/link";
import { Card, ProgressBar, textActionClass } from "@/components/ui";
import { useMyClient } from "@/lib/mock";
import { pageScore, profileScore, type ScoreRow } from "@/lib/scorecard";

function Lines({ rows }: { rows: ScoreRow[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {rows.map((r) => (
        <li key={r.key} className="flex flex-col gap-2">
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
  );
}

/** Right-column card on the client's Home: this week's targets from the strategy against what was done (profile, and the company Page when on). */
export function WeekCard() {
  const { week, client } = useMyClient();
  if (!week || client?.stage !== "running") return null;
  const profile = profileScore(week);
  const page = pageScore(week);
  return (
    <Card title="This week" action={<Link href="/progress" className={textActionClass}>Progress</Link>}>
      <div className="flex flex-col gap-4">
        {page.length > 0 && <span className="text-caption font-medium text-secondary">Your profile</span>}
        <Lines rows={profile} />
        {page.length > 0 && (
          <div className="flex flex-col gap-4 border-t border-border pt-4">
            <span className="text-caption font-medium text-secondary">Company Page</span>
            <Lines rows={page} />
          </div>
        )}
      </div>
    </Card>
  );
}

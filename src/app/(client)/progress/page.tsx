"use client";

import { Trophy } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Button, Card, Dialog, ProgressBar, Textarea, useToast } from "@/components/ui";
import { ago, daysFrom } from "@/lib/format";
import { act, useMyClient } from "@/lib/mock";

/** C9 Progress: plain words first, numbers second. This week's targets, what is waiting, and every update. */
export default function ProgressPage() {
  const { client, week, updates, strategy } = useMyClient();
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState<string>();
  const sent = updates.filter((u) => u.status === "sent").sort((a, b) => (b.sentAt ?? "").localeCompare(a.sentAt ?? ""));
  const latest = sent[0];
  const results = sent.flatMap((u) => u.results ?? []);
  const tooEarly = client ? -daysFrom(client.joinedAt) < 21 : true;

  return (
    <Columns {...rails.clientMain}>
      <Card title="Progress toward your goal">
        <div className="flex flex-col gap-4">
          <p className="text-body-sm text-secondary">{strategy?.goal ?? client?.goal}</p>
          {tooEarly || !latest ? (
            <p className="text-body text-primary">It is too early for results. We start measuring from week 3, once enough has gone out to learn from.</p>
          ) : (
            <p className="text-body-lg text-primary">{latest.progress}</p>
          )}
          {strategy && (
            <div className="flex flex-col gap-2">
              <span className="text-caption text-secondary">How we measure it</span>
              <ul className="flex flex-col gap-1 text-body-sm text-primary">
                {strategy.measures.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>

      {week && (
        <Card title="This week" action={<span className="text-caption text-secondary">From your strategy</span>}>
          <div className="flex flex-col gap-6">
            <ul className="flex flex-col gap-4">
              {[
                { label: "Posts", ...week.posts },
                { label: "Comments on the right posts", ...week.comments },
                { label: "Connection requests", ...week.connections },
              ].map((r) => (
                <li key={r.label} className="flex flex-col gap-2">
                  <span className="flex justify-between text-body-sm">
                    <span className="text-primary">{r.label}</span>
                    <span className="text-secondary">
                      {r.done} of {r.target} done
                    </span>
                  </span>
                  <ProgressBar value={r.done} max={r.target} tone={r.done >= r.target ? "success" : "brand"} />
                </li>
              ))}
            </ul>
            {week.held.length > 0 && (
              <div className="flex flex-col gap-2 rounded-md bg-warning-bg p-4">
                <span className="text-body-sm font-medium text-primary">Waiting on you</span>
                <ul className="flex flex-col gap-1 text-body-sm text-primary">
                  {week.held.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card
        title="Results"
        action={
          <button type="button" onClick={() => setAdding(true)} className="rounded-sm text-body-sm font-medium text-primary-600 hover:text-primary-700 hover:underline focus-visible:focus-ring">
            Add a result
          </button>
        }
      >
        {results.length ? (
          <ul className="flex flex-col gap-3">
            {results.map((r) => (
              <li key={r} className="flex items-center gap-3">
                <Trophy className="size-5 shrink-0 text-primary-600" aria-hidden />
                <span className="text-body-sm text-primary">{r}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body-sm text-secondary">A lead, an invitation, an offer: add anything that came from LinkedIn, so we can count it toward your goal.</p>
        )}
      </Card>

      <Card title="Updates">
        {sent.length ? (
          <ul className="flex flex-col">
            {sent.map((u, i) => (
              <li key={u.id} className={i < sent.length - 1 ? "border-b border-border" : ""}>
                <Link href={`/progress/${u.id}`} className="flex flex-col gap-1 py-4 hover:bg-neutral-25 focus-visible:focus-ring">
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-body font-medium text-primary">{u.title}</span>
                    <span className="text-caption text-secondary">{ago(u.sentAt!)}</span>
                  </span>
                  <span className="line-clamp-2 text-body-sm text-secondary">{u.headline}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body-sm text-secondary">Your first weekly update arrives at the end of your first week.</p>
        )}
      </Card>

      <Dialog open={adding} onClose={() => setAdding(false)} title="Add a result">
        <Textarea
          label="What happened?"
          placeholder="For example: an investor from my list asked for a call."
          value={result}
          onChange={(e) => {
            setResult(e.target.value);
            setError(undefined);
          }}
          error={error}
        />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setAdding(false)}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (!result.trim()) return setError("Write what happened.");
              if (client) await act.addResult(client.id, result.trim());
              setResult("");
              setAdding(false);
              toast("Result added. Your manager will count it in your next update.");
            }}
          >
            Add result
          </Button>
        </div>
      </Dialog>
    </Columns>
  );
}

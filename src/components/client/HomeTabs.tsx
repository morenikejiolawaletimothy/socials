"use client";

import { CalendarCheck, FileText, ListChecks, MagnifyingGlass, Megaphone } from "@phosphor-icons/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { buttonClass, Card, Meta, Pill, Select, Tabs, TextLink } from "@/components/ui";
import { agoIn, dayTimeIn } from "@/lib/format";
import type { ClientBundle } from "@/lib/mock";
import { FeedCard } from "./FeedCard";
import { UpcomingCard, UpdateCard } from "./HomeCards";

type Tab = "feed" | "calls" | "coming" | "reports" | "history";
type Item = { id: string; status: Parameters<typeof FeedCard>[0]["status"]; icon: typeof FileText; title: string; body?: string; when: string; sort: number; action: React.ReactNode };

export function HomeTabs({ b }: { b: ClientBundle }) {
  const [tab, setTab] = useState<Tab>("feed");
  const [sort, setSort] = useState("new");
  const [q, setQ] = useState("");

  const selfServe = b.client?.service !== "full-service";
  const posts = b.posts;
  const taskList = b.tasks;

  // Everything the client can act on, as one feed.
  const items: Item[] = useMemo(() => {
    const out: Item[] = [];
    for (const p of posts.filter((x) => x.status === "awaiting-client")) out.push({ id: `rev-${p.id}`, status: "pending", icon: Megaphone, title: p.topic, body: p.why, when: p.dueAt ? dayTimeIn(p.dueAt) : "", sort: p.dueAt ? new Date(p.dueAt).getTime() : 0, action: <Link href={`/content/review?post=${p.id}`} className={buttonClass("primary", "sm")}>Review</Link> });
    if (selfServe) for (const p of posts.filter((x) => x.status === "approved")) out.push({ id: `pub-${p.id}`, status: "ready", icon: FileText, title: p.topic, body: p.why, when: p.dueAt ? dayTimeIn(p.dueAt) : "", sort: p.dueAt ? new Date(p.dueAt).getTime() : 0, action: <Link href={`/content/publish?post=${p.id}`} className={buttonClass("primary", "sm")}>Publish</Link> });
    for (const t of taskList.filter((x) => !x.done)) out.push({ id: `task-${t.id}`, status: "ready", icon: ListChecks, title: t.title, body: "A quick task only you can do. It takes seconds.", when: t.dueAt ? dayTimeIn(t.dueAt) : "", sort: t.dueAt ? new Date(t.dueAt).getTime() : 0, action: <Link href={`/tasks/${t.id}`} className={buttonClass("primary", "sm")}>Start</Link> });
    return out;
  }, [posts, taskList, selfServe]);

  const filtered = items
    .filter((i) => !q.trim() || i.title.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, bi) => (sort === "new" ? a.sort - bi.sort : bi.sort - a.sort));

  const calls = b.calls.filter((c) => c.status === "booked" && new Date(c.at).getTime() > Date.now() - 30 * 60_000).sort((a, c) => a.at.localeCompare(c.at));
  const scheduled = b.posts.filter((p) => p.status === "scheduled");
  const history = [...b.activity].slice(0, 12);

  return (
    <div className="flex flex-col gap-4">
      <Card padding="sm">
        <div className="p-2">
          <Tabs<Tab>
            label="Home sections"
            value={tab}
            onChange={setTab}
            className="max-w-none w-full bg-neutral-50!"
            tabs={[
              { value: "feed", label: "Feed", count: items.length },
              { value: "calls", label: "Calls", count: calls.length },
              { value: "coming", label: "Coming up", count: scheduled.length },
              { value: "reports", label: "Reports" },
              { value: "history", label: "History", count: history.length },
            ]}
          />
        </div>
      </Card>

      {tab === "feed" && (
        <>
          <Card title="Feed" info="Everything that needs you, in one place. Items leave the list once they are done." action={<Pill>{items.length ? `0 of ${items.length} done` : "All done"}</Pill>}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Select label="Sort" value={sort} onChange={(e) => setSort(e.target.value)} wrapperClassName="sm:max-w-44">
                <option value="new">Newest first</option>
                <option value="old">Oldest first</option>
              </Select>
              <label className="flex flex-1 flex-col gap-1">
                <span className="text-body-sm font-medium text-primary">Search</span>
                <span className="flex items-center gap-2 rounded-sm border border-border-strong bg-card px-3 focus-within:border-primary-600 focus-within:focus-ring">
                  <MagnifyingGlass className="size-4 text-secondary" aria-hidden />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Keywords" className="min-h-11 flex-1 bg-transparent text-body text-primary outline-none placeholder:text-neutral-400" />
                </span>
              </label>
            </div>
          </Card>

          {filtered.length ? (
            <ul className="flex flex-col gap-4">
              {filtered.map((i) => (
                <li key={i.id}>
                  <FeedCard status={i.status} icon={i.icon} title={i.title} time={i.when || undefined} action={i.action}>
                    {i.body && <p>{i.body}</p>}
                  </FeedCard>
                </li>
              ))}
            </ul>
          ) : (
            <Card><p className="text-body-sm text-secondary">Nothing needs you right now. New posts and tasks show up here.</p></Card>
          )}
        </>
      )}

      {tab === "calls" && (
        <Card title="Calls" action={<TextLink href="/calls/book">Book a call</TextLink>}>
          {calls.length ? (
            <ul className="flex flex-col divide-y divide-border">
              {calls.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                  <span className="flex flex-col gap-1">
                    <span className="text-body font-medium text-primary">{c.title ?? "Call"}</span>
                    <Meta icon={CalendarCheck}>{dayTimeIn(c.at)} · {c.minutes} min</Meta>
                  </span>
                  <TextLink href="/calls">View</TextLink>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body-sm text-secondary">No calls booked. Book one with your account manager whenever you need to.</p>
          )}
        </Card>
      )}

      {tab === "coming" && <UpcomingCard b={b} />}

      {tab === "reports" && <UpdateCard b={b} />}

      {tab === "history" && (
        <Card title="History">
          {history.length ? (
            <ul className="flex flex-col divide-y divide-border">
              {history.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="text-body-sm text-primary">{a.text}</span>
                  <span className="shrink-0 text-caption text-secondary">{agoIn(a.at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body-sm text-secondary">Nothing yet. Your activity shows up here.</p>
          )}
        </Card>
      )}
    </div>
  );
}

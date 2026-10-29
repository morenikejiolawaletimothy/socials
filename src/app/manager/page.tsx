"use client";

import { CaretDown, VideoCamera, WarningCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Avatar, Button, Card, Segmented, Select, Textarea, useTask } from "@/components/ui";
import { dayTimeIn, fullName, plural, time } from "@/lib/format";
import { act, useMyManager, type Db, type ManagerTask } from "@/lib/mock";

const linkButton = (primary = false) =>
  `inline-flex min-h-10 shrink-0 items-center justify-center rounded-md border px-4 py-2 text-body-sm font-medium transition-colors focus-visible:focus-ring ${
    primary ? "border-transparent bg-primary-600 text-inverse hover:bg-primary-700" : "border-border-strong bg-card text-primary-700 hover:border-primary-300 hover:bg-primary-50"
  }`;

function who(db: Db, clientId: string) {
  const c = db.clients.find((x) => x.id === clientId);
  return fullName(db.users.find((u) => u.id === c?.userId));
}

/** One task: what it is, which client, when it is due, and one button to exactly the right screen. */
function TaskRow({ t, db, primary }: { t: ManagerTask; db: Db; primary?: boolean }) {
  const late = t.column !== "done" && t.group !== "waiting" && new Date(t.dueAt).getTime() < Date.now();
  return (
    <li className="flex flex-col gap-3 border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0 sm:flex-row sm:items-start">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <Avatar name={who(db, t.clientId)} size="md" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-body font-medium text-primary">{t.title}</span>
          <span className="text-body-sm text-secondary">
            {who(db, t.clientId)} · {t.detail}
          </span>
          <span className={`text-caption ${late ? "text-danger" : "text-secondary"}`}>{late ? `Was due ${dayTimeIn(t.dueAt)}` : `Due ${dayTimeIn(t.dueAt)}`}</span>
        </div>
      </div>
      <Link href={t.href} className={`${linkButton(primary)} ml-13 self-start sm:ml-0 sm:self-center`}>
        {t.action}
      </Link>
    </li>
  );
}

/** M1: a missed due time asks for a short reason. Repeated misses go to the owner. */
function MissedCard({ tasks, db }: { tasks: ManagerTask[]; db: Db }) {
  const { run, pending } = useTask();
  const [reason, setReason] = useState("");
  const late = tasks.filter((t) => t.group === "work" && t.column !== "done" && !t.missed && new Date(t.dueAt).getTime() < Date.now());
  if (!late.length) return null;
  return (
    <Card title="You missed a due time">
      <div className="flex flex-col gap-4">
        <p className="text-body-sm text-primary">
          &ldquo;{late[0].title}&rdquo; for {who(db, late[0].clientId)} was due {dayTimeIn(late[0].dueAt)}. Tell us why, in a line. The owner sees reasons only if misses repeat.
        </p>
        <Textarea label="What happened?" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
        <Button
          variant="secondary"
          className="self-start"
          disabled={!reason.trim()}
          loading={pending("reason")}
          onClick={async () => {
            if (await run("reason", () => act.sendMissedReason(late[0].id, reason.trim()), "Thanks. Finish it as soon as you can.")) setReason("");
          }}
        >
          Send reason
        </Button>
      </div>
    </Card>
  );
}

const columns: { key: ManagerTask["column"]; label: string }[] = [
  { key: "todo", label: "To do" },
  { key: "doing", label: "Doing" },
  { key: "waiting", label: "Waiting on client" },
  { key: "done", label: "Done this week" },
];

/** M1 Board: the same tasks in columns. Drag between To do and Doing; the rest move on their own. */
function Board({ tasks, db }: { tasks: ManagerTask[]; db: Db }) {
  const { run } = useTask();
  const [mobileCol, setMobileCol] = useState<ManagerTask["column"]>("todo");
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="lg:hidden">
        <Segmented
          label="Column"
          value={mobileCol}
          onChange={setMobileCol}
          options={columns.map((c) => ({ value: c.key, label: { todo: "To do", doing: "Doing", waiting: "Waiting", done: "Done" }[c.key] }))}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
        {columns.map((col) => {
          const items = tasks.filter((t) => t.column === col.key);
          const droppable = col.key === "todo" || col.key === "doing";
          return (
            <section
              key={col.key}
              aria-label={col.label}
              onDragOver={(e) => {
                if (!droppable || !dragging) return;
                e.preventDefault();
                setOver(col.key);
              }}
              onDragLeave={() => setOver(null)}
              onDrop={() => {
                const t = tasks.find((x) => x.id === dragging);
                if (t && droppable && t.column !== col.key) {
                  const from = t.column;
                  run("move", () => act.moveTask(t.id, col.key), { text: `Moved to ${col.label}.`, action: { label: "Undo", onClick: () => act.moveTask(t.id, from) } });
                }
                setDragging(null);
                setOver(null);
              }}
              className={`${mobileCol === col.key ? "flex" : "hidden"} min-h-40 flex-col gap-2 rounded-lg p-2 transition-colors lg:flex ${over === col.key ? "bg-primary-50" : "bg-neutral-50"}`}
            >
              <h3 className="flex items-center justify-between px-2 py-1 text-body-sm font-medium text-primary">
                {col.label}
                <span className="text-caption text-secondary">{items.length}</span>
              </h3>
              {items.map((t) => (
                <Link
                  key={t.id}
                  href={t.href}
                  draggable={droppable}
                  onDragStart={() => setDragging(t.id)}
                  onDragEnd={() => setDragging(null)}
                  className={`flex flex-col gap-1 rounded-md border border-border bg-card p-3 transition-colors hover:border-primary-300 focus-visible:focus-ring ${droppable ? "cursor-grab active:cursor-grabbing" : ""} ${t.group === "urgent" ? "border-l-4 border-l-danger" : ""}`}
                >
                  <span className="text-body-sm font-medium text-primary">{t.title}</span>
                  <span className="text-caption text-secondary">{who(db, t.clientId)}</span>
                  <span className="text-caption text-secondary">Due {dayTimeIn(t.dueAt)}</span>
                </Link>
              ))}
            </section>
          );
        })}
      </div>
      <p className="text-caption text-secondary">Drag cards between To do and Doing. Cards move to Waiting on client and Done by themselves when the work is sent or finished.</p>
    </div>
  );
}

/** M1 Home: what to do next, in order, across all clients. Feed or Board. */
export default function ManagerHome() {
  const { db, manager, clients } = useMyManager();
  const [view, setView] = useState<"feed" | "board">("feed");
  const [clientFilter, setClientFilter] = useState("all");
  const [showWaiting, setShowWaiting] = useState(false);
  const all = db.managerTasks.filter((t) => t.managerId === manager?.id && (clientFilter === "all" || t.clientId === clientFilter)).sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  const urgent = all.filter((t) => t.group === "urgent" && t.column !== "done");
  const work = all.filter((t) => t.group === "work" && t.column !== "done");
  const waiting = all.filter((t) => t.group === "waiting");
  const calls = db.calls.filter((c) => c.managerId === manager?.id && c.status === "booked" && new Date(c.at).toDateString() === new Date().toDateString());

  return (
    <Columns {...(view === "board" ? {} : rails.managerFeed)}>
      <Card padding="sm">
        <div className="flex flex-col gap-3 p-2 sm:flex-row sm:items-center sm:justify-between">
          <Segmented
            label="Task view"
            value={view}
            onChange={setView}
            options={[
              { value: "feed", label: "Feed" },
              { value: "board", label: "Board" },
            ]}
          />
          <label className="flex items-center gap-2 text-body-sm text-secondary">
            Client
            <Select size="sm" value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
              <option value="all">All clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {who(db, c.id)}
                </option>
              ))}
            </Select>
          </label>
        </div>
      </Card>

      {view === "board" ? (
        <Card title="This week">
          <Board tasks={all} db={db} />
        </Card>
      ) : (
        <>
          <MissedCard tasks={all} db={db} />

          {urgent.length > 0 && (
            <Card
              title={
                <span className="flex items-center gap-2">
                  <WarningCircle className="size-5 text-danger" aria-hidden /> Urgent
                </span>
              }
              action={<span className="text-caption text-secondary">{plural(urgent.length, "thing")}</span>}
            >
              <ul className="flex flex-col">
                {urgent.map((t, i) => (
                  <TaskRow key={t.id} t={t} db={db} primary={i === 0} />
                ))}
              </ul>
            </Card>
          )}

          {calls.length > 0 && (
            <Card title="Calls today">
              <ul className="flex flex-col">
                {calls.map((c) => (
                  <li key={c.id} className="flex flex-col gap-3 border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <Avatar name={who(db, c.clientId)} size="md" />
                      <div className="flex flex-1 flex-col gap-1">
                        <span className="text-body font-medium text-primary">
                          {who(db, c.clientId)}, {c.kind === "goals" ? "goals call" : c.kind === "strategy" ? "strategy call" : "check-in"}
                        </span>
                        <span className="text-body-sm text-secondary">
                          {time(c.at)}, 30 minutes. {c.recording ? "Recorded with consent." : "Not recorded: take notes."}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 pl-13 sm:pl-0">
                      <Link href={`/manager/clients/${c.clientId}/onboard`} className={linkButton()}>
                        Prep
                      </Link>
                      <a href={c.meetUrl} className={linkButton()}>
                        <VideoCamera className="mr-1 size-4" aria-hidden /> Join
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card title="Your work" action={<span className="text-caption text-secondary">By due time</span>}>
            {work.length ? (
              <ul className="flex flex-col">
                {work.map((t) => (
                  <TaskRow key={t.id} t={t} db={db} primary={!urgent.length && t === work[0]} />
                ))}
              </ul>
            ) : (
              <p className="text-body-sm text-secondary">All done. New work appears here as it comes in.</p>
            )}
          </Card>

          {waiting.length > 0 && (
            <Card padding="none">
              <button
                type="button"
                aria-expanded={showWaiting}
                onClick={() => setShowWaiting((s) => !s)}
                className="flex w-full items-center justify-between px-6 py-4 text-left focus-visible:focus-ring"
              >
                <span className="font-display text-display-lg text-primary">Waiting on clients</span>
                <span className="flex items-center gap-2 text-caption text-secondary">
                  {waiting.length}
                  <CaretDown className={`size-4 transition-transform ${showWaiting ? "rotate-180" : ""}`} aria-hidden />
                </span>
              </button>
              {showWaiting && (
                <ul className="flex flex-col border-t border-border p-6">
                  {waiting.map((t) => (
                    <TaskRow key={t.id} t={t} db={db} />
                  ))}
                </ul>
              )}
            </Card>
          )}
        </>
      )}
    </Columns>
  );
}

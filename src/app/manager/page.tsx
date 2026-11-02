"use client";

import { CalendarBlank, Clock, VideoCamera, WarningCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Avatar, Banner, Button, buttonClass, Card, Meta, Pill, Segmented, Select, Textarea, TextButton, TextLink, Tile, TileAction, TileFooter, useTask } from "@/components/ui";
import { dayTimeIn, fullName, plural, time } from "@/lib/format";
import { act, useMyManager, type Db, type ManagerTask } from "@/lib/mock";

function who(db: Db, clientId: string) {
  const c = db.clients.find((x) => x.id === clientId);
  return fullName(db.users.find((u) => u.id === c?.userId));
}

/** One task as a linked tile, like the client's quick tasks: who and what on top, the due time and the action in the footer. */
function TaskTile({ t, db }: { t: ManagerTask; db: Db }) {
  const late = t.column !== "done" && t.group !== "waiting" && new Date(t.dueAt).getTime() < Date.now();
  return (
    <li>
      <Tile href={t.href}>
        <span className="flex items-start gap-3">
          <Avatar name={who(db, t.clientId)} size="md" />
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-body font-medium text-primary">{t.title}</span>
            <span className="text-body-sm text-secondary">
              {who(db, t.clientId)} · {t.detail}
            </span>
          </span>
        </span>
        <TileFooter>
          <Meta icon={late ? WarningCircle : CalendarBlank} className={late ? "text-danger" : ""}>
            {late ? `Was due ${dayTimeIn(t.dueAt)}` : `Due ${dayTimeIn(t.dueAt)}`}
          </Meta>
          <TileAction>{t.action}</TileAction>
        </TileFooter>
      </Tile>
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
    <Card title="You missed a due time" action={<Meta icon={WarningCircle}>Was due {dayTimeIn(late[0].dueAt)}</Meta>}>
      <div className="flex flex-col gap-4">
        <Banner tone="warning">
          &ldquo;{late[0].title}&rdquo; for {who(db, late[0].clientId)}. Tell us why, in a line. The owner sees reasons only if misses repeat.
        </Banner>
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
              <h3 className="flex items-center justify-between px-2 py-1 text-body font-medium text-primary">
                {col.label}
                <Pill>{items.length}</Pill>
              </h3>
              {items.map((t) => (
                <Link
                  key={t.id}
                  href={t.href}
                  draggable={droppable}
                  onDragStart={() => setDragging(t.id)}
                  onDragEnd={() => setDragging(null)}
                  className={`flex flex-col gap-2 rounded-md border border-border bg-card p-3 transition-colors hover:border-primary-300 hover:bg-primary-50 focus-visible:focus-ring ${droppable ? "cursor-grab active:cursor-grabbing" : ""} ${t.group === "urgent" ? "border-l-4 border-l-danger" : ""}`}
                >
                  <span className="flex flex-col gap-1">
                    <span className="text-body-sm font-medium text-primary">{t.title}</span>
                    <span className="text-caption text-secondary">{who(db, t.clientId)}</span>
                  </span>
                  <Meta icon={CalendarBlank} className="border-t border-border pt-2 text-caption">
                    Due {dayTimeIn(t.dueAt)}
                  </Meta>
                </Link>
              ))}
            </section>
          );
        })}
      </div>
      <Banner tone="info" closeKey="manager-board-note">
        Drag cards between To do and Doing. Cards move to Waiting on client and Done by themselves when the work is sent or finished.
      </Banner>
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
              action={<Pill>{plural(urgent.length, "thing")}</Pill>}
            >
              <ul className="flex flex-col gap-3">
                {urgent.map((t) => (
                  <TaskTile key={t.id} t={t} db={db} />
                ))}
              </ul>
            </Card>
          )}

          {calls.length > 0 && (
            <Card title="Calls today" action={<Pill>{plural(calls.length, "call")}</Pill>}>
              <ul className="flex flex-col gap-3">
                {calls.map((c) => (
                  <li key={c.id}>
                    <Tile>
                      <span className="flex items-start gap-3">
                        <Avatar name={who(db, c.clientId)} size="md" />
                        <span className="flex min-w-0 flex-1 flex-col gap-1">
                          <span className="text-body font-medium text-primary">
                            {who(db, c.clientId)}, {c.kind === "goals" ? "goals call" : c.kind === "strategy" ? "strategy call" : "check-in"}
                          </span>
                          <span className="text-body-sm text-secondary">{c.recording ? "Recorded with consent." : "Not recorded: take notes."}</span>
                        </span>
                      </span>
                      <TileFooter>
                        <Meta icon={Clock}>{time(c.at)} · 30 min</Meta>
                        <span className="flex items-center gap-4">
                          <TextLink href={`/manager/clients/${c.clientId}/onboard`} className="text-body-sm">
                            Prep notes
                          </TextLink>
                          <a href={c.meetUrl} className={buttonClass("secondary", "sm")}>
                            <VideoCamera className="size-4" aria-hidden /> Join
                          </a>
                        </span>
                      </TileFooter>
                    </Tile>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card title="Your work" action={<Pill label={`${plural(work.length, "task")}, by due time`}>{plural(work.length, "task")}</Pill>}>
            {work.length ? (
              <ul className="flex flex-col gap-3">
                {work.map((t) => (
                  <TaskTile key={t.id} t={t} db={db} />
                ))}
              </ul>
            ) : (
              <Banner tone="success">All done. New work appears here as it comes in.</Banner>
            )}
          </Card>

          {waiting.length > 0 && (
            <Card
              title="Waiting on clients"
              action={
                <span className="flex items-center gap-3">
                  <Pill>{waiting.length}</Pill>
                  <TextButton aria-expanded={showWaiting} onClick={() => setShowWaiting((v) => !v)}>
                    {showWaiting ? "Hide" : "Show"}
                  </TextButton>
                </span>
              }
            >
              {showWaiting ? (
                <ul className="flex flex-col gap-3">
                  {waiting.map((t) => (
                    <TaskTile key={t.id} t={t} db={db} />
                  ))}
                </ul>
              ) : (
                <p className="text-body-sm text-secondary">Posts and requests with clients. They move back to Your work when the client answers.</p>
              )}
            </Card>
          )}
        </>
      )}
    </Columns>
  );
}

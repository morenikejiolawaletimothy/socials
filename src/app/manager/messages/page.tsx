"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Columns } from "@/components/layout/Columns";
import { Conversation } from "@/components/messages/Conversation";
import { rails } from "@/components/rails";
import { Avatar, Button, Card, Dialog, Input, Textarea, useToast } from "@/components/ui";
import { ago, fullName } from "@/lib/format";
import { act, useMyManager } from "@/lib/mock";

/** M9 Messages: one conversation per client. Phone: the list, then the open conversation. */
function ManagerMessages() {
  const router = useRouter();
  const toast = useToast();
  const selected = useSearchParams().get("client");
  const { db, clients, user, covering } = useMyManager();
  const [asking, setAsking] = useState(false);
  const [what, setWhat] = useState("");
  const [why, setWhy] = useState("");
  const [error, setError] = useState<string>();

  const threads = clients
    .map((c) => {
      const msgs = db.messages.filter((m) => m.clientId === c.id).sort((a, b) => a.at.localeCompare(b.at));
      return { c, u: db.users.find((u) => u.id === c.userId), msgs, last: msgs[msgs.length - 1] };
    })
    .sort((a, b) => (b.last?.at ?? "").localeCompare(a.last?.at ?? ""));
  const active = threads.find((t) => t.c.id === selected) ?? (selected ? undefined : threads[0]);

  return (
    <Columns {...rails.managerMain}>
      <Card title="Messages" padding="none">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <ul className={`flex-col border-border md:flex md:border-r ${selected ? "hidden" : "flex"}`}>
            {threads.map((t) => {
              const on = active?.c.id === t.c.id;
              return (
                <li key={t.c.id}>
                  <Link
                    href={`/manager/messages?client=${t.c.id}`}
                    scroll={false}
                    aria-current={on ? "true" : undefined}
                    className={`flex items-center gap-3 border-b border-border px-4 py-3 focus-visible:focus-ring ${on ? "bg-primary-50" : "hover:bg-neutral-25"}`}
                  >
                    <Avatar name={fullName(t.u)} size="md" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-body-sm font-medium text-primary">{fullName(t.u)}</span>
                        {t.last && <span className="shrink-0 text-caption text-secondary">{ago(t.last.at)}</span>}
                      </span>
                      <span className="truncate text-caption text-secondary">{t.last?.text ?? (t.last?.voice ? "Voice note" : t.last?.file ? t.last.file.name : "No messages yet")}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className={`md:col-span-2 ${selected ? "block" : "hidden md:block"}`}>
            {active && user ? (
              <>
                <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-3">
                  <span className="flex items-center gap-3">
                    <button type="button" onClick={() => router.push("/manager/messages")} className="rounded-sm text-body-sm font-medium text-primary-600 hover:underline focus-visible:focus-ring md:hidden">
                      All
                    </button>
                    <Link href={`/manager/clients/${active.c.id}`} className="rounded-sm text-body font-medium text-primary hover:text-primary-700 focus-visible:focus-ring">
                      {fullName(active.u)}
                    </Link>
                  </span>
                  <button type="button" onClick={() => setAsking(true)} className="rounded-sm text-body-sm font-medium text-primary-600 hover:underline focus-visible:focus-ring">
                    Ask for a permission
                  </button>
                </div>
                <Conversation clientId={active.c.id} messages={active.msgs} me={user} users={db.users} saveLabel="Save to their Brand" asTeam={covering} />
              </>
            ) : (
              <p className="p-6 text-body-sm text-secondary">Choose a client.</p>
            )}
          </div>
        </div>
      </Card>

      <Dialog open={asking} onClose={() => setAsking(false)} title="Ask for a one-off permission">
        <p className="text-body-sm text-secondary">For something outside what {active?.u?.firstName ?? "the client"} lets you do. They approve or decline in Control.</p>
        <Input label="What do you want to do?" placeholder="Post the Q3 update to the company Page" value={what} onChange={(e) => { setWhat(e.target.value); setError(undefined); }} error={error} />
        <Textarea label="Why" rows={2} value={why} onChange={(e) => setWhy(e.target.value)} />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setAsking(false)}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (!what.trim() || !active) return setError("Say what you want to do.");
              await act.askPermission(active.c.id, what.trim(), why.trim());
              setAsking(false);
              setWhat("");
              setWhy("");
              toast("Sent. You will be told when they answer.");
            }}
          >
            Send request
          </Button>
        </div>
      </Dialog>
    </Columns>
  );
}

export default function Page() {
  return (
    <Suspense>
      <ManagerMessages />
    </Suspense>
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Columns } from "@/components/layout/Columns";
import { ClientChat } from "@/components/messages/ClientChat";
import { rails } from "@/components/rails";
import { Banner, Button, Card, Dialog, EmptyState, Input, Select, Textarea, TextButton, useConfirm, useTask } from "@/components/ui";
import { fullName } from "@/lib/format";
import { act, useMyManager } from "@/lib/mock";

/** M9 Messages: one conversation per client. Phone: the list, then the open conversation. */
function ManagerMessages() {
  const router = useRouter();
  const confirm = useConfirm();
  const { run, pending } = useTask();
  const selected = useSearchParams().get("client");
  const { db, clients, user, covering } = useMyManager();
  const [asking, setAsking] = useState(false);
  const [what, setWhat] = useState("");
  const [why, setWhy] = useState("");
  const [error, setError] = useState<string>();

  // Clients, most recent conversation first.
  const list = clients
    .map((c) => ({ c, u: db.users.find((u) => u.id === c.userId), last: db.messages.filter((m) => m.clientId === c.id).reduce((a, m) => (m.at > a ? m.at : a), "") }))
    .sort((a, b) => b.last.localeCompare(a.last));
  const active = list.find((t) => t.c.id === selected) ?? list[0];
  const messages = active ? db.messages.filter((m) => m.clientId === active.c.id).sort((a, b) => a.at.localeCompare(b.at)) : [];
  const threads = active ? db.threads.filter((t) => t.clientId === active.c.id) : [];
  const requests = active ? db.requests.filter((r) => r.clientId === active.c.id && r.status === "pending") : [];

  return (
    <Columns {...rails.managerMain}>
      <Card
        title="Messages"
        padding="none"
        className="overflow-visible!"
        action={
          <span className="flex items-center gap-3">
            <TextButton onClick={() => setAsking(true)} disabled={!active}>
              Ask for a permission
            </TextButton>
            <Select size="sm" aria-label="Client" value={active?.c.id ?? ""} onChange={(e) => router.push(`/manager/messages?client=${e.target.value}`, { scroll: false })}>
              {list.map((t) => (
                <option key={t.c.id} value={t.c.id}>
                  {fullName(t.u)}
                </option>
              ))}
            </Select>
          </span>
        }
      >
        {requests.length > 0 && (
          <div className="flex flex-col gap-2 border-b border-border px-6 py-4">
            {requests.map((r) => (
              <Banner
                key={r.id}
                tone="info"
                title="Waiting for an answer"
                action={
                  <Button
                    variant="remove"
                    size="sm"
                    onClick={() =>
                      confirm({
                        title: "Withdraw this request?",
                        body: `${active?.u?.firstName} will no longer see it in Control.`,
                        confirmLabel: "Withdraw",
                        action: () => act.cancelRequest(r.id),
                        success: "Request withdrawn.",
                      })
                    }
                  >
                    Withdraw
                  </Button>
                }
              >
                {r.text}
              </Banner>
            ))}
          </div>
        )}
        {active?.u && user ? (
          <ClientChat key={active.c.id} clientId={active.c.id} me={user} manager={active.u} messages={messages} threads={threads} side="team" asTeam={covering} profileHref={`/manager/clients/${active.c.id}`} />
        ) : (
          <div className="p-6">
            <EmptyState title="No clients yet">When a client is assigned to you, your messages with them appear here.</EmptyState>
          </div>
        )}
      </Card>

      <Dialog open={asking} onClose={() => setAsking(false)} title="Ask for a one-off permission" info={`For something outside what ${active?.u?.firstName ?? "the client"} lets you do. They approve or decline in Control.`}>
        <Input label="What do you want to do?" placeholder="Post the Q3 update to the company Page" value={what} onChange={(e) => { setWhat(e.target.value); setError(undefined); }} error={error} />
        <Textarea label="Why" rows={2} value={why} onChange={(e) => setWhy(e.target.value)} />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="cancel" onClick={() => setAsking(false)}>
            Cancel
          </Button>
          <Button
            loading={pending("ask")}
            onClick={async () => {
              if (!what.trim() || !active) return setError("Say what you want to do.");
              if (await run("ask", () => act.askPermission(active.c.id, what.trim(), why.trim()), "Sent. You will be told when they answer.")) {
                setAsking(false);
                setWhat("");
                setWhy("");
              }
            }}
          >
            {pending("ask") ? "Sending" : "Send request"}
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

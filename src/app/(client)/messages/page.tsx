"use client";

import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { ClientChat } from "@/components/messages/ClientChat";
import { Card, EmptyState, Pill } from "@/components/ui";
import { useMyClient } from "@/lib/mock";

/** C10 Messages: conversations with the account manager, laid out like an AI chat app. Text, files, links and voice typing. */
export default function MessagesPage() {
  const { client, user, managerUser, messages, threads } = useMyClient();
  const count = threads.length + (messages.some((m) => !m.threadId) ? 1 : 0);

  return (
    <Columns {...rails.clientMessages} wide>
      {/* No clipping, so the message box inside can stay pinned to the bottom of the screen. */}
      <Card title="Messages" padding="none" className="overflow-visible!" action={count > 0 && <Pill>{count === 1 ? "1 conversation" : `${count} conversations`}</Pill>}>
        {client && user && managerUser ? (
          <ClientChat clientId={client.id} me={user} manager={managerUser} messages={messages} threads={threads} />
        ) : (
          <div className="p-6">
            <EmptyState title="No manager yet">Once we choose your account manager, you can message them here.</EmptyState>
          </div>
        )}
      </Card>
    </Columns>
  );
}

"use client";

import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Conversation } from "@/components/messages/Conversation";
import { Card, EmptyState } from "@/components/ui";
import { fullName } from "@/lib/format";
import { useData, useMyClient } from "@/lib/mock";

/** C10 Messages: one conversation with the account manager. Text, files and voice notes. */
export default function MessagesPage() {
  const { client, user, managerUser, messages } = useMyClient();
  const { users } = useData();

  return (
    <Columns {...rails.clientMain}>
      <Card title={managerUser ? fullName(managerUser) : "Messages"} padding="none" action={managerUser && <span className="text-caption text-secondary">Your account manager</span>}>
        {client && user && managerUser ? (
          <Conversation clientId={client.id} messages={messages} me={user} users={users} />
        ) : (
          <div className="p-6">
            <EmptyState title="No manager yet">Once we choose your account manager, you can message them here.</EmptyState>
          </div>
        )}
      </Card>
    </Columns>
  );
}

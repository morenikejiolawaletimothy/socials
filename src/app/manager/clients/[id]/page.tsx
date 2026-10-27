"use client";

import Link from "next/link";
import { use } from "react";
import { Avatar, Badge, Card, EmptyState } from "@/components/ui";
import { Placeholder } from "@/components/shell/Placeholder";
import { useDb } from "@/lib/mock";
import { statusBadge } from "@/lib/status";

export default function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const client = useDb((db) => db.clients.find((c) => c.id === id));
  const user = useDb((db) => db.users.find((u) => u.id === client?.userId));

  if (!client || !user) {
    return <EmptyState title="Client not found">This client is not on your list. Go back to Clients.</EmptyState>;
  }
  const name = `${user.firstName} ${user.lastName}`;
  const badge = statusBadge[client.status];

  return (
    <Placeholder
      layout="managerMain"
      title={name}
      batch="1.5"
      flows="M2"
      crumbs={[{ label: "Clients", href: "/manager/clients" }, { label: name }]}
    >
      <Card className="flex items-center gap-4">
        <Avatar name={name} size="lg" />
        <div className="flex min-w-0 flex-col gap-1">
          <p className="truncate text-body-sm text-secondary">{user.title}</p>
          <Badge status={badge.tone}>{badge.label}</Badge>
        </div>
      </Card>
      <Link
        href={`/manager/clients/${id}/content`}
        className="self-start rounded-sm font-medium text-primary-600 hover:text-primary-700 hover:underline focus-visible:focus-ring"
      >
        Open content
      </Link>
    </Placeholder>
  );
}

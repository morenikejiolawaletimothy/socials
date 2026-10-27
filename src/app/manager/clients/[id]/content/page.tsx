"use client";

import { use } from "react";
import { Placeholder } from "@/components/shell/Placeholder";
import { useDb } from "@/lib/mock";

export default function ClientContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const user = useDb((db) => db.users.find((u) => u.id === db.clients.find((c) => c.id === id)?.userId));
  const name = user ? `${user.firstName} ${user.lastName}` : "Client";

  return (
    <Placeholder
      title="Content"
      batch="1.5"
      flows="M4, M5"
      crumbs={[
        { label: "Clients", href: "/manager/clients" },
        { label: name, href: `/manager/clients/${id}` },
        { label: "Content" },
      ]}
    />
  );
}

"use client";

import { useRouter } from "next/navigation";
import { AssistantForm } from "@/components/client/Assistants";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { EmptyState } from "@/components/ui";
import { useData, useMyClient } from "@/lib/mock";

/** C19: the add or edit assistant page. After Save or Cancel it goes back to where it was opened from (?back=), or Assistants. */
export function AssistantFormPage({ id }: { id?: string }) {
  const router = useRouter();
  const { client } = useMyClient();
  const db = useData();
  if (!client) return null;
  const assistant = id ? (db.assistants ?? []).find((a) => a.id === id && a.clientId === client.id) : undefined;
  const back = () => {
    const next = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("back");
    router.push(next && next.startsWith("/") && !next.startsWith("//") ? next : "/assistants");
  };
  return (
    <Columns {...rails.clientSettings}>
      {id && !assistant ? <EmptyState title="This assistant is no longer here">They may have been removed. Your assistants are listed in Assistants.</EmptyState> : <AssistantForm clientId={client.id} assistant={assistant} onDone={back} />}
    </Columns>
  );
}

"use client";

import { ListChecks } from "@phosphor-icons/react";
import Link from "next/link";
import { kindLabels } from "@/components/client/Assistants";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Avatar, Button, buttonClass, Card, EmptyState, Meta, Pill, Tile, TileFooter, useConfirm } from "@/components/ui";
import { plural } from "@/lib/format";
import { act, useData, useMyClient, type Assistant } from "@/lib/mock";

/** C19 Assistants: the client's EA or PA, who can do quick tasks from a private link without an account. */
export default function AssistantsPage() {
  const { client, tasks } = useMyClient();
  const db = useData();
  const confirm = useConfirm();
  if (!client) return null;
  const assistants = (db.assistants ?? []).filter((a) => a.clientId === client.id);
  const withThem = (a: Assistant) => tasks.filter((t) => t.handoff?.assistantId === a.id && !t.handoff.endedAt && !t.done);

  return (
    <Columns {...rails.clientSettings}>
      <Card
        title="Your assistants"
        action={assistants.length > 0 ? <Pill>{plural(assistants.length, "assistant")}</Pill> : undefined}
        info="Hand quick tasks to your executive or personal assistant. They get a private link to that one task by email or WhatsApp, with no account. They cannot see your posts, messages, strategy or billing, and cannot approve anything for you."
      >
        <div className="flex flex-col gap-4">

          {assistants.length === 0 ? (
            <EmptyState title="No assistants yet">Add the person who handles things for you when you are busy.</EmptyState>
          ) : (
            <ul className="flex flex-col gap-3">
              {assistants.map((a) => {
                const open = withThem(a);
                return (
                  <li key={a.id}>
                    <Tile>
                      <span className="flex items-start gap-4">
                        <Avatar name={a.name} size="md" />
                        <span className="flex min-w-0 flex-1 flex-col gap-1">
                          <span className="flex flex-wrap items-center gap-2 text-body font-medium text-primary">
                            {a.name} <Pill>{a.role}</Pill>
                          </span>
                          <span className="text-body-sm break-words text-secondary">{[a.email, a.whatsapp && `WhatsApp ${a.whatsapp}`].filter(Boolean).join(" · ")}</span>
                          <span className="text-body-sm text-secondary">
                            {a.auto.length ? `Gets ${a.auto.map((k) => kindLabels[k].toLowerCase()).join(", ")} as soon as they arrive.` : "Gets tasks when you hand them over."}
                          </span>
                        </span>
                      </span>
                      <TileFooter>
                        <Meta icon={ListChecks}>{open.length ? `${plural(open.length, "task")} with ${a.name.split(" ")[0]}` : "No tasks with them now"}</Meta>
                        <span className="flex gap-2">
                          <Button
                            size="sm"
                            variant="remove"
                            onClick={() =>
                              confirm({
                                title: `Remove ${a.name}?`,
                                body: open.length ? `${a.name.split(" ")[0]} has ${plural(open.length, "task")} from you. They come back to you.` : `${a.name.split(" ")[0]} will no longer get your tasks.`,
                                warning: open.length ? "Their links stop working straight away." : undefined,
                                confirmLabel: "Remove",
                                tone: "danger",
                                action: () => act.removeAssistant(a.id),
                                success: `${a.name} removed.`,
                              })
                            }
                          >
                            Remove
                          </Button>
                          <Link href={`/assistants/${a.id}`} className={buttonClass("secondary", "sm")}>
                            Edit
                          </Link>
                        </span>
                      </TileFooter>
                    </Tile>
                  </li>
                );
              })}
            </ul>
          )}
          <Link href="/assistants/new" className={`self-start ${buttonClass("primary")}`}>
            Add an assistant
          </Link>
        </div>
      </Card>
    </Columns>
  );
}

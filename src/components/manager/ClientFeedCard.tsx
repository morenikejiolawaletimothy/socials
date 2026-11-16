"use client";

import Link from "next/link";
import { useState } from "react";
import { FeedCard } from "@/components/client/FeedCard";
import { buildFeed, iconFor } from "@/components/client/HomeTabs";
import { plainText } from "@/components/content/PostText";
import { buttonClass, Card, Pill, TextButton, TextLink, useConfirm, useToast } from "@/components/ui";
import { dateTime } from "@/lib/format";
import { act, type ClientBundle } from "@/lib/mock";

/**
 * The client's feed as they see it, on the manager's client page: the same cards and the same five statuses,
 * so both sides read one state. The manager can send a task, and edit or withdraw one the client has not done.
 */
export function ClientFeedCard({ b, id }: { b: ClientBundle; id: string }) {
  const confirm = useConfirm();
  const toast = useToast();
  const [all, setAll] = useState(false);
  const premium = b.client?.service === "full-service";
  const first = b.user?.firstName ?? "The client";
  const items = buildFeed(b, premium).sort((a, c) => c.sent.localeCompare(a.sent));
  const done = items.filter((i) => i.status === "completed").length;
  const shown = all ? items : items.slice(0, 4);

  return (
    <Card
      title={`${first}'s feed`}
      info={`Exactly what ${first} sees on Home. ${premium ? `${first} is on Premium: tasks show as notices of what you are about to do, and they only approve posts.` : `${first} is on Regular: they approve and publish posts and do the tasks you send.`}`}
      action={
        <span className="flex items-center gap-3">
          <TextLink href={`/manager/clients/${id}/task`}>{premium ? "Add a notice" : "Send a task"}</TextLink>
          <Pill>{`${done} of ${items.length} done`}</Pill>
        </span>
      }
    >
      <div className="flex flex-col gap-3">
        {shown.length ? (
          shown.map((i) => (
            <FeedCard
              key={i.key}
              status={i.status}
              icon={iconFor(i)}
              title={i.title}
              time={dateTime(i.at)}
              resource={i.type === "task" ? i.task.resource : undefined}
              footer={
                i.type === "task" && !i.task.done && i.task.body ? (
                  <>
                    <TextButton
                      onClick={() =>
                        confirm({
                          title: "Withdraw this task?",
                          body: `“${i.title}” leaves ${first}'s feed and we tell them there is nothing to do.`,
                          confirmLabel: "Withdraw",
                          tone: "danger",
                          action: async () => {
                            await act.withdrawTask(i.task.id);
                            toast("Withdrawn.");
                          },
                        })
                      }
                    >
                      Withdraw
                    </TextButton>
                    <Link href={`/manager/clients/${id}/task?task=${i.task.id}`} className={buttonClass("secondary", "sm")}>
                      Edit
                    </Link>
                  </>
                ) : i.type === "post" && (i.status === "drafting" || i.status === "changes") ? (
                  <Link href={`/manager/clients/${id}/content`} className={buttonClass("secondary", "sm")}>
                    Open in content
                  </Link>
                ) : undefined
              }
            >
              {i.type === "post" ? plainText(i.post.text) : i.type === "task" ? i.task.body : b.strategy?.goal}
            </FeedCard>
          ))
        ) : (
          <p className="text-body-sm text-secondary">Nothing in {first}&apos;s feed yet. Posts you send for review and tasks show up here.</p>
        )}
        {items.length > 4 && <TextButton className="self-start" onClick={() => setAll((x) => !x)}>{all ? "Show less" : `Show all ${items.length}`}</TextButton>}
      </div>
    </Card>
  );
}

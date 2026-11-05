"use client";

import { ArrowSquareOut, CheckCircle, Clock, Copy } from "@phosphor-icons/react";
import { useState } from "react";
import { PostThumb } from "@/components/content/PostMedia";
import { PostPreview } from "@/components/content/PostPreview";
import { plainText } from "@/components/content/PostText";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Badge, Banner, Button, Card, EmptyState, Meta, Pill, Tabs, Tile, TileAction, TileFooter, textActionClass, useTask, useToast } from "@/components/ui";
import { agoIn, dayTimeIn, fullName, plural } from "@/lib/format";
import { act, useMyClient, type Post } from "@/lib/mock";

const LINKEDIN_COMPOSER = "https://www.linkedin.com/feed/?shareActive=true";

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** The media line: what the client attaches themselves on LinkedIn, since we hand them the post, not post it for them. */
function mediaNote(post: Post) {
  if (post.video) return "Add your video on LinkedIn.";
  if (post.carousel) return "Add your document (carousel) on LinkedIn.";
  if (post.image) return "Add your image on LinkedIn.";
  return null;
}

/** C7: one approved post the client publishes themselves. Copy the caption, open LinkedIn, add media, mark it posted. */
function PublishItem({ post, author }: { post: Post; author: { name: string; title?: string } }) {
  const toast = useToast();
  const { run, pending } = useTask();
  const overdue = post.scheduledFor ? new Date(post.scheduledFor).getTime() < Date.now() : false;
  const media = mediaNote(post);

  return (
    <Card
      title={post.topic}
      action={overdue ? <Badge status="warning">Past the best time</Badge> : post.scheduledFor ? <Meta icon={Clock}>Best time {dayTimeIn(post.scheduledFor)}</Meta> : undefined}
      info={
        <ol className="flex list-decimal flex-col gap-1 pl-4">
          <li>Copy the caption.</li>
          <li>Open LinkedIn and paste it.</li>
          {media && <li>{media}</li>}
          <li>Post it, then mark it posted here.</li>
        </ol>
      }
    >
      <div className="flex flex-col gap-4">
        {post.why && <Banner tone="info">Why: {post.why}</Banner>}
        <PostPreview post={post} author={author} meta={overdue ? "Ready to publish" : post.scheduledFor ? `Best time ${dayTimeIn(post.scheduledFor)}` : "Ready to publish"} clamp={false} />

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={async () => {
              const ok = await copy(post.text);
              toast(ok ? "Caption copied. Paste it into LinkedIn." : "Copy did not work. Select the caption above and copy it by hand.", ok ? "success" : "danger");
            }}
          >
            <Copy className="size-4" aria-hidden /> Copy caption
          </Button>
          <a href={LINKEDIN_COMPOSER} target="_blank" rel="noreferrer" className={textActionClass}>
            <ArrowSquareOut className="size-4" aria-hidden /> Open LinkedIn
          </a>
          <Button
            size="sm"
            className="ml-auto"
            loading={pending("posted")}
            onClick={() =>
              run("posted", () => act.markPosted(post.id), {
                text: "Marked as posted. It is now in Live.",
                action: { label: "Undo", onClick: () => act.setPostStatus(post.id, "scheduled", { scheduledFor: post.scheduledFor }) },
              })
            }
          >
            {!pending("posted") && <CheckCircle className="size-4" aria-hidden />} Mark as posted
          </Button>
        </div>
      </div>
    </Card>
  );
}

/** C7 Publish: approved posts the client publishes themselves (no API). Full-service clients never see this; their team does it. */
export function PublishList() {
  const { client, user, posts, managerUser } = useMyClient();
  const [tab, setTab] = useState<"publish" | "done">("publish");
  if (!client || !user) return null;

  const toPublish = posts
    .filter((p) => p.status === "scheduled")
    .sort((a, b) => (a.scheduledFor ?? "").localeCompare(b.scheduledFor ?? ""));
  const justLive = posts.filter((p) => p.status === "published").sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "")).slice(0, 5);
  const author = { name: fullName(user), title: user.title };
  const overdue = toPublish.filter((p) => p.scheduledFor && new Date(p.scheduledFor).getTime() < Date.now()).length;

  return (
    <Columns {...rails.clientMain}>
      <Card
        title="Posts to publish"
        padding="sm"
        action={toPublish.length > 0 ? <Pill>{plural(toPublish.length, "post")}</Pill> : undefined}
        info={`${managerUser?.firstName ?? "Your manager"} prepared these and you approved them. LinkedIn only lets you post from your own account, so publish each one yourself: it takes about a minute.`}
      >
        {/* The tab row sits right under the title; the picked tab's cards follow below the card. */}
        <Tabs
          label="Publish sections"
          value={tab}
          onChange={setTab}
          className="max-w-none w-full bg-neutral-50!"
          tabs={[
            { value: "publish", label: "To publish", count: toPublish.length },
            { value: "done", label: "Just published", count: justLive.length },
          ]}
        />
      </Card>

      {tab === "publish" && (
        <>
          {overdue > 0 && <Banner tone="warning">{plural(overdue, "post")} past the best time to post. Publishing now still works.</Banner>}
          {toPublish.length === 0 && (
            <Card>
              <EmptyState title="Nothing to publish right now">When you approve a post and your manager sets its time, it shows here ready to publish.</EmptyState>
            </Card>
          )}
          {toPublish.map((p) => (
            <PublishItem key={p.id} post={p} author={author} />
          ))}
        </>
      )}

      {tab === "done" && (
        <Card title="Just published" action={justLive.length > 0 ? <Pill>{plural(justLive.length, "post")}</Pill> : undefined} info="Posts you have published show here, then move to Live.">
          {justLive.length ? (
            // The same post tile as the client Content page: thumbnail, first line and topic, then the footer (when it went out, View in Live).
            <ul className="flex flex-col gap-3">
              {justLive.map((p) => (
                <li key={p.id}>
                  <Tile href="/content?tab=live">
                    <span className="flex items-start gap-4">
                      <PostThumb post={p} size="lg" />
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="line-clamp-2 text-body font-medium text-primary">{plainText(p.text).split("\n")[0]}</span>
                        <span className="text-body-sm text-secondary">{p.topic}</span>
                      </span>
                    </span>
                    <TileFooter>
                      <span className="flex flex-wrap items-center gap-3">
                        {p.publishedAt && <Meta icon={CheckCircle}>Published {agoIn(p.publishedAt)}</Meta>}
                        <Badge status="success">Published</Badge>
                      </span>
                      <TileAction>View in Live</TileAction>
                    </TileFooter>
                  </Tile>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body-sm text-secondary">Nothing published yet.</p>
          )}
        </Card>
      )}
    </Columns>
  );
}

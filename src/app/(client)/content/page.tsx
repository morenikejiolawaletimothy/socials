"use client";

import { CalendarBlank, Timer } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { LiveCard, ReviewCard } from "@/components/client/HomeCards";
import { ChangeRequestActions, UpcomingPostActions } from "@/components/client/LivePostActions";
import { PostThumb } from "@/components/content/PostMedia";
import { PostPreview } from "@/components/content/PostPreview";
import { plainText } from "@/components/content/PostText";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Badge, Banner, Card, EmptyState, Meta, Pill, Tabs, TextButton, TextLink, Tile, TileAction, TileFooter } from "@/components/ui";
import { agoIn, dayIn, dayTimeIn, fullName, plural, time } from "@/lib/format";
import { useMyClient, type Post } from "@/lib/mock";
import { isOverdue, postBadge } from "@/lib/status";

type Tab = "review" | "overdue" | "upcoming" | "live" | "other";
const tabNames: Tab[] = ["review", "overdue", "upcoming", "live", "other"];
/** Older links use other names for a tab ("scheduled" is Coming up). Anything unknown opens To review. */
const aliases: Record<string, Tab> = { scheduled: "upcoming" };
function toTab(value: string | null): Tab {
  const t = value ? (aliases[value] ?? value) : "review";
  return tabNames.includes(t as Tab) ? (t as Tab) : "review";
}

const empty: Record<Tab, { title: string; text: string }> = {
  review: { title: "Nothing to review", text: "When your manager sends posts for your review, they appear here." },
  overdue: { title: "Nothing overdue", text: "Posts not reviewed by their due time appear here. You can still review them at any time." },
  upcoming: { title: "Nothing scheduled yet", text: "Approved posts appear here with the day and time they go out." },
  live: { title: "No live posts yet", text: "Posts appear here once they are on LinkedIn." },
  other: { title: "Nothing held", text: "Posts that are held, being changed or did not post appear here." },
};

/**
 * One post as a tile, like the Home tiles: a strip on top (when it goes live, or its status) with the actions,
 * then the thumbnail, first line and topic. "View post" opens the full post inside the tile.
 */
function PostTile({ post, top, actions, children }: { post: Post; top: React.ReactNode; actions?: React.ReactNode; children?: React.ReactNode }) {
  const { user } = useMyClient();
  const [open, setOpen] = useState(false);
  const meta = [post.topic, post.scheduledAt ? `Scheduled ${agoIn(post.scheduledAt)}` : post.sentAt ? `Assigned ${agoIn(post.sentAt)}` : ""].filter(Boolean).join(" · ");
  return (
    <li className="flex flex-col rounded-md border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        {top}
        {actions}
      </div>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-start gap-4">
          <PostThumb post={post} size="lg" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="line-clamp-2 text-body font-medium text-primary">{plainText(post.text).split("\n")[0]}</span>
            <span className="text-body-sm text-secondary">{meta}</span>
          </div>
        </div>
        {children}
        {open && <PostPreview post={post} author={{ name: fullName(user), title: user?.title }} meta={post.scheduledFor ? `${dayIn(post.scheduledFor)} · ${time(post.scheduledFor)}` : postBadge[post.status].label} />}
        <TextButton className="self-start" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? "Hide post" : "View post"}
        </TextButton>
      </div>
    </li>
  );
}

/** C7 Content: the client's posts by stage. Same arrangement as the Home tabs: the tab row on its own, then one card per tab. */
function ContentPage() {
  const router = useRouter();
  const tab = toTab(useSearchParams().get("tab"));
  const b = useMyClient();
  const { posts } = b;

  const groups: Record<Tab, Post[]> = {
    review: posts.filter((p) => p.status === "awaiting-client"),
    overdue: posts.filter(isOverdue).sort((a, c) => (a.dueAt ?? "").localeCompare(c.dueAt ?? "")),
    upcoming: posts.filter((p) => p.status === "scheduled" || p.status === "approved").sort((a, c) => (a.scheduledFor ?? "z").localeCompare(c.scheduledFor ?? "z")),
    live: posts.filter((p) => p.status === "published"),
    other: posts.filter((p) => ["on-hold", "changes-requested", "failed"].includes(p.status) && !isOverdue(p)),
  };
  const list = groups[tab];
  const label = { review: "To review", overdue: "Overdue", upcoming: "Coming up", live: "Live", other: "Held or changing" }[tab];
  const firstDue = groups.review.find((p) => p.dueAt)?.dueAt;

  return (
    <Columns {...rails.clientMain}>
      <div className="sticky top-14 z-20 rounded-lg border border-border bg-card p-2">
        <Tabs
          label="Content"
          value={tab}
          onChange={(t) => router.replace(`/content?tab=${t}`, { scroll: false })}
          showZero
          className="max-w-none w-full bg-neutral-50!"
          tabs={[
            { value: "review" as Tab, label: "To review", count: groups.review.length },
            { value: "overdue" as Tab, label: "Overdue", count: groups.overdue.length },
            { value: "upcoming" as Tab, label: "Coming up", count: groups.upcoming.length },
            { value: "live" as Tab, label: "Live", count: groups.live.length, live: true },
            // Only when something is held for another reason, being changed, or did not post.
            ...(groups.other.length || tab === "other" ? [{ value: "other" as Tab, label: "Held or changing", count: groups.other.length }] : []),
          ]}
        />
      </div>

      <div role="tabpanel" aria-label={label} className="flex flex-col gap-4">
        {list.length === 0 ? (
          <EmptyState title={empty[tab].title}>{empty[tab].text}</EmptyState>
        ) : (
          <>
            {tab === "review" && (
              <>
                <Banner tone="info" closeKey="content-review-waiting" action={<TextLink href="/content/review" className="text-body-sm">Review now</TextLink>}>
                  {plural(list.length, "post")} {list.length === 1 ? "is" : "are"} waiting for you.{firstDue ? ` Due ${dayTimeIn(firstDue)}.` : ""}
                </Banner>
                <ReviewCard b={b} overdue={false} />
              </>
            )}

            {tab === "overdue" && (
              <Card
                title="Overdue"
                action={<Pill label={`${plural(list.length, "post")} overdue`}>{plural(list.length, "post")}</Pill>}
                info="Not reviewed by the due time, so held. Nothing went out. You can still review them at any time, and they go back on the plan."
              >
                <div className="flex flex-col gap-4">
                  <ul className="flex flex-col gap-3">
                    {list.map((p) => (
                      <li key={p.id}>
                        <Tile href={`/content/review?post=${p.id}`}>
                          <span className="flex items-start gap-4">
                            <PostThumb post={p} size="lg" />
                            <span className="flex min-w-0 flex-1 flex-col gap-1">
                              <span className="line-clamp-2 text-body font-medium text-primary">{plainText(p.text).split("\n")[0]}</span>
                              <span className="text-body-sm text-secondary">
                                {p.topic}
                                {p.sentAt && ` · Assigned ${agoIn(p.sentAt)}`}
                              </span>
                            </span>
                          </span>
                          <TileFooter>
                            <span className="flex flex-wrap items-center gap-3">
                              <Meta icon={Timer}>{p.dueAt ? `Was due ${dayTimeIn(p.dueAt)}` : "Past its due time"}</Meta>
                              <Badge status="danger">Overdue</Badge>
                            </span>
                            <TileAction>Review</TileAction>
                          </TileFooter>
                        </Tile>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            )}

            {tab === "upcoming" && (
              <Card title="Coming up" action={<Pill label={`${plural(list.length, "post")} coming up`}>{plural(list.length, "post")}</Pill>}>
                <ul className="flex flex-col gap-3">
                  {list.map((p) => (
                    <PostTile
                      key={p.id}
                      post={p}
                      top={
                        p.scheduledFor ? (
                          <Meta icon={CalendarBlank}>
                            Goes live {dayIn(p.scheduledFor)} · {time(p.scheduledFor)}
                          </Meta>
                        ) : (
                          <Badge status={postBadge[p.status].tone}>{postBadge[p.status].label}</Badge>
                        )
                      }
                      actions={<UpcomingPostActions post={p} />}
                    />
                  ))}
                </ul>
              </Card>
            )}

            {tab === "live" && <LiveCard b={b} />}

            {tab === "other" && (
              <Card title="Held or changing" action={<Pill label={`${plural(list.length, "post")} held or changing`}>{plural(list.length, "post")}</Pill>}>
                <ul className="flex flex-col gap-3">
                  {list.map((p) => {
                    const stoppedByYou = p.status === "on-hold" && p.heldReason?.startsWith("You stopped");
                    return (
                      <PostTile
                        key={p.id}
                        post={p}
                        top={<Badge status={postBadge[p.status].tone}>{postBadge[p.status].label}</Badge>}
                        actions={p.scheduledFor ? <Meta icon={Timer}>Was due {dayIn(p.scheduledFor)} · {time(p.scheduledFor)}</Meta> : undefined}
                      >
                        {stoppedByYou && <UpcomingPostActions post={p} />}
                        {p.heldReason && !stoppedByYou && <Banner tone="warning">Held: {p.heldReason}</Banner>}
                        {p.status === "changes-requested" && <ChangeRequestActions post={p} />}
                        {p.status === "failed" && <Banner tone="warning">LinkedIn did not accept this post. Your manager is fixing it and will try again.</Banner>}
                      </PostTile>
                    );
                  })}
                </ul>
              </Card>
            )}
          </>
        )}
      </div>
    </Columns>
  );
}

export default function Page() {
  return (
    <Suspense>
      <ContentPage />
    </Suspense>
  );
}

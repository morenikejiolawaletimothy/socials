"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LivePostActions } from "@/components/client/LivePostActions";
import { PostPreview } from "@/components/content/PostPreview";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Badge, Card, EmptyState, Tabs } from "@/components/ui";
import { ago, dayTime, dayTimeIn, fullName } from "@/lib/format";
import { useMyClient, type Post } from "@/lib/mock";
import { postBadge } from "@/lib/status";

type Tab = "review" | "upcoming" | "live" | "other";

const buttonLink =
  "inline-flex min-h-11 items-center justify-center self-start rounded-md border border-transparent bg-primary-600 px-5 py-3 text-body font-medium leading-none text-inverse transition-colors hover:bg-primary-700 focus-visible:focus-ring";

function ContentPage() {
  const router = useRouter();
  const tab = (useSearchParams().get("tab") as Tab) || "review";
  const { posts, user } = useMyClient();
  const author = { name: fullName(user), title: user?.title };

  const groups: Record<Tab, Post[]> = {
    review: posts.filter((p) => p.status === "awaiting-client"),
    upcoming: posts.filter((p) => p.status === "scheduled" || p.status === "approved").sort((a, b) => (a.scheduledFor ?? "z").localeCompare(b.scheduledFor ?? "z")),
    live: posts.filter((p) => p.status === "published" || p.status === "taken-down").sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "")),
    other: posts.filter((p) => ["on-hold", "changes-requested", "failed"].includes(p.status)),
  };
  const list = groups[tab];

  return (
    <Columns {...rails.clientMain}>
      <Card title="Your content" padding="none">
        <div className="px-6">
          <Tabs
            label="Content"
            value={tab}
            onChange={(t) => router.replace(`/content?tab=${t}`, { scroll: false })}
            tabs={[
              { value: "review", label: "To review", count: groups.review.length },
              { value: "upcoming", label: "Coming up", count: groups.upcoming.length },
              { value: "live", label: "Live" },
              { value: "other", label: "Held or changing", count: groups.other.length },
            ]}
          />
        </div>

        <div className="flex flex-col">
          {tab === "review" && list.length > 0 && (
            <div className="flex flex-col gap-3 border-b border-border p-6">
              <p className="text-body text-primary">
                {list.length} {list.length === 1 ? "post is" : "posts are"} waiting for you. Due {list[0].dueAt ? dayTimeIn(list[0].dueAt) : "soon"}.
              </p>
              <Link href="/content/review" className={buttonLink}>
                Review now
              </Link>
            </div>
          )}

          {list.length === 0 && (
            <div className="p-6">
              <EmptyState title={{ review: "Nothing to review", upcoming: "Nothing scheduled yet", live: "No live posts yet", other: "Nothing held" }[tab]}>
                {{
                  review: "When your manager sends posts for your review, they appear here.",
                  upcoming: "Approved posts appear here with the day and time they go out.",
                  live: "Posts appear here once they are on LinkedIn.",
                  other: "Posts that are held, being changed or did not post appear here.",
                }[tab]}
              </EmptyState>
            </div>
          )}

          {list.map((p) => {
            const badge = postBadge[p.status];
            const meta =
              p.status === "published" ? ago(p.publishedAt!) : p.scheduledFor ? dayTime(p.scheduledFor) : p.dueAt ? `Due ${dayTimeIn(p.dueAt)}` : badge.label;
            return (
              <div key={p.id} className="flex flex-col gap-3 border-b border-border p-6 last:border-b-0">
                <div className="flex items-center justify-between gap-3">
                  <Badge status={badge.tone}>{badge.label}</Badge>
                  <span className="text-caption text-secondary">{p.topic}</span>
                </div>
                <PostPreview post={p} author={author} meta={meta}>
                  {p.status === "published" && <LivePostActions post={p} />}
                  {p.heldReason && <p className="text-body-sm text-secondary">Held: {p.heldReason}</p>}
                  {p.status === "changes-requested" && p.feedback?.length && (
                    <p className="text-body-sm text-secondary">You asked: &ldquo;{p.feedback[p.feedback.length - 1].text}&rdquo; Your manager is working on it.</p>
                  )}
                  {p.status === "failed" && <p className="text-body-sm text-secondary">LinkedIn did not accept this post. Your manager is fixing it and will try again.</p>}
                  {p.status === "taken-down" && <p className="text-body-sm text-secondary">You took this post down.</p>}
                </PostPreview>
              </div>
            );
          })}
        </div>
      </Card>
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

"use client";

import { useState } from "react";
import { upcomingCalls } from "@/components/rails/NextCallCard";
import { EmptyState, Tabs } from "@/components/ui";
import type { ClientBundle } from "@/lib/mock";
import { canReview } from "@/lib/status";
import { LiveCard, ReviewCard, TasksCard, UpcomingCard, UpdateCard, upcomingEvents } from "./HomeCards";

type FeedTab = "tasks" | "review" | "live" | "upcoming" | "updates";

/**
 * C1 Home feed, once the account is running: one tab per kind of thing, so nothing is buried in a long scroll.
 * Every tab always shows with its count (0 included); Live pulses red while a post is live.
 * It opens on the first tab with something in it. The tab row stays under the top bar while the page scrolls.
 */
export function HomeFeed({ b, primary }: { b: ClientBundle; primary: boolean }) {
  const openTasks = b.tasks.filter((t) => !t.done).length;
  const waiting = b.posts.filter(canReview).length;
  const live = b.posts.filter((p) => p.status === "published").length;
  const upcoming = b.posts.filter((p) => p.status === "scheduled").length + upcomingEvents(b.tasks).length + upcomingCalls(b.calls).length;
  const updates = b.updates.filter((u) => u.status === "sent").length;

  // Reports has no count tag; it opens on its own when there is a weekly update. Messages live in Messages and Notifications.
  const tabs: { value: FeedTab; label: string; count?: number; live?: boolean }[] = [
    { value: "tasks", label: "Tasks", count: openTasks },
    { value: "review", label: "Review", count: waiting },
    { value: "live", label: "Live", count: live, live: true },
    { value: "upcoming", label: "Coming up", count: upcoming },
    { value: "updates", label: "Reports" },
  ];

  const [picked, setPicked] = useState<FeedTab>();
  const tab = picked ?? tabs.find((t) => (t.count ?? 0) > 0 || (t.value === "updates" && updates > 0))?.value ?? "tasks";
  const label = tabs.find((t) => t.value === tab)?.label;

  const empty: Record<FeedTab, { title: string; text: string }> = {
    tasks: { title: "No tasks right now", text: "When there is something only you can do on LinkedIn, it shows here." },
    review: { title: "Nothing to review", text: "New posts for you to approve show here." },
    live: { title: "Nothing live yet", text: "Your posts show here as soon as they go out." },
    upcoming: { title: "Nothing coming up", text: "Scheduled posts, booked calls and events you have registered for show here with their dates." },
    updates: { title: "No reports yet", text: "Your weekly update from your manager shows here." },
  };
  const isEmpty = tab === "updates" ? !updates : tabs.find((t) => t.value === tab)?.count === 0;

  return (
    <>
      <div className="sticky top-14 z-20 rounded-lg border border-border bg-card p-2">
        <Tabs label="Home" tabs={tabs} value={tab} onChange={setPicked} showZero className="max-w-none w-full bg-neutral-50!" />
      </div>
      <div role="tabpanel" aria-label={label} className="flex flex-col gap-4">
        {isEmpty ? (
          <EmptyState title={empty[tab].title}>{empty[tab].text}</EmptyState>
        ) : (
          <>
            {tab === "tasks" && <TasksCard b={b} />}
            {tab === "review" && <ReviewCard b={b} primary={primary} />}
            {tab === "live" && <LiveCard b={b} />}
            {tab === "upcoming" && <UpcomingCard b={b} />}
            {tab === "updates" && <UpdateCard b={b} />}
          </>
        )}
      </div>
    </>
  );
}

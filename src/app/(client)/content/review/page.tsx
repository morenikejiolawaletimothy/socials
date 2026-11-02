"use client";

import { CheckCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { PostPreview } from "@/components/content/PostPreview";
import { VoiceRecorder } from "@/components/content/VoiceRecorder";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Banner, Breadcrumbs, Button, Card, Pill, Textarea, textActionClass, Tile, useConfirm, useTask } from "@/components/ui";
import { dayTimeIn, fullName, plural } from "@/lib/format";
import { act, useMyClient, type Post } from "@/lib/mock";
import { canReview, isOverdue } from "@/lib/status";

/** One post in the review: the why-note, the post as it will look, then Approve (always the primary action) or Ask for changes. */
function ReviewItem({
  post,
  author,
  manager,
  onDone,
}: {
  post: Post;
  author: { name: string; title?: string };
  manager?: string;
  onDone: () => void;
}) {
  const { run, pending } = useTask();
  const [changing, setChanging] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string>();

  return (
    <div className="flex flex-col gap-4">
      {post.why && (
        <Banner tone="info">
          <span className="font-medium">Why this post: </span>
          {post.why}
        </Banner>
      )}
      <Tile>
        <PostPreview post={post} author={author} meta="Draft" clamp={false} />
      </Tile>

      {changing ? (
        <Tile>
          <Textarea
            label="What would you like changed?"
            placeholder="For example: make the opening shorter, and do not name the bank."
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              setError(undefined);
            }}
            error={error}
            help="We remember your preferences for future posts."
          />
          <VoiceRecorder sample="Can we open with the trader's story, and cut the last line about trust. It sounds a bit preachy." onChange={setNote} />
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="cancel" onClick={() => setChanging(false)}>
              Cancel
            </Button>
            <Button
              loading={pending("changes")}
              onClick={async () => {
                if (!note.trim()) return setError("Write what you would like changed, or record a voice note.");
                if (await run("changes", () => act.askForChanges(post.id, note.trim()), "Sent to your manager. You will see the new version soon.")) onDone();
              }}
            >
              {pending("changes") ? "Sending" : "Send changes"}
            </Button>
          </div>
        </Tile>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            loading={pending("approve")}
            onClick={async () => {
              if (await run("approve", () => act.approvePost(post.id), "Approved. Your manager will schedule it.")) onDone();
            }}
          >
            {pending("approve") ? "Approving" : "Approve"}
          </Button>
          <Button variant="ghost" onClick={() => setChanging(true)}>
            Ask for changes
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * C7 Review content. Desktop: every post in one list. Phone: one post at a time, like stories.
 * With ?post=ID (from a post tile) it opens just that post, with a link to review the rest.
 * Shows the due time and what happens if the client does not reply (their C5 choice).
 */
function ReviewScreen({ only }: { only?: string }) {
  const { posts, user, managerUser, client } = useMyClient();
  const confirm = useConfirm();
  const waitingIds = posts.filter(canReview).map((p) => p.id);
  const single = !!only && waitingIds.includes(only);
  // Keep the set of posts fixed while reviewing, so the list does not jump as each one is approved.
  const [ids] = useState(() => (single ? [only!] : waitingIds));
  const items = useMemo(() => ids.map((id) => posts.find((p) => p.id === id)!).filter(Boolean), [ids, posts]);
  const pending = items.filter(canReview);
  const others = posts.filter((p) => canReview(p) && !ids.includes(p.id)).length;
  const [index, setIndex] = useState(0);
  const author = { name: fullName(user), title: user?.title };
  const due = items.find((p) => !isOverdue(p))?.dueAt;
  const current = pending[Math.min(index, pending.length - 1)];

  return (
    <Columns {...rails.clientMain}>
      <Card
        title={single ? "Review this post" : "Review your posts"}
        eyebrow={<Breadcrumbs items={[{ label: "Content", href: "/content" }, { label: "Review" }]} />}
        action={pending.length > 1 && <Pill>{plural(pending.length, "post")} left</Pill>}
      >
        {pending.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle className="size-12 text-success" aria-hidden />
            <p className="font-display text-display-lg text-primary">{others ? "Done" : "All done"}</p>
            <p className="max-w-sm text-body-sm text-secondary">
              {items.length
                ? "Your manager schedules what you approved and works on any changes you asked for. You will see them under Coming up."
                : "Nothing is waiting for your review right now."}
            </p>
            {others > 0 ? (
              <Link href="/content/review" className={textActionClass}>
                Review the other {plural(others, "post")}
              </Link>
            ) : (
              <Link href="/content?tab=upcoming" className={textActionClass}>
                See what is coming up
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {pending.some(isOverdue) && (
              <Banner tone="warning" title={pending.every(isOverdue) ? "Overdue" : "Some posts are overdue"}>
                {pending.length === 1
                  ? "This post was held because it was not reviewed by its due time. Nothing went out. Approve it or ask for changes now and it goes back on the plan."
                  : "Overdue posts were held because they were not reviewed by their due time. Nothing went out. Approve them or ask for changes now and they go back on the plan."}
              </Banner>
            )}
            {due && (
              <Banner tone="info" title={`Due ${dayTimeIn(due)}`}>
                {client?.review.ifNoReply === "wait"
                  ? "If you do not reply by then, we hold these posts and nothing goes out. You can change this in Control."
                  : "If you do not reply within 24 hours, your manager posts them. You can still take any post down."}
              </Banner>
            )}

            {/* Phone: one at a time */}
            <div className="flex flex-col gap-4 md:hidden">
              <div className="flex items-center gap-2" aria-hidden>
                {pending.map((p, i) => (
                  <span key={p.id} className={`h-1 flex-1 rounded-full ${p.id === current?.id ? "bg-primary-600" : i < index ? "bg-primary-300" : "bg-neutral-100"}`} />
                ))}
              </div>
              <p className="text-caption text-secondary">
                Post {pending.indexOf(current) + 1} of {pending.length}
              </p>
              {current && (
                <ReviewItem key={current.id} post={current} author={author} manager={fullName(managerUser)} onDone={() => setIndex(0)} />
              )}
              {pending.length > 1 && (
                <Button variant="ghost" onClick={() => setIndex((i) => (i + 1) % pending.length)}>
                  Skip for now
                </Button>
              )}
            </div>

            {/* Desktop: the whole list */}
            <ol className="hidden flex-col gap-8 md:flex">
              {pending.map((p, i) => (
                <li key={p.id} className={i > 0 ? "border-t border-border pt-8" : ""}>
                  <p className="mb-3 text-caption text-secondary">
                    Post {i + 1} of {pending.length} · {p.topic}
                    {isOverdue(p) && " · Overdue"}
                  </p>
                  <ReviewItem post={p} author={author} manager={fullName(managerUser)} onDone={() => undefined} />
                </li>
              ))}
            </ol>

            {pending.length > 1 && (
              <div className="flex flex-col gap-2 border-t border-border pt-6">
                <Button
                  variant="secondary"
                  className="self-start"
                  onClick={() =>
                    confirm({
                      title: `Approve all ${pending.length} posts?`,
                      body: "Your manager schedules them for the best times. You can still take any post down once it is live.",
                      warning: "Only approve posts you have read. Approved posts go out without asking you again.",
                      confirmLabel: "Approve all",
                      action: () => act.approveAll(pending.map((p) => p.id)),
                      success: `Approved ${plural(pending.length, "post")}.`,
                    })
                  }
                >
                  Approve all {pending.length}
                </Button>
                <p className="text-caption text-secondary">Only if you have read them all.</p>
              </div>
            )}

            {single && others > 0 && (
              <div className="border-t border-border pt-6">
                <Link href="/content/review" className={textActionClass}>
                  Review all {others + pending.length} waiting
                </Link>
              </div>
            )}
          </div>
        )}
      </Card>

    </Columns>
  );
}

function ReviewFromLink() {
  const only = useSearchParams().get("post") ?? undefined;
  // A new key when the post changes, so the fixed list above starts again.
  return <ReviewScreen key={only ?? "all"} only={only} />;
}

export default function ReviewPage() {
  return (
    <Suspense>
      <ReviewFromLink />
    </Suspense>
  );
}

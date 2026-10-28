"use client";

import { CheckCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PostPreview } from "@/components/content/PostPreview";
import { VoiceRecorder } from "@/components/content/VoiceRecorder";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Avatar, Banner, Breadcrumbs, Button, Card, Textarea, useConfirm, useTask } from "@/components/ui";
import { dayTimeIn, fullName, plural } from "@/lib/format";
import { act, useMyClient, type Post } from "@/lib/mock";

/** One post in the review: the why-note, the post as it will look, then Approve or Ask for changes. */
function ReviewItem({
  post,
  author,
  manager,
  primary,
  onDone,
}: {
  post: Post;
  author: { name: string; title?: string };
  manager?: string;
  primary: boolean;
  onDone: () => void;
}) {
  const { run, pending } = useTask();
  const [changing, setChanging] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string>();

  return (
    <div className="flex flex-col gap-4">
      {post.why && manager && (
        <div className="flex items-start gap-3 rounded-md bg-primary-50 p-4">
          <Avatar name={manager} size="sm" />
          <p className="text-body-sm text-primary">
            <span className="font-medium">Why this post: </span>
            {post.why}
          </p>
        </div>
      )}
      <div className="rounded-md border border-border p-4">
        <PostPreview post={post} author={author} meta="Draft" clamp={false} />
      </div>

      {changing ? (
        <div className="flex flex-col gap-4 rounded-md border border-border p-4">
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
            <Button variant="ghost" onClick={() => setChanging(false)}>
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
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant={primary ? "primary" : "secondary"}
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
 * Shows the due time and what happens if the client does not reply (their C5 choice).
 */
export default function ReviewPage() {
  const { posts, user, managerUser, client } = useMyClient();
  const confirm = useConfirm();
  // Keep the set of posts fixed while reviewing, so the list does not jump as each one is approved.
  const [ids] = useState(() => posts.filter((p) => p.status === "awaiting-client").map((p) => p.id));
  const items = useMemo(() => ids.map((id) => posts.find((p) => p.id === id)!).filter(Boolean), [ids, posts]);
  const pending = items.filter((p) => p.status === "awaiting-client");
  const [index, setIndex] = useState(0);
  const author = { name: fullName(user), title: user?.title };
  const due = items[0]?.dueAt;
  const current = pending[Math.min(index, pending.length - 1)];

  return (
    <Columns {...rails.clientMain}>
      <Card
        title="Review your posts"
        eyebrow={<Breadcrumbs items={[{ label: "Content", href: "/content" }, { label: "Review" }]} />}
        action={pending.length > 1 && <span className="text-caption text-secondary">{plural(pending.length, "post")} left</span>}
      >
        {pending.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle className="size-12 text-success" aria-hidden />
            <p className="font-display text-display-lg text-primary">All done</p>
            <p className="max-w-sm text-body-sm text-secondary">
              {items.length
                ? "Your manager schedules what you approved and works on any changes you asked for. You will see them under Coming up."
                : "Nothing is waiting for your review right now."}
            </p>
            <Link href="/content?tab=upcoming" className="rounded-sm font-medium text-primary-600 hover:text-primary-700 hover:underline focus-visible:focus-ring">
              See what is coming up
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
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
                <ReviewItem key={current.id} post={current} author={author} manager={fullName(managerUser)} primary onDone={() => setIndex(0)} />
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
                  </p>
                  <ReviewItem post={p} author={author} manager={fullName(managerUser)} primary={i === 0} onDone={() => undefined} />
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
          </div>
        )}
      </Card>

    </Columns>
  );
}

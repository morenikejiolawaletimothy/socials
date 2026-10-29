"use client";

import { useState } from "react";
import { PostAgainDialog } from "@/components/content/PostAgainDialog";
import { VoiceRecorder } from "@/components/content/VoiceRecorder";
import { Banner, Button, Dialog, Textarea, useConfirm, useTask } from "@/components/ui";
import { act, type Post } from "@/lib/mock";

const requestTitle = {
  fix: "Fix asked for",
  reshare: "You asked to share it again",
  new: "You asked to post it again",
};

/** Ask for something in writing or by voice: a fix to a live post, or a change to a scheduled one. */
function AskDialog({
  open,
  onClose,
  title,
  intro,
  label,
  placeholder,
  sample,
  busy,
  initial = "",
  sendLabel = "Send",
  onSend,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  intro: string;
  label: string;
  placeholder: string;
  sample: string;
  busy: boolean;
  initial?: string;
  sendLabel?: string;
  onSend: (note: string) => void;
}) {
  const [note, setNote] = useState(initial);
  const [error, setError] = useState<string>();
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <p className="text-body-sm text-secondary">{intro}</p>
      <Textarea
        label={label}
        placeholder={placeholder}
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          setError(undefined);
        }}
        error={error}
      />
      <VoiceRecorder sample={sample} onChange={setNote} />
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button loading={busy} onClick={() => (note.trim() ? onSend(note.trim()) : setError("Write what you would like, or record a voice note."))}>
          {busy ? "Sending" : sendLabel}
        </Button>
      </div>
    </Dialog>
  );
}

/** C8: on a live post, ask for a fix, ask to post it again, or take it down now. A taken-down post can be posted again as new. */
export function LivePostActions({ post }: { post: Post }) {
  const confirm = useConfirm();
  const { run, pending } = useTask();
  const [fixing, setFixing] = useState(false);
  const [again, setAgain] = useState(false);
  const req = post.request;
  const down = post.status === "taken-down";

  const againDialog = again && (
    <PostAgainDialog
      open
      onClose={() => setAgain(false)}
      title="Post it again"
      intro="Your manager prepares it and you review it before it goes out."
      onlyNew={down}
      noteLabel={(c) => (c === "reshare" ? "What should the new comment say? (optional)" : "Anything to change, or a good day for it? (optional)")}
      notePlaceholder="For example: add a line about the new office, and post it next week."
      busy={pending("again")}
      submitLabel="Send to your manager"
      onSubmit={async (choice, note) => {
        if (await run("again", () => act.askForRepost(post.id, choice, note || (choice === "reshare" ? "Share it again." : "Post it again.")), "Sent. Your manager will prepare it for your review.")) setAgain(false);
      }}
    />
  );

  const banner = req && (
    <Banner
      tone="info"
      title={req.kind === "fix" ? requestTitle.fix : requestTitle[req.repostAs ?? "reshare"]}
      action={
        <Button
          variant="ghost"
          onClick={() =>
            confirm({
              title: "Withdraw your request?",
              body: "Your manager is told and will not act on it. You can ask again at any time.",
              confirmLabel: "Withdraw",
              action: () => act.cancelPostRequest(post.id),
              success: "Request withdrawn.",
            })
          }
        >
          Withdraw
        </Button>
      }
    >
      {req.text} {req.kind === "fix" ? "Your manager will fix it today and tell you when it is done." : "Your manager will prepare it for your review."}
    </Banner>
  );

  if (down)
    return (
      <div className="flex flex-col gap-3">
        <Banner tone="neutral">{post.takenDownBy === "team" ? "Your manager took this post down." : "You took this post down."} It is no longer on LinkedIn.</Banner>
        {banner || (
          <Button variant="secondary" className="self-start" onClick={() => setAgain(true)}>
            Post it again
          </Button>
        )}
        {againDialog}
      </div>
    );

  return (
    <>
      {banner || (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setFixing(true)}>
            Ask for a fix
          </Button>
          <Button variant="ghost" onClick={() => setAgain(true)}>
            Post it again
          </Button>
          <Button
            variant="ghost"
            onClick={() =>
              confirm({
                title: "Take this post down?",
                body: "It comes off LinkedIn straight away, with its reactions and comments. Your manager is told.",
                warning: "You cannot undo this. The post cannot be put back with its reactions, only posted again as a new post.",
                confirmLabel: "Take it down",
                cancelLabel: "Keep it",
                tone: "danger",
                action: () => act.takeDown(post.id),
                success: "Post taken down. It is no longer on LinkedIn.",
              })
            }
          >
            Take it down
          </Button>
        </div>
      )}

      {fixing && (
        <AskDialog
          open
          onClose={() => setFixing(false)}
          title="What needs fixing?"
          intro="Your manager is told at once and fixes it today. Text fixes keep the post's reactions. The post stays up until then."
          label="Tell us what to fix"
          placeholder="For example: the clinic name in paragraph 2 is wrong."
          sample="Please change the number in the second line. It should be 4 hours, not 4 days."
          busy={pending("fix")}
          onSend={async (note) => {
            if (await run("fix", () => act.askForFix(post.id, note), "Sent. Your manager will fix it today.")) setFixing(false);
          }}
        />
      )}
      {againDialog}
    </>
  );
}

/** C7 Upcoming: change your mind before a post goes out. Ask for a change, or stop it (and put it back). */
export function UpcomingPostActions({ post }: { post: Post }) {
  const confirm = useConfirm();
  const { run, pending } = useTask();
  const [changing, setChanging] = useState(false);

  if (post.status === "on-hold")
    return (
      <div className="flex flex-col gap-3">
        <Banner tone="warning">{post.heldReason}</Banner>
        <Button variant="secondary" className="self-start" loading={pending("resume")} onClick={() => run("resume", () => act.resumePost(post.id), "Back on the schedule. Your manager is told.")}>
          Post it after all
        </Button>
      </div>
    );

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setChanging(true)}>
          Ask for a change
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            confirm({
              title: "Stop this post?",
              body: "It will not go out. Your manager is told and holds it until you decide.",
              warning: "You can put it back on the schedule later from Other.",
              confirmLabel: "Stop it",
              cancelLabel: "Keep it scheduled",
              action: () => act.stopPost(post.id),
              success: { text: "Stopped. It will not go out.", action: { label: "Undo", onClick: () => run("resume", () => act.resumePost(post.id), "Back on the schedule.") } },
            })
          }
        >
          Don&apos;t post it
        </Button>
      </div>
      {changing && (
        <AskDialog
          open
          onClose={() => setChanging(false)}
          title="What would you like changed?"
          intro="It comes off the schedule while your manager makes the change, then comes back to you to approve."
          label="Tell us what to change"
          placeholder="For example: mention the Accra team too."
          sample="Can we mention the Accra team in the last line as well?"
          busy={pending("change")}
          onSend={async (note) => {
            if (await run("change", () => act.askForChanges(post.id, note), "Sent. It is off the schedule until you approve the new version.")) setChanging(false);
          }}
        />
      )}
    </>
  );
}

/** C7: after asking for changes, the client can change what they asked, or take it back. */
export function ChangeRequestActions({ post }: { post: Post }) {
  const confirm = useConfirm();
  const { run, pending } = useTask();
  const [editing, setEditing] = useState(false);
  const last = post.feedback?.[post.feedback.length - 1];
  if (!last) return null;
  return (
    <>
      <Banner
        tone="info"
        title="You asked for changes"
        action={
          <>
            <Button variant="secondary" onClick={() => setEditing(true)}>
              Edit
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                confirm({
                  title: "Withdraw your change request?",
                  body: "The post comes back to you to review as it was. Your manager is told to stop.",
                  confirmLabel: "Withdraw",
                  action: () => act.withdrawChangeRequest(post.id),
                  success: "Request withdrawn. The post is back in To review.",
                })
              }
            >
              Withdraw
            </Button>
          </>
        }
      >
        &ldquo;{last.text}&rdquo; Your manager is working on it.
      </Banner>
      {editing && (
        <AskDialog
          open
          onClose={() => setEditing(false)}
          title="Change what you asked"
          intro="Your manager is told at once and works from your new note."
          label="What you would like changed"
          placeholder="For example: mention the Accra team too."
          sample="Actually, keep the first line and just shorten the end."
          initial={last.text}
          sendLabel="Save"
          busy={pending("edit")}
          onSend={async (note) => {
            if (await run("edit", () => act.editChangeRequest(post.id, note), "Saved. Your manager has your new note.")) setEditing(false);
          }}
        />
      )}
    </>
  );
}

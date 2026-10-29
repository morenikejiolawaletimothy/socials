"use client";

import { CheckCircle, Clock, Image as ImageIcon, Sparkle, Trash, WarningCircle } from "@phosphor-icons/react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, use, useState } from "react";
import { PostAgainDialog } from "@/components/content/PostAgainDialog";
import { PostPreview, RepostNote } from "@/components/content/PostPreview";
import { Columns } from "@/components/layout/Columns";
import { OffLimitsBox } from "@/components/manager/ClientTabs";
import { rails } from "@/components/rails";
import { Badge, Banner, Breadcrumbs, Button, Dialog, EmptyState, Card, Input, Menu, Tabs, Textarea, useConfirm, useTask, useToast } from "@/components/ui";
import { ago, agoIn, dayTime, dayTimeIn, fullName, time } from "@/lib/format";
import { act, clientBundle, useMyManager, type ClientBundle, type Post } from "@/lib/mock";

type Tab = "ideas" | "drafts" | "changes" | "client" | "schedule" | "scheduled" | "live";

// Staff only: proposed ideas, each with its reason. Phase 2 generates these per client from the strategy and listening.
const firstIdeas: { title: string; reason: string; format: Post["format"] }[] = [
  { title: "What the mobile money report gets wrong about settlement", reason: "Signal: the central bank report, and 3 investors on the list wrote about it. Fits topic 1.", format: "opinion" },
  { title: "The question from the student at Lagos Fintech Week", reason: "Moment the client added, with photos. Event posts do best within a week.", format: "story" },
  { title: "5 questions to ask a payments partner before you sign", reason: "Goal: investor and partner conversations. How-to posts got saves last month.", format: "how-to" },
  { title: "Our first Ghana merchants, one year on", reason: "Past preference: the client approved every customer story so far.", format: "story" },
];
const moreIdeas: typeof firstIdeas = [
  { title: "Why we hold local liquidity in every market", reason: "Topic 1, and it answers the most common comment on last week's post.", format: "how-to" },
  { title: "The hire that changed how we build", reason: "Topic 3 (team). Hiring push next quarter.", format: "story" },
];

const checkKind = { "off-limits": "Off limits", claim: "Claim", phrase: "Banned phrase", generic: "Generic", repeat: "Repeat", "alt-text": "Image description" };
const nextWeekday9 = (days: number) => {
  const d = new Date(Date.now() + days * 86_400_000);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
};

/** Pick a visual from the client's Brand photos. */
function VisualPicker({ b, open, onClose, onPick }: { b: ClientBundle; open: boolean; onClose: () => void; onPick: (src: string, alt: string) => void }) {
  const photos = b.files.filter((f) => f.section === "photos" && f.src);
  return (
    <Dialog open={open} onClose={onClose} title="Choose a visual">
      <p className="text-body-sm text-secondary">From {b.user?.firstName}&apos;s Brand. Upload or use a template from the library in Phase 2.</p>
      <ul className="grid grid-cols-3 gap-2">
        {photos.map((f) => (
          <li key={f.id}>
            <button
              type="button"
              onClick={() => onPick(f.src!, f.name.replace(/[-_]/g, " ").replace(/\.\w+$/, ""))}
              className="relative block aspect-square w-full overflow-hidden rounded-md focus-visible:focus-ring"
            >
              <Image src={f.src!} alt={f.name} fill sizes="120px" className="object-cover transition-transform hover:scale-105" />
            </button>
          </li>
        ))}
      </ul>
    </Dialog>
  );
}

/** M4 one draft: direct it, edit it, see versions and checks, then send to the client with a why-note and due time. */
function DraftEditor({ post, b }: { post: Post; b: ClientBundle }) {
  const toast = useToast();
  const confirm = useConfirm();
  const { run, pending } = useTask();
  const [text, setText] = useState(post.text);
  const [direction, setDirection] = useState("");
  const [why, setWhy] = useState(post.why);
  const [version, setVersion] = useState(post.version ?? 1);
  const [picking, setPicking] = useState(false);
  const [dismissing, setDismissing] = useState<string | null>(null);
  const [dismissReason, setDismissReason] = useState("");
  const open = (post.checks ?? []).filter((k) => k.state === "open");
  const blocked = open.length > 0;
  const dirty = text !== post.text || why !== post.why;
  const first = b.user?.firstName ?? "the client";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-caption text-secondary">
          {post.topic} · {post.format} · version {version}
          {dirty && " · unsaved changes"}
        </span>
        <span className="flex items-center gap-2">
          <Badge status={blocked ? "warning" : "success"}>{blocked ? `${open.length} check${open.length > 1 ? "s" : ""} to clear` : "Checks clear"}</Badge>
          <button
            type="button"
            aria-label="Delete draft"
            onClick={() =>
              confirm({
                title: "Delete this draft?",
                body: `"${post.text.split("\n")[0].slice(0, 80)}" and all its versions are removed. ${first} has not seen it.`,
                warning: "You cannot undo this.",
                confirmLabel: "Delete draft",
                tone: "danger",
                action: () => act.deletePost(post.id),
                success: "Draft deleted.",
              })
            }
            className="flex size-9 items-center justify-center rounded-full text-secondary hover:bg-danger-bg hover:text-danger focus-visible:focus-ring"
          >
            <Trash className="size-4" aria-hidden />
          </button>
        </span>
      </div>

      <Textarea
        label={post.repostOf?.reshare ? "New comment" : "Draft"}
        rows={7}
        value={text}
        onChange={(e) => setText(e.target.value)}
        help={`${text.length} characters. LinkedIn shows about 210 before "See more".`}
      />
      <RepostNote post={post} />

      <form
        className="flex flex-col gap-2 sm:flex-row sm:items-end"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!direction.trim()) return;
          const ok = await run("rewrite", () => act.save());
          if (!ok) return;
          setVersion((v) => v + 1);
          setText((t) => (direction.toLowerCase().includes("short") ? t.split("\n\n").slice(0, 2).join("\n\n") : `${t}\n\nWhat would you add?`));
          toast(`Version ${version + 1} ready: "${direction.trim()}"`);
          setDirection("");
        }}
      >
        <label className="flex flex-1 flex-col gap-2">
          <span className="flex items-center gap-1 text-body-sm font-medium text-primary">
            <Sparkle className="size-4 text-primary-600" aria-hidden /> Direct the draft
          </span>
          <input
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            placeholder="Shorter. Open with the story. Less formal."
            className="min-h-11 rounded-sm border border-border-strong bg-card px-4 text-body text-primary placeholder:text-neutral-400 focus-visible:border-primary-600 focus-visible:focus-ring"
          />
        </label>
        <Button type="submit" variant="secondary" loading={pending("rewrite")}>
          {pending("rewrite") ? "Rewriting" : "Rewrite"}
        </Button>
      </form>

      {post.repostOf?.reshare ? (
        <p className="text-caption text-secondary">A reshare carries the original post, so it takes no visual of its own.</p>
      ) : (
        <div className="flex items-start gap-3 rounded-md bg-neutral-25 p-4">
          {post.image ? (
            <span className="relative size-16 shrink-0 overflow-hidden rounded-sm">
              <Image src={post.image.src} alt={post.image.alt} fill sizes="64px" className="object-cover" />
            </span>
          ) : (
            <ImageIcon className="mt-0.5 size-5 shrink-0 text-primary-600" aria-hidden />
          )}
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-body-sm font-medium text-primary">Visual</span>
            <span className="text-body-sm text-secondary">
              {post.image
                ? `Attached: ${post.image.alt}.`
                : "Suggested: the stage photo from the client's Brand, or text on a brand-coloured card. A quote card from the template library would also work."}
            </span>
            <span className="flex gap-4">
              <button type="button" onClick={() => setPicking(true)} className="rounded-sm text-body-sm font-medium text-primary-600 hover:underline focus-visible:focus-ring">
                {post.image ? "Change visual" : "Add a visual"}
              </button>
              {post.image && (
                <button
                  type="button"
                  onClick={() =>
                    confirm({
                      title: "Remove the visual?",
                      body: "The post goes out as text only, unless you add another.",
                      confirmLabel: "Remove",
                      action: () => act.setPostStatus(post.id, post.status, { image: undefined }),
                      success: "Visual removed.",
                    })
                  }
                  className="rounded-sm text-body-sm font-medium text-primary-600 hover:underline focus-visible:focus-ring"
                >
                  Remove
                </button>
              )}
            </span>
          </div>
        </div>
      )}
      <VisualPicker
        b={b}
        open={picking}
        onClose={() => setPicking(false)}
        onPick={async (src, alt) => {
          setPicking(false);
          await run("visual", () => act.setPostStatus(post.id, post.status, { image: { src, alt } }), "Visual attached.");
        }}
      />

      {(post.checks ?? []).length > 0 && (
        <ul className="flex flex-col gap-2">
          {post.checks!.map((k) => (
            <li
              key={k.id}
              className={`flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center ${k.state === "open" ? (k.kind === "off-limits" ? "border-danger bg-danger-bg" : "border-warning bg-warning-bg") : "border-border"}`}
            >
              <span className="flex flex-1 items-center gap-2 text-body-sm text-primary">
                {k.state === "open" ? <WarningCircle className="size-5 shrink-0 text-danger" aria-hidden /> : <CheckCircle className="size-5 shrink-0 text-success" aria-hidden />}
                <span>
                  <span className="font-medium">{checkKind[k.kind]}: </span>
                  {k.label}
                  {k.state === "dismissed" && <span className="text-secondary"> (dismissed)</span>}
                </span>
              </span>
              {k.state === "open" && (
                <span className="flex gap-2">
                  <Button variant="secondary" loading={pending(`fix-${k.id}`)} onClick={() => run(`fix-${k.id}`, () => act.setCheck(post.id, k.id, "fixed"), "Check cleared.")}>
                    Fixed
                  </Button>
                  {k.kind !== "off-limits" && (
                    <Button variant="ghost" onClick={() => setDismissing(k.id)}>
                      Dismiss
                    </Button>
                  )}
                </span>
              )}
            </li>
          ))}
          {open.some((k) => k.kind === "off-limits") && <li className="text-caption text-secondary">Off-limits flags cannot be dismissed. Change the draft, then mark it fixed.</li>}
        </ul>
      )}
      <Dialog open={!!dismissing} onClose={() => setDismissing(null)} title="Dismiss this check?">
        <p className="text-body-sm text-secondary">Say why it does not apply. The reason is kept with the post and the owner can see it.</p>
        <Textarea label="Reason" rows={2} value={dismissReason} onChange={(e) => setDismissReason(e.target.value)} />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setDismissing(null)}>
            Cancel
          </Button>
          <Button
            disabled={!dismissReason.trim()}
            loading={pending("dismiss")}
            onClick={async () => {
              if (dismissing && (await run("dismiss", () => act.setCheck(post.id, dismissing, "dismissed"), "Check dismissed, with your reason."))) {
                setDismissing(null);
                setDismissReason("");
              }
            }}
          >
            Dismiss
          </Button>
        </div>
      </Dialog>

      <Textarea label={`Why this post (${first} sees this)`} rows={2} value={why} onChange={(e) => setWhy(e.target.value)} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          disabled={blocked}
          onClick={() =>
            confirm({
              title: `Send to ${first}?`,
              body: `${first} is told and has 2 days to review. ${b.client?.review.ifNoReply === "wait" ? "If they do not reply, the post is held." : "If they do not reply within 24 hours, it is approved automatically."}`,
              confirmLabel: "Send",
              action: () => act.setPostStatus(post.id, "awaiting-client", { text, why, version, dueAt: new Date(Date.now() + 2 * 86_400_000).toISOString() }),
              success: `Sent to ${first}. Due in 2 days.`,
            })
          }
        >
          {blocked ? "Clear the checks to send" : `Send to ${first}`}
        </Button>
        <Button variant="secondary" disabled={!dirty} loading={pending("save")} onClick={() => run("save", () => act.setPostStatus(post.id, post.status, { text, why, version }), "Draft saved.")}>
          {pending("save") ? "Saving" : "Save draft"}
        </Button>
      </div>
    </div>
  );
}

/** M5 changes asked: the client's feedback becomes a short list to tick off, then send back. */
function ChangesEditor({ post, b }: { post: Post; b: ClientBundle }) {
  const { run, pending } = useTask();
  const latest = post.feedback?.[post.feedback.length - 1];
  const items = ["Soften the opening line", "Do not suggest dashboards are bad", "Keep the point about nurses' time"];
  const [done, setDone] = useState<string[]>([]);
  return (
    <div className="flex flex-col gap-4">
      {latest && (
        <blockquote className="rounded-md bg-warning-bg p-4 text-body-sm text-primary">
          <span className="font-medium">{b.user?.firstName}: </span>&ldquo;{latest.text}&rdquo; <span className="text-secondary">({ago(latest.at)})</span>
        </blockquote>
      )}
      <div className="flex flex-col gap-2">
        <span className="flex items-center gap-1 text-body-sm font-medium text-primary">
          <Sparkle className="size-4 text-primary-600" aria-hidden /> Changes to make
        </span>
        {items.map((i) => (
          <label key={i} className="flex cursor-pointer items-center gap-3 text-body-sm text-primary">
            <input type="checkbox" checked={done.includes(i)} onChange={() => setDone((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]))} className="size-4 accent-primary-600" />
            <span className={done.includes(i) ? "text-secondary line-through" : ""}>{i}</span>
          </label>
        ))}
      </div>
      <Textarea label="Draft" rows={4} defaultValue={post.text} />
      <Button
        className="self-start"
        disabled={done.length < items.length}
        loading={pending("send")}
        onClick={() => run("send", () => act.setPostStatus(post.id, "awaiting-client", { dueAt: new Date(Date.now() + 86_400_000).toISOString() }), `New version sent to ${b.user?.firstName}.`)}
      >
        {done.length < items.length ? `${items.length - done.length} changes left` : pending("send") ? "Sending" : "Send back"}
      </Button>
    </div>
  );
}

/** Change a post's time: suggested time first, any time allowed. */
function TimeDialog({ open, onClose, initial, onSave, busy }: { open: boolean; onClose: () => void; initial: string; onSave: (iso: string) => void; busy: boolean }) {
  const local = (iso: string) => {
    const d = new Date(iso);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
  };
  const [value, setValue] = useState(local(initial));
  const [error, setError] = useState<string>();
  return (
    <Dialog open={open} onClose={onClose} title="Choose a time">
      <Input
        label="Day and time"
        type="datetime-local"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setError(undefined);
        }}
        error={error}
        help="In the client's time zone."
      />
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          loading={busy}
          onClick={() => {
            const iso = new Date(value).toISOString();
            if (new Date(iso).getTime() < Date.now()) return setError("Pick a time in the future.");
            onSave(iso);
          }}
        >
          Schedule
        </Button>
      </div>
    </Dialog>
  );
}

/** M5 approved: confirm or change the suggested time, with both time zones. */
function Scheduler({ post, b }: { post: Post; b: ClientBundle }) {
  const { run, pending } = useTask();
  const [choosing, setChoosing] = useState(false);
  const [suggested] = useState(() => nextWeekday9(2));
  const schedule = async (iso: string) => {
    if (await run("schedule", () => act.setPostStatus(post.id, "scheduled", { scheduledFor: iso }), `Scheduled for ${dayTimeIn(iso)}.`)) setChoosing(false);
  };
  return (
    <div className="flex flex-col gap-3 rounded-md bg-neutral-25 p-4">
      <span className="flex items-center gap-2 text-body-sm font-medium text-primary">
        <Clock className="size-5 text-primary-600" aria-hidden /> Suggested: {dayTime(suggested)}
      </span>
      <span className="text-caption text-secondary">
        {time(suggested)} for {b.user?.firstName} ({b.user?.timeZone.replace("_", " ")}), {time(suggested)} for you. Weekday mornings do best for this audience.
      </span>
      <div className="flex gap-2">
        <Button loading={pending("schedule") && !choosing} onClick={() => schedule(suggested)}>
          Schedule
        </Button>
        <Button variant="ghost" onClick={() => setChoosing(true)}>
          Change time
        </Button>
      </div>
      {choosing && <TimeDialog open onClose={() => setChoosing(false)} initial={suggested} busy={pending("schedule")} onSave={schedule} />}
    </div>
  );
}

/** M5 scheduled: move the time, or take it off the schedule. */
function ScheduledActions({ post, b }: { post: Post; b: ClientBundle }) {
  const confirm = useConfirm();
  const { run, pending } = useTask();
  const [choosing, setChoosing] = useState(false);
  const [editing, setEditing] = useState(false);
  const first = b.user?.firstName;
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" onClick={() => setEditing(true)}>
        Edit
      </Button>
      <Button variant="ghost" onClick={() => setChoosing(true)}>
        Change time
      </Button>
      {editing && (
        <EditTextDialog
          open
          onClose={() => setEditing(false)}
          title="Edit a scheduled post"
          intro={`${first} approved the earlier wording, so a change goes back to them for approval and comes off the schedule until they answer.`}
          smallFixOption={`Small fix only (spelling or punctuation): keep the time and tell ${first}.`}
          initial={post.text}
          busy={pending("edit")}
          onSave={async (text, smallFix) => {
            if (
              await run(
                "edit",
                () => act.editScheduledPost(post.id, text, smallFix),
                smallFix ? `Saved. It still goes out ${dayTimeIn(post.scheduledFor!)}. ${first} is told.` : `Sent back to ${first} for approval.`,
              )
            )
              setEditing(false);
          }}
        />
      )}
      <Button
        variant="ghost"
        onClick={() =>
          confirm({
            title: "Take this post off the schedule?",
            body: "It goes back to To schedule. It will not go out until you schedule it again.",
            confirmLabel: "Unschedule",
            action: () => act.setPostStatus(post.id, "approved", { scheduledFor: undefined }),
            success: "Post taken off the schedule.",
          })
        }
      >
        Unschedule
      </Button>
      {choosing && (
        <TimeDialog
          open
          onClose={() => setChoosing(false)}
          initial={post.scheduledFor ?? nextWeekday9(1)}
          busy={pending("move")}
          onSave={async (iso) => {
            if (await run("move", () => act.setPostStatus(post.id, "scheduled", { scheduledFor: iso }), `Moved to ${dayTimeIn(iso)}.`)) setChoosing(false);
          }}
        />
      )}
    </div>
  );
}

/** Edit a post's text: a live post in place on LinkedIn, or a scheduled post before it goes out. */
function EditTextDialog({
  open,
  onClose,
  title,
  intro,
  initial,
  busy,
  smallFixOption,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  intro: string;
  initial: string;
  busy: boolean;
  smallFixOption?: string;
  onSave: (text: string, smallFix: boolean) => void;
}) {
  const [text, setText] = useState(initial);
  const [smallFix, setSmallFix] = useState(false);
  const [error, setError] = useState<string>();
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <p className="text-body-sm text-secondary">{intro}</p>
      <Textarea
        label="Post text"
        rows={8}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setError(undefined);
        }}
        error={error}
      />
      {smallFixOption && (
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" checked={smallFix} onChange={(e) => setSmallFix(e.target.checked)} className="mt-1 size-4 accent-primary-600" />
          <span className="text-body-sm text-primary">{smallFixOption}</span>
        </label>
      )}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          loading={busy}
          onClick={() => {
            if (!text.trim()) return setError("The post needs some text.");
            if (text.trim() === initial.trim()) return setError("Nothing has changed yet.");
            onSave(text.trim(), smallFix);
          }}
        >
          Save
        </Button>
      </div>
    </Dialog>
  );
}

const repostLabel = { reshare: "share it again with a new comment", new: "post it again as a new post" };

/** M7 Live: edit the text in place, post again, replace, or take down. Answers the client's requests. */
function LiveActions({ post, b, onDraft }: { post: Post; b: ClientBundle; onDraft: () => void }) {
  const confirm = useConfirm();
  const { run, pending } = useTask();
  const [editing, setEditing] = useState(false);
  const [again, setAgain] = useState(false);
  const [closing, setClosing] = useState(false);
  const [closeNote, setCloseNote] = useState("");
  const first = b.user?.firstName;
  const req = post.request;

  if (post.status === "failed")
    return (
      <Banner
        tone="danger"
        title="Did not post"
        action={
          <Button
            variant="secondary"
            loading={pending("retry")}
            onClick={() =>
              run(
                "retry",
                () => act.setPostStatus(post.id, "scheduled", { failedReason: undefined, scheduledFor: new Date(Date.now() + 3_600_000).toISOString() }),
                "Fixed and scheduled for an hour from now.",
              )
            }
          >
            Fix and retry
          </Button>
        }
      >
        {post.failedReason}
      </Banner>
    );

  const replace = () =>
    confirm({
      title: "Take it down and replace it?",
      body: `Use this when more than the text must change, such as the image. The post comes off LinkedIn now and an editable copy goes to Drafts. ${first} reviews the new version before it goes out.`,
      warning: "The reactions and comments on the live post are lost. This cannot be undone.",
      confirmLabel: "Take down and replace",
      tone: "danger",
      action: async () => {
        await act.replacePost(post.id);
      },
      success: { text: `Taken down. The copy is in Drafts. ${first} is told.`, action: { label: "Open drafts", onClick: onDraft } },
    });

  const takeDown = () =>
    confirm({
      title: "Take this post down?",
      body: `It comes off LinkedIn now. ${first} is told by email.`,
      warning: "The post and its reactions and comments cannot be brought back. You can post it again later as a new post.",
      confirmLabel: "Take it down",
      cancelLabel: "Keep it",
      tone: "danger",
      action: () => act.takeDown(post.id, "team"),
      success: `Taken down. ${first} is told.`,
    });

  const dialogs = (
    <>
      {editing && (
        <EditTextDialog
          open
          onClose={() => setEditing(false)}
          title="Edit the live post"
          intro="The change goes live on LinkedIn at once. Reactions and comments stay, and LinkedIn marks the post as edited. Only the text can change: to change an image, replace the post."
          initial={post.text}
          busy={pending("edit")}
          onSave={async (text) => {
            if (await run("edit", () => act.editLivePost(post.id, text), req?.kind === "fix" ? `Fixed on LinkedIn. ${first} is told.` : `Updated on LinkedIn. ${first} is told.`)) setEditing(false);
          }}
        />
      )}
      {again && (
        <PostAgainDialog
          open
          onClose={() => setAgain(false)}
          title="Post it again"
          intro={`A draft is made for you to finish. It goes to ${first} for review like any other post.`}
          initial={req?.repostAs ?? "reshare"}
          onlyNew={post.status === "taken-down"}
          noteLabel={(c) => (c === "reshare" ? "New comment above the original" : "Anything to change in the words? (optional)")}
          notePlaceholder={req?.kind === "repost" ? `${first} asked: ${req.text}` : undefined}
          noteRequired={(c) => c === "reshare"}
          busy={pending("again")}
          submitLabel="Make the draft"
          onSubmit={async (choice, note) => {
            const text = choice === "reshare" ? note : note || post.text;
            if (await run("again", () => act.preparePostAgain(post.id, choice, text), { text: "Draft ready in Drafts.", action: { label: "Open drafts", onClick: onDraft } })) setAgain(false);
          }}
        />
      )}
      <Dialog open={closing} onClose={() => setClosing(false)} title="Close the request without changes?">
        <p className="text-body-sm text-secondary">For when you have agreed something else with {first}, for example in Messages. They see your note.</p>
        <Textarea label={`Note to ${first}`} rows={2} value={closeNote} onChange={(e) => setCloseNote(e.target.value)} placeholder="As agreed on our call, we will leave the post as it is." />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setClosing(false)}>
            Cancel
          </Button>
          <Button
            disabled={!closeNote.trim()}
            loading={pending("close")}
            onClick={async () => {
              if (await run("close", () => act.closePostRequest(post.id, closeNote.trim()), `Request closed. ${first} has your note.`)) setClosing(false);
            }}
          >
            Close request
          </Button>
        </div>
      </Dialog>
    </>
  );

  if (post.status === "taken-down")
    return (
      <div className="flex flex-col gap-3">
        <p className="text-body-sm text-secondary">{post.takenDownBy === "team" ? "You took this post down." : `${first} took this post down.`} It is no longer on LinkedIn.</p>
        {req?.kind === "repost" && (
          <Banner tone="info" title={`${first} asked to post it again`}>
            {req.text}
          </Banner>
        )}
        <Button variant="secondary" className="self-start" onClick={() => setAgain(true)}>
          Post it again
        </Button>
        {dialogs}
      </div>
    );

  return (
    <div className="flex flex-col gap-3">
      {req && (
        <Banner tone={req.kind === "fix" ? "danger" : "info"} title={req.kind === "fix" ? `Fix asked for ${agoIn(req.at)}` : `${first} asked you to ${repostLabel[req.repostAs ?? "reshare"]}`}>
          {req.text}
        </Banner>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {req?.kind === "repost" ? (
          <Button variant="secondary" onClick={() => setAgain(true)}>
            Prepare the repost
          </Button>
        ) : (
          <Button variant="secondary" onClick={() => setEditing(true)}>
            Edit text
          </Button>
        )}
        {req?.kind === "repost" ? (
          <Button variant="ghost" onClick={() => setEditing(true)}>
            Edit text
          </Button>
        ) : (
          <Button variant="ghost" onClick={() => setAgain(true)}>
            Post again
          </Button>
        )}
        <Menu
          label="More actions"
          align="start"
          trigger={<span className="px-4 text-body-sm font-medium text-primary-700">More</span>}
          triggerClassName="flex min-h-11 items-center rounded-md hover:bg-primary-50 focus-visible:focus-ring"
          items={[
            { label: "Replace the post (to change an image)", onSelect: replace },
            { label: "Take it down", onSelect: takeDown },
            ...(req ? [{ label: "Close the request without changes", onSelect: () => setClosing(true) }] : []),
          ]}
        />
      </div>
      {dialogs}
    </div>
  );
}

function ContentWorkspace({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const { run, pending } = useTask();
  const tab = (useSearchParams().get("tab") as Tab) || "drafts";
  const { db } = useMyManager();
  const b = clientBundle(db, id);
  const [ideas, setIdeas] = useState(firstIdeas);
  if (!b.client || !b.user) return <EmptyState title="Client not found">Go back to Clients.</EmptyState>;
  const author = { name: fullName(b.user), title: b.user.title };
  const goTo = (t: Tab) => router.replace(`/manager/clients/${id}/content?tab=${t}`, { scroll: false });

  const groups: Record<Exclude<Tab, "ideas">, Post[]> = {
    drafts: b.posts.filter((p) => p.status === "draft" || p.status === "manager-review"),
    changes: b.posts.filter((p) => p.status === "changes-requested"),
    client: b.posts.filter((p) => p.status === "awaiting-client" || p.status === "on-hold"),
    schedule: b.posts.filter((p) => p.status === "approved"),
    scheduled: b.posts.filter((p) => p.status === "scheduled"),
    live: b.posts.filter((p) => ["published", "failed", "taken-down"].includes(p.status)),
  };

  return (
    <Columns {...rails.managerMain}>
      <Card
        title="Content"
        eyebrow={<Breadcrumbs items={[{ label: "Clients", href: "/manager/clients" }, { label: fullName(b.user), href: `/manager/clients/${id}` }, { label: "Content" }]} />}
        action={<span className="text-caption text-secondary">Reviews {b.client.review.frequency.replace("-", " ")}</span>}
        padding="none"
      >
        <div className="flex flex-col gap-4 px-6 pt-4">
          <OffLimitsBox b={b} />
          <Tabs
            label="Content stages"
            value={tab}
            onChange={goTo}
            tabs={[
              { value: "ideas", label: "Ideas", count: ideas.length },
              { value: "drafts", label: "Drafts", count: groups.drafts.length },
              { value: "changes", label: "Changes asked", count: groups.changes.length },
              { value: "client", label: "With client", count: groups.client.length },
              { value: "schedule", label: "To schedule", count: groups.schedule.length },
              { value: "scheduled", label: "Scheduled" },
              { value: "live", label: "Live", count: groups.live.filter((p) => p.status === "failed" || p.request).length },
            ]}
          />
        </div>

        {tab === "ideas" ? (
          <div className="flex flex-col gap-4 p-6">
            <p className="flex items-center gap-1 text-body-sm text-secondary">
              <Sparkle className="size-4 text-primary-600" aria-hidden /> Proposed for next week. Nothing here touches the off-limits list. Pick, skip or ask for more.
            </p>
            <ul className="flex flex-col gap-3">
              {ideas.map((i) => (
                <li key={i.title} className="flex flex-col gap-2 rounded-md border border-border p-4">
                  <span className="flex items-start justify-between gap-3">
                    <span className="text-body font-medium text-primary">{i.title}</span>
                    <span className="shrink-0 text-caption capitalize text-secondary">{i.format}</span>
                  </span>
                  <span className="text-body-sm text-secondary">{i.reason}</span>
                  <span className="flex gap-2">
                    <Button
                      variant="secondary"
                      loading={pending(i.title)}
                      onClick={async () => {
                        const ok = await run(i.title, () => act.pickIdea(id, i.title, i.format, i.reason), {
                          text: "A first draft is ready in the client's voice.",
                          action: { label: "Open drafts", onClick: () => goTo("drafts") },
                        });
                        if (ok) setIdeas((list) => list.filter((x) => x.title !== i.title));
                      }}
                    >
                      {pending(i.title) ? "Drafting" : "Pick"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIdeas((list) => list.filter((x) => x.title !== i.title));
                        toast("Skipped. The next ideas will avoid this.", "success", { action: { label: "Undo", onClick: () => setIdeas((list) => [...list, i]) } });
                      }}
                    >
                      Skip
                    </Button>
                  </span>
                </li>
              ))}
              {!ideas.length && <li className="text-body-sm text-secondary">No ideas left. Ask for more.</li>}
            </ul>
            <Button
              variant="secondary"
              className="self-start"
              loading={pending("more")}
              onClick={async () => {
                if (await run("more", () => act.save(), "2 more ideas added.")) setIdeas((list) => [...list, ...moreIdeas.filter((m) => !list.some((x) => x.title === m.title))]);
              }}
            >
              {pending("more") ? "Finding ideas" : "More ideas"}
            </Button>
          </div>
        ) : (
          <ul className="flex flex-col">
            {groups[tab].length === 0 && (
              <li className="p-6">
                <EmptyState title="Nothing here">Posts move here as they reach this stage.</EmptyState>
              </li>
            )}
            {groups[tab].map((p) => (
              <li key={p.id} className="flex flex-col gap-4 border-t border-border p-6">
                {tab === "drafts" && <DraftEditor post={p} b={b} />}
                {tab === "changes" && <ChangesEditor post={p} b={b} />}
                {tab !== "drafts" && tab !== "changes" && (
                  <PostPreview post={p} author={author} meta={p.publishedAt ? ago(p.publishedAt) : p.scheduledFor ? dayTime(p.scheduledFor) : p.dueAt ? `Due ${dayTimeIn(p.dueAt)}` : "Approved"}>
                    {tab === "client" && (
                      <p className="text-body-sm text-secondary">
                        {p.status === "on-hold"
                          ? `Held: ${p.heldReason} It shows in the weekly update as waiting on the client.`
                          : b.client!.review.ifNoReply === "wait"
                            ? "If there is no reply by the due time, it is held."
                            : "If there is no reply in 24 hours, it is approved and scheduled automatically."}
                      </p>
                    )}
                    {tab === "schedule" && <Scheduler post={p} b={b} />}
                    {tab === "scheduled" && <ScheduledActions post={p} b={b} />}
                    {tab === "live" && <LiveActions post={p} b={b} onDraft={() => goTo("drafts")} />}
                  </PostPreview>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Columns>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense>
      <ContentWorkspace id={id} />
    </Suspense>
  );
}

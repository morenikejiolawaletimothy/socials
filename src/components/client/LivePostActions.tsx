"use client";

import { useState } from "react";
import { VoiceRecorder } from "@/components/content/VoiceRecorder";
import { Banner, Button, Dialog, Textarea, useConfirm, useTask } from "@/components/ui";
import { act, type Post } from "@/lib/mock";

/** C8: on any live post, take it down now or ask for a fix. */
export function LivePostActions({ post }: { post: Post }) {
  const confirm = useConfirm();
  const { run, pending } = useTask();
  const [fixing, setFixing] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string>();

  if (post.status === "taken-down") return <p className="text-body-sm text-secondary">You took this post down. It is no longer on LinkedIn.</p>;

  return (
    <>
      {post.fixRequested ? (
        <Banner
          tone="info"
          title="Fix asked for"
          action={
            <Button variant="ghost" loading={pending("cancel")} onClick={() => run("cancel", () => act.cancelFix(post.id), "Fix request withdrawn.")}>
              Withdraw
            </Button>
          }
        >
          {post.fixRequested} Your manager will fix it today and tell you when it is done.
        </Banner>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setFixing(true)}>
            Ask for a fix
          </Button>
          <Button
            variant="ghost"
            onClick={() =>
              confirm({
                title: "Take this post down?",
                body: "It comes off LinkedIn straight away, with its reactions and comments. Your manager is told.",
                warning: "You cannot undo this. The post cannot be put back with its reactions.",
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

      <Dialog open={fixing} onClose={() => setFixing(false)} title="What needs fixing?">
        <p className="text-body-sm text-secondary">Your manager is told at once and fixes it today. The post stays up until then.</p>
        <Textarea
          label="Tell us what to fix"
          placeholder="For example: the clinic name in paragraph 2 is wrong."
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            setError(undefined);
          }}
          error={error}
        />
        <VoiceRecorder sample="Please change the number in the second line. It should be 4 hours, not 4 days." onChange={setNote} />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setFixing(false)}>
            Cancel
          </Button>
          <Button
            loading={pending("fix")}
            onClick={async () => {
              if (!note.trim()) return setError("Write what needs fixing, or record a voice note.");
              if (await run("fix", () => act.askForFix(post.id, note.trim()), "Sent. Your manager will fix it today.")) {
                setFixing(false);
                setNote("");
              }
            }}
          >
            {pending("fix") ? "Sending" : "Send"}
          </Button>
        </div>
      </Dialog>
    </>
  );
}

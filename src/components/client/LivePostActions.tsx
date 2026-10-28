"use client";

import { useState } from "react";
import { VoiceRecorder } from "@/components/content/VoiceRecorder";
import { Banner, Button, Dialog, Textarea, useToast } from "@/components/ui";
import { act, type Post } from "@/lib/mock";

/** C8: on any live post, take it down now or ask for a fix. */
export function LivePostActions({ post }: { post: Post }) {
  const toast = useToast();
  const [dialog, setDialog] = useState<"down" | "fix" | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  if (post.status === "taken-down") return <p className="text-body-sm text-secondary">You took this post down. It is no longer on LinkedIn.</p>;

  return (
    <>
      {post.fixRequested ? (
        <Banner tone="info" title="Fix asked for">
          {post.fixRequested} Your manager will fix it today and tell you when it is done.
        </Banner>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setDialog("fix")}>
            Ask for a fix
          </Button>
          <Button variant="ghost" onClick={() => setDialog("down")}>
            Take it down
          </Button>
        </div>
      )}

      <Dialog open={dialog === "down"} onClose={() => setDialog(null)} title="Take this post down?">
        <p className="text-body text-secondary">It comes off LinkedIn straight away, with its reactions and comments. You cannot undo this.</p>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setDialog(null)}>
            Keep it
          </Button>
          <Button
            variant="danger"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await act.takeDown(post.id);
              setBusy(false);
              setDialog(null);
              toast("Post taken down. It is no longer on LinkedIn.");
            }}
          >
            {busy ? "Taking it down" : "Take it down"}
          </Button>
        </div>
      </Dialog>

      <Dialog open={dialog === "fix"} onClose={() => setDialog(null)} title="What needs fixing?">
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
          <Button variant="ghost" onClick={() => setDialog(null)}>
            Cancel
          </Button>
          <Button
            disabled={busy}
            onClick={async () => {
              if (!note.trim()) return setError("Write what needs fixing, or record a voice note.");
              setBusy(true);
              await act.askForFix(post.id, note.trim());
              setBusy(false);
              setDialog(null);
              toast("Sent. Your manager will fix it today.");
            }}
          >
            {busy ? "Sending" : "Send"}
          </Button>
        </div>
      </Dialog>
    </>
  );
}

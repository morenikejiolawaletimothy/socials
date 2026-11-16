"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Breadcrumbs, Button, Card, EmptyState, Textarea, useTask } from "@/components/ui";
import { act, useMyClient } from "@/lib/mock";

/** Figma "Feed / Request change": say what to change on a post. Back · Send. */
function RequestChange() {
  const router = useRouter();
  const id = useSearchParams().get("post");
  const { posts, managerUser } = useMyClient();
  const post = posts.find((p) => p.id === id);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string>();
  const { run, pending } = useTask();
  const first = managerUser?.firstName ?? "your account manager";

  if (!post) return <EmptyState title="We could not find that post">It may have been approved or removed already. Go back to your feed.</EmptyState>;

  return (
    <Card
      title="Request change"
      info={`Tell ${first} what to change. They update the post and send it back for you to approve.`}
      eyebrow={<Breadcrumbs items={[{ label: "Feed", href: "/home" }, { label: "Request change" }]} />}
      padding="none"
    >
      <form
        noValidate
        onSubmit={async (e) => {
          e.preventDefault();
          if (!note.trim()) return setError("Say what to change, for example a fact to fix or a tone to soften.");
          if (await run("send", () => act.askForChanges(post.id, note.trim()), `Sent. ${first} will update “${post.topic}”.`)) router.push("/home");
        }}
      >
        <div className="flex flex-col gap-4 px-6 py-4">
          <p className="text-body-sm text-secondary">
            Post: <span className="font-medium text-primary">{post.topic}</span>
          </p>
          <Textarea label="Note" rows={5} value={note} onChange={(e) => { setNote(e.target.value); setError(undefined); }} error={error} placeholder="What should change?" />
        </div>
        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <Button variant="ghost" onClick={() => router.back()}>
            Back
          </Button>
          <Button type="submit" loading={pending("send")}>
            {pending("send") ? "Sending" : "Send"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default function RequestChangePage() {
  return (
    <Columns {...rails.clientMain}>
      <Suspense>
        <RequestChange />
      </Suspense>
    </Columns>
  );
}

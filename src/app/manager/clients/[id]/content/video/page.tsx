"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, use } from "react";
import { Columns } from "@/components/layout/Columns";
import { suggestBrief, VideoRequestForm } from "@/components/manager/PostMediaEditor";
import { rails } from "@/components/rails";
import { Breadcrumbs, EmptyState } from "@/components/ui";
import { fullName } from "@/lib/format";
import { clientBundle, useMyManager } from "@/lib/mock";

function VideoRequest({ id }: { id: string }) {
  const router = useRouter();
  const postId = useSearchParams().get("post");
  const { db } = useMyManager();
  const b = clientBundle(db, id);
  const post = b.posts.find((p) => p.id === postId);
  const request = post?.waitingForVideo ? b.tasks.find((t) => t.id === post.waitingForVideo) : undefined;
  const back = () => router.push(`/manager/clients/${id}/content?tab=drafts`);
  return (
    <Columns {...rails.managerMain}>
      <Breadcrumbs items={[{ label: "Clients", href: "/manager/clients" }, { label: fullName(b.user), href: `/manager/clients/${id}` }, { label: "Content", href: `/manager/clients/${id}/content?tab=drafts` }, { label: "Video request" }]} />
      {post ? (
        <VideoRequestForm b={b} brief={request?.video ?? suggestBrief(post, b)} taskId={request?.id} onClose={back} />
      ) : (
        <EmptyState title="This draft is no longer here">It may have been posted or removed. Go back to the content to pick another.</EmptyState>
      )}
    </Columns>
  );
}

/** M4: ask the client for a video for a draft, or edit the request already sent. */
export default function VideoRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense>
      <VideoRequest id={id} />
    </Suspense>
  );
}

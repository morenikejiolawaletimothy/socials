"use client";

import { ChatCircle, GlobeHemisphereWest, Repeat, ThumbsUp } from "@phosphor-icons/react";
import Image from "next/image";
import { useState } from "react";
import { Avatar } from "@/components/ui";
import { date, dayIn, num } from "@/lib/format";
import type { Post } from "@/lib/mock";

/** On a repost: the original under a reshare's new comment, or a note that the words were posted before. */
export function RepostNote({ post }: { post: Post }) {
  const r = post.repostOf;
  if (!r) return null;
  if (!r.reshare) return <p className="text-caption text-secondary">Posting again{r.publishedAt ? `: first posted ${dayIn(r.publishedAt)}` : ""}.</p>;
  return (
    <div className="flex flex-col gap-1 rounded-md border border-border p-3">
      <span className="text-caption text-secondary">{r.publishedAt ? `Original post, ${date(r.publishedAt)}` : "Original post"}</span>
      <p className="line-clamp-3 whitespace-pre-line text-body-sm text-primary">{r.text}</p>
    </div>
  );
}

/** A post shown the way it will look on LinkedIn: author, text with "more", image, and numbers once live. */
export function PostPreview({
  post,
  author,
  meta,
  clamp = true,
  children,
}: {
  post: Post;
  author: { name: string; title?: string };
  /** Small line beside the author, such as "Tue at 9am" or "20 hours ago". */
  meta: string;
  clamp?: boolean;
  /** Actions or notes under the post. */
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(!clamp);
  const long = post.text.length > 220 || post.text.split("\n").length > 4;

  return (
    <article className="flex flex-col gap-3">
      <header className="flex items-start gap-3">
        <Avatar name={author.name} size="lg" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-body-sm font-semibold text-primary">{author.name}</span>
          <span className="truncate text-caption text-secondary">{author.title}</span>
          <span className="flex items-center gap-1 text-caption text-secondary">
            {post.editedAt ? `${meta}, edited` : meta}
            <GlobeHemisphereWest className="size-3" aria-label="Public" />
          </span>
        </div>
      </header>

      <div>
        <p className={`whitespace-pre-line text-body-sm text-primary ${!open && long ? "line-clamp-4" : ""}`}>{post.text}</p>
        {long && !open && (
          <button type="button" onClick={() => setOpen(true)} className="rounded-sm text-body-sm font-medium text-secondary hover:text-primary-700 focus-visible:focus-ring">
            See more
          </button>
        )}
      </div>

      <RepostNote post={post} />

      {post.image && (
        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-neutral-100">
          <Image src={post.image.src} alt={post.image.alt} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
        </div>
      )}

      {post.stats && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-caption text-secondary">
          <span className="flex items-center gap-1">
            <ThumbsUp className="size-4" aria-hidden /> {num(post.stats.reactions)} reactions
          </span>
          <span className="flex items-center gap-1">
            <ChatCircle className="size-4" aria-hidden /> {num(post.stats.comments)} comments
          </span>
          <span className="flex items-center gap-1">
            <Repeat className="size-4" aria-hidden /> {num(post.stats.reposts)} reposts
          </span>
          <span className="ml-auto">{num(post.stats.impressions)} impressions</span>
        </div>
      )}

      {children}
    </article>
  );
}

"use client";

import { ChatCircle, Clock, Repeat, ThumbsUp } from "@phosphor-icons/react";
import { Avatar, Tooltip } from "@/components/ui";
import { date, dayIn, num } from "@/lib/format";
import type { Post } from "@/lib/mock";
import { PostMedia } from "./PostMedia";
import { PostText, plainText } from "./PostText";

/** On a repost: the original under a reshare's new comment, or a note that the words were posted before. */
export function RepostNote({ post }: { post: Post }) {
  const r = post.repostOf;
  if (!r) return null;
  if (!r.reshare) return <p className="text-caption text-secondary">Posting again{r.publishedAt ? `: first posted ${dayIn(r.publishedAt)}` : ""}.</p>;
  return (
    <div className="flex flex-col gap-1 rounded-md border border-border p-3">
      <span className="text-caption text-secondary">{r.publishedAt ? `Original post, ${date(r.publishedAt)}` : "Original post"}</span>
      <p className="line-clamp-3 whitespace-pre-line text-body-sm text-primary">{plainText(r.text)}</p>
    </div>
  );
}

/** A post shown the way it will look on LinkedIn: author, text with "more", its image, video or carousel, and numbers once live. */
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
  return (
    <article className="flex flex-col gap-3">
      <header className="flex items-start gap-3">
        <Avatar name={author.name} size="lg" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-body-sm font-semibold text-primary">{author.name}</span>
          <span className="truncate text-caption text-secondary">{author.title}</span>
          <span className="flex items-center gap-1 text-caption text-secondary">
            <Clock className="size-3" aria-hidden />
            {post.editedAt ? `${meta}, edited` : meta}
          </span>
        </div>
      </header>

      <PostText key={post.id} text={post.text} clamp={clamp} />

      <RepostNote post={post} />

      <PostMedia post={post} />

      {post.stats && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-3 text-body-sm text-secondary">
          {[
            { icon: ThumbsUp, value: post.stats.reactions, label: "reactions" },
            { icon: ChatCircle, value: post.stats.comments, label: "comments" },
            { icon: Repeat, value: post.stats.reposts, label: "reposts" },
          ].map((s) => (
            <Tooltip key={s.label} label={`${num(s.value)} ${s.label}`}>
              <span className="flex items-center gap-1">
                <s.icon className="size-5" aria-hidden />
                <span className="font-medium text-primary">{num(s.value)}</span>
                <span className="sr-only">{s.label}</span>
              </span>
            </Tooltip>
          ))}
          <span className="ml-auto">
            <span className="font-medium text-primary">{num(post.stats.impressions)}</span> impressions
          </span>
        </div>
      )}

      {children}
    </article>
  );
}

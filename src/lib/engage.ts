// Engagement quick tasks (C17, M6): what each kind asks the client to do, in their words, and how far along a task is.
// LinkedIn's API lets us post for the client and nothing else, so every reaction, comment, reshare, save, follow,
// message and connection request is a quick task the client (or their assistant) does in a few seconds.

import type { EngageAction, EngageItem, LinkedInReaction, QuickTask } from "@/lib/mock/types";

export type EngageKind = {
  /** Plural noun for lists ("Comments"). */
  label: string;
  /** Task title, with the count ("Comment on 3 posts"). */
  title: (n: number) => string;
  /** Button that marks one done. */
  mark: string;
  /** Badge once done. */
  doneLabel: string;
  /** "post" items open a post; "person" items open a profile. */
  target: "post" | "person";
  /** The ready text, if this kind has one. */
  text?: { label: string; copy: string; copied: string; max: number };
  /** The steps, in one line. */
  steps: string;
  /** Activity log line, recorded in the weekly report. */
  log: (name: string) => string;
};

export const engageKinds: Record<EngageAction, EngageKind> = {
  comment: {
    label: "Comments",
    title: (n) => `Comment on ${n === 1 ? "1 post" : `${n} posts`}`,
    mark: "Mark as commented",
    doneLabel: "Commented",
    target: "post",
    text: { label: "Your comment", copy: "Copy comment", copied: "Comment copied. Paste it under the post.", max: 1250 },
    steps: "Open the post, paste the comment and post it, then mark it here. About 30 seconds each.",
    log: (name) => `Commented on ${name}'s post`,
  },
  react: {
    label: "Reactions",
    title: (n) => `React to ${n === 1 ? "1 post" : `${n} posts`}`,
    mark: "Mark as reacted",
    doneLabel: "Reacted",
    target: "post",
    steps: "Open the post, hold or hover on Like and pick the reaction shown, then mark it here. About 10 seconds each.",
    log: (name) => `Reacted to ${name}'s post`,
  },
  reshare: {
    label: "Reposts",
    title: (n) => `Repost ${n === 1 ? "1 post" : `${n} posts`} with your thoughts`,
    mark: "Mark as reposted",
    doneLabel: "Reposted",
    target: "post",
    text: { label: "Your thoughts", copy: "Copy thoughts", copied: 'Copied. Press Repost, then "Repost with your thoughts" and paste.', max: 3000 },
    steps: 'Open the post, press Repost, then "Repost with your thoughts", paste and post. Then mark it here. About a minute.',
    log: (name) => `Reposted ${name}'s post with your thoughts`,
  },
  save: {
    label: "Saved posts",
    title: (n) => `Save ${n === 1 ? "1 post" : `${n} posts`} for later`,
    mark: "Mark as saved",
    doneLabel: "Saved",
    target: "post",
    steps: "Open the post, press the three dots, then Save. Then mark it here. About 10 seconds each.",
    log: (name) => `Saved ${name}'s post`,
  },
  follow: {
    label: "Follows",
    title: (n) => `Follow ${n === 1 ? "1 person" : `${n} people and Pages`}`,
    mark: "Mark as followed",
    doneLabel: "Following",
    target: "person",
    steps: "Open the profile and press Follow (under More on some profiles), then mark it here. About 10 seconds each.",
    log: (name) => `Followed ${name}`,
  },
  message: {
    label: "Messages",
    title: (n) => `Message ${n === 1 ? "1 person" : `${n} people`}`,
    mark: "Mark as sent",
    doneLabel: "Sent",
    target: "person",
    text: { label: "Your message", copy: "Copy message", copied: "Message copied. Press Message on their profile and paste.", max: 8000 },
    steps: "Open the profile, press Message, paste and send, then mark it here. About 30 seconds each.",
    log: (name) => `Sent a message to ${name}`,
  },
};

export const isEngage = (kind: QuickTask["kind"]): kind is EngageAction => kind in engageKinds;

export const reactions: Record<LinkedInReaction, string> = {
  like: "Like",
  celebrate: "Celebrate",
  support: "Support",
  love: "Love",
  insightful: "Insightful",
  funny: "Funny",
};

/** How many of a task's items are done, for any kind of task. */
export function taskProgress(t: QuickTask) {
  if (t.items) return { done: t.items.filter((i) => i.done).length, total: t.items.length };
  if (t.people) return { done: t.people.filter((p) => p.done).length, total: t.people.length };
  return { done: t.done ? 1 : 0, total: 1 };
}

/** The verb for "3 of 6 …" under a task title. */
export function progressWord(t: QuickTask) {
  return isEngage(t.kind) ? engageKinds[t.kind].doneLabel.toLowerCase() : t.kind === "connect" ? "sent" : "done";
}

export type { EngageItem };

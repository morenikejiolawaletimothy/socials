"use client";

import { engageKinds, isEngage } from "../engage";
import { dayTimeIn, money, plural } from "../format";
import { extractLinkedIn } from "./auth";
import { delay, getDb, update } from "./store";
import type { Activity, AdminMember, AdminRole, Assistant, Channels, Client, Db, EngageAction, Handoff, Message, Permissions, PostStatus, Reaction, ReviewSettings, SetupStep, User } from "./types";

/*
 * Every change a screen can make. Phase 2 swaps each body for an API call; screens keep calling the same names.
 * Each action waits like a real request (so loading states show), can fail (demo bar "Simulate errors"),
 * and records who needs to know: in-app notifications, flagged for email where the real app will send one.
 */

const id = (p: string) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const nowIso = () => new Date().toISOString();
const OWNER = "u-fola";

function log(db: Db, clientId: string, who: Activity["who"], kind: Activity["kind"], text: string): Db {
  return { ...db, activity: [{ id: id("a"), clientId, who, kind, text, at: nowIso() }, ...db.activity] };
}

function patchClient(db: Db, clientId: string, fn: (c: Client) => Partial<Client>): Db {
  return { ...db, clients: db.clients.map((c) => (c.id === clientId ? { ...c, ...fn(c) } : c)) };
}

/** The client's brands list, with an empty Brand added if they do not have one yet (new clients). */
function withBrand(db: Db, clientId: string): Db["brands"] {
  if (db.brands.some((b) => b.clientId === clientId)) return db.brands;
  return [...db.brands, { clientId, colours: [], voice: "", wordsUse: [], wordsAvoid: [], examples: [], offLimits: [] }];
}

function setPost(db: Db, postId: string, patch: Partial<Db["posts"][number]>): Db {
  return { ...db, posts: db.posts.map((p) => (p.id === postId ? { ...p, ...patch } : p)) };
}

/** C18: how a person is told. Clients without a saved choice follow How you review; everyone else gets email. */
export function channelsOf(user: User | undefined, client?: Client): Channels {
  return user?.channels ?? { email: client?.review.channels.email ?? true, whatsapp: false, timing: "now", quietNights: true };
}

/** Who is doing the action right now: the signed-in person and their role, for the owner's message log. */
function actorOf(db: Db): string | undefined {
  const role = db.session?.role;
  const user = role ? db.users.find((u) => u.id === db.session.userIds[role]) : undefined;
  if (!user || !role) return undefined;
  return `${nameOf(user)} (${role})`;
}

/** Phase 1 only: records the email and WhatsApp messages the real app would send, for the demo bar and the owner's message log. */
function send(db: Db, to: string, address: string | undefined, channel: "email" | "whatsapp", text: string, href: string, userId?: string): Db {
  if (!address) return db;
  return { ...db, outbox: [{ id: id("o"), to, userId, address, channel, text, href, at: nowIso(), by: actorOf(db) }, ...(db.outbox ?? [])].slice(0, 40) };
}

/**
 * Adds a notification for one person, with the link to the exact page that needs them. `email` marks the ones
 * that also go out by email and WhatsApp (C18), following the person's channels; urgent ones always go.
 */
function notify(db: Db, userId: string | undefined, text: string, href: string, opts: { email?: boolean; urgent?: boolean } = {}): Db {
  if (!userId) return db;
  let next: Db = { ...db, notifications: [{ id: id("n"), userId, text, href, createdAt: nowIso(), read: false, email: opts.email ?? true, urgent: opts.urgent, by: actorOf(db) }, ...db.notifications] };
  if (opts.email === false && !opts.urgent) return next;
  const user = db.users.find((u) => u.id === userId);
  const ch = channelsOf(user, db.clients.find((c) => c.userId === userId));
  const name = nameOf(user);
  if (ch.email || opts.urgent) next = send(next, name, user?.email, "email", text, href, userId);
  if (ch.whatsapp && user?.whatsapp?.confirmed) next = send(next, name, user.whatsapp.number, "whatsapp", text, href, userId);
  return next;
}

function audit(db: Db, action: string, target: string, kind: Db["audit"][number]["kind"], who = "Fola Morenikeji"): Db {
  return { ...db, audit: [{ id: id("au"), who, action, target, at: nowIso(), kind }, ...db.audit] };
}

const clientOf = (db: Db, clientId: string) => db.clients.find((c) => c.id === clientId);
const clientUser = (db: Db, clientId: string) => db.users.find((u) => u.id === clientOf(db, clientId)?.userId);
const managerUserOf = (db: Db, clientId: string) => db.users.find((u) => u.id === db.managers.find((m) => m.id === clientOf(db, clientId)?.managerId)?.userId);
const nameOf = (u?: { firstName: string; lastName: string }) => (u ? `${u.firstName} ${u.lastName}` : "");
const short = (text: string) => `"${text.split("\n")[0].slice(0, 60)}${text.length > 60 ? "..." : ""}"`;

/* ---------- Notifications ---------- */

export async function markAllRead(userId: string) {
  await delay(200);
  update((db) => ({ ...db, notifications: db.notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n)) }));
}

export function markRead(notificationId: string) {
  update((db) => ({ ...db, notifications: db.notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n)) }));
}

export async function deleteNotification(notificationId: string) {
  await delay(200);
  update((db) => ({ ...db, notifications: db.notifications.filter((n) => n.id !== notificationId) }));
}

export function restoreNotification(n: Db["notifications"][number]) {
  update((db) => ({ ...db, notifications: [n, ...db.notifications] }));
}

export async function clearRead(userId: string) {
  await delay(300);
  update((db) => ({ ...db, notifications: db.notifications.filter((n) => n.userId !== userId || !n.read) }));
}

/* ---------- Client: content ---------- */

export async function approvePost(postId: string) {
  await delay();
  update((db) => {
    const p = db.posts.find((x) => x.id === postId);
    if (!p) return db;
    const next = log(setPost(db, postId, { status: "approved" }), p.clientId, "you", "post", `Approved ${short(p.text)}`);
    return notify(next, managerUserOf(db, p.clientId)?.id, `${clientUser(db, p.clientId)?.firstName} approved ${short(p.text)}. Set a time and send it back to publish.`, `/manager/clients/${p.clientId}/content?tab=schedule`, { email: false });
  });
}

export async function approveAll(postIds: string[]) {
  await delay(600);
  update((db) => {
    let next = db;
    for (const pid of postIds) {
      const p = next.posts.find((x) => x.id === pid);
      if (!p) continue;
      next = log(setPost(next, pid, { status: "approved" }), p.clientId, "you", "post", `Approved ${short(p.text)}`);
    }
    const first = db.posts.find((x) => x.id === postIds[0]);
    return first ? notify(next, managerUserOf(db, first.clientId)?.id, `${clientUser(db, first.clientId)?.firstName} approved ${postIds.length} posts. Set times and send them back to publish.`, `/manager/clients/${first.clientId}/content?tab=schedule`, { email: false }) : next;
  });
}

/**
 * A1: a person publishes an approved post to LinkedIn. No API: self-serve clients publish it themselves; on
 * full-service the account manager does it. `by` is the account manager's name when they publish for the client.
 */
export async function markPosted(postId: string, by?: string) {
  await delay(400);
  update((db) => {
    const p = db.posts.find((x) => x.id === postId);
    if (!p) return db;
    let next = setPost(db, postId, { status: "published", publishedAt: nowIso(), heldReason: undefined });
    next = log(next, p.clientId, by ? "team" : "you", "post", `Published ${short(p.text)}${by ? ` (by ${by})` : ""}`);
    next = { ...next, progress: next.progress.map((w) => (w.clientId === p.clientId ? { ...w, posts: { ...w.posts, done: w.posts.done + 1 } } : w)) };
    if (!by) next = notify(next, managerUserOf(db, p.clientId)?.id, `${clientUser(db, p.clientId)?.firstName} published ${short(p.text)}.`, `/manager/clients/${p.clientId}/content?tab=live`, { email: false });
    return next;
  });
}

export async function askForChanges(postId: string, text: string, voice = false) {
  await delay();
  update((db) => {
    const p = db.posts.find((x) => x.id === postId);
    if (!p) return db;
    let next = setPost(db, postId, { status: "changes-requested", scheduledFor: undefined, feedback: [...(p.feedback ?? []), { text, at: nowIso(), voice }] });
    next = log(next, p.clientId, "you", "post", `Asked for changes on ${short(p.text)}`);
    return notify(next, managerUserOf(db, p.clientId)?.id, `${clientUser(db, p.clientId)?.firstName} asked for changes on ${short(p.text)}.`, `/manager/clients/${p.clientId}/content?tab=changes`);
  });
}

/**
 * Takes a live post off LinkedIn (LinkedIn: delete the post). It cannot be put back with its reactions,
 * only posted again as a new post. The client can do this themselves; the team does it when asked.
 */
export async function takeDown(postId: string, by: "client" | "team" = "client") {
  await delay(700);
  update((db) => {
    const p = db.posts.find((x) => x.id === postId);
    if (!p) return db;
    let next = setPost(db, postId, { status: "taken-down", takenDownBy: by, request: undefined });
    if (by === "client") {
      next = log(next, p.clientId, "you", "post", `Took down ${short(p.text)}`);
      next = notify(next, managerUserOf(db, p.clientId)?.id, `${clientUser(db, p.clientId)?.firstName} took down ${short(p.text)}.`, `/manager/clients/${p.clientId}/content?tab=live`, { urgent: true });
      return audit(next, "Took down a live post", nameOf(clientUser(db, p.clientId)), "content", nameOf(clientUser(db, p.clientId)));
    }
    next = log(next, p.clientId, "team", "post", `Took down ${short(p.text)}`);
    next = notify(next, clientUser(db, p.clientId)?.id, `Your manager took down ${short(p.text)}. It is no longer on LinkedIn.`, "/content?tab=live", { email: true });
    return audit(next, "Took down a live post", nameOf(clientUser(db, p.clientId)), "content");
  });
}

export async function askForFix(postId: string, text: string) {
  await delay();
  update((db) => {
    const p = db.posts.find((x) => x.id === postId);
    if (!p) return db;
    const next = log(setPost(db, postId, { request: { kind: "fix", text, at: nowIso() } }), p.clientId, "you", "post", `Asked for a fix on ${short(p.text)}`);
    return notify(next, managerUserOf(db, p.clientId)?.id, `Urgent: ${clientUser(db, p.clientId)?.firstName} asked for a fix on a live post.`, `/manager/clients/${p.clientId}/content?tab=live`, { urgent: true, email: true });
  });
}

/** The client asks for a post to go out again: reshared with a new comment, or posted again as a new post. */
export async function askForRepost(postId: string, repostAs: "reshare" | "new", text: string) {
  await delay();
  update((db) => {
    const p = db.posts.find((x) => x.id === postId);
    if (!p) return db;
    const next = log(setPost(db, postId, { request: { kind: "repost", repostAs, text, at: nowIso() } }), p.clientId, "you", "post", `Asked to post ${short(p.text)} again`);
    return notify(next, managerUserOf(db, p.clientId)?.id, `${clientUser(db, p.clientId)?.firstName} asked to post ${short(p.text)} again.`, `/manager/clients/${p.clientId}/content?tab=live`, { email: true });
  });
}

/** The client withdraws their own request on a post. */
export async function cancelPostRequest(postId: string) {
  await delay();
  update((db) => {
    const p = db.posts.find((x) => x.id === postId);
    if (!p?.request) return db;
    const next = setPost(db, postId, { request: undefined });
    return notify(next, managerUserOf(db, p.clientId)?.id, `${clientUser(db, p.clientId)?.firstName} withdrew their request on ${short(p.text)}.`, `/manager/clients/${p.clientId}/content?tab=live`);
  });
}

/** The team closes a request without changing the post, for example after agreeing it in Messages. */
export async function closePostRequest(postId: string, note: string) {
  await delay();
  update((db) => {
    const p = db.posts.find((x) => x.id === postId);
    if (!p) return db;
    const next = log(setPost(db, postId, { request: undefined }), p.clientId, "team", "post", `Closed your request on ${short(p.text)}: ${note}`);
    return notify(next, clientUser(db, p.clientId)?.id, `Your manager closed your request: ${note}`, "/content?tab=live");
  });
}

/**
 * Edits the text of a live post in place (LinkedIn: partial update of the post's commentary).
 * Reactions and comments stay. LinkedIn shows the post as edited. Images and video cannot change once live.
 */
export async function editLivePost(postId: string, text: string) {
  await delay(800);
  update((db) => {
    const p = db.posts.find((x) => x.id === postId);
    if (!p) return db;
    const wasFix = p.request?.kind === "fix";
    let next = setPost(db, postId, { text, editedAt: nowIso(), request: wasFix ? undefined : p.request });
    next = log(next, p.clientId, "team", "post", `Edited the live post ${short(text)}`);
    return notify(next, clientUser(db, p.clientId)?.id, wasFix ? "Your post has been fixed. The change is live on LinkedIn." : `Your manager edited ${short(text)} on LinkedIn.`, "/content?tab=live", { email: wasFix });
  });
}

function copyOf(p: Db["posts"][number], reshare: boolean, text: string): Db["posts"][number] {
  return {
    id: id("p"),
    clientId: p.clientId,
    status: "draft",
    topic: p.topic,
    format: p.format,
    text,
    why: reshare ? "Sharing a post that did well again, with a new comment." : "Posting this again.",
    image: reshare ? undefined : p.image,
    video: reshare ? undefined : p.video,
    carousel: reshare ? undefined : p.carousel,
    repostOf: { id: p.id, text: p.text, publishedAt: p.publishedAt, reshare },
    version: 1,
    checks: [],
  };
}

/**
 * Prepares a post to go out again as a draft, so it follows the normal review: a reshare (LinkedIn: a new post
 * whose reshare parent is the original, which stays up) or a new post with the same words. Returns the draft's id.
 */
export async function preparePostAgain(postId: string, as: "reshare" | "new", text: string) {
  await delay(700);
  const newId = id("p");
  update((db) => {
    const p = db.posts.find((x) => x.id === postId);
    if (!p) return db;
    const draft = { ...copyOf(p, as === "reshare", text), id: newId };
    let next: Db = { ...db, posts: [draft, ...setPost(db, postId, { request: p.request?.kind === "repost" ? undefined : p.request }).posts] };
    if (p.request?.kind === "repost") next = notify(next, clientUser(db, p.clientId)?.id, "Your manager is preparing your repost. You will review it before it goes out.", "/content");
    return next;
  });
  return newId;
}

/**
 * Replaces a live post when more than the text must change (an image, a tag): takes the original down
 * and puts an editable copy in Drafts. Reactions and comments on the original are lost.
 */
export async function replacePost(postId: string) {
  await delay(900);
  const newId = id("p");
  update((db) => {
    const p = db.posts.find((x) => x.id === postId);
    if (!p) return db;
    const draft = { ...copyOf(p, false, p.text), id: newId, why: "Replaces a live post that needed more than a text fix." };
    let next: Db = { ...db, posts: [draft, ...setPost(db, postId, { status: "taken-down", takenDownBy: "team", request: undefined }).posts] };
    next = log(next, p.clientId, "team", "post", `Took down ${short(p.text)} to replace it`);
    next = notify(next, clientUser(db, p.clientId)?.id, "Your manager took the post down to fix it. You will review the new version before it goes out.", "/content?tab=live", { email: true });
    return audit(next, "Replaced a live post", nameOf(clientUser(db, p.clientId)), "content");
  });
  return newId;
}

/**
 * Edits a scheduled post. A small fix keeps the time and tells the client; anything else takes it off
 * the schedule and sends it back for the client's approval, since they approved the earlier wording.
 */
export async function editScheduledPost(postId: string, text: string, smallFix: boolean) {
  await delay(700);
  update((db) => {
    const p = db.posts.find((x) => x.id === postId);
    if (!p) return db;
    if (smallFix) {
      const next = log(setPost(db, postId, { text, noAsk: true }), p.clientId, "team", "post", `Made a small fix to ${short(text)}`);
      return notify(next, clientUser(db, p.clientId)?.id, `Your manager made a small fix to a scheduled post: ${short(text)}.`, "/content?tab=upcoming");
    }
    const next = setPost(db, postId, { text, status: "awaiting-client", scheduledFor: undefined, version: (p.version ?? 1) + 1, sentAt: new Date().toISOString(), dueAt: new Date(Date.now() + 2 * 86_400_000).toISOString() });
    return notify(next, clientUser(db, p.clientId)?.id, "A changed post is ready for your review.", "/content/review", { email: true });
  });
}

/** The client changes what they asked for, before the manager sends a new version. */
export async function editChangeRequest(postId: string, text: string) {
  await delay();
  update((db) => {
    const p = db.posts.find((x) => x.id === postId);
    if (!p?.feedback?.length) return db;
    const feedback = [...p.feedback.slice(0, -1), { ...p.feedback[p.feedback.length - 1], text, at: nowIso() }];
    const next = setPost(db, postId, { feedback });
    return notify(next, managerUserOf(db, p.clientId)?.id, `${clientUser(db, p.clientId)?.firstName} changed what they asked for on ${short(p.text)}.`, `/manager/clients/${p.clientId}/content?tab=changes`);
  });
}

/** The client takes back a change request. The post returns to them for review as it was. */
export async function withdrawChangeRequest(postId: string) {
  await delay();
  update((db) => {
    const p = db.posts.find((x) => x.id === postId);
    if (!p) return db;
    const next = setPost(db, postId, { status: "awaiting-client", feedback: p.feedback?.slice(0, -1) });
    return notify(next, managerUserOf(db, p.clientId)?.id, `${clientUser(db, p.clientId)?.firstName} withdrew their change request on ${short(p.text)}. No changes needed.`, `/manager/clients/${p.clientId}/content?tab=client`);
  });
}

/** The client stops a scheduled post before it goes out. Reversible with resumePost. */
export async function stopPost(postId: string) {
  await delay();
  update((db) => {
    const p = db.posts.find((x) => x.id === postId);
    if (!p) return db;
    let next = setPost(db, postId, { status: "on-hold", heldReason: "You stopped this post before it went out." });
    next = log(next, p.clientId, "you", "post", `Stopped ${short(p.text)}`);
    return notify(next, managerUserOf(db, p.clientId)?.id, `${clientUser(db, p.clientId)?.firstName} stopped a scheduled post: ${short(p.text)}.`, `/manager/clients/${p.clientId}/content?tab=client`, { urgent: true });
  });
}

export async function resumePost(postId: string) {
  await delay();
  update((db) => {
    const p = db.posts.find((x) => x.id === postId);
    if (!p) return db;
    const future = p.scheduledFor && new Date(p.scheduledFor).getTime() > Date.now();
    const next = setPost(db, postId, future ? { status: "scheduled", heldReason: undefined } : { status: "approved", heldReason: undefined, scheduledFor: undefined });
    return notify(next, managerUserOf(db, p.clientId)?.id, future ? `${clientUser(db, p.clientId)?.firstName} put a post back, ready to publish.` : `${clientUser(db, p.clientId)?.firstName} wants a held post ready again. Set a time.`, `/manager/clients/${p.clientId}/content?tab=${future ? "scheduled" : "schedule"}`);
  });
}

/* ---------- Client: quick tasks ---------- */

/**
 * Engagement and connection tasks finish themselves when the last item is marked, so they leave the client's
 * list; unmarking one brings the task back. The handover link ends with it.
 */
function settleTask(db: Db, taskId: string): Db {
  const t = db.tasks.find((x) => x.id === taskId);
  if (!t) return db;
  const list: { done: boolean; doneBy?: string }[] = t.items ?? t.people ?? [];
  const done = list.length > 0 && list.every((i) => i.done);
  if (done === t.done) return db;
  const by = done ? list.find((i) => i.doneBy)?.doneBy : undefined;
  const handoff = t.handoff && (done ? { ...t.handoff, endedAt: t.handoff.endedAt ?? nowIso(), endedReason: t.handoff.endedReason ?? ("done" as const) } : t.handoff.endedReason === "done" ? { ...t.handoff, endedAt: undefined, endedReason: undefined } : t.handoff);
  let next: Db = { ...db, tasks: db.tasks.map((x) => (x.id === taskId ? { ...x, done, doneBy: done && list.every((i) => i.doneBy) ? by : undefined, handoff } : x)) };
  if (done) next = notify(next, managerUserOf(db, t.clientId)?.id, `${clientUser(db, t.clientId)?.firstName} finished "${t.title}".`, `/manager/clients/${t.clientId}?tab=engagement`, { email: false });
  if (done && by) next = notify(next, clientUser(db, t.clientId)?.id, `${by} finished "${t.title}".`, `/tasks/${t.id}`, { email: false });
  return next;
}

/** This week's numbers (C9) move with comments and connection requests as they are marked. */
function countWeek(db: Db, clientId: string, key: "comments" | "connections", by: number): Db {
  return { ...db, progress: db.progress.map((w) => (w.clientId === clientId ? { ...w, [key]: { ...w[key], done: Math.max(0, w[key].done + by) } } : w)) };
}

/** `by`: the assistant's name, when they did it from their link (C19). */
export async function togglePersonSent(taskId: string, personId: string, by?: string) {
  await delay(250);
  update((db) => {
    const t = db.tasks.find((x) => x.id === taskId);
    const person = t?.people?.find((p) => p.id === personId);
    if (!t || !person) return db;
    let next: Db = {
      ...db,
      tasks: db.tasks.map((x) => (x.id !== taskId ? x : { ...x, people: x.people?.map((p) => (p.id === personId ? { ...p, done: !p.done, doneBy: p.done ? undefined : by } : p)) })),
    };
    // Recorded in the activity log, so it shows in the report for this period. Undo removes the record.
    next = person.done ? unlog(next, t.clientId, connectionText(person.name, person.doneBy)) : log(next, t.clientId, "you", "connection", connectionText(person.name, by));
    next = countWeek(next, t.clientId, "connections", person.done ? -1 : 1);
    return settleTask(next, taskId);
  });
}

const connectionText = (name: string, by?: string) => `Sent a connection request to ${name}${by ? ` (by ${by})` : ""}`;
const itemText = (kind: EngageAction, name: string, by?: string) => `${engageKinds[kind].log(name)}${by ? ` (by ${by})` : ""}`;

/** Marks one comment, reaction, repost, save, follow or message as done, or not. Recorded for the weekly report. */
export async function toggleItemDone(taskId: string, itemId: string, by?: string) {
  await delay(250);
  update((db) => {
    const t = db.tasks.find((x) => x.id === taskId);
    const item = t?.items?.find((i) => i.id === itemId);
    if (!t || !item || !isEngage(t.kind)) return db;
    const kind = t.kind;
    let next: Db = {
      ...db,
      tasks: db.tasks.map((x) => (x.id !== taskId ? x : { ...x, items: x.items?.map((i) => (i.id === itemId ? { ...i, done: !i.done, doneBy: i.done ? undefined : by } : i)) })),
      leads: item.leadId ? db.leads.map((l) => (l.id === item.leadId ? { ...l, status: item.done ? ("sent" as const) : ("done" as const) } : l)) : db.leads,
    };
    next = item.done ? unlog(next, t.clientId, itemText(kind, item.name, item.doneBy)) : log(next, t.clientId, "you", kind === "message" ? "message" : "engagement", itemText(kind, item.name, by));
    if (kind === "comment") next = countWeek(next, t.clientId, "comments", item.done ? -1 : 1);
    return settleTask(next, taskId);
  });
}

/** The client (or assistant) changes the ready text before copying it. */
export async function editItemText(taskId: string, itemId: string, text: string) {
  await delay();
  update((db) => ({ ...db, tasks: db.tasks.map((t) => (t.id !== taskId ? t : { ...t, items: t.items?.map((i) => (i.id === itemId ? { ...i, text } : i)) })) }));
}

/** What a finished quick task says in the activity log and the report. */
function taskDoneText(t: Db["tasks"][number]) {
  if (t.kind === "event" && t.event) return `${t.event.type === "program" ? "Applied for" : "Registered for"} ${t.event.name}`;
  return `Done: ${t.title}`;
}
const taskLogKind = (t: Db["tasks"][number]): Activity["kind"] => (t.kind === "event" ? "event" : t.kind === "connect" ? "connection" : "profile");

/** Removes the latest activity record with this text (when the client undoes a step). */
function unlog(db: Db, clientId: string, text: string): Db {
  const i = db.activity.findIndex((a) => a.clientId === clientId && a.text === text);
  return i < 0 ? db : { ...db, activity: db.activity.filter((_, j) => j !== i) };
}

export async function editPersonNote(taskId: string, personId: string, note: string) {
  await delay();
  update((db) => ({
    ...db,
    tasks: db.tasks.map((t) => (t.id !== taskId ? t : { ...t, people: t.people?.map((p) => (p.id === personId ? { ...p, note } : p)) })),
  }));
}

/** `by`: the assistant's name, when they did it from their link (C19). Done ends their link. */
export async function markTaskDone(taskId: string, done = true, by?: string) {
  await delay(300);
  update((db) => {
    const t = db.tasks.find((x) => x.id === taskId);
    if (!t) return db;
    const text = `${taskDoneText(t)}${by ? ` (by ${by})` : ""}`;
    const handoff = t.handoff && (done ? { ...t.handoff, endedAt: t.handoff.endedAt ?? nowIso(), endedReason: t.handoff.endedReason ?? ("done" as const) } : t.handoff.endedReason === "done" ? { ...t.handoff, endedAt: undefined, endedReason: undefined } : t.handoff);
    let next: Db = { ...db, tasks: db.tasks.map((x) => (x.id === taskId ? { ...x, done, doneBy: done ? by : undefined, handoff } : x)) };
    if (t.done !== done) next = done ? log(next, t.clientId, "you", taskLogKind(t), text) : unlog(unlog(next, t.clientId, taskDoneText(t)), t.clientId, `${taskDoneText(t)} (by ${t.doneBy})`);
    if (by && done) next = notify(next, clientUser(db, t.clientId)?.id, `${by} finished "${t.title}".`, `/tasks/${t.id}`, { email: false });
    return next;
  });
}

/* ---------- Assistants (C19) ---------- */

const assistantLabel = (a: Assistant) => `${a.name} (${a.role})`;
const token = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 24);

export async function saveAssistant(clientId: string, a: Omit<Assistant, "id" | "clientId"> & { id?: string }) {
  await delay();
  update((db) => {
    const list = db.assistants ?? [];
    const assistants = a.id ? list.map((x) => (x.id === a.id ? { ...x, ...a, id: x.id } : x)) : [...list, { ...a, id: id("as"), clientId }];
    return log({ ...db, assistants }, clientId, "you", "setting", `${a.id ? "Updated" : "Added"} your assistant ${a.name}`);
  });
}

/** Removing an assistant takes back every task they have, so their links stop working. */
export async function removeAssistant(assistantId: string) {
  await delay();
  update((db) => {
    const a = db.assistants.find((x) => x.id === assistantId);
    if (!a) return db;
    const tasks = db.tasks.map((t) => (t.handoff?.assistantId === assistantId && !t.handoff.endedAt ? { ...t, handoff: { ...t.handoff, endedAt: nowIso(), endedReason: "taken-back" as const } } : t));
    return log({ ...db, tasks, assistants: db.assistants.filter((x) => x.id !== assistantId) }, a.clientId, "you", "setting", `Removed your assistant ${a.name}`);
  });
}

function handOver(db: Db, taskId: string, assistantId: string, note?: string): Db {
  const t = db.tasks.find((x) => x.id === taskId);
  const a = db.assistants.find((x) => x.id === assistantId);
  if (!t || !a) return db;
  const handoff: Handoff = { assistantId, token: token(), note: note || undefined, sentAt: nowIso(), expiresAt: new Date(Date.now() + 14 * 86_400_000).toISOString() };
  const owner = clientUser(db, t.clientId);
  const text = `${owner?.firstName ?? "Your client"} asked you to do this: ${t.title}.${note ? ` "${note}"` : ""}`;
  let next: Db = { ...db, tasks: db.tasks.map((x) => (x.id === taskId ? { ...x, handoff } : x)) };
  next = send(next, assistantLabel(a), a.email, "email", text, `/a/${handoff.token}`);
  next = send(next, assistantLabel(a), a.whatsapp, "whatsapp", text, `/a/${handoff.token}`);
  return log(next, t.clientId, "you", "setting", `Handed "${t.title}" to ${a.name}`);
}

export async function handToAssistant(taskId: string, assistantId: string, note?: string) {
  await delay(600);
  update((db) => handOver(db, taskId, assistantId, note));
}

/** Sends the same task again with a fresh link (the old one stops working) and 14 more days. */
export async function resendHandoff(taskId: string) {
  await delay(500);
  update((db) => {
    const h = db.tasks.find((x) => x.id === taskId)?.handoff;
    return h ? handOver(db, taskId, h.assistantId, h.note) : db;
  });
}

export async function takeBackTask(taskId: string) {
  await delay(300);
  update((db) => ({ ...db, tasks: db.tasks.map((t) => (t.id === taskId && t.handoff ? { ...t, handoff: { ...t.handoff, endedAt: nowIso(), endedReason: "taken-back" as const } } : t)) }));
}

/** Undo for Take back: the same link works again. */
export async function restoreHandoff(taskId: string) {
  await delay(200);
  update((db) => ({ ...db, tasks: db.tasks.map((t) => (t.id === taskId && t.handoff ? { ...t, handoff: { ...t.handoff, endedAt: undefined, endedReason: undefined } } : t)) }));
}

/** The assistant opened their link. Recorded once, so the client sees "Opened". */
export function openHandoff(tok: string) {
  update((db) => {
    const t = db.tasks.find((x) => x.handoff?.token === tok);
    if (!t?.handoff || t.handoff.openedAt) return db;
    return { ...db, tasks: db.tasks.map((x) => (x.id === t.id ? { ...x, handoff: { ...x.handoff!, openedAt: nowIso() } } : x)) };
  });
}

/** From an expired or taken-back link: tells the client the assistant needs a new one. */
export async function askForNewLink(tok: string) {
  await delay(500);
  update((db) => {
    const t = db.tasks.find((x) => x.handoff?.token === tok);
    const a = db.assistants.find((x) => x.id === t?.handoff?.assistantId);
    if (!t || !a) return db;
    return notify(db, clientUser(db, t.clientId)?.id, `${a.name} asked for a new link to "${t.title}".`, `/tasks/${t.id}`, { urgent: true });
  });
}

/** Sends a new task straight to the assistant the client chose for that kind of task, if any. */
function autoHandOver(db: Db, taskId: string): Db {
  const t = db.tasks.find((x) => x.id === taskId);
  const a = (db.assistants ?? []).find((x) => x.clientId === t?.clientId && x.auto.includes(t.kind));
  return t && a ? handOver(db, taskId, a.id) : db;
}

/* ---------- Notification channels (C18) ---------- */

/** Saves how a person is told. For clients, email and WhatsApp also update How you review. */
export async function setChannels(userId: string, patch: Partial<Channels>) {
  await delay(300);
  update((db) => {
    const user = db.users.find((u) => u.id === userId);
    const client = db.clients.find((c) => c.userId === userId);
    const channels = { ...channelsOf(user, client), ...patch };
    let next: Db = { ...db, users: db.users.map((u) => (u.id === userId ? { ...u, channels } : u)) };
    if (client) next = patchClient(next, client.id, (c) => ({ review: { ...c.review, channels: { ...c.review.channels, email: channels.email, whatsapp: channels.whatsapp } } }));
    return next;
  });
}

/** Sends a 6-digit code on WhatsApp to the number. Nothing is turned on until it is confirmed. */
export async function startWhatsApp(userId: string, number: string) {
  await delay(700);
  update((db) => {
    const user = db.users.find((u) => u.id === userId);
    const next: Db = { ...db, users: db.users.map((u) => (u.id === userId ? { ...u, whatsapp: { number, confirmed: false } } : u)) };
    return send(next, nameOf(user), number, "whatsapp", "Your Bluecut code is 482913. It works for 10 minutes.", "/account");
  });
}

export async function confirmWhatsApp(userId: string, code: string) {
  await delay(500);
  if (!/^\d{6}$/.test(code)) throw new Error("That code is not right. Check the latest WhatsApp message from Bluecut and enter its 6 digits.");
  update((db) => {
    const user = db.users.find((u) => u.id === userId);
    if (!user?.whatsapp) return db;
    const channels = { ...channelsOf(user, db.clients.find((c) => c.userId === userId)), whatsapp: true };
    let next: Db = { ...db, users: db.users.map((u) => (u.id === userId ? { ...u, whatsapp: { ...u.whatsapp!, confirmed: true }, channels } : u)) };
    const client = db.clients.find((c) => c.userId === userId);
    if (client) next = patchClient(next, client.id, (c) => ({ review: { ...c.review, channels: { ...c.review.channels, whatsapp: true } } }));
    return next;
  });
}

export async function removeWhatsApp(userId: string) {
  await delay(400);
  update((db) => {
    const user = db.users.find((u) => u.id === userId);
    const client = db.clients.find((c) => c.userId === userId);
    const channels = { ...channelsOf(user, client), whatsapp: false, email: true };
    let next: Db = { ...db, users: db.users.map((u) => (u.id === userId ? { ...u, whatsapp: undefined, channels } : u)) };
    if (client) next = patchClient(next, client.id, (c) => ({ review: { ...c.review, channels: { ...c.review.channels, whatsapp: false, email: true } } }));
    return next;
  });
}

/* ---------- Client: progress ---------- */

/** C9: the client adds a result (a lead, an invitation, an offer) to their latest update. */
export async function addResult(clientId: string, text: string) {
  await delay();
  update((db) => {
    const latest = db.updates.filter((u) => u.clientId === clientId && u.status === "sent").sort((a, b) => (b.sentAt ?? "").localeCompare(a.sentAt ?? ""))[0];
    if (!latest) return db;
    const next = { ...db, updates: db.updates.map((u) => (u.id === latest.id ? { ...u, results: [...(u.results ?? []), text] } : u)) };
    return notify(next, managerUserOf(db, clientId)?.id, `${clientUser(db, clientId)?.firstName} added a result: ${text}`, `/manager/clients/${clientId}?tab=updates`, { email: false });
  });
}

export async function removeResult(clientId: string, text: string) {
  await delay();
  update((db) => ({ ...db, updates: db.updates.map((u) => (u.clientId === clientId ? { ...u, results: u.results?.filter((r) => r !== text) } : u)) }));
}

/* ---------- Messages ---------- */

export async function sendMessage(clientId: string, fromUserId: string, body: Pick<Message, "text" | "file" | "voice" | "threadId">, asTeam = false) {
  await delay(300);
  update((db) => {
    const next: Db = { ...db, messages: [...db.messages, { id: id("ms"), clientId, fromUserId, at: nowIso(), asTeam, ...body }] };
    const fromClient = fromUserId === clientOf(db, clientId)?.userId;
    const to = fromClient ? managerUserOf(db, clientId) : clientUser(db, clientId);
    const from = fromClient ? clientUser(db, clientId)?.firstName : asTeam ? "Your account team" : db.users.find((u) => u.id === fromUserId)?.firstName;
    return notify(next, to?.id, `New message from ${from}.`, fromClient ? `/manager/messages?client=${clientId}` : "/messages");
  });
}

export async function deleteMessage(messageId: string) {
  await delay();
  update((db) => ({ ...db, messages: db.messages.filter((m) => m.id !== messageId) }));
}

/** Adds a reaction, swaps it for another, or takes it off when the same one is chosen again. One per person. */
export async function reactToMessage(messageId: string, userId: string, kind: Reaction) {
  await delay(150);
  update((db) => ({
    ...db,
    messages: db.messages.map((m) => {
      if (m.id !== messageId) return m;
      const mine = m.reactions?.find((r) => r.userId === userId);
      const others = (m.reactions ?? []).filter((r) => r.userId !== userId);
      return { ...m, reactions: mine?.kind === kind ? others : [...others, { userId, kind }] };
    }),
  }));
}

export async function togglePinMessage(messageId: string) {
  await delay(150);
  update((db) => ({ ...db, messages: db.messages.map((m) => (m.id === messageId ? { ...m, pinned: !m.pinned } : m)) }));
}

/** The sender changes the text of a message they sent. */
export async function editMessage(messageId: string, text: string) {
  await delay();
  update((db) => ({ ...db, messages: db.messages.map((m) => (m.id === messageId ? { ...m, text, editedAt: nowIso() } : m)) }));
}

/* Conversations: each one has a title and its own messages, like chats in an AI app. */

/** Starts a conversation, titled from its first message. Returns its id so the first message can go in it. */
export async function startThread(clientId: string, firstText: string) {
  await delay(200);
  const threadId = id("th");
  const words = firstText.trim().replace(/\s+/g, " ");
  const title = words ? (words.length > 48 ? `${words.slice(0, 48).trimEnd()}…` : words) : "New conversation";
  update((db) => ({ ...db, threads: [...(db.threads ?? []), { id: threadId, clientId, title, createdAt: nowIso() }] }));
  return threadId;
}

export async function renameThread(threadId: string, title: string) {
  await delay();
  update((db) => ({ ...db, threads: (db.threads ?? []).map((t) => (t.id === threadId ? { ...t, title } : t)) }));
}

/** Deletes a conversation and its messages, for both people. */
export async function deleteThread(threadId: string) {
  await delay();
  update((db) => ({ ...db, threads: (db.threads ?? []).filter((t) => t.id !== threadId), messages: db.messages.filter((m) => m.threadId !== threadId) }));
}

export async function saveFileToBrand(messageId: string) {
  await delay();
  update((db) => {
    const m = db.messages.find((x) => x.id === messageId);
    if (!m?.file) return db;
    const f = m.file;
    const section = f.kind === "image" ? "photos" : f.kind === "video" ? "videos" : "documents";
    const video = f.kind === "video" && f.poster ? { poster: f.poster, seconds: f.seconds ?? 0, shape: "landscape" as const } : undefined;
    return {
      ...db,
      messages: db.messages.map((x) => (x.id === messageId ? { ...x, savedToBrand: true } : x)),
      brandFiles: [{ id: id("b"), clientId: m.clientId, section, name: f.name, src: f.src, size: f.size, at: nowIso(), video }, ...db.brandFiles],
    };
  });
}

/* ---------- Full-service (C20) + delegated access (D) ---------- */

/** Records the account team working on a full-service client's account, for the client to see (accountability). */
function access(db: Db, clientId: string, who: string, action: string, minutes?: number): Db {
  return { ...db, accessLog: [{ id: id("ac"), clientId, who, at: nowIso(), action, minutes }, ...(db.accessLog ?? [])] };
}

/** C20: turn on full-service (also reachable from onboarding). Default access (delegated login) is set up next. */
export async function activateFullService(clientId: string) {
  await delay(600);
  update((db) => {
    let next = patchClient(db, clientId, () => ({ service: "full-service" as const, fullService: { since: nowIso(), access: { credentials: "none" as const, twoFactor: false } } }));
    next = log(next, clientId, "you", "setting", "Turned on full-service");
    next = audit(next, "Client turned on full-service", clientUser(db, clientId)?.firstName ?? "Client", "account");
    return notify(next, managerUserOf(db, clientId)?.id, `${clientUser(db, clientId)?.firstName} turned on full-service. Follow their permission contract exactly; you cannot change their settings.`, `/manager/clients/${clientId}`, { urgent: true });
  });
}

/** #41: months left on the contract, rounded up, for pro-rating the company Page add-on. 0 if there is no contract yet. */
function remainingMonths(db: Db, clientId: string): number {
  const k = db.contracts.find((x) => x.clientId === clientId);
  if (!k) return 0;
  return Math.max(0, Math.ceil((new Date(k.endsAt).getTime() - Date.now()) / (30 * 86_400_000)));
}

/**
 * #41: add or remove the company Page add-on. Works on either tier (full-service manages it through delegated access;
 * self-serve gets it as tasks). Pro-rated: added mid-contract charges the rest of the contract; removed mid-contract
 * refunds the unused Page fee only (owner approves).
 */
export async function setCompanyPage(clientId: string, on: boolean) {
  await delay(400);
  update((db) => {
    const months = remainingMonths(db, clientId);
    const prorated = db.settings.pageManagementCents * months;
    const who = nameOf(clientUser(db, clientId));
    let next = patchClient(db, clientId, (c) => ({ companyPage: on ? { since: c.companyPage?.since ?? nowIso() } : undefined, permissions: { ...c.permissions, companyPage: on } }));
    if (on) {
      next = log(next, clientId, "you", "setting", "Added the company Page add-on");
      next = notify(next, managerUserOf(db, clientId)?.id, `${who} added the company Page add-on.`, `/manager/clients/${clientId}`, { email: false });
      return notify(next, clientUser(db, clientId)?.id, months > 0 ? `Company Page added. You pay ${money(prorated)} for the rest of your contract.` : "Company Page added to your plan.", "/contract");
    }
    if (prorated > 0) {
      next = { ...next, refunds: [{ id: id("rf"), clientId, amountCents: prorated, calc: `${money(db.settings.pageManagementCents)} a month × ${months} month${months === 1 ? "" : "s"} left`, reason: "Company Page add-on removed mid-contract", at: nowIso(), status: "waiting" as const }, ...next.refunds] };
      next = notify(next, OWNER, `${who} removed the company Page add-on. A refund of ${money(prorated)} (unused Page fee) needs your approval.`, "/admin/money", { urgent: true });
    }
    next = log(next, clientId, "you", "setting", "Removed the company Page add-on");
    next = notify(next, managerUserOf(db, clientId)?.id, `${who} removed the company Page add-on.`, `/manager/clients/${clientId}`, { email: false });
    return notify(next, clientUser(db, clientId)?.id, prorated > 0 ? `Company Page removed. We will refund the unused Page fee, ${money(prorated)}.` : "Company Page removed.", "/contract");
  });
}

/** C20: the client pauses all our work at once. Sovereignty: one click, instant. */
export async function pauseFullServiceAccess(clientId: string) {
  await delay(300);
  update((db) => {
    let next = patchClient(db, clientId, (c) => ({ fullService: c.fullService && { ...c.fullService, paused: true, pausedAt: nowIso(), access: c.fullService.access && { ...c.fullService.access, session: undefined } } }));
    next = access(next, clientId, clientUser(db, clientId)?.firstName ?? "Client", "Paused the account team's access");
    next = log(next, clientId, "you", "setting", "Paused your account team's access");
    return notify(next, managerUserOf(db, clientId)?.id, `${clientUser(db, clientId)?.firstName} paused your access. Do not work on their account until they resume.`, `/manager/clients/${clientId}`, { urgent: true });
  });
}

/** C20: the client resumes access. */
export async function resumeFullServiceAccess(clientId: string) {
  await delay(300);
  update((db) => {
    let next = patchClient(db, clientId, (c) => ({ fullService: c.fullService && { ...c.fullService, paused: false, pausedAt: undefined } }));
    next = log(next, clientId, "you", "setting", "Resumed your account team's access");
    return notify(next, managerUserOf(db, clientId)?.id, `${clientUser(db, clientId)?.firstName} resumed your access.`, `/manager/clients/${clientId}`, { email: false });
  });
}

/** C20: the client ends full-service and goes back to self-serve. The vaulted login is cleared; any company Page add-on stays on and is delivered as tasks. */
export async function endFullService(clientId: string) {
  await delay(500);
  update((db) => {
    let next = patchClient(db, clientId, () => ({ service: "self-serve" as const, fullService: undefined }));
    next = access(next, clientId, clientUser(db, clientId)?.firstName ?? "Client", "Ended full-service and removed all access");
    next = log(next, clientId, "you", "setting", "Ended full-service");
    next = audit(next, "Client ended full-service", clientUser(db, clientId)?.firstName ?? "Client", "account");
    return notify(next, managerUserOf(db, clientId)?.id, `${clientUser(db, clientId)?.firstName} ended full-service and is back on self-serve. Stop any account sign-ins.`, `/manager/clients/${clientId}`, { urgent: true });
  });
}

/** C20: the manager records a management session on a full-service client (accountability). */
export async function logManagementSession(clientId: string, action: string, minutes: number) {
  await delay(400);
  update((db) => {
    const who = nameOf(managerUserOf(db, clientId)) || "Your account team";
    const next = access(db, clientId, who, action, minutes);
    return log(next, clientId, "team", "account", action);
  });
}

/* ---------- Delegated access (D) ---------- */

const patchAccess = (db: Db, clientId: string, fn: (a: NonNullable<Client["fullService"]>["access"]) => NonNullable<Client["fullService"]>["access"]): Db =>
  patchClient(db, clientId, (c) => ({ fullService: c.fullService && { ...c.fullService, access: fn(c.fullService.access ?? { credentials: "none", twoFactor: false }) } }));

/** D1: the client stores (or clears) their LinkedIn login in the encrypted vault. Phase 1 stores nothing real. */
export async function setDelegatedCredentials(clientId: string, set: boolean) {
  await delay(500);
  update((db) => {
    let next = patchAccess(db, clientId, (a) => ({ ...a!, credentials: set ? "set" : "none", needsRefresh: false }));
    next = log(next, clientId, "you", "setting", set ? "Saved your login to the secure vault" : "Removed your login from the vault");
    return set ? notify(next, managerUserOf(db, clientId)?.id, `${clientUser(db, clientId)?.firstName} secured their login for delegated access.`, `/manager/clients/${clientId}`, { email: false }) : next;
  });
}

/** D1: the client confirms authenticator-app 2FA is on, so they approve each login. */
export async function setTwoFactor(clientId: string, on: boolean) {
  await delay(400);
  update((db) => {
    const next = patchAccess(db, clientId, (a) => ({ ...a!, twoFactor: on }));
    return log(next, clientId, "you", "setting", on ? "Turned on authenticator 2FA for delegated access" : "Turned off authenticator 2FA");
  });
}

/** D3: the client re-enters their login after LinkedIn rotated the session. */
export async function refreshDelegatedSession(clientId: string) {
  await delay(500);
  update((db) => {
    const next = patchAccess(db, clientId, (a) => ({ ...a!, credentials: "set", needsRefresh: false }));
    return log(next, clientId, "you", "setting", "Refreshed your secure session");
  });
}

/**
 * D2: the manager must notify before logging in. This creates a "requested" session and alerts the client to
 * approve on their phone. A manager who logs in without this step is a breach signal (handled server-side).
 */
export async function requestSession(clientId: string, note?: string) {
  await delay(400);
  update((db) => {
    const who = nameOf(managerUserOf(db, clientId)) || "Your account team";
    const session = { id: id("se"), managerName: who, state: "requested" as const, note: note || undefined, requestedAt: nowIso() };
    const next = patchAccess(db, clientId, (a) => ({ ...a!, session }));
    return notify(next, clientUser(db, clientId)?.id, `${who} wants to log in to manage your account${note ? `: "${note}"` : ""}. Approve it on your phone, or here.`, "/full-service", { urgent: true });
  });
}

/** D2: the client approves the session (their phone 2FA). The manager can now work; the session is recorded. */
export async function approveSession(clientId: string) {
  await delay(400);
  update((db) => {
    const s0 = db.clients.find((c) => c.id === clientId)?.fullService?.access?.session;
    if (!s0) return db;
    let next = patchAccess(db, clientId, (a) => ({ ...a!, session: { ...a!.session!, state: "active", approvedAt: nowIso() } }));
    next = log(next, clientId, "you", "setting", `Approved a management session for ${s0.managerName}`);
    return notify(next, managerUserOf(db, clientId)?.id, `${clientUser(db, clientId)?.firstName} approved your session. You can work now. The session is recorded.`, `/manager/clients/${clientId}`, { email: false });
  });
}

/** D2: the client declines the session. */
export async function declineSession(clientId: string) {
  await delay(300);
  update((db) => {
    let next = patchAccess(db, clientId, (a) => ({ ...a!, session: a!.session && { ...a!.session, state: "declined", endedAt: nowIso() } }));
    next = log(next, clientId, "you", "setting", "Declined a management session");
    return notify(next, managerUserOf(db, clientId)?.id, `${clientUser(db, clientId)?.firstName} declined your session request.`, `/manager/clients/${clientId}`, { urgent: true });
  });
}

/** D2: the manager ends the session and records what they did (accountability). */
export async function endSession(clientId: string, action: string, minutes: number) {
  await delay(400);
  update((db) => {
    const s0 = db.clients.find((c) => c.id === clientId)?.fullService?.access?.session;
    const who = s0?.managerName || nameOf(managerUserOf(db, clientId)) || "Your account team";
    let next = patchAccess(db, clientId, (a) => ({ ...a!, session: a!.session && { ...a!.session, state: "ended", endedAt: nowIso() } }));
    next = access(next, clientId, who, action.trim() || "Managed your account", minutes);
    return log(next, clientId, "team", "account", action.trim() || "Managed your account");
  });
}

/** D3: admin marks a breach signal reviewed. */
export async function resolveAccessAlert(alertId: string) {
  await delay(300);
  update((db) => ({ ...db, accessAlerts: (db.accessAlerts ?? []).map((a) => (a.id === alertId ? { ...a, resolved: true } : a)) }));
}

/* ---------- Client: control ---------- */

const permissionLabels: Record<keyof Permissions, string> = {
  post: "Prepare posts for me to publish",
  engage: "Prepare reactions, comments, reposts and follows",
  companyPage: "Post to my company Page",
  connectionDrafts: "Prepare connection requests and messages",
  profileDrafts: "Prepare profile updates",
};

export async function setPermission(clientId: string, key: keyof Permissions, value: boolean) {
  await delay(300);
  update((db) => {
    let next = patchClient(db, clientId, (c) => ({ permissions: { ...c.permissions, [key]: value } }));
    next = log(next, clientId, "you", "setting", `Turned ${value ? "on" : "off"} "${permissionLabels[key]}"`);
    if (key === "post" && !value) next = { ...next, posts: next.posts.map((p) => (p.clientId === clientId && p.status === "scheduled" ? { ...p, status: "on-hold" as PostStatus, heldReason: "You turned off posting for you." } : p)) };
    if (key === "post" && value) next = { ...next, posts: next.posts.map((p) => (p.clientId === clientId && p.heldReason === "You turned off posting for you." ? { ...p, status: "scheduled" as PostStatus, heldReason: undefined } : p)) };
    return notify(next, managerUserOf(db, clientId)?.id, `${clientUser(db, clientId)?.firstName} turned ${value ? "on" : "off"} "${permissionLabels[key]}".`, `/manager/clients/${clientId}`, { email: false });
  });
}

export async function saveReview(clientId: string, review: ReviewSettings) {
  await delay();
  update((db) => {
    let next = log(patchClient(db, clientId, () => ({ review })), clientId, "you", "setting", "Changed how you review");
    const u = clientUser(db, clientId);
    if (u) next = { ...next, users: next.users.map((x) => (x.id === u.id ? { ...x, channels: { ...channelsOf(u, clientOf(db, clientId)), email: review.channels.email, whatsapp: !!review.channels.whatsapp && !!u.whatsapp?.confirmed } } : x)) };
    return notify(next, managerUserOf(db, clientId)?.id, `${clientUser(db, clientId)?.firstName} changed how they review.`, `/manager/clients/${clientId}`, { email: false });
  });
}

export async function setPostingPaused(clientId: string, paused: boolean) {
  await delay();
  update((db) => {
    let next = patchClient(db, clientId, () => ({ postingPaused: paused }));
    next = {
      ...next,
      posts: next.posts.map((p) =>
        p.clientId !== clientId
          ? p
          : paused && p.status === "scheduled"
            ? { ...p, status: "on-hold" as PostStatus, heldReason: "You paused posting." }
            : !paused && p.heldReason === "You paused posting."
              ? { ...p, status: "scheduled" as PostStatus, heldReason: undefined }
              : p,
      ),
    };
    next = log(next, clientId, "you", "setting", paused ? "Paused all posting" : "Turned posting back on");
    return notify(next, managerUserOf(db, clientId)?.id, `${clientUser(db, clientId)?.firstName} ${paused ? "paused all posting. Scheduled posts are held." : "turned posting back on."}`, `/manager/clients/${clientId}`);
  });
}

export async function setLinkedIn(clientId: string, state: Client["linkedin"]) {
  await delay(800);
  update((db) => {
    const next = log(patchClient(db, clientId, () => ({ linkedin: state })), clientId, "you", "account", state === "connected" ? "Connected LinkedIn" : "Disconnected LinkedIn");
    return state === "disconnected" ? notify(next, managerUserOf(db, clientId)?.id, `${clientUser(db, clientId)?.firstName} disconnected LinkedIn. Nothing can be posted.`, `/manager/clients/${clientId}`, { urgent: true }) : next;
  });
}

export async function answerRequest(requestId: string, approve: boolean) {
  await delay();
  update((db) => {
    const r = db.requests.find((x) => x.id === requestId);
    if (!r) return db;
    let next: Db = { ...db, requests: db.requests.map((x) => (x.id === requestId ? { ...x, status: approve ? ("approved" as const) : ("declined" as const) } : x)) };
    next = log(next, r.clientId, "you", "setting", `${approve ? "Approved" : "Declined"}: ${r.text}`);
    return notify(next, managerUserOf(db, r.clientId)?.id, `${clientUser(db, r.clientId)?.firstName} ${approve ? "approved" : "declined"}: ${r.text}`, `/manager/clients/${r.clientId}`);
  });
}

/** The client changes their mind about a one-off permission. Anything already done under it stays done. */
export async function withdrawApproval(requestId: string) {
  await delay();
  update((db) => {
    const r = db.requests.find((x) => x.id === requestId);
    if (!r) return db;
    let next: Db = { ...db, requests: db.requests.map((x) => (x.id === requestId ? { ...x, status: "declined" as const } : x)) };
    next = log(next, r.clientId, "you", "setting", `Withdrew approval: ${r.text}`);
    return notify(next, managerUserOf(db, r.clientId)?.id, `${clientUser(db, r.clientId)?.firstName} withdrew their approval: ${r.text}. Do not go ahead.`, `/manager/clients/${r.clientId}`, { urgent: true });
  });
}

export async function raiseComplaint(clientId: string, kind: Db["complaints"][number]["kind"], text: string) {
  await delay(600);
  update((db) => {
    const next: Db = { ...db, complaints: [{ id: id("cp"), clientId, kind, text, at: nowIso(), status: "open", timeline: [{ at: nowIso(), text: "Complaint raised", who: "client" }] }, ...db.complaints] };
    return notify(next, OWNER, `${nameOf(clientUser(db, clientId))} raised a complaint.`, "/admin/complaints", { urgent: true });
  });
}

export async function withdrawComplaint(complaintId: string) {
  await delay();
  update((db) => ({
    ...db,
    complaints: db.complaints.map((c) => (c.id === complaintId ? { ...c, status: "resolved", outcome: "Withdrawn by the client", timeline: [...c.timeline, { at: nowIso(), text: "Withdrawn by the client", who: "client" }] } : c)),
  }));
}

/* ---------- Client: brand ---------- */

export async function addOffLimit(clientId: string, kind: Db["brands"][number]["offLimits"][number]["kind"], text: string) {
  await delay(300);
  update((db) => {
    const next = { ...db, brands: withBrand(db, clientId).map((b) => (b.clientId === clientId ? { ...b, offLimits: [...b.offLimits, { id: id("o"), kind, text }] } : b)) };
    return notify(next, managerUserOf(db, clientId)?.id, `${clientUser(db, clientId)?.firstName} added to off limits: ${text}`, `/manager/clients/${clientId}?tab=brand`);
  });
}

export async function editOffLimit(clientId: string, offId: string, text: string) {
  await delay(300);
  update((db) => ({ ...db, brands: withBrand(db, clientId).map((b) => (b.clientId === clientId ? { ...b, offLimits: b.offLimits.map((o) => (o.id === offId ? { ...o, text } : o)) } : b)) }));
}

export async function removeOffLimit(clientId: string, offId: string) {
  await delay(300);
  update((db) => ({ ...db, brands: withBrand(db, clientId).map((b) => (b.clientId === clientId ? { ...b, offLimits: b.offLimits.filter((o) => o.id !== offId) } : b)) }));
}

export function restoreOffLimit(clientId: string, item: Db["brands"][number]["offLimits"][number]) {
  update((db) => ({ ...db, brands: withBrand(db, clientId).map((b) => (b.clientId === clientId ? { ...b, offLimits: [...b.offLimits, item] } : b)) }));
}

export async function saveVoice(clientId: string, voice: string, wordsUse: string[], wordsAvoid: string[]) {
  await delay();
  update((db) => ({ ...db, brands: withBrand(db, clientId).map((b) => (b.clientId === clientId ? { ...b, voice, wordsUse, wordsAvoid } : b)) }));
}

export async function setColours(clientId: string, colours: string[]) {
  await delay(300);
  update((db) => ({ ...db, brands: withBrand(db, clientId).map((b) => (b.clientId === clientId ? { ...b, colours } : b)) }));
}

export async function addMoment(clientId: string, note: string, photos: string[], videos: NonNullable<Db["moments"][number]["videos"]> = []) {
  await delay(600);
  update((db) => {
    const next: Db = { ...db, moments: [{ id: id("mo"), clientId, note, photos, videos, at: nowIso(), status: "new" }, ...db.moments] };
    return notify(next, managerUserOf(db, clientId)?.id, `${clientUser(db, clientId)?.firstName} added a new Moment.`, `/manager/clients/${clientId}?tab=brand`);
  });
}

export async function deleteMoment(momentId: string) {
  await delay();
  update((db) => ({ ...db, moments: db.moments.filter((m) => m.id !== momentId) }));
}

type BrandFileExtra = Pick<Db["brandFiles"][number], "video" | "carousel" | "addedBy">;

/** Adds a file to the client's Brand. Returns its id, so a draft or a quick task can point to it. */
export async function addBrandFile(clientId: string, section: Db["brandFiles"][number]["section"], name: string, size: string, src?: string, extra: BrandFileExtra = {}) {
  await delay(900);
  const fileId = id("b");
  update((db) => {
    const next: Db = { ...db, brandFiles: [{ id: fileId, clientId, section, name, size, src, at: nowIso(), ...extra }, ...db.brandFiles] };
    // The manager hears about new videos and carousels from the client: they are content to plan around.
    if (extra.addedBy === "client" && (section === "videos" || section === "carousels"))
      return notify(next, managerUserOf(db, clientId)?.id, `${clientUser(db, clientId)?.firstName} added a ${section === "videos" ? "video" : "carousel"} to their Brand: ${name}.`, `/manager/clients/${clientId}?tab=brand`);
    return next;
  });
  return fileId;
}

export async function removeBrandFile(fileId: string) {
  await delay();
  update((db) => ({ ...db, brandFiles: db.brandFiles.filter((f) => f.id !== fileId) }));
}

/* ---------- Media: posts, video requests, video add-on ---------- */

type PostMedia = Pick<Db["posts"][number], "image" | "video" | "carousel">;

/** Sets a post's media. A post has one of image, video or carousel; null removes it. */
export async function setPostMedia(postId: string, media: PostMedia | null) {
  await delay();
  update((db) => setPost(db, postId, { image: media?.image, video: media?.video, carousel: media?.carousel, waitingForVideo: media?.video ? undefined : db.posts.find((p) => p.id === postId)?.waitingForVideo }));
}

/**
 * M4: asks the client to record a short video (quick task C17), with a brief the system suggested and the
 * manager edited. Optionally linked to a draft that waits for the clip.
 */
export async function requestVideo(clientId: string, brief: Db["tasks"][number]["video"] & object, dueAt: string) {
  await delay(700);
  const taskId = id("t");
  update((db) => {
    let next: Db = { ...db, tasks: [{ id: taskId, clientId, kind: "video", title: "Record a short video", dueAt, done: false, sentAt: nowIso(), video: brief }, ...db.tasks] };
    if (brief.postId) next = setPost(next, brief.postId, { waitingForVideo: taskId, format: "video" });
    next = autoHandOver(next, taskId);
    next = log(next, clientId, "team", "post", `Asked you for a short video: ${brief.idea}`);
    return notify(next, clientUser(db, clientId)?.id, `${managerUserOf(db, clientId)?.firstName ?? "Your manager"} asked you for a short video: ${brief.idea}.`, `/tasks/${taskId}`, { email: true });
  });
  return taskId;
}

export async function updateVideoBrief(taskId: string, brief: NonNullable<Db["tasks"][number]["video"]>) {
  await delay();
  update((db) => {
    const t = db.tasks.find((x) => x.id === taskId);
    const next = { ...db, tasks: db.tasks.map((x) => (x.id === taskId ? { ...x, video: brief } : x)) };
    return t ? notify(next, clientUser(db, t.clientId)?.id, "Your manager updated what to record for your video.", `/tasks/${taskId}`) : next;
  });
}

export async function withdrawVideoRequest(taskId: string) {
  await delay();
  update((db) => {
    const t = db.tasks.find((x) => x.id === taskId);
    let next: Db = { ...db, tasks: db.tasks.filter((x) => x.id !== taskId) };
    if (t?.video?.postId) next = setPost(next, t.video.postId, { waitingForVideo: undefined });
    return t ? notify(next, clientUser(db, t.clientId)?.id, "Your manager withdrew a video request. Nothing to record.", "/home") : next;
  });
}

/** C17: the client's clip arrives. It goes to their Brand, onto the waiting draft, and the manager is told. */
export async function submitVideo(taskId: string, fileId: string) {
  await delay(600);
  update((db) => {
    const t = db.tasks.find((x) => x.id === taskId);
    const f = db.brandFiles.find((x) => x.id === fileId);
    if (!t || !f?.video) return db;
    let next: Db = { ...db, tasks: db.tasks.map((x) => (x.id === taskId ? { ...x, done: true, video: x.video && { ...x.video, fileId } } : x)) };
    if (t.video?.postId)
      next = setPost(next, t.video.postId, { waitingForVideo: undefined, video: { src: f.src!, poster: f.video.poster, alt: t.video.idea, seconds: f.video.seconds, shape: f.video.shape, fileId } });
    next = log(next, t.clientId, "you", "post", `Sent your video: ${t.video?.idea ?? f.name}`);
    return notify(next, managerUserOf(db, t.clientId)?.id, `${clientUser(db, t.clientId)?.firstName} sent their video: ${t.video?.idea ?? f.name}.`, `/manager/clients/${t.clientId}/content?tab=drafts`, { urgent: true });
  });
}

/* ---------- Services catalog (#50) ---------- */

/** A client asks about an extra service. Captured and handed to the owner, who follows up and bills off the platform. No status is kept. */
export async function requestService(clientId: string, serviceId: string, note?: string) {
  await delay(700);
  update((db) => {
    const service = (db.services ?? []).find((s) => s.id === serviceId);
    if (!service) return db;
    const req = { id: id("sr"), clientId, serviceId, serviceName: service.name, note: note?.trim() || undefined, at: nowIso() };
    let next: Db = { ...db, serviceRequests: [req, ...(db.serviceRequests ?? [])] };
    const who = nameOf(clientUser(db, clientId));
    next = notify(next, OWNER, `${who} is interested in ${service.name}.${req.note ? ` “${req.note}”` : ""}`, `/admin/clients/${clientId}`, { email: true });
    return log(next, clientId, "you", "account", `Asked about ${service.name}`);
  });
}

/** Owner: add a service to the catalog. */
export async function addService(data: { name: string; description: string; bucket: "included" | "extra" }) {
  await delay(500);
  update((db) => {
    const svc = { id: id("sv"), name: data.name.trim(), description: data.description.trim(), bucket: data.bucket, active: true };
    const next: Db = { ...db, services: [...(db.services ?? []), svc] };
    return audit(next, `Added the service “${svc.name}” (${svc.bucket === "included" ? "included" : "extra, billed off the platform"})`, svc.name, "setting");
  });
}

/** Owner: edit a service in the catalog. */
export async function editService(serviceId: string, data: { name: string; description: string; bucket: "included" | "extra"; active: boolean }) {
  await delay(500);
  update((db) => {
    const next: Db = { ...db, services: (db.services ?? []).map((s) => (s.id === serviceId ? { ...s, name: data.name.trim(), description: data.description.trim(), bucket: data.bucket, active: data.active } : s)) };
    return audit(next, `Edited the service “${data.name.trim()}”`, data.name.trim(), "setting");
  });
}

/** Owner: remove a service from the catalog. */
export async function removeService(serviceId: string) {
  await delay(500);
  update((db) => {
    const svc = (db.services ?? []).find((s) => s.id === serviceId);
    const next: Db = { ...db, services: (db.services ?? []).filter((s) => s.id !== serviceId) };
    return audit(next, `Removed the service “${svc?.name ?? serviceId}”`, svc?.name ?? serviceId, "setting");
  });
}

/* ---------- Admin roles and team (#49) ---------- */

/** Owner: add a custom admin role. */
export async function addRole(data: { name: string; description?: string; access: AdminRole["access"] }) {
  await delay(500);
  update((db) => {
    const role: AdminRole = { id: id("ar"), name: data.name.trim(), description: data.description?.trim() || undefined, access: data.access };
    return audit({ ...db, adminRoles: [...(db.adminRoles ?? []), role] }, `Added the admin role “${role.name}”`, role.name, "setting");
  });
}

/** Owner: edit a role. The built-in Owner role cannot be edited. */
export async function editRole(roleId: string, data: { name: string; description?: string; access: AdminRole["access"] }) {
  await delay(500);
  update((db) => {
    if ((db.adminRoles ?? []).find((r) => r.id === roleId)?.owner) return db;
    const next = { ...db, adminRoles: (db.adminRoles ?? []).map((r) => (r.id === roleId ? { ...r, name: data.name.trim(), description: data.description?.trim() || undefined, access: data.access } : r)) };
    return audit(next, `Edited the admin role “${data.name.trim()}”`, data.name.trim(), "setting");
  });
}

/** Owner: remove a role (not the Owner role). Anyone holding it loses it. */
export async function removeRole(roleId: string) {
  await delay(500);
  update((db) => {
    const role = (db.adminRoles ?? []).find((r) => r.id === roleId);
    if (!role || role.owner) return db;
    const next: Db = { ...db, adminRoles: (db.adminRoles ?? []).filter((r) => r.id !== roleId), adminMembers: (db.adminMembers ?? []).map((m) => ({ ...m, roleIds: m.roleIds.filter((x) => x !== roleId) })) };
    return audit(next, `Removed the admin role “${role.name}”`, role.name, "setting");
  });
}

/** Owner: invite an admin and assign their roles. */
export async function inviteAdmin(firstName: string, lastName: string, email: string, roleIds: string[]) {
  await delay(600);
  update((db) => {
    const uid = id("u");
    const next: Db = {
      ...db,
      users: [...db.users, { id: uid, role: "owner", firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), title: "", timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, twoStep: false }],
      adminMembers: [...(db.adminMembers ?? []), { id: id("am"), userId: uid, roleIds, status: "invited" as const, invitedAt: nowIso() }],
    };
    return audit(next, `Invited ${firstName.trim()} ${lastName.trim()} as an admin`, `${firstName.trim()} ${lastName.trim()}`, "account");
  });
}

/** Owner: change an admin's roles. */
export async function setMemberRoles(memberId: string, roleIds: string[]) {
  await delay(400);
  update((db) => {
    const next = { ...db, adminMembers: (db.adminMembers ?? []).map((m) => (m.id === memberId ? { ...m, roleIds } : m)) };
    const who = nameOf(db.users.find((u) => u.id === next.adminMembers.find((x) => x.id === memberId)?.userId));
    return audit(next, `Changed ${who}'s admin roles`, who, "setting");
  });
}

/** Owner: deactivate or reactivate an admin. The last active Owner cannot be deactivated. */
export async function setAdminStatus(memberId: string, status: "active" | "deactivated") {
  await delay(400);
  update((db) => {
    const ownerRoleIds = new Set((db.adminRoles ?? []).filter((r) => r.owner).map((r) => r.id));
    const isOwner = (m: AdminMember) => m.roleIds.some((r) => ownerRoleIds.has(r));
    const target = (db.adminMembers ?? []).find((x) => x.id === memberId);
    if (status === "deactivated" && target && isOwner(target) && (db.adminMembers ?? []).filter((m) => m.status === "active" && isOwner(m)).length <= 1) return db;
    const next = { ...db, adminMembers: (db.adminMembers ?? []).map((m) => (m.id === memberId ? { ...m, status } : m)) };
    const who = nameOf(db.users.find((u) => u.id === target?.userId));
    return audit(next, status === "deactivated" ? `Deactivated the admin ${who}` : `Reactivated the admin ${who}`, who, "account");
  });
}

/* ---------- Client: setup (C2 to C6) ---------- */

/** The setup steps for a client, in order. Full-service adds a secure-access step; neither uses the LinkedIn API. */
const setupOrder = (service?: Client["service"]): SetupStep[] => ["service", "permissions", ...(service === "full-service" ? ["access" as const] : []), "goals-call", "strategy-call", "plan", "review"];

/** B: the client chooses their service at onboarding: self-serve (hands-on) or full-service (done-for-you). */
export async function setService(clientId: string, service: "self-serve" | "full-service") {
  await delay(300);
  update((db) => {
    let next = patchClient(db, clientId, () => ({ service }));
    next = log(next, clientId, "you", "setting", `Chose ${service === "full-service" ? "full-service (done-for-you)" : "self-serve"}`);
    return notify(next, managerUserOf(db, clientId)?.id, `${clientUser(db, clientId)?.firstName} chose ${service === "full-service" ? "full-service" : "self-serve"} at onboarding.`, `/manager/clients/${clientId}`, { email: false });
  });
  await completeSetupStep(clientId, "service");
}

export async function completeSetupStep(clientId: string, step: SetupStep) {
  await delay(300);
  update((db) => {
    const next = patchClient(db, clientId, (c) => {
      const order = setupOrder(c.service);
      const done = c.setupDone.includes(step) ? c.setupDone : order.filter((s) => s === step || c.setupDone.includes(s));
      const finished = done.length === order.length;
      return {
        setupDone: done,
        setupProgress: Math.round((done.length / order.length) * 100),
        ...(finished && c.status === "setting-up" ? { status: "free" as const, stage: "calls" as const } : {}),
      };
    });
    const c = clientOf(next, clientId);
    return c?.status === "free" && clientOf(db, clientId)?.status === "setting-up" ? notify(next, OWNER, `${nameOf(clientUser(db, clientId))} finished setup.`, "/admin/clients", { email: false }) : next;
  });
}

export async function bookCall(clientId: string, kind: "goals" | "strategy", at: string, recording: boolean) {
  await delay(600);
  update((db) => {
    const c = clientOf(db, clientId);
    const managerId = c?.managerId ?? "m-ada";
    const calls = db.calls.filter((x) => !(x.clientId === clientId && x.kind === kind && x.status === "booked"));
    const next: Db = { ...db, calls: [...calls, { id: id("cl"), clientId, managerId, kind, at, minutes: 30, meetUrl: "https://meet.google.com/example-new", recording, status: "booked" }] };
    const mu = db.users.find((u) => u.id === db.managers.find((m) => m.id === managerId)?.userId);
    return notify(next, mu?.id, `${nameOf(clientUser(db, clientId))} booked their ${kind} call.`, "/manager/calls");
  });
  await completeSetupStep(clientId, kind === "goals" ? "goals-call" : "strategy-call");
}

// ---------- Ad-hoc check-in call lifecycle ----------
// A check-in call is agreed between client and manager before it is confirmed. The manager always
// provides the Google Meet link. A call is only "booked" once both sides agree a time and a link exists.

const callTitleOf = (call: { title?: string }) => call.title?.trim() || "your call";
const otherSide = (by: "client" | "manager") => (by === "manager" ? ("client" as const) : ("manager" as const));
const sideName = (db: Db, clientId: string, side: "client" | "manager") => (side === "manager" ? nameOf(managerUserOf(db, clientId)) : nameOf(clientUser(db, clientId)));
const sideUser = (db: Db, clientId: string, side: "client" | "manager") => (side === "manager" ? managerUserOf(db, clientId)?.id : clientUser(db, clientId)?.id);
const sideHref = (side: "client" | "manager") => (side === "manager" ? "/manager/calls" : "/calls");

/** Flow A: the client asks to meet, offering one or more times from the manager's open slots. Held, pending the manager. */
export async function requestCall(clientId: string, data: { title: string; agenda: string; times: string[]; recording: boolean }) {
  await delay(600);
  update((db) => {
    const managerId = clientOf(db, clientId)?.managerId ?? "m-ada";
    const call: Db["calls"][number] = {
      id: id("cl"), clientId, managerId, kind: "check-in", openedBy: "client",
      title: data.title.trim(), agenda: data.agenda.trim(), at: data.times[0], minutes: 30, meetUrl: "",
      recording: data.recording, status: "pending", pending: { awaiting: "manager", by: "client", options: data.times },
    };
    const next: Db = { ...db, calls: [...db.calls, call] };
    return notify(next, managerUserOf(db, clientId)?.id, `${nameOf(clientUser(db, clientId))} asked to book a call: “${call.title}”.`, "/manager/calls", { email: true });
  });
}

/** Flow B: the manager offers the client one or more times (agreed in chat first). Pending the client's acceptance. */
export async function createCallForClient(clientId: string, data: { title: string; agenda?: string; times: string[]; meetUrl?: string; recording: boolean }) {
  await delay(600);
  update((db) => {
    const managerId = clientOf(db, clientId)?.managerId ?? "m-ada";
    const call: Db["calls"][number] = {
      id: id("cl"), clientId, managerId, kind: "check-in", openedBy: "manager",
      title: data.title.trim(), agenda: data.agenda?.trim() || undefined, at: data.times[0], minutes: 30, meetUrl: data.meetUrl?.trim() ?? "",
      recording: data.recording, status: "pending", pending: { awaiting: "client", by: "manager", options: data.times },
    };
    const next: Db = { ...db, calls: [...db.calls, call] };
    return notify(next, clientUser(db, clientId)?.id, `${nameOf(managerUserOf(db, clientId))} proposed a call: “${call.title}”. Accept a time or suggest another.`, "/calls", { email: true });
  });
}

/**
 * Decline-and-suggest: the only way to turn down a time. Requires a reason and one or more alternative
 * times (from the manager's open slots). The other side must accept one or suggest again — the call is not
 * booked until both agree. Also used to reschedule a booked call.
 */
export async function proposeTimes(callId: string, by: "client" | "manager", times: string[], note: string) {
  await delay(500);
  update((db) => {
    const call = db.calls.find((c) => c.id === callId);
    if (!call) return db;
    const awaiting = otherSide(by);
    // A new time is on the table, so any old link no longer applies until the manager confirms again.
    const next: Db = { ...db, calls: db.calls.map((c) => (c.id === callId ? { ...c, at: times[0], status: "pending" as const, meetUrl: "", pending: { awaiting, by, note: note.trim() || undefined, options: times } } : c)) };
    return notify(next, sideUser(db, call.clientId, awaiting), `${sideName(db, call.clientId, by)} suggested ${times.length > 1 ? `${times.length} new times` : "a new time"} for “${callTitleOf(call)}”.`, sideHref(awaiting), { email: true });
  });
}

/** The manager confirms a time and adds the Meet link. The call becomes booked. */
export async function confirmCall(callId: string, chosenAt: string, meetUrl: string) {
  await delay(500);
  update((db) => {
    const call = db.calls.find((c) => c.id === callId);
    if (!call) return db;
    let next: Db = { ...db, calls: db.calls.map((c) => (c.id === callId ? { ...c, at: chosenAt, status: "booked" as const, meetUrl: meetUrl.trim(), pending: undefined } : c)) };
    next = log(next, call.clientId, "team", "setting", `Confirmed the call “${callTitleOf(call)}”`);
    return notify(next, clientUser(db, call.clientId)?.id, `${nameOf(managerUserOf(db, call.clientId))} confirmed “${callTitleOf(call)}” for ${dayTimeIn(chosenAt)}. The meeting link is ready.`, "/calls", { email: true });
  });
}

/** The client accepts one of the manager's offered times. The manager then adds the link to confirm. */
export async function acceptTime(callId: string, chosenAt: string) {
  await delay(500);
  update((db) => {
    const call = db.calls.find((c) => c.id === callId);
    if (!call) return db;
    const next: Db = { ...db, calls: db.calls.map((c) => (c.id === callId ? { ...c, at: chosenAt, status: "pending" as const, pending: { awaiting: "manager" as const, by: "client" as const, options: [chosenAt] } } : c)) };
    return notify(next, managerUserOf(db, call.clientId)?.id, `${nameOf(clientUser(db, call.clientId))} agreed ${dayTimeIn(chosenAt)} for “${callTitleOf(call)}”. Add the meeting link to confirm.`, "/manager/calls", { email: true });
  });
}

/** Post-call: the manager records whether the call held and the feedback (transcript/insight), or that it did not hold. Feeds the strategy. */
export async function recordCallOutcome(callId: string, data: { held: boolean; transcript?: string; insights?: string; note?: string }) {
  await delay(500);
  update((db) => {
    const call = db.calls.find((c) => c.id === callId);
    if (!call) return db;
    const patch = data.held
      ? { status: "done" as const, outcome: "held" as const, transcript: data.transcript?.trim() || undefined, insights: data.insights?.trim() || undefined }
      : { status: "done" as const, outcome: "missed" as const, outcomeNote: data.note?.trim() || undefined };
    return { ...db, calls: db.calls.map((c) => (c.id === callId ? { ...c, ...patch } : c)) };
  });
}

/** #42: the AM saves the call's transcript (only if it was recorded) and insights as a draft. */
export async function saveCallNotes(callId: string, notes: { transcript?: string; insights: string }) {
  await delay(500);
  update((db) => ({ ...db, calls: db.calls.map((c) => (c.id === callId ? { ...c, transcript: notes.transcript?.trim() || undefined, insights: notes.insights.trim() || undefined } : c)) }));
}

/** #42: the AM shares the transcript and insights with the client. The client sees them only after this. */
export async function shareCallNotes(callId: string) {
  await delay(500);
  update((db) => {
    const call = db.calls.find((c) => c.id === callId);
    if (!call) return db;
    const name = call.kind === "check-in" ? "check-in call" : `${call.kind} call`;
    let next: Db = { ...db, calls: db.calls.map((c) => (c.id === callId ? { ...c, sharedAt: nowIso() } : c)) };
    next = log(next, call.clientId, "team", "setting", `Shared the ${name} notes`);
    return notify(next, clientUser(db, call.clientId)?.id, `${managerUserOf(db, call.clientId)?.firstName ?? "Your account manager"} shared the notes from your ${name}.`, "/calls", { email: true });
  });
}

export async function signContract(clientId: string, months: 3 | 6 | 12, monthlyCents: number, signedName: string) {
  await delay(700);
  const DAY = 86_400_000;
  const now = Date.now();
  update((db) => {
    const next: Db = {
      ...db,
      contracts: [
        ...db.contracts.filter((k) => k.clientId !== clientId),
        {
          id: id("k"),
          clientId,
          months,
          monthlyCents,
          signedAt: nowIso(),
          signedName,
          freeEndsAt: new Date(now + 14 * DAY).toISOString(),
          startsAt: new Date(now + 14 * DAY).toISOString(),
          endsAt: new Date(now + 14 * DAY + months * 30 * DAY).toISOString(),
          status: "free",
          paid: false,
        },
      ],
    };
    return notify(next, clientUser(db, clientId)?.id, `Your contract is signed. Your free 2 weeks have started.`, "/contract");
  });
}

export async function payNow(clientId: string) {
  await delay(900);
  update((db) => {
    const k = db.contracts.find((x) => x.clientId === clientId);
    let next: Db = {
      ...db,
      contracts: db.contracts.map((x) => (x.clientId === clientId ? { ...x, paid: true, card: { brand: "Visa", last4: "4242" }, status: x.status === "paused" ? "active" : x.status } : x)),
      // Contracts are paid up front: one invoice for the whole contract.
      invoices: k ? [{ id: id("i"), clientId, number: `BC-${1200 + db.invoices.length}`, amountCents: k.monthlyCents * k.months, at: nowIso(), status: "paid", label: `${k.months} months, paid in full` }, ...db.invoices] : db.invoices,
    };
    const c = next.clients.find((x) => x.id === clientId);
    if (c?.status === "paused") {
      next = patchClient(next, clientId, () => ({ status: "active", pausedReason: undefined, pausedAt: undefined }));
      next = { ...next, posts: next.posts.map((p) => (p.clientId === clientId && p.status === "on-hold" ? { ...p, status: "scheduled" } : p)) };
      next = log(next, clientId, "system", "account", "Account reactivated after payment");
      next = notify(next, managerUserOf(db, clientId)?.id, `${nameOf(clientUser(db, clientId))} paid. Their account is active again.`, `/manager/clients/${clientId}`);
    }
    return notify(next, clientUser(db, clientId)?.id, "Payment received. Your receipt is in Contract.", "/contract");
  });
}

export async function approveStrategy(clientId: string) {
  await delay(600);
  update((db) => {
    let next: Db = { ...db, strategies: db.strategies.map((s) => (s.clientId === clientId ? { ...s, status: "approved", approvedAt: nowIso() } : s)) };
    next = patchClient(next, clientId, () => ({ stage: "running" }));
    next = log(next, clientId, "you", "account", "Approved your strategy");
    return notify(next, managerUserOf(db, clientId)?.id, `${clientUser(db, clientId)?.firstName} approved the strategy. Work can start.`, `/manager/clients/${clientId}/content?tab=ideas`);
  });
}

export async function askStrategyChange(clientId: string, note: string) {
  await delay();
  update((db) => {
    const next: Db = { ...db, strategies: db.strategies.map((s) => (s.clientId === clientId ? { ...s, status: "change-asked", changeNote: note } : s)) };
    return notify(next, managerUserOf(db, clientId)?.id, `${clientUser(db, clientId)?.firstName} asked for a change to the strategy.`, `/manager/clients/${clientId}/onboard`);
  });
}

/* ---------- Client: contract and account ---------- */

export async function cancelContract(clientId: string, reason: string, note?: string) {
  await delay(800);
  update((db) => {
    let next: Db = {
      ...db,
      contracts: db.contracts.map((k) => (k.clientId === clientId && k.status !== "cancelled" ? { ...k, status: "cancelled", cancelledFrom: k.status } : k)),
      cancellations: [{ id: id("x"), clientId, reason, note, at: nowIso() }, ...db.cancellations],
    };
    next = notify(next, OWNER, `${nameOf(clientUser(db, clientId))} pulled out: ${reason.toLowerCase()}.`, "/admin/money?tab=reasons", { urgent: true });
    next = notify(next, managerUserOf(db, clientId)?.id, `${nameOf(clientUser(db, clientId))} pulled out of their contract.`, `/manager/clients/${clientId}`);
    return audit(next, `Pulled out of contract (reason: ${reason.toLowerCase()})`, nameOf(clientUser(db, clientId)), "account", nameOf(clientUser(db, clientId)));
  });
}

export async function requestManagerChange(clientId: string, reason: string) {
  await delay();
  update((db) => {
    const next: Db = { ...db, changeRequests: [{ id: id("cr"), clientId, reason, at: nowIso(), status: "open" }, ...db.changeRequests] };
    return notify(next, OWNER, `${nameOf(clientUser(db, clientId))} asked for a different manager.`, "/admin/complaints");
  });
}

export async function cancelManagerChange(requestId: string) {
  await delay();
  update((db) => ({ ...db, changeRequests: db.changeRequests.filter((r) => r.id !== requestId) }));
}

export async function saveProfile(userId: string, patch: { firstName?: string; lastName?: string; timeZone?: string; title?: string; linkedinUrl?: string }) {
  await delay();
  update((db) => ({ ...db, users: db.users.map((u) => (u.id === userId ? { ...u, ...patch } : u)) }));
}

/** #43: re-read the name/photo from the person's stored LinkedIn URL, on demand (the client, or the AM/admin for a client). */
export async function syncLinkedIn(userId: string) {
  await delay(900);
  update((db) => {
    const user = db.users.find((u) => u.id === userId);
    if (!user?.linkedinUrl) return db;
    const prof = extractLinkedIn(user.linkedinUrl);
    if (!prof || prof.kind !== "person") return db;
    return { ...db, users: db.users.map((u) => (u.id === userId ? { ...u, firstName: prof.firstName, lastName: prof.lastName } : u)) };
  });
}

export async function setTwoStep(userId: string, on: boolean) {
  await delay();
  update((db) => ({ ...db, users: db.users.map((u) => (u.id === userId ? { ...u, twoStep: on } : u)) }));
}

/** For simulated work with nothing to store (drafting help, link checks). Phase 2 calls the real service. */
export async function save() {
  await delay(400);
}

export async function setPhoto(userId: string, photo: string | undefined) {
  await delay(600);
  update((db) => ({ ...db, users: db.users.map((u) => (u.id === userId ? { ...u, photo } : u)) }));
}

/** An email or alert choice. Phase 2 reads these before sending. */
export async function setPref(userId: string, key: string, on: boolean) {
  await delay(300);
  update((db) => ({ ...db, users: db.users.map((u) => (u.id === userId ? { ...u, prefs: { ...u.prefs, [key]: on } } : u)) }));
}

export async function signOutSessions(userId: string, sessionIds: string[]) {
  await delay(500);
  update((db) => ({ ...db, users: db.users.map((u) => (u.id === userId ? { ...u, signedOut: [...new Set([...(u.signedOut ?? []), ...sessionIds])] } : u)) }));
}

/** Prepares a download of everything we hold about the person and emails them a link. */
export async function requestDataExport(userId: string) {
  await delay(700);
  update((db) => notify(db, userId, "Your data download is ready. The link in your email works for 7 days.", "/account", { email: true }));
}

/** C14: deletes the client's account. The contract is cancelled first; invoices are kept, as the law requires. */
export async function deleteAccount(clientId: string) {
  await delay(900);
  update((db) => {
    const u = clientUser(db, clientId);
    let next: Db = {
      ...db,
      users: db.users.map((x) => (x.id === u?.id ? { ...x, deletedAt: nowIso() } : x)),
      clients: db.clients.map((c) => (c.id === clientId ? { ...c, status: "removed" } : c)),
      contracts: db.contracts.map((k) => (k.clientId === clientId && k.status !== "cancelled" && k.status !== "completed" ? { ...k, status: "cancelled", cancelledFrom: k.status } : k)),
    };
    next = notify(next, OWNER, `${nameOf(u)} deleted their account.`, `/admin/clients/${clientId}`, { urgent: true });
    next = notify(next, managerUserOf(db, clientId)?.id, `${nameOf(u)} deleted their account. Their work has stopped.`, "/manager/clients");
    return audit(next, "Deleted their account", nameOf(u), "account", nameOf(u));
  });
}

/** C13: the client changes their mind after pulling out, while the contract has not ended. Nothing is refunded. */
export async function stayAfterAll(clientId: string) {
  await delay(700);
  update((db) => {
    let next: Db = {
      ...db,
      contracts: db.contracts.map((k) => (k.clientId === clientId && k.status === "cancelled" ? { ...k, status: k.cancelledFrom ?? "active", cancelledFrom: undefined } : k)),
      cancellations: db.cancellations.map((x) => (x.clientId === clientId && !x.withdrawnAt ? { ...x, withdrawnAt: nowIso() } : x)),
    };
    next = notify(next, OWNER, `${nameOf(clientUser(db, clientId))} changed their mind and is staying.`, `/admin/clients/${clientId}`);
    next = notify(next, managerUserOf(db, clientId)?.id, `${nameOf(clientUser(db, clientId))} is staying after all.`, `/manager/clients/${clientId}`);
    return audit(next, "Withdrew their pull-out and is staying", nameOf(clientUser(db, clientId)), "account", nameOf(clientUser(db, clientId)));
  });
}

/** A client cancels a check-in call. The goals and strategy calls can only be moved, since onboarding needs them. */
export async function cancelCall(callId: string) {
  await delay();
  update((db) => {
    const c = db.calls.find((x) => x.id === callId);
    if (!c) return db;
    const next = { ...db, calls: db.calls.map((x) => (x.id === callId ? { ...x, status: "cancelled" as const } : x)) };
    return notify(next, managerUserOf(db, c.clientId)?.id, `${nameOf(clientUser(db, c.clientId))} cancelled their check-in call.`, "/manager/calls");
  });
}

/** C1: the client asks to move a booked call. The call stays booked until the manager offers a new time. */
export async function askToMoveCall(callId: string) {
  await delay();
  update((db) => {
    const c = db.calls.find((x) => x.id === callId);
    if (!c) return db;
    const name = c.title?.toLowerCase() ?? { goals: "goals call", strategy: "strategy call", "check-in": "check-in call" }[c.kind];
    return notify(db, managerUserOf(db, c.clientId)?.id, `${nameOf(clientUser(db, c.clientId))} asked to move their ${name}. Offer a new time.`, "/manager/calls", { email: true });
  });
}

/** M8: correct an update after sending it. The client is told what changed. */
export async function correctUpdate(updateId: string, headline: string, note: string) {
  await delay();
  update((db) => {
    const u = db.updates.find((x) => x.id === updateId);
    if (!u) return db;
    const next = { ...db, updates: db.updates.map((x) => (x.id === updateId ? { ...x, headline, note, correctedAt: nowIso() } : x)) };
    return notify(next, clientUser(db, u.clientId)?.id, `Your manager corrected your ${u.kind} update.`, `/progress/${u.id}`);
  });
}

/* ---------- Manager: profile ---------- */

export async function saveManagerProfile(managerId: string, patch: { firstName: string; lastName: string; intro: string; timeZone: string }) {
  await delay();
  update((db) => {
    const m = db.managers.find((x) => x.id === managerId);
    return {
      ...db,
      managers: db.managers.map((x) => (x.id === managerId ? { ...x, intro: patch.intro } : x)),
      users: db.users.map((u) => (u.id === m?.userId ? { ...u, firstName: patch.firstName, lastName: patch.lastName, timeZone: patch.timeZone } : u)),
    };
  });
}

export async function setCalendar(managerId: string, on: boolean) {
  await delay(700);
  update((db) => ({ ...db, managers: db.managers.map((x) => (x.id === managerId ? { ...x, calendarConnected: on } : x)) }));
}

/** M1: a short reason for a missed due time. Repeated misses (3 or more this month) go to the owner. */
export async function sendMissedReason(taskId: string, reason: string) {
  await delay();
  update((db) => {
    const t = db.managerTasks.find((x) => x.id === taskId);
    if (!t) return db;
    const m = db.managers.find((x) => x.id === t.managerId);
    const missed = (m?.stats.missed ?? 0) + 1;
    let next: Db = {
      ...db,
      managerTasks: db.managerTasks.map((x) => (x.id === taskId ? { ...x, missed: { reason, at: nowIso() } } : x)),
      managers: db.managers.map((x) => (x.id === t.managerId ? { ...x, stats: { ...x.stats, missed } } : x)),
    };
    if (missed >= 3) next = notify(next, OWNER, `${nameOf(db.users.find((u) => u.id === m?.userId))} has missed ${missed} due times this month.`, `/admin/managers/${t.managerId}`);
    return next;
  });
}

/** M3: the manager confirms what was agreed on the goals call. New off-limits items go to the client's Brand. */
export async function confirmGoalsSummary(clientId: string, summary: { goal: string; audience: string; tone: string; notes?: string; offLimit?: string }) {
  await delay(700);
  update((db) => {
    let next = patchClient(db, clientId, () => ({ goal: summary.goal, onboarding: { audience: summary.audience, tone: summary.tone, notes: summary.notes, confirmedAt: nowIso() } }));
    next = { ...next, strategies: next.strategies.map((s) => (s.clientId === clientId ? { ...s, goal: summary.goal, audience: summary.audience, tone: summary.tone } : s)) };
    if (summary.offLimit) {
      next = { ...next, brands: withBrand(next, clientId).map((b) => (b.clientId === clientId ? { ...b, offLimits: [...b.offLimits, { id: id("o"), kind: "topic" as const, text: summary.offLimit! }] } : b)) };
      next = notify(next, clientUser(db, clientId)?.id, `Added to your off limits after the call: ${summary.offLimit}`, "/brand");
    }
    return log(next, clientId, "team", "setting", "Confirmed the goals call summary");
  });
}

/* ---------- Manager: tasks and content ---------- */

export async function setPostStatus(postId: string, status: PostStatus, patch: Partial<Db["posts"][number]> = {}) {
  await delay();
  update((db) => {
    const p = db.posts.find((x) => x.id === postId);
    // Record when it went to the client or onto the schedule, for "Assigned 6 hours ago" and "Scheduled 6 hours ago".
    const when = new Date().toISOString();
    const stamp = status === "awaiting-client" ? { sentAt: when } : status === "scheduled" ? { scheduledAt: when } : {};
    let next = setPost(db, postId, { status, ...stamp, ...patch });
    if (p && status === "awaiting-client") next = notify(next, clientUser(db, p.clientId)?.id, "A post is ready for your review.", "/content/review");
    if (p && status === "scheduled") {
      next = log(next, p.clientId, "team", "post", `Readied ${short(p.text)} for you to publish`);
      next = notify(next, clientUser(db, p.clientId)?.id, `A post is ready for you to publish${patch.scheduledFor ? ` (best time ${dayTimeIn(patch.scheduledFor)})` : ""}.`, "/content/publish");
    }
    return next;
  });
}

export async function pickIdea(clientId: string, title: string, format: Db["posts"][number]["format"], why: string) {
  await delay(900);
  update((db) => ({
    ...db,
    posts: [{ id: id("p"), clientId, status: "draft", topic: title.split(" ").slice(0, 3).join(" "), format, text: `${title}.\n\nFirst draft, in the client's voice. Direct it below.`, why, version: 1, checks: [] }, ...db.posts],
  }));
}

export async function deletePost(postId: string) {
  await delay();
  update((db) => ({ ...db, posts: db.posts.filter((p) => p.id !== postId) }));
}

export async function setCheck(postId: string, checkId: string, state: "fixed" | "dismissed") {
  await delay(250);
  update((db) => ({ ...db, posts: db.posts.map((p) => (p.id !== postId ? p : { ...p, checks: p.checks?.map((k) => (k.id === checkId ? { ...k, state } : k)) })) }));
}

export async function setLead(leadId: string, status: Db["leads"][number]["status"]) {
  await delay(250);
  update((db) => ({ ...db, leads: db.leads.map((l) => (l.id === leadId ? { ...l, status } : l)) }));
}

/** M6 "Add what you find": the manager pastes a post or profile they checked with their own account. */
export async function addLead(clientId: string, url: string, action: Db["leads"][number]["action"]) {
  await delay(900);
  const person = url.includes("/in/") || url.includes("/company/");
  const drafts: Partial<Record<Db["leads"][number]["action"], string>> = {
    comment: "Great point on settlement times. Our data from cross-border transfers says the same.",
    reshare: "Worth reading if you move money across West Africa. The part on settlement times matches what we see every day.",
    message: "Thanks for connecting. I enjoyed your recent post on payments and would be glad to compare notes.",
    connect: "Hi, I enjoyed your recent post on payments. I would be glad to connect.",
  };
  update((db) => ({
    ...db,
    leads: [
      {
        id: id("l"),
        clientId,
        kind: person ? "person" : "post",
        action,
        name: person ? "New contact" : "New post",
        detail: url,
        url,
        fit: "strong",
        why: "A fintech investor in Lagos, posting about payments infrastructure twice a week. Matches topic 1.",
        draft: drafts[action],
        reaction: action === "react" ? "insightful" : undefined,
        status: "kept",
      },
      ...db.leads,
    ],
  }));
}

/** M6: the manager adjusts the suggestion before it goes out (the text, the reaction, who it is). */
export async function editLead(leadId: string, patch: Partial<Pick<Db["leads"][number], "draft" | "reaction" | "name" | "why">>) {
  await delay();
  update((db) => ({ ...db, leads: db.leads.map((l) => (l.id === leadId ? { ...l, ...patch } : l)) }));
}

/**
 * M6: sends every checked suggestion to the client as quick tasks, one task per kind of action ("Comment on
 * 3 posts", "Follow 2 people"). Returns how many tasks were made.
 */
export async function sendLeads(clientId: string, dueAt: string) {
  await delay(800);
  let made = 0;
  update((db) => {
    const kept = db.leads.filter((l) => l.clientId === clientId && l.status === "kept");
    const byAction = new Map<Db["leads"][number]["action"], typeof kept>();
    kept.forEach((l) => byAction.set(l.action, [...(byAction.get(l.action) ?? []), l]));
    let next = db;
    const ids: string[] = [];
    for (const [action, leads] of byAction) {
      const taskId = id("t");
      ids.push(taskId);
      const base = { id: taskId, clientId, dueAt, done: false, sentAt: nowIso() };
      const task: Db["tasks"][number] =
        action === "connect"
          ? { ...base, kind: "connect", title: `Connect with ${plural(leads.length, "person", "people")}`, people: leads.map((l) => ({ id: id("pp"), name: l.name, role: l.detail.split(" · ")[0], profileUrl: l.url, photo: l.photo, why: l.why, note: l.draft ?? "", done: false })) }
          : {
              ...base,
              kind: action,
              title: engageKinds[action].title(leads.length),
              items: leads.map((l) => ({ id: id("ei"), name: l.name, role: l.detail.split(" · ")[0], photo: l.photo, url: l.url, post: l.post, why: l.why, text: l.draft, reaction: l.reaction, done: false, leadId: l.id })),
            };
      next = { ...next, tasks: [task, ...next.tasks], leads: next.leads.map((l) => (leads.some((x) => x.id === l.id) ? { ...l, status: "sent" as const, taskId } : l)) };
      next = autoHandOver(next, taskId);
    }
    made = ids.length;
    if (!made) return db;
    const first = next.tasks.find((t) => t.id === ids[0])!;
    next = log(next, clientId, "team", "setting", `Prepared ${plural(kept.length, "thing")} for you to do on LinkedIn`);
    return notify(next, clientUser(db, clientId)?.id, made === 1 ? `New quick task: ${first.title}. About ${Math.max(1, Math.round(kept.length / 2))} minutes.` : `${made} new quick tasks: ${plural(kept.length, "thing")} to do on LinkedIn, about ${Math.max(2, Math.round(kept.length / 2))} minutes.`, made === 1 ? `/tasks/${ids[0]}` : "/home#tasks");
  });
  return made;
}

/** C20 Full-service: the team does the checked engagement themselves and records it. No tasks are sent. */
export async function doEngagementForClient(clientId: string) {
  await delay(700);
  update((db) => {
    const kept = db.leads.filter((l) => l.clientId === clientId && l.status === "kept");
    if (!kept.length) return db;
    const who = nameOf(managerUserOf(db, clientId)) || "Your account team";
    let next: Db = { ...db, leads: db.leads.map((l) => (kept.some((k) => k.id === l.id) ? { ...l, status: "done" as const } : l)) };
    next = { ...next, accessLog: [{ id: id("ac"), clientId, who, at: nowIso(), action: `Did ${plural(kept.length, "engagement action")} on your behalf (comments, reactions and follows)`, minutes: Math.max(10, kept.length * 3) }, ...(next.accessLog ?? [])] };
    next = log(next, clientId, "team", "engagement", `Did ${plural(kept.length, "engagement action")} for you`);
    const comments = kept.filter((l) => l.action === "comment").length;
    if (comments) next = countWeek(next, clientId, "comments", comments);
    const connects = kept.filter((l) => l.action === "connect").length;
    if (connects) next = countWeek(next, clientId, "connections", connects);
    return notify(next, clientUser(db, clientId)?.id, `Your team did ${plural(kept.length, "action")} on LinkedIn for you. See your account log.`, "/full-service", { email: false });
  });
}

export async function addAlert(clientId: string, topic: string, url: string) {
  await delay(700);
  update((db) => ({ ...db, alerts: [...db.alerts, { id: id("al"), clientId, topic, url, working: true, lastItemAt: nowIso() }] }));
}

export async function removeAlert(alertId: string) {
  await delay();
  update((db) => ({ ...db, alerts: db.alerts.filter((a) => a.id !== alertId) }));
}

export async function addFinding(clientId: string, text: string) {
  await delay();
  update((db) => ({ ...db, signals: [{ id: id("sg"), clientId, title: text, source: "Found by you", url: text.startsWith("http") ? text : "#", at: nowIso(), topic: "Added by hand" }, ...db.signals] }));
}

export async function removeSignal(signalId: string) {
  await delay(300);
  update((db) => ({ ...db, signals: db.signals.filter((s) => s.id !== signalId) }));
}

export async function sendUpdate(updateId: string, note: string) {
  await delay(700);
  update((db) => {
    const u = db.updates.find((x) => x.id === updateId);
    const next = { ...db, updates: db.updates.map((x) => (x.id === updateId ? { ...x, note, status: "sent" as const, sentAt: nowIso() } : x)) };
    return u ? notify(next, clientUser(db, u.clientId)?.id, `Your ${u.kind} update is ready to read.`, `/progress/${u.id}`) : next;
  });
}

export async function askPermission(clientId: string, text: string, why: string) {
  await delay();
  update((db) => {
    const next: Db = { ...db, requests: [{ id: id("r"), clientId, text, why, at: nowIso(), status: "pending" }, ...db.requests] };
    return notify(next, clientUser(db, clientId)?.id, `Your manager is asking: ${text}`, "/control");
  });
}

export async function cancelRequest(requestId: string) {
  await delay();
  update((db) => ({ ...db, requests: db.requests.filter((r) => r.id !== requestId) }));
}

export async function setSlots(managerId: string, slots: string[]) {
  await delay();
  update((db) => ({ ...db, managers: db.managers.map((m) => (m.id === managerId ? { ...m, slots } : m)) }));
}

export async function rescheduleCall(callId: string) {
  await delay();
  update((db) => {
    const c = db.calls.find((x) => x.id === callId);
    const next: Db = { ...db, calls: db.calls.map((x) => (x.id === callId ? { ...x, status: "cancelled" } : x)) };
    return c ? notify(next, clientUser(db, c.clientId)?.id, "Your manager needs to move your call. Pick a new time.", "/setup/calls", { urgent: true }) : next;
  });
}

/* ---------- Owner ---------- */

export async function assignManager(clientId: string, managerId: string) {
  await delay(600);
  update((db) => {
    const mu = db.users.find((u) => u.id === db.managers.find((x) => x.id === managerId)?.userId);
    let next = patchClient(db, clientId, () => ({ managerId }));
    next = audit(next, `Assigned ${nameOf(mu)}`, nameOf(clientUser(db, clientId)), "assignment");
    next = notify(next, mu?.id, `You have a new client: ${nameOf(clientUser(db, clientId))}.`, `/manager/clients/${clientId}`);
    return notify(next, clientUser(db, clientId)?.id, `Meet ${mu?.firstName}, your account manager.`, "/home");
  });
}

export function setCovering(managerId: string | null) {
  update((db) => {
    const next = { ...db, session: { ...db.session, coveringManagerId: managerId } };
    const mu = db.users.find((u) => u.id === db.managers.find((x) => x.id === (managerId ?? db.session.coveringManagerId))?.userId);
    return audit(next, managerId ? `Started covering for ${nameOf(mu)}` : `Stopped covering for ${nameOf(mu)}`, nameOf(mu), "step-in");
  });
}

export async function decideRefund(refundId: string, approve: boolean, reason?: string) {
  await delay(700);
  update((db) => {
    const r = db.refunds.find((x) => x.id === refundId);
    let next: Db = { ...db, refunds: db.refunds.map((x) => (x.id === refundId ? { ...x, status: approve ? "approved" : "declined" } : x)) };
    if (!r) return next;
    next = audit(next, `${approve ? "Approved" : "Declined"} a refund${reason ? `: ${reason}` : ""}`, nameOf(clientUser(db, r.clientId)), "refund");
    return notify(next, clientUser(db, r.clientId)?.id, approve ? "Your refund is approved. It reaches your card in 5 to 10 days." : "We could not approve your refund. We have emailed you why.", "/contract");
  });
}

export async function resolveComplaint(complaintId: string, outcome: string) {
  await delay(600);
  update((db) => {
    const c = db.complaints.find((x) => x.id === complaintId);
    const next: Db = {
      ...db,
      complaints: db.complaints.map((x) => (x.id === complaintId ? { ...x, status: "resolved", outcome, timeline: [...x.timeline, { at: nowIso(), text: `Resolved: ${outcome}`, who: "owner" }] } : x)),
    };
    return c ? notify(next, clientUser(db, c.clientId)?.id, `Your complaint is resolved: ${outcome.toLowerCase()}.`, "/control/complaint") : next;
  });
}

export async function resolveChangeRequest(requestId: string, managerId: string) {
  await delay(700);
  update((db) => {
    const r = db.changeRequests.find((x) => x.id === requestId);
    if (!r) return db;
    const next: Db = { ...db, changeRequests: db.changeRequests.map((x) => (x.id === requestId ? { ...x, status: "done" } : x)) };
    return next;
  });
  const r = getDb().changeRequests.find((x) => x.id === requestId);
  if (r) await assignManager(r.clientId, managerId);
}

export async function markTrainingDone(managerId: string) {
  await delay();
  update((db) => {
    const mu = db.users.find((u) => u.id === db.managers.find((x) => x.id === managerId)?.userId);
    const next = audit({ ...db, managers: db.managers.map((m) => (m.id === managerId ? { ...m, status: "active" } : m)) }, "Marked training done", nameOf(mu), "account");
    return notify(next, mu?.id, "Your training is done. You can now be given clients.", "/manager");
  });
}

export async function inviteManager(firstName: string, lastName: string, email: string) {
  await delay(700);
  const uid = id("u");
  update((db) =>
    audit(
      {
        ...db,
        users: [...db.users, { id: uid, role: "manager", firstName, lastName, email, title: "Account manager", timeZone: "Africa/Lagos", twoStep: false }],
        managers: [...db.managers, { id: id("m"), userId: uid, status: "invited", intro: "", maxClients: 10, industries: [], inviteToken: id("inv"), inviteExpiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString(), stats: { onTime: 0, firstTimeApproval: 0, missed: 0, complaints: 0 } }],
      },
      `Invited ${firstName} ${lastName} as a manager`,
      "Managers",
      "account",
    ),
  );
}

export async function resendInvite(managerId: string) {
  await delay();
  update((db) => ({ ...db, managers: db.managers.map((m) => (m.id === managerId ? { ...m, inviteExpiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString() } : m)) }));
}

export async function revokeInvite(managerId: string) {
  await delay();
  update((db) => {
    const m = db.managers.find((x) => x.id === managerId);
    const u = db.users.find((x) => x.id === m?.userId);
    return audit({ ...db, managers: db.managers.filter((x) => x.id !== managerId), users: db.users.filter((x) => x.id !== m?.userId) }, `Withdrew the invite for ${nameOf(u)}`, "Managers", "account");
  });
}

export async function suspendManager(managerId: string) {
  await delay(800);
  update((db) => {
    const mu = db.users.find((u) => u.id === db.managers.find((x) => x.id === managerId)?.userId);
    let next: Db = { ...db, managers: db.managers.map((m) => (m.id === managerId ? { ...m, status: "suspended" } : m)), clients: db.clients.map((c) => (c.managerId === managerId ? { ...c, managerId: null } : c)) };
    next = audit(next, `Suspended ${nameOf(mu)}. Their clients need a new manager.`, nameOf(mu), "account");
    return next;
  });
}

export async function reinstateManager(managerId: string) {
  await delay();
  update((db) => {
    const mu = db.users.find((u) => u.id === db.managers.find((x) => x.id === managerId)?.userId);
    const next = audit({ ...db, managers: db.managers.map((m) => (m.id === managerId ? { ...m, status: "active" } : m)) }, `Reinstated ${nameOf(mu)}`, nameOf(mu), "account");
    return notify(next, mu?.id, "Your access is back. Sign in to see your training and clients.", "/manager", { email: true });
  });
}

export async function saveSettings(settings: Db["settings"]) {
  await delay(700);
  update((db) => audit({ ...db, settings }, "Changed settings", "Settings", "setting"));
}

export async function saveFrameworkItem(itemId: string, body: string) {
  await delay();
  update((db) => ({ ...db, framework: db.framework.map((f) => (f.id === itemId ? { ...f, body, updatedAt: nowIso() } : f)) }));
}

export async function addFrameworkItem(section: Db["framework"][number]["section"], title: string, body: string) {
  await delay();
  update((db) => ({ ...db, framework: [...db.framework, { id: id("f"), section, title, body, updatedAt: nowIso() }] }));
}

export async function deleteFrameworkItem(itemId: string) {
  await delay();
  update((db) => ({ ...db, framework: db.framework.filter((f) => f.id !== itemId) }));
}

export async function publishFramework(note: string) {
  await delay(800);
  update((db) => {
    const n = Number(db.frameworkVersions[0]?.version.slice(1) ?? 0) + 1;
    return audit({ ...db, frameworkVersions: [{ version: `v${n}`, at: nowIso(), note }, ...db.frameworkVersions] }, `Published framework v${n}`, "Framework", "setting");
  });
}

export async function extendContract(contractId: string, kind: "extend" | "credit", amount: number, note: string) {
  await delay(700);
  update((db) => {
    const k = db.contracts.find((x) => x.id === contractId);
    if (!k) return db;
    const next: Db =
      kind === "extend"
        ? { ...db, contracts: db.contracts.map((x) => (x.id === contractId ? { ...x, endsAt: new Date(new Date(x.endsAt).getTime() + amount * 30 * 86_400_000).toISOString() } : x)) }
        : db;
    return notify(
      audit(next, kind === "extend" ? `Extended the contract by ${amount} month${amount === 1 ? "" : "s"}: ${note}` : `Added a credit of $${amount}: ${note}`, nameOf(clientUser(db, k.clientId)), "refund"),
      clientUser(db, k.clientId)?.id,
      kind === "extend" ? `Your contract has been extended by ${amount} month${amount === 1 ? "" : "s"}, at no cost.` : `A credit of $${amount} has been added to your account.`,
      "/contract",
    );
  });
}

/** Demo only: which client the "Client" view shows. */
export function setDemoClient(userId: string) {
  update((db) => ({ ...db, session: { ...db.session, role: "client", userIds: { ...db.session.userIds, client: userId } } }));
}

/** Demo only: view the product as this person (their role and their account), so the owner can open the page a message sent them to. */
export function viewAs(userId: string) {
  update((db) => {
    const user = db.users.find((u) => u.id === userId);
    if (!user) return db;
    return { ...db, session: { ...db.session, role: user.role, userIds: { ...db.session.userIds, [user.role]: userId } } };
  });
}

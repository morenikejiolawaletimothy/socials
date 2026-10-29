"use client";

import { delay, getDb, update } from "./store";
import type { Activity, Client, Db, Message, Permissions, PostStatus, ReviewSettings, SetupStep } from "./types";

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

/** Adds a notification for one person. `email` marks the ones the real app also emails. */
function notify(db: Db, userId: string | undefined, text: string, href: string, opts: { email?: boolean; urgent?: boolean } = {}): Db {
  if (!userId) return db;
  return { ...db, notifications: [{ id: id("n"), userId, text, href, createdAt: nowIso(), read: false, email: opts.email ?? true, urgent: opts.urgent }, ...db.notifications] };
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
    return notify(next, managerUserOf(db, p.clientId)?.id, `${clientUser(db, p.clientId)?.firstName} approved ${short(p.text)}. Schedule it.`, `/manager/clients/${p.clientId}/content?tab=schedule`, { email: false });
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
    return first ? notify(next, managerUserOf(db, first.clientId)?.id, `${clientUser(db, first.clientId)?.firstName} approved ${postIds.length} posts. Schedule them.`, `/manager/clients/${first.clientId}/content?tab=schedule`, { email: false }) : next;
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
    const next = setPost(db, postId, { text, status: "awaiting-client", scheduledFor: undefined, version: (p.version ?? 1) + 1, dueAt: new Date(Date.now() + 2 * 86_400_000).toISOString() });
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
    return notify(next, managerUserOf(db, p.clientId)?.id, future ? `${clientUser(db, p.clientId)?.firstName} put a post back on the schedule.` : `${clientUser(db, p.clientId)?.firstName} wants a stopped post to go out. Pick a new time.`, `/manager/clients/${p.clientId}/content?tab=${future ? "scheduled" : "schedule"}`);
  });
}

/* ---------- Client: quick tasks ---------- */

export async function togglePersonSent(taskId: string, personId: string) {
  await delay(250);
  update((db) => ({
    ...db,
    tasks: db.tasks.map((t) => (t.id !== taskId ? t : { ...t, people: t.people?.map((p) => (p.id === personId ? { ...p, done: !p.done } : p)) })),
  }));
}

export async function editPersonNote(taskId: string, personId: string, note: string) {
  await delay();
  update((db) => ({
    ...db,
    tasks: db.tasks.map((t) => (t.id !== taskId ? t : { ...t, people: t.people?.map((p) => (p.id === personId ? { ...p, note } : p)) })),
  }));
}

export async function markTaskDone(taskId: string, done = true) {
  await delay(300);
  update((db) => ({ ...db, tasks: db.tasks.map((t) => (t.id === taskId ? { ...t, done } : t)) }));
}

/** C17: email the task list to an assistant. Phase 2 sends it with Resend. */
export async function sendToAssistant(taskId: string, email: string) {
  await delay(700);
  return { taskId, email };
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

export async function sendMessage(clientId: string, fromUserId: string, body: Pick<Message, "text" | "file" | "voice">, asTeam = false) {
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

export async function saveFileToBrand(messageId: string) {
  await delay();
  update((db) => {
    const m = db.messages.find((x) => x.id === messageId);
    if (!m?.file) return db;
    const section = m.file.kind === "image" ? "photos" : "documents";
    return {
      ...db,
      messages: db.messages.map((x) => (x.id === messageId ? { ...x, savedToBrand: true } : x)),
      brandFiles: [{ id: id("b"), clientId: m.clientId, section, name: m.file.name, src: m.file.src, size: m.file.size, at: nowIso() }, ...db.brandFiles],
    };
  });
}

/* ---------- Client: control ---------- */

const permissionLabels: Record<keyof Permissions, string> = {
  post: "Post for me",
  engage: "Like and comment for me",
  companyPage: "Post to my company Page",
  connectionDrafts: "Draft connection requests",
  profileDrafts: "Draft profile updates",
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
    const next = log(patchClient(db, clientId, () => ({ review })), clientId, "you", "setting", "Changed how you review");
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

export async function addMoment(clientId: string, note: string, photos: string[]) {
  await delay(600);
  update((db) => {
    const next: Db = { ...db, moments: [{ id: id("mo"), clientId, note, photos, at: nowIso(), status: "new" }, ...db.moments] };
    return notify(next, managerUserOf(db, clientId)?.id, `${clientUser(db, clientId)?.firstName} added a new Moment.`, `/manager/clients/${clientId}?tab=brand`);
  });
}

export async function deleteMoment(momentId: string) {
  await delay();
  update((db) => ({ ...db, moments: db.moments.filter((m) => m.id !== momentId) }));
}

export async function addBrandFile(clientId: string, section: "photos" | "logos" | "documents", name: string, size: string, src?: string) {
  await delay(900);
  update((db) => ({ ...db, brandFiles: [{ id: id("b"), clientId, section, name, size, src, at: nowIso() }, ...db.brandFiles] }));
}

export async function removeBrandFile(fileId: string) {
  await delay();
  update((db) => ({ ...db, brandFiles: db.brandFiles.filter((f) => f.id !== fileId) }));
}

/* ---------- Client: setup (C2 to C6) ---------- */

const stepOrder: SetupStep[] = ["linkedin", "permissions", "goals-call", "strategy-call", "plan", "review"];

export async function completeSetupStep(clientId: string, step: SetupStep) {
  await delay(300);
  update((db) => {
    const next = patchClient(db, clientId, (c) => {
      const done = c.setupDone.includes(step) ? c.setupDone : stepOrder.filter((s) => s === step || c.setupDone.includes(s));
      const finished = done.length === stepOrder.length;
      return {
        setupDone: done,
        setupProgress: Math.round((done.length / stepOrder.length) * 100),
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
      invoices: k ? [{ id: id("i"), clientId, number: `BC-${1200 + db.invoices.length}`, amountCents: k.monthlyCents, at: nowIso(), status: "paid", label: `Month 1 of ${k.months}` }, ...db.invoices] : db.invoices,
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

export async function saveProfile(userId: string, patch: { firstName?: string; lastName?: string; timeZone?: string; title?: string }) {
  await delay();
  update((db) => ({ ...db, users: db.users.map((u) => (u.id === userId ? { ...u, ...patch } : u)) }));
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

export async function moveTask(taskId: string, column: Db["managerTasks"][number]["column"]) {
  await delay(250);
  update((db) => ({ ...db, managerTasks: db.managerTasks.map((t) => (t.id === taskId ? { ...t, column } : t)) }));
}

export async function setPostStatus(postId: string, status: PostStatus, patch: Partial<Db["posts"][number]> = {}) {
  await delay();
  update((db) => {
    const p = db.posts.find((x) => x.id === postId);
    let next = setPost(db, postId, { status, ...patch });
    if (p && status === "awaiting-client") next = notify(next, clientUser(db, p.clientId)?.id, "A post is ready for your review.", "/content/review");
    if (p && status === "scheduled") next = log(next, p.clientId, "team", "post", `Scheduled ${short(p.text)}`);
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

export async function addLead(clientId: string, url: string) {
  await delay(900);
  update((db) => ({
    ...db,
    leads: [
      { id: id("l"), clientId, kind: url.includes("/in/") ? "person" : "post", name: url.includes("/in/") ? "New contact" : "New post", detail: url, url, fit: "strong", why: "A fintech investor in Lagos, posting about payments infrastructure twice a week. Matches topic 1.", draft: "Great point on settlement times. Our data from cross-border transfers says the same.", status: "kept" },
      ...db.leads,
    ],
  }));
}

export async function prepareConnections(clientId: string) {
  await delay(900);
  update((db) => {
    const next: Db = {
      ...db,
      tasks: [
        {
          id: id("t"),
          clientId,
          kind: "connect",
          title: "Connect with 3 people this week",
          dueAt: new Date(Date.now() + 4 * 86_400_000).toISOString(),
          done: false,
          sentAt: nowIso(),
          people: [
            { id: id("pp"), name: "Bola Adeyemi", role: "Partner, Lagos Growth Capital", profileUrl: "https://www.linkedin.com/in/example-bola", why: "Invests in payments, active this week.", note: "Hi Bola, I enjoyed your post on payments. Would be glad to connect.", done: false },
            { id: id("pp"), name: "Esi Owusu", role: "Head of partnerships, Accra Pay", profileUrl: "https://www.linkedin.com/in/example-esi", why: "Possible partner for the Ghana corridor.", note: "Hi Esi, we are building faster Lagos to Accra payments. Glad to connect.", done: false },
            { id: id("pp"), name: "Ifeoma Nnaji", role: "Editor, Business Day", profileUrl: "https://www.linkedin.com/in/example-ifeoma", why: "Covers fintech policy.", note: "Hi Ifeoma, I read your fintech coverage closely. Happy to connect.", done: false },
          ],
        },
        ...db.tasks,
      ],
    };
    return notify(next, clientUser(db, clientId)?.id, "3 people to connect with this week. About 2 minutes.", "/home");
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

export async function approvePayout(payoutId: string) {
  await delay();
  update((db) => audit({ ...db, payouts: db.payouts.map((p) => (p.id === payoutId ? { ...p, status: "approved" } : p)) }, "Approved a payout", "Payouts", "refund"));
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

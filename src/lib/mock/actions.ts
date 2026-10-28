"use client";

import { delay, update } from "./store";
import type { Activity, Client, Db, Message, Permissions, PostStatus, ReviewSettings, SetupStep } from "./types";

// Every change a screen can make. Phase 2 swaps each body for an API call; screens keep calling the same names.

const id = (p: string) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const nowIso = () => new Date().toISOString();

function log(db: Db, clientId: string, who: Activity["who"], kind: Activity["kind"], text: string): Db {
  return { ...db, activity: [{ id: id("a"), clientId, who, kind, text, at: nowIso() }, ...db.activity] };
}

function patchClient(db: Db, clientId: string, fn: (c: Client) => Partial<Client>): Db {
  return { ...db, clients: db.clients.map((c) => (c.id === clientId ? { ...c, ...fn(c) } : c)) };
}

function setPost(db: Db, postId: string, patch: Partial<Db["posts"][number]>): Db {
  return { ...db, posts: db.posts.map((p) => (p.id === postId ? { ...p, ...patch } : p)) };
}

const short = (text: string) => `"${text.split("\n")[0].slice(0, 60)}${text.length > 60 ? "..." : ""}"`;

/* ---------- Client: content ---------- */

export async function approvePost(postId: string) {
  await delay(250);
  update((db) => {
    const p = db.posts.find((x) => x.id === postId);
    if (!p) return db;
    return log(setPost(db, postId, { status: "approved" }), p.clientId, "you", "post", `Approved ${short(p.text)}`);
  });
}

export async function approveAll(postIds: string[]) {
  await delay(400);
  update((db) => {
    let next = db;
    for (const pid of postIds) {
      const p = next.posts.find((x) => x.id === pid);
      if (!p) continue;
      next = log(setPost(next, pid, { status: "approved" }), p.clientId, "you", "post", `Approved ${short(p.text)}`);
    }
    return next;
  });
}

export async function askForChanges(postId: string, text: string, voice = false) {
  await delay(300);
  update((db) => {
    const p = db.posts.find((x) => x.id === postId);
    if (!p) return db;
    const next = setPost(db, postId, { status: "changes-requested", feedback: [...(p.feedback ?? []), { text, at: nowIso(), voice }] });
    return log(next, p.clientId, "you", "post", `Asked for changes on ${short(p.text)}`);
  });
}

export async function takeDown(postId: string) {
  await delay(500);
  update((db) => {
    const p = db.posts.find((x) => x.id === postId);
    if (!p) return db;
    return log(setPost(db, postId, { status: "taken-down" }), p.clientId, "you", "post", `Took down ${short(p.text)}`);
  });
}

export async function askForFix(postId: string, text: string) {
  await delay(300);
  update((db) => {
    const p = db.posts.find((x) => x.id === postId);
    if (!p) return db;
    return log(setPost(db, postId, { fixRequested: text }), p.clientId, "you", "post", `Asked for a fix on ${short(p.text)}`);
  });
}

/* ---------- Client: quick tasks ---------- */

export function togglePersonSent(taskId: string, personId: string) {
  update((db) => ({
    ...db,
    tasks: db.tasks.map((t) =>
      t.id !== taskId ? t : { ...t, people: t.people?.map((p) => (p.id === personId ? { ...p, done: !p.done } : p)) },
    ),
  }));
}

export function editPersonNote(taskId: string, personId: string, note: string) {
  update((db) => ({
    ...db,
    tasks: db.tasks.map((t) => (t.id !== taskId ? t : { ...t, people: t.people?.map((p) => (p.id === personId ? { ...p, note } : p)) })),
  }));
}

export async function markTaskDone(taskId: string, done = true) {
  await delay(200);
  update((db) => ({ ...db, tasks: db.tasks.map((t) => (t.id === taskId ? { ...t, done } : t)) }));
}

/** C17: email the task list to an assistant. Phase 2 sends it with Resend. */
export async function sendToAssistant(taskId: string, email: string) {
  await delay(500);
  return { taskId, email };
}

/** C9: the client adds a result (a lead, an invitation, an offer) to their latest update. */
export async function addResult(clientId: string, text: string) {
  await delay(300);
  update((db) => {
    const latest = db.updates.filter((u) => u.clientId === clientId && u.status === "sent").sort((a, b) => (b.sentAt ?? "").localeCompare(a.sentAt ?? ""))[0];
    if (!latest) return db;
    return { ...db, updates: db.updates.map((u) => (u.id === latest.id ? { ...u, results: [...(u.results ?? []), text] } : u)) };
  });
}

/* ---------- Messages ---------- */

export async function sendMessage(clientId: string, fromUserId: string, body: Pick<Message, "text" | "file" | "voice">, asTeam = false) {
  await delay(200);
  update((db) => ({ ...db, messages: [...db.messages, { id: id("ms"), clientId, fromUserId, at: nowIso(), asTeam, ...body }] }));
}

export async function saveFileToBrand(messageId: string) {
  await delay(300);
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

export function setPermission(clientId: string, key: keyof Permissions, value: boolean) {
  const labels: Record<keyof Permissions, string> = {
    post: "Post for me",
    engage: "Like and comment for me",
    companyPage: "Post to my company Page",
    connectionDrafts: "Draft connection requests",
    profileDrafts: "Draft profile updates",
  };
  update((db) =>
    log(patchClient(db, clientId, (c) => ({ permissions: { ...c.permissions, [key]: value } })), clientId, "you", "setting", `Turned ${value ? "on" : "off"} "${labels[key]}"`),
  );
}

export async function saveReview(clientId: string, review: ReviewSettings) {
  await delay(300);
  update((db) => log(patchClient(db, clientId, () => ({ review })), clientId, "you", "setting", "Changed how you review"));
}

export async function setPostingPaused(clientId: string, paused: boolean) {
  await delay(300);
  update((db) => {
    let next = patchClient(db, clientId, () => ({ postingPaused: paused }));
    next = {
      ...next,
      posts: next.posts.map((p) =>
        p.clientId !== clientId ? p : paused && p.status === "scheduled" ? { ...p, status: "on-hold" as PostStatus, heldReason: "You paused posting." } : !paused && p.heldReason === "You paused posting." ? { ...p, status: "scheduled" as PostStatus, heldReason: undefined } : p,
      ),
    };
    return log(next, clientId, "you", "setting", paused ? "Paused all posting" : "Turned posting back on");
  });
}

export async function setLinkedIn(clientId: string, state: Client["linkedin"]) {
  await delay(600);
  update((db) => log(patchClient(db, clientId, () => ({ linkedin: state })), clientId, "you", "account", state === "connected" ? "Connected LinkedIn" : "Disconnected LinkedIn"));
}

export async function answerRequest(requestId: string, approve: boolean) {
  await delay(250);
  update((db) => {
    const r = db.requests.find((x) => x.id === requestId);
    if (!r) return db;
    const next = { ...db, requests: db.requests.map((x) => (x.id === requestId ? { ...x, status: approve ? ("approved" as const) : ("declined" as const) } : x)) };
    return log(next, r.clientId, "you", "setting", `${approve ? "Approved" : "Declined"}: ${r.text}`);
  });
}

export async function raiseComplaint(clientId: string, kind: Db["complaints"][number]["kind"], text: string) {
  await delay(400);
  update((db) => ({
    ...db,
    complaints: [{ id: id("cp"), clientId, kind, text, at: nowIso(), status: "open", timeline: [{ at: nowIso(), text: "Complaint raised", who: "client" }] }, ...db.complaints],
  }));
}

/* ---------- Client: brand ---------- */

export function addOffLimit(clientId: string, kind: Db["brands"][number]["offLimits"][number]["kind"], text: string) {
  update((db) => ({
    ...db,
    brands: db.brands.map((b) => (b.clientId === clientId ? { ...b, offLimits: [...b.offLimits, { id: id("o"), kind, text }] } : b)),
  }));
}

export function removeOffLimit(clientId: string, offId: string) {
  update((db) => ({ ...db, brands: db.brands.map((b) => (b.clientId === clientId ? { ...b, offLimits: b.offLimits.filter((o) => o.id !== offId) } : b)) }));
}

export async function saveVoice(clientId: string, voice: string, wordsUse: string[], wordsAvoid: string[]) {
  await delay(300);
  update((db) => ({ ...db, brands: db.brands.map((b) => (b.clientId === clientId ? { ...b, voice, wordsUse, wordsAvoid } : b)) }));
}

export async function addMoment(clientId: string, note: string, photos: string[]) {
  await delay(400);
  update((db) => ({ ...db, moments: [{ id: id("mo"), clientId, note, photos, at: nowIso(), status: "new" }, ...db.moments] }));
}

export async function addBrandFile(clientId: string, section: "photos" | "logos" | "documents", name: string, size: string, src?: string) {
  await delay(400);
  update((db) => ({ ...db, brandFiles: [{ id: id("b"), clientId, section, name, size, src, at: nowIso() }, ...db.brandFiles] }));
}

export function removeBrandFile(fileId: string) {
  update((db) => ({ ...db, brandFiles: db.brandFiles.filter((f) => f.id !== fileId) }));
}

/* ---------- Client: setup (C2 to C6) ---------- */

const stepOrder: SetupStep[] = ["linkedin", "permissions", "goals-call", "strategy-call", "plan", "review"];

export function completeSetupStep(clientId: string, step: SetupStep) {
  update((db) =>
    patchClient(db, clientId, (c) => {
      const done = c.setupDone.includes(step) ? c.setupDone : stepOrder.filter((s) => s === step || c.setupDone.includes(s));
      const finished = done.length === stepOrder.length;
      return {
        setupDone: done,
        setupProgress: Math.round((done.length / stepOrder.length) * 100),
        ...(finished && c.status === "setting-up" ? { status: "free" as const, stage: "calls" as const } : {}),
      };
    }),
  );
}

export async function bookCall(clientId: string, kind: "goals" | "strategy", at: string, recording: boolean) {
  await delay(400);
  update((db) => {
    const c = db.clients.find((x) => x.id === clientId);
    const managerId = c?.managerId ?? "m-ada";
    const calls = db.calls.filter((x) => !(x.clientId === clientId && x.kind === kind && x.status === "booked"));
    return { ...db, calls: [...calls, { id: id("cl"), clientId, managerId, kind, at, minutes: 30, meetUrl: "https://meet.google.com/example-new", recording, status: "booked" }] };
  });
  completeSetupStep(clientId, kind === "goals" ? "goals-call" : "strategy-call");
}

export async function signContract(clientId: string, months: 3 | 6 | 12, monthlyCents: number, signedName: string) {
  await delay(500);
  const DAY = 86_400_000;
  const now = Date.now();
  update((db) => ({
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
  }));
}

export async function payNow(clientId: string) {
  await delay(900);
  update((db) => {
    const k = db.contracts.find((x) => x.clientId === clientId);
    let next: Db = {
      ...db,
      contracts: db.contracts.map((x) => (x.clientId === clientId ? { ...x, paid: true, card: { brand: "Visa", last4: "4242" }, status: x.status === "paused" ? "active" : x.status } : x)),
      invoices: k
        ? [{ id: id("i"), clientId, number: `BC-${1200 + db.invoices.length}`, amountCents: k.monthlyCents, at: nowIso(), status: "paid", label: `Month 1 of ${k.months}` }, ...db.invoices]
        : db.invoices,
    };
    const c = next.clients.find((x) => x.id === clientId);
    if (c?.status === "paused") {
      next = patchClient(next, clientId, () => ({ status: "active", pausedReason: undefined, pausedAt: undefined }));
      next = { ...next, posts: next.posts.map((p) => (p.clientId === clientId && p.status === "on-hold" ? { ...p, status: "scheduled" } : p)) };
      next = log(next, clientId, "system", "account", "Account reactivated after payment");
    }
    return next;
  });
}

export async function approveStrategy(clientId: string) {
  await delay(400);
  update((db) => {
    let next: Db = { ...db, strategies: db.strategies.map((s) => (s.clientId === clientId ? { ...s, status: "approved", approvedAt: nowIso() } : s)) };
    next = patchClient(next, clientId, () => ({ stage: "running" }));
    return log(next, clientId, "you", "account", "Approved your strategy");
  });
}

export async function askStrategyChange(clientId: string, note: string) {
  await delay(300);
  update((db) => ({ ...db, strategies: db.strategies.map((s) => (s.clientId === clientId ? { ...s, status: "change-asked", changeNote: note } : s)) }));
}

/* ---------- Client: contract ---------- */

export async function cancelContract(clientId: string, reason: string, note?: string) {
  await delay(600);
  update((db) => ({
    ...db,
    contracts: db.contracts.map((k) => (k.clientId === clientId ? { ...k, status: "cancelled" } : k)),
    cancellations: [{ id: id("x"), clientId, reason, note, at: nowIso() }, ...db.cancellations],
  }));
}

export async function requestManagerChange(clientId: string, reason: string) {
  await delay(300);
  update((db) => ({ ...db, changeRequests: [{ id: id("cr"), clientId, reason, at: nowIso(), status: "open" }, ...db.changeRequests] }));
}

/* ---------- Manager ---------- */

export function moveTask(taskId: string, column: Db["managerTasks"][number]["column"]) {
  update((db) => ({ ...db, managerTasks: db.managerTasks.map((t) => (t.id === taskId ? { ...t, column } : t)) }));
}

export async function setPostStatus(postId: string, status: PostStatus, patch: Partial<Db["posts"][number]> = {}) {
  await delay(250);
  update((db) => setPost(db, postId, { status, ...patch }));
}

export function setCheck(postId: string, checkId: string, state: "fixed" | "dismissed") {
  update((db) => ({
    ...db,
    posts: db.posts.map((p) => (p.id !== postId ? p : { ...p, checks: p.checks?.map((k) => (k.id === checkId ? { ...k, state } : k)) })),
  }));
}

export function setLead(leadId: string, status: Db["leads"][number]["status"]) {
  update((db) => ({ ...db, leads: db.leads.map((l) => (l.id === leadId ? { ...l, status } : l)) }));
}

export function addAlert(clientId: string, topic: string, url: string) {
  update((db) => ({ ...db, alerts: [...db.alerts, { id: id("al"), clientId, topic, url, working: true, lastItemAt: nowIso() }] }));
}

export function removeAlert(alertId: string) {
  update((db) => ({ ...db, alerts: db.alerts.filter((a) => a.id !== alertId) }));
}

export async function sendUpdate(updateId: string, note: string) {
  await delay(400);
  update((db) => ({ ...db, updates: db.updates.map((u) => (u.id === updateId ? { ...u, note, status: "sent", sentAt: nowIso() } : u)) }));
}

export async function askPermission(clientId: string, text: string, why: string) {
  await delay(300);
  update((db) => ({ ...db, requests: [{ id: id("r"), clientId, text, why, at: nowIso(), status: "pending" }, ...db.requests] }));
}

export async function setSlots(managerId: string, slots: string[]) {
  await delay(300);
  update((db) => ({ ...db, managers: db.managers.map((m) => (m.id === managerId ? { ...m, slots } : m)) }));
}

/* ---------- Owner ---------- */

export async function assignManager(clientId: string, managerId: string) {
  await delay(400);
  update((db) => {
    const m = db.managers.find((x) => x.id === managerId);
    const mu = db.users.find((u) => u.id === m?.userId);
    const cu = db.users.find((u) => u.id === db.clients.find((c) => c.id === clientId)?.userId);
    return {
      ...patchClient(db, clientId, () => ({ managerId })),
      audit: [{ id: id("au"), who: "Fola Morenikeji", action: `Assigned ${mu?.firstName} ${mu?.lastName}`, target: `${cu?.firstName} ${cu?.lastName}`, at: nowIso(), kind: "assignment" }, ...db.audit],
    };
  });
}

export function setCovering(managerId: string | null) {
  update((db) => ({ ...db, session: { ...db.session, coveringManagerId: managerId } }));
}

export async function decideRefund(refundId: string, approve: boolean) {
  await delay(400);
  update((db) => ({ ...db, refunds: db.refunds.map((r) => (r.id === refundId ? { ...r, status: approve ? "approved" : "declined" } : r)) }));
}

export async function resolveComplaint(complaintId: string, outcome: string) {
  await delay(400);
  update((db) => ({
    ...db,
    complaints: db.complaints.map((c) => (c.id === complaintId ? { ...c, status: "resolved", outcome, timeline: [...c.timeline, { at: nowIso(), text: `Resolved: ${outcome}`, who: "owner" }] } : c)),
  }));
}

export async function markTrainingDone(managerId: string) {
  await delay(300);
  update((db) => ({ ...db, managers: db.managers.map((m) => (m.id === managerId ? { ...m, status: "active" } : m)) }));
}

export async function inviteManager(firstName: string, lastName: string, email: string) {
  await delay(400);
  const uid = id("u");
  update((db) => ({
    ...db,
    users: [...db.users, { id: uid, role: "manager", firstName, lastName, email, title: "Account manager", timeZone: "Africa/Lagos", twoStep: false }],
    managers: [...db.managers, { id: id("m"), userId: uid, status: "invited", intro: "", maxClients: 10, industries: [], inviteToken: id("inv"), inviteExpiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString(), stats: { onTime: 0, firstTimeApproval: 0, missed: 0, complaints: 0 } }],
  }));
}

export async function approvePayout(payoutId: string) {
  await delay(300);
  update((db) => ({ ...db, payouts: db.payouts.map((p) => (p.id === payoutId ? { ...p, status: "approved" } : p)) }));
}

export async function saveSettings(settings: Db["settings"]) {
  await delay(400);
  update((db) => ({ ...db, settings, audit: [{ id: id("au"), who: "Fola Morenikeji", action: "Changed settings", target: "Settings", at: nowIso(), kind: "setting" }, ...db.audit] }));
}

export async function saveFrameworkItem(itemId: string, body: string) {
  await delay(300);
  update((db) => ({ ...db, framework: db.framework.map((f) => (f.id === itemId ? { ...f, body, updatedAt: nowIso() } : f)) }));
}

/** Demo only: which client the "Client" view shows. */
export function setDemoClient(userId: string) {
  update((db) => ({ ...db, session: { ...db.session, role: "client", userIds: { ...db.session.userIds, client: userId } } }));
}

"use client";

import { AGREEMENT_VERSION } from "../amAgreement";
import { delay, getDb, update } from "./store";
import type { Db, Role } from "./types";

// Demo sign-up and sign-in. No real passwords or emails; Phase 2 replaces this with Supabase Auth.

export type AuthResult = { ok: true; role: Role; needsCode?: boolean } | { ok: false; field?: string; message: string };

const home: Record<Role, string> = { client: "/home", manager: "/manager", owner: "/admin" };
export const homeFor = (role: Role) => home[role];

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : "");

/**
 * #43: what we read from a LinkedIn URL. `/in/` is a person (name/photo), `/company/` is a business.
 * Phase 1 mocks this from the URL slug; Phase 2 calls Bright Data and returns the real profile and photo.
 */
export type LinkedInProfile = { kind: "person"; firstName: string; lastName: string; photo?: string } | { kind: "company"; company: string; photo?: string };

/** Pull a name (or company) from a LinkedIn URL. Returns null for anything that is not a readable /in/ or /company/ link. */
export function extractLinkedIn(url: string): LinkedInProfile | null {
  const u = url.trim();
  const inM = u.match(/linkedin\.com\/in\/([a-z0-9-]+)/i);
  if (inM) {
    const parts = inM[1].split("-").filter((p) => p && !/^[0-9a-f]{3,}$/i.test(p));
    const firstName = cap(parts[0] ?? "");
    if (!firstName) return null;
    return { kind: "person", firstName, lastName: parts.slice(1).map(cap).join(" ") };
  }
  const coM = u.match(/linkedin\.com\/company\/([a-z0-9-]+)/i);
  if (coM) {
    const company = coM[1].split("-").filter(Boolean).map(cap).join(" ");
    return company ? { kind: "company", company } : null;
  }
  return null;
}

/** Simulate fetching the profile (network delay), then extract it. Null means we could not read that link. */
export async function fetchLinkedInProfile(url: string): Promise<LinkedInProfile | null> {
  await delay(900);
  return extractLinkedIn(url);
}

function findByEmail(email: string) {
  return getDb().users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

function signInAs(userId: string, role: Role) {
  update((db) => ({ ...db, session: { role, userIds: { ...db.session.userIds, [role]: userId } } }));
}

function newClient({ firstName, lastName, email, linkedinUrl, company }: { firstName: string; lastName: string; email: string; linkedinUrl?: string; company?: string }) {
  const id = Date.now().toString(36);
  update((db) => ({
    ...db,
    users: [
      ...db.users,
      { id: `u-${id}`, role: "client", firstName, lastName, email, title: "", timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, twoStep: false, linkedinUrl },
    ],
    clients: [
      ...db.clients,
      {
        id: `c-${id}`,
        userId: `u-${id}`,
        managerId: null,
        company: company ?? "",
        role: "",
        country: "",
        industry: "",
        status: "setting-up",
        stage: "setup",
        setupProgress: 0,
        setupDone: [],
        goal: "",
        linkedin: "not-connected",
        postingPaused: false,
        permissions: { post: true, engage: true, companyPage: false, connectionDrafts: true, profileDrafts: true },
        review: { frequency: "weekly", channels: { email: true, app: true }, approval: { posts: "ask", comments: "go", connectionNotes: "ask" }, ifNoReply: "wait" },
        joinedAt: new Date().toISOString(),
      },
    ],
    brands: [...db.brands, { clientId: `c-${id}`, colours: [], voice: "", wordsUse: [], wordsAvoid: [], examples: [], offLimits: [] }],
  }));
  signInAs(`u-${id}`, "client");
}

/** Phase 1 only: the sign-in form starts filled with this account. Full list in docs/demo-accounts.md. Remove in Phase 2. */
export const DEMO_SIGN_IN = { email: "chidi@paystream.example", password: "demo", code: "123456" };

/** Sign-up step 1: is this email already used by an account? */
export function isEmailTaken(email: string) {
  return Boolean(findByEmail(email));
}

export async function createAccount(input: { firstName: string; lastName: string; email: string; password?: string; linkedinUrl?: string; company?: string }): Promise<AuthResult> {
  await delay(500);
  if (findByEmail(input.email)) {
    return { ok: false, field: "email", message: "An account already uses this email. Sign in instead." };
  }
  newClient({ firstName: input.firstName.trim(), lastName: input.lastName.trim(), email: input.email.trim(), linkedinUrl: input.linkedinUrl?.trim() || undefined, company: input.company?.trim() || undefined });
  return { ok: true, role: "client" };
}

/** Demo: Google returns an identity. We still ask for the LinkedIn URL and a code before the account is created (#43). */
export async function continueWithGoogle(): Promise<{ firstName: string; lastName: string; email: string }> {
  await delay(700);
  return { firstName: "Amara", lastName: "Eze", email: `amara.eze.${Date.now().toString(36)}@gmail.example` };
}

export async function verifyEmailCode(code: string): Promise<AuthResult> {
  await delay(400);
  if (code === "000000") return { ok: false, field: "code", message: "That code is not right. Check the email we sent, or send a new code." };
  return { ok: true, role: "client" };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  await delay(500);
  const user = findByEmail(email);
  if (!user) return { ok: false, field: "email", message: "We could not find an account with that email. Check it, or create an account." };
  if (password.length < 1) return { ok: false, field: "password", message: "Enter your password." };
  if (user.twoStep) {
    pendingUserId = user.id;
    return { ok: true, role: user.role, needsCode: true };
  }
  signInAs(user.id, user.role);
  return { ok: true, role: user.role };
}

let pendingUserId: string | null = null;

export async function verifySignInCode(code: string): Promise<AuthResult> {
  await delay(400);
  const user = getDb().users.find((u) => u.id === pendingUserId);
  if (!user) return { ok: false, message: "Your sign-in timed out. Enter your email and password again." };
  if (code === "000000") return { ok: false, field: "code", message: "That code is not right. Use the latest code from your authenticator app." };
  signInAs(user.id, user.role);
  pendingUserId = null;
  return { ok: true, role: user.role };
}

export async function requestPasswordReset(email: string) {
  await delay(500);
  // Always succeed, so the page never reveals which emails have accounts.
  return { ok: true as const, email };
}

export async function setNewPassword() {
  await delay(500);
  return { ok: true as const };
}

export function findInvite(token: string, db: Db = getDb()) {
  const manager = db.managers.find((m) => m.inviteToken === token && m.status === "invited");
  const user = db.users.find((u) => u.id === manager?.userId);
  const expired = !!manager?.inviteExpiresAt && new Date(manager.inviteExpiresAt).getTime() < Date.now();
  return manager && user && !expired ? { manager, user } : null;
}

export async function acceptInvite(token: string, profile: { intro: string; slots: string[]; signedName: string }) {
  await delay(600);
  const invite = findInvite(token);
  if (!invite) return { ok: false as const, message: "This invite link has been used or has expired. Ask the owner for a new one." };
  const signedAt = new Date().toISOString();
  const who = `${invite.user.firstName} ${invite.user.lastName}`;
  update((db) => ({
    ...db,
    users: db.users.map((u) => (u.id === invite.user.id ? { ...u, twoStep: true } : u)),
    managers: db.managers.map((m) =>
      m.id === invite.manager.id
        ? {
            ...m,
            status: "waiting-for-training",
            intro: profile.intro,
            inviteToken: undefined,
            slots: profile.slots,
            // #48 Record the signed agreement so it can be downloaded later.
            agreement: { fullName: profile.signedName, signedAt, version: AGREEMENT_VERSION },
          }
        : m,
    ),
    // #48 The signing is logged like any owner-visible event.
    audit: [
      { id: `au-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, who, action: `Signed the account manager agreement (v${AGREEMENT_VERSION})`, target: who, at: signedAt, kind: "account" as const },
      ...db.audit,
    ],
  }));
  signInAs(invite.user.id, "manager");
  return { ok: true as const };
}

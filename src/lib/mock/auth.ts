"use client";

import { delay, getDb, update } from "./store";
import type { Db, Role } from "./types";

// Demo sign-up and sign-in. No real passwords or emails; Phase 2 replaces this with Supabase Auth.

export type AuthResult = { ok: true; role: Role; needsCode?: boolean } | { ok: false; field?: string; message: string };

const home: Record<Role, string> = { client: "/home", manager: "/manager", owner: "/admin" };
export const homeFor = (role: Role) => home[role];

function findByEmail(email: string) {
  return getDb().users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

function signInAs(userId: string, role: Role) {
  update((db) => ({ ...db, session: { role, userIds: { ...db.session.userIds, [role]: userId } } }));
}

function newClient(firstName: string, lastName: string, email: string) {
  const id = Date.now().toString(36);
  update((db) => ({
    ...db,
    users: [
      ...db.users,
      { id: `u-${id}`, role: "client", firstName, lastName, email, title: "", timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, twoStep: false },
    ],
    clients: [
      ...db.clients,
      { id: `c-${id}`, userId: `u-${id}`, managerId: null, company: "", role: "", country: "", status: "setting-up", setupProgress: 0, goal: "" },
    ],
  }));
  signInAs(`u-${id}`, "client");
}

/** Phase 1 only: the sign-in form starts filled with this account. Full list in docs/demo-accounts.md. Remove in Phase 2. */
export const DEMO_SIGN_IN = { email: "chidi@paystream.example", password: "demo", code: "123456" };

/** Sign-up step 1: is this email already used by an account? */
export function isEmailTaken(email: string) {
  return Boolean(findByEmail(email));
}

export async function createAccount(input: { firstName: string; lastName: string; email: string; password: string }): Promise<AuthResult> {
  await delay(500);
  if (findByEmail(input.email)) {
    return { ok: false, field: "email", message: "An account already uses this email. Sign in instead." };
  }
  newClient(input.firstName.trim(), input.lastName.trim(), input.email.trim());
  return { ok: true, role: "client" };
}

/** Demo: Google returns a new client account with the name from Google. */
export async function continueWithGoogle(): Promise<AuthResult> {
  await delay(700);
  newClient("Amara", "Eze", `amara.eze.${Date.now().toString(36)}@gmail.example`);
  return { ok: true, role: "client" };
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

export async function acceptInvite(token: string, profile: { intro: string; slots: string[] }) {
  await delay(600);
  const invite = findInvite(token);
  if (!invite) return { ok: false as const, message: "This invite link has been used or has expired. Ask the owner for a new one." };
  update((db) => ({
    ...db,
    users: db.users.map((u) => (u.id === invite.user.id ? { ...u, twoStep: true } : u)),
    managers: db.managers.map((m) =>
      m.id === invite.manager.id
        ? { ...m, status: "waiting-for-training", intro: profile.intro, inviteToken: undefined, slots: profile.slots }
        : m,
    ),
  }));
  signInAs(invite.user.id, "manager");
  return { ok: true as const };
}

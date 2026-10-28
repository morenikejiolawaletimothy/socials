"use client";

import { useDb } from "./store";
import type { Db } from "./types";

/** The whole demo database. Stable until something changes, so derive lists from it in render. */
export function useData(): Db {
  return useDb((db) => db);
}

/** Everything about one client, for the client's own screens and the staff client page. */
export function clientBundle(db: Db, clientId: string | undefined) {
  const client = db.clients.find((c) => c.id === clientId);
  const user = db.users.find((u) => u.id === client?.userId);
  const manager = db.managers.find((m) => m.id === client?.managerId);
  const managerUser = db.users.find((u) => u.id === manager?.userId);
  const byClient = <T extends { clientId: string }>(list: T[]) => list.filter((x) => x.clientId === clientId);
  return {
    client,
    user,
    manager,
    managerUser,
    contract: db.contracts.find((k) => k.clientId === clientId),
    strategy: db.strategies.find((s) => s.clientId === clientId),
    brand: db.brands.find((b) => b.clientId === clientId),
    week: db.progress.find((p) => p.clientId === clientId),
    posts: byClient(db.posts),
    tasks: byClient(db.tasks),
    calls: byClient(db.calls).sort((a, b) => a.at.localeCompare(b.at)),
    updates: byClient(db.updates),
    messages: byClient(db.messages).sort((a, b) => a.at.localeCompare(b.at)),
    activity: byClient(db.activity).sort((a, b) => b.at.localeCompare(a.at)),
    requests: byClient(db.requests),
    files: byClient(db.brandFiles),
    moments: byClient(db.moments),
    invoices: byClient(db.invoices).sort((a, b) => b.at.localeCompare(a.at)),
    leads: byClient(db.leads),
    signals: byClient(db.signals),
    alerts: byClient(db.alerts),
    complaints: byClient(db.complaints),
  };
}
export type ClientBundle = ReturnType<typeof clientBundle>;

/** The signed-in client and everything about them. */
export function useMyClient() {
  const db = useData();
  const userId = db.session.userIds.client;
  const client = db.clients.find((c) => c.userId === userId);
  return clientBundle(db, client?.id);
}

/** The signed-in manager (or the manager the owner is covering for). */
export function useMyManager() {
  const db = useData();
  const coveringId = db.session.role === "owner" ? db.session.coveringManagerId : null;
  const manager = coveringId ? db.managers.find((m) => m.id === coveringId) : db.managers.find((m) => m.userId === db.session.userIds.manager);
  const user = db.users.find((u) => u.id === manager?.userId);
  const clients = db.clients.filter((c) => c.managerId === manager?.id);
  return { db, manager, user, clients, covering: Boolean(coveringId) };
}

"use client";

import { delay, update, useDb } from "./store";

export function useNotifications(userId: string | undefined) {
  return useDb((db) => db.notifications).filter((n) => n.userId === userId);
}

export async function markAllRead(userId: string) {
  await delay(150);
  update((db) => ({
    ...db,
    notifications: db.notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n)),
  }));
}

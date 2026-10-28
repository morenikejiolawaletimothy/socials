"use client";

import { useSyncExternalStore } from "react";
import { seed } from "./seed";
import type { Db } from "./types";

// In-browser demo database. Phase 2 replaces this module's consumers with real API calls.

const KEY = "bluecut-demo";
const VERSION = 3;
const listeners = new Set<() => void>();
const serverSnapshot = seed();
let db: Db | null = null;

function load(): Db {
  if (db) return db;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Db) : null;
    db = parsed && parsed.version === VERSION ? parsed : seed();
  } catch {
    db = seed();
  }
  return db;
}

function save(next: Db) {
  db = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage can be unavailable (private mode). The demo still works in memory.
  }
  listeners.forEach((l) => l());
}

export function getDb(): Db {
  return typeof window === "undefined" ? serverSnapshot : load();
}

export function update(fn: (draft: Db) => Db) {
  save(fn(load()));
}

export function resetDemo() {
  save(seed());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Read from the demo database. The selector must return stable references (no new arrays). */
export function useDb<T>(selector: (db: Db) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(load()),
    () => selector(serverSnapshot),
  );
}

/* Demo only: "Simulate errors" in the demo bar makes every action fail, so error states can be checked. */
let failMode = false;
const failListeners = new Set<() => void>();
export function setFailMode(on: boolean) {
  failMode = on;
  failListeners.forEach((l) => l());
}
export function useFailMode() {
  return useSyncExternalStore(
    (l) => {
      failListeners.add(l);
      return () => failListeners.delete(l);
    },
    () => failMode,
    () => false,
  );
}

/** Simulated network delay so loading states are real. Fails while "Simulate errors" is on. */
export async function delay(ms = 450) {
  await new Promise((r) => setTimeout(r, ms));
  if (failMode) throw new Error("Simulated failure");
}

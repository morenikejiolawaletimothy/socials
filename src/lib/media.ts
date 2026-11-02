"use client";

import { useEffect, useState } from "react";
import { DOCUMENT } from "./linkedin";

/*
 * Large files (videos, carousel documents) live in the browser's IndexedDB in Phase 1, because they are too
 * big for the demo data. Media refer to them as "idb:<id>". Phase 2 uploads to storage and uses real URLs.
 */
const DB = "bluecut-media";
const STORE = "files";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveFile(blob: Blob): Promise<string> {
  const id = `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  const db = await open();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  return `idb:${id}`;
}

async function readFile(src: string): Promise<Blob | undefined> {
  const db = await open();
  return new Promise((resolve) => {
    const req = db.transaction(STORE).objectStore(STORE).get(src.slice(4));
    req.onsuccess = () => resolve(req.result as Blob | undefined);
    req.onerror = () => resolve(undefined);
  });
}

/** A playable URL for a media source: public paths pass through, "idb:" files are read from the browser. */
export function useMediaSrc(src?: string) {
  const [url, setUrl] = useState<string | undefined>(src && !src.startsWith("idb:") ? src : undefined);
  useEffect(() => {
    if (!src?.startsWith("idb:")) return setUrl(src);
    let made: string | undefined;
    let live = true;
    readFile(src).then((blob) => {
      if (!live || !blob) return;
      made = URL.createObjectURL(blob);
      setUrl(made);
    });
    return () => {
      live = false;
      if (made) URL.revokeObjectURL(made);
    };
  }, [src]);
  return url;
}

/** Reads a video's length and shape, and grabs a frame a second in as its cover. */
export function readVideo(file: File): Promise<{ seconds: number; shape: "landscape" | "portrait" | "square"; poster: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.muted = true;
    v.preload = "auto";
    v.src = url;
    v.onloadedmetadata = () => {
      v.currentTime = Math.min(1, v.duration / 2);
    };
    v.onseeked = () => {
      const w = v.videoWidth;
      const h = v.videoHeight;
      const scale = Math.min(1, 960 / Math.max(w, h));
      const c = Object.assign(document.createElement("canvas"), { width: Math.round(w * scale), height: Math.round(h * scale) });
      c.getContext("2d")?.drawImage(v, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      const ratio = w / h;
      resolve({ seconds: v.duration, shape: ratio > 1.1 ? "landscape" : ratio < 0.9 ? "portrait" : "square", poster: c.toDataURL("image/jpeg", 0.8) });
    };
    v.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("We could not read that video. Export it as MP4 and try again."));
    };
  });
}

/** Renders the pages of a PDF as small images (the carousel preview) and counts them. Other formats have no preview. */
export async function readDocument(file: File, maxPreview = 12): Promise<{ pages?: number; slides: { src: string; alt: string }[] }> {
  if (!file.name.toLowerCase().endsWith(".pdf")) return { slides: [] };
  const pdfjs = await import("pdfjs-dist");
  // The worker is copied to /public from pdfjs-dist (same version) so it loads without bundler setup.
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const slides: { src: string; alt: string }[] = [];
  for (let i = 1; i <= Math.min(doc.numPages, maxPreview); i++) {
    const page = await doc.getPage(i);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: 540 / base.width });
    const canvas = Object.assign(document.createElement("canvas"), { width: viewport.width, height: viewport.height });
    await page.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
    slides.push({ src: canvas.toDataURL("image/jpeg", 0.75), alt: `Page ${i}` });
  }
  return { pages: doc.numPages, slides };
}

export const documentAccept = DOCUMENT.accept;

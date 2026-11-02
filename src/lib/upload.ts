"use client";

import { fileSize, photoProblem, toImage } from "./image";
import { documentProblem, videoProblem } from "./linkedin";
import { readDocument, readVideo, saveFile } from "./media";
import type { BrandFile } from "./mock";

type Section = BrandFile["section"];

/** What each Brand section takes, in words people see next to the Upload button. */
export const sectionRules: Record<Section, { accept: string; label: string }> = {
  photos: { accept: "image/png,image/jpeg,image/webp", label: "JPG, PNG or WebP, up to 10 MB" },
  logos: { accept: "image/png,image/svg+xml", label: "PNG or SVG, up to 10 MB" },
  documents: { accept: ".pdf,.doc,.docx,.ppt,.pptx", label: "PDF, Word or PowerPoint, up to 25 MB" },
  videos: { accept: "video/mp4", label: "MP4, 3 seconds to 30 minutes, up to 500 MB" },
  carousels: { accept: ".pdf,.ppt,.pptx,.doc,.docx", label: "PDF, PowerPoint or Word, up to 100 MB and 300 pages" },
};

export type Prepared = { name: string; size: string; src?: string; video?: BrandFile["video"]; carousel?: BrandFile["carousel"] };

/**
 * Checks a file against the section's rules (LinkedIn's, for videos and carousels) and gets it ready to add
 * to the Brand: images shrunk, videos and documents stored in the browser with a cover or page previews.
 * Throws an Error whose message says what is wrong and what to do.
 */
export async function prepareUpload(file: File, section: Section): Promise<Prepared> {
  const base = { name: file.name, size: fileSize(file.size) };
  if (section === "videos") {
    const early = videoProblem(file);
    if (early) throw new Error(early);
    const meta = await readVideo(file);
    const late = videoProblem(file, meta.seconds);
    if (late) throw new Error(late);
    return { ...base, src: await saveFile(file), video: meta };
  }
  if (section === "carousels") {
    const early = documentProblem(file);
    if (early) throw new Error(early);
    const doc = await readDocument(file).catch(() => ({ pages: undefined, slides: [] }));
    const late = documentProblem(file, doc.pages);
    if (late) throw new Error(late);
    return { ...base, src: await saveFile(file), carousel: { pages: doc.pages, slides: doc.slides } };
  }
  if (section === "documents") {
    const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!sectionRules.documents.accept.split(",").includes(ext)) throw new Error(`That type of file is not allowed here. Use ${sectionRules.documents.label}.`);
    if (file.size > 25 * 1024 * 1024) throw new Error(`That file is over 25 MB. Use ${sectionRules.documents.label}.`);
    return base;
  }
  if (section === "logos" && file.type === "image/svg+xml") return { ...base, src: await toImage(file) };
  const problem = photoProblem(file);
  if (problem) throw new Error(problem);
  return { ...base, src: await toImage(file, section === "logos" ? 600 : 1200) };
}

/**
 * A file attached in Messages. Videos follow LinkedIn's rules (so they can go straight into a post) and may be
 * up to 500 MB; everything else is up to 25 MB.
 */
export async function prepareAttachment(file: File): Promise<{ name: string; size: string; kind: "image" | "pdf" | "doc" | "video"; src?: string; poster?: string; seconds?: number }> {
  if (file.type.startsWith("video/")) {
    const ready = await prepareUpload(file, "videos");
    return { name: ready.name, size: ready.size, kind: "video", src: ready.src, poster: ready.video?.poster, seconds: ready.video?.seconds };
  }
  if (file.size > 25 * 1024 * 1024) throw new Error("That file is over 25 MB. Send a smaller one, or paste a link to it.");
  const image = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
  return { name: file.name, size: fileSize(file.size), kind: image ? "image" : file.type === "application/pdf" ? "pdf" : "doc", src: image ? await toImage(file) : undefined };
}

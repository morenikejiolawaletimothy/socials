/**
 * LinkedIn's rules for media, in one place, so uploads, checks and copy all agree.
 * Video: Videos API (MP4, 3 seconds to 30 minutes, one English caption file, optional thumbnail).
 * Microsoft's pages give two size limits (500 MB and 5 GB); we use the lower one until Phase 2 confirms it.
 * Carousels are LinkedIn document posts: PDF, PowerPoint or Word, up to 100 MB and 300 pages.
 */
export const VIDEO = {
  types: ["video/mp4"],
  accept: "video/mp4",
  label: "MP4, 3 seconds to 30 minutes, up to 500 MB",
  minSeconds: 3,
  maxSeconds: 30 * 60,
  maxBytes: 500 * 1024 * 1024,
};

export const DOCUMENT = {
  exts: [".pdf", ".ppt", ".pptx", ".doc", ".docx"],
  accept: ".pdf,.ppt,.pptx,.doc,.docx",
  label: "PDF, PowerPoint or Word, up to 100 MB and 300 pages",
  maxBytes: 100 * 1024 * 1024,
  maxPages: 300,
};

export const CAPTIONS = { accept: ".srt", label: "An .srt caption file, in English" };


export type VideoShape = "landscape" | "portrait" | "square";

/** What is wrong with a video file for LinkedIn, and what to do; nothing when it is fine. */
export function videoProblem(file: File, seconds?: number) {
  if (!VIDEO.types.includes(file.type)) return "LinkedIn takes MP4 videos. Export the video as MP4 and try again.";
  if (file.size > VIDEO.maxBytes) return "That video is over 500 MB. Export it smaller or shorter and try again.";
  if (seconds !== undefined && seconds < VIDEO.minSeconds) return "That video is under 3 seconds. LinkedIn needs at least 3.";
  if (seconds !== undefined && seconds > VIDEO.maxSeconds) return "That video is over 30 minutes. LinkedIn takes up to 30.";
  return undefined;
}

export function documentProblem(file: File, pages?: number) {
  const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
  if (!DOCUMENT.exts.includes(ext)) return "Carousels must be a PDF, PowerPoint or Word file. Save it as a PDF and try again.";
  if (file.size > DOCUMENT.maxBytes) return "That file is over 100 MB. Make it smaller and try again.";
  if (pages !== undefined && pages > DOCUMENT.maxPages) return "That file has over 300 pages. LinkedIn takes up to 300.";
  return undefined;
}

/** "0:45" or "12:03". */
export const duration = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, "0")}`;

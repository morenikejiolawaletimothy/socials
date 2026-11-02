"use client";

import { Fragment, useState } from "react";

/*
 * Post text the way LinkedIn shows it.
 * Markup in the text: @[Name] tags a person or company, #word is a hashtag, and http(s) links are links.
 * All three show in brand blue. Long posts stop after about three lines with an inline grey "…more".
 */

const TOKEN = /(@\[[^\]]+\]|#[A-Za-z]\w*|https?:\/\/[^\s]+)/g;
const MAX_LINES = 3;
const MAX_CHARS = 210;

/** The text without markup ("@[Ada Obi]" becomes "Ada Obi"), for list tiles, search and screen-reader labels. */
export function plainText(text: string) {
  return text.replace(/@\[([^\]]+)\]/g, "$1");
}

/** The first part of a long post: up to three lines and about 210 characters, cut on a word and never inside a tag. */
function shorten(text: string) {
  let cut = text.split("\n").slice(0, MAX_LINES).join("\n");
  if (plainText(cut).length > MAX_CHARS) {
    cut = cut.slice(0, MAX_CHARS);
    cut = cut.slice(0, Math.max(cut.lastIndexOf(" "), 0)) || cut;
  }
  const openTag = cut.lastIndexOf("@[");
  if (openTag > cut.lastIndexOf("]")) cut = cut.slice(0, openTag);
  return cut.trimEnd();
}

const blue = "font-semibold text-primary-600";

function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(TOKEN).map((part, i) => {
        if (part.startsWith("@[") && part.endsWith("]")) return <span key={i} className={blue}>{part.slice(2, -1)}</span>;
        if (/^#[A-Za-z]/.test(part)) return <span key={i} className={blue}>{part}</span>;
        if (/^https?:\/\//.test(part)) {
          return (
            <a key={i} href={part} target="_blank" rel="noreferrer" className={`${blue} rounded-sm break-all hover:underline focus-visible:focus-ring`}>
              {part.replace(/^https?:\/\/(www\.)?/, "")}
            </a>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

export function PostText({ text, clamp = true }: { text: string; clamp?: boolean }) {
  const short = shorten(text);
  const long = short.length < text.trimEnd().length;
  const [open, setOpen] = useState(!clamp);
  const collapsed = long && !open;

  return (
    <p className="whitespace-pre-line text-body-sm text-primary">
      <Rich text={collapsed ? short : text} />
      {collapsed && (
        <>
          …{" "}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-sm text-body-sm text-secondary hover:text-primary-600 hover:underline focus-visible:focus-ring"
          >
            more
          </button>
        </>
      )}
    </p>
  );
}

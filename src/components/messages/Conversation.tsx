"use client";

import { FileText, Microphone, PaperPlaneTilt, Paperclip, Stop, Waveform } from "@phosphor-icons/react";
import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";
import { Avatar, Button, useToast } from "@/components/ui";
import { day, fullName, time } from "@/lib/format";
import { act, type Message, type User } from "@/lib/mock";

function Bubble({ m, mine, author, onSave, saveLabel }: { m: Message; mine: boolean; author: string; onSave?: () => void; saveLabel: string }) {
  const body = mine ? "bg-primary-600 text-inverse" : "bg-neutral-50 text-primary";
  return (
    <li className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}>
      {!mine && <Avatar name={author} size="sm" />}
      <div className={`flex max-w-xs flex-col gap-1 sm:max-w-md ${mine ? "items-end" : "items-start"}`}>
        {m.text && <p className={`whitespace-pre-line rounded-lg px-4 py-3 text-body-sm ${body}`}>{m.text}</p>}
        {m.voice && (
          <div className={`flex flex-col gap-2 rounded-lg px-4 py-3 ${body}`}>
            <span className="flex items-center gap-2 text-body-sm font-medium">
              <Waveform className="size-5" aria-hidden /> Voice note, {m.voice.seconds}s
            </span>
            <span className="text-body-sm opacity-90">&ldquo;{m.voice.transcript}&rdquo;</span>
          </div>
        )}
        {m.file && (
          <div className="flex w-64 flex-col overflow-hidden rounded-lg border border-border bg-card">
            {m.file.kind === "image" && m.file.src ? (
              <div className="relative aspect-video w-full bg-neutral-100">
                <Image src={m.file.src} alt={m.file.name} fill sizes="256px" className="object-cover" />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3">
                <FileText className="size-6 text-primary-600" aria-hidden />
                <span className="truncate text-body-sm text-primary">{m.file.name}</span>
              </div>
            )}
            <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2">
              <span className="truncate text-caption text-secondary">
                {m.file.kind === "image" ? m.file.name : ""} {m.file.size}
              </span>
              {onSave &&
                (m.savedToBrand ? (
                  <span className="shrink-0 text-caption text-success">In your brand</span>
                ) : (
                  <button type="button" onClick={onSave} className="shrink-0 rounded-sm text-caption font-medium text-primary-600 hover:text-primary-700 hover:underline focus-visible:focus-ring">
                    {saveLabel}
                  </button>
                ))}
            </div>
          </div>
        )}
        <span className="px-1 text-caption text-secondary">
          {m.asTeam ? "Your account team, " : ""}
          {time(m.at)}
        </span>
      </div>
    </li>
  );
}

/**
 * One conversation between a client and their manager (C10, M9): text, files and voice notes.
 * Files can be saved to the client's brand with one tap.
 */
export function Conversation({
  clientId,
  messages,
  me,
  users,
  saveLabel = "Add to your brand",
  asTeam = false,
}: {
  clientId: string;
  messages: Message[];
  me: User;
  users: User[];
  saveLabel?: string;
  asTeam?: boolean;
}) {
  const toast = useToast();
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const endRef = useRef<HTMLLIElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => endRef.current?.scrollIntoView({ block: "nearest" }), [messages.length]);
  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  const send = async () => {
    if (!text.trim()) return;
    const body = text.trim();
    setText("");
    await act.sendMessage(clientId, me.id, { text: body }, asTeam);
  };

  let lastDay = "";
  return (
    <div className="flex flex-col">
      <ol className="flex max-h-160 min-h-80 flex-col gap-4 overflow-y-auto px-6 py-6" aria-live="polite">
        {messages.map((m) => {
          const d = day(m.at);
          const showDay = d !== lastDay;
          lastDay = d;
          const author = users.find((u) => u.id === m.fromUserId);
          return (
            <Fragment key={m.id}>
              {showDay && <li className="self-center rounded-full bg-neutral-50 px-3 py-1 text-caption text-secondary">{d}</li>}
              <Bubble
                m={m}
                mine={m.fromUserId === me.id}
                author={m.asTeam ? "Your account team" : fullName(author)}
                saveLabel={saveLabel}
                onSave={async () => {
                  await act.saveFileToBrand(m.id);
                  toast("Saved to Your brand.");
                }}
              />
            </Fragment>
          );
        })}
        <li ref={endRef} aria-hidden />
      </ol>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-end gap-2 border-t border-border p-4"
      >
        <input
          ref={fileRef}
          type="file"
          className="sr-only"
          tabIndex={-1}
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            if (f.size > 25 * 1024 * 1024) return toast("That file is over 25 MB. Send a smaller one, or a link.", "danger");
            await act.sendMessage(clientId, me.id, { file: { name: f.name, size: `${(f.size / 1024 / 1024).toFixed(1)} MB`, kind: f.type.startsWith("image/") ? "image" : f.type === "application/pdf" ? "pdf" : "doc" } }, asTeam);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          aria-label="Attach a file"
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-secondary hover:bg-primary-50 hover:text-primary-700 focus-visible:focus-ring"
        >
          <Paperclip className="size-5" aria-hidden />
        </button>
        {recording ? (
          <div className="flex min-h-11 flex-1 items-center gap-2 rounded-md border border-border px-4 text-body-sm text-primary" aria-live="polite">
            <span className="size-2 animate-pulse rounded-full bg-danger" aria-hidden /> Recording {seconds}s
          </div>
        ) : (
          <label className="min-w-0 flex-1">
            <span className="sr-only">Message</span>
            <textarea
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Write a message"
              className="min-h-11 w-full resize-none rounded-md border border-border-strong bg-card px-4 py-2.5 text-body-sm text-primary placeholder:text-neutral-400 focus-visible:border-primary-600 focus-visible:focus-ring"
            />
          </label>
        )}
        <button
          type="button"
          onClick={async () => {
            if (!recording) {
              setSeconds(0);
              return setRecording(true);
            }
            setRecording(false);
            await act.sendMessage(clientId, me.id, { voice: { seconds: Math.max(seconds, 3), transcript: "Quick one: can we move Thursday's post to next week? I want to add the new numbers first." } }, asTeam);
          }}
          aria-label={recording ? "Stop and send voice note" : "Record a voice note"}
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-secondary hover:bg-primary-50 hover:text-primary-700 focus-visible:focus-ring"
        >
          {recording ? <Stop className="size-5 text-danger" aria-hidden /> : <Microphone className="size-5" aria-hidden />}
        </button>
        {!recording && (
          <Button type="submit" disabled={!text.trim()} aria-label="Send" className="px-3 sm:px-5">
            <PaperPlaneTilt className="size-5 sm:hidden" aria-hidden />
            <span className="hidden sm:inline">Send</span>
          </Button>
        )}
      </form>
    </div>
  );
}

"use client";

import { ChatsCircle, DotsThree, FileText, MagnifyingGlass, Microphone, NotePencil, Paperclip, PaperPlaneTilt, Stop, Waveform, X } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { Avatar, Button, Dialog, Input, Menu, Pill, TextLink, textActionClass, useConfirm, useTask, useToast } from "@/components/ui";
import { day, fullName, time } from "@/lib/format";
import { prepareAttachment } from "@/lib/upload";
import { VideoPlayer } from "@/components/content/PostMedia";
import { act, type Message, type Reaction, type Thread, type User } from "@/lib/mock";
import { MessageActions, MessageEditor, MessageMarks, PinnedStrip, ReactionChips } from "./MessageActions";
import { VoiceWave } from "./VoiceWave";
import { useDictation } from "./useDictation";

/** The conversation for messages sent before conversations existed (no threadId). Shown only when it has messages. */
const GENERAL = "general";
const NEW = "new";
/** A plain row in the conversations panel (New conversation, Search conversations), like an AI app's sidebar. */
const sideRow = "flex min-h-10 w-full items-center gap-3 rounded-md px-3 py-2 text-left text-body-sm text-primary transition-colors hover:bg-primary-50 hover:text-primary-700 focus-visible:focus-ring";
/** Selected row (the open conversation, or New conversation while starting one): brand tint, as for selected rows across the product. */
const sideRowOn = "bg-primary-100 font-medium text-primary-700 hover:bg-primary-100";

type Attachment = NonNullable<Message["file"]>;

/** Splits text into plain parts and links, so pasted links are clickable (shown without https://). */
function Linked({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return (
    <>
      {parts.map((p, i) =>
        /^https?:\/\//.test(p) ? (
          <a key={i} href={p} target="_blank" rel="noreferrer" className="break-all font-medium text-primary-600 hover:underline focus-visible:focus-ring">
            {p.replace(/^https?:\/\//, "")}
          </a>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

function FileCard({ file, action }: { file: Attachment; action?: React.ReactNode }) {
  return (
    <div className="flex w-full max-w-xs flex-col overflow-hidden rounded-lg border border-border bg-card">
      {file.kind === "video" && file.src ? (
        <VideoPlayer video={{ src: file.src, poster: file.poster ?? "", alt: file.name, seconds: file.seconds ?? 0 }} />
      ) : file.kind === "image" && file.src ? (
        <div className="relative aspect-video w-full bg-neutral-100">
          <Image src={file.src} alt={file.name} fill sizes="320px" className="object-cover" />
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3">
          <FileText className="size-6 shrink-0 text-primary-600" aria-hidden />
          <span className="truncate text-body-sm text-primary">{file.name}</span>
        </div>
      )}
      <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2">
        <span className="truncate text-caption text-secondary">
          {file.kind === "image" ? `${file.name} · ` : ""}
          {file.size}
        </span>
        {action}
      </div>
    </div>
  );
}

type ChatMessageProps = {
  m: Message;
  mine: boolean;
  /** A hairline above the message, separating it from the one before (not after a date line). */
  divided: boolean;
  author: string;
  authorPhoto?: string;
  meId: string;
  nameOf: (userId: string) => string;
  onSaveFile: () => void;
  savingFile: boolean;
  onReact: (kind: Reaction) => void;
  onPin: () => void;
  onEdit: (text: string) => Promise<boolean>;
  savingEdit: boolean;
};

/**
 * One message, laid out like an AI chat: theirs as plain text under their name, yours in a bubble on the right.
 * Under each one: reactions, copy, pin, and edit on your own messages. Shown on hover or focus on desktop, always on phones.
 */
function ChatMessage({ m, mine, divided, author, authorPhoto, meId, nameOf, onSaveFile, savingFile, onReact, onPin, onEdit, savingEdit }: ChatMessageProps) {
  const [editing, setEditing] = useState(false);
  const line = divided ? "border-t border-border pt-6" : "";

  const save = m.file ? (
    m.savedToBrand ? (
      <span className="shrink-0 text-caption text-success">In your brand</span>
    ) : (
      <button type="button" onClick={onSaveFile} disabled={savingFile} className="shrink-0 rounded-sm text-caption font-medium text-primary-600 hover:text-primary-700 hover:underline focus-visible:focus-ring disabled:cursor-not-allowed">
        {savingFile ? "Saving" : "Add to your brand"}
      </button>
    )
  ) : null;

  const body = (
    <>
      {m.voice && (
        <span className="flex flex-col gap-1">
          <span className="flex items-center gap-2 text-caption text-secondary">
            <Waveform className="size-4" aria-hidden /> Voice note, {m.voice.seconds}s
          </span>
          <span>{m.voice.transcript}</span>
        </span>
      )}
      {m.text && (
        <span className="whitespace-pre-line">
          <Linked text={m.text} />
        </span>
      )}
    </>
  );

  // Time, then "Edited" and "Pinned" when they apply.
  const meta = (
    <span className="flex items-center gap-2 text-caption text-secondary">
      {time(m.at)}
      <MessageMarks m={m} />
    </span>
  );
  const chips = <ReactionChips m={m} meId={meId} nameOf={nameOf} onReact={onReact} align={mine ? "end" : "start"} />;
  const actions = <MessageActions m={m} meId={meId} onReact={onReact} onPin={onPin} onEdit={mine ? () => setEditing(true) : undefined} />;
  const editor = <MessageEditor initial={m.text ?? ""} saving={savingEdit} onSave={onEdit} onCancel={() => setEditing(false)} />;

  if (mine) {
    return (
      <li id={`msg-${m.id}`} className={`group flex scroll-mt-4 flex-col items-end gap-2 ${line}`}>
        {editing ? editor : (m.text || m.voice) && <div className="max-w-md rounded-lg bg-neutral-50 px-4 py-3 text-body-sm text-primary">{body}</div>}
        {m.file && <FileCard file={m.file} action={save} />}
        {chips}
        {!editing && (
          <div className="flex items-center gap-2">
            {actions}
            {meta}
          </div>
        )}
      </li>
    );
  }
  return (
    <li id={`msg-${m.id}`} className={`group flex scroll-mt-4 items-start gap-3 ${line}`}>
      <Avatar name={author} src={authorPhoto} size="md" />
      <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1">
        <span className="flex items-center gap-2 text-caption text-secondary">
          <span className="font-medium text-primary">{author}</span>
          {meta}
        </span>
        {(m.text || m.voice) && <div className="text-body-sm text-primary">{body}</div>}
        {m.file && <FileCard file={m.file} action={save} />}
        {chips}
        <div className="-ml-2">{actions}</div>
      </div>
    </li>
  );
}

const SAMPLE_DICTATION = "Can we move Thursday's post to next week? I want to add the new numbers first.";

/**
 * C10 Messages for clients, laid out like an AI chat app: conversations on the left (start a new one, rename,
 * delete), the open conversation on the right with the manager at the top (opens their profile), and one
 * composer at the bottom: write, attach a file or photo, paste a link, or speak and it types for you.
 * Calls are booked, not started from here.
 */
export function ClientChat({
  clientId,
  me,
  manager,
  messages,
  threads,
  side = "client",
  asTeam = false,
  profileHref = "/account-manager",
}: {
  clientId: string;
  me: User;
  /** The person on the other side: the account manager for a client, the client for the team. */
  manager: User;
  messages: Message[];
  threads: Thread[];
  /** Who is reading: the client, or the team (manager, or the owner covering). */
  side?: "client" | "team";
  /** The owner covering for a manager: messages go out as the account team. */
  asTeam?: boolean;
  /** Where the name at the top of the conversation links to. */
  profileHref?: string;
}) {
  const toast = useToast();
  const confirm = useConfirm();
  const { run, pending } = useTask();

  // Conversations, newest activity first. Older messages with no conversation sit in "General".
  const general = messages.filter((m) => !m.threadId);
  const all: (Thread & { last?: Message; count: number })[] = [
    ...(general.length ? [{ id: GENERAL, clientId, title: "General", createdAt: general[0].at }] : []),
    ...threads,
  ]
    .map((t) => {
      const msgs = t.id === GENERAL ? general : messages.filter((m) => m.threadId === t.id);
      return { ...t, last: msgs[msgs.length - 1], count: msgs.length };
    })
    .sort((a, b) => (b.last?.at ?? b.createdAt).localeCompare(a.last?.at ?? a.createdAt));

  const [activeId, setActiveId] = useState<string>(() => all[0]?.id ?? NEW);
  // Phone: the list, then the open conversation.
  const [showList, setShowList] = useState(false);
  const active = all.find((t) => t.id === activeId);
  /** The open conversation, or undefined while starting a new one. */
  const current = activeId === NEW ? undefined : active;
  const shown = !current ? [] : current.id === GENERAL ? general : messages.filter((m) => m.threadId === current.id);

  const [text, setText] = useState("");
  const [file, setFile] = useState<Attachment | null>(null);
  const { listening, toggle: toggleDictation } = useDictation({ text, setText, sample: SAMPLE_DICTATION });
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLLIElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const boxRef = useRef<HTMLTextAreaElement>(null);
  const [renaming, setRenaming] = useState<Thread | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");

  // Search matches a conversation's title or anything said in it.
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const listed = words.length
    ? all.filter((t) => {
        const msgs = t.id === GENERAL ? general : messages.filter((m) => m.threadId === t.id);
        const hay = `${t.title} ${msgs.map((m) => `${m.text ?? ""} ${m.file?.name ?? ""} ${m.voice?.transcript ?? ""}`).join(" ")}`.toLowerCase();
        return words.every((w) => hay.includes(w));
      })
    : all;

  // Keep the newest message in view. Desktop: scroll the message list itself, not the page. Phone: the page.
  // Block body on purpose: an effect must return nothing or a clean-up function.
  useEffect(() => {
    const list = listRef.current;
    if (list && list.scrollHeight > list.clientHeight) list.scrollTop = list.scrollHeight;
    else endRef.current?.scrollIntoView({ block: "nearest" });
  }, [shown.length, activeId]);

  // The box grows with the text, up to a few lines, then scrolls.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [text]);

  const open = (id: string) => {
    setActiveId(id);
    setShowList(false);
  };

  const send = async () => {
    const body = text.trim();
    if ((!body && !file) || pending("send")) return;
    const attach = file;
    setText("");
    setFile(null);
    let threadId: string | undefined = current && current.id !== GENERAL ? current.id : undefined;
    const ok = await run("send", async () => {
      if (!current) {
        threadId = await act.startThread(clientId, body || attach?.name || "");
        setActiveId(threadId);
      }
      await act.sendMessage(clientId, me.id, { text: body || undefined, file: attach ?? undefined, threadId }, asTeam);
    });
    // On failure what they wrote comes back.
    if (!ok) {
      setText(body);
      setFile(attach);
    }
  };

  const managerName = fullName(manager);
  let lastDay = "";

  return (
    <div className="grid grid-cols-1 md:h-150 md:grid-cols-12">
      {/* Conversations: fixed beside the chat on desktop. Actions on top, a line, then the list, which scrolls on its own when long. */}
      <aside aria-label="Conversations" className={`flex-col border-border bg-neutral-25 md:col-span-4 md:flex md:min-h-0 md:rounded-bl-lg md:border-r ${showList ? "flex" : "hidden"}`}>
        <div className="flex shrink-0 flex-col border-b border-border p-3">
          <button type="button" onClick={() => open(NEW)} className={`${sideRow} ${!current ? sideRowOn : ""} group`}>
            <NotePencil className={`size-5 shrink-0 ${!current ? "text-primary-700" : "text-secondary group-hover:text-primary-700"}`} aria-hidden /> New conversation
          </button>
          {searching ? (
            <label className="relative flex items-center">
              <span className="sr-only">Search conversations</span>
              <MagnifyingGlass className="pointer-events-none absolute left-3 size-5 text-secondary" aria-hidden />
              <input
                autoFocus
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Escape") return;
                  setQuery("");
                  setSearching(false);
                }}
                placeholder="Search conversations"
                className="min-h-10 w-full rounded-md border border-border-strong bg-card pl-10 pr-9 text-body-sm text-primary placeholder:text-neutral-400 focus-visible:border-primary-600 focus-visible:focus-ring [&::-webkit-search-cancel-button]:hidden"
              />
              <button
                type="button"
                aria-label="Close search"
                onClick={() => {
                  setQuery("");
                  setSearching(false);
                }}
                className="absolute right-2 flex size-6 items-center justify-center rounded-full text-secondary transition-colors hover:bg-primary-50 hover:text-primary-700 focus-visible:focus-ring"
              >
                <X className="size-4" aria-hidden />
              </button>
            </label>
          ) : (
            <button type="button" onClick={() => setSearching(true)} className={`${sideRow} group`}>
              <MagnifyingGlass className="size-5 shrink-0 text-secondary group-hover:text-primary-700" aria-hidden /> Search conversations
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2 p-3 md:min-h-0 md:flex-1 md:overflow-y-auto">
          <p className="px-3 pt-1 text-caption font-medium text-secondary">{query.trim() ? "Results" : "Recent"}</p>
          <ul className="flex flex-col gap-1">
            {listed.map((t) => {
              const on = t.id === activeId;
              return (
                <li key={t.id} className={`group relative flex items-center rounded-md transition-colors ${on ? "bg-primary-100" : "hover:bg-primary-50"}`}>
                  <button
                    type="button"
                    aria-current={on ? "true" : undefined}
                    title={t.title}
                    onClick={() => open(t.id)}
                    className={`min-w-0 flex-1 truncate rounded-md py-2 pl-3 pr-10 text-left text-body-sm transition-colors focus-visible:focus-ring ${on ? "font-medium text-primary-700" : "text-primary group-hover:text-primary-700"}`}
                  >
                    {t.title}
                  </button>
                  {t.id !== GENERAL && (
                    <span className={`absolute right-1 ${on ? "" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"}`}>
                      <Menu
                        label={`Options for ${t.title}`}
                        trigger={<DotsThree className="size-5" aria-hidden />}
                        triggerClassName="flex size-8 items-center justify-center rounded-full text-secondary transition-colors hover:bg-card hover:text-primary-700 focus-visible:focus-ring"
                        items={[
                          {
                            label: "Rename",
                            onSelect: () => {
                              setRenaming(t);
                              setNewTitle(t.title);
                            },
                          },
                          {
                            label: "Delete",
                            onSelect: () =>
                              confirm({
                                title: "Delete this conversation?",
                                body: `"${t.title}" and its ${t.count === 1 ? "message" : `${t.count} messages`} are removed for you and ${manager.firstName}.`,
                                warning: "You cannot undo this.",
                                confirmLabel: "Delete",
                                tone: "danger",
                                action: async () => {
                                  await act.deleteThread(t.id);
                                  if (t.id === activeId) setActiveId(all.find((x) => x.id !== t.id)?.id ?? NEW);
                                },
                                success: "Conversation deleted.",
                              }),
                          },
                        ]}
                      />
                    </span>
                  )}
                </li>
              );
            })}
            {!listed.length && <li className="px-3 py-2 text-body-sm text-secondary">{query.trim() ? "No conversations match." : "No conversations yet."}</li>}
          </ul>
        </div>
      </aside>

      {/* The open conversation */}
      <section aria-label={current ? current.title : "New conversation"} className={`flex min-w-0 flex-col md:col-span-8 md:min-h-0 ${showList ? "hidden md:flex" : "flex"}`}>
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
          <Link href={profileHref} className="group flex min-w-0 items-center gap-3 rounded-md focus-visible:focus-ring">
            <Avatar name={managerName} src={manager.photo} size="md" />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-body font-medium text-primary group-hover:underline">{managerName}</span>
              <span className="truncate text-body-sm text-secondary">{manager.title ?? "Account manager"}</span>
            </span>
          </Link>
          <button type="button" onClick={() => setShowList(true)} className={`${textActionClass} md:hidden`}>
            <ChatsCircle className="size-4" aria-hidden /> Conversations
          </button>
        </header>

        <PinnedStrip key={activeId} messages={shown} />

        {/* Only the messages scroll (desktop). On phones the page scrolls and the message box stays pinned. */}
        <ol ref={listRef} className="flex min-h-96 flex-col gap-6 px-4 py-6 sm:px-6 md:min-h-0 md:flex-1 md:overflow-y-auto" aria-live="polite">
          {!current ? (
            <li className="flex flex-col items-center gap-3 py-8 text-center">
              <Avatar name={managerName} src={manager.photo} size="lg" />
              <p className="font-display text-display-lg text-primary">Message {manager.firstName}</p>
              <p className="max-w-sm text-body-sm text-secondary">
                {side === "team"
                  ? "Share drafts, ask for photos or files, or check in. Start a new conversation for each topic so things are easy to find later."
                  : "Ask about a post, share photos or files, or paste a link. Start a new conversation for each topic so things are easy to find later."}
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {(side === "team" ? ["Your posts for this week are ready", "Could you send a photo from the event?", "A quick question about your goals"] : ["Can we change a post?", "Here are some photos", "I have an idea for a post"]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setText(s);
                      boxRef.current?.focus();
                    }}
                    className="rounded-full border border-border-strong bg-card px-3 py-2 text-body-sm text-primary transition-colors hover:border-primary-300 hover:bg-primary-50 focus-visible:focus-ring"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </li>
          ) : (
            <>
              <li className="flex flex-wrap items-center justify-center gap-2 text-center">
                <span className="text-body-sm font-medium text-primary">{current.title}</span>
                <Pill>{current.count === 1 ? "1 message" : `${current.count} messages`}</Pill>
              </li>
              {shown.map((m) => {
                const d = day(m.at);
                const showDay = d !== lastDay;
                lastDay = d;
                const mine = m.fromUserId === me.id;
                return (
                  <Fragment key={m.id}>
                    {showDay && (
                      <li className="flex items-center gap-3 text-caption text-secondary" aria-label={d}>
                        <span className="h-px flex-1 bg-border" aria-hidden />
                        {d}
                        <span className="h-px flex-1 bg-border" aria-hidden />
                      </li>
                    )}
                    <ChatMessage
                      m={m}
                      mine={mine}
                      divided={!showDay}
                      author={m.asTeam ? (side === "team" ? "Bluecut team" : "Your account team") : managerName}
                      authorPhoto={m.asTeam ? undefined : manager.photo}
                      meId={me.id}
                      nameOf={(id) => (id === manager.id ? manager.firstName : side === "team" ? "Bluecut team" : "Your account team")}
                      savingFile={pending(`save-${m.id}`)}
                      onSaveFile={() => run(`save-${m.id}`, () => act.saveFileToBrand(m.id), side === "team" ? `Saved to ${manager.firstName}'s Brand.` : "Saved to Your brand.")}
                      onReact={(kind) => run(`react-${m.id}`, () => act.reactToMessage(m.id, me.id, kind))}
                      onPin={() => run(`pin-${m.id}`, () => act.togglePinMessage(m.id), m.pinned ? "Unpinned." : "Pinned to the top of this conversation.")}
                      onEdit={(t) => run(`edit-${m.id}`, () => act.editMessage(m.id, t), "Message updated.")}
                      savingEdit={pending(`edit-${m.id}`)}
                    />
                  </Fragment>
                );
              })}
            </>
          )}
          {pending("send") && (
            <li className="self-end text-caption text-secondary" aria-live="polite">
              Sending
            </li>
          )}
          {/* Room under the last message, so the pinned message box never covers it. */}
          <li ref={endRef} aria-hidden className="scroll-mb-64 md:scroll-mb-48" />
        </ol>

        {/* Composer: pinned to the bottom of the screen while the conversation scrolls (above the phone's bottom bar). */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="sticky bottom-24 z-10 flex flex-col gap-2 border-t border-border bg-card p-4 sm:px-6 md:static md:rounded-br-lg"
        >
          <div className="flex flex-col gap-2 rounded-lg border border-border-strong bg-card p-2 focus-within:border-primary-600">
            {file && (
              <span className="flex items-center gap-3 self-start rounded-md bg-neutral-50 px-3 py-2">
                {(file.kind === "image" && file.src) || file.poster ? (
                  <span className="relative size-10 shrink-0 overflow-hidden rounded-sm">
                    <Image src={(file.poster ?? file.src)!} alt="" fill sizes="40px" className="object-cover" />
                  </span>
                ) : (
                  <FileText className="size-6 shrink-0 text-primary-600" aria-hidden />
                )}
                <span className="flex min-w-0 flex-col">
                  <span className="max-w-48 truncate text-body-sm text-primary">{file.name}</span>
                  <span className="text-caption text-secondary">{file.size}</span>
                </span>
                <button type="button" onClick={() => setFile(null)} aria-label={`Remove ${file.name}`} className="flex size-6 items-center justify-center rounded-full text-secondary transition-colors hover:bg-primary-50 hover:text-primary-700 focus-visible:focus-ring">
                  <X className="size-4" aria-hidden />
                </button>
              </span>
            )}
            <label>
              <span className="sr-only">Message to {manager.firstName}</span>
              <textarea
                ref={boxRef}
                rows={1}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={listening ? "Listening. Speak now" : `Message ${manager.firstName}`}
                className="block w-full resize-none bg-transparent px-2 py-2 text-body-sm text-primary placeholder:text-neutral-400 focus-visible:outline-none"
              />
            </label>
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1">
                <input
                  ref={fileRef}
                  type="file"
                  aria-label="Choose a file or photo"
                  className="sr-only"
                  tabIndex={-1}
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    e.target.value = "";
                    try {
                      setFile(await prepareAttachment(f));
                    } catch (err) {
                      toast((err as Error).message, "danger");
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  aria-label="Attach a file or photo"
                  title="Attach a file or photo"
                  className="flex size-10 items-center justify-center rounded-full text-secondary hover:bg-primary-50 hover:text-primary-700 focus-visible:focus-ring"
                >
                  <Paperclip className="size-5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={toggleDictation}
                  aria-pressed={listening}
                  aria-label={listening ? "Stop voice typing" : "Voice typing: speak and it types for you"}
                  title={listening ? "Stop voice typing" : "Voice typing"}
                  className={`flex size-10 items-center justify-center rounded-full focus-visible:focus-ring ${listening ? "bg-primary-50 text-primary-600 hover:bg-primary-100 hover:text-primary-700" : "text-secondary hover:bg-primary-50 hover:text-primary-700"}`}
                >
                  {listening ? <Stop className="size-5" aria-hidden /> : <Microphone className="size-5" aria-hidden />}
                </button>
                {listening && (
                  <span className="flex items-center gap-2 text-caption text-primary-600" aria-live="polite">
                    <VoiceWave active={listening} /> Listening
                  </span>
                )}
              </span>
              <button
                type="submit"
                aria-label="Send"
                disabled={(!text.trim() && !file) || pending("send")}
                className="flex size-10 items-center justify-center rounded-full bg-primary-600 text-inverse transition-colors hover:bg-primary-700 focus-visible:focus-ring disabled:cursor-not-allowed disabled:bg-primary-200"
              >
                <PaperPlaneTilt className="size-5" aria-hidden />
              </button>
            </div>
          </div>
          <p className="flex flex-wrap items-center justify-between gap-2 text-caption text-secondary">
            <span>Enter to send. Shift and Enter for a new line.</span>
            {side === "client" && (
              <span>
                Need to talk? <TextLink href="/calls" className="underline">Book a call</TextLink>
              </span>
            )}
          </p>
        </form>
      </section>

      {renaming && (
        <Dialog open onClose={() => setRenaming(null)} title="Rename conversation">
          <Input label="Name" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} maxLength={60} />
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="cancel" onClick={() => setRenaming(null)}>
              Cancel
            </Button>
            <Button
              loading={pending("rename")}
              disabled={!newTitle.trim()}
              onClick={async () => {
                if (await run("rename", () => act.renameThread(renaming.id, newTitle.trim()), "Conversation renamed.")) setRenaming(null);
              }}
            >
              Save
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

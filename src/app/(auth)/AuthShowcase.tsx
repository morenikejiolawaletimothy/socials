"use client";

import {
  CalendarBlank,
  CheckCircle,
  LinkedinLogo,
  PencilSimple,
  type Icon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;
// How long each card rests in the middle before the next one comes down the line.
const HOLD_MS = 3800;

/* ---------- Small pieces every card is built from ---------- */

type Tone = "done" | "doing" | "todo";
const toneClass: Record<Tone, string> = { done: "bg-success-bg", doing: "bg-warning-bg", todo: "bg-primary-100" };

function Pill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return <span className={`shrink-0 rounded-sm px-2 py-1 text-caption text-secondary ${toneClass[tone]}`}>{children}</span>;
}

function Row({ icon: I, label, last, children }: { icon?: Icon; label: string; last?: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex items-center justify-between gap-3 py-3 ${last ? "" : "border-b border-border"}`}>
      <span className="flex min-w-0 items-center gap-2">
        {I && <I className="size-4 shrink-0 text-primary-600" />}
        <span className="truncate text-body-sm text-primary">{label}</span>
      </span>
      {children}
    </div>
  );
}

/* ---------- The story: how we onboard, what we do, how it helps ---------- */

const story: { title: string; caption: string; body: React.ReactNode }[] = [
  {
    title: "Connect LinkedIn",
    caption: "You connect through LinkedIn's own sign-in. We never see your password.",
    body: (
      <>
        <Row icon={LinkedinLogo} label="LinkedIn connected">
          <Pill tone="done">Done</Pill>
        </Row>
        <Row label="Post for you">
          <Pill tone="done">On</Pill>
        </Row>
        <Row label="Comment for you" last>
          <Pill tone="todo">Needs your OK</Pill>
        </Row>
      </>
    ),
  },
  {
    title: "Two short calls",
    caption: "Two 30-minute calls with your manager, at times that suit you.",
    body: (
      <>
        <Row icon={CalendarBlank} label="Goals call, Mon 10am">
          <Pill tone="done">Booked</Pill>
        </Row>
        <Row icon={CalendarBlank} label="Strategy call, Thu 10am" last>
          <Pill tone="done">Booked</Pill>
        </Row>
      </>
    ),
  },
  {
    title: "Your strategy",
    caption: "One clear goal, with weekly targets you can measure.",
    body: (
      <div className="flex flex-col gap-3 pt-3">
        <p className="text-body-sm text-primary">Be known for payments in West Africa.</p>
        <div className="flex flex-wrap gap-2">
          <Pill tone="todo">2 posts a week</Pill>
          <Pill tone="todo">10 comments</Pill>
          <Pill tone="todo">15 connections</Pill>
        </div>
        <span className="flex items-center gap-1 text-caption text-success">
          <CheckCircle className="size-4" /> Approved by you
        </span>
      </div>
    ),
  },
  {
    title: "Posts you approve",
    caption: "Your manager writes in your voice. Nothing goes live without you.",
    body: (
      <>
        <Row icon={PencilSimple} label="Drafted by your manager">
          <Pill tone="done">Done</Pill>
        </Row>
        <Row icon={CheckCircle} label="Approved by you">
          <Pill tone="done">Done</Pill>
        </Row>
        <Row icon={CalendarBlank} label="Goes live Tuesday 9am" last>
          <Pill tone="todo">Scheduled</Pill>
        </Row>
      </>
    ),
  },
  {
    title: "This week",
    caption: "Posts, comments and connections, done every week.",
    body: (
      <>
        <Row label="2 posts published">
          <Pill tone="done">Done</Pill>
        </Row>
        <Row label="Comments on target posts">
          <Pill tone="doing">Ongoing</Pill>
        </Row>
        <Row label="Connection requests" last>
          <Pill tone="todo">To do</Pill>
        </Row>
      </>
    ),
  },
  {
    title: "What changed",
    caption: "A weekly update against your goal, not likes.",
    body: (
      <div className="flex items-end justify-between gap-4 pt-3">
        <span className="flex flex-col">
          <span className="font-display text-display-xl text-primary">+38%</span>
          <span className="text-caption text-secondary">Profile views from your target list</span>
        </span>
        <span className="flex h-12 items-end gap-1">
          {["h-3", "h-4", "h-4", "h-6", "h-8", "h-12"].map((h, i, all) => (
            <span key={i} className={`w-2 rounded-full ${h} ${i === all.length - 1 ? "bg-primary-600" : "bg-primary-100"}`} />
          ))}
        </span>
      </div>
    ),
  },
];

/* ---------- The panel ---------- */

/** The brand panel beside every auth form: a short story told in cards that travel down one line. */
export function AuthShowcase() {
  return (
    <MotionConfig reducedMotion="user">
      <Story />
    </MotionConfig>
  );
}

function Story() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % story.length), HOLD_MS);
    return () => clearInterval(t);
  }, []);
  const item = story[index];

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-xl bg-primary-950">
      <div className="absolute -left-1/4 top-1/4 h-2/3 w-3/4 rounded-full bg-primary-600 opacity-60 blur-3xl" />
      <div className="absolute -right-1/4 bottom-0 h-1/2 w-3/4 rounded-full bg-primary-300 opacity-40 blur-3xl" />

      {/* The line every card travels along, with a light running down it. */}
      <div className="absolute bottom-36 top-0 left-1/2 w-px bg-card/20">
        {!reduce && (
          <motion.span
            className="absolute left-1/2 h-24 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-card to-transparent"
            animate={{ top: ["-10%", "110%"] }}
            transition={{ duration: HOLD_MS / 1000, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>

      <div className="relative h-72 w-80">
        <AnimatePresence initial={false}>
          <motion.div
            key={index}
            initial={{ y: "-70vh", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "70vh", opacity: 0 }}
            transition={{ duration: 1, ease: EASE }}
            className="absolute inset-x-0 top-1/2 -translate-y-1/2"
          >
            <div className="rounded-lg bg-card px-6 pb-3 pt-5 shadow-lg ring-4 ring-card/30">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary-600 text-caption font-medium text-inverse">{index + 1}</span>
                <span className="text-body-sm font-medium text-primary">{item.title}</span>
              </div>
              {item.body}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-4 px-10">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="max-w-sm text-center text-body text-inverse"
          >
            {item.caption}
          </motion.p>
        </AnimatePresence>
        <div className="flex gap-2">
          {story.map((s, i) => (
            <span key={s.title} className={`h-1.5 rounded-full transition-all duration-500 ${i === index ? "w-6 bg-card" : "w-1.5 bg-card/30"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

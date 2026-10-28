"use client";

import { ChartLineUp, CheckCircle, PencilSimple, UsersThree, type Icon } from "@phosphor-icons/react";
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

// What Bluecut does for a client, one line at a time, typed out like Lovable's prompt.
const lines: { text: string; icon: Icon }[] = [
  { text: "Your post for Tuesday is ready to review.", icon: PencilSimple },
  { text: "Approved. It goes live Tuesday at 9am.", icon: CheckCircle },
  { text: "15 connection requests are ready to send.", icon: UsersThree },
  { text: "Your weekly update is ready to read.", icon: ChartLineUp },
];

const TYPE_MS = 40;
const HOLD_MS = 2400;
const ERASE_MS = 14;

function useTypedLines() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(0);
  const [erasing, setErasing] = useState(false);
  const text = lines[index].text;

  useEffect(() => {
    if (reduce) {
      const t = setTimeout(() => setIndex((i) => (i + 1) % lines.length), HOLD_MS + 1600);
      return () => clearTimeout(t);
    }
    if (!erasing && shown < text.length) {
      const t = setTimeout(() => setShown((n) => n + 1), TYPE_MS);
      return () => clearTimeout(t);
    }
    if (!erasing) {
      const t = setTimeout(() => setErasing(true), HOLD_MS);
      return () => clearTimeout(t);
    }
    if (shown > 0) {
      const t = setTimeout(() => setShown((n) => n - 1), ERASE_MS);
      return () => clearTimeout(t);
    }
    setErasing(false);
    setIndex((i) => (i + 1) % lines.length);
  }, [reduce, erasing, shown, text]);

  return { line: lines[index], index, typed: reduce ? text : text.slice(0, shown) };
}

/** The brand panel beside every auth form: slow-moving brand blues and a card that types what Bluecut does. */
export function AuthShowcase() {
  return (
    <MotionConfig reducedMotion="user">
      <Panel />
    </MotionConfig>
  );
}

function Panel() {
  const { line, index, typed } = useTypedLines();
  const drift = (x: number, y: number, duration: number) => ({
    animate: { x: [0, x, 0], y: [0, y, 0] },
    transition: { duration, repeat: Infinity, ease: "easeInOut" as const },
  });

  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden rounded-xl bg-primary-950">
      <motion.div {...drift(40, 60, 18)} className="absolute -left-1/4 top-1/4 h-2/3 w-3/4 rounded-full bg-primary-600 opacity-80 blur-3xl" />
      <motion.div {...drift(-60, -40, 22)} className="absolute -right-1/4 bottom-0 h-1/2 w-3/4 rounded-full bg-primary-300 opacity-70 blur-3xl" />
      <motion.div {...drift(30, -30, 16)} className="absolute bottom-1/4 left-1/4 h-1/3 w-1/2 rounded-full bg-primary-100 opacity-60 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-primary-950 to-transparent" />

      <div className="relative flex w-full max-w-md items-center gap-4 rounded-lg bg-card/85 px-5 py-4 shadow-lg backdrop-blur-md">
        <p className="min-h-6 flex-1 text-body text-primary">
          {typed}
          <span className="ml-px inline-block h-5 w-0.5 translate-y-1 animate-pulse bg-primary-600" />
        </p>
        <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-600 text-inverse">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={index}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex"
            >
              <line.icon className="size-5" />
            </motion.span>
          </AnimatePresence>
        </span>
      </div>
    </div>
  );
}

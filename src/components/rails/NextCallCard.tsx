"use client";

import { CalendarBlank, Clock, VideoCamera } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Card, Meta, textActionClass } from "@/components/ui";
import { day, time } from "@/lib/format";
import { useMyClient, type Call } from "@/lib/mock";

/** Fallback names when a call has no title of its own. */
const callName = { goals: "Goals call", strategy: "Strategy call", "check-in": "Check-in call" };
export const callTitle = (c: Call) => c.title ?? callName[c.kind];

export const quietLink = "rounded-sm text-body-sm font-medium text-secondary hover:text-primary hover:underline focus-visible:focus-ring";

/** How long each call stays in view before the card moves to the next one. */
const ADVANCE_MS = 5000;
/** The most calls the carousel slides through. */
const MAX_SLIDES = 5;

/** Booked calls that have not finished yet, soonest first. */
export function upcomingCalls(calls: Call[]) {
  return calls.filter((c) => c.status === "booked" && new Date(c.at).getTime() > Date.now() - 30 * 60_000).sort((a, b) => a.at.localeCompare(b.at));
}

/** One booked call: its title, day and time, Join call and Reschedule. Used in the carousel and on the Calls page. */
export function CallRow({ call: c }: { call: Call }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-body font-medium text-primary">{callTitle(c)}</span>
      <Meta icon={Clock}>
        {day(c.at)} · {time(c.at)} · {c.minutes} min
      </Meta>
      <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {c.meetUrl && (
          <a href={c.meetUrl} target="_blank" rel="noreferrer" className={textActionClass}>
            <VideoCamera className="size-4" aria-hidden />
            Join call
          </a>
        )}
        {/* Check-ins are rescheduled on the Calls page (pick a new open time); onboarding calls re-run their booking step. */}
        <Link href={c.kind === "check-in" ? "/calls" : `/setup/calls${c.kind === "strategy" ? "?step=2" : ""}`} className={quietLink}>
          Reschedule
        </Link>
      </span>
    </div>
  );
}

/**
 * Side card on client pages: booked calls with the manager in a one-row carousel, soonest first.
 * It moves to the next call by itself and loops. It pauses while the pointer is over it, while it is touched
 * or clicked, and while something in it has focus; people can also swipe or scroll it, or pick a dot.
 * No auto-advance with reduced motion. "View all" opens the Calls page. Shows only when a call is booked.
 */
export function NextCallCard() {
  const { calls } = useMyClient();
  return <CallsCarousel calls={upcomingCalls(calls)} viewAllHref="/calls" renderCall={(c) => <CallRow call={c} />} />;
}

/**
 * The Upcoming calls card itself, shared by the client (NextCallCard) and the manager (rails CallsCard):
 * one call per slide, auto-advancing dots, and View all under a divider. Hidden when there are no calls.
 */
export function CallsCarousel({ calls: all, viewAllHref, renderCall }: { calls: Call[]; viewAllHref: string; renderCall: (c: Call) => React.ReactNode }) {
  // Only the next few calls slide, so the dots stay on one short row. View all shows the rest.
  const upcoming = all.slice(0, MAX_SLIDES);
  const count = upcoming.length;

  const track = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  activeRef.current = active;
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = hovered || pressed || focused;

  const goTo = (i: number) => {
    const el = track.current;
    const slide = el?.children[i] as HTMLElement | undefined;
    if (el && slide) el.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
  };

  // Move to the next call on a timer, looping back to the first, unless the person is using the card.
  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      const next = (activeRef.current + 1) % count;
      setActive(next);
      goTo(next);
    }, ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [count, paused]);

  // Keep the dots in step when the person swipes or scrolls the row themselves.
  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const slides = Array.from(el.children) as HTMLElement[];
    const nearest = slides.reduce((best, s, i) => (Math.abs(s.offsetLeft - el.scrollLeft) < Math.abs(slides[best].offsetLeft - el.scrollLeft) ? i : best), 0);
    setActive(nearest);
  };

  if (!count) return null;

  return (
    <Card
      title="Upcoming calls"
      action={
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600" aria-hidden>
          <CalendarBlank className="size-4" />
        </span>
      }
    >
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Upcoming calls"
        className="flex flex-col gap-4"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          setPressed(false);
        }}
        onPointerDown={() => setPressed(true)}
        onPointerUp={(e) => e.pointerType !== "mouse" && setPressed(false)}
        onPointerCancel={() => setPressed(false)}
        onFocus={() => setFocused(true)}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setFocused(false)}
      >
        <ul ref={track} onScroll={onScroll} className="no-scrollbar relative flex snap-x snap-mandatory gap-6 overflow-x-auto">
          {upcoming.map((c, i) => (
            <li
              key={c.id}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              className="min-w-0 shrink-0 basis-full snap-start"
            >
              {renderCall(c)}
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
          {count > 1 ? (
            <div className="-ml-1.5 flex items-center">
              {upcoming.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  aria-label={`Show call ${i + 1} of ${count}`}
                  aria-current={i === active || undefined}
                  onClick={() => {
                    setActive(i);
                    goTo(i);
                  }}
                  className="flex size-5 items-center justify-center rounded-full focus-visible:focus-ring"
                >
                  <span className={`h-1.5 rounded-full transition-all ${i === active ? "w-3 bg-primary-600" : "w-1.5 bg-neutral-300"}`} />
                </button>
              ))}
            </div>
          ) : (
            <span />
          )}
          <Link href={viewAllHref} className={`shrink-0 ${textActionClass}`}>
            {all.length > count ? `View all ${all.length}` : "View all"}
          </Link>
        </div>
      </div>
    </Card>
  );
}

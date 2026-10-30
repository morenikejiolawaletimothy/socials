"use client";

import { CalendarBlank, CheckCircle, LinkedinLogo } from "@phosphor-icons/react";
import { AnimatePresence, motion, useAnimationFrame, useInView, useMotionValue, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { DUR, EASE, Reveal, STAGGER, Stagger, StaggerItem, useAutoplay } from "./motion";

const tabs = [
  {
    title: "Connect and two short calls",
    text: "Connect LinkedIn through its own sign-in, then two 30-minute calls to agree your goals and your strategy.",
    img: "/landing/hero.jpg",
    alt: "A leader working with her team",
  },
  {
    title: "We create, you approve",
    text: "Your manager prepares posts and engagement in your voice. Nothing goes out without your say.",
    img: "/landing/how-2.jpg",
    alt: "A leader reviewing work at his desk",
  },
  {
    title: "See your progress",
    text: "Weekly updates against the goal you set, not likes. You always see what was done.",
    img: "/landing/hero-2.jpg",
    alt: "A leader in a meeting",
  },
];

// The card on the photo changes with the step, so each one shows the part of the app that step is about.
const rise = (i: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DUR.base, ease: EASE, delay: 0.15 + i * STAGGER },
});

function CardHead({ title, pill, tone }: { title: string; pill: string; tone: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="lp-small text-neutral-950">{title}</span>
      <span className={`rounded-[6px] px-2.5 py-1 lp-caption text-neutral-900/60 ${tone}`}>{pill}</span>
    </div>
  );
}

/** Step 1: LinkedIn connected and both calls booked. */
function SetupCard() {
  const rows = [
    { icon: LinkedinLogo, label: "LinkedIn connected", note: "Done" },
    { icon: CalendarBlank, label: "Goals call", note: "Mon, 10am" },
    { icon: CalendarBlank, label: "Strategy call", note: "Thu, 10am" },
  ];
  return (
    <div className="flex flex-col gap-4">
      <CardHead title="Your setup" pill="3 of 3 done" tone="bg-success-bg" />
      <ul className="flex flex-col">
        {rows.map((r, i) => (
          <motion.li key={r.label} {...rise(i)} className={`flex items-center justify-between py-2.5 ${i < rows.length - 1 ? "border-b-[0.667px] border-neutral-100" : ""}`}>
            <span className="flex items-center gap-2">
              <r.icon className="size-4 text-primary-600" aria-hidden />
              <span className="lp-caption text-neutral-900">{r.label}</span>
            </span>
            <span className="flex items-center gap-1 lp-caption text-neutral-900/60">
              <CheckCircle className="size-3.5 text-success" aria-hidden />
              {r.note}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/** Step 2: a drafted post waiting for the client's yes. */
function ReviewCard() {
  return (
    <div className="flex flex-col gap-4">
      <CardHead title="Post for Tuesday" pill="Ready to review" tone="bg-warning-bg" />
      <motion.div {...rise(0)} className="flex flex-col gap-2 rounded-[8px] border-[0.667px] border-neutral-100 p-3">
        <span className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary-100 text-[10px] font-semibold text-primary-900">CO</span>
          <span className="lp-caption text-neutral-900">Chidi Okeke</span>
        </span>
        <span className="lp-caption text-neutral-900/70">Three things I learned moving payments across West Africa this year.</span>
        <span className="h-2 w-full rounded-full bg-neutral-50" />
        <span className="h-2 w-2/3 rounded-full bg-neutral-50" />
      </motion.div>
      <motion.div {...rise(1)} className="flex gap-2">
        <span className="flex-1 rounded-[8px] border-[0.667px] border-neutral-100 px-3 py-1.5 text-center lp-caption text-neutral-900">Ask for changes</span>
        <span className="flex-1 rounded-[8px] bg-primary-600 px-3 py-1.5 text-center lp-caption text-inverse">Approve</span>
      </motion.div>
    </div>
  );
}

/** Step 3: the weekly update, measured against the goal. */
function ProgressCard() {
  const bars = [28, 36, 34, 48, 60, 76];
  return (
    <div className="flex flex-col gap-4">
      <CardHead title="Weekly update" pill="Week 6" tone="bg-primary-100" />
      <motion.div {...rise(0)} className="flex items-end justify-between gap-4">
        <span className="flex flex-col">
          <span className="text-[28px] font-medium leading-[32px] tracking-[-0.8px] text-neutral-950">+38%</span>
          <span className="lp-caption text-neutral-900/60">Profile views from your target list</span>
        </span>
        <span className="flex h-12 items-end gap-1">
          {bars.map((h, i) => (
            <motion.span
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: DUR.base, ease: EASE, delay: 0.2 + i * 0.06 }}
              className={`w-2 rounded-full ${i === bars.length - 1 ? "bg-primary-600" : "bg-primary-100"}`}
            />
          ))}
        </span>
      </motion.div>
      <motion.div {...rise(1)} className="flex items-center justify-between border-t-[0.667px] border-neutral-100 pt-3">
        <span className="lp-caption text-neutral-900">Meetings from LinkedIn</span>
        <span className="lp-small text-neutral-950">3</span>
      </motion.div>
    </div>
  );
}

/** Three steps that play on their own while in view. Hover pauses; a click jumps to a step. */
export function HowItWorks() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "0px 0px -20% 0px" });
  const { progress, restart, reduce } = useAutoplay(inView && !paused, () => setActive((a) => (a + 1) % tabs.length));

  const select = (i: number) => {
    restart();
    setActive(i);
  };

  return (
    <section id="how" className="flex scroll-mt-16 flex-col items-center gap-[60px] overflow-hidden px-5 py-[100px] md:px-20">
      <div className="w-full max-w-[1280px] md:px-10">
        <Reveal as="h2" className="max-w-[527px] lp-h2 lp-tone text-neutral-950 tone-dark:text-inverse">
          How it works, from first call to first results
        </Reveal>
      </div>
      <div ref={ref} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} className="flex w-full max-w-[1280px] flex-col gap-12 md:px-10">
        <Stagger className="flex flex-col gap-8 md:flex-row md:gap-12">
          <div role="tablist" aria-label="How it works" className="contents">
            {tabs.map((t, i) => (
              <StaggerItem key={t.title} className="flex flex-1">
                <button
                  type="button"
                  role="tab"
                  id={`how-tab-${i}`}
                  aria-selected={active === i}
                  aria-controls="how-panel"
                  onClick={() => select(i)}
                  className="group relative flex flex-1 flex-col gap-[7.4px] pt-[27.33px] text-left focus-visible:focus-ring"
                >
                  <span className="lp-tone absolute inset-x-0 top-0 h-[3px] overflow-hidden bg-neutral-50 tone-dark:bg-inverse/15">
                    {active === i && (
                      <motion.span style={{ scaleX: reduce ? 1 : progress }} className="absolute inset-0 origin-left bg-primary-600" />
                    )}
                  </span>
                  <span className="lp-tab-title lp-tone text-primary tone-dark:text-inverse">{t.title}</span>
                  <span className={`lp-body text-neutral-400 transition-[opacity,color] duration-300 tone-dark:text-neutral-300 ${active === i ? "" : "opacity-40 group-hover:opacity-70"}`}>{t.text}</span>
                </button>
              </StaggerItem>
            ))}
          </div>
        </Stagger>
        <Reveal className="relative aspect-[1200/643] w-full">
          <div id="how-panel" role="tabpanel" aria-labelledby={`how-tab-${active}`} className="absolute inset-0 overflow-hidden rounded-[16px] bg-neutral-900">
            <AnimatePresence initial={false}>
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DUR.slow, ease: EASE }}
                className="absolute inset-0"
              >
                <Image src={tabs[active].img} alt={tabs[active].alt} fill sizes="(min-width: 1280px) 1200px, 100vw" className="object-cover object-[50%_30%]" />
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-neutral-950/30" />
          </div>
          <div className="absolute left-1/2 top-[65.56%] hidden w-[320px] -translate-x-1/2 rounded-[12px] bg-card p-5 shadow-[0px_0px_0px_4px_rgba(255,255,255,0.5)] sm:block">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: DUR.fast, ease: EASE }}
              >
                {active === 0 && <SetupCard />}
                {active === 1 && <ReviewCard />}
                {active === 2 && <ProgressCard />}
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const results = [
  { img: "/landing/result-1.jpg", big: "Visibility", text: "Profile views from the people you want to reach, not just anyone." },
  { img: "/landing/result-2.jpg", big: "Invites", text: "Invitations to speak, to advise and to join boards and panels." },
  { img: "/landing/result-3.jpg", big: "Meetings", text: "Conversations with investors, clients and partners who found you." },
  { img: "/landing/result-4.jpg", big: "Trust", text: "A clear point of view that people in your field recognise." },
  { img: "/landing/result-5.jpg", big: "Network", text: "Connections with the decision-makers your goal depends on." },
  { img: "/landing/result-6.jpg", big: "Reach", text: "Your posts in front of the right audience, week after week." },
];

const radial =
  "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 387 508' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23g)'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(0 -36.068 -38.7 0 387 239.78)'><stop stop-color='rgba(0,0,0,0)' offset='0'/><stop stop-color='rgba(0,0,0,0.5)' offset='1'/></radialGradient></defs></svg>\")";

// Pixels per second. Slow enough to read a card as it passes.
const SPEED = 28;

/**
 * What we measure, as a row of photo cards that drifts left without end. The list is doubled so the loop
 * has no seam. Hovering pauses it; dragging or swiping moves it by hand.
 */
export function Results() {
  const rowRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const inView = useInView(rowRef);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const [hovering, setHovering] = useState(false);
  const drag = useRef<{ x: number; from: number } | null>(null);

  // Keep the offset inside one copy of the list, so the doubled list always fills the row.
  const wrap = (v: number) => {
    const half = (listRef.current?.scrollWidth ?? 0) / 2;
    return half ? (((v % half) - half) % half) : v;
  };

  useAnimationFrame((_, delta) => {
    if (!inView || hovering || reduce || drag.current) return;
    x.set(wrap(x.get() - (SPEED * delta) / 1000));
  });

  return (
    <section id="results" className="flex scroll-mt-16 flex-col items-center gap-[60px] overflow-hidden px-5 py-[100px] md:px-20">
      <div className="flex w-full max-w-[1280px] flex-col gap-[23px] md:px-10">
        <Reveal as="h2" className="max-w-[620px] lp-h2 lp-tone text-neutral-950 tone-dark:text-inverse">
          Results measured
          <br />
          against your goal
        </Reveal>
        <Reveal as="p" delay={0.1} className="max-w-[500px] lp-body opacity-60 lp-tone text-neutral-950 tone-dark:text-inverse">
          We agree your goal on the first call, then track what moves it. Likes and followers come second.
        </Reveal>
      </div>
      <Reveal delay={0.1} className="w-full max-w-[1280px] md:px-10">
        <div
          ref={rowRef}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            drag.current = { x: e.clientX, from: x.get() };
          }}
          onPointerMove={(e) => drag.current && x.set(wrap(drag.current.from + e.clientX - drag.current.x))}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
          className="cursor-grab touch-pan-y overflow-hidden select-none active:cursor-grabbing md:[mask-image:linear-gradient(90deg,transparent_0,black_4%,black_96%,transparent_100%)]"
        >
          <motion.ul ref={listRef} style={{ x }} aria-label="Results we track" className="flex w-max">
            {[...results, ...results].map((r, i) => (
              <li
                key={i}
                aria-hidden={i >= results.length}
                className="group relative mr-5 h-[360px] w-[260px] shrink-0 overflow-hidden rounded-[12px] outline-1 -outline-offset-1 lp-tone outline-transparent tone-dark:outline-inverse/15 md:h-[400px] md:w-[300px]"
              >
                <Image src={r.img} alt="" fill sizes="300px" draggable={false} className="lp-zoom object-cover group-hover:scale-[1.04]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[40%] to-neutral-950/75 to-[75%]" />
                <div className="absolute inset-0" style={{ backgroundImage: radial, backgroundSize: "100% 100%" }} />
                <div className="absolute inset-x-6 bottom-6 flex flex-col gap-1 transition-transform duration-500 ease-out group-hover:-translate-y-2">
                  <p className="lp-h2 text-inverse">{r.big}</p>
                  <p className="lp-small text-inverse">{r.text}</p>
                </div>
              </li>
            ))}
          </motion.ul>
        </div>
      </Reveal>
    </section>
  );
}

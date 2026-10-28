"use client";

import { AnimatePresence, motion, useAnimationFrame, useInView, useMotionValue, useReducedMotion, useScroll, useSpring } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { DUR, EASE, Reveal, STAGGER, Stagger, StaggerItem } from "./motion";

const sideGradient = "linear-gradient(21deg, rgba(0,0,0,0.4) 15%, rgba(0,0,0,0.25) 30%, rgba(0,0,0,0) 72%)";
const centreGradient = "linear-gradient(13.6deg, rgba(0,0,0,0.4) 15%, rgba(0,0,0,0.25) 30%, rgba(0,0,0,0) 72%)";

function SideCard({ src, pos, from }: { src: string; pos: string; from: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: from }}
      whileInView={{ opacity: 0.7, x: 0 }}
      whileHover={{ opacity: 1 }}
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      transition={{ duration: DUR.slow, ease: EASE }}
      className="group relative hidden h-[450px] w-[200px] shrink-0 overflow-hidden rounded-[16px] bg-neutral-900 md:block"
    >
      <Image src={src} alt="" fill sizes="200px" className={`lp-zoom object-cover group-hover:scale-[1.04] ${pos}`} />
      <div className="absolute inset-0" style={{ backgroundImage: sideGradient }} />
    </motion.div>
  );
}

/** Testimonial: one open card between two closed ones. Real testimonials replace the placeholder text. */
export function Testimonials() {
  return (
    <section className="relative flex flex-col items-center gap-[60px] overflow-hidden bg-card px-5 py-[100px] md:px-10">
      <Reveal as="h2" className="w-full max-w-[730px] text-center lp-h2 text-neutral-950">
        Trusted by leaders who value their reputation.
      </Reveal>
      <div className="flex w-full max-w-[1140px] items-center justify-center gap-4 md:h-[450px] md:px-10">
        <SideCard src="/landing/statement-3.jpg" pos="object-[78%_50%]" from={40} />
        <motion.figure
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "0px 0px -15% 0px" }}
          transition={{ duration: DUR.slow, ease: EASE }}
          className="group flex w-full flex-col overflow-hidden rounded-[16px] bg-primary-900 md:h-[450px] md:w-auto md:flex-row md:gap-8"
        >
          <div className="p-3 md:w-[317px] md:shrink-0">
            <div className="relative h-72 overflow-hidden rounded-[8px] md:h-full">
              <Image src="/landing/statement-2.jpg" alt="" fill sizes="(min-width: 768px) 293px, 100vw" className="lp-zoom object-cover object-[30%_50%] group-hover:scale-[1.04]" />
              <div className="absolute inset-0" style={{ backgroundImage: centreGradient }} />
            </div>
          </div>
          <div className="flex flex-col justify-between gap-8 px-6 py-8 md:w-[261px] md:px-0 md:pr-6">
            <blockquote className="lp-quote text-inverse">
              “A real client quote goes here, in their own words, about what changed for them on LinkedIn.”
            </blockquote>
            <figcaption className="flex flex-col gap-0.5">
              <span className="lp-small text-inverse">Client name</span>
              <span className="lp-small-regular text-inverse opacity-60">Role, company</span>
            </figcaption>
          </div>
        </motion.figure>
        <SideCard src="/landing/testimonial-right.jpg" pos="" from={-40} />
      </div>
      <p className="absolute inset-x-5 bottom-10 text-center lp-tag text-neutral-500">Placeholder text. Real client testimonials will replace it before launch.</p>
    </section>
  );
}

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

const tasks = [
  { t: "Approve 3 posts for next week", done: true },
  { t: "Send 15 connection requests", done: true },
  { t: "Read your weekly update", done: false },
];

const TAB_MS = 6000;

/** Three steps that play on their own while in view. Hover pauses; a click jumps to a step. */
export function HowItWorks() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "0px 0px -20% 0px" });
  const reduce = useReducedMotion();
  const progress = useMotionValue(0);

  useAnimationFrame((_, delta) => {
    if (!inView || paused || reduce) return;
    const next = progress.get() + delta / TAB_MS;
    if (next >= 1) {
      progress.set(0);
      setActive((a) => (a + 1) % tabs.length);
    } else progress.set(next);
  });

  const select = (i: number) => {
    progress.set(0);
    setActive(i);
  };

  return (
    <section id="how" className="flex scroll-mt-16 flex-col items-center gap-[60px] overflow-hidden bg-card px-5 py-[100px] md:px-20">
      <div className="w-full max-w-[1280px] md:px-10">
        <Reveal as="h2" className="max-w-[527px] lp-h2 text-neutral-950">
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
                  <span className="absolute inset-x-0 top-0 h-[3px] overflow-hidden bg-neutral-50">
                    {active === i && (
                      <motion.span style={{ scaleX: reduce ? 1 : progress }} className="absolute inset-0 origin-left bg-primary-600" />
                    )}
                  </span>
                  <span className="lp-tab-title text-primary">{t.title}</span>
                  <span className={`lp-body text-neutral-400 transition-opacity duration-300 ${active === i ? "" : "opacity-40 group-hover:opacity-70"}`}>{t.text}</span>
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
            <div className="flex flex-col gap-6">
              <div className="flex gap-2">
                <span className="flex-1 rounded-[8px] bg-primary-100 px-3 py-1.5 text-center lp-caption text-neutral-950">Notes</span>
                <span className="flex-1 rounded-[8px] bg-[#5770cc] px-3 py-1.5 text-center lp-caption text-inverse">Tasks</span>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="lp-small text-neutral-950">This week</span>
                  {tasks.map((k, i) => {
                    const done = k.done && i <= active;
                    return (
                      <span key={k.t} className="flex items-center gap-2">
                        <motion.span
                          animate={{ scale: done ? [0.6, 1.15, 1] : 1 }}
                          transition={{ duration: DUR.base, ease: EASE }}
                          className={`size-3 rounded-full transition-colors duration-300 ${done ? "bg-primary-600" : "border border-neutral-200"}`}
                        />
                        <span className="lp-caption text-neutral-900 opacity-60">{k.t}</span>
                      </span>
                    );
                  })}
                </div>
                <div className="flex flex-col gap-2">
                  <span className="lp-small text-neutral-950">Next week</span>
                  <span className="h-3 w-full rounded-full bg-neutral-50" />
                  <span className="h-3 w-28 rounded-full bg-neutral-50" />
                </div>
              </div>
            </div>
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

/** Lets a mouse drag a horizontal scroller, like a finger would. Clicks after a drag are swallowed. */
function useDragScroll() {
  const ref = useRef<HTMLUListElement>(null);
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });
  return {
    ref,
    onPointerDown: (e: React.PointerEvent) => {
      if (e.pointerType !== "mouse" || !ref.current) return;
      drag.current = { down: true, x: e.clientX, left: ref.current.scrollLeft, moved: false };
      ref.current.style.scrollSnapType = "none";
    },
    onPointerMove: (e: React.PointerEvent) => {
      const d = drag.current;
      if (!d.down || !ref.current) return;
      const dx = e.clientX - d.x;
      if (Math.abs(dx) > 4) d.moved = true;
      ref.current.scrollLeft = d.left - dx;
    },
    onPointerUp: () => {
      drag.current.down = false;
      if (ref.current) ref.current.style.scrollSnapType = "";
    },
    onClickCapture: (e: React.MouseEvent) => {
      if (drag.current.moved) e.preventDefault();
    },
  };
}

/** What we measure, as a row of photo cards you can swipe or drag. A thin bar shows how far along you are. */
export function Results() {
  const dragProps = useDragScroll();
  const { scrollXProgress } = useScroll({ container: dragProps.ref });
  const bar = useSpring(scrollXProgress, { stiffness: 200, damping: 30 });

  return (
    <section className="flex flex-col items-center gap-[60px] overflow-hidden bg-card px-5 py-[100px] md:px-20">
      <div className="flex w-full max-w-[1280px] flex-col gap-[23px] md:px-10">
        <Reveal as="h2" className="max-w-[620px] lp-h2 text-neutral-950">
          Results measured
          <br />
          against your goal
        </Reveal>
        <Reveal as="p" delay={0.1} className="max-w-[500px] lp-body text-neutral-950 opacity-60">
          We agree your goal on the first call, then track what moves it. Likes and followers come second.
        </Reveal>
      </div>
      <div className="flex w-full max-w-[1280px] flex-col gap-8 md:px-10">
        <motion.ul
          {...dragProps}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: STAGGER } } }}
          aria-label="Results we track"
          className="no-scrollbar flex cursor-grab snap-x snap-mandatory gap-5 overflow-x-auto select-none active:cursor-grabbing"
        >
          {results.map((r) => (
            <StaggerItem as="li" key={r.big} className="group relative h-[508px] w-[85%] shrink-0 snap-start overflow-hidden rounded-[12px] sm:w-[387px]">
              <Image src={r.img} alt="" fill sizes="387px" draggable={false} className="lp-zoom object-cover group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[48.6%] to-neutral-950/70 to-[71.4%]" />
              <div className="absolute inset-0" style={{ backgroundImage: radial, backgroundSize: "100% 100%" }} />
              <div className="absolute inset-x-6 top-[344px] flex flex-col gap-1 transition-transform duration-500 ease-out group-hover:-translate-y-2">
                <p className="lp-big text-inverse">{r.big}</p>
                <p className="lp-small text-inverse">{r.text}</p>
              </div>
            </StaggerItem>
          ))}
        </motion.ul>
        <div aria-hidden className="h-[3px] w-full max-w-[240px] overflow-hidden rounded-full bg-neutral-100">
          <motion.div style={{ scaleX: bar }} className="h-full origin-left bg-primary-600" />
        </div>
      </div>
    </section>
  );
}

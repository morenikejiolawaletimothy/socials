"use client";

import { Play, X } from "@phosphor-icons/react";
import { AnimatePresence, motion, useInView, type PanInfo } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AUTOPLAY_MS, DUR, EASE, Reveal, useAutoplay, useLenis } from "./motion";

type Testimonial = { img: string; pos: string; quote: string; name: string; role: string; video?: string };

// Placeholders. Each real testimonial is a portrait video plus a short written summary of it.
const summary = "“A short summary of this client's video goes here, in their own words, about what changed for them on LinkedIn.”";
const items: Testimonial[] = [
  { img: "/landing/statement-2.jpg", pos: "object-[30%_50%]", quote: summary, name: "Client name", role: "Role, company" },
  { img: "/landing/testimonial-right.jpg", pos: "object-center", quote: summary, name: "Client name", role: "Role, company" },
  { img: "/landing/statement-3.jpg", pos: "object-[78%_50%]", quote: summary, name: "Client name", role: "Role, company" },
  { img: "/landing/statement-1.jpg", pos: "object-center", quote: summary, name: "Client name", role: "Role, company" },
  { img: "/landing/result-4.jpg", pos: "object-center", quote: summary, name: "Client name", role: "Role, company" },
  { img: "/landing/result-5.jpg", pos: "object-center", quote: summary, name: "Client name", role: "Role, company" },
];

const sideGradient = "linear-gradient(21deg, rgba(0,0,0,0.4) 15%, rgba(0,0,0,0.25) 30%, rgba(0,0,0,0) 72%)";
const centreGradient = "linear-gradient(13.6deg, rgba(0,0,0,0.4) 15%, rgba(0,0,0,0.25) 30%, rgba(0,0,0,0) 72%)";
const mod = (n: number, m: number) => ((n % m) + m) % m;
// Three cards either side of the open one, so the row always runs past the edges.
const SLOTS = [-3, -2, -1, 0, 1, 2, 3];
// While cards are moving, hovering does nothing, so the row never chases the cursor.
const SETTLE_MS = 900;
const move = { duration: DUR.slow, ease: EASE };

function useIsDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}

/** Portrait video in a lightbox. Escape or the close button ends it. */
function VideoLightbox({ item, onClose }: { item: Testimonial; onClose: () => void }) {
  const lenis = useLenis();
  useEffect(() => {
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.removeEventListener("keydown", onKey);
    };
  }, [lenis, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: DUR.fast, ease: EASE }}
      role="dialog"
      aria-modal="true"
      aria-label={`Video from ${item.name}`}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 p-5 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: DUR.base, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        className="relative aspect-[9/16] h-[min(80vh,720px)] max-w-full overflow-hidden rounded-[16px] bg-neutral-900"
      >
        {item.video ? (
          <video src={item.video} poster={item.img} controls autoPlay playsInline className="size-full object-cover" />
        ) : (
          <>
            <Image src={item.img} alt="" fill sizes="405px" className={`object-cover ${item.pos}`} />
            <div className="absolute inset-0" style={{ backgroundImage: centreGradient }} />
            <p className="absolute inset-x-6 bottom-6 lp-small text-inverse">The video for this testimonial has not been added yet.</p>
          </>
        )}
        <button
          type="button"
          autoFocus
          onClick={onClose}
          aria-label="Close video"
          className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full bg-card/90 text-primary backdrop-blur-sm transition-colors duration-300 hover:bg-card focus-visible:focus-ring"
        >
          <X className="size-5" aria-hidden />
        </button>
      </motion.div>
    </motion.div>
  );
}

/**
 * A row of video testimonials. The centre card is open; the row moves left on its own every few seconds
 * so the next card slides to the centre and opens. Hovering or clicking a closed card brings it to the centre.
 * On phones one card shows at a time and can be swiped.
 */
export function Testimonials() {
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [playing, setPlaying] = useState<Testimonial | null>(null);
  const lastMove = useRef(0);
  const rowRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rowRef, { margin: "0px 0px -20% 0px" });
  const desktop = useIsDesktop();
  const { progress, restart, reduce } = useAutoplay(inView && !hovering && !playing, () => {
    lastMove.current = performance.now();
    setActive((a) => a + 1);
  });

  const go = (i: number) => {
    if (i === active) return;
    lastMove.current = performance.now();
    restart();
    setActive(i);
  };
  const hoverTo = (i: number) => {
    if (performance.now() - lastMove.current > SETTLE_MS) go(i);
  };
  const onSwipe = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -50) go(active + 1);
    else if (info.offset.x > 50) go(active - 1);
  };
  const closeVideo = useCallback(() => setPlaying(null), []);
  const current = mod(active, items.length);

  return (
    <section className="flex flex-col items-center gap-[60px] overflow-hidden bg-card px-5 py-[100px] md:px-10">
      <Reveal as="h2" className="w-full max-w-[730px] text-center lp-h2 text-neutral-950">
        Trusted by leaders who value their reputation.
      </Reveal>

      <Reveal delay={0.1} className="flex w-full flex-col items-center gap-8">
        <div
          ref={rowRef}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          aria-roledescription="carousel"
          aria-label="Client testimonials"
          className="flex h-[540px] w-full justify-center gap-4 md:h-[450px] md:[mask-image:linear-gradient(90deg,transparent_0,black_8%,black_92%,transparent_100%)]"
        >
          <AnimatePresence initial={false} mode="popLayout">
            {SLOTS.map((slot) => {
              const i = active + slot;
              const item = items[mod(i, items.length)];
              const open = slot === 0;
              if (!desktop && !open) return null;
              return (
                <motion.div
                  key={i}
                  layout="position"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: open ? 1 : 0.7, scale: 1, width: desktop ? (open ? 610 : 200) : "100%" }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={open ? undefined : { opacity: 1 }}
                  transition={{ ...move, layout: move }}
                  onMouseEnter={open ? undefined : () => hoverTo(i)}
                  onClick={open ? undefined : () => go(i)}
                  drag={open && !desktop ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={onSwipe}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${mod(i, items.length) + 1} of ${items.length}`}
                  aria-hidden={!open}
                  className={`group relative h-full max-w-[610px] shrink-0 overflow-hidden rounded-[16px] bg-primary-900 ${open ? "" : "cursor-pointer"}`}
                >
                  <motion.div
                    initial={false}
                    animate={
                      open
                        ? desktop
                          ? { top: 12, left: 12, width: 293, height: 426, borderRadius: 8 }
                          : { top: 12, left: 12, width: "calc(100% - 24px)", height: 288, borderRadius: 8 }
                        : { top: 0, left: 0, width: 200, height: 450, borderRadius: 16 }
                    }
                    transition={move}
                    className="absolute overflow-hidden"
                  >
                    <Image
                      src={item.img}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 293px, 100vw"
                      draggable={false}
                      className={`lp-zoom object-cover group-hover:scale-[1.04] ${item.pos}`}
                    />
                    <div className="absolute inset-0" style={{ backgroundImage: open ? centreGradient : sideGradient }} />
                    {open ? (
                      <button
                        type="button"
                        onClick={() => setPlaying(item)}
                        aria-label={`Play video from ${item.name}`}
                        className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-primary-600 backdrop-blur-sm transition-transform duration-300 hover:scale-110 focus-visible:focus-ring"
                      >
                        <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-card/40" />
                        <Play className="relative size-6" aria-hidden />
                      </button>
                    ) : (
                      <span aria-hidden className="absolute left-1/2 top-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-card/80 text-primary-600 backdrop-blur-sm">
                        <Play className="size-4" />
                      </span>
                    )}
                  </motion.div>

                  <AnimatePresence>
                    {open && (
                      <motion.figure
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE, delay: 0.35 } }}
                        exit={{ opacity: 0, transition: { duration: 0.15 } }}
                        className="absolute bottom-8 left-6 right-6 top-[324px] flex flex-col justify-between gap-6 md:left-[349px] md:top-8"
                      >
                        <blockquote className="lp-quote text-inverse">{item.quote}</blockquote>
                        <figcaption className="flex flex-col gap-0.5">
                          <span className="lp-small text-inverse">{item.name}</span>
                          <span className="lp-small-regular text-inverse opacity-60">{item.role}</span>
                        </figcaption>
                      </motion.figure>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          {items.map((t, k) => {
            const on = k === current;
            return (
              <button
                key={k}
                type="button"
                onClick={() => go(active + (k - current))}
                aria-label={`Show testimonial ${k + 1} of ${items.length}`}
                aria-current={on}
                className="flex h-6 items-center rounded-full focus-visible:focus-ring"
              >
                <motion.span
                  animate={{ width: on ? 40 : 8 }}
                  transition={{ duration: DUR.base, ease: EASE }}
                  className="relative block h-1.5 overflow-hidden rounded-full bg-neutral-100 transition-colors duration-300 hover:bg-neutral-200"
                >
                  {on && <motion.span style={{ scaleX: reduce ? 1 : progress }} className="absolute inset-0 origin-left rounded-full bg-primary-600" />}
                </motion.span>
              </button>
            );
          })}
        </div>
        <p className="sr-only">The row moves to the next testimonial every {AUTOPLAY_MS / 1000} seconds. Hover over it to pause.</p>
      </Reveal>

      <AnimatePresence>{playing && <VideoLightbox item={playing} onClose={closeVideo} />}</AnimatePresence>
    </section>
  );
}

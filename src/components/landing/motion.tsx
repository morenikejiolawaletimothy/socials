"use client";

import Lenis from "lenis";
import {
  animate,
  motion,
  useAnimationFrame,
  MotionConfig,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
  type Variants,
} from "motion/react";
import { createContext, Fragment, useContext, useEffect, useId, useRef, useState } from "react";

/*
 * One motion language for the landing page:
 * - EASE: a soft ease-out used by every transition.
 * - Reveals: content rises 24px and fades in once, when it enters the viewport.
 * - Stagger: siblings follow each other by 80ms.
 * - Hover: 250ms; photos zoom 4% over 700ms.
 * Everything is off when the visitor prefers reduced motion.
 */
export const EASE = [0.22, 1, 0.36, 1] as const;
export const DUR = { fast: 0.25, base: 0.6, slow: 0.9 };
export const STAGGER = 0.08;

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

/** Smooth, momentum scrolling for the whole page, plus smooth anchor links. */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (reduce) return;
    const l = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    let frame = requestAnimationFrame(function raf(time) {
      l.raf(time);
      frame = requestAnimationFrame(raf);
    });
    setLenis(l);

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const target = document.querySelector(a.getAttribute("href")!);
      if (!target) return;
      e.preventDefault();
      l.scrollTo(target as HTMLElement, { offset: -64 });
    };
    document.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("click", onClick);
      l.destroy();
      setLenis(null);
    };
  }, [reduce]);

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: DUR.base, ease: EASE }}>
      <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
    </MotionConfig>
  );
}

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE } },
};

/** Fades and lifts its content in once it scrolls into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "p" | "h1" | "h2" | "h3" | "li" | "span" | "figure";
}) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={{ hidden: revealVariants.hidden, show: { ...revealVariants.show, transition: { duration: DUR.base, ease: EASE, delay } } }}
    >
      {children}
    </Tag>
  );
}

/** Parent that reveals its <StaggerItem> children one after another. */
export function Stagger({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "ul" | "ol";
}) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: STAGGER, delayChildren: delay } } }}
    >
      {children}
    </Tag>
  );
}

export function StaggerItem({ children, className, as = "div" }: { children: React.ReactNode; className?: string; as?: "div" | "li" | "span" }) {
  const Tag = motion[as];
  return (
    <Tag className={className} variants={revealVariants}>
      {children}
    </Tag>
  );
}

/** Splits a heading into words that rise in one after another. */
export function WordsReveal({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  // CSS, not Motion: the headline starts animating on first paint instead of waiting for JavaScript,
  // so it shows sooner (it is the largest thing on the first screen). Same ease, duration and stagger.
  const words = text.split(" ");
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      {words.map((w, i) => (
        <Fragment key={i}>
          {/* Extra bottom padding keeps descenders (g, y, p) inside the clip; the negative margin keeps line spacing unchanged. */}
          <span aria-hidden className="-mb-[0.14em] inline-block overflow-hidden pb-[0.22em] align-top">
            <span className="lp-word inline-block" style={{ animationDelay: `${delay + i * 0.05}s` }}>
              {w}
            </span>
          </span>
          {/* The space sits between the word boxes: inside an inline-block it would be trimmed at line ends. */}
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}

/** Words that light up one by one as the reader scrolls past (the statement). */
export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      {words.map((w, i) => (
        <ScrollWord key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {w}
          {i < words.length - 1 ? " " : ""}
        </ScrollWord>
      ))}
    </p>
  );
}

function ScrollWord({ progress, range, children }: { progress: MotionValue<number>; range: [number, number]; children: React.ReactNode }) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return (
    <motion.span aria-hidden style={{ opacity }}>
      {children}
    </motion.span>
  );
}

/** Counts up to a number when it scrolls into view. */
export function CountUp({ to, className }: { to: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const value = useMotionValue(0);
  const [shown, setShown] = useState(0);

  useEffect(() => value.on("change", (v) => setShown(Math.round(v))), [value]);
  useEffect(() => {
    if (reduce) return value.set(to);
    if (!inView) return;
    const c = animate(value, to, { duration: 1.4, ease: EASE });
    return () => c.stop();
  }, [inView, reduce, to, value]);

  return (
    <span ref={ref} className={className}>
      {shown}
    </span>
  );
}

/** Moves its content against the scroll direction for a light depth effect. */
export function Parallax({ children, className, distance = 60 }: { children: React.ReactNode; className?: string; distance?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}

/** Time each autoplaying item stays on screen (How it works, testimonials). */
export const AUTOPLAY_MS = 6000;

/**
 * Drives an autoplaying set: progress runs 0 to 1 while `running`, then calls onNext and starts over.
 * Bind `progress` to a bar's scaleX so every autoplay on the page looks the same. Off under reduced motion.
 */
export function useAutoplay(running: boolean, onNext: () => void, ms = AUTOPLAY_MS) {
  const reduce = useReducedMotion();
  const progress = useMotionValue(0);
  useAnimationFrame((_, delta) => {
    if (!running || reduce) return;
    const next = progress.get() + delta / ms;
    if (next >= 1) {
      progress.set(0);
      onNext();
    } else progress.set(next);
  });
  return { progress, restart: () => progress.set(0), reduce };
}

/** Same hover for every card on the page: a 4px lift with a softer, wider shadow. */
export const cardHover = {
  whileHover: { y: -4, boxShadow: "0px 12px 32px rgba(20,23,20,0.10)" },
  transition: { duration: DUR.fast, ease: EASE },
};

/*
 * Page tone: the landing page has ONE background, owned by <PageTone>. Every section sits in a <ToneZone>
 * that names its colour and whether it is dark. Whichever zone crosses the middle of the screen sets the
 * page colour, and the whole background fades to it, so two section colours never meet at a hard edge.
 * PageTone also sets data-tone="dark" | "light". Text on the background follows THE PAGE, not its own
 * section: `lp-tone text-neutral-950 tone-dark:text-inverse`. So a light section still shows light text
 * while the page is navy, and both fade together when the page turns (lp-tone matches THEME_FADE).
 */
export const THEME_FADE =
  "transition-[background-color,color,outline-color,box-shadow] duration-1000 ease-[cubic-bezier(0.45,0,0.2,1)] motion-reduce:transition-none";

type Zone = { el: HTMLElement; bg: string; dark: boolean };
const PageToneContext = createContext<(id: string, zone: Zone) => () => void>(() => () => {});

export function PageTone({ children, className = "", initialBg }: { children: React.ReactNode; className?: string; initialBg: string }) {
  const zones = useRef(new Map<string, Zone>());
  const [activeBg, setActiveBg] = useState<string | null>(null);
  const [dark, setDark] = useState(false);

  // The zone under the middle of the screen wins. Checked once per frame at most while scrolling or resizing.
  // Both states are primitives, so React skips the re-render while the same zone stays in place.
  const pick = useRef(() => {
    const line = window.innerHeight / 2;
    let found: Zone | null = null;
    for (const z of zones.current.values()) {
      const r = z.el.getBoundingClientRect();
      if (r.top <= line && r.bottom > line) {
        found = z;
        break;
      }
    }
    setActiveBg(found ? found.bg : null);
    setDark(found ? found.dark : false);
  });

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(pick.current);
    };
    pick.current();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const [register] = useState(() => (id: string, zone: Zone) => {
    zones.current.set(id, zone);
    pick.current();
    return () => {
      zones.current.delete(id);
    };
  });

  return (
    <div data-tone={dark ? "dark" : "light"} className={`${THEME_FADE} ${activeBg ?? initialBg} ${className}`}>
      <PageToneContext.Provider value={register}>{children}</PageToneContext.Provider>
    </div>
  );
}

/** A run of one or more sections that share a page colour. Pass a full bg-* token class, and `dark` for dark colours. */
export function ToneZone({ children, bg, dark = false }: { children: React.ReactNode; bg: string; dark?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const register = useContext(PageToneContext);
  useEffect(() => (ref.current ? register(id, { el: ref.current, bg, dark }) : undefined), [id, bg, dark, register]);
  return <div ref={ref}>{children}</div>;
}

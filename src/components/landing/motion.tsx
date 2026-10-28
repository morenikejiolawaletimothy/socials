"use client";

import Lenis from "lenis";
import {
  animate,
  motion,
  MotionConfig,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
  type Variants,
} from "motion/react";
import { createContext, useContext, useEffect, useRef, useState } from "react";

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
  const words = text.split(" ");
  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: delay } } }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-top">
          <motion.span
            className="inline-block"
            variants={{ hidden: { y: "100%" }, show: { y: 0, transition: { duration: DUR.slow, ease: EASE } } }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/** Words that light up one by one as the reader scrolls past (the statement). */
export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className} aria-label={text}>
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

/** Same hover for every card on the page: a 4px lift with a softer, wider shadow. */
export const cardHover = {
  whileHover: { y: -4, boxShadow: "0px 12px 32px rgba(20,23,20,0.10)" },
  transition: { duration: DUR.fast, ease: EASE },
};

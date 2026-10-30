"use client";

import {
  ChatCircle,
  Check,
  CheckCircle,
  ListBullets,
  MagnifyingGlass,
  Plus,
  TextAlignCenter,
  TextAlignLeft,
  TextB,
  TextItalic,
  TextUnderline,
} from "@phosphor-icons/react";
import { motion, useInView } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FitBox } from "./FitBox";
import { DUR, EASE, Reveal, Stagger, StaggerItem } from "./motion";

function Bullets({ items }: { items: string[] }) {
  return (
    <Stagger as="ul" delay={0.2} className="flex flex-col gap-4">
      {items.map((i) => (
        <StaggerItem as="li" key={i} className="flex items-start gap-2.5 lp-body lp-tone text-neutral-500 tone-dark:text-neutral-300">
          <CheckCircle className="size-6 shrink-0" aria-hidden />
          <span className="pt-px">{i}</span>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

function TextBlock({ title, text, bullets, side }: { title: string; text: string; bullets: string[]; side: "left" | "right" }) {
  // Text follows the page tone (PageTone in page.tsx): light on navy, dark on white.
  return (
    <div className={`flex w-full max-w-[588px] flex-col justify-center gap-8 ${side === "left" ? "md:pr-10" : "md:pl-10"}`}>
      <div className="flex flex-col gap-4">
        <Reveal as="h3" className="lp-h3 lp-tone text-neutral-950 tone-dark:text-inverse">
          {title}
        </Reveal>
        <Reveal as="p" delay={0.1} className="max-w-[500px] lp-body lp-tone text-neutral-700 tone-dark:text-inverse">
          {text}
        </Reveal>
      </div>
      <Bullets items={bullets} />
    </div>
  );
}

const inViewOnce = { initial: "hidden", whileInView: "show", viewport: { once: true, margin: "0px 0px -15% 0px" } } as const;
const rise = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE } } };

/** Types the search query once the panel is in view. */
function TypedQuery({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setN(text.length);
    const id = setInterval(() => setN((v) => (v >= text.length ? (clearInterval(id), v) : v + 1)), 45);
    return () => clearInterval(id);
  }, [inView, text]);
  return (
    <span ref={ref} className="lp-small text-neutral-400">
      <span className="sr-only">{text}</span>
      <span aria-hidden>{text.slice(0, n)}</span>
      <span aria-hidden className={`ml-px inline-block h-4 w-px translate-y-0.5 bg-neutral-400 ${n >= text.length ? "animate-pulse" : ""}`} />
    </span>
  );
}

/** Row 1 mock-up: search, a drafted comment, then a connection request joined by a dashed line. */
function EngagementPanel() {
  return (
    <FitBox width={588} height={480}>
      <motion.div
        {...inViewOnce}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.35, delayChildren: 0.9 } } }}
        className="group relative h-[480px] w-[588px] overflow-hidden rounded-[12px] bg-primary-50"
      >
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(/landing/noise.png)" }} />
        <div className="absolute left-[142px] top-[95px] h-[290px] w-[304px] transition-transform duration-500 ease-out group-hover:-translate-y-2">
          <div className="absolute left-0 top-0 flex w-[304px] items-center gap-3 rounded-[16px] bg-card px-4 py-3.5 drop-shadow-[0px_2px_4px_rgba(0,0,0,0.08)]">
            <MagnifyingGlass className="size-4 text-neutral-950/80" aria-hidden />
            <TypedQuery text="Fintech founders in Lagos" />
          </div>
          <motion.div
            variants={rise}
            className="absolute left-0 top-20 flex w-[304px] flex-col gap-2 rounded-[16px] bg-card py-3 pl-4 pr-3 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08),0px_0px_0px_4px_rgba(255,255,255,0.5)]"
          >
            <span className="flex items-center gap-2">
              <Check className="size-3.5 text-success" aria-hidden />
              <span className="flex items-center gap-1.5 rounded-[8px] border border-neutral-300 px-2.5 py-1">
                <ChatCircle className="size-3.5 text-neutral-950/60" aria-hidden />
                <span className="lp-small text-neutral-950 opacity-60">Comment</span>
              </span>
            </span>
            <span className="flex gap-2 lp-small text-neutral-950">
              <span className="text-neutral-800">1.</span>Comment drafted for Amaka Nwosu
            </span>
          </motion.div>
          <motion.div
            variants={{ hidden: { scaleY: 0 }, show: { scaleY: 1, transition: { duration: DUR.base, ease: EASE } } }}
            className="absolute bottom-[81px] left-[150px] h-[65px] w-1 origin-top border-l-2 border-dashed border-primary-300"
          />
          <motion.div
            variants={{ hidden: { scale: 0, rotate: -90 }, show: { scale: 1, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 16 } } }}
            className="absolute bottom-[71px] left-[142px] flex size-5 items-center justify-center rounded-full bg-primary-900"
          >
            <Plus className="size-2.5 text-inverse" aria-hidden />
          </motion.div>
          <motion.div variants={rise} className="absolute bottom-[-1.6px] left-0 w-[304px] rounded-[16px] bg-card p-0.5 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)]">
            <div className="relative flex flex-col gap-2 rounded-[14px] bg-card py-3 pl-4 pr-3">
              <span className="flex items-center gap-2">
                <Check className="size-3.5 text-success" aria-hidden />
                <span className="flex items-center gap-1.5 rounded-[8px] border border-neutral-300 px-2.5 py-1">
                  <Image src="/brand/bluecut-mark.png" alt="" width={16} height={16} className="rounded-full" />
                  <span className="lp-small text-neutral-950 opacity-60">Bluecut</span>
                </span>
              </span>
              <span className="flex gap-2 lp-small text-neutral-950">
                <span>1.</span>Connection request ready to send
              </span>
              <span aria-hidden className="absolute inset-0 rounded-[14px] border-2 border-dashed border-primary-300" />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </FitBox>
  );
}

/** Row 2 mock-up: the client's strategy note, centred on a soft gradient. The highlight sweeps across, tags pop in. */
function StrategyPanel() {
  const tools = [TextB, TextUnderline, TextItalic, TextAlignLeft, TextAlignCenter, ListBullets];
  return (
    <FitBox width={588} height={480}>
      <motion.div
        {...inViewOnce}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15, delayChildren: 0.3 } } }}
        className="group relative h-[480px] w-[588px] overflow-hidden rounded-[12px]"
        style={{ backgroundImage: "linear-gradient(225deg, rgb(208, 204, 161) 0%, rgb(245, 245, 245) 100%)" }}
      >
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundSize: "256px 256px", backgroundImage: "url(/landing/noise.png)" }} />
        <div className="absolute inset-[24.87%_22.79%] flex items-center justify-center">
          <motion.div
            variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE } } }}
            className="relative flex w-[320px] shrink-0 flex-col gap-6 rounded-[16px] bg-card px-6 py-5 shadow-[0px_0px_0px_4px_rgba(255,255,255,0.5)] transition-transform duration-500 ease-out group-hover:-translate-y-2"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="lp-small text-neutral-950">Your strategy</span>
                  <span className="rounded-full bg-neutral-50 p-1 lp-micro text-neutral-800">Q4</span>
                </span>
                <motion.span
                  variants={{ hidden: { opacity: 0, scale: 0.7 }, show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 18, delay: 1.1 } } }}
                  className="flex items-center gap-1 rounded-[6px] bg-success-bg py-1 pl-3 pr-2"
                >
                  <span className="lp-micro text-neutral-950 opacity-45">Approved</span>
                  <Check className="size-2.5 text-neutral-950/45" aria-hidden />
                </motion.span>
              </div>
              <p className="relative text-[12px] font-medium leading-[19.2px] tracking-[-0.24px] text-neutral-950/50">
                <motion.span
                  variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: DUR.slow, ease: EASE, delay: 0.5 } } }}
                  className="absolute left-0 top-0 h-4 w-[229px] origin-left bg-primary-100"
                  aria-hidden
                />
                <span className="relative">This quarter is about being known for payments in West Africa: 2 posts, 10 comments and 15 connection requests a week.</span>
              </p>
              <div className="flex flex-col gap-2">
                {["w-full", "w-full", "w-[109px]"].map((w, i) => (
                  <motion.span
                    key={i}
                    variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: DUR.base, ease: EASE, delay: 0.6 + i * 0.1 } } }}
                    className={`h-3 origin-left rounded-full bg-neutral-50 ${w}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              {[
                ["Payments", "bg-primary-100"],
                ["Leadership", "bg-success-bg"],
              ].map(([t, bg], i) => (
                <motion.span
                  key={t}
                  variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE, delay: 0.9 + i * 0.1 } } }}
                  className={`rounded-[6px] px-3 py-1 lp-micro text-neutral-950/50 ${bg}`}
                >
                  {t}
                </motion.span>
              ))}
            </div>
            <motion.div
              variants={{ hidden: { opacity: 0, y: 8, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: DUR.base, ease: EASE, delay: 1.3 } } }}
              className="absolute left-[120px] top-[115px] flex items-center gap-3 rounded-[8px] bg-neutral-50 px-3 py-1.5 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.15)]"
            >
              {tools.map((T, i) => (
                <T key={i} className="size-3.5 text-neutral-800" aria-hidden />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </FitBox>
  );
}

export function Features() {
  return (
    <section className="flex flex-col items-center gap-[60px] overflow-hidden px-5 py-[100px] md:px-20">
      <div className="flex w-full max-w-[1440px] flex-col items-center justify-center gap-10 md:flex-row md:items-stretch md:gap-6 md:px-10">
        <TextBlock
          side="left"
          title="Engagement with the right people"
          text="Being seen is not only about posting. We find the people and conversations that matter to your goal, and help you show up there."
          bullets={[
            "A weekly list of people and posts worth engaging with",
            "Comments written in your voice, sent as you allow",
            "Connection requests ready to send in a few minutes",
          ]}
        />
        <Reveal delay={0.1} className="w-full max-w-[588px]">
          <EngagementPanel />
        </Reveal>
      </div>
      <div className="flex w-full max-w-[1440px] flex-col-reverse items-center justify-center gap-10 md:flex-row md:items-stretch md:gap-6 md:px-10">
        <Reveal delay={0.1} className="w-full max-w-[588px]">
          <StrategyPanel />
        </Reveal>
        <TextBlock
          side="right"
          title="You stay in control"
          text="Your account and your reputation stay yours. You decide what we do, and you can change it any time."
          bullets={[
            "We never see your password. You connect through LinkedIn's own sign-in",
            "Choose what we do for you, and what needs your approval",
            "Pause, take a post down or disconnect in one tap",
            "Tell us what is off limits. We check every post against it",
          ]}
        />
      </div>
    </section>
  );
}

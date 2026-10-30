"use client";

import { CalendarBlank, CheckCircle, PencilSimple, Trash } from "@phosphor-icons/react";
import { motion } from "motion/react";
import Image from "next/image";
import { FitBox } from "./FitBox";
import { DUR, EASE, Parallax, Reveal, ScrollWords, STAGGER } from "./motion";

const photos = [
  { src: "/landing/statement-1.jpg", alt: "A founder at her desk", pos: "left-[782px] top-[-296px]", distance: 70 },
  { src: "/landing/statement-2.jpg", alt: "A business owner in his studio", pos: "left-[200px] top-[-350px]", distance: 110 },
  { src: "/landing/statement-3.jpg", alt: "A leader on a call", pos: "left-[955px] top-[260px]", distance: 50 },
];

/** Big statement on the masked dot pattern. Words light up as you scroll; photos drift at different speeds. */
export function Statement() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/landing/dots.png)",
          backgroundSize: "780px 780px",
          maskImage: "url(/landing/dots-mask.svg)",
          maskSize: "100% 100%",
          WebkitMaskImage: "url(/landing/dots-mask.svg)",
          WebkitMaskSize: "100% 100%",
        }}
      />
      <div className="relative mx-auto flex min-h-[560px] w-full max-w-[1440px] items-center justify-center px-5 py-[120px] lg:h-[900px] lg:py-0">
        <div className="relative w-full max-w-[1280px] lg:px-10">
          <ScrollWords
            text="Bluecut runs your LinkedIn end to end: strategy, posts, engagement and progress, with you in control of every step."
            className="mx-auto max-w-[1055px] text-center lp-h2 lp-tone text-neutral-950 tone-dark:text-inverse lg:px-[31px]"
          />
          {photos.map((p) => (
            <Parallax key={p.src} distance={p.distance} className={`absolute hidden w-[220px] lg:block ${p.pos}`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, rotate: -1.5 }}
                transition={{ duration: DUR.base, ease: EASE }}
                className="relative h-[180px] overflow-hidden rounded-[24px] shadow-[0px_12px_32px_rgba(20,23,20,0.10)]"
              >
                <Image src={p.src} alt={p.alt} fill sizes="220px" className="object-cover" />
              </motion.div>
            </Parallax>
          ))}
        </div>
      </div>
    </section>
  );
}

const rows = [
  { label: "2 posts published", status: "Done", bg: "bg-success-bg" },
  { label: "Comments on target posts", status: "Ongoing", bg: "bg-warning-bg" },
  { label: "Connection requests", status: "To do", bg: "bg-primary-100" },
];

const inViewOnce = { initial: "hidden", whileInView: "show", viewport: { once: true, margin: "0px 0px -15% 0px" } } as const;
const rise = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE } } };

/** Card 1: this week's targets, on a blurred brand-blue panel. Rows arrive one by one. */
function TargetsPanel() {
  return (
    <FitBox width={588} height={480}>
      <motion.div {...inViewOnce} className="group relative h-[480px] w-[588px] overflow-hidden rounded-[12px] bg-neutral-25">
        <div className="absolute left-[-59px] top-[-356px] h-[936px] w-[706px] bg-primary-600 blur-[50px] transition-transform duration-700 ease-out group-hover:translate-y-6" />
        <div className="absolute left-[-59px] top-[-253px] h-[873px] w-[706px] bg-neutral-0/40 blur-[35px]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(/landing/noise.png)" }} />
        <motion.div
          variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE, staggerChildren: STAGGER, delayChildren: 0.3 } } }}
          className="absolute left-[133.79px] top-[240px] flex h-[255px] w-[320px] flex-col gap-4 overflow-hidden rounded-[16px] bg-card px-6 pb-2 pt-6 shadow-[0px_0px_0px_4px_rgba(255,255,255,0.5)] transition-transform duration-500 ease-out group-hover:-translate-y-3"
        >
          <motion.div variants={rise} className="flex h-8 w-[272px] items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 items-center rounded-[6px] bg-neutral-50 px-3 text-[14px] font-medium leading-[19.6px] text-neutral-950">This week</span>
              <span className="flex size-5 items-center justify-center rounded-full bg-primary-900 text-[12px] font-medium leading-[16.8px] text-inverse">3</span>
            </div>
            <div className="flex">
              {[
                ["A", "bg-[#ba8c83]"],
                ["C", "bg-[#90a9b1]"],
                ["S", "bg-[#737192]"],
              ].map(([l, c]) => (
                <span key={l} className={`flex size-6 items-center justify-center rounded-full border-[0.667px] border-neutral-0 text-[10px] font-medium leading-[14px] text-inverse ${c}`}>
                  {l}
                </span>
              ))}
            </div>
          </motion.div>
          <ul className="flex w-[272px] flex-col">
            {rows.map((r, i) => (
              <motion.li
                key={r.label}
                variants={rise}
                className={`flex h-[58.4px] items-center justify-between py-4 ${i < rows.length - 1 ? "border-b-[0.667px] border-neutral-100" : ""}`}
              >
                <span className="lp-small text-neutral-950">{r.label}</span>
                <motion.span
                  variants={{ hidden: { scale: 0.6, opacity: 0 }, show: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 400, damping: 18 } } }}
                  className={`rounded-[6px] px-3 py-1.5 ${r.bg}`}
                >
                  <span className="lp-caption text-neutral-900 opacity-50">{r.status}</span>
                </motion.span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </FitBox>
  );
}

const steps = [
  { icon: PencilSimple, text: "Drafted by your manager", top: 0 },
  { icon: CheckCircle, text: "Approved by you", top: 74 },
  { icon: CalendarBlank, text: "Scheduled for Tuesday 9am", top: 148 },
];

/** Card 2: the path every post takes. Steps drop in, the line draws, the dot settles. */
function ApprovalPanel() {
  return (
    <FitBox width={588} height={480}>
      <motion.div
        {...inViewOnce}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.18, delayChildren: 0.2 } } }}
        className="group relative h-[480px] w-[588px] overflow-hidden rounded-[12px] bg-neutral-25"
      >
        <div className="absolute left-[-59px] top-10 h-[934px] w-[706px] bg-primary-50 blur-[50px]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(/landing/noise.png)" }} />
        <div className="absolute left-[134px] top-[105px] h-[270px] w-[320px]">
          <motion.div
            variants={{ hidden: { scaleY: 0 }, show: { scaleY: 1, transition: { duration: 1.2, ease: EASE } } }}
            className="absolute left-[158px] top-6 h-[202px] w-1 origin-top bg-primary-900/[0.06]"
          />
          {steps.map((s) => (
            <motion.div
              key={s.text}
              variants={{ hidden: { opacity: 0, y: -12 }, show: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE } } }}
              whileHover={{ x: 4 }}
              style={{ top: s.top }}
              className="absolute left-0 flex h-[46px] w-[320px] items-center justify-between rounded-[16px] bg-card py-3 pl-4 pr-3 drop-shadow-[0px_2px_4px_rgba(0,0,0,0.08)]"
            >
              <span className="flex items-center gap-2">
                <s.icon className="size-4 text-primary-600" aria-hidden />
                <span className="text-[14px] font-medium leading-[19.6px] tracking-[-0.14px] text-neutral-800">{s.text}</span>
              </span>
              <span className="flex size-[22px] items-center justify-center rounded-[4px]">
                <Trash className="size-4 text-neutral-400" aria-hidden />
              </span>
            </motion.div>
          ))}
          <motion.div
            variants={{ hidden: { scale: 0 }, show: { scale: 1, transition: { type: "spring", stiffness: 260, damping: 14 } } }}
            className="absolute left-[136px] top-[222px] size-12 rounded-[24px] bg-primary-900"
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-primary-900 opacity-20" />
          </motion.div>
        </div>
      </motion.div>
    </FitBox>
  );
}

export function Connected() {
  return (
    <section id="features" className="flex scroll-mt-16 flex-col items-center gap-[60px] overflow-hidden px-5 py-[100px] md:px-20">
      <div className="flex w-full max-w-[1280px] flex-col gap-4 md:flex-row md:items-end md:justify-between md:px-10">
        <Reveal as="h2" className="max-w-[580px] lp-h2 lp-tone text-neutral-950 tone-dark:text-inverse">
          Everything in one place, nothing behind your back
        </Reveal>
        <Reveal as="p" delay={0.1} className="max-w-[420px] lp-body opacity-60 lp-tone text-neutral-950 tone-dark:text-inverse">
          Your strategy, your posts and your progress live in one app you can open from your phone.
        </Reveal>
      </div>
      <div className="flex w-full max-w-[1280px] flex-col gap-10 md:flex-row md:gap-6 md:px-10">
        {[
          { panel: <TargetsPanel />, title: "A strategy you can measure", text: "Weekly targets for posts, comments and connections, set from your goal. You always see what was done." },
          { panel: <ApprovalPanel />, title: "Posts you approve first", text: "Your manager writes in your voice. You read, approve or ask for changes. Nothing goes live without you." },
        ].map((c, i) => (
          <Reveal key={c.title} delay={i * 0.12} className="flex flex-1 flex-col items-center gap-6">
            {c.panel}
            <div className="flex w-full max-w-[588px] flex-col gap-3">
              <h3 className="lp-title lp-tone text-neutral-950 tone-dark:text-inverse">{c.title}</h3>
              <p className="max-w-[500px] lp-body lp-tone text-neutral-400 tone-dark:text-neutral-300">{c.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

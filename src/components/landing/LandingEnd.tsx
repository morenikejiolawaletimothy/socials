"use client";

import {
  Copyright,
  FacebookLogo,
  InstagramLogo,
  LinkedinLogo,
  PaperPlaneTilt,
  Plus,
  XLogo,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BluecutMark, btnPrimary } from "./LandingTop";
import { DUR, EASE, Reveal, Stagger, StaggerItem } from "./motion";

// Template headshots, in template order. Stock images: replace with real clients (with their permission) before launch.
const leaders = Array.from({ length: 26 }, (_, i) => `/landing/leaders/${String(i + 1).padStart(2, "0")}.jpg`);
const rowOne = leaders.slice(0, 13);
const rowTwo = leaders.slice(13);

/** One endless row of headshots. The list is doubled so the loop has no seam; hovering the row pauses it. */
function LeaderRow({ faces, reverse, offset }: { faces: string[]; reverse?: boolean; offset: string }) {
  return (
    <div className={`group/row flex w-max ${offset}`}>
      <ul
        className={`flex w-max gap-6 pr-6 group-hover/row:[animation-play-state:paused] ${reverse ? "lp-marquee-reverse" : "lp-marquee"}`}
        style={{ ["--lp-marquee-duration" as string]: "60s" }}
      >
        {[...faces, ...faces].map((src, i) => (
          <li
            key={i}
            aria-hidden={i >= faces.length}
            className={`relative size-20 shrink-0 overflow-hidden rounded-[20px] transition-transform duration-300 ease-out hover:-translate-y-1 hover:scale-105 ${
              i % faces.length === 0 ? "bg-gradient-to-b from-primary-50 to-card shadow-[0px_4px_16px_0px_rgba(0,0,0,0.08)]" : "bg-card"
            }`}
          >
            <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            <span
              aria-hidden
              className={`absolute inset-0 rounded-[20px] ${
                i % faces.length === 0 ? "shadow-[inset_0px_0px_0px_2px_white]" : "shadow-[inset_0px_0px_0px_1px_var(--color-neutral-100)]"
              }`}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Industries() {
  return (
    <section className="flex flex-col items-center gap-[60px] overflow-hidden bg-card pt-[100px] pb-[124px]">
      <div className="flex w-full max-w-[1280px] flex-col items-center gap-3 px-5 md:px-10">
        <Reveal as="h2" className="w-full max-w-[730px] text-center lp-h2 text-neutral-950">
          Leaders we work with
        </Reveal>
      </div>
      <Reveal delay={0.1} className="w-full max-w-[1280px] md:px-10">
        <div
          className="flex flex-col gap-6 overflow-hidden"
          style={{
            maskImage: "linear-gradient(90deg, transparent 0, black 6%, black 94%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(90deg, transparent 0, black 6%, black 94%, transparent 100%)",
          }}
        >
          <p className="sr-only">Founders, executives and senior professionals across banking, technology, health, law and more.</p>
          <LeaderRow faces={rowOne} offset="-ml-[22px]" />
          <LeaderRow faces={rowTwo} offset="-ml-[110px]" reverse />
        </div>
      </Reveal>
    </section>
  );
}

const faqs = [
  { q: "Do you need my LinkedIn password?", a: "No. You connect your account through LinkedIn's own sign-in, on your own device. We never see or store your password, and you can disconnect at any time." },
  { q: "Will anything be posted without my approval?", a: "No. You see every post before it goes live. You choose what needs your approval, and if you prefer, you can let us go ahead when you have not replied within 24 hours." },
  { q: "How much of my time does it take?", a: "About an hour to get started: setting up your account and two 30-minute calls. After that, a few minutes a week to review posts and do any quick tasks." },
  { q: "Can I pull out of my contract?", a: "Yes, any time. Service runs to the end of the current month and we refund every month not yet started. If you pull out in the first 2 weeks, you pay nothing." },
  { q: "My field has strict rules on what I can say. Can you still help?", a: "Yes. Tell us what is off limits, such as topics, people, companies or claims your profession does not allow. We check every post and every comment against it." },
];

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="flex scroll-mt-16 flex-col items-center gap-[60px] bg-card px-5 py-[100px] md:px-10">
      <div className="grid w-full max-w-[980px] grid-cols-1 gap-8 md:grid-cols-[2fr_1fr] md:px-10">
        <div className="flex flex-col items-start gap-6 self-end">
          <Reveal as="span" className="rounded-[5px] bg-card py-1.5 lp-small text-neutral-950 opacity-80">
            FAQ
          </Reveal>
          <Reveal as="h2" delay={0.05} className="lp-h2-regular text-neutral-950">
            Common questions,
            <br />
            straight answers
          </Reveal>
        </div>
        <Reveal delay={0.1} className="flex flex-col items-start gap-6 self-end md:w-[300px]">
          <p className="lp-body text-neutral-950 opacity-50">Have a question that is not covered here? Write to us and we will reply within 24 hours.</p>
          <a href="mailto:hello@bluecut.example" className={`${btnPrimary} h-11`}>
            Contact us
          </a>
        </Reveal>
      </div>
      <Stagger className="w-full max-w-[980px] md:px-10">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <StaggerItem key={f.q} className="border-b-[0.667px] border-neutral-100">
              <h3>
                <button
                  type="button"
                  id={`faq-q-${i}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-a-${i}`}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="group flex w-full items-center gap-6 rounded-sm py-6 text-left focus-visible:focus-ring"
                >
                  <span className="flex-1 lp-body-medium text-neutral-950 transition-colors duration-300 group-hover:text-primary-700">{f.q}</span>
                  <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: DUR.fast, ease: EASE }} className="flex">
                    <Plus className="size-5 text-neutral-950" aria-hidden />
                  </motion.span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`faq-a-${i}`}
                    role="region"
                    aria-labelledby={`faq-q-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <p className="pb-6 lp-body text-neutral-950 opacity-50">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}

const columns = [
  { title: "Company", links: [["How it works", "#how"], ["FAQ", "#faq"], ["Sign in", "/signin"], ["Get started", "/signup"]] },
  { title: "Legal", links: [["Terms of service", "/terms"], ["Privacy policy", "/privacy"]] },
];
const socials = [
  { label: "Bluecut on X", icon: XLogo },
  { label: "Bluecut on LinkedIn", icon: LinkedinLogo },
  { label: "Bluecut on Instagram", icon: InstagramLogo },
  { label: "Bluecut on Facebook", icon: FacebookLogo },
];

export function ClosingAndFooter() {
  return (
    <div className="bg-primary-900 pb-28 md:pb-0">
      <section className="flex flex-col items-center px-5 pb-[50px] pt-[100px] md:px-10">
        <div className="flex w-full max-w-[1280px] flex-col items-center gap-6 md:px-10">
          <Reveal as="h2" className="max-w-[560px] text-center lp-h2-regular font-medium text-inverse">
            Less time on LinkedIn.
            <br />
            More of the right attention.
          </Reveal>
          <Reveal as="p" delay={0.1} className="max-w-[475px] px-2 text-center lp-body text-neutral-300">
            A dedicated expert runs your LinkedIn around your goals, and you approve everything. Your first 2 weeks are free.
          </Reveal>
          <Reveal delay={0.2}>
            <Link href="/signup" className={`${btnPrimary} h-11`}>
              Get started
            </Link>
          </Reveal>
        </div>
      </section>

      <footer className="flex flex-col items-center px-4 pb-20 pt-[50px] md:px-10">
        <div className="w-full max-w-[1280px] md:px-10">
          <Reveal className="flex flex-col rounded-[24px] bg-card">
            <div className="flex flex-col gap-10 px-6 py-10 md:flex-row md:items-start md:justify-between md:py-[60px] md:pl-[68px] md:pr-20">
              <div className="flex gap-[68px]">
                {columns.map((c) => (
                  <nav key={c.title} aria-label={c.title} className="flex flex-col gap-4">
                    <p className="pl-3 text-[14px] leading-[14.4px] tracking-[-0.24px] text-primary">{c.title}</p>
                    <ul className="flex flex-col gap-1">
                      {c.links.map(([l, h]) => (
                        <li key={l}>
                          <Link href={h} className="block rounded-[20px] px-3 py-1.5 text-[14px] leading-[18.2px] tracking-[-0.14px] text-neutral-950/50 transition-colors duration-300 hover:bg-neutral-25 hover:text-neutral-950 focus-visible:focus-ring">
                            {l}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                ))}
              </div>
              <form className="relative flex w-full flex-col gap-4 md:max-w-[280px]" action="#">
                <label htmlFor="newsletter" className="text-[14px] font-medium leading-[14.4px] tracking-[-0.24px] text-neutral-900">
                  Newsletter
                </label>
                <div className="relative">
                  <input
                    id="newsletter"
                    type="email"
                    placeholder="Your email"
                    className="w-full rounded-[8px] border border-neutral-100 bg-neutral-25 py-2.5 pl-3 pr-16 text-[14px] font-medium tracking-[-0.28px] text-primary placeholder:text-neutral-300 focus-visible:border-primary-600 focus-visible:focus-ring"
                  />
                  <button type="submit" aria-label="Subscribe" className="absolute right-1 top-1 flex items-center justify-center rounded-[6px] bg-primary-600 px-4 py-2 text-inverse hover:bg-primary-700 focus-visible:focus-ring">
                    <PaperPlaneTilt className="size-4" aria-hidden />
                  </button>
                </div>
                <label className="flex items-start gap-2.5 text-[11px] leading-[14.3px] tracking-[-0.11px] text-neutral-950/50">
                  <input type="checkbox" className="mt-px size-3.5 rounded-[4px] border border-neutral-300 accent-primary-600" />
                  <span>
                    By submitting, you agree to our <Link href="/terms" className="text-neutral-900 underline">Terms of service</Link> and{" "}
                    <Link href="/privacy" className="text-neutral-900 underline">Privacy policy</Link>
                  </span>
                </label>
              </form>
            </div>

            <div className="flex flex-col gap-8 px-6 pt-10 md:px-20">
              <div className="h-px w-full bg-neutral-100" />
              <div className="flex items-end justify-between gap-4">
                <BluecutMark size={40} textClass="text-[20px] leading-[26px]" />
                <a
                  href="mailto:hello@bluecut.example"
                  className="lp-btn inline-flex items-center justify-center rounded-[10px] bg-primary-600 px-[18px] py-[13px] text-[15px] font-medium leading-[15px] tracking-[-0.3px] text-inverse hover:bg-primary-700 focus-visible:focus-ring"
                >
                  Contact us
                </a>
              </div>
              <div className="h-px w-full bg-neutral-100" />
            </div>

            <div className="flex flex-col gap-4 px-6 pb-[60px] pt-8 sm:flex-row sm:items-center sm:justify-between md:px-20">
              <p className="flex items-center gap-1 text-[12px] leading-[14.4px] tracking-[-0.12px] text-neutral-950/70">
                <Copyright className="size-3" aria-hidden />
                2026 Bluecut Socials. All rights reserved.
              </p>
              <ul className="flex items-center gap-5">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a href="#" aria-label={s.label} className="flex rounded-sm text-neutral-900 transition-[color,transform] duration-300 hover:-translate-y-0.5 hover:text-primary-700 focus-visible:focus-ring">
                      <s.icon className="size-4" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </footer>
    </div>
  );
}

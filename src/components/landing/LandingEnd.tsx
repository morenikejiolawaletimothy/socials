"use client";

import {
  Bank,
  Briefcase,
  Buildings,
  ChartLineUp,
  Copyright,
  Cpu,
  FacebookLogo,
  FirstAid,
  GraduationCap,
  InstagramLogo,
  Lightning,
  LinkedinLogo,
  Minus,
  PaperPlaneTilt,
  Plus,
  Scales,
  Truck,
  XLogo,
  type Icon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { BluecutMark, btnPrimary } from "./LandingTop";

type Tile = { icon: Icon; label: string; bg: string } | null;
const t = (icon: Icon, label: string, bg: string): Tile => ({ icon, label, bg });

// Two offset rows of tiles; filled tiles show a field we work with.
const rowA: Tile[] = [
  t(Bank, "Banking", "/landing/tile-1.png"), null, null, t(Cpu, "Technology", "/landing/tile-2.png"), null, null,
  t(FirstAid, "Health", "/landing/tile-3.png"), null, null, t(Scales, "Law", "/landing/tile-1.png"), null, t(ChartLineUp, "Venture capital", "/landing/tile-2.png"), null,
];
const rowB: Tile[] = [
  null, t(Briefcase, "Consulting", "/landing/tile-2.png"), null, null, t(Lightning, "Energy", "/landing/tile-3.png"), null,
  t(Buildings, "Real estate", "/landing/tile-1.png"), null, null, t(GraduationCap, "Education", "/landing/tile-2.png"), null, t(Truck, "Logistics", "/landing/tile-3.png"), null,
];

function TileRow({ tiles, offset }: { tiles: Tile[]; offset: string }) {
  return (
    <ul className={`flex justify-center gap-6 ${offset}`}>
      {tiles.map((tile, i) =>
        tile ? (
          <li
            key={i}
            title={tile.label}
            className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-[20px] bg-card shadow-[0px_4px_16px_0px_rgba(0,0,0,0.08)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={tile.bg} alt="" className="absolute inset-0 size-full" />
            <tile.icon className="relative size-9 text-primary-600" aria-hidden />
            <span className="sr-only">{tile.label}</span>
            <span aria-hidden className="absolute inset-0 rounded-[20px] shadow-[inset_0px_0px_0px_2px_white]" />
          </li>
        ) : (
          <li key={i} aria-hidden className="size-20 shrink-0 rounded-[20px] bg-card shadow-[inset_0px_0px_0px_1px_var(--color-neutral-100)]" />
        ),
      )}
    </ul>
  );
}

export function Industries() {
  return (
    <section className="flex flex-col items-center gap-[60px] overflow-hidden bg-card py-[100px]">
      <div className="flex w-full max-w-[1280px] flex-col items-center gap-3 px-5 md:px-10">
        <h2 className="w-full max-w-[730px] text-center lp-h2 text-neutral-950">Leaders we work with</h2>
      </div>
      <div
        className="flex h-52 w-full max-w-[1280px] flex-col justify-center gap-6"
        style={{
          maskImage: "linear-gradient(90deg, transparent 0%, black 20%, black 80%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 20%, black 80%, transparent 100%)",
        }}
      >
        <TileRow tiles={rowA} offset="" />
        <TileRow tiles={rowB} offset="pl-[104px]" />
      </div>
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
          <span className="rounded-[5px] bg-card py-1.5 lp-small text-neutral-950 opacity-80">FAQ</span>
          <h2 className="lp-h2-regular text-neutral-950">
            Common questions,
            <br />
            straight answers
          </h2>
        </div>
        <div className="flex flex-col items-start gap-6 self-end md:w-[300px]">
          <p className="lp-body text-neutral-950 opacity-50">Have a question that is not covered here? Write to us and we will reply within 24 hours.</p>
          <a href="mailto:hello@bluecut.example" className={`${btnPrimary} h-11`}>
            Contact us
          </a>
        </div>
      </div>
      <div className="w-full max-w-[980px] md:px-10">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q} className="border-b-[0.667px] border-neutral-100 py-6">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full items-center gap-6 rounded-sm text-left focus-visible:focus-ring"
              >
                <span className="flex-1 lp-body-medium text-neutral-950">{f.q}</span>
                {isOpen ? <Minus className="size-5 text-neutral-950" aria-hidden /> : <Plus className="size-5 text-neutral-950" aria-hidden />}
              </button>
              {isOpen && <p className="mt-6 max-w-[650px] lp-body text-neutral-950 opacity-50">{f.a}</p>}
            </div>
          );
        })}
      </div>
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
          <h2 className="max-w-[560px] text-center lp-h2-regular text-inverse">
            Less time on LinkedIn.
            <br />
            More of the right attention.
          </h2>
          <p className="max-w-[543px] px-2 text-center lp-body text-neutral-300">
            A dedicated expert runs your LinkedIn around your goals, and you approve everything. Your first 2 weeks are free.
          </p>
          <Link href="/signup" className={`${btnPrimary} h-11`}>
            Get started
          </Link>
        </div>
      </section>

      <footer className="flex flex-col items-center px-4 pb-20 pt-[50px] md:px-10">
        <div className="w-full max-w-[1280px] md:px-10">
          <div className="flex flex-col rounded-[24px] bg-card">
            <div className="flex flex-col gap-10 px-6 py-10 md:flex-row md:items-start md:justify-between md:py-[60px] md:pl-[68px] md:pr-20">
              <div className="flex gap-[68px]">
                {columns.map((c) => (
                  <nav key={c.title} aria-label={c.title} className="flex flex-col gap-4">
                    <p className="pl-3 text-[14px] font-medium leading-[14.4px] tracking-[-0.24px] text-neutral-900">{c.title}</p>
                    <ul className="flex flex-col gap-1">
                      {c.links.map(([l, h]) => (
                        <li key={l}>
                          <Link href={h} className="block rounded-[20px] px-3 py-1.5 text-[14px] leading-[18.2px] tracking-[-0.14px] text-neutral-950/50 hover:text-neutral-950 focus-visible:focus-ring">
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
                  className="inline-flex items-center justify-center rounded-[10px] bg-primary-600 px-[18px] py-[13px] text-[15px] font-medium leading-[15px] tracking-[-0.3px] text-inverse hover:bg-primary-700 focus-visible:focus-ring"
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
                    <a href="#" aria-label={s.label} className="flex rounded-sm text-neutral-900 hover:text-primary-700 focus-visible:focus-ring">
                      <s.icon className="size-4" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useState } from "react";

const sideGradient = "linear-gradient(21deg, rgba(0,0,0,0.4) 15%, rgba(0,0,0,0.25) 30%, rgba(0,0,0,0) 72%)";

/** Testimonial: one open card between two closed ones. Real testimonials replace the placeholder text. */
export function Testimonials() {
  return (
    <section className="relative flex flex-col items-center gap-[60px] overflow-hidden bg-card px-5 py-[100px] md:px-10">
      <h2 className="w-full max-w-[730px] text-center lp-h2 text-neutral-950">Trusted by leaders who value their reputation.</h2>
      <div className="flex w-full max-w-[1140px] items-center justify-center gap-4 md:h-[450px] md:px-10">
        {[{ src: "/landing/statement-3.jpg", pos: "object-[78%_50%]" }].map((s) => (
          <div key={s.src} className="relative hidden h-[450px] w-[200px] shrink-0 overflow-hidden rounded-[16px] bg-neutral-900 opacity-70 md:block">
            <Image src={s.src} alt="" fill sizes="200px" className={`object-cover ${s.pos}`} />
            <div className="absolute inset-0" style={{ backgroundImage: sideGradient }} />
          </div>
        ))}
        <figure className="flex w-full flex-col overflow-hidden rounded-[16px] bg-primary-900 md:h-[450px] md:flex-1 md:flex-row">
          <div className="p-3 md:w-[200px] md:shrink-0">
            <div className="relative h-72 overflow-hidden rounded-[8px] md:h-full">
              <Image src="/landing/statement-2.jpg" alt="" fill sizes="(min-width: 768px) 176px, 100vw" className="object-cover object-[30%_50%]" />
              <div className="absolute inset-0" style={{ backgroundImage: sideGradient }} />
            </div>
          </div>
          <div className="flex flex-1 flex-col justify-between gap-8 px-6 py-8 md:pl-4 md:pr-6">
            <blockquote className="lp-quote text-inverse">
              “A real client quote goes here, in their own words, about what changed for them on LinkedIn.”
            </blockquote>
            <figcaption className="flex flex-col gap-0.5">
              <span className="lp-small text-inverse">Client name</span>
              <span className="lp-small-regular text-inverse opacity-60">Role, company</span>
            </figcaption>
          </div>
        </figure>
        <div className="relative hidden h-[450px] w-[200px] shrink-0 overflow-hidden rounded-[16px] bg-neutral-900 opacity-70 md:block">
          <Image src="/landing/testimonial-right.jpg" alt="" fill sizes="200px" className="object-cover" />
          <div className="absolute inset-0" style={{ backgroundImage: sideGradient }} />
        </div>
      </div>
      <p className="absolute inset-x-5 bottom-10 text-center lp-tag text-neutral-500">Placeholder text. Real client testimonials will replace it before launch.</p>
    </section>
  );
}

const tabs = [
  { title: "Connect and two short calls", text: "Connect LinkedIn through its own sign-in, then two 30-minute calls to agree your goals and your strategy." },
  { title: "We create, you approve", text: "Your manager prepares posts and engagement in your voice. Nothing goes out without your say." },
  { title: "See your progress", text: "Weekly updates against the goal you set, not likes. You always see what was done." },
];

const tasks = [
  { t: "Approve 3 posts for next week", done: true },
  { t: "Send 15 connection requests", done: true },
  { t: "Read your weekly update", done: false },
];

export function HowItWorks() {
  const [active, setActive] = useState(0);
  return (
    <section id="how" className="flex scroll-mt-16 flex-col items-center gap-[60px] overflow-hidden bg-card px-5 py-[100px] md:px-20">
      <div className="w-full max-w-[1280px] md:px-10">
        <h2 className="max-w-[754px] lp-h2 text-neutral-950">How it works, from first call to first results</h2>
      </div>
      <div className="flex w-full max-w-[1280px] flex-col gap-12 md:px-10">
        <div role="tablist" aria-label="How it works" className="flex flex-col gap-8 md:flex-row md:gap-12">
          {tabs.map((t, i) => (
            <button
              key={t.title}
              type="button"
              role="tab"
              aria-selected={active === i}
              onClick={() => setActive(i)}
              className="relative flex flex-1 flex-col gap-[7.4px] pt-[27.33px] text-left focus-visible:focus-ring"
            >
              <span className={`absolute inset-x-0 top-0 h-[3px] ${active === i ? "bg-primary-100" : "bg-neutral-50"}`} />
              <span className="lp-tab-title text-neutral-900">{t.title}</span>
              <span className={`lp-body text-neutral-400 transition-opacity ${active === i ? "" : "opacity-40"}`}>{t.text}</span>
            </button>
          ))}
        </div>
        <div className="relative aspect-[1200/643] w-full overflow-visible">
          <div className="absolute inset-0 overflow-hidden rounded-[16px]">
            <Image src="/landing/hero.jpg" alt="A leader working with her team" fill sizes="(min-width: 1280px) 1200px, 100vw" className="object-cover object-[50%_30%]" />
            <div className="absolute inset-0 bg-neutral-950/30" />
          </div>
          <div className="absolute left-1/2 top-[65.56%] hidden w-[320px] -translate-x-1/2 rounded-[12px] bg-card p-5 shadow-[0px_0px_0px_4px_rgba(255,255,255,0.5)] sm:block">
            <div className="flex flex-col gap-6">
              <div className="flex gap-2">
                <span className="flex-1 rounded-[8px] bg-primary-100 px-3 py-1.5 text-center lp-caption text-neutral-950">Notes</span>
                <span className="flex-1 rounded-[8px] bg-primary-400 px-3 py-1.5 text-center lp-caption text-primary-950">Your part</span>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="lp-small text-neutral-950">This week</span>
                  {tasks.map((k) => (
                    <span key={k.t} className="flex items-center gap-2">
                      <span className={`size-3 rounded-full ${k.done ? "bg-primary-600" : "border border-neutral-200"}`} />
                      <span className="lp-caption text-neutral-900 opacity-60">{k.t}</span>
                    </span>
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  <span className="lp-small text-neutral-950">Next week</span>
                  <span className="h-3 w-full rounded-full bg-neutral-50" />
                  <span className="h-3 w-28 rounded-full bg-neutral-50" />
                </div>
              </div>
            </div>
          </div>
        </div>
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

/** What we measure, as a swipeable row of photo cards. */
export function Results() {
  return (
    <section className="flex flex-col items-center gap-[60px] overflow-hidden bg-card px-5 py-[100px] md:px-20">
      <div className="flex w-full max-w-[1280px] flex-col gap-[23px] md:px-10">
        <h2 className="max-w-[620px] lp-h2 text-neutral-950">
          Results measured
          <br />
          against your goal
        </h2>
        <p className="max-w-[500px] lp-body text-neutral-950 opacity-60">
          We agree your goal on the first call, then track what moves it. Likes and followers come second.
        </p>
      </div>
      <div className="w-full max-w-[1280px] md:px-10">
        <ul className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto">
          {results.map((r) => (
            <li key={r.big} className="relative h-[508px] w-[85%] shrink-0 snap-start overflow-hidden rounded-[12px] sm:w-[387px]">
              <Image src={r.img} alt="" fill sizes="387px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[48.6%] to-neutral-950/70 to-[71.4%]" />
              <div className="absolute inset-0" style={{ backgroundImage: radial, backgroundSize: "100% 100%" }} />
              <div className="absolute inset-x-6 top-[344px] flex flex-col gap-1">
                <p className="lp-big text-inverse">{r.big}</p>
                <p className="lp-small text-inverse">{r.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

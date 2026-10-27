import Link from "next/link";
import { Avatar, Badge, Logo } from "@/components/ui";
import { PhotoFrame } from "./PhotoFrame";
import { container, primaryLink, secondaryLink, section } from "./styles";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card">
      <div className={`${container} flex h-16 items-center justify-between gap-4`}>
        <Link href="/" className="flex items-center gap-2 rounded-full focus-visible:focus-ring" aria-label="Bluecut Socials home">
          <Logo size={36} />
          <span className="font-display text-display-lg text-primary">Bluecut</span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-3 sm:gap-6">
          {[
            ["How it works", "#how"],
            ["Pricing", "#pricing"],
            ["FAQ", "#faq"],
          ].map(([l, h]) => (
            <a key={h} href={h} className="hidden rounded-sm text-body-sm font-medium text-secondary hover:text-primary focus-visible:focus-ring md:inline">
              {l}
            </a>
          ))}
          <Link href="/signin" className="rounded-sm px-1 text-body-sm font-medium text-primary-700 hover:underline focus-visible:focus-ring">
            Sign in
          </Link>
          <Link href="/signup" className={`${primaryLink} min-h-10 px-4 py-2 text-body-sm`}>
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}

/** 2. Hero: centred message, wide photo, a post waiting for review floating over it. */
export function Hero() {
  return (
    <section id="hero" className={`${container} flex flex-col items-center gap-10 pb-16 pt-12 md:pb-24 md:pt-20`}>
      <div className="flex max-w-2xl flex-col items-center gap-6 text-center">
        <h1 className="font-display text-display-3xl text-primary">Be known for the right things on LinkedIn.</h1>
        <p className="text-body-lg text-secondary">
          A dedicated expert runs your LinkedIn around your goals. You approve every post before it goes live, and you stay in control of your account.
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link href="/signup" className={primaryLink}>
            Get started
          </Link>
          <a href="#how" className={secondaryLink}>
            See how it works
          </a>
        </div>
        <p className="text-body-sm text-secondary">Your first 2 weeks are free. Pull out any time.</p>
      </div>

      <div className="relative w-full max-w-4xl">
        <PhotoFrame label="a senior professional at work" className="aspect-4/3 sm:aspect-video" />
        <div className="relative -mt-16 mx-4 flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-lg sm:absolute sm:-bottom-8 sm:right-6 sm:mx-0 sm:mt-0 sm:w-80">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar name="Chidi Okeke" size="sm" />
              <div className="flex flex-col">
                <span className="text-body-sm font-semibold text-primary">Chidi Okeke</span>
                <span className="text-caption text-secondary">CEO, Paystream</span>
              </div>
            </div>
            <Badge status="info">For your review</Badge>
          </div>
          <p className="text-body-sm text-primary">Three years ago we nearly shut down Paystream. Here is what kept us going.</p>
          <div className="flex gap-2" aria-hidden>
            <span className="flex-1 rounded-md bg-primary-600 py-2 text-center text-body-sm font-medium text-inverse">Approve</span>
            <span className="flex-1 rounded-md border border-border-strong py-2 text-center text-body-sm font-medium text-primary-700">Ask for changes</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// Figures from the 2024 Edelman-LinkedIn B2B Thought Leadership Impact Report (3,484 respondents).
// Check each against the original report before launch.
const stats = [
  { tag: "Trust", value: "73", unit: "%", lead: "73% of decision-makers", text: " trust what leaders share on LinkedIn more than marketing material." },
  { tag: "Discovery", value: "75", unit: "%", lead: "75% of decision-makers", text: " have looked into a company they were not considering because of what its leaders shared." },
  { tag: "Value", value: "60", unit: "%", lead: "60% of decision-makers", text: " will pay more to work with companies whose leaders share useful thinking." },
];

/** 3. The problem, with three staggered stat cards. */
export function Problem() {
  return (
    <section className={`${container} ${section} flex flex-col items-center gap-12`}>
      <div className="flex max-w-xl flex-col items-center gap-4 text-center">
        <h2 className="font-display text-display-2xl text-primary">Your reputation is built on LinkedIn, whether you post or not.</h2>
        <p className="text-body text-secondary">
          Clients, investors and boards judge leaders by what they share. Most leaders do not have the time to share well, or often enough.
        </p>
      </div>
      <div className="grid w-full max-w-4xl gap-4 md:grid-cols-3 md:items-start">
        {stats.map((s, i) => (
          <div key={s.tag} className={`flex min-h-64 flex-col justify-between gap-8 rounded-lg border border-border bg-card p-6 shadow-sm ${i === 1 ? "md:mt-8" : ""}`}>
            <div className="flex flex-col gap-4">
              <span className="self-start rounded-sm border border-border px-2 py-1 text-caption text-secondary">{s.tag}</span>
              <p className="font-display text-display-3xl text-primary">
                {s.value}
                <span className="text-display-lg">{s.unit}</span>
              </p>
            </div>
            <p className="text-body-sm text-secondary">
              <span className="font-semibold text-primary">{s.lead}</span>
              {s.text}
            </p>
          </div>
        ))}
      </div>
      <p className="text-caption text-secondary">Source: 2024 Edelman and LinkedIn B2B Thought Leadership Impact Report.</p>
    </section>
  );
}

/** 4. One clear statement on a dotted background, with small photos around it. */
export function Statement() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-card bg-dots">
      <PhotoFrame label="a founder" compact className="absolute left-12 top-12 hidden size-32 lg:block" />
      <PhotoFrame label="a leader on a call" compact className="absolute bottom-12 right-12 hidden size-32 lg:block" />
      <div className={`${container} flex justify-center py-24 md:py-32`}>
        <p className="max-w-3xl text-center font-display text-display-2xl text-primary">
          Bluecut runs your LinkedIn end to end: strategy, posts, engagement and progress, with you in control of every step.
        </p>
      </div>
    </section>
  );
}

/** 5. Two cards with real views from the app. */
export function Connected() {
  const targets = [
    { label: "Posts", done: "2 of 2", tone: "success" as const, state: "Done" },
    { label: "Comments on target posts", done: "7 of 10", tone: "warning" as const, state: "Ongoing" },
    { label: "Connection requests", done: "0 of 15", tone: "neutral" as const, state: "To do" },
  ];
  const steps = ["Drafted by your manager", "Approved by you", "Scheduled for Tuesday 9am"];

  return (
    <section className={`${container} ${section} flex flex-col gap-10`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h2 className="max-w-md font-display text-display-2xl text-primary">Everything in one place, nothing behind your back</h2>
        <p className="max-w-sm text-body-sm text-secondary">Your strategy, your posts and your progress live in one app you can open from your phone.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="relative flex aspect-4/3 items-end justify-end overflow-hidden rounded-lg bg-primary-400">
            <div className="w-5/6 rounded-tl-lg border border-border bg-card p-4 shadow-lg">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-body-sm font-semibold text-primary">This week</span>
                <span className="text-caption text-secondary">Week 3 of 12</span>
              </div>
              <ul className="flex flex-col divide-y divide-border">
                {targets.map((t) => (
                  <li key={t.label} className="flex items-center justify-between gap-3 py-2">
                    <span className="flex flex-col">
                      <span className="text-body-sm text-primary">{t.label}</span>
                      <span className="text-caption text-secondary">{t.done}</span>
                    </span>
                    <Badge status={t.tone}>{t.state}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <h3 className="font-display text-display-lg text-primary">A strategy you can measure</h3>
          <p className="text-body-sm text-secondary">Weekly targets for posts, comments and connections, set from your goal. You always see what was done.</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex aspect-4/3 items-center justify-center rounded-lg bg-primary-50 p-6">
            <ol className="flex w-full max-w-xs flex-col items-center">
              {steps.map((s, i) => (
                <li key={s} className="flex w-full flex-col items-center">
                  <span className="w-full rounded-md border border-border bg-card px-4 py-3 text-body-sm text-primary shadow-sm">{s}</span>
                  {i < steps.length - 1 && <span aria-hidden className="h-4 w-px bg-border-strong" />}
                </li>
              ))}
              <span aria-hidden className="mt-4 size-8 rounded-full bg-primary-900" />
            </ol>
          </div>
          <h3 className="font-display text-display-lg text-primary">Posts you approve first</h3>
          <p className="text-body-sm text-secondary">Your manager writes in your voice. You read, approve or ask for changes. Nothing goes live without you.</p>
        </div>
      </div>
    </section>
  );
}

import { Play } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { HeroVisual } from "@/components/marketing/HeroVisual";
import { StickyCta } from "@/components/marketing/StickyCta";
import { Logo } from "@/components/ui";
import { formatPrice, included, planTotalCents, plans } from "@/lib/pricing";

const primaryLink =
  "inline-flex min-h-11 items-center justify-center rounded-md bg-primary-600 px-5 py-3 text-body font-medium leading-none text-inverse hover:bg-primary-700 focus-visible:focus-ring";
const secondaryLink =
  "inline-flex min-h-11 items-center justify-center rounded-md border border-border-strong bg-card px-5 py-3 text-body font-medium leading-none text-primary-700 hover:border-primary-300 hover:bg-primary-50 focus-visible:focus-ring";

const steps = [
  { title: "Connect LinkedIn", text: "Through LinkedIn's own sign-in. We never see your password." },
  { title: "Two short calls", text: "30 minutes to agree your goals. 30 minutes to agree your strategy." },
  { title: "We create, you approve", text: "Your manager prepares posts and engagement. Nothing goes out without your say." },
  { title: "See your progress", text: "Weekly updates against the goal you set, not likes." },
];

const reasons = [
  { title: "A dedicated expert", text: "One account manager who learns your field and your voice, from your first call onward." },
  { title: "A strategy built around you", text: "Clear weekly targets for posts, comments and connections, so you always know what was done." },
  { title: "Results you can measure", text: "We track progress toward your goal, such as investor conversations or speaking invitations." },
];

const control = [
  { title: "Nothing goes live without you", text: "You see every post first. Approve it, change it, or take it down later." },
  { title: "You choose what we do", text: "Post for you, comment for you, or both. Change it any time." },
  { title: "We never see your password", text: "You connect through LinkedIn's own sign-in, on your own device." },
  { title: "Pause or disconnect in one tap", text: "Everything stops straight away." },
  { title: "Off limits stays off limits", text: "Tell us the topics, people and companies to avoid. We check every post against them." },
];

export default function Landing() {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/" className="flex items-center gap-2 rounded-full focus-visible:focus-ring" aria-label="Bluecut Socials home">
            <Logo size={36} />
            <span className="font-display text-display-lg text-primary">Bluecut</span>
          </Link>
          <nav aria-label="Main" className="flex items-center gap-2 sm:gap-6">
            <a href="#how" className="hidden rounded-sm text-body-sm font-medium text-secondary hover:text-primary focus-visible:focus-ring md:inline">
              How it works
            </a>
            <a href="#pricing" className="hidden rounded-sm text-body-sm font-medium text-secondary hover:text-primary focus-visible:focus-ring md:inline">
              Pricing
            </a>
            <Link href="/signin" className="rounded-sm px-2 text-body-sm font-medium text-primary-700 hover:underline focus-visible:focus-ring">
              Sign in
            </Link>
            <Link href="/signup" className={`${secondaryLink} min-h-10 px-4 py-2 text-body-sm`}>
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section id="hero" className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-12 md:grid-cols-2 md:py-24">
          <div className="flex flex-col gap-6">
            <p className="text-body-sm font-medium text-primary-700">LinkedIn, run for you</p>
            <h1 className="font-display text-display-3xl text-primary">
              Be known for the right things on LinkedIn.
            </h1>
            <p className="text-body-lg text-secondary">
              A dedicated expert runs your LinkedIn around your goals. You approve every post before it goes live, and you stay in control of your account.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className={primaryLink}>
                Get started
              </Link>
              <a href="#how" className={secondaryLink}>
                See how it works
              </a>
            </div>
            <p className="text-body-sm text-secondary">Your first 2 weeks are free. Pull out any time.</p>
          </div>
          <HeroVisual />
        </section>

        <section id="how" className="border-y border-border bg-card">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 md:py-20">
            <div className="flex max-w-2xl flex-col gap-3">
              <h2 className="font-display text-display-2xl text-primary">How it works</h2>
              <p className="text-body-lg text-secondary">Four steps. Your part takes about an hour in total, then a few minutes a week.</p>
            </div>
            <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <li key={s.title} className="flex flex-col gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary-600 text-body font-semibold text-inverse">{i + 1}</span>
                  <h3 className="font-display text-display-lg text-primary">{s.title}</h3>
                  <p className="text-body text-secondary">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 md:py-20">
          <div className="flex max-w-2xl flex-col gap-3">
            <h2 className="font-display text-display-2xl text-primary">Why Bluecut</h2>
            <p className="text-body-lg text-secondary">Built for busy leaders who want results, not more work.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {reasons.map((r) => (
              <div key={r.title} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6 shadow-sm">
                <h3 className="font-display text-display-xl text-primary">{r.title}</h3>
                <p className="text-body text-secondary">{r.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-dark text-inverse">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-5 md:py-20">
            <div className="flex flex-col gap-3 md:col-span-2">
              <h2 className="font-display text-display-2xl">You stay in control of your account.</h2>
              <p className="text-body-lg text-neutral-300">Your reputation is yours. Every action on your account is logged, and you can see it any time.</p>
            </div>
            <ul className="grid gap-6 sm:grid-cols-2 md:col-span-3">
              {control.map((c) => (
                <li key={c.title} className="flex flex-col gap-2 border-t border-neutral-700 pt-4">
                  <h3 className="text-body font-semibold">{c.title}</h3>
                  <p className="text-body-sm text-neutral-300">{c.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 md:py-20">
          <div className="flex max-w-2xl flex-col gap-3">
            <h2 className="font-display text-display-2xl text-primary">What clients say</h2>
            <p className="text-body-lg text-secondary">In their own words, with the profiles to show for it.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <figure key={n} className="flex flex-col gap-3">
                <div className="relative flex aspect-video items-center justify-center rounded-lg bg-neutral-800">
                  <span className="flex size-14 items-center justify-center rounded-full bg-neutral-0 text-neutral-900">
                    <Play className="size-6" aria-hidden />
                  </span>
                  <span className="sr-only">Client video, coming soon</span>
                </div>
                <figcaption className="flex flex-col">
                  <span className="text-body font-medium text-primary">Client video</span>
                  <span className="text-body-sm text-secondary">Name, role and company</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {["Profile before Bluecut", "Profile after 3 months"].map((t) => (
              <figure key={t} className="flex flex-col gap-3">
                <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-border-strong bg-card">
                  <span className="text-body-sm text-secondary">Profile image</span>
                </div>
                <figcaption className="text-body-sm text-secondary">{t}</figcaption>
              </figure>
            ))}
          </div>
          <p className="text-caption text-secondary">Placeholder frames. Real client videos and profiles will replace them before launch.</p>
        </section>

        <section id="pricing" className="border-t border-border bg-card">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 md:py-20">
            <div className="flex max-w-2xl flex-col gap-3">
              <h2 className="font-display text-display-2xl text-primary">Choose your commitment</h2>
              <p className="text-body-lg text-secondary">
                Your first 2 weeks are free. Your contract starts in week 3, and you can pull out any time. We refund every month not yet started.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {plans.map((p) => (
                <div key={p.id} className="flex flex-col gap-4 rounded-lg border border-border bg-page p-6">
                  <h3 className="font-display text-display-xl text-primary">{p.label}</h3>
                  <p className="flex items-baseline gap-1">
                    <span className="font-display text-display-3xl text-primary">{formatPrice(p.monthlyUsdCents)}</span>
                    <span className="text-body-sm text-secondary">a month</span>
                  </p>
                  <p className="text-body-sm text-secondary">{formatPrice(planTotalCents(p))} paid up front</p>
                  <p className="flex-1 text-body text-primary">{p.summary}</p>
                  <Link href={`/signup?plan=${p.id}`} className={secondaryLink}>
                    Start with {p.label}
                  </Link>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-body font-medium text-primary">Every plan includes</p>
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {included.map((i) => (
                  <li key={i} className="flex items-center gap-2 text-body text-secondary">
                    <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-primary-600" />
                    {i}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-caption text-secondary">Prices shown in US dollars. At checkout you see your local currency.</p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <div className="flex flex-col items-start gap-6 rounded-xl bg-primary-50 p-8 md:flex-row md:items-center md:justify-between md:p-12">
            <div className="flex flex-col gap-2">
              <h2 className="font-display text-display-2xl text-primary-900">Ready when you are.</h2>
              <p className="text-body-lg text-neutral-600">Create your account in under a minute. Your first 2 weeks are free.</p>
            </div>
            <Link href="/signup" className={primaryLink}>
              Get started
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card pb-24 md:pb-0">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Logo size={28} />
            <span className="text-body-sm text-secondary">© 2026 Bluecut Socials</span>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-body-sm">
              {[
                ["Sign in", "/signin"],
                ["Privacy", "/privacy"],
                ["Terms", "/terms"],
                ["Contact", "mailto:hello@bluecut.example"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="rounded-sm text-secondary hover:text-primary focus-visible:focus-ring">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </footer>
      <StickyCta watchId="hero" />
    </>
  );
}

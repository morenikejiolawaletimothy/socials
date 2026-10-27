import { FacebookLogo, InstagramLogo, LinkedinLogo, Minus, PaperPlaneRight, Plus, XLogo } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Logo } from "@/components/ui";
import { container, primaryLink, section } from "./styles";

const industries = [
  ["Fintech", "Health", "Law", "Technology", "Consulting", "Banking", "Real estate"],
  ["Energy", "Education", "Media", "Manufacturing", "Logistics", "Venture capital", "Public sector"],
];

/** 10. Who we work with: two rows of fields, fading at the edges. */
export function Industries() {
  return (
    <section className={`${section} flex flex-col items-center gap-10 overflow-hidden`}>
      <div className={`${container} flex flex-col items-center gap-3 text-center`}>
        <h2 className="font-display text-display-2xl text-primary">Leaders we work with</h2>
        <p className="max-w-md text-body-sm text-secondary">Senior professionals and founders in fields where trust matters, including those with strict rules on what can be said.</p>
      </div>
      <div className="relative flex w-full flex-col gap-3">
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-page sm:w-40" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-page sm:w-40" />
        {industries.map((row, r) => (
          <ul key={r} className={`flex justify-center gap-3 ${r === 1 ? "pl-16" : ""}`}>
            {row.map((i) => (
              <li key={i} className="shrink-0 rounded-md border border-border bg-card px-4 py-3 text-body-sm font-medium text-primary shadow-sm">
                {i}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}

const faqs = [
  { q: "Do you need my LinkedIn password?", a: "No. You connect your account through LinkedIn's own sign-in, on your own device. We never see or store your password, and you can disconnect at any time." },
  { q: "Will anything be posted without my approval?", a: "No. You see every post before it goes live. You choose what needs your approval, and if you prefer, you can let us go ahead when you have not replied within 24 hours." },
  { q: "How much of my time does it take?", a: "About an hour to get started: setting up your account and two 30-minute calls. After that, a few minutes a week to review posts and do any quick tasks." },
  { q: "What happens in the first 2 weeks?", a: "Your first 2 weeks are free and you get the full service. We agree your goals, build your strategy and start posting. Your contract starts in week 3." },
  { q: "Can I pull out of my contract?", a: "Yes, any time. Service runs to the end of the current month and we refund every month not yet started. If you pull out in the first 2 weeks, you pay nothing." },
  { q: "My field has strict rules on what I can say. Can you still help?", a: "Yes. Tell us what is off limits, such as topics, people, companies or claims your profession does not allow. We check every post and every comment against it." },
];

/** 12. FAQ with a contact prompt. */
export function Faq() {
  return (
    <section id="faq" className={`${container} ${section} flex scroll-mt-20 justify-center`}>
      <div className="flex w-full max-w-3xl flex-col gap-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-3">
            <span className="text-caption font-medium text-primary-700">FAQ</span>
            <h2 className="max-w-sm font-display text-display-2xl text-primary">Common questions, straight answers</h2>
          </div>
          <div className="flex max-w-xs flex-col gap-3">
            <p className="text-body-sm text-secondary">Have a question that is not covered here? Write to us and we will reply within 24 hours.</p>
            <a href="mailto:hello@bluecut.example" className={`${primaryLink} self-start`}>
              Contact us
            </a>
          </div>
        </div>
        <div className="flex flex-col border-t border-border">
          {faqs.map((f, i) => (
            <details key={f.q} open={i === 0} className="group border-b border-border">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm py-5 text-body font-medium text-primary focus-visible:focus-ring [&::-webkit-details-marker]:hidden">
                {f.q}
                <Plus className="size-5 shrink-0 text-secondary group-open:hidden" aria-hidden />
                <Minus className="hidden size-5 shrink-0 text-secondary group-open:block" aria-hidden />
              </summary>
              <p className="pb-5 text-body-sm text-secondary">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/** 13 and 14. Navy closing band with the footer card sitting inside it. */
export function ClosingAndFooter() {
  const columns = [
    { title: "Company", links: [["How it works", "#how"], ["Pricing", "#pricing"], ["FAQ", "#faq"], ["Sign in", "/signin"]] },
    { title: "Legal", links: [["Terms of service", "/terms"], ["Privacy policy", "/privacy"]] },
  ];
  const socials = [
    { label: "Bluecut on X", icon: XLogo },
    { label: "Bluecut on LinkedIn", icon: LinkedinLogo },
    { label: "Bluecut on Instagram", icon: InstagramLogo },
    { label: "Bluecut on Facebook", icon: FacebookLogo },
  ];

  return (
    <div className="bg-primary-900 pb-28 text-inverse md:pb-16">
      <section className={`${container} flex flex-col items-center gap-6 py-20 text-center md:py-24`}>
        <h2 className="font-display text-display-2xl">
          Less time on LinkedIn.
          <br />
          More of the right attention.
        </h2>
        <p className="max-w-md text-body text-primary-100">A dedicated expert runs your LinkedIn around your goals, and you approve everything. Your first 2 weeks are free.</p>
        <Link href="/signup" className={primaryLink}>
          Get started
        </Link>
      </section>

      <footer className={container}>
        <div className="flex flex-col gap-8 rounded-xl bg-card p-6 text-primary md:p-10">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            {columns.map((c) => (
              <nav key={c.title} aria-label={c.title} className="flex flex-col gap-3">
                <p className="text-body-sm font-semibold">{c.title}</p>
                <ul className="flex flex-col gap-2">
                  {c.links.map(([l, h]) => (
                    <li key={l}>
                      <Link href={h} className="rounded-sm text-body-sm text-secondary hover:text-primary focus-visible:focus-ring">
                        {l}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
            <form className="flex flex-col gap-3 sm:col-span-2 md:col-start-4 md:col-span-1" action="#">
              <label htmlFor="newsletter" className="text-body-sm font-semibold">
                Newsletter
              </label>
              <div className="flex gap-2">
                <input
                  id="newsletter"
                  type="email"
                  placeholder="Your email"
                  className="min-h-11 min-w-0 flex-1 rounded-sm border border-border-strong bg-card px-3 text-body-sm text-primary placeholder:text-neutral-400 focus-visible:border-primary-600 focus-visible:focus-ring"
                />
                <button type="submit" aria-label="Subscribe" className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary-600 text-inverse hover:bg-primary-700 focus-visible:focus-ring">
                  <PaperPlaneRight className="size-5" aria-hidden />
                </button>
              </div>
              <p className="text-caption text-secondary">
                By subscribing you agree to our{" "}
                <Link href="/terms" className="underline hover:text-primary">terms</Link> and{" "}
                <Link href="/privacy" className="underline hover:text-primary">privacy policy</Link>.
              </p>
            </form>
          </div>

          <div className="flex items-center justify-between gap-4 border-y border-border py-6">
            <span className="flex items-center gap-2">
              <Logo size={32} />
              <span className="font-display text-display-lg">Bluecut</span>
            </span>
            <a href="mailto:hello@bluecut.example" className={`${primaryLink} min-h-10 px-4 py-2 text-body-sm`}>
              Contact us
            </a>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-caption text-secondary">© 2026 Bluecut Socials. All rights reserved.</p>
            <ul className="flex gap-4">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href="#" aria-label={s.label} className="flex rounded-sm text-primary hover:text-primary-700 focus-visible:focus-ring">
                    <s.icon className="size-5" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

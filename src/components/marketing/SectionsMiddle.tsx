import { CheckCircle, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Avatar } from "@/components/ui";
import { formatPrice, included, planTotalCents, plans } from "@/lib/pricing";
import { PhotoFrame } from "./PhotoFrame";
import { container, section, secondaryLink } from "./styles";

function Checks({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((i) => (
        <li key={i} className="flex items-start gap-3 text-body-sm text-primary-100">
          <CheckCircle className="mt-0.5 size-5 shrink-0 text-primary-200" aria-hidden />
          {i}
        </li>
      ))}
    </ul>
  );
}

/** 6. Navy band: two feature rows with views from the app. */
export function Features() {
  return (
    <section className="bg-primary-900 text-inverse">
      <div className={`${container} ${section} flex flex-col gap-16 md:gap-24`}>
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-display-xl">Engagement with the right people</h2>
            <p className="text-body-sm text-primary-100">Being seen is not only about posting. We find the people and conversations that matter to your goal, and help you show up there.</p>
            <Checks
              items={[
                "A weekly list of people and posts worth engaging with",
                "Comments written in your voice, sent as you allow",
                "Connection requests ready to send in a few minutes",
              ]}
            />
          </div>
          <div aria-hidden className="flex flex-col justify-center gap-3 rounded-lg bg-primary-50 px-6 py-12">
            <div className="flex items-center gap-2 self-end rounded-md border border-border bg-card px-3 py-2 text-caption text-secondary shadow-sm">
              <MagnifyingGlass className="size-4" />
              Fintech founders in Lagos
            </div>
            {[
              ["Amaka Nwosu", "Partner, Lagos Ventures", "Strong fit"],
              ["Tolu Benson", "Head of payments, Altbank", "Good fit"],
            ].map(([n, r, f]) => (
              <div key={n} className="flex items-center justify-between gap-3 rounded-md border border-border bg-card p-3 text-primary shadow-sm">
                <span className="flex items-center gap-3">
                  <Avatar name={n} size="sm" />
                  <span className="flex flex-col">
                    <span className="text-body-sm font-medium">{n}</span>
                    <span className="text-caption text-secondary">{r}</span>
                  </span>
                </span>
                <span className="rounded-full bg-success-bg px-2 py-1 text-caption text-neutral-900">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid items-center gap-10 md:grid-cols-2">
          <div aria-hidden className="order-2 flex flex-col justify-center gap-3 rounded-lg bg-primary-50 px-6 py-12 md:order-1">
            {[
              ["Post for me", true],
              ["Like and comment for me", true],
              ["Post to my company Page", false],
            ].map(([l, on]) => (
              <div key={l as string} className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3 shadow-sm">
                <span className="text-body-sm text-primary">{l}</span>
                <span className={`flex h-6 w-11 items-center rounded-full px-0.5 ${on ? "justify-end bg-primary-600" : "justify-start bg-neutral-150"}`}>
                  <span className="size-5 rounded-full bg-card shadow-sm" />
                </span>
              </div>
            ))}
            <div className="rounded-md border border-border bg-card px-4 py-3 text-body-sm text-danger shadow-sm">Pause all posting</div>
          </div>
          <div className="order-1 flex flex-col gap-4 md:order-2">
            <h2 className="font-display text-display-xl">You stay in control</h2>
            <p className="text-body-sm text-primary-100">Your account and your reputation stay yours. You decide what we do, and you can change it any time.</p>
            <Checks
              items={[
                "We never see your password. You connect through LinkedIn's own sign-in",
                "Choose what we do for you, and what needs your approval",
                "Pause, take a post down or disconnect in one tap",
                "Tell us what is off limits. We check every post against it",
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/** 7. Testimonials: one highlighted client between two photos. Real testimonials only. */
export function Testimonials() {
  return (
    <section className={`${container} ${section} flex flex-col items-center gap-12`}>
      <h2 className="max-w-xl text-center font-display text-display-2xl text-primary">Trusted by leaders who value their reputation.</h2>
      <div className="grid w-full max-w-4xl items-stretch gap-4 md:grid-cols-6">
        <PhotoFrame label="client" compact className="hidden min-h-96 md:col-span-1 md:block" />
        <figure className="flex flex-col gap-6 rounded-lg bg-primary-900 p-4 text-inverse sm:flex-row md:col-span-4">
          <PhotoFrame label="client portrait or video" className="aspect-square shrink-0 sm:w-56 sm:aspect-auto" />
          <div className="flex flex-col justify-between gap-6 p-2">
            <blockquote className="text-body text-primary-100">
              A real client quote goes here, in their own words, about what changed for them on LinkedIn.
            </blockquote>
            <figcaption className="flex flex-col">
              <span className="text-body-sm font-semibold">Client name</span>
              <span className="text-caption text-primary-200">Role, company</span>
            </figcaption>
          </div>
        </figure>
        <PhotoFrame label="client" compact className="hidden min-h-96 md:col-span-1 md:block" />
      </div>
      <p className="text-caption text-secondary">Placeholder. Real client testimonials will replace it before launch.</p>
    </section>
  );
}

const steps = [
  { title: "Connect LinkedIn", text: "Through LinkedIn's own sign-in. We never see your password." },
  { title: "Two short calls", text: "30 minutes to agree your goals. 30 minutes to agree your strategy." },
  { title: "We create, you approve", text: "Your manager prepares posts and engagement. Nothing goes out without your say." },
  { title: "See your progress", text: "Weekly updates against the goal you set, not likes." },
];

/** 8. How it works: steps in columns, then a photo with this week's tasks. */
export function HowItWorks() {
  const tasks = [
    { t: "Approve 3 posts for next week", done: true },
    { t: "Send 15 connection requests", done: true },
    { t: "Read your weekly update", done: false },
  ];
  return (
    <section id="how" className={`${container} ${section} flex scroll-mt-20 flex-col gap-10`}>
      <h2 className="max-w-md font-display text-display-2xl text-primary">How it works, from first call to first results</h2>
      <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <li key={s.title} className="flex flex-col gap-2 border-t border-border pt-4">
            <span className="text-caption font-medium text-primary-700">Step {i + 1}</span>
            <h3 className="text-body font-semibold text-primary">{s.title}</h3>
            <p className="text-body-sm text-secondary">{s.text}</p>
          </li>
        ))}
      </ol>
      <div className="relative">
        <PhotoFrame label="a leader reviewing posts on a phone" className="aspect-4/3 sm:aspect-video" />
        <div className="relative -mt-20 mx-4 flex flex-col gap-3 rounded-t-lg border border-border bg-card p-4 shadow-lg sm:absolute sm:bottom-0 sm:left-1/2 sm:mx-0 sm:mt-0 sm:w-80 sm:-translate-x-1/2">
          <div aria-hidden className="grid grid-cols-2 gap-2 text-center text-caption">
            <span className="rounded-sm bg-neutral-100 py-1 text-secondary">Notes</span>
            <span className="rounded-sm bg-primary-600 py-1 text-inverse">Your part</span>
          </div>
          <p className="text-body-sm font-semibold text-primary">This week, about 10 minutes</p>
          <ul className="flex flex-col gap-2">
            {tasks.map((t) => (
              <li key={t.t} className="flex items-center gap-2 text-body-sm text-primary">
                <span aria-hidden className={`size-3 rounded-full ${t.done ? "bg-primary-600" : "border border-border-strong"}`} />
                {t.t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const outcomes = [
  { big: "Profile views", text: "From the people you want to reach, not just anyone.", label: "a leader speaking at an event" },
  { big: "Invitations", text: "To speak, to advise, to join boards and panels.", label: "a leader on a panel" },
  { big: "Conversations", text: "With investors, clients and partners who found you.", label: "a leader in a meeting" },
];

/** 9. Outcomes we measure, on photo cards. */
export function Outcomes() {
  return (
    <section className={`${container} ${section} flex flex-col gap-10`}>
      <div className="flex max-w-md flex-col gap-4">
        <h2 className="font-display text-display-2xl text-primary">Results measured against your goal</h2>
        <p className="text-body-sm text-secondary">We agree your goal on the first call, then track what moves it. Likes and followers come second.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {outcomes.map((o) => (
          <div key={o.big} className="relative overflow-hidden rounded-lg">
            <PhotoFrame label={o.label} className="aspect-4/5" />
            <div className="absolute inset-x-0 bottom-0 flex min-h-36 flex-col gap-2 bg-dark p-6 text-inverse">
              <p className="font-display text-display-2xl">{o.big}</p>
              <p className="text-body-sm text-neutral-300">{o.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Pricing (not in the PDF; kept because "Pricing" is in the nav). */
export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-16 border-y border-border bg-card">
      <div className={`${container} ${section} flex flex-col gap-10`}>
        <div className="flex max-w-2xl flex-col gap-4">
          <h2 className="font-display text-display-2xl text-primary">Choose your commitment</h2>
          <p className="text-body text-secondary">
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
              <li key={i} className="flex items-center gap-2 text-body-sm text-secondary">
                <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-primary-600" />
                {i}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-caption text-secondary">Prices shown in US dollars. At checkout you see your local currency.</p>
      </div>
    </section>
  );
}

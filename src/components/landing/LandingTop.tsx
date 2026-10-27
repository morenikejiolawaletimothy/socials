import Image from "next/image";
import Link from "next/link";

// Measurements follow the approved Figma template (1440w light). Colours map to design-system tokens.

export const btnPrimary =
  "inline-flex min-h-[44px] items-center justify-center rounded-[10px] bg-primary-600 px-5 py-3 lp-body-medium tracking-normal leading-4 text-inverse hover:bg-primary-700 focus-visible:focus-ring";
export const btnSecondary =
  "inline-flex min-h-[44px] items-center justify-center rounded-[10px] border-[0.667px] border-neutral-100 bg-card px-5 py-3 lp-body-medium tracking-normal leading-4 text-primary-700 hover:bg-primary-50 focus-visible:focus-ring";
export const container = "mx-auto w-full max-w-[1280px] px-0 md:px-10";

export function BluecutMark({ size = 36, textClass = "text-[18px] leading-[23.4px]" }: { size?: number; textClass?: string }) {
  return (
    <span className="flex items-center gap-2">
      <Image src="/brand/bluecut-mark.png" alt="" width={size} height={size} className="rounded-full" priority />
      <span className={`font-semibold text-primary ${textClass}`}>Bluecut</span>
    </span>
  );
}

export function LandingNav() {
  return (
    <header className="sticky top-0 z-30 border-b-[0.667px] border-neutral-100 bg-card">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-4">
        <Link href="/" aria-label="Bluecut Socials home" className="rounded-full focus-visible:focus-ring">
          <BluecutMark />
        </Link>
        <nav aria-label="Main" className="flex items-center gap-6">
          <a href="#how" className="hidden rounded-[6px] lp-nav text-neutral-500 hover:text-primary md:inline focus-visible:focus-ring">
            How it works
          </a>
          <a href="#faq" className="hidden rounded-[6px] lp-nav text-neutral-500 hover:text-primary md:inline focus-visible:focus-ring">
            FAQ
          </a>
          <Link href="/signin" className="hidden rounded-[6px] px-2 lp-nav text-primary-700 hover:underline sm:inline focus-visible:focus-ring">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex min-h-[44px] items-center justify-center rounded-[10px] border-[0.667px] border-neutral-400 bg-primary-600 px-5 py-3 text-[14px] font-medium leading-[14px] text-inverse hover:bg-primary-700 focus-visible:focus-ring"
          >
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}

/** The client's profile card, floating over the hero photo (as in the template). */
function HeroProfileCard() {
  return (
    <div className="absolute bottom-[-90px] right-[43px] hidden w-[262px] overflow-hidden rounded-[16px] border-[0.667px] border-neutral-100 bg-card shadow-[0px_2px_4px_0px_rgba(20,23,20,0.06)] md:block">
      <div className="h-14 bg-primary-100" />
      <div className="-mt-8 flex flex-col gap-1 px-6 pb-6">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary-100 text-[18px] font-semibold leading-[27.9px] text-primary-900 shadow-[0px_0px_0px_4px_white]">
          CO
        </span>
        <span className="pt-2 text-[18px] font-semibold leading-[23.4px] text-primary">Chidi Okeke</span>
        <span className="text-[14px] leading-[21px] text-neutral-500">CEO, Paystream</span>
        <span className="mt-2 inline-flex items-center gap-2 self-start rounded-full bg-success-bg px-3 py-2 text-[12px] leading-3 text-primary">
          <span className="size-[7px] rounded-full bg-success" />
          Active
        </span>
      </div>
      <div className="border-t-[0.667px] border-neutral-100 px-6 py-3 text-[14px] leading-[21px] text-primary-700">Your brand</div>
    </div>
  );
}

export function Hero() {
  return (
    <section id="hero" className="bg-page px-5 py-[72px] md:px-20 md:py-[120px]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-10">
        <div className="flex w-full max-w-[1280px] flex-col items-center gap-10 md:px-10">
          <div className="flex w-full flex-col items-center gap-8">
            <h1 className="w-full max-w-[757px] pt-[35px] text-center lp-h1 text-primary">Be known for the right things on LinkedIn.</h1>
            <p className="w-full max-w-[606px] text-center lp-lead text-neutral-500">
              A dedicated expert runs your LinkedIn around your goals. You approve every post before it goes live, and you stay in control of your account.
            </p>
          </div>
          <div className="flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row">
            <Link href="/signup" className={btnPrimary}>
              Get started
            </Link>
            <a href="#how" className={btnSecondary}>
              See how it works
            </a>
          </div>
        </div>
        <div className="relative w-full max-w-[1088.6px]">
          <div className="relative aspect-[1.867] w-full overflow-hidden rounded-[14.5px]">
            <Image
              src="/landing/hero.jpg"
              alt="A senior professional working with her team"
              fill
              priority
              sizes="(min-width: 1100px) 1089px, 100vw"
              className="object-cover object-[50%_30%]"
            />
            <div className="absolute inset-0 bg-neutral-950/30" />
          </div>
          <HeroProfileCard />
        </div>
      </div>
    </section>
  );
}

// Figures from the 2024 Edelman-LinkedIn B2B Thought Leadership Impact Report. Check against the original before launch.
const stats = [
  { tag: "Trust", value: "73", unit: "%", lead: "73% of decision-makers", rest: " trust what leaders share on LinkedIn more than marketing material.", pad: "md:pt-4" },
  { tag: "Discovery", value: "75", unit: "%", lead: "75% of decision-makers", rest: " have looked into a company because of what its leaders shared.", pad: "md:pt-16" },
  { tag: "Value", value: "60", unit: "%", lead: "60% of decision-makers", rest: " will pay more to work with companies whose leaders share useful thinking.", pad: "" },
];

export function Intro() {
  return (
    <section className="relative flex flex-col items-center gap-20 overflow-hidden bg-page px-5 pb-[120px] pt-16 md:px-20">
      <div className="flex w-full max-w-[1280px] flex-col items-center gap-3 md:px-10">
        <h2 className="w-full max-w-[500px] text-center lp-h2 text-neutral-950">Your reputation lives on LinkedIn.</h2>
        <p className="w-full max-w-[500px] py-[11px] text-center lp-body text-neutral-950 opacity-50">
          Clients, investors and boards judge leaders by what they share. Most leaders do not have the time to share well, or often enough.
        </p>
      </div>
      <div className="flex w-full max-w-[900px] flex-col items-stretch gap-6 md:flex-row md:items-start">
        {stats.map((s) => (
          <div key={s.tag} className={`flex flex-1 flex-col ${s.pad}`}>
            <div className="flex h-[260px] flex-col justify-between overflow-hidden rounded-[12px] bg-card px-6 py-8 md:h-[360px]">
              <div className="flex flex-col items-start gap-6">
                <span className="rounded-[6px] bg-gradient-to-b from-neutral-950/[0.03] to-neutral-950/15 p-px">
                  <span className="block rounded-[5px] bg-card px-2 py-1 lp-tag text-neutral-950/80">{s.tag}</span>
                </span>
                <p className="flex items-end text-neutral-950">
                  <span className="lp-stat">{s.value}</span>
                  <span className="lp-stat-unit">{s.unit}</span>
                </p>
              </div>
              <p className="max-w-[237px] text-[14px] leading-[18.2px] tracking-[-0.28px]">
                <span className="font-medium text-neutral-900">{s.lead}</span>
                <span className="text-neutral-500">{s.rest}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className="absolute inset-x-5 bottom-12 text-center lp-tag text-neutral-500">Source: 2024 Edelman and LinkedIn B2B Thought Leadership Impact Report.</p>
    </section>
  );
}

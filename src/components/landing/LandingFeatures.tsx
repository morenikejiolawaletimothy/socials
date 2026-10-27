import { CalendarBlank, CheckCircle, PencilSimple, Trash } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { FitBox } from "./FitBox";

/** Big statement on the masked dot pattern, with three photos around it (desktop). */
export function Statement() {
  return (
    <section className="relative overflow-hidden bg-card">
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
          <p className="mx-auto max-w-[1055px] px-0 text-center lp-h2 text-neutral-950 lg:px-[31px]">
            Bluecut runs your LinkedIn end to end: strategy, posts, engagement and progress, with you in control of every step.
          </p>
          {[
            { src: "/landing/statement-1.jpg", alt: "A founder at her desk", pos: "left-[782px] top-[-296px]" },
            { src: "/landing/statement-2.jpg", alt: "A business owner in his studio", pos: "left-[200px] top-[-350px]" },
            { src: "/landing/statement-3.jpg", alt: "A leader on a call", pos: "left-[955px] top-[260px]" },
          ].map((w) => (
            <div key={w.src} className={`absolute hidden h-[180px] w-[220px] overflow-hidden lg:block ${w.pos}`}>
              <Image src={w.src} alt={w.alt} fill sizes="220px" className="object-cover" />
            </div>
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

/** Card 1: this week's targets, on a blurred brand-blue panel. */
function TargetsPanel() {
  return (
    <FitBox width={588} height={480}>
      <div className="relative h-[480px] w-[588px] overflow-hidden rounded-[12px] bg-neutral-25">
        <div className="absolute left-[-59px] top-[-356px] h-[936px] w-[706px] bg-primary-600 blur-[50px]" />
        <div className="absolute left-[-59px] top-[-253px] h-[873px] w-[706px] bg-neutral-0/40 blur-[35px]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(/landing/noise.png)" }} />
        <div className="absolute left-[294px] top-[240px] flex h-[255px] w-[320px] flex-col gap-4 overflow-hidden rounded-[16px] bg-card px-6 pb-2 pt-6 shadow-[0px_0px_0px_4px_rgba(255,255,255,0.5)]">
          <div className="flex h-8 w-[272px] items-center justify-between">
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
          </div>
          <ul className="flex w-[272px] flex-col">
            {rows.map((r, i) => (
              <li key={r.label} className={`flex h-[58.4px] items-center justify-between py-4 ${i < rows.length - 1 ? "border-b-[0.667px] border-neutral-100" : ""}`}>
                <span className="lp-small text-neutral-950">{r.label}</span>
                <span className={`rounded-[6px] px-3 py-1.5 ${r.bg}`}>
                  <span className="lp-caption text-neutral-900 opacity-50">{r.status}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </FitBox>
  );
}

const steps = [
  { icon: PencilSimple, text: "Drafted by your manager", top: "top-0" },
  { icon: CheckCircle, text: "Approved by you", top: "top-[74px]" },
  { icon: CalendarBlank, text: "Scheduled for Tuesday 9am", top: "top-[148px]" },
];

/** Card 2: the path every post takes, on a soft blue panel. */
function ApprovalPanel() {
  return (
    <FitBox width={588} height={480}>
      <div className="relative h-[480px] w-[588px] overflow-hidden rounded-[12px] bg-neutral-25">
        <div className="absolute left-[-59px] top-10 h-[934px] w-[706px] bg-primary-50 blur-[50px]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(/landing/noise.png)" }} />
        <div className="absolute left-[134px] top-[105px] h-[270px] w-[320px]">
          <div className="absolute left-[158px] top-6 h-[202px] w-1 bg-primary-900/[0.06]" />
          {steps.map((s) => (
            <div
              key={s.text}
              className={`absolute left-0 flex h-[46px] w-[320px] items-center justify-between rounded-[16px] bg-card py-3 pl-4 pr-3 drop-shadow-[0px_2px_4px_rgba(0,0,0,0.08)] ${s.top}`}
            >
              <span className="flex items-center gap-2">
                <s.icon className="size-4 text-primary-600" aria-hidden />
                <span className="text-[14px] font-medium leading-[19.6px] tracking-[-0.14px] text-neutral-800">{s.text}</span>
              </span>
              <span className="flex size-[22px] items-center justify-center rounded-[4px]">
                <Trash className="size-4 text-neutral-400" aria-hidden />
              </span>
            </div>
          ))}
          <div className="absolute left-[136px] top-[222px] size-12 rounded-[24px] bg-primary-900" />
        </div>
      </div>
    </FitBox>
  );
}

export function Connected() {
  return (
    <section className="flex flex-col items-center gap-[60px] overflow-hidden bg-card px-5 py-[100px] md:px-20">
      <div className="flex w-full max-w-[1280px] flex-col gap-4 md:flex-row md:items-end md:justify-between md:px-10">
        <h2 className="max-w-[580px] lp-h2 text-neutral-950">Everything in one place, nothing behind your back</h2>
        <p className="max-w-[420px] lp-body text-neutral-950 opacity-60">
          Your strategy, your posts and your progress live in one app you can open from your phone.
        </p>
      </div>
      <div className="flex w-full max-w-[1280px] flex-col gap-10 md:flex-row md:gap-6 md:px-10">
        {[
          { panel: <TargetsPanel />, title: "A strategy you can measure", text: "Weekly targets for posts, comments and connections, set from your goal. You always see what was done." },
          { panel: <ApprovalPanel />, title: "Posts you approve first", text: "Your manager writes in your voice. You read, approve or ask for changes. Nothing goes live without you." },
        ].map((c) => (
          <div key={c.title} className="flex flex-1 flex-col items-center gap-6">
            {c.panel}
            <div className="flex w-full max-w-[588px] flex-col gap-3">
              <h3 className="lp-title text-neutral-950">{c.title}</h3>
              <p className="max-w-[500px] lp-body text-neutral-400">{c.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

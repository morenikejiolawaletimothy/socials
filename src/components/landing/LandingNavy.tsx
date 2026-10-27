import {
  ChatCircle,
  Check,
  CheckCircle,
  ListBullets,
  MagnifyingGlass,
  Plus,
  TextAlignCenter,
  TextAlignLeft,
  TextB,
  TextItalic,
  TextUnderline,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { FitBox } from "./FitBox";

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {items.map((i) => (
        <li key={i} className="flex items-start gap-2.5 lp-body text-neutral-300">
          <CheckCircle className="size-6 shrink-0 text-neutral-300" aria-hidden />
          <span className="pt-px">{i}</span>
        </li>
      ))}
    </ul>
  );
}

function TextBlock({ title, text, bullets, side }: { title: string; text: string; bullets: string[]; side: "left" | "right" }) {
  return (
    <div className={`flex w-full max-w-[588px] flex-col justify-center gap-8 ${side === "left" ? "md:pr-10" : "md:pl-10"}`}>
      <div className="flex flex-col gap-4">
        <h3 className="lp-h3 text-inverse">{title}</h3>
        <p className="max-w-[500px] lp-body text-inverse">{text}</p>
      </div>
      <Bullets items={bullets} />
    </div>
  );
}

/** Row 1 mock-up: finding the right people and conversations. */
function EngagementPanel() {
  return (
    <FitBox width={588} height={480}>
      <div className="relative h-[480px] w-[588px] overflow-hidden rounded-[12px] bg-primary-50">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(/landing/noise.png)" }} />
        <div className="absolute left-[352px] top-[95px] h-[290px] w-[304px]">
          <div className="absolute left-0 top-0 flex w-[304px] items-center gap-3 rounded-[16px] bg-card px-4 py-3.5 drop-shadow-[0px_2px_4px_rgba(0,0,0,0.08)]">
            <MagnifyingGlass className="size-4 text-neutral-950/80" aria-hidden />
            <span className="lp-small text-neutral-400">Fintech founders in Lagos</span>
          </div>
          <div className="absolute left-0 top-20 flex w-[304px] flex-col gap-2 rounded-[16px] bg-card py-3 pl-4 pr-3 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08),0px_0px_0px_4px_rgba(255,255,255,0.5)]">
            <span className="flex items-center gap-2">
              <Check className="size-3.5 text-success" aria-hidden />
              <span className="flex items-center gap-1.5 rounded-[8px] border border-neutral-300 px-2.5 py-1">
                <ChatCircle className="size-3.5 text-neutral-950/60" aria-hidden />
                <span className="lp-small text-neutral-950 opacity-60">Comment</span>
              </span>
            </span>
            <span className="flex gap-2 lp-small text-neutral-950">
              <span className="text-neutral-800">1.</span>Comment drafted for Amaka Nwosu
            </span>
          </div>
          <div className="absolute bottom-[81px] left-[150px] h-[65px] w-1 border-l-2 border-dashed border-primary-300" />
          <div className="absolute bottom-[71px] left-[142px] flex size-5 items-center justify-center rounded-full bg-primary-900">
            <Plus className="size-2.5 text-inverse" aria-hidden />
          </div>
          <div className="absolute bottom-[-1.6px] left-0 w-[304px] rounded-[16px] bg-card p-0.5 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)]">
            <div className="relative flex flex-col gap-2 rounded-[14px] bg-card py-3 pl-4 pr-3">
              <span className="flex items-center gap-2">
                <Check className="size-3.5 text-success" aria-hidden />
                <span className="flex items-center gap-1.5 rounded-[8px] border border-neutral-300 px-2.5 py-1">
                  <Image src="/brand/bluecut-mark.png" alt="" width={16} height={16} className="rounded-full" />
                  <span className="lp-small text-neutral-950 opacity-60">Bluecut</span>
                </span>
              </span>
              <span className="flex gap-2 lp-small text-neutral-950">
                <span>1.</span>Connection request ready to send
              </span>
              <span aria-hidden className="absolute inset-0 rounded-[14px] border-2 border-dashed border-primary-300" />
            </div>
          </div>
        </div>
      </div>
    </FitBox>
  );
}

/** Row 2 mock-up: the client's strategy note, editable, on a soft gradient. */
function StrategyPanel() {
  const tools = [TextB, TextUnderline, TextItalic, TextAlignLeft, TextAlignCenter, ListBullets];
  return (
    <FitBox width={588} height={480}>
      <div
        className="relative h-[480px] w-[588px] overflow-hidden rounded-[12px]"
        style={{ backgroundImage: "linear-gradient(225deg, rgb(208, 204, 161) 0%, rgb(245, 245, 245) 100%)" }}
      >
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundSize: "256px 256px", backgroundImage: "url(/landing/noise.png)" }} />
        <div className="absolute left-[314px] top-[246px] flex w-[320px] flex-col gap-6 rounded-[16px] bg-card px-6 py-5 shadow-[0px_0px_0px_4px_rgba(255,255,255,0.5)]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="lp-small text-neutral-950">Your strategy</span>
                <span className="rounded-full bg-neutral-50 p-1 lp-micro text-neutral-800">Q4</span>
              </span>
              <span className="flex items-center gap-1 rounded-[6px] bg-success-bg py-1 pl-3 pr-2">
                <span className="lp-micro text-neutral-950 opacity-45">Approved</span>
                <Check className="size-2.5 text-neutral-950/45" aria-hidden />
              </span>
            </div>
            <p className="relative text-[12px] font-medium leading-[19.2px] tracking-[-0.24px] text-neutral-950/50">
              <span className="absolute left-0 top-0 -z-0 h-4 w-[229px] bg-primary-100" aria-hidden />
              <span className="relative">This quarter is about being known for payments in West Africa: 2 posts, 10 comments and 15 connection requests a week.</span>
            </p>
            <div className="flex flex-col gap-2">
              <span className="h-3 w-full rounded-full bg-neutral-50" />
              <span className="h-3 w-full rounded-full bg-neutral-50" />
              <span className="h-3 w-[109px] rounded-full bg-neutral-50" />
            </div>
          </div>
          <div className="flex gap-2">
            <span className="rounded-[6px] bg-primary-100 px-3 py-1 lp-micro text-neutral-950/50">Payments</span>
            <span className="rounded-[6px] bg-success-bg px-3 py-1 lp-micro text-neutral-950/50">Leadership</span>
          </div>
          <div className="absolute left-[120px] top-[115px] flex items-center gap-3 rounded-[8px] bg-neutral-50 px-3 py-1.5 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.15)]">
            {tools.map((T, i) => (
              <T key={i} className="size-3.5 text-neutral-800" aria-hidden />
            ))}
          </div>
        </div>
      </div>
    </FitBox>
  );
}

export function Features() {
  return (
    <section className="flex flex-col items-center gap-[60px] overflow-hidden bg-primary-900 px-5 py-[100px] md:px-20">
      <div className="flex w-full max-w-[1440px] flex-col items-center justify-center gap-10 md:flex-row md:items-stretch md:gap-6 md:px-10">
        <TextBlock
          side="left"
          title="Engagement with the right people"
          text="Being seen is not only about posting. We find the people and conversations that matter to your goal, and help you show up there."
          bullets={[
            "A weekly list of people and posts worth engaging with",
            "Comments written in your voice, sent as you allow",
            "Connection requests ready to send in a few minutes",
          ]}
        />
        <div className="w-full max-w-[588px]">
          <EngagementPanel />
        </div>
      </div>
      <div className="flex w-full max-w-[1440px] flex-col-reverse items-center justify-center gap-10 md:flex-row md:items-stretch md:gap-6 md:px-10">
        <div className="w-full max-w-[588px]">
          <StrategyPanel />
        </div>
        <TextBlock
          side="right"
          title="You stay in control"
          text="Your account and your reputation stay yours. You decide what we do, and you can change it any time."
          bullets={[
            "We never see your password. You connect through LinkedIn's own sign-in",
            "Choose what we do for you, and what needs your approval",
            "Pause, take a post down or disconnect in one tap",
            "Tell us what is off limits. We check every post against it",
          ]}
        />
      </div>
    </section>
  );
}

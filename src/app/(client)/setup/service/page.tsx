"use client";

import { Buildings, ChatCircle, CheckCircle, HandTap, ShieldCheck, Sparkle } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SetupFrame } from "@/components/client/SetupFrame";
import { Badge, Banner, Button, useTask } from "@/components/ui";
import { act, useMyClient } from "@/lib/mock";

type Service = "self-serve" | "full-service";

const options: { value: Service; title: string; tag?: string; lead: string; points: string[] }[] = [
  {
    value: "self-serve",
    title: "You stay hands-on",
    lead: "We prepare everything; you do the few things only you can do on LinkedIn.",
    points: [
      "We write and schedule your posts. You publish each one in a tap, at the best time.",
      "Comments, reactions, follows and connection requests come to you as quick tasks, ready in seconds.",
      "You keep full control and never share your login.",
    ],
  },
  {
    value: "full-service",
    title: "We do it for you",
    tag: "Premium",
    lead: "Hand the day-to-day to us. You approve the plan and the posts, and nothing lands on your to-do list.",
    points: [
      "We manage your LinkedIn for you, following the rules you set.",
      "We can run your company Page too.",
      "No task list. If we ever need you, we message you.",
      "You keep your login and your settings, and can pause or stop us any time.",
    ],
  },
];

/** B (onboarding fork): the client chooses self-serve or full-service. Full-service is set up securely with the manager later (D). */
export default function ServicePage() {
  const router = useRouter();
  const { client } = useMyClient();
  const { run, pending } = useTask();
  const [choice, setChoice] = useState<Service>(client?.service ?? "self-serve");
  if (!client) return null;

  return (
    <SetupFrame title="How we work together" step="How we work together" steps={["Choose how we work together"]} current={0}>
      <div className="flex flex-col gap-6">
        <p className="text-body text-secondary">Pick what fits you. You can change this later with your manager.</p>

        <div role="radiogroup" aria-label="How we work together" className="flex flex-col gap-4">
          {options.map((o) => {
            const on = choice === o.value;
            return (
              <label key={o.value} className={`flex cursor-pointer flex-col gap-3 rounded-lg border p-5 transition-colors ${on ? "border-primary-600 bg-primary-50" : "border-border hover:border-primary-300"}`}>
                <span className="flex items-start gap-3">
                  <input type="radio" name="service" checked={on} onChange={() => setChoice(o.value)} className="mt-1 size-4 shrink-0 accent-primary-600 focus-visible:focus-ring" />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="flex size-9 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                        {o.value === "self-serve" ? <HandTap className="size-5" aria-hidden /> : <Sparkle className="size-5" aria-hidden />}
                      </span>
                      <span className="text-body font-semibold text-primary">{o.title}</span>
                      {o.tag && <Badge status="info">{o.tag}</Badge>}
                    </span>
                    <span className="text-body-sm text-secondary">{o.lead}</span>
                  </span>
                </span>
                <ul className="flex flex-col gap-2 pl-8">
                  {o.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2 text-body-sm text-primary">
                      <CheckCircle className="mt-0.5 size-4 shrink-0 text-success" aria-hidden /> {pt}
                    </li>
                  ))}
                </ul>
              </label>
            );
          })}
        </div>

        {choice === "full-service" && (
          <Banner tone="info" title="How full-service is set up">
            <ul className="flex flex-col gap-1">
              <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary-600" aria-hidden /> We never ask for your password and can never change your account security.</li>
              <li className="flex items-start gap-2"><Buildings className="mt-0.5 size-4 shrink-0 text-primary-600" aria-hidden /> Your company Page is run through LinkedIn&apos;s own admin access that you grant.</li>
              <li className="flex items-start gap-2"><ChatCircle className="mt-0.5 size-4 shrink-0 text-primary-600" aria-hidden /> Your manager finishes setting this up with you. You stay in control and can pause any time.</li>
            </ul>
          </Banner>
        )}

        <Button
          className="self-start"
          loading={pending("save")}
          onClick={async () => {
            if (await run("save", () => act.setService(client.id, choice), choice === "full-service" ? "Full-service chosen. Your manager will set it up with you." : "Self-serve chosen. Next, connect LinkedIn.")) router.push("/setup/linkedin");
          }}
        >
          {pending("save") ? "Saving" : "Save and continue"}
        </Button>
      </div>
    </SetupFrame>
  );
}

"use client";

import { CheckCircle } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SetupFrame } from "@/components/client/SetupFrame";
import { Button, useTask } from "@/components/ui";
import { act, useMyClient } from "@/lib/mock";

type Service = "self-serve" | "full-service";

const options: { value: Service; title: string; lead: string; note: string; points: string[] }[] = [
  {
    value: "self-serve",
    title: "You stay hands-on",
    lead: "We prepare everything. You do the few things only you can do.",
    note: "You stay in full control of your account.",
    points: [
      "Posts prepared",
      "One-tap publish",
      "Comments prepared",
      "Keep your login",
    ],
  },
  {
    value: "full-service",
    title: "We do it for you",
    lead: "We handle the day-to-day. You approve the plan and the posts.",
    note: "Your manager sets this up with you. We never need your password.",
    points: [
      "Done for you",
      "Company Page too",
      "No task list",
      "Pause any time",
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
    <SetupFrame title="How can we help you?" step="How can we help you?" steps={["How can we help you?"]} current={0}>
      <div className="flex flex-col gap-6">
        <p className="text-body text-secondary">Pick what fits you. You can change this later with your manager.</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-center">
          {options.map((o) => {
            const on = choice === o.value;
            const card = (
              <div
                onClick={on ? undefined : () => setChoice(o.value)}
                className={`flex flex-col gap-6 rounded-lg border bg-card p-6 transition-colors ${on ? "border-primary-600" : "cursor-pointer border-border hover:border-primary-300"}`}
              >
                <div className="flex flex-col gap-1">
                  <h3 className="text-body-lg font-semibold text-primary">{o.title}</h3>
                  <p className="text-body-sm text-secondary">{o.lead}</p>
                </div>

                {on ? (
                  <Button
                    fullWidth
                    loading={pending("save")}
                    onClick={async () => {
                      if (await run("save", () => act.setService(client.id, choice), choice === "full-service" ? "Full-service chosen. Next, choose what we do for you." : "Self-serve chosen. Next, choose what we prepare for you.")) router.push("/setup/permissions");
                    }}
                  >
                    {pending("save") ? "Saving" : "Save and continue"}
                  </Button>
                ) : (
                  <Button variant="secondary" fullWidth onClick={() => setChoice(o.value)}>
                    Choose this
                  </Button>
                )}

                <div className="flex flex-col gap-3">
                  <p className="text-body-sm font-medium text-primary">What you get</p>
                  <ul className="flex flex-col gap-3">
                    {o.points.map((pt) => (
                      <li key={pt} className="flex items-center gap-3 text-body-sm text-primary">
                        <CheckCircle className="size-5 shrink-0 text-primary-600" aria-hidden />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );

            if (!on) return <div key={o.value}>{card}</div>;

            return (
              <div key={o.value} className="flex flex-col rounded-xl border border-primary-200 bg-primary-50 p-1">
                <p className="py-2 text-center text-caption font-medium text-primary-700">Your choice</p>
                {card}
                <p className="px-4 py-3 text-center text-body-sm text-primary-700">{o.note}</p>
              </div>
            );
          })}
        </div>
      </div>
    </SetupFrame>
  );
}

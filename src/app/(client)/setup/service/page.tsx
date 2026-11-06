"use client";

import { Buildings, CheckCircle } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SetupFrame } from "@/components/client/SetupFrame";
import { Button, useTask } from "@/components/ui";
import { money } from "@/lib/format";
import { act, useData, useMyClient } from "@/lib/mock";

type Service = "self-serve" | "full-service";

const options: { value: Service; label: string; title: string; lead: string; note: string; points: string[] }[] = [
  {
    value: "self-serve",
    label: "Regular",
    title: "You do it yourself",
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
    label: "Premium",
    title: "We do it for you",
    lead: "We handle the day-to-day. You approve the plan and the posts.",
    note: "Your manager sets this up with you. We never need your password.",
    points: [
      "Done for you",
      "Secure access",
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
  const db = useData();
  const [choice, setChoice] = useState<Service>(client?.service ?? "self-serve");
  const [pageOn, setPageOn] = useState(!!client?.companyPage);
  if (!client) return null;
  const pagePrice = money(db.settings.pageManagementCents);

  const saveAndContinue = async () => {
    const ok = await run(
      "save",
      async () => {
        await act.setService(client.id, choice);
        await act.setCompanyPage(client.id, pageOn);
      },
      choice === "full-service" ? "Full-service chosen. Next, choose what we do for you." : "Self-serve chosen. Next, choose what we prepare for you.",
    );
    if (ok) router.push("/setup/permissions");
  };

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
                  <Button fullWidth loading={pending("save")} onClick={saveAndContinue}>
                    {pending("save") ? "Saving" : "Save and continue"}
                  </Button>
                ) : (
                  <Button variant="secondary" fullWidth className="border-primary-600!" onClick={() => setChoice(o.value)}>
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
                <p className="py-2 text-center text-caption font-medium uppercase tracking-wide text-primary-700">{o.label}</p>
                {card}
                <p className="px-4 py-3 text-center text-body-sm text-primary-700">{o.note}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-body-sm font-medium text-primary">Add-on</p>
          <label className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors ${pageOn ? "border-primary-600 bg-primary-50" : "border-border bg-card hover:border-primary-300"}`}>
            <span className={`flex size-10 shrink-0 items-center justify-center rounded-md text-primary-700 ${pageOn ? "bg-card" : "bg-primary-50"}`}>
              <Buildings className="size-5" aria-hidden />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-body font-medium text-primary">Manage my company Page too</span>
              <span className="text-body-sm text-secondary">+{pagePrice} a month · Posts, comments and replies on your company Page. You can change this later in Contract.</span>
            </span>
            <input type="checkbox" checked={pageOn} onChange={(e) => setPageOn(e.target.checked)} className="size-4 shrink-0 accent-primary-600 focus-visible:focus-ring" />
          </label>
        </div>
      </div>
    </SetupFrame>
  );
}

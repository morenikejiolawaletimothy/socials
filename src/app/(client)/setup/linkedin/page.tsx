"use client";

import { CheckCircle, LinkedinLogo, LockSimple, ShieldCheck } from "@phosphor-icons/react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { PermissionsForm } from "@/components/client/PermissionsForm";
import { SetupFrame } from "@/components/client/SetupFrame";
import { Banner, Button, Card, useTask } from "@/components/ui";
import { fullName } from "@/lib/format";
import { act, useMyClient } from "@/lib/mock";

const why = [
  { icon: CheckCircle, text: "We publish the posts you approve, and engage with the right people for you." },
  { icon: ShieldCheck, text: "Nothing happens without your say. You choose what we do, and you can pause or disconnect any time." },
  { icon: LockSimple, text: "You sign in on LinkedIn itself. We never see or store your password." },
];

/** C2 Connect LinkedIn, then choose what we do. The LinkedIn consent screen is mocked in Phase 1. */
function ConnectLinkedIn() {
  const router = useRouter();
  const startAt = useSearchParams().get("step") === "2" ? 2 : 0;
  const { client, user } = useMyClient();
  const [step, setStep] = useState(client?.setupDone.includes("linkedin") ? startAt || 2 : 0);
  const [declined, setDeclined] = useState(false);
  const { run, pending } = useTask();
  if (!client || !user) return null;

  return (
    <SetupFrame title="Connect LinkedIn" step="Connect LinkedIn" steps={["Why we connect", "Sign in to LinkedIn", "What we do"]} current={step}>
      {step === 0 && (
        <div className="flex flex-col gap-6">
          <ul className="flex flex-col gap-4">
            {why.map((w) => (
              <li key={w.text} className="flex items-start gap-3">
                <w.icon className="mt-0.5 size-6 shrink-0 text-primary-600" aria-hidden />
                <span className="text-body text-primary">{w.text}</span>
              </li>
            ))}
          </ul>
          {declined && (
            <Banner tone="warning" title="LinkedIn was not connected">
              You chose not to allow access on LinkedIn. We need it to post for you. Try again when you are ready.
            </Banner>
          )}
          <Button className="self-start" onClick={() => setStep(1)}>
            <LinkedinLogo className="size-5" aria-hidden />
            Connect with LinkedIn
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <p className="text-caption text-secondary">This is LinkedIn&apos;s own screen. (Shown here as a demo.)</p>
          <Card className="flex flex-col gap-6">
            <div className="flex items-center justify-center gap-4">
              <LinkedinLogo className="size-12 text-primary-600" aria-hidden />
              <span className="text-display-lg text-secondary" aria-hidden>
                +
              </span>
              <Image src="/brand/bluecut-mark.png" alt="" width={48} height={48} className="rounded-full" />
            </div>
            <p className="text-center text-body text-primary">
              <span className="font-medium">Bluecut Socials</span> would like to access your LinkedIn account, {fullName(user)}.
            </p>
            <ul className="flex flex-col gap-2 text-body-sm text-primary">
              <li>Use your name and photo</li>
              <li>Create, change and delete posts for you</li>
              <li>Comment and react on your behalf</li>
              <li>See how your posts perform</li>
            </ul>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setDeclined(true);
                  setStep(0);
                }}
              >
                Cancel
              </Button>
              <Button
                loading={pending("allow")}
                onClick={async () => {
                  const ok = await run(
                    "allow",
                    async () => {
                      await act.setLinkedIn(client.id, "connected");
                      await act.completeSetupStep(client.id, "linkedin");
                    },
                    "LinkedIn is connected.",
                  );
                  if (ok) setStep(2);
                }}
              >
                {pending("allow") ? "Connecting" : "Allow"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-6">
          <Banner tone="success" title="LinkedIn is connected" />
          <div className="flex flex-col gap-2">
            <h3 className="font-display text-display-lg text-primary">What should we do for you?</h3>
            <Banner tone="neutral">Change these any time in Control. Whether each one needs your approval first is set in the last setup step.</Banner>
          </div>
          <PermissionsForm client={client} />
          <Button
            className="self-start"
            loading={pending("save")}
            onClick={async () => {
              if (await run("save", () => act.completeSetupStep(client.id, "permissions"), "Saved. On to your calls.")) router.push("/home");
            }}
          >
            Save and continue
          </Button>
        </div>
      )}
    </SetupFrame>
  );
}

export default function Page() {
  return (
    <Suspense>
      <ConnectLinkedIn />
    </Suspense>
  );
}

"use client";

import { DeviceMobile, Lock, ShieldCheck } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Banner, Breadcrumbs, Button, Card, Input, PasswordInput, Stepper, useTask } from "@/components/ui";
import { act, useMyClient } from "@/lib/mock";

const steps = ["Agree", "Protect with 2FA", "Save your login"];

/** D1: set up delegated access: agree to the terms, turn on authenticator 2FA, then store the login in the vault. */
export function DelegatedAccessSetup() {
  const router = useRouter();
  const { client } = useMyClient();
  const { run, pending } = useTask();
  const [step, setStep] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  if (!client) return null;

  return (
    <Columns {...rails.clientSettings}>
      <Card title="Set up delegated access" eyebrow={<Breadcrumbs items={[{ label: "Full-service", href: "/full-service" }, { label: "Delegated access" }]} />}>
        <div className="flex flex-col gap-6">
          <Stepper steps={steps} current={step} />

          {step === 0 && (
            <div className="flex flex-col gap-4">
              <Banner tone="info" title="How delegated access works">
                <ul className="flex flex-col gap-1">
                  <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary-600" aria-hidden /> Your login is kept in an encrypted vault. Your account manager and Bluecut never see or type your password.</li>
                  <li className="flex items-start gap-2"><DeviceMobile className="mt-0.5 size-4 shrink-0 text-primary-600" aria-hidden /> We tell you before every sign-in, and you approve it on your phone. Nothing happens without your approval.</li>
                  <li className="flex items-start gap-2"><Lock className="mt-0.5 size-4 shrink-0 text-primary-600" aria-hidden /> We can never change your account security. You can pause or remove our access in one click, any time.</li>
                </ul>
              </Banner>
              <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-4">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 size-4 shrink-0 accent-primary-600 focus-visible:focus-ring" />
                <span className="text-body-sm text-primary">
                  I understand my account team will sign in to my LinkedIn to manage it on my behalf, with my approval each time, and I agree to the <span className="font-medium">delegated access terms</span>.
                </span>
              </label>
              <Button className="self-start" disabled={!agreed} onClick={() => setStep(1)}>
                Continue
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <Banner tone="info" title="Turn on 2FA with an authenticator app">
                This is what keeps you in control: every sign-in needs your approval on your phone, so no one can use your login without you.
              </Banner>
              <ol className="flex list-decimal flex-col gap-2 pl-5 text-body-sm text-primary">
                <li>On LinkedIn, open Settings, then Sign in &amp; security, then Two-step verification.</li>
                <li>Choose Authenticator app and follow the steps with an app like Google Authenticator or Authy.</li>
                <li>Keep your backup codes somewhere safe.</li>
              </ol>
              <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-4">
                <input type="checkbox" checked={twoFactor} onChange={(e) => setTwoFactor(e.target.checked)} className="mt-1 size-4 shrink-0 accent-primary-600 focus-visible:focus-ring" />
                <span className="text-body-sm text-primary">I have turned on two-step verification with an authenticator app.</span>
              </label>
              <div className="flex flex-wrap gap-3">
                <Button disabled={!twoFactor} onClick={() => setStep(2)}>
                  Continue
                </Button>
                <Button variant="cancel" onClick={() => setStep(0)}>
                  Back
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form
              noValidate
              className="flex flex-col gap-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!/^\S+@\S+\.\S+$/.test(email.trim()) || !password) return setError("Enter the email and password you use for LinkedIn.");
                setError(undefined);
                await run("save", () => act.setTwoFactor(client.id, true), undefined);
                if (await run("save", () => act.setDelegatedCredentials(client.id, true), "Secure access is set up. Your team will notify you before they sign in.")) router.push("/full-service");
              }}
            >
              <Banner tone="success">
                <span className="flex items-start gap-2">
                  <Lock className="mt-0.5 size-4 shrink-0 text-success" aria-hidden /> Your login is encrypted in the vault the moment you save it. Your account manager and Bluecut never see it.
                </span>
              </Banner>
              <Input label="LinkedIn email" type="email" autoComplete="off" value={email} onChange={(e) => { setEmail(e.target.value); setError(undefined); }} error={error} />
              <PasswordInput label="LinkedIn password" autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} />
              <p className="text-body-sm text-secondary">You can remove this any time from Full-service. Because 2FA is on, your login cannot be used without your approval on your phone.</p>
              <div className="flex flex-wrap gap-3">
                <Button type="submit" loading={pending("save")}>
                  {pending("save") ? "Saving" : "Save securely"}
                </Button>
                <Button variant="cancel" onClick={() => setStep(1)}>
                  Back
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </Columns>
  );
}

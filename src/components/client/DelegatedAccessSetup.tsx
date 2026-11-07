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
export function DelegatedAccessSetup({ inSetup = false }: { inSetup?: boolean }) {
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
      <Card
        title="Set up secure access"
        info="Your LinkedIn login is kept in an encrypted vault that Bluecut and your account manager can never read. You turn on your own authenticator 2FA, so every sign-in needs your approval on your phone. We can never change your account security, and you can pause or remove access in one click, any time."
        eyebrow={<Breadcrumbs items={inSetup ? [{ label: "Home", href: "/home" }, { label: "Set up", href: "/home#setup" }, { label: "Secure access" }] : [{ label: "Full-service", href: "/full-service" }, { label: "Secure access" }]} />}
      >
        <div className="flex flex-col gap-6">
          <Stepper steps={steps} current={step} />

          {step === 0 && (
            <div className="flex flex-col gap-6">
              <section className="flex flex-col gap-3">
                <h3 className="text-body font-medium text-primary">How delegated access works</h3>
                <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
                  {[
                    { icon: ShieldCheck, text: "Your login is kept in an encrypted vault. Your account manager and Bluecut never see or type your password." },
                    { icon: DeviceMobile, text: "We tell you before every sign-in, and you approve it on your phone. Nothing happens without your approval." },
                    { icon: Lock, text: "We can never change your account security. You can pause or remove our access in one click, any time." },
                  ].map((row) => (
                    <li key={row.text} className="flex items-start gap-3 px-4 py-4">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                        <row.icon className="size-4" aria-hidden />
                      </span>
                      <span className="pt-1 text-body-sm text-primary">{row.text}</span>
                    </li>
                  ))}
                </ul>
              </section>
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
            <div className="flex flex-col gap-6">
              <section className="flex flex-col gap-3">
                <h3 className="text-body font-medium text-primary">Turn on 2FA with an authenticator app</h3>
                <ol className="flex flex-col divide-y divide-border rounded-md border border-border">
                  {[
                    "On LinkedIn, open Settings, then Sign in & security, then Two-step verification.",
                    "Choose Authenticator app and follow the steps with an app like Google Authenticator or Authy.",
                    "Keep your backup codes somewhere safe.",
                  ].map((text, i) => (
                    <li key={text} className="flex items-start gap-3 px-4 py-4">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-600 text-caption font-semibold text-inverse" aria-hidden>
                        {i + 1}
                      </span>
                      <span className="pt-0.5 text-body-sm text-primary">
                        <span className="sr-only">Step {i + 1}: </span>
                        {text}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
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
                if (await run("save", () => act.setDelegatedCredentials(client.id, true), "Secure access is set up. Your team will notify you before they sign in.")) {
                  if (inSetup) await act.completeSetupStep(client.id, "access");
                  router.push(inSetup ? "/home" : "/full-service");
                }
              }}
            >
              <Banner tone="success" icon={false}>
                <span className="flex items-start gap-2">
                  <Lock className="mt-0.5 size-4 shrink-0 text-success" aria-hidden /> Your login is encrypted in the vault the moment you save it. Your account manager and Bluecut never see it.
                </span>
              </Banner>
              <div className="flex flex-col gap-4 rounded-lg border border-border-strong bg-neutral-25 p-4">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-success-bg text-success">
                    <Lock className="size-4" aria-hidden />
                  </span>
                  <span className="text-body-sm font-medium text-primary">Encrypted vault</span>
                  <span className="ml-auto flex items-center gap-1 text-caption font-medium text-success">
                    <ShieldCheck className="size-4" aria-hidden /> Encrypted
                  </span>
                </div>
                <Input label="LinkedIn email" type="email" autoComplete="off" value={email} onChange={(e) => { setEmail(e.target.value); setError(undefined); }} error={error} />
                <PasswordInput label="LinkedIn password" autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} />
                <p className="flex items-start gap-2 text-caption text-secondary">
                  <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden /> Stored encrypted the moment you save it. Never shown to anyone, including your account manager and Bluecut.
                </p>
              </div>
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

"use client";

import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { Avatar, Banner, Button, CodeInput, PasswordInput, Stepper, TextLink } from "@/components/ui";
import { auth, useDb } from "@/lib/mock";
import { AuthScreen } from "../../AuthScreen";

const steps = ["Password", "Two-step", "Profile", "Call slots"];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const parts = [
  { key: "morning", label: "Morning", time: "8am to 12pm" },
  { key: "afternoon", label: "Afternoon", time: "12pm to 5pm" },
  { key: "evening", label: "Evening", time: "5pm to 8pm" },
];
const backupCodes = ["482913", "105827", "773041", "290356", "618402", "934177"];

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const managers = useDb((db) => db.managers);
  const users = useDb((db) => db.users);
  const invite = auth.findInvite(token, { managers, users } as Parameters<typeof auth.findInvite>[1]);
  const [step, setStep] = useState(0);
  const [pw, setPw] = useState("");
  const [code, setCode] = useState("");
  const [intro, setIntro] = useState("");
  const [slots, setSlots] = useState<string[]>(["mon-morning", "wed-morning", "fri-afternoon"]);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  if (!invite) {
    return (
      <AuthScreen title="This invite link no longer works" description="Invite links work once and expire after 7 days.">
        <p className="text-body text-secondary">Ask the owner to send you a new invite.</p>
        <TextLink href="/" className="self-start">
          Go to Bluecut
        </TextLink>
      </AuthScreen>
    );
  }
  const name = `${invite.user.firstName} ${invite.user.lastName}`;
  const toggle = (k: string) => setSlots((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));

  async function next(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    if (step === 0 && pw.length < 12) return setError("Use at least 12 characters, so client accounts stay safe.");
    if (step === 1 && code.length !== 6) return setError("Enter the 6-digit code from your authenticator app.");
    if (step === 2 && intro.trim().length < 20) return setError("Write a short intro (at least 20 characters). Clients see it when they book a call.");
    if (step === 3) {
      if (!slots.length) return setError("Open at least one slot, so clients can book their calls.");
      setBusy(true);
      const res = await auth.acceptInvite(token, { intro, slots });
      setBusy(false);
      if (!res.ok) return setError(res.message);
      router.push("/manager");
      return;
    }
    setStep(step + 1);
  }

  const titles = [
    { t: `Welcome, ${invite.user.firstName}`, d: "You have been invited to join Bluecut as an account manager. Set up your account in 4 short steps." },
    { t: "Set up two-step sign-in", d: "Required for everyone who works on client accounts. Scan the code with an authenticator app, then enter the 6-digit code it shows." },
    { t: "Your profile", d: "Clients see your photo and intro when they book their calls with you." },
    { t: "Your call slots", d: "Choose when clients can book their 30-minute calls with you. Once a client books, you are committed to attend." },
  ];

  return (
    <>
      <AuthScreen title={titles[step].t} description={titles[step].d} above={<Stepper steps={steps} current={step} />}>
        <form onSubmit={next} noValidate className="flex flex-col gap-4">
          {step === 0 && (
            <PasswordInput label="Choose a password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} help="At least 12 characters." error={error} />
          )}

          {step === 1 && (
            <>
              <div className="flex flex-col items-center gap-3 rounded-md border border-border bg-neutral-25 p-6">
                <div aria-label="QR code to scan" role="img" className="grid size-36 grid-cols-6 gap-1 rounded-sm bg-card p-2">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <span key={i} className={`rounded-sm ${[0, 2, 5, 7, 9, 12, 14, 17, 19, 20, 23, 26, 28, 30, 33, 35].includes(i) ? "bg-neutral-900" : "bg-neutral-100"}`} />
                  ))}
                </div>
                <p className="text-caption text-secondary">
                  Or enter this key: <span className="font-mono text-primary">BLCT 4F7Q 9KZ2 M8XA</span>
                </p>
              </div>
              <CodeInput label="Code from your app" value={code} onChange={(v) => { setCode(v); setError(undefined); }} error={error} help="Demo: any 6 digits work." />
              <div className="flex flex-col gap-2">
                <p className="text-body-sm font-medium text-primary">Your backup codes</p>
                <p className="text-body-sm text-secondary">Save these somewhere safe. Each one gets you in once if you lose your phone.</p>
                <ul className="grid grid-cols-3 gap-2">
                  {backupCodes.map((c) => (
                    <li key={c} className="rounded-sm bg-neutral-100 py-2 text-center font-mono text-mono-sm text-primary">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center gap-4">
                <Avatar name={name} size="xl" />
                <Button variant="secondary">Add a photo</Button>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="intro" className="text-body-sm font-medium text-primary">
                  Short intro
                </label>
                <textarea
                  id="intro"
                  rows={3}
                  value={intro}
                  onChange={(e) => setIntro(e.target.value)}
                  placeholder="I help founders in fintech tell their story on LinkedIn."
                  aria-invalid={error ? true : undefined}
                  className={`rounded-sm border bg-card px-4 py-3 text-body text-primary shadow-sm placeholder:text-neutral-400 focus-visible:border-primary-600 focus-visible:focus-ring ${error ? "border-danger" : "border-border-strong"}`}
                />
                <span className={`text-body-sm ${error ? "text-danger" : "text-secondary"}`}>{error ?? "One or two sentences."}</span>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p className="text-body-sm text-secondary">Times are in your time zone ({invite.user.timeZone.replace("_", " ")}). You can change them any time.</p>
              <p className="text-caption text-secondary">Morning is 8am to 12pm. Afternoon is 12pm to 5pm. Evening is 5pm to 8pm.</p>
              <div className="flex flex-col gap-3">
                {days.map((d) => (
                  <div key={d} className="flex items-center gap-3">
                    <span className="w-10 text-body-sm font-medium text-primary">{d}</span>
                    <div className="grid flex-1 grid-cols-3 gap-2">
                      {parts.map((p) => {
                        const k = `${d.toLowerCase()}-${p.key}`;
                        const on = slots.includes(k);
                        return (
                          <button
                            key={k}
                            type="button"
                            aria-pressed={on}
                            aria-label={`${d} ${p.label}, ${p.time}`}
                            onClick={() => toggle(k)}
                            className={`rounded-sm border px-2 py-2 text-caption focus-visible:focus-ring ${on ? "border-primary-600 bg-primary-50 text-primary-700" : "border-border-strong bg-card text-secondary hover:border-primary-300"}`}
                          >
                            {p.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {error && <p className="text-body-sm text-danger">{error}</p>}
              <Banner title="What happens next">The owner will book your 60-minute onboarding training. You get clients after that.</Banner>
            </>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => { setStep(step - 1); setError(undefined); }}>
                Back
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" disabled={busy}>
              {step === 3 ? (busy ? "Finishing" : "Finish setup") : "Continue"}
            </Button>
          </div>
        </form>
      </AuthScreen>
      <p className="mt-8 text-center text-caption text-secondary">Demo: this invite is for Bisi Adebayo. Reset the demo to use it again.</p>
    </>
  );
}

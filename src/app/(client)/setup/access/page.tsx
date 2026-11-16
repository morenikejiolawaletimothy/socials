"use client";

import { DeviceMobile, Lock, PaperPlaneRight, ShieldCheck } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckRow, SetupFrame } from "@/components/client/SetupFrame";
import { Avatar, Button, Input, PasswordInput, TextButton, useTask } from "@/components/ui";
import { fullName } from "@/lib/format";
import { act, auth, useMyClient, type Permissions, type ReviewSettings } from "@/lib/mock";

type Step = "linkedin" | "found" | "permissions" | "communication" | "delegate" | "secure" | "login";

const regularSteps: Step[] = ["linkedin", "found", "permissions", "communication"];
const premiumSteps: Step[] = ["linkedin", "found", "permissions", "communication", "delegate", "secure", "login"];

const titles: Record<Step, string> = {
  linkedin: "Add LinkedIn profile",
  found: "We found your profile",
  permissions: "Account permission",
  communication: "Communication settings",
  delegate: "Delegate my access",
  secure: "Set up secure access",
  login: "LinkedIn login details",
};

const infos: Record<Step, string> = {
  linkedin: "Paste the link to your own LinkedIn profile. We use it to read your name, headline and photo, and to plan your content.",
  found: "Check this is you before you go on.",
  permissions: "Choose what your account team may do. You can change this any time in Control.",
  communication: "Where we tell you when something needs you, and what we do if you are busy.",
  delegate: "Premium works through delegated access: your login sits in an encrypted vault and you approve every sign-in.",
  secure: "Two-step verification means nobody can use your login without the code from your phone.",
  login: "Your login is encrypted the moment you save it. Your account manager and Bluecut never see it.",
};

/** What each permission means, per account type (Figma wording). Regular: we prepare. Premium: we do. */
const permissionRows: { key: keyof Permissions; regular: string; premium: string }[] = [
  { key: "post", regular: "Draft my posts", premium: "Post for me" },
  { key: "engage", regular: "Prepare my reactions, comments, reposts and follows", premium: "Comment, react, repost and follow for me" },
  { key: "connectionDrafts", regular: "Prepare my connection requests and messages", premium: "Send connection requests and messages for me" },
  { key: "profileDrafts", regular: "Prepare my profile updates", premium: "Update my profile for me" },
  { key: "companyPage", regular: "Prepare for my company page too", premium: "Run my company page too" },
];

/**
 * Figma "Manage account access". Regular: LinkedIn profile → check it is you → what we prepare → how we notify.
 * Premium adds: agree to delegated access → turn on authenticator 2FA → save the login to the vault.
 */
export default function AccessPage() {
  const router = useRouter();
  const { client, user } = useMyClient();
  const premium = client?.service === "full-service";
  const steps = premium ? premiumSteps : regularSteps;
  const [i, setI] = useState(0);
  const [url, setUrl] = useState(user?.linkedinUrl ?? "");
  const [found, setFound] = useState<{ name: string } | null>(null);
  const [perms, setPerms] = useState<Permissions>(client?.permissions ?? { post: true, engage: true, connectionDrafts: true, profileDrafts: true, companyPage: false });
  const [email, setEmail] = useState(client?.review.channels.email ?? true);
  const [whatsapp, setWhatsapp] = useState(Boolean(client?.review.channels.whatsapp));
  const [number, setNumber] = useState(user?.whatsapp?.number ?? "");
  const [noReply, setNoReply] = useState<ReviewSettings["ifNoReply"]>(client?.review.ifNoReply ?? "wait");
  const [agreed, setAgreed] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [liEmail, setLiEmail] = useState("");
  const [liPassword, setLiPassword] = useState("");
  const [error, setError] = useState<string>();
  const [finding, setFinding] = useState(false);
  const { run, pending } = useTask();
  if (!client || !user) return null;

  const step = steps[i];
  const hasPage = Boolean(client.companyPage);
  // "We found your profile" belongs to the LinkedIn step, so it does not count as its own step.
  const counted = steps.filter((s) => s !== "found");
  const position = counted.indexOf(step === "found" ? "linkedin" : step);
  const percent = Math.round((i / (steps.length - 1)) * 100);
  const stepsLeft = counted.length - 1 - position;
  const next = () => {
    setError(undefined);
    setI((n) => Math.min(n + 1, steps.length - 1));
  };
  const back = () => {
    setError(undefined);
    if (i === 0) router.push("/home");
    else setI((n) => n - 1);
  };

  async function findProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return setError("Paste the link to your LinkedIn profile.");
    setFinding(true);
    const p = await auth.fetchLinkedInProfile(url);
    setFinding(false);
    if (!p) return setError("We could not read that link. Copy it from your LinkedIn profile, like https://www.linkedin.com/in/your-name.");
    if (p.kind === "company") return setError("That is a company page. Paste the link to your own profile.");
    setFound({ name: `${p.firstName} ${p.lastName}`.trim() });
    next();
  }

  async function finish() {
    if (whatsapp && !/^\+?[\d\s-]{7,}$/.test(number.trim())) return setError("Add your WhatsApp number with the country code, like +234 803 555 0142.");
    if (step === "login" && (!/^\S+@\S+\.\S+$/.test(liEmail.trim()) || !liPassword)) return setError("Enter the email and password you use for LinkedIn.");
    const ok = await run(
      "finish",
      () =>
        act.saveAccountAccess(client!.id, {
          linkedinUrl: url.trim(),
          permissions: perms,
          channels: { email, whatsapp, app: true },
          whatsappNumber: whatsapp ? number.trim() : undefined,
          ifNoReply: noReply,
          delegated: premium ? { twoFactor, credentials: true } : undefined,
        }),
      premium ? "Access is set up. We tell you before every sign-in." : "Access is set up.",
    );
    if (ok) router.push("/home");
  }

  const last = i === steps.length - 1;
  const canProceed = step === "delegate" ? agreed : step === "secure" ? twoFactor : true;

  return (
    <SetupFrame
      title="Manage account access"
      info={premium ? "Tell us who you are on LinkedIn, what we may do for you, how to reach you, and set up secure access so we can act for you." : "Tell us who you are on LinkedIn, what we prepare for you, and how to reach you."}
      crumb="Manage account access"
      percent={percent}
      stepsLeft={stepsLeft}
      section={titles[step]}
      sectionInfo={infos[step]}
      footer={
        step === "linkedin" ? undefined : (
          <>
            <Button variant="ghost" onClick={back}>
              Back
            </Button>
            {last ? (
              <Button onClick={finish} loading={pending("finish")}>
                {pending("finish") ? "Saving" : premium ? "Save securely and finish setup" : "Finish setup"}
              </Button>
            ) : (
              <Button onClick={next} disabled={!canProceed}>
                {step === "found" ? "Continue" : "Proceed"}
              </Button>
            )}
          </>
        )
      }
    >
      {step === "linkedin" && (
        <form onSubmit={findProfile} noValidate className="flex flex-col gap-1">
          <label htmlFor="li-url" className="sr-only">
            Your LinkedIn profile link
          </label>
          <div className={`flex items-stretch overflow-hidden rounded-sm border bg-card focus-within:focus-ring ${error ? "border-danger" : "border-border-strong"}`}>
            <input
              id="li-url"
              type="url"
              inputMode="url"
              autoFocus
              placeholder="https://www.linkedin.com/in/your-name"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(undefined);
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby="li-help"
              className="h-11 min-w-0 flex-1 bg-transparent px-3 text-body text-primary outline-none placeholder:text-neutral-400"
            />
            <button
              type="submit"
              aria-label="Find my profile"
              className="m-1 flex w-10 shrink-0 items-center justify-center rounded-sm bg-primary-600 text-inverse transition-colors hover:bg-primary-700 focus-visible:focus-ring disabled:cursor-not-allowed"
              disabled={finding}
            >
              <PaperPlaneRight className={`size-4 ${finding ? "animate-pulse" : ""}`} aria-hidden />
            </button>
          </div>
          <p id="li-help" className={`mt-1 text-body-sm ${error ? "text-danger" : "text-secondary"}`}>
            {error ?? "Input your LinkedIn profile link"}
          </p>
        </form>
      )}

      {step === "found" && found && (
        <div className="flex items-center gap-3 rounded-md border border-border p-4">
          <Avatar name={found.name || fullName(user)} src={user.photo} size="md" />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-body font-semibold text-primary">{found.name || fullName(user)}</span>
            {user.title && <span className="truncate text-body-sm text-secondary">{user.title}</span>}
          </span>
          <TextButton onClick={back}>Not you?</TextButton>
        </div>
      )}

      {step === "permissions" && (
        <div className="flex flex-col gap-3">
          {permissionRows.map((r) => {
            const locked = r.key === "companyPage" && !hasPage;
            return (
              <CheckRow
                key={r.key}
                checked={perms[r.key] && !locked}
                onChange={(v) => !locked && setPerms((p) => ({ ...p, [r.key]: v }))}
                label={premium ? r.premium : r.regular}
                help={locked ? "Needs the Company page add-on. Add it from Contract any time." : undefined}
              />
            );
          })}
        </div>
      )}

      {step === "communication" && (
        <div className="flex flex-col gap-6">
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-body-sm font-medium text-primary">How would you want us to notify you?</legend>
            <CheckRow checked={email} onChange={setEmail} label="Email" help={user.email} />
            <CheckRow checked={whatsapp} onChange={setWhatsapp} label="WhatsApp" help={whatsapp ? undefined : "Add number"} />
            {whatsapp && (
              <Input label="WhatsApp number" type="tel" autoComplete="tel" placeholder="+234 803 555 0142" value={number} onChange={(e) => { setNumber(e.target.value); setError(undefined); }} error={error} />
            )}
            <CheckRow checked onChange={() => undefined} label="In the app" help="Always on" />
          </fieldset>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-body-sm font-medium text-primary">If you do not reply within 24 hours</legend>
            <CheckRow type="radio" name="no-reply" checked={noReply === "wait"} onChange={() => setNoReply("wait")} label="Wait for me" help="We hold the work until you reply." />
            <CheckRow type="radio" name="no-reply" checked={noReply === "follow-up"} onChange={() => setNoReply("follow-up")} label="Follow up" help="We remind you, then wait." />
            {premium && <CheckRow type="radio" name="no-reply" checked={noReply === "go"} onChange={() => setNoReply("go")} label="Go ahead" help="We go ahead with what you approved in your strategy." />}
          </fieldset>
        </div>
      )}

      {step === "delegate" && (
        <div className="flex flex-col gap-4">
          <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
            {[
              { icon: ShieldCheck, text: "Your login is kept in an encrypted vault. Your account manager and Bluecut never see or type your password." },
              { icon: DeviceMobile, text: "We tell you before every sign-in, and you approve it on your phone. Nothing happens without your approval." },
              { icon: Lock, text: "We can never change your account security. You can pause or remove our access in one click, any time." },
            ].map((row) => (
              <li key={row.text} className="flex items-start gap-3 px-4 py-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                  <row.icon className="size-4" aria-hidden />
                </span>
                <span className="pt-1 text-body-sm text-primary">{row.text}</span>
              </li>
            ))}
          </ul>
          <CheckRow checked={agreed} onChange={setAgreed} label="I understand my account team will sign in to my LinkedIn to manage it for me, with my approval each time, and I agree to the delegated access terms." />
        </div>
      )}

      {step === "secure" && (
        <div className="flex flex-col gap-4">
          <p className="text-body-sm font-medium text-primary">Turn on 2FA with an authenticator app</p>
          <ol className="flex flex-col divide-y divide-border rounded-md border border-border">
            {[
              "On LinkedIn, open Settings, then Sign in and security, then Two-step verification.",
              "Choose Authenticator app and follow the steps with an app like Google Authenticator or Authy.",
              "Keep your backup codes somewhere safe.",
            ].map((text, n) => (
              <li key={text} className="flex items-start gap-3 px-4 py-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-caption font-semibold text-inverse" aria-hidden>
                  {n + 1}
                </span>
                <span className="text-body-sm text-primary">
                  <span className="sr-only">Step {n + 1}: </span>
                  {text}
                </span>
              </li>
            ))}
          </ol>
          <CheckRow checked={twoFactor} onChange={setTwoFactor} label="I have turned on two-step verification with an authenticator app." />
        </div>
      )}

      {step === "login" && (
        <div className="flex flex-col gap-4">
          <p className="flex items-start gap-2 text-body-sm text-secondary">
            <Lock className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
            Your login is encrypted in the vault the moment you save it. Your account manager and Bluecut never see it.
          </p>
          <Input label="LinkedIn email" type="email" autoComplete="off" value={liEmail} onChange={(e) => { setLiEmail(e.target.value); setError(undefined); }} error={error} />
          <PasswordInput label="LinkedIn password" autoComplete="off" value={liPassword} onChange={(e) => { setLiPassword(e.target.value); setError(undefined); }} help="Show it to check it is right before you save." />
        </div>
      )}
    </SetupFrame>
  );
}

"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, Banner, Button, Divider, Input, PasswordInput, TextButton, TextLink } from "@/components/ui";
import { fullName } from "@/lib/format";
import { auth } from "@/lib/mock";
import { AuthFooter, AuthScreen, EmailRow } from "../AuthScreen";
import { GoogleButton } from "../GoogleButton";
import { step } from "../step";

type Stage = "email" | "password" | "linkedin";
type Profile = { kind: "person"; firstName: string; lastName: string } | { kind: "company"; company: string };

/**
 * #43: frictionless sign-up. Email → password → LinkedIn URL → code, or Google → LinkedIn URL → code.
 * The name and photo come from the LinkedIn link (mocked in Phase 1). A bad link never blocks sign-up: you add your name instead.
 */
export default function SignUpPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [viaGoogle, setViaGoogle] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [manual, setManual] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<React.ReactNode>();
  const [busy, setBusy] = useState<"google" | "extract" | "create" | null>(null);

  const taken = (
    <>
      An account already uses this email. <TextLink href="/signin">Sign in instead</TextLink>.
    </>
  );

  function toPassword(ev: React.FormEvent) {
    ev.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter an email address like name@company.com.");
    if (auth.isEmailTaken(email)) return setError(taken);
    setError(undefined);
    setStage("password");
  }

  function toLinkedin(ev: React.FormEvent) {
    ev.preventDefault();
    if (password.length < 12) return setError("Use at least 12 characters, so your account stays safe.");
    setError(undefined);
    setStage("linkedin");
  }

  async function onGoogle() {
    setBusy("google");
    const g = await auth.continueWithGoogle();
    setBusy(null);
    setViaGoogle(true);
    setEmail(g.email);
    setFirstName(g.firstName);
    setLastName(g.lastName);
    setStage("linkedin");
  }

  async function onExtract(ev: React.FormEvent) {
    ev.preventDefault();
    setError(undefined);
    if (!linkedinUrl.trim()) return setError("Paste your LinkedIn profile link, or add your name instead.");
    setBusy("extract");
    const p = await auth.fetchLinkedInProfile(linkedinUrl);
    setBusy(null);
    if (!p) {
      setManual(true);
      setProfile(null);
      return setError("We could not read that link. Check it, or add your name to carry on.");
    }
    setProfile(p);
    setManual(false);
    if (p.kind === "person") {
      setFirstName(p.firstName);
      setLastName(p.lastName);
    }
  }

  async function create() {
    setError(undefined);
    if (!firstName.trim()) return setError("Add your first name to finish.");
    setBusy("create");
    const res = await auth.createAccount({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password: viaGoogle ? undefined : password,
      linkedinUrl: linkedinUrl.trim() || undefined,
      company: profile?.kind === "company" ? profile.company : undefined,
    });
    setBusy(null);
    if (!res.ok) {
      setStage("email");
      return setError(taken);
    }
    router.push(`/signup/verify?email=${encodeURIComponent(email.trim())}`);
  }

  const needName = manual || (profile ? profile.kind === "company" : false);
  const foundPerson = profile?.kind === "person" && !manual;

  return (
    <AuthScreen title="Create your account">
      <AnimatePresence mode="wait" initial={false}>
        {stage === "email" ? (
          <motion.div key="email" {...step} className="flex flex-col gap-6">
            <GoogleButton loading={busy === "google"} onClick={onGoogle} />
            <Divider label="or" />
            <form onSubmit={toPassword} noValidate className="flex flex-col gap-4">
              <Input label="Email" type="email" autoComplete="email" placeholder="name@company.com" value={email} onChange={(e) => { setEmail(e.target.value); setError(undefined); }} error={error} />
              <Button type="submit" fullWidth disabled={busy !== null}>
                Continue
              </Button>
            </form>
          </motion.div>
        ) : stage === "password" ? (
          <motion.form key="password" {...step} onSubmit={toLinkedin} noValidate className="flex flex-col gap-4">
            <EmailRow email={email.trim()} onChange={() => { setStage("email"); setError(undefined); }} />
            <PasswordInput label="Choose a password" autoComplete="new-password" autoFocus value={password} onChange={(e) => { setPassword(e.target.value); setError(undefined); }} help="At least 12 characters." error={error} />
            <Button type="submit" fullWidth disabled={busy !== null}>
              Continue
            </Button>
          </motion.form>
        ) : (
          <motion.div key="linkedin" {...step} className="flex flex-col gap-4">
            <EmailRow email={email.trim()} onChange={() => { setStage(viaGoogle ? "email" : "password"); setError(undefined); }} />

            {foundPerson ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 rounded-md border border-border bg-neutral-25 p-4">
                  <Avatar name={fullName({ firstName, lastName })} size="md" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-caption text-secondary">We found your profile</span>
                    <span className="text-body font-medium text-primary">{fullName({ firstName, lastName })}</span>
                  </span>
                  <TextButton onClick={() => setManual(true)}>Not you?</TextButton>
                </div>
                {error && <p className="text-body-sm text-danger">{error}</p>}
                <Button fullWidth loading={busy === "create"} onClick={create}>
                  Create account
                </Button>
              </div>
            ) : needName ? (
              <div className="flex flex-col gap-4">
                {profile?.kind === "company" ? (
                  <Banner tone="info" icon={false}>That link is a company page. Add your name as the person on the account; we keep {profile.company} on your profile.</Banner>
                ) : (
                  <Banner tone="neutral" icon={false}>Add your name to carry on. You can add your LinkedIn link later from your account.</Banner>
                )}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label="First name" autoComplete="given-name" autoFocus value={firstName} onChange={(e) => { setFirstName(e.target.value); setError(undefined); }} error={error && !firstName.trim() ? error : undefined} />
                  <Input label="Last name" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
                <Button fullWidth loading={busy === "create"} onClick={create}>
                  Create account
                </Button>
                <TextButton onClick={() => { setManual(false); setProfile(null); setError(undefined); }}>Use my LinkedIn link</TextButton>
              </div>
            ) : (
              <form onSubmit={onExtract} noValidate className="flex flex-col gap-4">
                <Input
                  label="Your LinkedIn profile link"
                  type="url"
                  inputMode="url"
                  placeholder="https://www.linkedin.com/in/your-name"
                  value={linkedinUrl}
                  onChange={(e) => { setLinkedinUrl(e.target.value); setError(undefined); }}
                  help="We use it to set up your name and photo. You can change it later."
                  error={error}
                />
                <Button type="submit" fullWidth loading={busy === "extract"}>
                  {busy === "extract" ? "Reading your profile" : "Continue"}
                </Button>
                <TextButton onClick={() => { setManual(true); setError(undefined); }} className="self-center">
                  Add my name instead
                </TextButton>
              </form>
            )}

            <p className="text-caption text-secondary">
              By creating an account you agree to our <TextLink href="/terms">terms</TextLink> and <TextLink href="/privacy">privacy policy</TextLink>.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthFooter>
        Already have an account? <TextLink href="/signin">Sign in</TextLink>
      </AuthFooter>
    </AuthScreen>
  );
}

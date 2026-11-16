"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Divider, Input, PasswordInput, TextLink } from "@/components/ui";
import { auth } from "@/lib/mock";
import { AuthFooter, AuthScreen, EmailRow, PASSWORD_RULE, passwordError } from "../AuthScreen";
import { GoogleButton } from "../GoogleButton";
import { step } from "../step";

type Stage = "email" | "password" | "name";

/**
 * Figma sign-up: email → password → your name → code. Google skips the password and pre-fills the name.
 * The LinkedIn link is asked for later, in Manage account access.
 */
export default function SignUpPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [viaGoogle, setViaGoogle] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<React.ReactNode>();
  const [busy, setBusy] = useState<"google" | "create" | null>(null);

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

  function toName(ev: React.FormEvent) {
    ev.preventDefault();
    const bad = passwordError(password);
    if (bad) return setError(bad);
    setError(undefined);
    setStage("name");
  }

  async function onGoogle() {
    setBusy("google");
    const g = await auth.continueWithGoogle();
    setBusy(null);
    setViaGoogle(true);
    setEmail(g.email);
    setFirstName(g.firstName);
    setLastName(g.lastName);
    setStage("name");
  }

  async function create(ev: React.FormEvent) {
    ev.preventDefault();
    setError(undefined);
    if (!firstName.trim()) return setError("Add your first name to finish.");
    if (!lastName.trim()) return setError("Add your last name to finish.");
    setBusy("create");
    const res = await auth.createAccount({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password: viaGoogle ? undefined : password,
    });
    setBusy(null);
    if (!res.ok) {
      setStage("email");
      return setError(taken);
    }
    router.push(`/signup/verify?email=${encodeURIComponent(email.trim())}`);
  }

  return (
    <AuthScreen title={stage === "password" ? "Choose a password" : stage === "name" ? "Your name" : "Create your account"}>
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
          <motion.form key="password" {...step} onSubmit={toName} noValidate className="flex flex-col gap-4">
            <EmailRow email={email.trim()} onChange={() => { setStage("email"); setError(undefined); }} />
            <PasswordInput label="Password" autoComplete="new-password" autoFocus value={password} onChange={(e) => { setPassword(e.target.value); setError(undefined); }} help={PASSWORD_RULE} error={error} />
            <Button type="submit" fullWidth>
              Continue
            </Button>
          </motion.form>
        ) : (
          <motion.form key="name" {...step} onSubmit={create} noValidate className="flex flex-col gap-4">
            <EmailRow email={email.trim()} onChange={() => { setStage(viaGoogle ? "email" : "password"); setError(undefined); }} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="First name" autoComplete="given-name" autoFocus value={firstName} onChange={(e) => { setFirstName(e.target.value); setError(undefined); }} error={error && !firstName.trim() ? error : undefined} />
              <Input label="Last name" autoComplete="family-name" value={lastName} onChange={(e) => { setLastName(e.target.value); setError(undefined); }} error={error && firstName.trim() && !lastName.trim() ? error : undefined} />
            </div>
            {error && firstName.trim() && lastName.trim() && <p className="text-body-sm text-danger">{error}</p>}
            <Button type="submit" fullWidth loading={busy === "create"}>
              {busy === "create" ? "Creating your account" : "Create account"}
            </Button>
            <p className="text-caption text-secondary">
              By creating an account you agree to our <TextLink href="/terms">terms</TextLink> and <TextLink href="/privacy">privacy policy</TextLink>.
            </p>
          </motion.form>
        )}
      </AnimatePresence>

      <AuthFooter>
        Already have an account? <TextLink href="/signin">Sign in</TextLink>
      </AuthFooter>
    </AuthScreen>
  );
}

"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Divider, Input, PasswordInput, TextLink } from "@/components/ui";
import { auth } from "@/lib/mock";
import { AuthFooter, AuthScreen, EmailRow } from "../AuthScreen";
import { GoogleButton } from "../GoogleButton";
import { step } from "../step";

type Errors = Partial<Record<"firstName" | "lastName" | "email" | "password", React.ReactNode>>;

/** Email first, then name and password, like Lovable. Then a code to confirm the email (/signup/verify). */
export default function SignUpPage() {
  const router = useRouter();
  const [stage, setStage] = useState<"email" | "details">("email");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState<"google" | "email" | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });
  const taken = <>An account already uses this email. <TextLink href="/signin">Sign in instead</TextLink>.</>;

  function toDetails(ev: React.FormEvent) {
    ev.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setErrors({ email: "Enter an email address like name@company.com." });
    if (auth.isEmailTaken(form.email)) return setErrors({ email: taken });
    setErrors({});
    setStage("details");
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Errors = {};
    if (!form.firstName.trim()) e.firstName = "Enter your first name.";
    if (!form.lastName.trim()) e.lastName = "Enter your last name.";
    if (form.password.length < 12) e.password = "Use at least 12 characters, so your account stays safe.";
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy("email");
    const res = await auth.createAccount(form);
    setBusy(null);
    if (!res.ok) {
      setStage("email");
      return setErrors({ email: taken });
    }
    router.push(`/signup/verify?email=${encodeURIComponent(form.email.trim())}`);
  }

  return (
    <AuthScreen title="Create your account">
      <AnimatePresence mode="wait" initial={false}>
        {stage === "email" ? (
          <motion.div key="email" {...step} className="flex flex-col gap-6">
            <GoogleButton
              loading={busy === "google"}
              onClick={async () => {
                setBusy("google");
                await auth.continueWithGoogle();
                router.push("/home");
              }}
            />
            <Divider label="or" />
            <form onSubmit={toDetails} noValidate className="flex flex-col gap-4">
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                value={form.email}
                onChange={set("email")}
                error={errors.email}
              />
              <Button type="submit" fullWidth disabled={busy !== null}>
                Continue
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.form key="details" {...step} onSubmit={submit} noValidate className="flex flex-col gap-4">
            <EmailRow email={form.email.trim()} onChange={() => { setStage("email"); setErrors({}); }} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="First name" autoComplete="given-name" autoFocus value={form.firstName} onChange={set("firstName")} error={errors.firstName} />
              <Input label="Last name" autoComplete="family-name" value={form.lastName} onChange={set("lastName")} error={errors.lastName} />
            </div>
            <PasswordInput
              label="Password"
              autoComplete="new-password"
              value={form.password}
              onChange={set("password")}
              help="At least 12 characters."
              error={errors.password}
            />
            <p className="text-caption text-secondary">
              By creating an account you agree to our <TextLink href="/terms">terms</TextLink> and <TextLink href="/privacy">privacy policy</TextLink>.
            </p>
            <Button type="submit" fullWidth disabled={busy !== null} loading={busy === "email"}>
              {busy === "email" ? "Creating your account" : "Create account"}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

      <AuthFooter>
        Already have an account? <TextLink href="/signin">Sign in</TextLink>
      </AuthFooter>
    </AuthScreen>
  );
}

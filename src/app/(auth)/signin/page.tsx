"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Divider, Input, PasswordInput, TextLink } from "@/components/ui";
import { auth } from "@/lib/mock";
import { AuthFooter, AuthScreen, EmailRow } from "../AuthScreen";
import { GoogleButton } from "../GoogleButton";
import { step } from "../step";

/** Email first, then password, like Lovable. Staff with two-step sign-in go on to /signin/code. */
export default function SignInPage() {
  const router = useRouter();
  const [stage, setStage] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [busy, setBusy] = useState<"google" | "email" | null>(null);

  function toPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setErrors({ email: "Enter the email you signed up with, like name@company.com." });
    setErrors({});
    setStage("password");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return setErrors({ password: "Enter your password." });
    setBusy("email");
    const res = await auth.signIn(email, password);
    setBusy(null);
    if (!res.ok) {
      if (res.field === "email") setStage("email");
      return setErrors({ [res.field ?? "password"]: res.message });
    }
    router.push(res.needsCode ? "/signin/code" : auth.homeFor(res.role));
  }

  return (
    <AuthScreen title="Sign in">
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
            <form onSubmit={toPassword} noValidate className="flex flex-col gap-4">
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />
              <Button type="submit" fullWidth disabled={busy !== null}>
                Continue
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.form key="password" {...step} onSubmit={submit} noValidate className="flex flex-col gap-4">
            <EmailRow email={email.trim()} onChange={() => { setStage("email"); setPassword(""); setErrors({}); }} />
            <PasswordInput
              label="Password"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />
            <TextLink href="/reset" className="self-start text-body-sm">
              Forgot your password?
            </TextLink>
            <Button type="submit" fullWidth disabled={busy !== null}>
              {busy === "email" ? "Signing in" : "Sign in"}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

      <AuthFooter>
        New to Bluecut? <TextLink href="/signup">Create your account</TextLink>
      </AuthFooter>

      <p className="text-center text-caption text-secondary">
        Demo, any password: chidi@paystream.example (client), ada@bluecut.example (manager), fola@bluecut.example (owner). Staff are asked for a code.
      </p>
    </AuthScreen>
  );
}

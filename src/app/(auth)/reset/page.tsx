"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, buttonClass, Input, TextLink } from "@/components/ui";
import { auth } from "@/lib/mock";
import { AuthFooter, AuthScreen } from "../AuthScreen";

/** Figma: Reset your password → Check your email. The link in the email opens /reset/new. */
export default function ResetPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter the email you signed up with, like name@company.com.");
    setBusy(true);
    await auth.requestPasswordReset(email);
    setBusy(false);
    setSent(true);
  }

  if (sent) {
    return (
      <AuthScreen
        title="Check your email"
        description={
          <>
            If an account uses <span className="font-medium text-primary">{email.trim()}</span>, we sent a link to set a new password. The link works for 1 hour.
          </>
        }
      >
        <Link href="/signin" className={`${buttonClass("primary", "md")} w-full`}>
          Back to sign in
        </Link>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen title="Reset your password" info="Enter your email and we will send you a link to set a new password.">
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <Input label="Email" type="email" autoComplete="email" placeholder="name@company.com" value={email} onChange={(e) => { setEmail(e.target.value); setError(undefined); }} error={error} />
        <Button type="submit" fullWidth loading={busy}>
          {busy ? "Sending" : "Send link"}
        </Button>
      </form>
      <p className="text-center text-body-sm text-secondary">
        Remembered it? <TextLink href="/signin">Sign in</TextLink>
      </p>
      <AuthFooter>
        New to Bluecut? <TextLink href="/signup">Create your account</TextLink>
      </AuthFooter>
    </AuthScreen>
  );
}

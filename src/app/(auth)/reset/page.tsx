"use client";

import { useState } from "react";
import { Button, Input, TextLink } from "@/components/ui";
import { auth } from "@/lib/mock";
import { AuthCard } from "../AuthCard";

export default function ResetPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter the email you signed up with.");
    setBusy(true);
    await auth.requestPasswordReset(email);
    setBusy(false);
    setSent(true);
  }

  if (sent) {
    return (
      <AuthCard
        title="Check your email"
        description={
          <>
            If an account uses <span className="font-medium text-primary">{email}</span>, we sent a link to set a new password. The link works for 1 hour.
          </>
        }
      >
        <TextLink href="/reset/new" className="self-start">
          Demo: open the link from the email
        </TextLink>
        <TextLink href="/signin" className="self-start">
          Back to sign in
        </TextLink>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Reset your password" description="Enter your email and we will send you a link to set a new password.">
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <Input label="Email" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(undefined); }} error={error} />
        <Button type="submit" fullWidth disabled={busy}>
          {busy ? "Sending" : "Send link"}
        </Button>
      </form>
      <p className="text-center text-body-sm text-secondary">
        Remembered it? <TextLink href="/signin">Sign in</TextLink>
      </p>
    </AuthCard>
  );
}

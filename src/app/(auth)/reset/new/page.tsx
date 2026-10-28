"use client";

import { useState } from "react";
import { Banner, Button, PasswordInput, TextLink } from "@/components/ui";
import { auth } from "@/lib/mock";
import { AuthScreen } from "../../AuthScreen";

export default function NewPasswordPage() {
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ pw?: string; confirm?: string }>({});
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 12) return setErrors({ pw: "Use at least 12 characters, so your account stays safe." });
    if (pw !== confirm) return setErrors({ confirm: "The two passwords do not match. Type it again." });
    setBusy(true);
    await auth.setNewPassword();
    setBusy(false);
    setDone(true);
  }

  if (done) {
    return (
      <AuthScreen title="Your password is changed">
        <Banner tone="success" title="You are signed out everywhere else">
          For your safety, any other device signed in to your account has been signed out.
        </Banner>
        <TextLink href="/signin" className="self-start">
          Sign in
        </TextLink>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen title="Set a new password" description="Choose a password you have not used for Bluecut before.">
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <PasswordInput label="New password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} help="At least 12 characters." error={errors.pw} />
        <PasswordInput label="Type it again" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />
        <Button type="submit" fullWidth loading={busy}>
          {busy ? "Saving" : "Save password"}
        </Button>
      </form>
    </AuthScreen>
  );
}

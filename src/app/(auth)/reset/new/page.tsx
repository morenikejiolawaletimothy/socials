"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, buttonClass, PasswordInput } from "@/components/ui";
import { auth } from "@/lib/mock";
import { AuthScreen, PASSWORD_RULE, passwordError } from "../../AuthScreen";

/** Figma: Set a new password → Your password is changed. */
export default function NewPasswordPage() {
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ pw?: string; confirm?: string }>({});
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const bad = passwordError(pw);
    if (bad) return setErrors({ pw: bad });
    if (pw !== confirm) return setErrors({ confirm: "The two passwords do not match. Type it again." });
    setBusy(true);
    await auth.setNewPassword();
    setBusy(false);
    setDone(true);
  }

  if (done) {
    return (
      <AuthScreen title="Your password is changed" description="For your safety, we signed you out on every other device.">
        <Link href="/signin" className={`${buttonClass("primary", "md")} w-full`}>
          Go to sign in
        </Link>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen title="Set a new password">
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <PasswordInput label="New password" autoComplete="new-password" value={pw} onChange={(e) => { setPw(e.target.value); setErrors({}); }} help={PASSWORD_RULE} error={errors.pw} />
        <PasswordInput label="Type it again" autoComplete="new-password" value={confirm} onChange={(e) => { setConfirm(e.target.value); setErrors({}); }} error={errors.confirm} />
        <Button type="submit" fullWidth loading={busy}>
          {busy ? "Saving" : "Save password"}
        </Button>
      </form>
    </AuthScreen>
  );
}

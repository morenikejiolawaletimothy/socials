"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, CodeInput, TextLink } from "@/components/ui";
import { auth } from "@/lib/mock";
import { AuthScreen } from "../../AuthScreen";

export default function SignInCodePage() {
  const router = useRouter();
  const [code, setCode] = useState(auth.DEMO_SIGN_IN.code);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [backup, setBackup] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) return setError(backup ? "Enter one of your 6-digit backup codes." : "Enter all 6 digits from your authenticator app.");
    setBusy(true);
    const res = await auth.verifySignInCode(code);
    setBusy(false);
    if (!res.ok) return setError(res.message);
    router.push(auth.homeFor(res.role));
  }

  return (
    <AuthScreen
      title={backup ? "Use a backup code" : "Enter your code"}
      description={backup ? "Enter one of the backup codes you saved when you set up two-step sign-in. Each code works once." : "Open your authenticator app and enter the 6-digit code for Bluecut."}
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <CodeInput label={backup ? "Backup code" : "Code"} value={code} onChange={(v) => { setCode(v); setError(undefined); }} error={error} />
        <Button type="submit" fullWidth loading={busy}>
          {busy ? "Checking" : "Sign in"}
        </Button>
      </form>
      <Button variant="ghost" onClick={() => { setBackup((b) => !b); setCode(""); setError(undefined); }}>
        {backup ? "Use my authenticator app" : "Use a backup code instead"}
      </Button>
      <p className="text-center text-body-sm text-secondary">
        <TextLink href="/signin">Back to sign in</TextLink>
      </p>
    </AuthScreen>
  );
}

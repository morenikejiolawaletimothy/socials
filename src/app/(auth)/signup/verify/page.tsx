"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button, CodeInput, TextLink, useToast } from "@/components/ui";
import { auth } from "@/lib/mock";
import { AuthScreen } from "../../AuthScreen";

function Verify() {
  const router = useRouter();
  const email = useSearchParams().get("email") ?? "your email";
  const toast = useToast();
  const [code, setCode] = useState(auth.DEMO_SIGN_IN.code);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) return setError("Enter all 6 digits from the email.");
    setBusy(true);
    const res = await auth.verifyEmailCode(code);
    setBusy(false);
    if (!res.ok) return setError(res.message);
    router.push("/home");
  }

  return (
    <AuthScreen
      title="Check your email"
      description={
        <>
          We sent a 6-digit code to <span className="font-medium text-primary">{email}</span>. Enter it below to confirm it is you.
        </>
      }
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <CodeInput label="Code" value={code} onChange={(v) => { setCode(v); setError(undefined); }} error={error} />
        <Button type="submit" fullWidth loading={busy}>
          {busy ? "Checking" : "Confirm email"}
        </Button>
      </form>
      <Button variant="ghost" onClick={() => toast("We sent a new code.")}>
        Send a new code
      </Button>
      <p className="text-center text-body-sm text-secondary">
        Wrong email? <TextLink href="/signup">Change it</TextLink>
      </p>
    </AuthScreen>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <Verify />
    </Suspense>
  );
}

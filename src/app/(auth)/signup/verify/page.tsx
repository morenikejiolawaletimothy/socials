"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
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
  const [wait, setWait] = useState(30);
  const [sending, setSending] = useState(false);
  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

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
      <Button
        variant="ghost"
        disabled={wait > 0}
        loading={sending}
        onClick={async () => {
          setSending(true);
          await new Promise((r) => setTimeout(r, 600));
          setSending(false);
          setWait(30);
          setCode("");
          toast(`We sent a new code to ${email}. The old one no longer works.`);
        }}
      >
        {wait > 0 ? `Send a new code in ${wait}s` : sending ? "Sending" : "Send a new code"}
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

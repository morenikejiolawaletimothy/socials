"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button, CodeInput, useToast } from "@/components/ui";
import { auth } from "@/lib/mock";
import { AuthCard } from "../../AuthCard";

function Verify() {
  const router = useRouter();
  const email = useSearchParams().get("email") ?? "your email";
  const toast = useToast();
  const [code, setCode] = useState("");
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
    <AuthCard
      title="Check your email"
      description={
        <>
          We sent a 6-digit code to <span className="font-medium text-primary">{email}</span>. Enter it below to confirm it is you.
        </>
      }
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <CodeInput label="Code" value={code} onChange={(v) => { setCode(v); setError(undefined); }} error={error} help="Demo: any 6 digits work, except 000000." />
        <Button type="submit" fullWidth disabled={busy}>
          {busy ? "Checking" : "Confirm email"}
        </Button>
      </form>
      <Button variant="ghost" onClick={() => toast("We sent a new code.")}>
        Send a new code
      </Button>
    </AuthCard>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <Verify />
    </Suspense>
  );
}

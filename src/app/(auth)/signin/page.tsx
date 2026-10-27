"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Divider, Input, PasswordInput, TextLink } from "@/components/ui";
import { auth } from "@/lib/mock";
import { AuthCard } from "../AuthCard";
import { GoogleButton } from "../GoogleButton";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [busy, setBusy] = useState<"google" | "email" | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return setErrors({ email: "Enter the email you signed up with." });
    if (!password) return setErrors({ password: "Enter your password." });
    setBusy("email");
    const res = await auth.signIn(email, password);
    setBusy(null);
    if (!res.ok) return setErrors({ [res.field ?? "email"]: res.message });
    router.push(res.needsCode ? "/signin/code" : auth.homeFor(res.role));
  }

  return (
    <AuthCard title="Sign in" description="Welcome back.">
      <GoogleButton
        loading={busy === "google"}
        onClick={async () => {
          setBusy("google");
          await auth.continueWithGoogle();
          router.push("/home");
        }}
      />
      <Divider label="or" />
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <Input label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <PasswordInput label="Password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <TextLink href="/reset" className="self-start text-body-sm">
          Forgot your password?
        </TextLink>
        <Button type="submit" fullWidth disabled={busy !== null}>
          {busy === "email" ? "Signing in" : "Sign in"}
        </Button>
      </form>
      <div className="flex flex-col gap-2 rounded-md bg-neutral-25 p-4 text-caption text-secondary">
        <span className="font-medium text-primary">Demo accounts (any password)</span>
        <span>Client: chidi@paystream.example</span>
        <span>Manager: ada@bluecut.example (asks for a code)</span>
        <span>Owner: fola@bluecut.example (asks for a code)</span>
      </div>
      <p className="text-center text-body-sm text-secondary">
        New to Bluecut? <TextLink href="/signup">Create an account</TextLink>
      </p>
    </AuthCard>
  );
}

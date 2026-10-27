"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Divider, Input, PasswordInput, TextLink } from "@/components/ui";
import { auth } from "@/lib/mock";
import { AuthCard } from "../AuthCard";
import { GoogleButton } from "../GoogleButton";

type Errors = Partial<Record<"firstName" | "lastName" | "email" | "password", React.ReactNode>>;

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState<"google" | "email" | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  function validate(): Errors {
    const e: Errors = {};
    if (!form.firstName.trim()) e.firstName = "Enter your first name.";
    if (!form.lastName.trim()) e.lastName = "Enter your last name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = "Enter an email address like name@company.com.";
    if (form.password.length < 12) e.password = "Use at least 12 characters, so your account stays safe.";
    return e;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy("email");
    const res = await auth.createAccount(form);
    setBusy(null);
    if (!res.ok) {
      setErrors({ email: <>An account already uses this email. <TextLink href="/signin">Sign in instead</TextLink>.</> });
      return;
    }
    router.push(`/signup/verify?email=${encodeURIComponent(form.email.trim())}`);
  }

  async function google() {
    setBusy("google");
    await auth.continueWithGoogle();
    router.push("/home");
  }

  return (
    <AuthCard title="Create your account" description="It takes under a minute. Your first 2 weeks are free.">
      <GoogleButton onClick={google} loading={busy === "google"} />
      <Divider label="or" />
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="First name" autoComplete="given-name" value={form.firstName} onChange={set("firstName")} error={errors.firstName} />
          <Input label="Last name" autoComplete="family-name" value={form.lastName} onChange={set("lastName")} error={errors.lastName} />
        </div>
        <Input label="Email" type="email" autoComplete="email" value={form.email} onChange={set("email")} error={errors.email} />
        <PasswordInput
          label="Password"
          autoComplete="new-password"
          value={form.password}
          onChange={set("password")}
          help="At least 12 characters."
          error={errors.password}
        />
        <p className="text-caption text-secondary">
          By creating an account you agree to our <TextLink href="/terms">terms</TextLink> and{" "}
          <TextLink href="/privacy">privacy policy</TextLink>.
        </p>
        <Button type="submit" fullWidth disabled={busy !== null}>
          {busy === "email" ? "Creating your account" : "Create account"}
        </Button>
      </form>
      <p className="text-center text-body-sm text-secondary">
        Already have an account? <TextLink href="/signin">Sign in</TextLink>
      </p>
    </AuthCard>
  );
}

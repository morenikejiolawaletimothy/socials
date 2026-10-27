"use client";

import { useId } from "react";

/** 6-digit code field (email code, two-step sign-in). One input, so paste and autofill work. */
export function CodeInput({
  label,
  value,
  onChange,
  error,
  help,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  help?: string;
}) {
  const id = useId();
  const message = error ?? help;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-body-sm font-medium text-primary">
        {label}
      </label>
      <input
        id={id}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? `${id}-message` : undefined}
        placeholder="000000"
        className={`min-h-14 rounded-sm border bg-card px-4 text-center font-mono text-display-xl tracking-widest text-primary shadow-sm placeholder:text-neutral-300 focus-visible:border-primary-600 focus-visible:focus-ring ${error ? "border-danger" : "border-border-strong"}`}
      />
      {message && (
        <span id={`${id}-message`} className={`text-body-sm ${error ? "text-danger" : "text-secondary"}`}>
          {message}
        </span>
      )}
    </div>
  );
}

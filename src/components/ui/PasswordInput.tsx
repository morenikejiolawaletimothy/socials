"use client";

import { Eye, EyeSlash } from "@phosphor-icons/react";
import { useId, useState, type InputHTMLAttributes } from "react";
import { FieldMessage, fieldClass } from "./Input";

/** Password field with a visible label and a show/hide button. */
export function PasswordInput({
  label,
  help,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; help?: React.ReactNode; error?: React.ReactNode }) {
  const [shown, setShown] = useState(false);
  const id = useId();
  const message = error ?? help;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-body-sm leading-5 font-medium text-primary">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={shown ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? `${id}-message` : undefined}
          className={`${fieldClass} pr-12 ${error ? "border-danger" : "border-border-strong"}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? "Hide password" : "Show password"}
          className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-sm text-secondary hover:text-primary focus-visible:focus-ring"
        >
          {shown ? <EyeSlash className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
        </button>
      </div>
      {message && <FieldMessage id={`${id}-message`} error={error} help={help} />}
    </div>
  );
}

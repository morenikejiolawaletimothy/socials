import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "border-transparent bg-primary-600 text-inverse hover:bg-primary-700 active:bg-primary-700 disabled:bg-primary-200 disabled:text-neutral-0",
  secondary:
    "bg-card text-primary-700 border-border-strong hover:bg-primary-50 hover:border-primary-300 disabled:text-neutral-300 disabled:border-neutral-300",
  ghost:
    "border-transparent bg-transparent text-primary-700 hover:bg-primary-50 disabled:text-neutral-300",
  danger: "border-transparent bg-danger text-inverse hover:opacity-90 disabled:opacity-50",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  fullWidth?: boolean;
};

/** One primary button per view. Label says the action. No arrows. */
export function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-5 py-3 text-body leading-none font-medium transition-colors focus-visible:focus-ring disabled:cursor-not-allowed ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    />
  );
}

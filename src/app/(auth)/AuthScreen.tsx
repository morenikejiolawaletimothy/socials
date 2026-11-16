import Link from "next/link";
import { InfoTip, Logo } from "@/components/ui";

/** The password rule, shown under every new-password field. */
export const PASSWORD_RULE = "At least 12 characters long and combine uppercase and lowercase letters, numbers, and special symbols.";

/** Checks a new password against PASSWORD_RULE. Returns the error to show, or nothing. */
export function passwordError(pw: string) {
  if (pw.length < 12) return "Use at least 12 characters, so your account stays safe.";
  if (!/[a-z]/.test(pw) || !/[A-Z]/.test(pw) || !/\d/.test(pw) || !/[^A-Za-z0-9]/.test(pw)) return "Add an uppercase letter, a lowercase letter, a number and a symbol.";
  return undefined;
}

/** One auth screen: logo mark, title (with an optional InfoTip), optional intro, then the form. `above` sits between logo and title (the invite Stepper). */
export function AuthScreen({
  title,
  info,
  description,
  above,
  children,
}: {
  title: string;
  info?: React.ReactNode;
  description?: React.ReactNode;
  above?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <title>{`${title} · Bluecut Socials`}</title>
      <Link href="/" aria-label="Bluecut Socials home" className="self-start rounded-full focus-visible:focus-ring">
        <Logo size={40} />
      </Link>
      {above}
      <div className="flex flex-col gap-2">
        <h1 className="flex items-center gap-2 font-display text-display-xl text-primary">
          {title}
          {info && <InfoTip label={`About ${title.toLowerCase()}`}>{info}</InfoTip>}
        </h1>
        {description && <p className="text-body text-secondary">{description}</p>}
      </div>
      <div className="flex flex-col gap-6">{children}</div>
    </div>
  );
}

/** The line under every sign-in and sign-up form: a divider, then the switch link. */
export function AuthFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 border-t border-border pt-4">
      <p className="text-center text-body-sm text-secondary">{children}</p>
    </div>
  );
}

/** Shows the email chosen in step 1, with a way back to change it. */
export function EmailRow({ email, onChange }: { email: string; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-neutral-25 px-4 py-3">
      <span className="min-w-0 truncate text-body-sm text-primary">{email}</span>
      <button
        type="button"
        onClick={onChange}
        className="shrink-0 rounded-sm text-body-sm font-medium text-primary-600 underline-offset-4 hover:text-primary-700 hover:underline focus-visible:focus-ring"
      >
        Change
      </button>
    </div>
  );
}

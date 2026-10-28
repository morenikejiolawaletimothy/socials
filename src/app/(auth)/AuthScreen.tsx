import { LockSimple } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Logo } from "@/components/ui";

/** One auth screen: logo mark, title, optional intro, then the form. `above` sits between logo and title (the invite Stepper). */
export function AuthScreen({
  title,
  description,
  above,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  above?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-8">
      <Link href="/" aria-label="Bluecut Socials home" className="self-start rounded-full focus-visible:focus-ring">
        <Logo size={44} />
      </Link>
      {above}
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-display-2xl text-primary">{title}</h1>
        {description && <p className="text-body text-secondary">{description}</p>}
      </div>
      <div className="flex flex-col gap-6">{children}</div>
    </div>
  );
}

/** The line under every sign-in and sign-up form: the switch link, a divider, then a reassurance. */
export function AuthFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-body-sm text-secondary">{children}</p>
      <div className="h-px bg-border" />
      <p className="flex items-center justify-center gap-2 text-caption text-secondary">
        <LockSimple className="size-4" aria-hidden />
        We never see or store your LinkedIn password.
      </p>
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

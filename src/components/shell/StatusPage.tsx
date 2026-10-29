import Link from "next/link";
import { Logo } from "@/components/ui";

/** Full-page message for "not found" and "something went wrong": what happened, and where to go next. */
export function StatusPage({ code, title, children, actions }: { code?: string; title: string; children: React.ReactNode; actions: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col bg-page">
      <header className="mx-auto w-full max-w-6xl px-4 py-6">
        <Link href="/" aria-label="Bluecut Socials home" className="inline-flex rounded-sm focus-visible:focus-ring">
          <Logo size={36} />
        </Link>
      </header>
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-start justify-center gap-4 px-4 pb-24">
        {code && <p className="text-body-sm font-medium text-primary-600">{code}</p>}
        <h1 className="font-display text-display-2xl text-primary">{title}</h1>
        <p className="text-body-lg text-secondary">{children}</p>
        <div className="mt-4 flex flex-wrap gap-3">{actions}</div>
      </div>
    </main>
  );
}

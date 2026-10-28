import Link from "next/link";
import { Logo } from "@/components/ui";

/** Terms and privacy: a plain reading page with the logo on top. */
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-card">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center px-4">
        <Link href="/" className="flex items-center gap-2 rounded-full focus-visible:focus-ring" aria-label="Bluecut Socials home">
          <Logo size={36} />
          <span className="font-display text-display-lg text-primary">Bluecut</span>
        </Link>
      </header>
      <main className="mx-auto w-full max-w-2xl px-4 pb-16 pt-12">{children}</main>
    </div>
  );
}

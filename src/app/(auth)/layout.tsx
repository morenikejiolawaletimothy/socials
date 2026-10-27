import Link from "next/link";
import { Logo, ToastProvider } from "@/components/ui";

/** Sign-up and sign-in pages: logo, one centred card, nothing else to distract. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-dvh flex-col">
        <header className="mx-auto flex h-16 w-full max-w-6xl items-center px-4">
          <Link href="/" className="flex items-center gap-2 rounded-full focus-visible:focus-ring" aria-label="Bluecut Socials home">
            <Logo size={36} />
            <span className="font-display text-display-lg text-primary">Bluecut</span>
          </Link>
        </header>
        <main className="flex flex-1 justify-center px-4 pb-16 pt-6 sm:pt-12">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}

import Link from "next/link";
import { Logo } from "@/components/ui";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-start justify-center gap-6 px-4 py-16">
      <Logo size={56} />
      <h1 className="font-display text-display-3xl text-primary">Bluecut Socials</h1>
      <p className="text-body-lg text-secondary">
        We are scoping the product flow by flow. Pages will appear here once each flow is
        approved.
      </p>
      <Link
        href="/design-system"
        className="rounded-sm font-medium text-primary-600 underline-offset-4 hover:text-primary-700 hover:underline focus-visible:focus-ring"
      >
        See the design system
      </Link>
    </main>
  );
}

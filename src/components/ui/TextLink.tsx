import Link from "next/link";

/** Inline link. One style everywhere: brand blue, underline on hover. */
export function TextLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`rounded-sm font-medium text-primary-600 underline-offset-4 hover:text-primary-700 hover:underline focus-visible:focus-ring ${className}`}
    >
      {children}
    </Link>
  );
}

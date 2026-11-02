import Link from "next/link";

/**
 * Blue text action ("View all", "Read full details", "Open profile", "Copy note"): body-sm medium, brand blue,
 * underline on hover, optional icon before the label. One style everywhere, for links and buttons alike.
 */
export const textActionClass =
  "inline-flex items-center gap-2 rounded-sm text-body-sm font-medium text-primary-600 hover:text-primary-700 hover:underline focus-visible:focus-ring disabled:cursor-not-allowed disabled:text-neutral-300";

/** Inline link. One style everywhere: brand blue, underline on hover. Inherits the text size around it. */
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

/** A text action that does something on the page (Copy note, Edit, Show 5 more). Same look as a text link. */
export function TextButton({ className = "", type = "button", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={`${textActionClass} ${className}`} {...props} />;
}

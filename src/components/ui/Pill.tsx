/**
 * A count or short fact in a card header ("6 posts", "2 of 6 done", "3 posts · 2 calls").
 * Not a status: for a state (Sent, Published, Failed) use Badge.
 */
export function Pill({ children, label, className = "" }: { children: React.ReactNode; /** Fuller wording for screen readers. */ label?: string; className?: string }) {
  return (
    <span aria-label={label} className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full bg-primary-50 px-2 py-1 text-caption font-medium text-primary-700 ${className}`}>
      {children}
    </span>
  );
}

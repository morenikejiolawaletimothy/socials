/**
 * A count or short fact in a card header ("6 posts", "2 of 6 done", "3 posts · 2 calls").
 * Not a status: for a state (Sent, Published, Failed) use Badge.
 * Same 28px height as Badge, so the two line up side by side.
 */
export function Pill({ children, label, className = "" }: { children: React.ReactNode; /** Fuller wording for screen readers. */ label?: string; className?: string }) {
  return (
    <span aria-label={label} className={`inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-primary-50 px-3 text-caption font-medium leading-none text-primary-700 ${className}`}>
      {children}
    </span>
  );
}

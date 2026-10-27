/** Placeholder block while content loads. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`block animate-pulse rounded-sm bg-neutral-100 ${className}`} />;
}

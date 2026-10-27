/** Horizontal rule, optionally with a short label in the middle ("or"). */
export function Divider({ label }: { label?: string }) {
  if (!label) return <hr className="border-border" />;
  return (
    <div className="flex items-center gap-3" role="separator">
      <span className="h-px flex-1 bg-border" />
      <span className="text-caption text-secondary">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

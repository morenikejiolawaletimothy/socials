/** Shown when a list or page has nothing yet. Tells people what will appear and why. */
export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border-strong bg-card px-6 py-12 text-center">
      <p className="font-display text-display-lg text-primary">{title}</p>
      {children && <p className="max-w-sm text-body-sm text-secondary">{children}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

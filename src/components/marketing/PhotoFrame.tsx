/** Placeholder for a photo until real images are supplied. Says what the photo should show. */
export function PhotoFrame({ label, className = "", compact = false }: { label: string; className?: string; compact?: boolean }) {
  return (
    <div role="img" aria-label={`Photo placeholder: ${label}`} className={className}>
      <div className="relative flex size-full items-end overflow-hidden rounded-lg bg-primary-100">
        <span aria-hidden className="absolute -right-8 -top-8 size-32 rounded-full bg-primary-200" />
        <span aria-hidden className="absolute -bottom-6 left-1/3 h-12 w-40 rounded-full bg-primary-200" />
        {!compact && <span className="relative m-4 rounded-sm bg-card px-2 py-1 text-caption text-secondary">Photo: {label}</span>}
      </div>
    </div>
  );
}

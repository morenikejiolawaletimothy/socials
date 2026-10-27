type Status = "success" | "warning" | "danger" | "info" | "neutral";

const styles: Record<Status, { surface: string; dot: string }> = {
  success: { surface: "bg-success-bg text-neutral-900", dot: "bg-success" },
  warning: { surface: "bg-warning-bg text-neutral-900", dot: "bg-warning" },
  danger: { surface: "bg-danger-bg text-neutral-900", dot: "bg-danger" },
  info: { surface: "bg-info-bg text-neutral-900", dot: "bg-info" },
  neutral: { surface: "bg-neutral-100 text-neutral-700", dot: "bg-neutral-400" },
};

/** Status label. Always pass a text label so meaning never rests on color alone. */
export function Badge({
  status = "neutral",
  children,
}: {
  status?: Status;
  children: React.ReactNode;
}) {
  const s = styles[status];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-caption leading-none ${s.surface}`}
    >
      <span className={`size-[7px] shrink-0 rounded-full ${s.dot}`} aria-hidden />
      {children}
    </span>
  );
}

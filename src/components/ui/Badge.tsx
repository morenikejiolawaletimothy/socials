type Status = "success" | "warning" | "danger" | "info" | "neutral";

const styles: Record<Status, { surface: string; dot: string }> = {
  success: { surface: "bg-success-bg text-success", dot: "bg-success" },
  warning: { surface: "bg-warning-bg text-warning", dot: "bg-warning" },
  danger: { surface: "bg-danger-bg text-danger", dot: "bg-danger" },
  info: { surface: "bg-info-bg text-info", dot: "bg-info" },
  neutral: { surface: "bg-neutral-50 text-neutral-500", dot: "bg-neutral-300" },
};

/**
 * Status label. Always pass a text label so meaning never rests on color alone.
 * `live` adds a soft pulse to the dot for something happening right now (an active account).
 */
export function Badge({
  status = "neutral",
  live = false,
  children,
}: {
  status?: Status;
  live?: boolean;
  children: React.ReactNode;
}) {
  const s = styles[status];
  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-caption font-semibold leading-none ring-1 ring-inset ring-current/20 ${s.surface}`}
    >
      <span className="relative flex size-2 shrink-0" aria-hidden>
        {live && <span className={`absolute inset-0 animate-ping rounded-full opacity-60 motion-reduce:hidden ${s.dot}`} />}
        <span className={`relative size-2 rounded-full ${s.dot}`} />
      </span>
      {children}
    </span>
  );
}

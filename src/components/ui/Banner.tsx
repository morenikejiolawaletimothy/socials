type Tone = "info" | "success" | "warning" | "danger";

const tones: Record<Tone, string> = {
  info: "bg-info-bg border-primary-200",
  success: "bg-success-bg border-success",
  warning: "bg-warning-bg border-warning",
  danger: "bg-danger-bg border-danger",
};

/** Full-width notice. Always says what happened and what to do next. */
export function Banner({
  tone = "info",
  title,
  children,
  action,
}: {
  tone?: Tone;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={`flex flex-col gap-3 rounded-md border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${tones[tone]}`}
    >
      <div className="flex flex-col gap-1">
        <p className="text-body-sm font-semibold text-neutral-900">{title}</p>
        {children && <p className="text-body-sm text-neutral-700">{children}</p>}
      </div>
      {action}
    </div>
  );
}

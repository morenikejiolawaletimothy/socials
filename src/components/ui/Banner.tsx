import { CheckCircle, Info, Warning, WarningCircle } from "@phosphor-icons/react/dist/ssr";

type Tone = "info" | "success" | "warning" | "danger" | "neutral";

const tones: Record<Tone, { box: string; icon: string; Icon: typeof Info }> = {
  info: { box: "bg-info-bg border-primary-200", icon: "text-primary-600", Icon: Info },
  success: { box: "bg-success-bg border-success", icon: "text-success", Icon: CheckCircle },
  warning: { box: "bg-warning-bg border-warning", icon: "text-warning", Icon: Warning },
  danger: { box: "bg-danger-bg border-danger", icon: "text-danger", Icon: WarningCircle },
  neutral: { box: "bg-neutral-25 border-border", icon: "text-secondary", Icon: Info },
};

/**
 * Notice: says what is happening and what to do next. Use it, not grey text, for anything the person
 * should act on or know before they act. With a title for page-level notices; without one for a short
 * note inside a card. The icon lines up with the first line of text.
 */
export function Banner({
  tone = "info",
  title,
  children,
  action,
  className = "",
}: {
  tone?: Tone;
  title?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  const t = tones[tone];
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={`flex flex-col gap-3 rounded-md border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${t.box} ${className}`}>
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className={`flex shrink-0 items-center ${title ? "h-6" : "h-5"}`}>
          <t.Icon className={`size-5 ${t.icon}`} aria-hidden />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          {title && <p className="text-body font-semibold text-neutral-900">{title}</p>}
          {children && <div className="text-body-sm text-neutral-700">{children}</div>}
        </div>
      </div>
      {action && <div className="flex shrink-0 flex-wrap gap-2 pl-8 sm:pl-0">{action}</div>}
    </div>
  );
}

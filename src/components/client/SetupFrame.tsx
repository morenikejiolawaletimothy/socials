import { Breadcrumbs, InfoTip, ProgressBar } from "@/components/ui";

/**
 * Figma setup frame (Choose your preferred plan, Manage account access): breadcrumbs above one centred card,
 * the title with an InfoTip, a "N% done · N steps left" bar, then the current step as a sub-section with its
 * own heading and InfoTip, and Back / primary in a footer under a divider.
 */
export function SetupFrame({
  title,
  info,
  crumb,
  percent,
  stepsLeft,
  section,
  sectionInfo,
  footer,
  children,
}: {
  title: string;
  info?: React.ReactNode;
  crumb: string;
  percent: number;
  stepsLeft: number;
  section?: string;
  sectionInfo?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <Breadcrumbs items={[{ label: "Home", href: "/home" }, { label: "Set up", href: "/home" }, { label: crumb }]} />
      <section className="overflow-hidden rounded-lg border border-border bg-card">
        <header className="flex items-center gap-2 border-b border-border px-4 py-4 sm:px-6">
          <h2 className="font-display text-display-lg text-primary">{title}</h2>
          {info && <InfoTip label={`About ${title.toLowerCase()}`}>{info}</InfoTip>}
        </header>
        <div className="flex flex-col gap-2 border-b border-border px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 text-body-sm">
            <span className="text-primary">{percent}% done</span>
            <span className="text-secondary">{stepsLeft === 0 ? "All done" : `${stepsLeft} ${stepsLeft === 1 ? "step" : "steps"} left`}</span>
          </div>
          <div role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={`${title}: ${percent}% done`}>
            <ProgressBar value={percent} />
          </div>
        </div>
        {section && (
          <div className="flex items-center gap-2 border-b border-border px-4 py-4 sm:px-6">
            <h3 className="text-body font-semibold text-primary">{section}</h3>
            {sectionInfo && <InfoTip label={`About ${section.toLowerCase()}`}>{sectionInfo}</InfoTip>}
          </div>
        )}
        <div className="px-4 py-4 sm:px-6">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-4 py-4 sm:px-6">{footer}</div>}
      </section>
    </div>
  );
}

/** A selectable option card (Figma account type, contract length): bordered, blue when chosen, radio top right. */
export function OptionCard({
  name,
  checked,
  onChange,
  title,
  eyebrow,
  children,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  title: React.ReactNode;
  eyebrow?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <label
      className={`relative flex cursor-pointer flex-col gap-2 rounded-lg border p-4 transition-colors focus-within:focus-ring ${checked ? "border-primary-600 bg-primary-50" : "border-border bg-card hover:border-primary-300"}`}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="absolute right-4 top-4 size-4 accent-primary-600" />
      {eyebrow && <span className="pr-8 text-caption font-medium uppercase tracking-wide text-primary-700">{eyebrow}</span>}
      <span className="pr-8 text-body font-semibold text-primary">{title}</span>
      {children && <span className="text-body-sm text-secondary">{children}</span>}
    </label>
  );
}

/** A checkbox row (Figma permissions, add-ons, channels): bordered, icon optional, extra on the right. */
export function CheckRow({
  checked,
  onChange,
  label,
  help,
  icon,
  extra,
  type = "checkbox",
  name,
}: {
  checked: boolean;
  onChange: (on: boolean) => void;
  label: React.ReactNode;
  help?: React.ReactNode;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
  type?: "checkbox" | "radio";
  name?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-3 rounded-md border px-4 py-3 transition-colors ${checked ? "border-primary-600 bg-primary-50" : "border-border bg-card hover:border-primary-300"}`}>
      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
        {icon && <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">{icon}</span>}
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-body-sm font-medium text-primary">{label}</span>
          {help && <span className="text-caption text-secondary">{help}</span>}
        </span>
        <input type={type} name={name} checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 shrink-0 accent-primary-600 focus-visible:focus-ring" />
      </label>
      {extra}
    </div>
  );
}

import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { useId, type SelectHTMLAttributes } from "react";

/*
 * The caret sits on the same inset as the text (16px on md, 12px on sm), and the text stops a full
 * caret-width plus gap before it, so long options never run under the icon.
 */
const sizes = {
  md: { field: "min-h-11 pl-4 pr-11 text-body", caret: "right-4 size-4" },
  sm: { field: "min-h-10 pl-3 pr-9 text-body-sm", caret: "right-3 size-4" },
  xs: { field: "min-h-8 pl-3 pr-8 text-caption", caret: "right-2.5 size-3.5" },
};
const tones = {
  light: { field: "border border-border-strong bg-card text-primary hover:border-neutral-500", caret: "text-secondary" },
  dark: { field: "bg-neutral-800 text-inverse hover:bg-neutral-700", caret: "text-neutral-300" },
};

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  /** Visible label above the field. Leave out only where the context names it, and pass aria-label. */
  label?: string;
  help?: React.ReactNode;
  size?: keyof typeof sizes;
  tone?: keyof typeof tones;
  /** Classes for the outer wrapper, such as width. */
  wrapperClassName?: string;
};

/** Native select (keyboard and screen readers work as people expect) with the brand caret, evenly inset. */
export function Select({ label, help, size = "md", tone = "light", id, wrapperClassName = "", className = "", children, ...props }: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const s = sizes[size];
  const t = tones[tone];
  const field = (
    <span className={`relative inline-flex ${label ? "w-full" : ""} ${label ? "" : wrapperClassName}`}>
      <select
        id={selectId}
        aria-describedby={help ? `${selectId}-help` : undefined}
        className={`w-full appearance-none truncate rounded-sm transition-colors focus-visible:focus-ring ${s.field} ${t.field} ${className}`}
        {...props}
      >
        {children}
      </select>
      <CaretDown aria-hidden className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${s.caret} ${t.caret}`} />
    </span>
  );
  if (!label) return field;
  return (
    <div className={`flex flex-col gap-2 ${wrapperClassName}`}>
      <label htmlFor={selectId} className="text-body-sm font-medium text-primary">
        {label}
      </label>
      {field}
      {help && (
        <span id={`${selectId}-help`} className="text-body-sm text-secondary">
          {help}
        </span>
      )}
    </div>
  );
}

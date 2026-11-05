"use client";

/** On/off switch with a visible label (or `hideLabel` inside a row that names it). */
export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  hideLabel = false,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  /** The label is said by screen readers only, when the row beside it already names the setting. */
  hideLabel?: boolean;
}) {
  return (
    <label className={`flex justify-between gap-4 ${description ? "items-start" : "items-center"} ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
      <span className={hideLabel ? "sr-only" : "flex flex-col gap-1"}>
        {/* A lone label is regular text; with a description under it, the label reads as a title (medium). */}
        <span className={`text-body ${description ? "font-medium" : ""} ${disabled ? "text-secondary" : "text-primary"}`}>{label}</span>
        {description && <span className="text-body-sm text-secondary">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors focus-visible:focus-ring disabled:opacity-50 ${description ? "mt-1" : ""} ${checked ? "border-primary-600 bg-primary-600" : "border-border-strong bg-neutral-150"}`}
      >
        <span
          className={`inline-block size-5 rounded-full bg-card shadow-sm transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </button>
    </label>
  );
}

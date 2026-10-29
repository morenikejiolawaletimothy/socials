"use client";

/** On/off switch with a visible label. */
export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <label className={`flex items-start justify-between gap-4 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
      <span className="flex flex-col gap-1">
        <span className={`text-body font-medium ${disabled ? "text-secondary" : "text-primary"}`}>{label}</span>
        {description && <span className="text-body-sm text-secondary">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-1 inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors focus-visible:focus-ring disabled:opacity-50 ${checked ? "border-primary-600 bg-primary-600" : "border-border-strong bg-neutral-150"}`}
      >
        <span
          className={`inline-block size-5 rounded-full bg-card shadow-sm transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </button>
    </label>
  );
}

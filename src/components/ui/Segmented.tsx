"use client";

/** Switch between a few views of the same content (for example Feed and Board). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex rounded-md bg-neutral-100 p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`rounded-sm px-4 py-2 text-body-sm font-medium transition-colors focus-visible:focus-ring ${active ? "bg-card text-primary shadow-sm" : "text-secondary hover:text-primary"}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

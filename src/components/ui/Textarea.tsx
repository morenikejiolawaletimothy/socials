import { useId, type TextareaHTMLAttributes } from "react";

/** Multi-line field with a visible label. Same look as Input. */
export function Textarea({
  label,
  help,
  error,
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; help?: React.ReactNode; error?: React.ReactNode }) {
  const id = useId();
  const message = error ?? help;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-body-sm font-medium text-primary">
        {label}
      </label>
      <textarea
        id={id}
        rows={3}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? `${id}-message` : undefined}
        className={`rounded-sm border bg-card px-4 py-3 text-body text-primary shadow-sm placeholder:text-neutral-400 focus-visible:border-primary-600 focus-visible:focus-ring ${error ? "border-danger" : "border-border-strong"} ${className}`}
        {...props}
      />
      {message && (
        <span id={`${id}-message`} className={`text-body-sm ${error ? "text-danger" : "text-secondary"}`}>
          {message}
        </span>
      )}
    </div>
  );
}

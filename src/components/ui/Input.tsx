import { useId, type InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  help?: React.ReactNode;
  /** Plain-words message: name the problem, then the fix. */
  error?: React.ReactNode;
};

/** Text field with a visible label. Placeholder never replaces the label. */
export function Input({ label, help, error, id, className = "", ...props }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-message`;
  const message = error ?? help;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-body-sm font-medium text-primary">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        className={`min-h-11 rounded-sm border bg-card px-4 py-3 text-body text-primary shadow-sm placeholder:text-neutral-400 focus-visible:border-primary-600 focus-visible:focus-ring disabled:border-neutral-300 disabled:text-neutral-300 ${error ? "border-danger" : "border-border-strong"} ${className}`}
        {...props}
      />
      {message && (
        <span
          id={messageId}
          className={`text-body-sm ${error ? "text-danger" : "text-secondary"}`}
        >
          {message}
        </span>
      )}
    </div>
  );
}

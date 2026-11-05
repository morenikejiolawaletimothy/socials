import { useId, type InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  help?: React.ReactNode;
  /** Plain-words message: name the problem, then the fix. */
  error?: React.ReactNode;
};

/**
 * One look for every single-line field (sign-in, sign-up, settings): 44px tall, the same as a md Button and a md Select,
 * so a field and its button line up in a row.
 */
export const fieldClass =
  "h-11 w-full rounded-sm border bg-card px-4 text-body text-primary shadow-sm placeholder:text-neutral-400 focus-visible:border-primary-600 focus-visible:focus-ring disabled:border-neutral-300 disabled:text-neutral-300";

/** Text field with a visible label. Placeholder never replaces the label. */
export function Input({ label, help, error, id, className = "", ...props }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-message`;
  const message = error ?? help;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-body-sm leading-5 font-medium text-primary">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        className={`${fieldClass} ${error ? "border-danger" : "border-border-strong"} ${className}`}
        {...props}
      />
      {message && <FieldMessage id={messageId} error={error} help={help} />}
    </div>
  );
}

/** Under a field: an error as red text (name the problem, then the fix), otherwise help as plain grey text. */
export function FieldMessage({ id, error, help }: { id: string; error?: React.ReactNode; help?: React.ReactNode }) {
  if (error) {
    return (
      <span id={id} className="text-body-sm text-danger">
        {error}
      </span>
    );
  }
  if (!help) return null;
  return (
    <span id={id} className="text-body-sm text-secondary">
      {help}
    </span>
  );
}

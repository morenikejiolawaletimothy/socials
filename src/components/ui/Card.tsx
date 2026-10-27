import type { HTMLAttributes } from "react";

/** Content container: bg-card on bg-page, border hairline, radius-lg, shadow-md, space-6 padding. */
export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-lg border border-border bg-card p-6 shadow-md ${className}`}
      {...props}
    />
  );
}

export function CardTitle({ className = "", ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`mb-2 font-display text-display-xl text-primary ${className}`}
      {...props}
    />
  );
}

export function CardText({ className = "", ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`text-body text-secondary ${className}`} {...props} />;
}

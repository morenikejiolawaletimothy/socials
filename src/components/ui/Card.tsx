import type { HTMLAttributes } from "react";

const paddings = { none: "", sm: "p-2", md: "p-6" };

/** Content container: bg-card on bg-page, border hairline, radius-lg, shadow-md, space-6 padding. */
export function Card({
  className = "",
  padding = "md",
  ...props
}: HTMLAttributes<HTMLDivElement> & { padding?: keyof typeof paddings }) {
  return (
    <div
      className={`rounded-lg border border-border bg-card shadow-md ${paddings[padding]} ${className}`}
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

import type { HTMLAttributes } from "react";
import { InfoTip } from "./InfoTip";

const paddings = { none: "", sm: "p-2", md: "p-6" };

type CardProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  padding?: keyof typeof paddings;
  /** Card title, in a header strip with a divider under it: 18px (display-lg) in every card. */
  title?: React.ReactNode;
  /** Breadcrumbs for the page. Rendered above the card (on the page, under the top bar), not inside it. */
  eyebrow?: React.ReactNode;
  /** One action on the right of the header. */
  action?: React.ReactNode;
  /** Explains how the card works: an info icon beside the title, with the text in a tooltip on hover, focus or tap. */
  info?: React.ReactNode;
};

/** Content container: bg-card on bg-page, hairline border, radius-lg, no shadow (flat, like LinkedIn), space-6 padding. */
export function Card({ className = "", padding = "md", title, eyebrow, action, info, children, ...props }: CardProps) {
  if (title === undefined) {
    return (
      <div className={`rounded-lg border border-border bg-card ${paddings[padding]} ${className}`} {...props}>
        {children}
      </div>
    );
  }
  const hasBody = children !== undefined && children !== null && children !== false;
  return (
    <>
      {eyebrow}
      <section className={`@container overflow-hidden rounded-lg border border-border bg-card ${className}`} {...props}>
        {/* A card with nothing in it (a header only) drops the divider and the empty padded body. */}
        <header className={`flex items-center justify-between gap-4 px-6 py-4 ${hasBody ? "border-b border-border" : ""}`}>
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="font-display text-display-lg text-primary">{title}</h2>
            {info && <InfoTip label={typeof title === "string" ? `About ${title}` : undefined}>{info}</InfoTip>}
          </div>
          {action}
        </header>
        {hasBody && <div className={padding === "md" ? "px-6 py-4" : paddings[padding]}>{children}</div>}
      </section>
    </>
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

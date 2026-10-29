import type { HTMLAttributes } from "react";

const paddings = { none: "", sm: "p-2", md: "p-6" };

type CardProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  padding?: keyof typeof paddings;
  /** Card title, in a header strip with a divider under it: 22px in main cards, 18px in narrow side cards. */
  title?: React.ReactNode;
  /** Small line above the title, such as breadcrumbs. */
  eyebrow?: React.ReactNode;
  /** One action on the right of the header. */
  action?: React.ReactNode;
};

/** Content container: bg-card on bg-page, hairline border, radius-lg, no shadow (flat, like LinkedIn), space-6 padding. */
export function Card({ className = "", padding = "md", title, eyebrow, action, children, ...props }: CardProps) {
  if (title === undefined) {
    return (
      <div className={`rounded-lg border border-border bg-card ${paddings[padding]} ${className}`} {...props}>
        {children}
      </div>
    );
  }
  return (
    <section className={`@container overflow-hidden rounded-lg border border-border bg-card ${className}`} {...props}>
      <header className="flex flex-col gap-2 border-b border-border px-6 py-4">
        {eyebrow}
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-display-lg text-primary @md:text-display-xl">{title}</h2>
          {action}
        </div>
      </header>
      <div className={paddings[padding]}>{children}</div>
    </section>
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

import { Breadcrumbs, type Crumb } from "./Breadcrumbs";

/** Top of every page: optional breadcrumb, title, one line of context and at most one action. */
export function PageHeader({
  title,
  description,
  crumbs,
  action,
}: {
  title: string;
  description?: string;
  crumbs?: Crumb[];
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3">
      {crumbs && <Breadcrumbs items={crumbs} />}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-display-2xl text-primary">{title}</h1>
          {description && <p className="text-body text-secondary">{description}</p>}
        </div>
        {action && <div className="self-start sm:self-auto">{action}</div>}
      </div>
    </header>
  );
}

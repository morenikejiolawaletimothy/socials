import { EmptyState, PageHeader, type Crumb } from "@/components/ui";

/** Batch 1.1 stand-in for pages built in later batches. */
export function Placeholder({
  title,
  description,
  batch,
  flows,
  crumbs,
  children,
}: {
  title: string;
  description?: string;
  batch: string;
  flows: string;
  crumbs?: Crumb[];
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader title={title} description={description} crumbs={crumbs} />
      {children}
      <EmptyState title="Designed in a later batch">
        This page is built in batch {batch} (flows {flows}). The shell and navigation around it are ready for review.
      </EmptyState>
    </div>
  );
}

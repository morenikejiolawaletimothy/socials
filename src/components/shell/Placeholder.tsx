"use client";

import { Columns } from "@/components/layout/Columns";
import { rails, type RailSet } from "@/components/rails";
import { Breadcrumbs, Card, PageHeader, type Crumb } from "@/components/ui";

/**
 * Stand-in for pages built in later batches, laid out in their final columns.
 * Client and manager pages have no page title (like LinkedIn): the first card carries the title.
 */
export function Placeholder({
  title,
  description,
  batch,
  flows,
  crumbs,
  layout,
  children,
}: {
  title: string;
  description?: string;
  batch: string;
  flows: string;
  crumbs?: Crumb[];
  layout?: RailSet;
  children?: React.ReactNode;
}) {
  const note = (
    <p className="text-body-sm text-secondary">
      {description ? `${description} ` : ""}Designed in batch {batch} (flows {flows}).
    </p>
  );

  if (!layout) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={title} description={description} crumbs={crumbs} />
        {children}
        <Card>{note}</Card>
      </div>
    );
  }
  return (
    <Columns {...rails[layout]}>
      <Card title={title} eyebrow={crumbs && <Breadcrumbs items={crumbs} />}>
        <div className="flex flex-col gap-4">
          {children}
          {note}
        </div>
      </Card>
    </Columns>
  );
}

"use client";

import { Columns } from "@/components/layout/Columns";
import { rails, type RailSet } from "@/components/rails";
import { EmptyState, PageHeader, type Crumb } from "@/components/ui";

/** Batch 1.1 stand-in for pages built in later batches, laid out in their final columns. */
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
  const body = (
    <>
      <PageHeader title={title} description={description} crumbs={crumbs} />
      {children}
      <EmptyState title="Designed in a later batch">
        This page is built in batch {batch} (flows {flows}). The shell and navigation around it are ready for review.
      </EmptyState>
    </>
  );
  if (!layout) return <div className="flex flex-col gap-6">{body}</div>;
  return <Columns {...rails[layout]}>{body}</Columns>;
}

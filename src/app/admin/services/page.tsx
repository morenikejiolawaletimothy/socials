"use client";

import { Trash } from "@phosphor-icons/react";
import Link from "next/link";
import { Badge, buttonClass, Card, EmptyState, IconButton, PageHeader, Row, Rows, RowText, textActionClass, useConfirm } from "@/components/ui";
import { act, useData, type Service } from "@/lib/mock";

/** Owner: the services catalog. Included services come with the plan; extra services are quoted and billed off the platform. */
export default function AdminServicesPage() {
  const db = useData();
  const confirm = useConfirm();
  const services = db.services ?? [];
  const included = services.filter((s) => s.bucket === "included");
  const extra = services.filter((s) => s.bucket === "extra");

  const list = (items: Service[]) => (
    <Rows>
      {items.map((s) => (
        <Row key={s.id} className="items-start justify-between gap-4">
          <RowText
            title={
              <span className="flex flex-wrap items-center gap-2">
                {s.name}
                {!s.active && <Badge status="neutral">Hidden</Badge>}
              </span>
            }
            sub={s.description}
          />
          <span className="flex shrink-0 items-center gap-3">
            <Link href={`/admin/services/${s.id}`} className={textActionClass}>
              Edit
            </Link>
            <IconButton
              icon={Trash}
              label={`Remove ${s.name}`}
              tone="danger"
              onClick={() =>
                confirm({
                  title: `Remove ${s.name}?`,
                  body: "It is taken off the catalog, so clients can no longer see or request it.",
                  warning: "This cannot be undone. Add it again to bring it back.",
                  confirmLabel: "Remove",
                  tone: "danger",
                  action: () => act.removeService(s.id),
                  success: `${s.name} removed.`,
                })
              }
            />
          </span>
        </Row>
      ))}
    </Rows>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Services"
        description="What comes with every plan, and the extra services you offer. Extra services are quoted and billed off the platform; the platform only offers them and captures a request."
        action={
          <Link href="/admin/services/new" className={buttonClass("primary")}>
            Add a service
          </Link>
        }
      />

      <Card title="Included with every plan" info="Delivered as part of the client's normal work, at no extra cost.">
        {included.length ? list(included) : <EmptyState title="No included services yet">Add the services that come with every plan.</EmptyState>}
      </Card>

      <Card title="Extra services" info="Offered at the point of need and quoted off the platform. A client request is handed to you; no money is charged here.">
        {extra.length ? list(extra) : <EmptyState title="No extra services yet">Add the services clients can request.</EmptyState>}
      </Card>
    </div>
  );
}

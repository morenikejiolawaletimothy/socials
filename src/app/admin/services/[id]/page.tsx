"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { Button, buttonClass, Card, EmptyState, Input, PageHeader, Select, Switch, Textarea, useTask } from "@/components/ui";
import { act, useData } from "@/lib/mock";

/** Owner: edit a service, on its own page. */
export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const db = useData();
  const { run, pending } = useTask();
  const svc = (db.services ?? []).find((s) => s.id === id);
  const [name, setName] = useState(svc?.name ?? "");
  const [description, setDescription] = useState(svc?.description ?? "");
  const [bucket, setBucket] = useState<"included" | "extra">(svc?.bucket ?? "extra");
  const [active, setActive] = useState(svc?.active ?? true);
  const [error, setError] = useState<string>();

  if (!svc) {
    return (
      <EmptyState title="Service not found" action={<Link href="/admin/services" className={buttonClass("secondary")}>Go to Services</Link>}>
        It may have been removed, or the link is wrong.
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={svc.name} crumbs={[{ label: "Services", href: "/admin/services" }, { label: svc.name }]} />
      <Card title="Service details">
        <div className="flex flex-col gap-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(undefined);
            }}
            error={error}
          />
          <Textarea label="Description" help="One or two lines, as clients will read it." value={description} onChange={(e) => setDescription(e.target.value)} />
          <Select
            label="Type"
            info="Included services come with every plan at no cost, delivered as normal work. Extra services are quoted and billed off the platform."
            value={bucket}
            onChange={(e) => setBucket(e.target.value as "included" | "extra")}
          >
            <option value="extra">Extra, billed off the platform</option>
            <option value="included">Included with every plan</option>
          </Select>
          <div className="border-t border-border pt-4">
            <Switch label="Shown to clients" description="Turn off to hide it from the catalog without removing it." checked={active} onChange={setActive} />
          </div>
          <div className="flex flex-wrap gap-3 border-t border-border pt-6">
            <Button
              loading={pending("save")}
              onClick={async () => {
                if (!name.trim() || !description.trim()) return setError("Add a name and a short description.");
                if (await run("save", () => act.editService(svc.id, { name, description, bucket, active }), "Service saved.")) router.push("/admin/services");
              }}
            >
              {pending("save") ? "Saving" : "Save"}
            </Button>
            <Button variant="cancel" onClick={() => router.push("/admin/services")}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

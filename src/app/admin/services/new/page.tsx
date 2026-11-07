"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Input, PageHeader, Select, Textarea, useTask } from "@/components/ui";
import { act } from "@/lib/mock";

/** Owner: add a service to the catalog, on its own page. */
export default function NewServicePage() {
  const router = useRouter();
  const { run, pending } = useTask();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [bucket, setBucket] = useState<"included" | "extra">("extra");
  const [error, setError] = useState<string>();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Add a service" crumbs={[{ label: "Services", href: "/admin/services" }, { label: "Add a service" }]} />
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
          <div className="flex flex-wrap gap-3 border-t border-border pt-6">
            <Button
              loading={pending("add")}
              onClick={async () => {
                if (!name.trim() || !description.trim()) return setError("Add a name and a short description.");
                if (await run("add", () => act.addService({ name, description, bucket }), `${name.trim()} added to the catalog.`)) router.push("/admin/services");
              }}
            >
              {pending("add") ? "Adding" : "Add service"}
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

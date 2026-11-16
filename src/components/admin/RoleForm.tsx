"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Input, PageHeader, Select, Textarea, useTask } from "@/components/ui";
import type { AdminAccess, AdminArea } from "@/lib/mock";
import { ADMIN_AREAS, emptyAccess } from "@/lib/access";

/** #49: add or edit an admin role, on its own page. */
export function RoleForm({
  mode,
  crumbLabel,
  successMsg,
  initial,
  onSave,
}: {
  mode: "new" | "edit";
  crumbLabel: string;
  successMsg: string;
  initial?: { name: string; description: string; access: Record<AdminArea, AdminAccess> };
  onSave: (data: { name: string; description?: string; access: Record<AdminArea, AdminAccess> }) => Promise<void>;
}) {
  const router = useRouter();
  const { run, pending } = useTask();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [access, setAccess] = useState<Record<AdminArea, AdminAccess>>(initial?.access ?? emptyAccess());
  const [error, setError] = useState<string>();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={mode === "new" ? "Add a role" : crumbLabel} crumbs={[{ label: "Roles & team", href: "/admin/roles" }, { label: mode === "new" ? "Add a role" : crumbLabel }]} />
      <Card title="Role details">
        <div className="flex flex-col gap-4">
          <Input label="Name" value={name} onChange={(e) => { setName(e.target.value); setError(undefined); }} error={error} />
          <Textarea label="Description" help="One line, so the team knows what this role is for." value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex flex-col gap-3">
            <span className="text-body font-medium text-primary">Access</span>
            <div className="flex flex-col divide-y divide-border rounded-md border border-border">
              {ADMIN_AREAS.map((a) => (
                <div key={a.key} className="flex items-center justify-between gap-4 px-4 py-3">
                  <span className="text-body-sm text-primary">{a.label}</span>
                  <Select size="sm" aria-label={`${a.label} access`} value={access[a.key]} onChange={(e) => setAccess({ ...access, [a.key]: e.target.value as AdminAccess })} wrapperClassName="w-36">
                    <option value="none">No access</option>
                    <option value="view">View</option>
                    <option value="manage">Manage</option>
                  </Select>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 border-t border-border pt-6">
            <Button
              loading={pending("save")}
              onClick={async () => {
                if (!name.trim()) return setError("Give the role a name.");
                if (await run("save", () => onSave({ name: name.trim(), description: description.trim() || undefined, access }), successMsg)) router.push("/admin/roles");
              }}
            >
              {pending("save") ? "Saving" : "Save role"}
            </Button>
            <Button variant="cancel" onClick={() => router.push("/admin/roles")}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

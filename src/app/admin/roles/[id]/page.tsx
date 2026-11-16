"use client";

import Link from "next/link";
import { use } from "react";
import { RoleForm } from "@/components/admin/RoleForm";
import { Banner, buttonClass, EmptyState } from "@/components/ui";
import { act, useData } from "@/lib/mock";

export default function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const role = (useData().adminRoles ?? []).find((r) => r.id === id);

  if (!role) {
    return (
      <EmptyState title="Role not found" action={<Link href="/admin/roles" className={buttonClass("secondary")}>Go to Roles & team</Link>}>
        It may have been removed, or the link is wrong.
      </EmptyState>
    );
  }

  if (role.owner) {
    return (
      <div className="flex flex-col gap-6">
        <Banner tone="info" title="The Owner role is protected">
          Owner always has full access and cannot be edited or removed. Create another role to give narrower access.{" "}
          <Link href="/admin/roles" className="font-medium underline">
            Back to Roles &amp; team
          </Link>
        </Banner>
      </div>
    );
  }

  return (
    <RoleForm
      mode="edit"
      crumbLabel={role.name}
      successMsg="Role saved."
      initial={{ name: role.name, description: role.description ?? "", access: role.access }}
      onSave={(d) => act.editRole(role.id, d)}
    />
  );
}

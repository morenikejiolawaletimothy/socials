"use client";

import { RoleForm } from "@/components/admin/RoleForm";
import { act } from "@/lib/mock";

export default function NewRolePage() {
  return <RoleForm mode="new" crumbLabel="Add a role" successMsg="Role added." onSave={(d) => act.addRole(d)} />;
}

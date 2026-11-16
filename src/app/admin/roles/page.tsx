"use client";

import { Trash } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { Avatar, Badge, Button, buttonClass, Card, Dialog, IconButton, PageHeader, Pill, Row, Rows, RowText, TextButton, textActionClass, useConfirm, useTask } from "@/components/ui";
import { fullName } from "@/lib/format";
import { act, useData, type AdminMember, type AdminRole } from "@/lib/mock";
import { ADMIN_AREAS, effectiveAccess } from "@/lib/access";

const statusBadge = {
  active: { label: "Active", tone: "success" as const },
  invited: { label: "Invited", tone: "info" as const },
  deactivated: { label: "Deactivated", tone: "neutral" as const },
};

function roleSummary(role: AdminRole) {
  if (role.owner) return "Full access to everything.";
  const manage = ADMIN_AREAS.filter((a) => role.access[a.key] === "manage").map((a) => a.label);
  const view = ADMIN_AREAS.filter((a) => role.access[a.key] === "view").map((a) => a.label);
  const parts: string[] = [];
  if (manage.length) parts.push(`Manage: ${manage.join(", ")}`);
  if (view.length) parts.push(`View: ${view.join(", ")}`);
  return parts.length ? parts.join(" · ") : "No access yet.";
}

/** #49 Roles & team: the admin team with their roles, and the owner-creatable roles with per-area access. */
export default function RolesPage() {
  const db = useData();
  const confirm = useConfirm();
  const { run, pending } = useTask();
  const roles = db.adminRoles ?? [];
  const members = db.adminMembers ?? [];
  const [assigning, setAssigning] = useState<AdminMember | null>(null);
  const [draft, setDraft] = useState<string[]>([]);
  const memberRoles = (m: AdminMember) => roles.filter((r) => m.roleIds.includes(r.id));
  const nameOf = (userId: string) => fullName(db.users.find((u) => u.id === userId));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Roles & team"
        description="Who is on your admin team, and what each role can see and do. Owner is a protected role with full access that cannot be edited or removed."
        action={
          <Link href="/admin/roles/invite" className={buttonClass("primary")}>
            Invite an admin
          </Link>
        }
      />

      <Card title="Team" info="Each person's access is the most permissive across the roles they hold.">
        <Rows>
          {members.map((m) => {
            const eff = effectiveAccess(memberRoles(m));
            const sb = statusBadge[m.status];
            const canManage = ADMIN_AREAS.filter((a) => eff[a.key] === "manage").map((a) => a.label);
            return (
              <Row key={m.id} className="items-start justify-between gap-4">
                <span className="flex min-w-0 flex-1 items-start gap-3">
                  <Avatar name={nameOf(m.userId)} size="md" />
                  <span className="flex min-w-0 flex-col gap-1.5">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-body font-medium text-primary">{nameOf(m.userId)}</span>
                      <Badge status={sb.tone}>{sb.label}</Badge>
                    </span>
                    <span className="text-body-sm text-secondary">{db.users.find((u) => u.id === m.userId)?.title || db.users.find((u) => u.id === m.userId)?.email}</span>
                    <span className="flex flex-wrap gap-1">
                      {memberRoles(m).map((r) => (
                        <Pill key={r.id}>{r.name}</Pill>
                      ))}
                    </span>
                    <span className="text-caption text-secondary">Can manage: {canManage.join(", ") || "nothing"}</span>
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-2">
                  <TextButton onClick={() => { setAssigning(m); setDraft(m.roleIds); }}>Change roles</TextButton>
                  {m.status === "deactivated" ? (
                    <TextButton onClick={() => run(`s-${m.id}`, () => act.setAdminStatus(m.id, "active"), `${nameOf(m.userId)} reactivated.`)}>Reactivate</TextButton>
                  ) : (
                    <TextButton
                      onClick={() =>
                        confirm({
                          title: `Deactivate ${nameOf(m.userId)}?`,
                          body: "They lose access until you reactivate them.",
                          warning: "The last active Owner cannot be deactivated.",
                          confirmLabel: "Deactivate",
                          tone: "danger",
                          action: () => act.setAdminStatus(m.id, "deactivated"),
                          success: `${nameOf(m.userId)} deactivated.`,
                        })
                      }
                    >
                      Deactivate
                    </TextButton>
                  )}
                </span>
              </Row>
            );
          })}
        </Rows>
      </Card>

      <Card title="Roles">
        <div className="flex flex-col gap-4">
          <Rows>
            {roles.map((r) => (
              <Row key={r.id} className="items-start justify-between gap-4">
                <RowText
                  title={
                    <span className="flex flex-wrap items-center gap-2">
                      {r.name}
                      {r.owner && <Badge status="neutral">Protected</Badge>}
                    </span>
                  }
                  sub={roleSummary(r)}
                />
                <span className="flex shrink-0 items-center gap-3">
                  {r.owner ? (
                    <span className="text-caption text-secondary">Full access</span>
                  ) : (
                    <>
                      <Link href={`/admin/roles/${r.id}`} className={textActionClass}>
                        Edit
                      </Link>
                      <IconButton
                        icon={Trash}
                        label={`Remove ${r.name}`}
                        tone="danger"
                        onClick={() =>
                          confirm({
                            title: `Remove ${r.name}?`,
                            body: "Anyone who has this role loses it.",
                            warning: "This cannot be undone. People left with no role have no access until you give them another.",
                            confirmLabel: "Remove",
                            tone: "danger",
                            action: () => act.removeRole(r.id),
                            success: `${r.name} removed.`,
                          })
                        }
                      />
                    </>
                  )}
                </span>
              </Row>
            ))}
          </Rows>
          <Link href="/admin/roles/new" className={`self-start ${buttonClass("secondary")}`}>
            Add a role
          </Link>
        </div>
      </Card>

      <Dialog
        open={!!assigning}
        onClose={() => setAssigning(null)}
        title={assigning ? `Roles for ${nameOf(assigning.userId)}` : "Roles"}
        info="Give one or more roles. Their access is the most permissive across them. Only an Owner can grant the Owner role."
      >
        <div className="flex flex-col gap-2">
          {roles.map((r) => (
            <label key={r.id} className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors ${draft.includes(r.id) ? "border-primary-600 bg-primary-50" : "border-border hover:border-primary-300"}`}>
              <input
                type="checkbox"
                checked={draft.includes(r.id)}
                onChange={(e) => setDraft((d) => (e.target.checked ? [...d, r.id] : d.filter((x) => x !== r.id)))}
                className="mt-1 size-4 shrink-0 accent-primary-600 focus-visible:focus-ring"
              />
              <span className="flex min-w-0 flex-col">
                <span className="text-body-sm font-medium text-primary">{r.name}</span>
                <span className="text-caption text-secondary">{roleSummary(r)}</span>
              </span>
            </label>
          ))}
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="cancel" onClick={() => setAssigning(null)}>
            Cancel
          </Button>
          <Button
            loading={pending("assign")}
            onClick={async () => {
              if (assigning && (await run("assign", () => act.setMemberRoles(assigning.id, draft), "Roles updated."))) setAssigning(null);
            }}
          >
            Save roles
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

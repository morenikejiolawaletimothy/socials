"use client";

import { useState } from "react";
import { Switch, useConfirm, useTask } from "@/components/ui";
import { act, type Client, type Permissions } from "@/lib/mock";

const items: { key: keyof Permissions; label: string; description: string; offWarning?: string }[] = [
  { key: "post", label: "Post for me", description: "We publish the posts you approve, at the best times.", offWarning: "Scheduled posts are held, and nothing new goes out until you turn this back on." },
  { key: "engage", label: "Like and comment for me", description: "On posts from the people and topics in your strategy.", offWarning: "We stop liking and commenting for you. This week's engagement target will not be met." },
  { key: "companyPage", label: "Post to my company Page", description: "Connect your company Page on LinkedIn to turn this on." },
  { key: "connectionDrafts", label: "Draft connection requests for me to send", description: "We prepare the people and notes. You send them in a few minutes." },
  { key: "profileDrafts", label: "Draft profile updates for me to apply", description: "A better headline or About, ready to paste." },
];

/** C2 "What should we do for you?" Plain switches, saved as they change. Turning off the big ones asks first. */
export function PermissionsForm({ client }: { client: Client }) {
  const confirm = useConfirm();
  const { run } = useTask();
  const [saving, setSaving] = useState<keyof Permissions | null>(null);

  const change = async (i: (typeof items)[number], value: boolean) => {
    const done = `${value ? "Turned on" : "Turned off"} "${i.label}". Your manager is told.`;
    if (!value && i.offWarning) {
      await confirm({
        title: `Turn off "${i.label}"?`,
        body: i.offWarning,
        confirmLabel: "Turn off",
        action: () => act.setPermission(client.id, i.key, false),
        success: done,
      });
      return;
    }
    setSaving(i.key);
    await run(i.key, () => act.setPermission(client.id, i.key, value), done);
    setSaving(null);
  };

  return (
    <ul className="flex flex-col">
      {items.map((i) => (
        <li key={i.key} className="border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0">
          <Switch
            label={i.label}
            description={saving === i.key ? "Saving" : i.description}
            checked={client.permissions[i.key]}
            disabled={saving === i.key || (i.key === "companyPage" && !client.permissions.companyPage)}
            onChange={(v) => change(i, v)}
          />
        </li>
      ))}
    </ul>
  );
}

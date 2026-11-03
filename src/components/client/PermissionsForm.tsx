"use client";

import { useState } from "react";
import { Banner, Switch, useConfirm, useTask } from "@/components/ui";
import { act, type Client, type Permissions } from "@/lib/mock";

const items: { key: keyof Permissions; label: string; description: string; offWarning?: string; group: "do" | "prepare" }[] = [
  { key: "post", group: "do", label: "Prepare posts for me to publish", description: "We write and schedule your posts in your voice. You publish each with one tap at the best time.", offWarning: "We stop preparing posts for you until you turn this back on." },
  { key: "companyPage", group: "do", label: "Post to my company Page", description: "Connect your company Page on LinkedIn to turn this on." },
  {
    key: "engage",
    group: "prepare",
    label: "Prepare reactions, comments, reposts and follows",
    description: "We pick the right posts and people for your goal and write each comment. You do them in seconds from Quick tasks.",
    offWarning: "We stop preparing engagement for you. Your weekly engagement target will be hard to meet.",
  },
  { key: "connectionDrafts", group: "prepare", label: "Prepare connection requests and messages", description: "We pick the people and write the notes. You send them in a few minutes." },
  { key: "profileDrafts", group: "prepare", label: "Prepare profile updates", description: "A better headline or About, ready to paste." },
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

  const list = (group: "do" | "prepare") => (
    <ul className="flex flex-col">
      {items
        .filter((i) => i.group === group)
        .map((i) => (
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

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3" aria-labelledby="perm-do">
        <h3 id="perm-do" className="text-body font-semibold text-primary">
          We do for you
        </h3>
        {list("do")}
      </section>
      <section className="flex flex-col gap-3" aria-labelledby="perm-prepare">
        <h3 id="perm-prepare" className="text-body font-semibold text-primary">
          We prepare, you do in seconds
        </h3>
        <Banner tone="neutral">LinkedIn only lets you react, comment, repost, follow, message and send connection requests from your own account. We get each one ready as a quick task, and your assistant can do them too.</Banner>
        {list("prepare")}
      </section>
    </div>
  );
}

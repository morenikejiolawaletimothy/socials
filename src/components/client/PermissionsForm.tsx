"use client";

import { useState } from "react";
import { Banner, Switch, useConfirm, useTask } from "@/components/ui";
import { act, type Client, type Permissions } from "@/lib/mock";

type Item = { key: keyof Permissions; label: string; description: string; offWarning?: string };

/** Self-serve: we prepare everything, the client does the LinkedIn actions themselves. */
const selfServeItems: Item[] = [
  { key: "post", label: "Draft my posts", description: "We write and schedule your posts in your voice. You publish each one in a tap, at the best time.", offWarning: "We stop preparing posts for you until you turn this back on." },
  { key: "engage", label: "Prepare my reactions, comments, reposts and follows", description: "We pick the right posts and people and write each comment. You do them in seconds from Quick tasks.", offWarning: "We stop preparing engagement for you. Your weekly target will be hard to meet." },
  { key: "connectionDrafts", label: "Prepare my connection requests and messages", description: "We pick the people and write the notes. You send them in a few minutes." },
  { key: "profileDrafts", label: "Prepare my profile updates", description: "A better headline or About, ready for you to paste." },
];

/** Full-service: we do it all. The account manager acts for the client, who approves and is notified. */
const fullServiceItems: Item[] = [
  { key: "post", label: "Post for me", description: "We write, schedule and publish your posts. You approve them first and are told before anything goes out.", offWarning: "We stop posting for you until you turn this back on." },
  { key: "engage", label: "Comment, react, repost and follow for me", description: "We join the right conversations in your voice, within the targets you agree.", offWarning: "We stop engaging for you. Your weekly target will be hard to meet." },
  { key: "connectionDrafts", label: "Send connection requests and messages for me", description: "We reach the right people with notes in your voice." },
  { key: "profileDrafts", label: "Update my profile for me", description: "We keep your headline and About sharp. Profile changes always get your yes first." },
  { key: "companyPage", label: "Run my company Page", description: "Posts, comments and replies on your Page. You add us as an admin on LinkedIn." },
];

/** C2 "What should we do for you?" Plain switches, saved as they change. Framing depends on self-serve vs full-service. */
export function PermissionsForm({ client }: { client: Client }) {
  const confirm = useConfirm();
  const { run } = useTask();
  const [saving, setSaving] = useState<keyof Permissions | null>(null);
  const fullService = client.service === "full-service";
  const items = fullService ? fullServiceItems : selfServeItems;

  const change = async (i: Item, value: boolean) => {
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
    <div className="flex flex-col gap-4">
      <Banner tone="neutral">
        {fullService
          ? "We do these for you, following your rules exactly. You approve your posts and we tell you before anything goes out. Change any of this any time; your manager cannot."
          : "We get each of these ready for you. LinkedIn only lets you act from your own account, so you do them yourself in a tap or two, whenever suits you."}
      </Banner>
      <ul className="flex flex-col">
        {items.map((i) => (
          <li key={i.key} className="border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0">
            <Switch
              label={i.label}
              description={saving === i.key ? "Saving" : i.description}
              checked={client.permissions[i.key]}
              disabled={saving === i.key}
              onChange={(v) => change(i, v)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import { Switch } from "@/components/ui";
import { act, type Client, type Permissions } from "@/lib/mock";

const items: { key: keyof Permissions; label: string; description: string }[] = [
  { key: "post", label: "Post for me", description: "We publish the posts you approve, at the best times." },
  { key: "engage", label: "Like and comment for me", description: "On posts from the people and topics in your strategy." },
  { key: "companyPage", label: "Post to my company Page", description: "Connect your company Page on LinkedIn to turn this on." },
  { key: "connectionDrafts", label: "Draft connection requests for me to send", description: "We prepare the people and notes. You send them in a few minutes." },
  { key: "profileDrafts", label: "Draft profile updates for me to apply", description: "A better headline or About, ready to paste." },
];

/** C2 "What should we do for you?" Plain switches, saved as they change. */
export function PermissionsForm({ client }: { client: Client }) {
  return (
    <ul className="flex flex-col">
      {items.map((i) => (
        <li key={i.key} className="border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0">
          <Switch label={i.label} description={i.description} checked={client.permissions[i.key]} onChange={(v) => act.setPermission(client.id, i.key, v)} />
        </li>
      ))}
    </ul>
  );
}

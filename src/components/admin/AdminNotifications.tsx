"use client";

import { Bell, EnvelopeSimple, WhatsappLogo } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Table, tdFlush } from "@/components/admin/parts";
import { NotificationsPage } from "@/components/shell/NotificationsPage";
import { Card, PageHeader, Pill, Select, Tabs, textActionClass } from "@/components/ui";
import { dayTime, fullName, plural } from "@/lib/format";
import { act, useData } from "@/lib/mock";

type Channel = "in-app" | "email" | "whatsapp";
const channels: Record<Channel, { label: string; icon: typeof Bell }> = {
  "in-app": { label: "In-app", icon: Bell },
  email: { label: "Email", icon: EnvelopeSimple },
  whatsapp: { label: "WhatsApp", icon: WhatsappLogo },
};

/** A short name for the page a message links to, from its path ("/content/review" is "Review posts"). Unknown paths show as they are. */
const pageNames: [RegExp, string][] = [
  [/^\/content\/review/, "Review posts"],
  [/^\/content\/publish/, "Posts to publish"],
  [/^\/content/, "Content"],
  [/^\/tasks\//, "Quick task"],
  [/^\/messages/, "Messages"],
  [/^\/progress\//, "Weekly update"],
  [/^\/control/, "Control"],
  [/^\/contract/, "Contract"],
  [/^\/strategy/, "Strategy"],
  [/^\/home/, "Home"],
  [/^\/manager\/clients\/[^/]+\/content/, "Client content"],
  [/^\/manager\/clients\/[^/]+/, "Client page"],
  [/^\/manager\/messages/, "Messages"],
  [/^\/manager/, "Manager home"],
  [/^\/admin\/money/, "Money"],
  [/^\/admin\/clients/, "Clients"],
  [/^\/admin\/managers/, "Managers"],
  [/^\/admin\/complaints/, "Complaints"],
  [/^\/admin/, "Overview"],
  [/^\/a\//, "Assistant page"],
];
const pageName = (href: string) => pageNames.find(([re]) => re.test(href))?.[1] ?? href;

/** A date field the same size and look as the small filter selects beside it. */
const dateField = "h-10 cursor-pointer rounded-sm border border-border-strong bg-card px-3 text-body-sm text-primary shadow-sm transition-colors hover:border-neutral-500 focus-visible:focus-ring";

/** Every message the product sent, on every channel: when, where, what, to whom, the page it opens, and who or what set it off. */
function MessageLog() {
  const db = useData();
  const router = useRouter();
  const [channel, setChannel] = useState<Channel | "all">("all");
  const [audience, setAudience] = useState<"all" | "client" | "manager" | "owner" | "assistant">("all");
  const [trigger, setTrigger] = useState("all");
  const [period, setPeriod] = useState<"all" | "1" | "7" | "30" | "dates">("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const nameOf = (userId: string) => fullName(db.users.find((u) => u.id === userId));
  const roleOf = (userId?: string) => (userId ? db.users.find((u) => u.id === userId)?.role ?? "assistant" : "assistant");
  const all = [
    ...db.notifications.map((n) => ({ id: n.id, at: n.createdAt, channel: "in-app" as Channel, text: n.text, to: nameOf(n.userId), userId: n.userId as string | undefined, address: "In the app", href: n.href, by: n.by ?? "System" })),
    ...(db.outbox ?? []).map((o) => ({ id: o.id, at: o.at, channel: o.channel as Channel, text: o.text, to: o.to, userId: o.userId, address: o.address, href: o.href, by: o.by ?? "System" })),
  ];
  // The Triggered by options come from the log itself: System first, then each person by name.
  const triggers = ["System", ...[...new Set(all.map((r) => r.by).filter((b) => b !== "System"))].sort()];
  const since = period === "all" ? 0 : period === "dates" ? (from ? new Date(`${from}T00:00`).getTime() : 0) : Date.now() - Number(period) * 86_400_000;
  // "To" includes the whole of that day.
  const until = period === "dates" && to ? new Date(`${to}T23:59:59`).getTime() : Infinity;
  const rows = all
    .filter((r) => channel === "all" || r.channel === channel)
    .filter((r) => audience === "all" || roleOf(r.userId) === audience)
    .filter((r) => trigger === "all" || r.by === trigger)
    .filter((r) => new Date(r.at).getTime() >= since && new Date(r.at).getTime() <= until)
    .sort((a, b) => b.at.localeCompare(a.at));

  // Opens the page as the person saw it: the demo switches to their account first (the demo bar switches back).
  const open = (href: string, userId?: string) => {
    if (userId) act.viewAs(userId);
    router.push(href);
  };

  return (
    <Card
      title="Messages sent"
      padding="none"
      info="Every in-app notification, email and WhatsApp message the product sent. Opens is the page the message takes them to: Open page shows it as that person sees it (use the demo bar to come back). Triggered by is the person whose action sent it; System means it went out on its own (a reminder or a due time)."
      action={<Pill>{plural(rows.length, "message")}</Pill>}
    >
      {/* Filters on their own strip under the header (as on All clients), then the table edge to edge. */}
      <div className="flex flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row sm:flex-wrap sm:items-center">
        <Select size="sm" aria-label="Channel" value={channel} onChange={(e) => setChannel(e.target.value as Channel | "all")}>
          <option value="all">All channels</option>
          {(Object.keys(channels) as Channel[]).map((c) => (
            <option key={c} value={c}>
              {channels[c].label}
            </option>
          ))}
        </Select>
        <Select size="sm" aria-label="Sent to" value={audience} onChange={(e) => setAudience(e.target.value as typeof audience)}>
          <option value="all">Sent to anyone</option>
          <option value="client">Clients</option>
          <option value="manager">Managers</option>
          <option value="owner">Owner</option>
          <option value="assistant">Assistants</option>
        </Select>
        <Select size="sm" aria-label="Triggered by" value={trigger} onChange={(e) => setTrigger(e.target.value)}>
          <option value="all">Triggered by anyone</option>
          {triggers.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
        <Select size="sm" aria-label="When" value={period} onChange={(e) => setPeriod(e.target.value as typeof period)}>
          <option value="all">Any time</option>
          <option value="1">Last 24 hours</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="dates">Pick dates</option>
        </Select>
        {period === "dates" && (
          <span className="flex flex-wrap items-center gap-2">
            <input type="date" aria-label="From" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className={dateField} />
            <span className="text-body-sm text-secondary">to</span>
            <input type="date" aria-label="To" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className={dateField} />
          </span>
        )}
      </div>
      {rows.length ? (
        <Table label="Messages sent" flush head={["When", "Channel", "What", "Sent to", "Opens", "Triggered by"]}>
          {rows.map((r) => {
            const C = channels[r.channel];
            return (
              <tr key={`${r.channel}-${r.id}`}>
                <td className={`${tdFlush} whitespace-nowrap text-secondary`}>{dayTime(r.at)}</td>
                <td className={`${tdFlush} whitespace-nowrap`}>
                  <span className="flex items-center gap-2 text-primary">
                    <C.icon className="size-4 shrink-0 text-primary-600" aria-hidden />
                    {C.label}
                  </span>
                </td>
                <td className={`${tdFlush} min-w-64 text-primary`}>{r.text}</td>
                <td className={tdFlush}>
                  <span className="flex flex-col gap-1">
                    <span className="whitespace-nowrap font-medium text-primary">{r.to}</span>
                    <span className="whitespace-nowrap text-caption text-secondary">{r.address}</span>
                  </span>
                </td>
                <td className={tdFlush}>
                  <span className="flex flex-col gap-1">
                    <span className="whitespace-nowrap text-primary">{pageName(r.href)}</span>
                    <button type="button" onClick={() => open(r.href, r.userId)} className={`${textActionClass} whitespace-nowrap`} title={r.href}>
                      Open page
                    </button>
                  </span>
                </td>
                <td className={`${tdFlush} whitespace-nowrap text-secondary`}>{r.by}</td>
              </tr>
            );
          })}
        </Table>
      ) : (
        <p className="px-6 py-4 text-body-sm text-secondary">No messages match these filters.</p>
      )}
    </Card>
  );
}

/** Owner Notifications: the title, a tab row, then your own notifications or the log of every message sent. */
export function AdminNotifications() {
  const [tab, setTab] = useState<"mine" | "sent">("mine");
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Notifications" />
      {/* Same tab card as the Overview: one card at a time under it. */}
      <div className="rounded-lg border border-border bg-card p-2">
        <Tabs
          label="Notifications sections"
          value={tab}
          onChange={setTab}
          className="max-w-none w-full bg-neutral-50!"
          tabs={[
            { value: "mine", label: "Your notifications" },
            { value: "sent", label: "Messages sent" },
          ]}
        />
      </div>
      {tab === "mine" ? <NotificationsPage /> : <MessageLog />}
    </div>
  );
}

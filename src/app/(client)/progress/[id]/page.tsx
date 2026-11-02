"use client";

import Link from "next/link";
import { use } from "react";
import { reportActivity } from "@/components/client/reportActivity";
import { PostPreview } from "@/components/content/PostPreview";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Avatar, Breadcrumbs, Card, EmptyState, Pill, TextButton, Tile, buttonClass } from "@/components/ui";
import { ago, agoIn, day, fullName } from "@/lib/format";
import { useMyClient } from "@/lib/mock";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2 border-t border-border pt-6">
      <h3 className="font-display text-display-lg text-primary">{title}</h3>
      {children}
    </section>
  );
}

/** C9 A weekly or monthly update, as a readable post. Download as PDF prints it. */
export default function UpdatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { updates, posts, user, managerUser, activity } = useMyClient();
  const u = updates.find((x) => x.id === id);

  if (!u) {
    return (
      <Columns {...rails.clientMain}>
        <EmptyState title="Update not found" action={<Link href="/progress" className={buttonClass("secondary")}>Go to Progress</Link>}>It may have been removed.</EmptyState>
      </Columns>
    );
  }
  const best = posts.filter((p) => u.best.includes(p.id));
  const done = reportActivity(u, activity);
  const who = { you: "You", team: managerUser?.firstName ? `${managerUser.firstName}, for you` : "Your team, for you", system: "Bluecut" };

  return (
    <Columns {...rails.clientMain}>
      <Card
        title={u.title}
        eyebrow={<Breadcrumbs items={[{ label: "Progress", href: "/progress" }, { label: u.title }]} />}
        action={<TextButton onClick={() => window.print()}>Download as PDF</TextButton>}
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            {managerUser && <Avatar name={fullName(managerUser)} size="sm" />}
            <span className="text-body-sm text-secondary">
              {[`From ${fullName(managerUser) || "your account team"}`, u.sentAt ? ago(u.sentAt) : "Draft", u.periodLabel, u.correctedAt ? `Corrected ${agoIn(u.correctedAt)}` : null].filter(Boolean).join(" · ")}
            </span>
          </div>
          <p className="font-display text-display-xl text-primary">{u.headline}</p>

          <Section title="What we did against the plan">
            <table className="w-full text-left text-body-sm">
              <thead className="text-caption text-secondary">
                <tr>
                  <th className="py-2 font-medium">Work</th>
                  <th className="py-2 font-medium">Planned</th>
                  <th className="py-2 font-medium">Done</th>
                </tr>
              </thead>
              <tbody>
                {u.did.map((d) => (
                  <tr key={d.label} className="border-t border-border">
                    <td className="py-3 text-primary">{d.label}</td>
                    <td className="py-3 text-secondary">{d.target}</td>
                    <td className={`py-3 font-medium ${d.done >= d.target ? "text-success" : "text-primary"}`}>{d.done}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title={`Everything done ${u.kind === "monthly" ? "this month" : "this week"}`}>
            <p className="text-body-sm text-secondary">
              Every action on your account in this period, by you and by {managerUser?.firstName ?? "your team"} for you. You can check each one on LinkedIn.
            </p>
            {done.total === 0 ? (
              <p className="text-body-sm text-secondary">Nothing recorded in this period.</p>
            ) : (
              <div className="mt-2 flex flex-col gap-6">
                {done.groups.map((g) => (
                  <div key={g.label} className="flex flex-col gap-2">
                    <h4 className="flex items-center justify-between gap-3 text-body font-medium text-primary">
                      {g.label}
                      <Pill label={`${g.label}: ${g.items.length}`}>{g.items.length}</Pill>
                    </h4>
                    <ul className="flex flex-col rounded-md border border-border">
                      {g.items.map((a) => (
                        <li key={a.id} className="flex items-start justify-between gap-4 border-b border-border px-4 py-3 last:border-b-0">
                          <span className="flex min-w-0 flex-col gap-1">
                            <span className="text-body-sm text-primary">{a.text}</span>
                            <span className="text-caption text-secondary">{who[a.who]}</span>
                          </span>
                          <span className="shrink-0 text-caption text-secondary">{day(a.at)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Progress toward your goal">
            <p className="text-body text-primary">{u.progress}</p>
            {u.results?.length ? (
              <ul className="flex list-disc flex-col gap-1 pl-5 text-body-sm text-primary">
                {u.results.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            ) : null}
          </Section>

          {best.length > 0 && (
            <Section title="Best posts">
              <div className="flex flex-col gap-4">
                {best.map((p) => (
                  <Tile key={p.id}>
                    <PostPreview post={p} author={{ name: fullName(user), title: user?.title }} meta={p.publishedAt ? ago(p.publishedAt) : ""} />
                  </Tile>
                ))}
              </div>
            </Section>
          )}

          {u.held.length > 0 && (
            <Section title="Held back, and why">
              <ul className="flex list-disc flex-col gap-1 pl-5 text-body-sm text-primary">
                {u.held.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </Section>
          )}

          {u.field && (
            <Section title="What is happening in your field">
              <p className="text-body text-primary">{u.field}</p>
            </Section>
          )}

          {u.next && (
            <Section title="Next week">
              <p className="text-body text-primary">{u.next}</p>
            </Section>
          )}

          {u.note && (
            <Section title={`A note from ${managerUser?.firstName ?? "your manager"}`}>
              <p className="rounded-md bg-primary-50 p-4 text-body text-primary">{u.note}</p>
            </Section>
          )}
        </div>
      </Card>
    </Columns>
  );
}

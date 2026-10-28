"use client";

import { use } from "react";
import { PostPreview } from "@/components/content/PostPreview";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Avatar, Breadcrumbs, Button, Card, EmptyState } from "@/components/ui";
import { ago, fullName } from "@/lib/format";
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
  const { updates, posts, user, managerUser } = useMyClient();
  const u = updates.find((x) => x.id === id);

  if (!u) {
    return (
      <Columns {...rails.clientMain}>
        <EmptyState title="Update not found">It may have been removed. All your updates are on Progress.</EmptyState>
      </Columns>
    );
  }
  const best = posts.filter((p) => u.best.includes(p.id));

  return (
    <Columns {...rails.clientMain}>
      <Card
        title={u.title}
        eyebrow={<Breadcrumbs items={[{ label: "Progress", href: "/progress" }, { label: u.title }]} />}
        action={
          <Button variant="secondary" onClick={() => window.print()}>
            Download as PDF
          </Button>
        }
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            {managerUser && <Avatar name={fullName(managerUser)} size="sm" />}
            <span className="text-body-sm text-secondary">
              From {fullName(managerUser) || "your account team"}, {u.sentAt ? ago(u.sentAt) : "draft"}. {u.periodLabel}.
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
                  <div key={p.id} className="rounded-md border border-border p-4">
                    <PostPreview post={p} author={{ name: fullName(user), title: user?.title }} meta={p.publishedAt ? ago(p.publishedAt) : ""} />
                  </div>
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

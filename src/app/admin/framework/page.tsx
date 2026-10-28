"use client";

import { useState } from "react";
import { Badge, Button, Card, PageHeader, Tabs, Textarea, useToast } from "@/components/ui";
import { date } from "@/lib/format";
import { act, useData, type FrameworkItem } from "@/lib/mock";

const sections: { value: FrameworkItem["section"]; label: string }[] = [
  { value: "linkedin", label: "What works on LinkedIn" },
  { value: "templates", label: "Strategy templates" },
  { value: "topics", label: "Topic models" },
  { value: "formats", label: "Post formats" },
  { value: "tone", label: "Tone rules" },
  { value: "banned", label: "Banned phrases" },
  { value: "checks", label: "Quality checks" },
  { value: "industry", label: "Industry rules" },
];

function Item({ item }: { item: FrameworkItem }) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(item.body);
  return (
    <li className="flex flex-col gap-2 border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0">
      <span className="flex items-center justify-between gap-3">
        <span className="text-body font-medium text-primary">{item.title}</span>
        {!editing && (
          <button type="button" onClick={() => setEditing(true)} className="rounded-sm text-body-sm font-medium text-primary-600 hover:underline focus-visible:focus-ring">
            Edit
          </button>
        )}
      </span>
      {editing ? (
        <div className="flex flex-col gap-3">
          <Textarea label={item.title} rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={async () => {
                await act.saveFrameworkItem(item.id, body);
                setEditing(false);
                toast("Saved to the draft. Publish a new version to use it.");
              }}
            >
              Save
            </Button>
            <Button variant="ghost" onClick={() => { setBody(item.body); setEditing(false); }}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-body-sm text-secondary">{item.body}</p>
      )}
      <span className="text-caption text-secondary">Updated {date(item.updatedAt)}</span>
    </li>
  );
}

/** A4 Framework: the owner's method, written down, versioned. Every manager and every proposal follows it. */
export default function FrameworkPage() {
  const db = useData();
  const toast = useToast();
  const [section, setSection] = useState<FrameworkItem["section"]>("linkedin");
  const current = db.frameworkVersions[0];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Framework"
        description={`Your method, used by every manager and every proposal. In use: ${current.version}.`}
        action={<Button onClick={() => toast("Version v4 published. New strategies are built on it.")}>Publish new version</Button>}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card padding="none" className="lg:col-span-2">
          <div className="px-6 pt-2">
            <Tabs label="Framework sections" value={section} onChange={setSection} tabs={sections} />
          </div>
          <ul className="flex flex-col p-6">
            {db.framework
              .filter((f) => f.section === section)
              .map((f) => (
                <Item key={f.id} item={f} />
              ))}
            {!db.framework.some((f) => f.section === section) && <li className="text-body-sm text-secondary">Nothing here yet.</li>}
          </ul>
        </Card>
        <Card title="Versions">
          <ul className="flex flex-col gap-4">
            {db.frameworkVersions.map((v, i) => (
              <li key={v.version} className="flex flex-col gap-1">
                <span className="flex items-center gap-2">
                  <span className="text-body-sm font-medium text-primary">{v.version}</span>
                  {i === 0 && <Badge status="success">In use</Badge>}
                </span>
                <span className="text-body-sm text-secondary">{v.note}</span>
                <span className="text-caption text-secondary">{date(v.at)}</span>
              </li>
            ))}
          </ul>
          <p className="pt-4 text-caption text-secondary">Each client&apos;s strategy records the version it was built on.</p>
        </Card>
      </div>
    </div>
  );
}

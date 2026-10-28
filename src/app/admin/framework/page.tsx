"use client";

import { Plus, Trash } from "@phosphor-icons/react";
import { useState } from "react";
import { Badge, Button, Card, Dialog, Input, PageHeader, Tabs, Textarea, useConfirm, useTask } from "@/components/ui";
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
  const confirm = useConfirm();
  const { run, pending } = useTask();
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(item.body);
  return (
    <li className="flex flex-col gap-2 border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0">
      <span className="flex items-center justify-between gap-3">
        <span className="text-body font-medium text-primary">{item.title}</span>
        {!editing && (
          <span className="flex items-center gap-1">
            <button type="button" onClick={() => setEditing(true)} className="rounded-sm px-2 text-body-sm font-medium text-primary-600 hover:underline focus-visible:focus-ring">
              Edit
            </button>
            <button
              type="button"
              aria-label={`Delete ${item.title}`}
              onClick={() =>
                confirm({
                  title: `Delete "${item.title}"?`,
                  body: "It is removed from the draft. Strategies already built keep the version they were built on.",
                  warning: "New proposals stop following it once you publish the next version.",
                  confirmLabel: "Delete",
                  tone: "danger",
                  action: () => act.deleteFrameworkItem(item.id),
                  success: `"${item.title}" deleted. Publish a new version to apply it.`,
                })
              }
              className="flex size-9 items-center justify-center rounded-full text-secondary hover:bg-danger-bg hover:text-danger focus-visible:focus-ring"
            >
              <Trash className="size-4" aria-hidden />
            </button>
          </span>
        )}
      </span>
      {editing ? (
        <div className="flex flex-col gap-3">
          <Textarea label={item.title} rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={!body.trim() || body === item.body}
              loading={pending("save")}
              onClick={async () => {
                if (await run("save", () => act.saveFrameworkItem(item.id, body), "Saved to the draft. Publish a new version to use it.")) setEditing(false);
              }}
            >
              Save
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setBody(item.body);
                setEditing(false);
              }}
            >
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
  const { run, pending } = useTask();
  const [section, setSection] = useState<FrameworkItem["section"]>("linkedin");
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string>();
  const current = db.frameworkVersions[0];
  const label = sections.find((s) => s.value === section)?.label ?? "";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Framework"
        description={`Your method, used by every manager and every proposal. In use: ${current.version}.`}
        action={<Button onClick={() => setPublishing(true)}>Publish new version</Button>}
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
          <div className="border-t border-border px-6 py-4">
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-1 rounded-sm text-body-sm font-medium text-primary-600 hover:underline focus-visible:focus-ring"
            >
              <Plus className="size-4" aria-hidden /> Add to {label.toLowerCase()}
            </button>
          </div>
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

      <Dialog open={adding} onClose={() => setAdding(false)} title={`Add to ${label.toLowerCase()}`}>
        <Input
          label="Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError(undefined);
          }}
          error={error}
        />
        <Textarea label="The rule or guidance" rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setAdding(false)}>
            Cancel
          </Button>
          <Button
            loading={pending("add")}
            onClick={async () => {
              if (!title.trim() || !body.trim()) return setError("Add a title and the guidance.");
              if (await run("add", () => act.addFrameworkItem(section, title.trim(), body.trim()), "Added to the draft. Publish a new version to use it.")) {
                setAdding(false);
                setTitle("");
                setBody("");
              }
            }}
          >
            Add
          </Button>
        </div>
      </Dialog>

      <Dialog open={publishing} onClose={() => setPublishing(false)} title={`Publish v${Number(current.version.slice(1)) + 1}?`}>
        <p className="text-body-sm text-secondary">Every new strategy and proposal follows it from now on. Strategies already approved keep their version until their next review.</p>
        <Textarea label="What changed" rows={2} value={note} onChange={(e) => setNote(e.target.value)} help="Managers see this note." />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setPublishing(false)}>
            Cancel
          </Button>
          <Button
            disabled={!note.trim()}
            loading={pending("publish")}
            onClick={async () => {
              if (await run("publish", () => act.publishFramework(note.trim()), "Published. New strategies are built on it, and managers are told.")) {
                setPublishing(false);
                setNote("");
              }
            }}
          >
            Publish
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

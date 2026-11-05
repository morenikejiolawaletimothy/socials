"use client";

import { CalendarBlank, Plus } from "@phosphor-icons/react";
import { useState } from "react";
import { Badge, Button, Card, Dialog, Input, Meta, PageHeader, Pill, Row, Rows, Tabs, Textarea, Tile, TileFooter, textActionClass, useConfirm, useTask } from "@/components/ui";
import { date, plural } from "@/lib/format";
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
    <li>
      <Tile>
        <span className="text-body font-medium text-primary">{item.title}</span>
        {editing ? (
          <div className="flex flex-col gap-3">
            <Textarea label={item.title} rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={!body.trim() || body === item.body}
                loading={pending("save")}
                onClick={async () => {
                  if (await run("save", () => act.saveFrameworkItem(item.id, body), "Saved to the draft. Publish a new version to use it.")) setEditing(false);
                }}
              >
                Save
              </Button>
              <Button
                variant="cancel"
                size="sm"
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
        <TileFooter>
          <Meta icon={CalendarBlank}>Updated {date(item.updatedAt)}</Meta>
          {!editing && (
            <span className="flex items-center gap-2">
              <Button
                variant="remove"
                size="sm"
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
              >
                Delete
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                Edit
              </Button>
            </span>
          )}
        </TileFooter>
      </Tile>
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
  const items = db.framework.filter((f) => f.section === section);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Framework"
        action={<Button onClick={() => setPublishing(true)}>Publish new version</Button>}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Same tab card as the Overview: the tab row on its own, then the picked section's card under it. */}
          <div className="rounded-lg border border-border bg-card p-2">
            <Tabs label="Framework sections" value={section} onChange={setSection} tabs={sections} className="max-w-none w-full bg-neutral-50!" />
          </div>
          <Card title={label} padding="none" action={<Pill>{plural(items.length, "item")}</Pill>}>
            <ul className="flex flex-col gap-3 p-6">
              {items.map((f) => (
                <Item key={f.id} item={f} />
              ))}
              {!items.length && <li className="text-body-sm text-secondary">Nothing here yet.</li>}
            </ul>
            <div className="border-t border-border px-6 py-4">
              <button type="button" onClick={() => setAdding(true)} className={textActionClass}>
                <Plus className="size-4" aria-hidden /> Add to {label.toLowerCase()}
              </button>
            </div>
          </Card>
        </div>
        <Card title="Versions" padding="none" className="self-start" action={<Pill>{plural(db.frameworkVersions.length, "version")}</Pill>} info="Each client's strategy records the version it was built on.">
          {/* Edge to edge, newest first: the version in a light-blue square, what changed and when beside it, In use on the right. */}
          <Rows flush label="Versions">
            {db.frameworkVersions.map((v, i) => (
              <Row key={v.version} className="flex-nowrap items-start">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-body-sm font-medium text-primary-700">{v.version}</span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-body-sm text-primary">{v.note}</span>
                  <span className="text-caption text-secondary">{date(v.at)}</span>
                </span>
                {i === 0 && <Badge status="success">In use</Badge>}
              </Row>
            ))}
          </Rows>
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
          <Button variant="cancel" onClick={() => setAdding(false)}>
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

      <Dialog
        open={publishing}
        onClose={() => setPublishing(false)}
        title={`Publish v${Number(current.version.slice(1)) + 1}?`}
        info="Every new strategy and proposal follows it from now on. Strategies already approved keep their version until their next review."
      >
        <Textarea label="What changed" rows={2} value={note} onChange={(e) => setNote(e.target.value)} help="Managers see this note." />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="cancel" onClick={() => setPublishing(false)}>
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

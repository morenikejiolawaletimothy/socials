"use client";

import { FileText, PencilSimple, Plus, Sparkle, Trash, UploadSimple, X } from "@phosphor-icons/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Badge, Button, Card, Dialog, Input, Textarea, useConfirm, useTask, useToast } from "@/components/ui";
import { agoIn, date } from "@/lib/format";
import { act, useMyClient, type BrandFile, type OffLimit } from "@/lib/mock";

const linkButton = "rounded-sm text-body-sm font-medium text-primary-600 hover:text-primary-700 hover:underline focus-visible:focus-ring";
const iconButton = "flex size-9 shrink-0 items-center justify-center rounded-full text-secondary hover:bg-danger-bg hover:text-danger focus-visible:focus-ring";
const offKinds: { value: OffLimit["kind"]; label: string }[] = [
  { value: "topic", label: "Topic" },
  { value: "person", label: "Person" },
  { value: "company", label: "Company" },
  { value: "interaction", label: "Interaction" },
];
const momentStatus = { new: { label: "Sent to your manager", tone: "info" as const }, seen: { label: "Seen", tone: "neutral" as const }, "post-drafted": { label: "Post drafted", tone: "success" as const } };
const limits = { photos: { types: "image/png,image/jpeg,image/webp", label: "JPG, PNG or WebP, up to 10 MB" }, logos: { types: "image/png,image/svg+xml", label: "PNG or SVG, up to 10 MB" }, documents: { types: ".pdf,.doc,.docx,.ppt,.pptx", label: "PDF, Word or PowerPoint, up to 25 MB" } };

/** Upload button: inline message for the wrong type or size, a spinner while it uploads, a toast when done. */
function Upload({ clientId, section }: { clientId: string; section: BrandFile["section"] }) {
  const ref = useRef<HTMLInputElement>(null);
  const { run, pending } = useTask();
  const [error, setError] = useState<string>();
  const max = section === "documents" ? 25 : 10;
  const accepted = limits[section].types.split(",");
  return (
    <div className="flex flex-col items-end gap-1">
      <input
        ref={ref}
        type="file"
        accept={limits[section].types}
        className="sr-only"
        tabIndex={-1}
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          const ext = `.${f.name.split(".").pop()?.toLowerCase()}`;
          if (!accepted.includes(f.type) && !accepted.includes(ext)) return setError(`That type of file is not allowed here. Use ${limits[section].label}.`);
          if (f.size > max * 1024 * 1024) return setError(`That file is over ${max} MB. Use ${limits[section].label}.`);
          setError(undefined);
          await run("upload", () => act.addBrandFile(clientId, section, f.name, `${(f.size / 1024 / 1024).toFixed(1)} MB`, section === "photos" ? "/landing/statement-1.jpg" : undefined), `${f.name} uploaded.`);
        }}
      />
      <button type="button" disabled={pending("upload")} onClick={() => ref.current?.click()} className={`${linkButton} inline-flex items-center gap-1`}>
        <UploadSimple className={`size-4 ${pending("upload") ? "animate-pulse" : ""}`} aria-hidden /> {pending("upload") ? "Uploading" : "Add"}
      </button>
      {error && <span className="max-w-60 text-right text-caption text-danger">{error}</span>}
    </div>
  );
}

/** One off-limits line: edit in place, or remove after a warning (with Undo). */
function OffLimitRow({ clientId, item }: { clientId: string; item: OffLimit }) {
  const confirm = useConfirm();
  const toast = useToast();
  const { run, pending } = useTask();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(item.text);
  return (
    <li className="flex items-center gap-3 border-b border-border py-3 last:border-b-0">
      <span className="w-24 shrink-0 text-caption text-secondary">{offKinds.find((k) => k.value === item.kind)?.label}</span>
      {editing ? (
        <form
          className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!text.trim()) return;
            if (await run("edit", () => act.editOffLimit(clientId, item.id, text.trim()), "Off limits updated. Your manager is told.")) setEditing(false);
          }}
        >
          <label className="flex-1">
            <span className="sr-only">Edit</span>
            <input value={text} onChange={(e) => setText(e.target.value)} className="min-h-10 w-full rounded-sm border border-border-strong px-3 text-body-sm text-primary focus-visible:border-primary-600 focus-visible:focus-ring" />
          </label>
          <span className="flex gap-2">
            <Button type="submit" variant="secondary" loading={pending("edit")}>
              Save
            </Button>
            <Button variant="ghost" onClick={() => { setText(item.text); setEditing(false); }}>
              Cancel
            </Button>
          </span>
        </form>
      ) : (
        <>
          <span className="flex-1 text-body-sm text-primary">{item.text}</span>
          <button type="button" aria-label={`Edit ${item.text}`} onClick={() => setEditing(true)} className="flex size-9 shrink-0 items-center justify-center rounded-full text-secondary hover:bg-primary-50 hover:text-primary-700 focus-visible:focus-ring">
            <PencilSimple className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label={`Remove ${item.text}`}
            onClick={async () => {
              const ok = await confirm({
                title: "Remove from off limits?",
                body: <>We will no longer avoid &ldquo;{item.text}&rdquo; in posts and comments.</>,
                warning: "Posts and comments may mention it from now on. Your manager is told.",
                confirmLabel: "Remove",
                tone: "danger",
                action: () => act.removeOffLimit(clientId, item.id),
              });
              if (ok) toast("Removed from off limits.", "success", { action: { label: "Undo", onClick: () => act.restoreOffLimit(clientId, item) } });
            }}
            className={iconButton}
          >
            <X className="size-4" aria-hidden />
          </button>
        </>
      )}
    </li>
  );
}

/** C15 Your brand: everything that makes content sound and look like the client. The manager uses it for every post. */
export default function BrandPage() {
  const { client, brand, files, moments } = useMyClient();
  const confirm = useConfirm();
  const { run, pending } = useTask();
  const [momentOpen, setMomentOpen] = useState(false);
  const [momentNote, setMomentNote] = useState("");
  const [momentError, setMomentError] = useState<string>();
  const [offKind, setOffKind] = useState<OffLimit["kind"]>("topic");
  const [offText, setOffText] = useState("");
  const [offError, setOffError] = useState<string>();
  const [editingVoice, setEditingVoice] = useState(false);
  const [voice, setVoice] = useState(brand?.voice ?? "");
  const [wordsIn, setWordsIn] = useState(brand?.wordsUse.join(", ") ?? "");
  const [avoid, setAvoid] = useState(brand?.wordsAvoid.join(", ") ?? "");
  const [colour, setColour] = useState("");
  const [colourError, setColourError] = useState<string>();
  if (!client || !brand) return null;

  const photos = files.filter((f) => f.section === "photos");
  const logos = files.filter((f) => f.section === "logos");
  const docs = files.filter((f) => f.section === "documents");
  const split = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
  const removeFile = (f: BrandFile) =>
    confirm({
      title: `Remove ${f.name}?`,
      body: "Your manager will no longer be able to use it. Posts that already use it are not changed.",
      warning: "You cannot undo this. You would need to upload it again.",
      confirmLabel: "Remove",
      tone: "danger",
      action: () => act.removeBrandFile(f.id),
      success: `${f.name} removed.`,
    });

  return (
    <Columns {...rails.clientSettings}>
      <Card
        title="Moments"
        action={
          <button type="button" onClick={() => setMomentOpen(true)} className={`${linkButton} inline-flex items-center gap-1`}>
            <Plus className="size-4" aria-hidden /> Add a Moment
          </button>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-body-sm text-secondary">Something you want a post about, like an event you spoke at or a milestone. Add a note and photos. Your manager is told at once.</p>
          <ul className="flex flex-col gap-4">
            {moments.map((m) => (
              <li key={m.id} className="flex flex-col gap-3 rounded-md border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-body-sm text-primary">{m.note}</p>
                  <Badge status={momentStatus[m.status].tone}>{momentStatus[m.status].label}</Badge>
                </div>
                {m.photos.length > 0 && (
                  <div className="flex gap-2">
                    {m.photos.map((p) => (
                      <span key={p} className="relative size-16 overflow-hidden rounded-sm">
                        <Image src={p} alt="" fill sizes="64px" className="object-cover" />
                      </span>
                    ))}
                  </div>
                )}
                <span className="flex items-center justify-between gap-3">
                  <span className="text-caption text-secondary">Added {agoIn(m.at)}</span>
                  <button
                    type="button"
                    onClick={() =>
                      confirm({
                        title: "Remove this Moment?",
                        body: m.status === "post-drafted" ? "Your manager has already drafted a post from it. The draft is kept until you review it." : "Your manager will no longer see it.",
                        confirmLabel: "Remove",
                        tone: "danger",
                        action: () => act.deleteMoment(m.id),
                        success: "Moment removed.",
                      })
                    }
                    className={linkButton}
                  >
                    Remove
                  </button>
                </span>
              </li>
            ))}
            {moments.length === 0 && <li className="text-body-sm text-secondary">No Moments yet. Add one when something happens you want a post about.</li>}
          </ul>
        </div>
      </Card>

      <Card title="Off limits">
        <div className="flex flex-col gap-4">
          <p className="text-body-sm text-secondary">What we never post, comment on or engage with. We check every post and every comment against this list.</p>
          <ul className="flex flex-col">
            {brand.offLimits.map((o) => (
              <OffLimitRow key={o.id} clientId={client.id} item={o} />
            ))}
            {brand.offLimits.length === 0 && <li className="py-2 text-body-sm text-secondary">Nothing yet. Add anything we should never touch.</li>}
          </ul>
          <form
            noValidate
            className="flex flex-col gap-3 rounded-md bg-neutral-25 p-4 sm:flex-row sm:items-start"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!offText.trim()) return setOffError("Write what to avoid.");
              if (brand.offLimits.some((o) => o.text.toLowerCase() === offText.trim().toLowerCase())) return setOffError("That is already on your list.");
              setOffError(undefined);
              if (await run("off", () => act.addOffLimit(client.id, offKind, offText.trim()), "Added to off limits. Your manager is told.")) setOffText("");
            }}
          >
            <label className="flex flex-col gap-2">
              <span className="text-body-sm font-medium text-primary">Kind</span>
              <select value={offKind} onChange={(e) => setOffKind(e.target.value as OffLimit["kind"])} className="min-h-11 rounded-sm border border-border-strong bg-card px-3 text-body text-primary focus-visible:focus-ring">
                {offKinds.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex-1">
              <Input label="What to avoid" placeholder="For example: never comment on politics" value={offText} onChange={(e) => { setOffText(e.target.value); setOffError(undefined); }} error={offError} />
            </div>
            <Button type="submit" variant="secondary" className="sm:mt-7" loading={pending("off")}>
              Add
            </Button>
          </form>
        </div>
      </Card>

      <Card
        title="Your voice"
        action={
          !editingVoice && (
            <button type="button" onClick={() => setEditingVoice(true)} className={linkButton}>
              Edit
            </button>
          )
        }
      >
        {editingVoice ? (
          <form
            className="flex flex-col gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (await run("voice", () => act.saveVoice(client.id, voice, split(wordsIn), split(avoid)), "Your voice is saved. Your manager uses it for every post.")) setEditingVoice(false);
            }}
          >
            <Textarea label="How you like to sound" value={voice} onChange={(e) => setVoice(e.target.value)} />
            <Input label="Words you use" help="Separate with commas." value={wordsIn} onChange={(e) => setWordsIn(e.target.value)} />
            <Input label="Words you avoid" help="Separate with commas." value={avoid} onChange={(e) => setAvoid(e.target.value)} />
            <div className="flex gap-2">
              <Button type="submit" loading={pending("voice")}>
                {pending("voice") ? "Saving" : "Save"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setVoice(brand.voice);
                  setWordsIn(brand.wordsUse.join(", "));
                  setAvoid(brand.wordsAvoid.join(", "));
                  setEditingVoice(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-body text-primary">{brand.voice || "Not written yet. Your manager fills this in after your goals call, and you can change it."}</p>
            {[
              ["Words you use", brand.wordsUse, "bg-success-bg"],
              ["Words you avoid", brand.wordsAvoid, "bg-danger-bg"],
            ].map(([label, words, bg]) => (
              <div key={label as string} className="flex flex-col gap-2">
                <span className="text-caption text-secondary">{label as string}</span>
                <ul className="flex flex-wrap gap-2">
                  {(words as string[]).map((w) => (
                    <li key={w} className={`rounded-full px-3 py-1 text-body-sm text-primary ${bg}`}>
                      {w}
                    </li>
                  ))}
                  {!(words as string[]).length && <li className="text-body-sm text-secondary">None yet</li>}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Photos" action={<Upload clientId={client.id} section="photos" />}>
        {photos.length ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {photos.map((f) => (
              <li key={f.id} className="group relative aspect-square overflow-hidden rounded-md bg-neutral-100">
                {f.src && <Image src={f.src} alt={f.name} fill sizes="200px" className="object-cover" />}
                <button
                  type="button"
                  aria-label={`Remove ${f.name}`}
                  onClick={() => removeFile(f)}
                  className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full bg-card text-secondary shadow-md transition-opacity hover:text-danger focus-visible:opacity-100 focus-visible:focus-ring sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <Trash className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body-sm text-secondary">Add headshots and photos of you at work. Your manager uses them in posts.</p>
        )}
        <p className="pt-3 text-caption text-secondary">{limits.photos.label}.</p>
      </Card>

      <Card title="Logos and colours" action={<Upload clientId={client.id} section="logos" />}>
        <div className="flex flex-col gap-4">
          {logos.map((f) => (
            <div key={f.id} className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-md bg-primary-50">
                <Sparkle className="size-6 text-primary-600" aria-hidden />
              </span>
              <span className="flex flex-1 flex-col">
                <span className="text-body-sm font-medium text-primary">{f.name}</span>
                <span className="text-caption text-secondary">{f.size}</span>
              </span>
              <button type="button" aria-label={`Remove ${f.name}`} onClick={() => removeFile(f)} className={iconButton}>
                <Trash className="size-4" aria-hidden />
              </button>
            </div>
          ))}
          <ul className="flex flex-wrap gap-3" aria-label="Brand colours">
            {brand.colours.map((c) => (
              <li key={c} className="group flex flex-col items-center gap-1">
                {/* Client brand colours are content, not design tokens. */}
                <span className="relative size-10 rounded-full border border-border" style={{ background: c }}>
                  <button
                    type="button"
                    aria-label={`Remove colour ${c}`}
                    onClick={() =>
                      confirm({
                        title: `Remove ${c}?`,
                        body: "Your manager will stop using this colour in visuals.",
                        confirmLabel: "Remove",
                        action: () => act.setColours(client.id, brand.colours.filter((x) => x !== c)),
                        success: "Colour removed.",
                      })
                    }
                    className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-card text-secondary shadow-md hover:text-danger focus-visible:focus-ring sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <X className="size-3" aria-hidden />
                  </button>
                </span>
                <span className="font-mono text-caption text-secondary">{c}</span>
              </li>
            ))}
          </ul>
          <form
            noValidate
            className="flex flex-col gap-2 sm:flex-row sm:items-start"
            onSubmit={async (e) => {
              e.preventDefault();
              const v = colour.trim().startsWith("#") ? colour.trim() : `#${colour.trim()}`;
              if (!/^#[0-9a-f]{6}$/i.test(v)) return setColourError("Enter a colour code like #224cd5.");
              if (brand.colours.includes(v.toLowerCase())) return setColourError("That colour is already added.");
              setColourError(undefined);
              if (await run("colour", () => act.setColours(client.id, [...brand.colours, v.toLowerCase()]), "Colour added.")) setColour("");
            }}
          >
            <div className="flex-1">
              <Input label="Add a colour" placeholder="#224cd5" value={colour} onChange={(e) => { setColour(e.target.value); setColourError(undefined); }} error={colourError} />
            </div>
            <Button type="submit" variant="secondary" className="sm:mt-7" loading={pending("colour")}>
              Add
            </Button>
          </form>
        </div>
      </Card>

      <Card title="Brand documents" action={<Upload clientId={client.id} section="documents" />}>
        {docs.length ? (
          <ul className="flex flex-col">
            {docs.map((f) => (
              <li key={f.id} className="flex items-center gap-3 border-b border-border py-3 last:border-b-0">
                <FileText className="size-6 shrink-0 text-primary-600" aria-hidden />
                <span className="flex flex-1 flex-col">
                  <span className="text-body-sm font-medium text-primary">{f.name}</span>
                  <span className="text-caption text-secondary">
                    {f.size}, added {date(f.at)}
                  </span>
                </span>
                <button type="button" aria-label={`Remove ${f.name}`} onClick={() => removeFile(f)} className={iconButton}>
                  <Trash className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body-sm text-secondary">A brand guide, a speaker bio or a personal brand strategy you already have.</p>
        )}
      </Card>

      <Dialog open={momentOpen} onClose={() => setMomentOpen(false)} title="Add a Moment">
        <Textarea
          label="What happened, and what do you want a post about?"
          placeholder="For example: I spoke at this event and want a post about the question I was asked."
          value={momentNote}
          onChange={(e) => {
            setMomentNote(e.target.value);
            setMomentError(undefined);
          }}
          error={momentError}
        />
        <label className="flex flex-col gap-2">
          <span className="text-body-sm font-medium text-primary">Photos (optional)</span>
          <input type="file" multiple accept={limits.photos.types} className="text-body-sm text-secondary file:mr-3 file:cursor-pointer file:rounded-md file:border file:border-border-strong file:bg-card file:px-4 file:py-2 file:text-body-sm file:font-medium file:text-primary-700" />
        </label>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setMomentOpen(false)}>
            Cancel
          </Button>
          <Button
            loading={pending("moment")}
            onClick={async () => {
              if (!momentNote.trim()) return setMomentError("Write a short note, so your manager knows what you want.");
              if (await run("moment", () => act.addMoment(client.id, momentNote.trim(), []), "Sent to your manager. They will reply in Messages.")) {
                setMomentNote("");
                setMomentOpen(false);
              }
            }}
          >
            {pending("moment") ? "Sending" : "Send to my manager"}
          </Button>
        </div>
      </Dialog>
    </Columns>
  );
}

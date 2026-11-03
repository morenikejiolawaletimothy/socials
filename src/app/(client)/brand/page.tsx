"use client";

import { CheckCircle, FileText, PencilSimple, Plus, Sparkle, Trash, UploadSimple, X, XCircle } from "@phosphor-icons/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Badge, Banner, Button, Card, Dialog, fieldClass, Input, Select, Textarea, Tile, TileFooter, useConfirm, useTask, useToast } from "@/components/ui";
import { agoIn, date } from "@/lib/format";
import { duration } from "@/lib/linkedin";
import { prepareUpload, sectionRules } from "@/lib/upload";
import { MediaThumb } from "@/components/content/MediaThumb";
import { VideoPlayer } from "@/components/content/PostMedia";
import { act, useMyClient, type BrandFile, type OffLimit } from "@/lib/mock";

const iconButton = "flex size-9 shrink-0 items-center justify-center rounded-full text-secondary hover:bg-danger-bg hover:text-danger focus-visible:focus-ring";
const offKinds: { value: OffLimit["kind"]; label: string }[] = [
  { value: "topic", label: "Topic" },
  { value: "person", label: "Person" },
  { value: "company", label: "Company" },
  { value: "interaction", label: "Interaction" },
];
const momentStatus = { new: { label: "Sent to your manager", tone: "info" as const }, seen: { label: "Seen", tone: "neutral" as const }, "post-drafted": { label: "Post drafted", tone: "success" as const } };

/** Upload button: checks the file (LinkedIn's rules for videos and carousels), a spinner while it uploads, a toast when done. */
function Upload({ clientId, section, label = "Upload" }: { clientId: string; section: BrandFile["section"]; label?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const { run, pending } = useTask();
  const [error, setError] = useState<string>();
  return (
    <div className="flex flex-col items-end gap-1">
      <input
        ref={ref}
        type="file"
        aria-label={`Choose a file for ${section}`}
        accept={sectionRules[section].accept}
        className="sr-only"
        tabIndex={-1}
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          setError(undefined);
          await run(
            "upload",
            async () => {
              let ready;
              try {
                ready = await prepareUpload(f, section);
              } catch (err) {
                setError((err as Error).message);
                throw err;
              }
              await act.addBrandFile(clientId, section, ready.name, ready.size, ready.src, { video: ready.video, carousel: ready.carousel, addedBy: "client" });
            },
            `${f.name} uploaded.`,
          );
        }}
      />
      <Button variant="secondary" size="sm" loading={pending("upload")} onClick={() => ref.current?.click()}>
        {!pending("upload") && <UploadSimple className="size-4" aria-hidden />} {pending("upload") ? "Uploading" : label}
      </Button>
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
            <input value={text} onChange={(e) => setText(e.target.value)} className={`${fieldClass} border-border-strong`} />
          </label>
          <span className="flex gap-2">
            <Button type="submit" loading={pending("edit")} disabled={!text.trim()}>
              {pending("edit") ? "Saving" : "Save"}
            </Button>
            <Button variant="cancel" onClick={() => { setText(item.text); setEditing(false); }}>
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
  const { client, brand: saved, files, moments } = useMyClient();
  // A new client has no Brand yet: start from an empty one, created on their first change.
  const brand = saved ?? { clientId: client?.id ?? "", colours: [], voice: "", wordsUse: [], wordsAvoid: [], examples: [], offLimits: [] };
  const confirm = useConfirm();
  const { run, pending } = useTask();
  const [momentOpen, setMomentOpen] = useState(false);
  const [momentNote, setMomentNote] = useState("");
  const [momentError, setMomentError] = useState<string>();
  const [momentPhotos, setMomentPhotos] = useState<string[]>([]);
  const [momentVideos, setMomentVideos] = useState<{ src: string; poster: string; seconds: number }[]>([]);
  const [playing, setPlaying] = useState<BrandFile | null>(null);
  const [offKind, setOffKind] = useState<OffLimit["kind"]>("topic");
  const [offText, setOffText] = useState("");
  const [offError, setOffError] = useState<string>();
  const [editingVoice, setEditingVoice] = useState(false);
  const [voice, setVoice] = useState(brand?.voice ?? "");
  const [wordsIn, setWordsIn] = useState(brand?.wordsUse.join(", ") ?? "");
  const [avoid, setAvoid] = useState(brand?.wordsAvoid.join(", ") ?? "");
  const [colour, setColour] = useState("");
  const [colourError, setColourError] = useState<string>();
  const momentFileRef = useRef<HTMLInputElement>(null);
  if (!client) return null;

  const photos = files.filter((f) => f.section === "photos");
  const logos = files.filter((f) => f.section === "logos");
  const docs = files.filter((f) => f.section === "documents");
  const videos = files.filter((f) => f.section === "videos");
  const carousels = files.filter((f) => f.section === "carousels");
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
          <Button variant="secondary" size="sm" onClick={() => setMomentOpen(true)}>
            <Plus className="size-4" aria-hidden /> Add a Moment
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <Banner tone="info" closeKey="brand-moments">
            Something you want a post about, like an event you spoke at or a milestone. Add a note with photos or videos. Your manager is told at once.
          </Banner>
          <ul className="flex flex-col gap-4">
            {moments.map((m) => (
              <li key={m.id}>
                <Tile>
                  {(m.photos.length > 0 || (m.videos?.length ?? 0) > 0) && (
                    <div className="flex flex-wrap gap-2">
                      {m.photos.map((p) => (
                        <span key={p} className="relative size-16 overflow-hidden rounded-sm">
                          <Image src={p} alt="" fill sizes="64px" className="object-cover" />
                        </span>
                      ))}
                      {m.videos?.map((v) => (
                        <span key={v.src} className="relative size-16 overflow-hidden rounded-sm">
                          <Image src={v.poster} alt="Video" fill sizes="64px" className="object-cover" />
                          <span className="absolute bottom-1 left-1 rounded-sm bg-neutral-900/70 px-1 text-caption text-inverse">{duration(v.seconds)}</span>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-body-sm text-primary">{m.note}</p>
                  <TileFooter>
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-caption text-secondary">Added {agoIn(m.at)}</span>
                      <Badge status={momentStatus[m.status].tone}>{momentStatus[m.status].label}</Badge>
                    </span>
                    <Button
                      variant="remove"
                      size="sm"
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
                    >
                      Remove
                    </Button>
                  </TileFooter>
                </Tile>
              </li>
            ))}
            {moments.length === 0 && <li className="text-body-sm text-secondary">No Moments yet. Add one when something happens you want a post about.</li>}
          </ul>
        </div>
      </Card>

      <Card title="Off limits">
        <div className="flex flex-col gap-4">
          <Banner tone="info" closeKey="brand-off-limits">
            What we never post, comment on or engage with. We check every post and every comment against this list.
          </Banner>
          <ul className="flex flex-col">
            {brand.offLimits.map((o) => (
              <OffLimitRow key={o.id} clientId={client.id} item={o} />
            ))}
            {brand.offLimits.length === 0 && <li className="py-2 text-body-sm text-secondary">Nothing yet. Add anything we should never touch.</li>}
          </ul>
          <form
            noValidate
            className="flex flex-col gap-3 sm:flex-row sm:items-start"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!offText.trim()) return setOffError("Write what to avoid.");
              if (brand.offLimits.some((o) => o.text.toLowerCase() === offText.trim().toLowerCase())) return setOffError("That is already on your list.");
              setOffError(undefined);
              if (await run("off", () => act.addOffLimit(client.id, offKind, offText.trim()), "Added to off limits. Your manager is told.")) setOffText("");
            }}
          >
            <Select label="Kind" wrapperClassName="sm:w-44" value={offKind} onChange={(e) => setOffKind(e.target.value as OffLimit["kind"])}>
                {offKinds.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
            </Select>
            <div className="flex-1">
              <Input label="What to avoid" placeholder="For example: never comment on politics" value={offText} onChange={(e) => { setOffText(e.target.value); setOffError(undefined); }} error={offError} />
            </div>
            <Button type="submit" className="sm:mt-7" loading={pending("off")}>
              {pending("off") ? "Adding" : "Add"}
            </Button>
          </form>
        </div>
      </Card>

      <Card
        title="Your voice"
        action={
          !editingVoice && (
            <Button variant="secondary" size="sm" onClick={() => setEditingVoice(true)}>
              <PencilSimple className="size-4" aria-hidden /> Edit
            </Button>
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
                variant="cancel"
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
            {(
              [
                { label: "Words you use", words: brand.wordsUse, bg: "bg-success-bg", icon: <CheckCircle className="size-4 shrink-0 text-success" aria-hidden /> },
                { label: "Words you avoid", words: brand.wordsAvoid, bg: "bg-danger-bg", icon: <XCircle className="size-4 shrink-0 text-danger" aria-hidden /> },
              ] as const
            ).map(({ label, words, bg, icon }) => (
              <div key={label} className="flex flex-col gap-2">
                <span className="text-caption text-secondary">{label}</span>
                <ul className="flex flex-wrap gap-2">
                  {words.map((w) => (
                    <li key={w} className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-body-sm text-primary ${bg}`}>
                      {icon}
                      {w}
                    </li>
                  ))}
                  {!words.length && <li className="text-body-sm text-secondary">None yet</li>}
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
                  className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full bg-card text-secondary shadow-sm transition-opacity hover:text-danger focus-visible:opacity-100 focus-visible:focus-ring sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <Trash className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body-sm text-secondary">Add headshots and photos of you at work. Your manager uses them in posts.</p>
        )}
        <p className="pt-3 text-caption text-secondary">{sectionRules.photos.label}.</p>
      </Card>

      <Card title="Videos" action={<Upload clientId={client.id} section="videos" />}>
        {videos.length ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {videos.map((f) => (
              <li key={f.id} className="group relative">
                <button type="button" onClick={() => setPlaying(f)} aria-label={`Play ${f.name}`} className="block w-full rounded-md focus-visible:focus-ring">
                  <MediaThumb file={f} />
                </button>
                <span className="mt-1 block truncate text-caption text-secondary">{f.name}</span>
                <button
                  type="button"
                  aria-label={`Remove ${f.name}`}
                  onClick={() => removeFile(f)}
                  className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full bg-card text-secondary shadow-sm transition-opacity hover:text-danger focus-visible:opacity-100 focus-visible:focus-ring sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <Trash className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body-sm text-secondary">Clips of you talking, at events or at work. Your manager can use them in video posts.</p>
        )}
        <p className="pt-3 text-caption text-secondary">{sectionRules.videos.label}. LinkedIn&apos;s standard.</p>
      </Card>

      <Card title="Carousels" action={<Upload clientId={client.id} section="carousels" />}>
        {carousels.length ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {carousels.map((f) => (
              <li key={f.id} className="group relative">
                <MediaThumb file={f} />
                <span className="mt-1 block truncate text-caption text-secondary">{f.name}</span>
                <button
                  type="button"
                  aria-label={`Remove ${f.name}`}
                  onClick={() => removeFile(f)}
                  className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full bg-card text-secondary shadow-sm transition-opacity hover:text-danger focus-visible:opacity-100 focus-visible:focus-ring sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <Trash className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body-sm text-secondary">Slides you already have, as a PDF, PowerPoint or Word file. LinkedIn shows them as pages people swipe.</p>
        )}
        <p className="pt-3 text-caption text-secondary">{sectionRules.carousels.label}.</p>
      </Card>

      <Dialog open={!!playing} onClose={() => setPlaying(null)} title={playing?.name ?? "Video"}>
        {playing?.video && <VideoPlayer video={{ src: playing.src ?? "", poster: playing.video.poster, alt: playing.name, seconds: playing.video.seconds, shape: playing.video.shape }} />}
      </Dialog>

      <Card title="Logos and colours" action={<Upload clientId={client.id} section="logos" />}>
        <div className="flex flex-col gap-4">
          {logos.map((f) => (
            <div key={f.id} className="flex items-center gap-3">
              <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-card">
                {f.src ? <Image src={f.src} alt={f.name} fill sizes="48px" className="object-contain p-1" /> : <Sparkle className="size-6 text-primary-600" aria-hidden />}
              </span>
              <span className="flex flex-1 flex-col">
                <span className="text-body font-medium text-primary">{f.name}</span>
                <span className="text-body-sm text-secondary">{f.size}</span>
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
                    className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-card text-secondary shadow-sm hover:text-danger focus-visible:focus-ring sm:opacity-0 sm:group-hover:opacity-100"
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
            <Button type="submit" className="sm:mt-7" loading={pending("colour")}>
              {pending("colour") ? "Adding" : "Add"}
            </Button>
          </form>
        </div>
      </Card>

      <Card title="Brand documents" action={<Upload clientId={client.id} section="documents" />}>
        {docs.length ? (
          <ul className="flex flex-col">
            {docs.map((f) => (
              <li key={f.id} className="flex items-center gap-3 border-b border-border py-3 last:border-b-0">
                {/* Icon on the title's line; the remove button centred on the row. */}
                <span className="flex flex-1 items-start gap-3">
                  <FileText className="mt-px size-6 shrink-0 text-primary-600" aria-hidden />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-body font-medium text-primary">{f.name}</span>
                    <span className="text-body-sm text-secondary">
                      {f.size} · Added {date(f.at)}
                    </span>
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
        <div className="flex flex-col items-start gap-2">
          <span className="text-body-sm leading-5 font-medium text-primary">Photos or videos (optional, up to 4)</span>
          <input
            ref={momentFileRef}
            id="moment-photos"
            type="file"
            multiple
            aria-label="Choose photos or videos"
            accept={`${sectionRules.photos.accept},${sectionRules.videos.accept}`}
            className="sr-only"
            tabIndex={-1}
            onChange={async (e) => {
              const picked = Array.from(e.target.files ?? []);
              e.target.value = "";
              if (momentPhotos.length + momentVideos.length + picked.length > 4) return setMomentError("Add up to 4 photos or videos. Remove one to add another.");
              setMomentError(undefined);
              try {
                for (const f of picked) {
                  const ready = await prepareUpload(f, f.type.startsWith("video/") ? "videos" : "photos");
                  if (ready.video) setMomentVideos((list) => [...list, { src: ready.src!, poster: ready.video!.poster, seconds: ready.video!.seconds }]);
                  else setMomentPhotos((list) => [...list, ready.src!]);
                }
              } catch (err) {
                setMomentError((err as Error).message);
              }
            }}
          />
          <Button variant="secondary" size="sm" disabled={momentPhotos.length + momentVideos.length >= 4} onClick={() => momentFileRef.current?.click()}>
            <UploadSimple className="size-4" aria-hidden /> Add photos or videos
          </Button>
          <span className="text-caption text-secondary">Photos: {sectionRules.photos.label}. Videos: {sectionRules.videos.label}.</span>
          {momentVideos.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {momentVideos.map((v, i) => (
                <li key={v.src} className="relative size-16 overflow-hidden rounded-sm">
                  <Image src={v.poster} alt={`Video ${i + 1}`} fill sizes="64px" className="object-cover" />
                  <span className="absolute bottom-1 left-1 rounded-sm bg-neutral-900/70 px-1 text-caption text-inverse">{duration(v.seconds)}</span>
                  <button
                    type="button"
                    aria-label={`Remove video ${i + 1}`}
                    onClick={() => setMomentVideos((list) => list.filter((_, j) => j !== i))}
                    className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-card text-secondary shadow-sm hover:text-danger focus-visible:focus-ring"
                  >
                    <X className="size-3" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {momentPhotos.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {momentPhotos.map((src, i) => (
                <li key={i} className="relative size-16 overflow-hidden rounded-sm">
                  <Image src={src} alt={`Photo ${i + 1}`} fill sizes="64px" className="object-cover" />
                  <button
                    type="button"
                    aria-label={`Remove photo ${i + 1}`}
                    onClick={() => setMomentPhotos((list) => list.filter((_, j) => j !== i))}
                    className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-card text-secondary shadow-sm hover:text-danger focus-visible:focus-ring"
                  >
                    <X className="size-3" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="cancel" onClick={() => setMomentOpen(false)}>
            Cancel
          </Button>
          <Button
            loading={pending("moment")}
            onClick={async () => {
              if (!momentNote.trim()) return setMomentError("Write a short note, so your manager knows what you want.");
              if (await run("moment", () => act.addMoment(client.id, momentNote.trim(), momentPhotos, momentVideos), "Sent to your manager. They will reply in Messages.")) {
                setMomentNote("");
                setMomentPhotos([]);
                setMomentVideos([]);
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

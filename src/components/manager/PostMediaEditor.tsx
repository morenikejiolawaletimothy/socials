"use client";

import { Image as ImageIcon, FilePpt, Plus, UploadSimple, VideoCamera } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { fileToMedia, MediaThumb } from "@/components/content/MediaThumb";
import { Banner, Button, buttonClass, Card, Dialog, InfoTip, Input, Select, Tabs, Textarea, useConfirm, useTask } from "@/components/ui";
import { dayIn } from "@/lib/format";
import { CAPTIONS, duration, VIDEO } from "@/lib/linkedin";
import { act, type BrandFile, type ClientBundle, type Post, type VideoBrief } from "@/lib/mock";
import { prepareUpload, sectionRules } from "@/lib/upload";

type Kind = "image" | "carousel" | "video";
const sectionOf: Record<Kind, BrandFile["section"]> = { image: "photos", carousel: "carousels", video: "videos" };
const kindLabel: Record<Kind, string> = { image: "Image", carousel: "Carousel", video: "Video" };

/**
 * M4 checks on a post's media, against LinkedIn's rules and ours. Each must be fixed before the post goes to the
 * client; none can be dismissed.
 */
export function mediaChecks(post: Post): string[] {
  const out: string[] = [];
  if (post.waitingForVideo) out.push("Waiting for the client's video.");
  if (post.format === "video" && !post.video && !post.waitingForVideo) out.push("This is a video post with no video. Add one, or ask the client for one.");
  if (post.video) {
    if (post.video.seconds < VIDEO.minSeconds || post.video.seconds > VIDEO.maxSeconds) out.push("The video must be 3 seconds to 30 minutes long.");
    if (!post.video.captions && !post.video.noSpeech) out.push("Add captions, or confirm the video has no speech. Most people watch with the sound off.");
  }
  if (post.carousel) {
    if (!post.carousel.title.trim()) out.push("Give the carousel a title. LinkedIn shows it on the post.");
    if (post.carousel.file?.pages && post.carousel.file.pages > 300) out.push("The carousel is over 300 pages. LinkedIn takes up to 300.");
  }
  if (post.image && !post.image.alt.trim()) out.push("Describe the image for people using screen readers.");
  return out;
}

/** The system's suggested brief for a client video, from the post and the strategy. The manager edits it before sending. */
export function suggestBrief(post: Post, b: ClientBundle): VideoBrief {
  const firstLine = post.text.split("\n")[0].replace(/\.$/, "");
  return {
    idea: `60 seconds on: ${firstLine}`,
    why: `${b.strategy?.goal ?? b.client?.goal ?? "Your goal"}. A short video of you saying this in your own words builds trust faster than text.`,
    shots: ["Say what this is about, in one line", "The story or the point, as you would tell a friend", "One thing you want people to take from it", "Close with a question for people to answer"],
    length: "45 to 90 seconds",
    shape: "portrait",
    tips: ["Hold your phone upright, at eye level", "Face a window for soft light", "Record somewhere quiet, close to the phone", "One take is fine. Small mistakes feel real"],
    postId: post.id,
  };
}

/** Choose an image, carousel or video from the client's Brand, or upload one (it is saved to their Brand too). */
function MediaPicker({ b, initial, onClose, onPick }: { b: ClientBundle; initial: Kind; onClose: () => void; onPick: (file: BrandFile) => void }) {
  const [kind, setKind] = useState<Kind>(initial);
  const [error, setError] = useState<string>();
  const ref = useRef<HTMLInputElement>(null);
  const { run, pending } = useTask();
  const section = sectionOf[kind];
  const files = b.files.filter((f) => f.section === section);

  return (
    <Dialog open onClose={onClose} title="Add media">
      <Tabs label="Media type" value={kind} onChange={(k) => { setKind(k); setError(undefined); }} tabs={(["image", "carousel", "video"] as Kind[]).map((k) => ({ value: k, label: kindLabel[k] }))} />
      <p className="text-body-sm text-secondary">From {b.user?.firstName}&apos;s Brand. What you upload is saved there too, so they can see it.</p>
      <input
        ref={ref}
        type="file"
        aria-label={`Choose a ${kindLabel[kind].toLowerCase()} to upload`}
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
              const id = await act.addBrandFile(b.client!.id, section, ready.name, ready.size, ready.src, { video: ready.video, carousel: ready.carousel, addedBy: "team" });
              onPick({ id, clientId: b.client!.id, section, name: ready.name, size: ready.size, src: ready.src, at: new Date().toISOString(), video: ready.video, carousel: ready.carousel });
            },
            `${f.name} saved to their Brand and added to the post.`,
          );
        }}
      />
      <div className="flex flex-col items-start gap-1">
        <Button variant="secondary" size="sm" loading={pending("upload")} onClick={() => ref.current?.click()}>
          {!pending("upload") && <UploadSimple className="size-4" aria-hidden />} {pending("upload") ? "Uploading" : `Upload a ${kindLabel[kind].toLowerCase()}`}
        </Button>
        {error ? <span className="text-body-sm text-danger">{error}</span> : <span className="text-caption text-secondary">{sectionRules[section].label}.</span>}
      </div>
      {files.length ? (
        <ul className="grid grid-cols-3 gap-2">
          {files.map((f) => (
            <li key={f.id}>
              <button type="button" onClick={() => onPick(f)} aria-label={`Use ${f.name}`} className="block w-full rounded-md focus-visible:focus-ring">
                {kind === "image" && f.src ? (
                  <span className="relative block aspect-square w-full overflow-hidden rounded-md">
                    <Image src={f.src} alt="" fill sizes="120px" className="object-cover transition-transform hover:scale-105" />
                  </span>
                ) : (
                  <MediaThumb file={f} />
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-body-sm text-secondary">No {kind === "image" ? "photos" : `${kindLabel[kind].toLowerCase()}s`} in their Brand yet.</p>
      )}
    </Dialog>
  );
}

/**
 * Ask the client to record a video, on its own page (/manager/clients/[id]/content/video?post=…): the suggested
 * brief, editable, with a due date. Also used to edit a sent request. `onClose` runs after Send or Cancel.
 */
export function VideoRequestForm({ b, brief, taskId, onClose }: { b: ClientBundle; brief: VideoBrief; taskId?: string; onClose: () => void }) {
  const { run, pending } = useTask();
  const [v, setV] = useState(brief);
  const [shots, setShots] = useState(brief.shots.join("\n"));
  const [tips, setTips] = useState(brief.tips.join("\n"));
  const [days, setDays] = useState("5");
  const [error, setError] = useState<string>();
  const first = b.user?.firstName ?? "the client";
  const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

  return (
    <Card title={taskId ? "Edit the video request" : `Ask ${first} for a video`} info="Suggested from their strategy. Change anything before you send it.">
      {/* Three sections split by dividers (the idea, what to say, the format), then Send and Cancel under the last divider. */}
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-4">
          <h3 className="text-body font-medium text-primary">The idea</h3>
          <Input label="What to record" value={v.idea} onChange={(e) => { setV({ ...v, idea: e.target.value }); setError(undefined); }} error={error} />
          <Textarea label="Why it helps their goal" rows={2} value={v.why} onChange={(e) => setV({ ...v, why: e.target.value })} />
        </section>

        <section className="flex flex-col gap-4 border-t border-border pt-4">
          <h3 className="text-body font-medium text-primary">What to say</h3>
          <Textarea label="Steps, one a line" rows={4} value={shots} onChange={(e) => setShots(e.target.value)} />
          <Textarea label="Tips, one a line" rows={3} value={tips} onChange={(e) => setTips(e.target.value)} />
        </section>

        <section className="flex flex-col gap-4 border-t border-border pt-4">
          <h3 className="text-body font-medium text-primary">Format</h3>
          <div className={`grid grid-cols-1 gap-4 ${taskId ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
            <Input label="Length" value={v.length} onChange={(e) => setV({ ...v, length: e.target.value })} />
            <Select label="Shape" value={v.shape} onChange={(e) => setV({ ...v, shape: e.target.value as VideoBrief["shape"] })}>
              <option value="portrait">Upright (portrait)</option>
              <option value="landscape">Sideways (landscape)</option>
              <option value="square">Square</option>
            </Select>
            {!taskId && (
              <Select label="Due in" value={days} onChange={(e) => setDays(e.target.value)}>
                {["3", "5", "7", "14"].map((d) => (
                  <option key={d} value={d}>
                    {d} days ({dayIn(new Date(Date.now() + Number(d) * 86_400_000).toISOString())})
                  </option>
                ))}
              </Select>
            )}
          </div>
        </section>

      <div className="flex flex-wrap gap-3 border-t border-border pt-4">
        <Button
          loading={pending("send")}
          onClick={async () => {
            if (!v.idea.trim() || !lines(shots).length) return setError("Say what to record, and at least one step.");
            const next = { ...v, idea: v.idea.trim(), shots: lines(shots), tips: lines(tips) };
            const ok = await run(
              "send",
              () => (taskId ? act.updateVideoBrief(taskId, next) : act.requestVideo(b.client!.id, next, new Date(Date.now() + Number(days) * 86_400_000).toISOString())),
              taskId ? `Request updated. ${first} is told.` : `Sent to ${first} as a quick task. The draft waits for the video.`,
            );
            if (ok) onClose();
          }}
        >
          {taskId ? "Save" : `Send to ${first}`}
        </Button>
        <Button variant="cancel" onClick={onClose}>
          Cancel
        </Button>
      </div>
      </div>
    </Card>
  );
}

/** M4: the post's media. One of image, carousel or video, from the Brand or uploaded; or a video asked of the client. */
export function PostMediaEditor({ post, b }: { post: Post; b: ClientBundle }) {
  const confirm = useConfirm();
  const { run, pending } = useTask();
  const [picking, setPicking] = useState<Kind | null>(null);
  const [title, setTitle] = useState(post.carousel?.title ?? "");
  const captionsRef = useRef<HTMLInputElement>(null);
  const first = b.user?.firstName ?? "the client";
  const request = post.waitingForVideo ? b.tasks.find((t) => t.id === post.waitingForVideo) : undefined;
  const kind: Kind | null = post.video ? "video" : post.carousel ? "carousel" : post.image ? "image" : null;
  const Icon = kind === "video" ? VideoCamera : kind === "carousel" ? FilePpt : ImageIcon;

  if (post.repostOf?.reshare) return <p className="text-body-sm text-secondary">A reshare carries the original post, so it takes no media of its own.</p>;

  const thumb = post.video?.poster ?? post.carousel?.slides[0]?.src ?? post.image?.src;

  return (
    // A section like the others in the draft: a heading with a tooltip, one bordered group (the media, then captions
    // or the carousel title as rows split by lines), then any checks under it.
    <div className="flex flex-col gap-3">
      <span className="flex items-center gap-2">
        <span className="text-body font-medium text-primary">Media</span>
        <InfoTip label="About media">An image, a carousel (PDF, PowerPoint or Word) or a video, from {first}&apos;s Brand or uploaded. What you upload is saved to their Brand too.</InfoTip>
      </span>

      <div className="flex flex-col overflow-hidden rounded-md border border-border">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <span className="flex min-w-0 flex-1 items-center gap-3">
            <span className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary-50 text-primary-700">
              {thumb ? <Image src={thumb} alt="" fill sizes="64px" className="object-cover" /> : <Icon className="size-6" aria-hidden />}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-body font-medium text-primary">{kind ? kindLabel[kind] : request ? "Video requested" : "No media yet"}</span>
              <span className="line-clamp-2 text-body-sm text-secondary">
                {post.video
                  ? `${post.video.alt}. ${duration(post.video.seconds)}, ${post.video.shape ?? "landscape"}.`
                  : post.carousel
                    ? `${post.carousel.title}${post.carousel.file?.pages ? `, ${post.carousel.file.pages} pages` : ""}.`
                    : post.image
                      ? `${post.image.alt}.`
                      : request
                        ? `Waiting for ${first}'s video: ${request.video?.idea}.`
                        : "The post goes out as text only."}
              </span>
            </span>
          </span>
          <span className="flex shrink-0 flex-wrap gap-2">
            {!request && (
              <Button variant="secondary" size="sm" onClick={() => setPicking(kind ?? (post.format === "video" ? "video" : post.format === "carousel" ? "carousel" : "image"))}>
                {!kind && <Plus className="size-4" aria-hidden />} {kind ? "Change" : "Add media"}
              </Button>
            )}
            {!kind && !request && (
              <Link href={`/manager/clients/${b.client?.id}/content/video?post=${post.id}`} className={buttonClass("secondary", "sm")}>
                <VideoCamera className="size-4" aria-hidden /> Ask for a video
              </Link>
            )}
            {request && (
              <Link href={`/manager/clients/${b.client?.id}/content/video?post=${post.id}`} className={buttonClass("secondary", "sm")}>
                Edit request
              </Link>
            )}
            {request && (
              <Button
                variant="remove"
                size="sm"
                onClick={() =>
                  confirm({
                    title: "Withdraw the video request?",
                    body: `${first} no longer sees the quick task. The draft stays, with no video.`,
                    confirmLabel: "Withdraw",
                    action: () => act.withdrawVideoRequest(request.id),
                    success: `Request withdrawn. ${first} is told.`,
                  })
                }
              >
                Withdraw
              </Button>
            )}
            {kind && (
              <Button
                variant="remove"
                size="sm"
                onClick={() =>
                  confirm({
                    title: `Remove the ${kindLabel[kind].toLowerCase()}?`,
                    body: "The post goes out as text only, unless you add something else. The file stays in their Brand.",
                    confirmLabel: "Remove",
                    action: () => act.setPostMedia(post.id, null),
                    success: `${kindLabel[kind]} removed from the post.`,
                  })
                }
              >
                Remove
              </Button>
            )}
          </span>
        </div>

        {post.video && (
          <div className="flex flex-col gap-3 border-t border-border p-4">
            <span className="flex items-center gap-2">
              <span className="text-body-sm font-medium text-primary">Captions</span>
              <InfoTip label="About captions">{CAPTIONS.label}. LinkedIn shows them over the video. Most people watch with the sound off.</InfoTip>
            </span>
            <input
              ref={captionsRef}
              type="file"
              aria-label="Choose a caption file"
              accept={CAPTIONS.accept}
              className="sr-only"
              tabIndex={-1}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!f || !post.video) return;
                await run("captions", () => act.setPostMedia(post.id, { video: { ...post.video!, captions: f.name, noSpeech: false } }), "Captions added.");
              }}
            />
            {post.video.captions ? (
              <span className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-body-sm text-primary">{post.video.captions}</span>
                <Button variant="remove" size="sm" loading={pending("captions")} onClick={() => run("captions", () => act.setPostMedia(post.id, { video: { ...post.video!, captions: undefined } }), "Captions removed.")}>
                  Remove captions
                </Button>
              </span>
            ) : (
              <span className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <Button variant="secondary" size="sm" loading={pending("captions")} onClick={() => captionsRef.current?.click()}>
                  <Plus className="size-4" aria-hidden /> Add captions (.srt)
                </Button>
                <label className="flex cursor-pointer items-center gap-2 text-body-sm text-primary">
                  <input
                    type="checkbox"
                    checked={!!post.video.noSpeech}
                    onChange={(e) => run("speech", () => act.setPostMedia(post.id, { video: { ...post.video!, noSpeech: e.target.checked } }), e.target.checked ? "Marked as having no speech." : "Captions needed again.")}
                    className="size-4 accent-primary-600 focus-visible:focus-ring"
                  />
                  No speech in this video
                </label>
              </span>
            )}
          </div>
        )}

        {post.carousel && (
          <form
            className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-end"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!title.trim() || !post.carousel) return;
              await run("title", () => act.setPostMedia(post.id, { carousel: { ...post.carousel!, title: title.trim() } }), "Carousel title saved.");
            }}
          >
            <div className="flex-1">
              <Input label="Carousel title (shown on the post)" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <Button type="submit" variant="secondary" disabled={!title.trim() || title === post.carousel.title} loading={pending("title")}>
              Save title
            </Button>
          </form>
        )}
      </div>

      {mediaChecks(post).map((c) => (
        <Banner key={c} tone={post.waitingForVideo ? "info" : "warning"}>
          {c}
        </Banner>
      ))}

      {picking && (
        <MediaPicker
          b={b}
          initial={picking}
          onClose={() => setPicking(null)}
          onPick={async (f) => {
            setPicking(null);
            setTitle(f.carousel ? f.name.replace(/\.\w+$/, "").replace(/[-_]/g, " ") : title);
            await run("media", () => act.setPostMedia(post.id, fileToMedia(f)), `${f.section === "videos" ? "Video" : f.section === "carousels" ? "Carousel" : "Image"} added to the post.`);
          }}
        />
      )}
    </div>
  );
}

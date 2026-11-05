"use client";

import { UploadSimple, X } from "@phosphor-icons/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Breadcrumbs, Button, Card, Textarea, useTask } from "@/components/ui";
import { duration } from "@/lib/linkedin";
import { act, useMyClient } from "@/lib/mock";
import { prepareUpload, sectionRules } from "@/lib/upload";

/** C15: add a Moment (something that happened, with photos or videos) on its own page. */
export function MomentForm() {
  const router = useRouter();
  const { client } = useMyClient();
  const { run, pending } = useTask();
  const [momentNote, setMomentNote] = useState("");
  const [momentError, setMomentError] = useState<string>();
  const [momentPhotos, setMomentPhotos] = useState<string[]>([]);
  const [momentVideos, setMomentVideos] = useState<{ src: string; poster: string; seconds: number }[]>([]);
  const [uploadError, setUploadError] = useState<string>();
  const momentFileRef = useRef<HTMLInputElement>(null);
  if (!client) return null;
  const count = momentPhotos.length + momentVideos.length;
  const full = count >= 4;
  const removeClass = "absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-card text-secondary shadow-sm hover:text-danger focus-visible:focus-ring";
  return (
    <Columns {...rails.clientSettings}>
      <Card title="Add a Moment" eyebrow={<Breadcrumbs items={[{ label: "Your brand", href: "/brand" }, { label: "Add a Moment" }]} />}>
        {/* Sections top to bottom, each under a line: the note, the photos or videos, then the buttons. */}
        <div className="flex flex-col gap-6">
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

          <section className="flex flex-col gap-3 border-t border-border pt-6" aria-labelledby="moment-media">
            <div className="flex items-center justify-between gap-4">
              <h3 id="moment-media" className="text-body font-semibold text-primary">
                Photos or videos
              </h3>
              <span className="text-body-sm text-secondary">Optional · {count} of 4</span>
            </div>
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
                if (count + picked.length > 4) return setUploadError("Add up to 4 photos or videos. Remove one to add another.");
                setUploadError(undefined);
                try {
                  for (const f of picked) {
                    const ready = await prepareUpload(f, f.type.startsWith("video/") ? "videos" : "photos");
                    if (ready.video) setMomentVideos((list) => [...list, { src: ready.src!, poster: ready.video!.poster, seconds: ready.video!.seconds }]);
                    else setMomentPhotos((list) => [...list, ready.src!]);
                  }
                } catch (err) {
                  setUploadError((err as Error).message);
                }
              }}
            />
            <button
              type="button"
              disabled={full}
              onClick={() => momentFileRef.current?.click()}
              className="flex items-center gap-4 rounded-md border border-dashed border-border-strong p-4 text-left transition-colors hover:border-primary-300 hover:bg-primary-50 focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border-strong disabled:hover:bg-transparent"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                <UploadSimple className="size-5" aria-hidden />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-body font-medium text-primary">{full ? "You have added 4" : "Add photos or videos"}</span>
                <span className="text-body-sm text-secondary">
                  Photos: {sectionRules.photos.label}. Videos: {sectionRules.videos.label}.
                </span>
              </span>
            </button>
            {uploadError && (
              <p role="alert" className="text-body-sm text-danger">
                {uploadError}
              </p>
            )}
            {count > 0 && (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {momentVideos.map((v, i) => (
                  <li key={v.src} className="relative aspect-square overflow-hidden rounded-md border border-border">
                    <Image src={v.poster} alt={`Video ${i + 1}`} fill sizes="160px" className="object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 rounded-sm bg-neutral-900/70 px-1.5 text-caption text-inverse">{duration(v.seconds)}</span>
                    <button type="button" aria-label={`Remove video ${i + 1}`} onClick={() => setMomentVideos((list) => list.filter((_, j) => j !== i))} className={removeClass}>
                      <X className="size-4" aria-hidden />
                    </button>
                  </li>
                ))}
                {momentPhotos.map((src, i) => (
                  <li key={i} className="relative aspect-square overflow-hidden rounded-md border border-border">
                    <Image src={src} alt={`Photo ${i + 1}`} fill sizes="160px" className="object-cover" />
                    <button type="button" aria-label={`Remove photo ${i + 1}`} onClick={() => setMomentPhotos((list) => list.filter((_, j) => j !== i))} className={removeClass}>
                      <X className="size-4" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">
            <Button
              loading={pending("moment")}
              onClick={async () => {
                if (!momentNote.trim()) return setMomentError("Write a short note, so your manager knows what you want.");
                if (await run("moment", () => act.addMoment(client.id, momentNote.trim(), momentPhotos, momentVideos), "Sent to your manager. They will reply in Messages.")) {
                  setMomentNote("");
                  setMomentPhotos([]);
                  setMomentVideos([]);
                  router.push("/brand");
                }
              }}
            >
              {pending("moment") ? "Sending" : "Send to my manager"}
            </Button>
            <Button variant="cancel" onClick={() => router.push("/brand")}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </Columns>
  );
}

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
  const momentFileRef = useRef<HTMLInputElement>(null);
  if (!client) return null;
  return (
    <Columns {...rails.clientSettings}>
      <Card title="Add a Moment" eyebrow={<Breadcrumbs items={[{ label: "Your brand", href: "/brand" }, { label: "Add a Moment" }]} />}>
        <div className="flex flex-col gap-4">
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
        <div className="flex flex-wrap gap-3">
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

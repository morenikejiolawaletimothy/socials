"use client";

import { UploadSimple, VideoCamera } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { Banner, Button, Tile, useTask } from "@/components/ui";
import { prepareUpload, sectionRules } from "@/lib/upload";
import { act, type QuickTask } from "@/lib/mock";

const shapeLabel = { portrait: "Upright (portrait)", landscape: "Sideways (landscape)", square: "Square" };

/** C17 "Record a short video": what to record and why, a shot list and tips, then upload the clip. */
export function VideoTask({ task }: { task: QuickTask }) {
  const v = task.video!;
  const ref = useRef<HTMLInputElement>(null);
  const { run, pending } = useTask();
  const [error, setError] = useState<string>();

  return (
    <div className="flex flex-col gap-4">
      <Tile>
        <span className="flex items-start gap-3">
          <VideoCamera className="mt-0.5 size-6 shrink-0 text-primary-600" aria-hidden />
          <span className="flex flex-col gap-1">
            <span className="text-body font-medium text-primary">{v.idea}</span>
            <span className="text-body-sm text-secondary">
              {v.length} · {shapeLabel[v.shape]}
            </span>
          </span>
        </span>
        <Banner tone="info">Why: {v.why}</Banner>
      </Tile>

      <Tile>
        <span className="text-body font-semibold text-primary">What to say</span>
        <ol className="flex list-decimal flex-col gap-2 pl-5 text-body-sm text-primary">
          {v.shots.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </Tile>

      <Tile>
        <span className="text-body font-semibold text-primary">Tips</span>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-body-sm text-primary">
          {v.tips.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </Tile>

      {task.done ? (
        <Banner tone="success" title="Video sent">
          Your manager has it and will send you the post to review.
        </Banner>
      ) : (
        <div className="flex flex-col items-start gap-2">
          <input
            ref={ref}
            type="file"
            aria-label="Choose your video"
            accept={sectionRules.videos.accept}
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
                    ready = await prepareUpload(f, "videos");
                  } catch (err) {
                    setError((err as Error).message);
                    throw err;
                  }
                  const fileId = await act.addBrandFile(task.clientId, "videos", ready.name, ready.size, ready.src, { video: ready.video, addedBy: "client" });
                  await act.submitVideo(task.id, fileId);
                },
                "Video sent to your manager. It is saved in Your brand too.",
              );
            }}
          />
          <Button loading={pending("upload")} onClick={() => ref.current?.click()}>
            {pending("upload") ? <>Uploading</> : <><UploadSimple className="size-5" aria-hidden /> Upload your video</>}
          </Button>
          {error ? <span className="text-body-sm text-danger">{error}</span> : <span className="text-caption text-secondary">{sectionRules.videos.label}.</span>}
        </div>
      )}
    </div>
  );
}

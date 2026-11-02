"use client";

import { FilePpt, Play } from "@phosphor-icons/react";
import Image from "next/image";
import { duration } from "@/lib/linkedin";
import type { BrandFile } from "@/lib/mock";

/** A Brand video or carousel as a square thumbnail: the cover or first page, with its length or page count. */
export function MediaThumb({ file }: { file: BrandFile }) {
  const cover = file.video?.poster ?? file.carousel?.slides[0]?.src ?? file.src;
  return (
    <span className="relative block aspect-square w-full overflow-hidden rounded-md bg-neutral-100">
      {cover ? (
        <Image src={cover} alt="" fill sizes="200px" className="object-cover" />
      ) : (
        <span className="flex size-full items-center justify-center">
          <FilePpt className="size-8 text-primary-600" aria-hidden />
        </span>
      )}
      {file.video && (
        <>
          <span className="absolute left-1/2 top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-900/70 text-inverse">
            <Play className="size-5" aria-hidden />
          </span>
          <span className="absolute bottom-2 left-2 rounded-sm bg-neutral-900/70 px-1 text-caption text-inverse">{duration(file.video.seconds)}</span>
        </>
      )}
      {file.carousel && (
        <span className="absolute bottom-2 left-2 rounded-sm bg-neutral-900/70 px-1 text-caption text-inverse">
          {file.carousel.pages ? `${file.carousel.pages} pages` : "Document"}
        </span>
      )}
    </span>
  );
}

/** What a Brand video or carousel becomes on a post. */
export function fileToMedia(file: BrandFile) {
  if (file.video) return { video: { src: file.src ?? "", poster: file.video.poster, alt: file.name.replace(/\.\w+$/, "").replace(/[-_]/g, " "), seconds: file.video.seconds, shape: file.video.shape, fileId: file.id } };
  if (file.carousel)
    return {
      carousel: {
        title: file.name.replace(/\.\w+$/, "").replace(/[-_]/g, " "),
        slides: file.carousel.slides,
        file: { name: file.name, size: file.size, src: file.src, pages: file.carousel.pages },
        fileId: file.id,
      },
    };
  return { image: { src: file.src ?? "", alt: file.name.replace(/\.\w+$/, "").replace(/[-_]/g, " ") } };
}

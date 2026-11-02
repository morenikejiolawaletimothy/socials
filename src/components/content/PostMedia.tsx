"use client";

import { CaretLeft, CaretRight, CornersOut, Pause, Play, SkipBack, SpeakerHigh, SpeakerSlash, Stack, TextAlignLeft, X } from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Post } from "@/lib/mock";

/** "0:09", "2:05". */
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** Round dark control that floats on media (carousel and viewer buttons). */
const floatButton =
  "flex size-10 items-center justify-center rounded-full bg-neutral-900/80 text-inverse shadow-md transition-colors hover:bg-neutral-900 focus-visible:focus-ring";
/** Plain control in the video bar. */
const barButton = "flex size-8 shrink-0 items-center justify-center rounded-sm text-inverse hover:bg-neutral-0/10 focus-visible:focus-ring";

/** A post's media, full width, the way LinkedIn shows it: an image, a video, or a document carousel. Nothing for text posts. */
export function PostMedia({ post }: { post: Post }) {
  if (post.video) return <VideoPlayer video={post.video} />;
  if (post.carousel) return <DocumentCarousel carousel={post.carousel} />;
  if (post.image) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-md bg-neutral-100">
        <Image src={post.image.src} alt={post.image.alt} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
      </div>
    );
  }
  return null;
}

/* ---------- Video ---------- */

const shapes = { landscape: "aspect-video", portrait: "aspect-4/5", square: "aspect-square" };

/**
 * LinkedIn-style video: plays muted when most of it is on screen and pauses when it scrolls away
 * (not with reduced motion). Click the video to play or pause. The bar has play, back to start,
 * progress, time, sound and full screen.
 */
function VideoPlayer({ video }: { video: NonNullable<Post["video"]> }) {
  const box = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [now, setNow] = useState(0);
  const [length, setLength] = useState(video.seconds);

  // Keep the element's sound in step with the button (React does not always update the muted attribute).
  useEffect(() => {
    if (ref.current) ref.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const seen = new IntersectionObserver(([e]) => (e.isIntersecting ? el.play().catch(() => {}) : el.pause()), { threshold: 0.6 });
    seen.observe(el);
    return () => seen.disconnect();
  }, []);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };
  const seek = (t: number) => {
    if (ref.current) ref.current.currentTime = t;
  };

  return (
    <div ref={box} className={`group/video relative w-full overflow-hidden rounded-md bg-dark ${shapes[video.shape ?? "landscape"]}`}>
      <video
        ref={ref}
        muted={muted}
        playsInline
        loop
        preload="metadata"
        poster={video.poster}
        aria-label={`${video.alt}. Video, ${clock(video.seconds)}.`}
        onClick={toggle}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setNow(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => Number.isFinite(e.currentTarget.duration) && setLength(e.currentTarget.duration)}
        className="size-full cursor-pointer object-contain"
      >
        <source src={video.src} type="video/mp4" />
      </video>

      {!playing && now === 0 && (
        <button type="button" onClick={toggle} aria-label="Play video" className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-16 ${floatButton}`}>
          <Play className="size-8" aria-hidden />
        </button>
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-linear-to-t from-neutral-900/80 to-transparent px-3 pb-2 pt-8 text-inverse">
        <button type="button" onClick={toggle} aria-label={playing ? "Pause" : "Play"} className={barButton}>
          {playing ? <Pause className="size-5" aria-hidden /> : <Play className="size-5" aria-hidden />}
        </button>
        <button type="button" onClick={() => seek(0)} aria-label="Back to the start" className={barButton}>
          <SkipBack className="size-5" aria-hidden />
        </button>
        <input
          type="range"
          min={0}
          max={length || 0}
          step={0.1}
          value={now}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Video position"
          aria-valuetext={`${clock(now)} of ${clock(length)}`}
          className="h-1 min-w-0 flex-1 cursor-pointer accent-neutral-0"
        />
        <span className="w-10 shrink-0 text-right text-caption tabular-nums">{clock(Math.max(length - now, 0))}</span>
        <button type="button" onClick={() => setMuted((m) => !m)} aria-label={muted ? "Turn sound on" : "Turn sound off"} className={barButton}>
          {muted ? <SpeakerSlash className="size-5" aria-hidden /> : <SpeakerHigh className="size-5" aria-hidden />}
        </button>
        <button type="button" onClick={() => box.current?.requestFullscreen?.().catch(() => {})} aria-label="Full screen" className={barButton}>
          <CornersOut className="size-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}

/* ---------- Document carousel ---------- */

/**
 * LinkedIn document carousel: portrait pages in a row with the next one peeking, "Title · 7 pages" on the
 * first page, round buttons to step through, and a button to open the pages full screen.
 * People can also swipe or scroll the row.
 */
function DocumentCarousel({ carousel }: { carousel: NonNullable<Post["carousel"]> }) {
  const track = useRef<HTMLUListElement>(null);
  const [page, setPage] = useState(0);
  const [viewing, setViewing] = useState(false);
  const count = carousel.slides.length;

  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const slides = Array.from(el.children) as HTMLElement[];
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    setPage(atEnd ? count - 1 : slides.reduce((best, s, i) => (Math.abs(s.offsetLeft - el.scrollLeft) < Math.abs(slides[best].offsetLeft - el.scrollLeft) ? i : best), 0));
  };
  const goTo = (i: number) => {
    const el = track.current;
    const slide = el?.children[Math.max(0, Math.min(count - 1, i))] as HTMLElement | undefined;
    if (el && slide) el.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
  };

  return (
    <div role="region" aria-roledescription="carousel" aria-label={`${carousel.title}, ${count} pages`} className="relative">
      <ul ref={track} onScroll={onScroll} className="no-scrollbar relative flex snap-x snap-mandatory gap-2 overflow-x-auto">
        {carousel.slides.map((s, i) => (
          <li
            key={s.src + i}
            aria-roledescription="slide"
            aria-label={`Page ${i + 1} of ${count}`}
            className="relative aspect-4/5 shrink-0 basis-4/5 snap-start overflow-hidden rounded-md border border-border bg-card sm:basis-3/5"
          >
            <Image src={s.src} alt={s.alt} fill sizes="(min-width: 1024px) 340px, 80vw" className="object-cover" />
            {i === 0 && (
              <span className="absolute inset-x-3 top-3 flex">
                <span className="truncate rounded-md bg-neutral-900/80 px-2 py-1 text-body-sm text-inverse">
                  <span className="font-semibold">{carousel.title}</span> · {count} pages
                </span>
              </span>
            )}
          </li>
        ))}
      </ul>

      {page > 0 && (
        <button type="button" onClick={() => goTo(page - 1)} aria-label="Previous page" className={`absolute left-2 top-1/2 -translate-y-1/2 ${floatButton}`}>
          <CaretLeft className="size-5" aria-hidden />
        </button>
      )}
      {page < count - 1 && (
        <button type="button" onClick={() => goTo(page + 1)} aria-label="Next page" className={`absolute right-2 top-1/2 -translate-y-1/2 ${floatButton}`}>
          <CaretRight className="size-5" aria-hidden />
        </button>
      )}
      <button type="button" onClick={() => setViewing(true)} aria-label="Open the pages full screen" className={`absolute bottom-2 right-2 ${floatButton}`}>
        <CornersOut className="size-5" aria-hidden />
      </button>

      <PageViewer carousel={carousel} open={viewing} start={page} onClose={() => setViewing(false)} />
    </div>
  );
}

/** Full-screen pages, like LinkedIn's document viewer: title and page count on top, one page at a time, progress below. */
function PageViewer({ carousel, open, start, onClose }: { carousel: NonNullable<Post["carousel"]>; open: boolean; start: number; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [page, setPage] = useState(start);
  const count = carousel.slides.length;
  const slide = carousel.slides[page];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      setPage(start);
      el.showModal();
    }
    if (!open && el.open) el.close();
  }, [open, start]);

  const step = (d: number) => setPage((p) => Math.max(0, Math.min(count - 1, p + d)));

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-label={carousel.title}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") step(1);
        if (e.key === "ArrowLeft") step(-1);
      }}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-neutral-700 p-0 text-inverse backdrop:bg-neutral-900/60"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-neutral-800 px-4 py-3 sm:px-6">
          <h2 className="truncate text-body font-semibold">{carousel.title}</h2>
          <div className="flex shrink-0 items-center gap-4">
            <span className="text-body-sm">{count} pages</span>
            <button type="button" onClick={onClose} aria-label="Close" className={barButton}>
              <X className="size-6" aria-hidden />
            </button>
          </div>
        </header>

        <div className="relative flex min-h-0 flex-1 items-center justify-center bg-card">
          {slide && (
            <div className="relative aspect-4/5 h-full max-w-full">
              <Image src={slide.src} alt={slide.alt} fill sizes="100vw" className="object-contain" />
            </div>
          )}
          {page > 0 && (
            <button type="button" onClick={() => step(-1)} aria-label="Previous page" className={`absolute left-4 top-1/2 -translate-y-1/2 ${floatButton}`}>
              <CaretLeft className="size-5" aria-hidden />
            </button>
          )}
          {page < count - 1 && (
            <button type="button" onClick={() => step(1)} aria-label="Next page" className={`absolute right-4 top-1/2 -translate-y-1/2 ${floatButton}`}>
              <CaretRight className="size-5" aria-hidden />
            </button>
          )}
        </div>

        <footer className="flex items-center gap-4 px-4 py-3 sm:px-6">
          <span className="shrink-0 text-body-sm tabular-nums" aria-live="polite">
            {page + 1} / {count}
          </span>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-neutral-800" aria-hidden>
            <div className="h-full rounded-full bg-neutral-0 transition-all" style={{ width: `${((page + 1) / count) * 100}%` }} />
          </div>
        </footer>
      </div>
    </dialog>
  );
}

/* ---------- Thumbnails ---------- */

/**
 * Small square for list tiles (Review posts, Coming up): the image, the video's first frame with a play mark,
 * or the carousel's first page with a pages mark. Text posts get a text icon.
 */
export function PostThumb({ post, size = "sm" }: { post: Post; size?: "sm" | "lg" }) {
  const src = post.video?.poster ?? post.carousel?.slides[0]?.src ?? post.image?.src;
  const box = size === "lg" ? "size-16 rounded-lg" : "size-10 rounded-md";
  if (!src) {
    return (
      <span className={`flex shrink-0 items-center justify-center bg-primary-50 text-primary-700 group-hover:bg-card ${size === "lg" ? box : "size-10 rounded-full"}`}>
        <TextAlignLeft className="size-5" aria-label="Text post" />
      </span>
    );
  }
  const kind = post.video ? "Video post" : post.carousel ? `Carousel post, ${post.carousel.slides.length} pages` : "Image post";
  const Mark = post.video ? Play : post.carousel ? Stack : null;
  return (
    <span role="img" aria-label={kind} className={`relative shrink-0 overflow-hidden ${box}`}>
      <Image src={src} alt="" fill sizes={size === "lg" ? "64px" : "40px"} className="object-cover" />
      {Mark && (
        <span className="absolute inset-0 flex items-center justify-center bg-neutral-900/40 text-inverse">
          <Mark className="size-5" aria-hidden />
        </span>
      )}
    </span>
  );
}

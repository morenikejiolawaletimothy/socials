"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** Mobile only: once the hero scrolls away, keep "Get started" one tap away. */
export function StickyCta({ watchId }: { watchId: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = document.getElementById(watchId);
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [watchId]);

  return (
    <div
      aria-hidden={!show}
      className={`fixed inset-x-4 bottom-4 z-30 transition-all md:hidden ${show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
    >
      <Link
        href="/signup"
        tabIndex={show ? 0 : -1}
        className="flex min-h-11 w-full items-center justify-center rounded-md bg-primary-600 text-body font-medium text-inverse shadow-lg hover:bg-primary-700 focus-visible:focus-ring"
      >
        Get started
      </Link>
    </div>
  );
}

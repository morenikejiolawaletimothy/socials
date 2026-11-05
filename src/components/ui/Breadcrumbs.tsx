"use client";

import Link from "next/link";
import { useCameFrom } from "@/components/shell/cameFrom";

/** `back`: this level goes to the page the person came from; label and href are the fallback when that is unknown. */
export type Crumb = { label: string; href?: string; back?: boolean };

/**
 * Where you are inside a flow. Every level is a way out.
 * On mobile only the parent and current page show, so it fits on one line.
 * Pages reached from several places mark their parent `back`, so it returns to wherever the person was.
 */
export function Breadcrumbs({ items: given }: { items: Crumb[] }) {
  const backAt = given.findIndex((c) => c.back);
  const cameFrom = useCameFrom(given[backAt] ?? { label: "" });
  const items = backAt < 0 ? given : given.map((c, i) => (i === backAt ? cameFrom : c));
  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-2 text-body-sm">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          const hiddenOnMobile = i < items.length - 2 ? "hidden sm:flex" : "flex";
          return (
            <li key={`${c.label}-${i}`} className={`${hiddenOnMobile} min-w-0 items-center gap-2`}>
              {i > 0 && (
                <span aria-hidden className={`text-neutral-300 ${i === items.length - 2 ? "hidden sm:inline" : ""}`}>
                  /
                </span>
              )}
              {last || !c.href ? (
                <span aria-current={last ? "page" : undefined} className="truncate font-medium text-primary">
                  {c.label}
                </span>
              ) : (
                <Link
                  href={c.href}
                  className="truncate rounded-sm text-secondary hover:text-primary-700 hover:underline focus-visible:focus-ring"
                >
                  {c.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

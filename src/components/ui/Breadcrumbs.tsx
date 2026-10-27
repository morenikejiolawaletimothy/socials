import Link from "next/link";

export type Crumb = { label: string; href?: string };

/**
 * Where you are inside a flow. Every level is a way out.
 * On mobile only the parent and current page show, so it fits on one line.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
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

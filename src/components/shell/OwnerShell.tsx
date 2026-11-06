"use client";

import { List } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Avatar, Dialog, Logo } from "@/components/ui";
import { useSession } from "@/lib/mock";
import { DemoBar } from "./DemoBar";
import { NotificationBell } from "./NotificationBell";
import { PageSkeleton } from "./PageSkeleton";
import { usePageReady } from "./useMounted";
import { useRoleSync } from "./useRoleSync";
import { isActive, ownerNav, pageName } from "./nav";

/** The owner menu in three groups, in the order of the main menu, split by a line and space (no labels). */
const navGroups: string[][] = [
  ["/admin", "/admin/clients", "/admin/managers", "/admin/money"],
  ["/admin/framework", "/admin/services", "/admin/complaints"],
  ["/admin/settings", "/admin/roles", "/admin/audit-log"],
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex flex-col">
      {navGroups.map((hrefs, i) => (
        <ul key={hrefs[0]} className={`flex flex-col gap-1 ${i > 0 ? "mt-4 border-t border-border pt-4" : ""}`}>
          {ownerNav
            .filter((item) => hrefs.includes(item.href))
            .map((item) => {
              const active = isActive(pathname, item);
              return (
                <li key={item.href}>
                  {/* Active: blue text on a light blue fill, no side line. */}
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-md px-4 py-2 text-body-sm font-medium transition-colors focus-visible:focus-ring ${active ? "bg-primary-50 text-primary-700" : "text-secondary hover:bg-neutral-50 hover:text-primary"}`}
                  >
                    <item.icon className="size-5 shrink-0" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
        </ul>
      ))}
    </div>
  );
}

/** Dashboard shell, used only by the owner. */
export function OwnerShell({ children }: { children: React.ReactNode }) {
  useRoleSync("owner");
  const pathname = usePathname();
  const mounted = usePageReady(pathname);

  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useSession();
  const name = user ? `${user.firstName} ${user.lastName}` : "";

  return (
    <>
      <a href="#main" className="sr-only z-50 rounded-md bg-card px-4 py-2 text-body-sm font-medium text-primary-700 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus-visible:focus-ring">
        Skip to content
      </a>
      <div className="lg:flex">
        {/* Logo strip the same height as the top bar, so their lines meet; the menu scrolls; the owner sits at the bottom under a line. */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:sticky lg:top-0 lg:flex lg:h-dvh">
          <div className="flex h-14 shrink-0 items-center border-b border-border px-4">
            <Link href="/admin" className="flex items-center gap-2 rounded-full px-2 focus-visible:focus-ring">
              <Logo size={32} />
              <span className="font-display text-display-lg text-primary">Bluecut</span>
            </Link>
          </div>
          <nav aria-label="Main" className="flex-1 overflow-y-auto px-4 py-6">
            <NavList />
          </nav>
          <div className="flex shrink-0 items-center gap-3 border-t border-border px-6 py-4">
            <Avatar name={name || "Owner"} src={user?.photo} size="md" />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-body-sm font-semibold text-primary">{name}</span>
              <span className="text-caption text-secondary">Owner</span>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <DemoBar />
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:justify-end lg:px-8">
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                className="flex size-10 items-center justify-center rounded-full text-secondary hover:bg-primary-50 hover:text-primary-700 focus-visible:focus-ring"
              >
                <List className="size-5" aria-hidden />
              </button>
              <Logo size={28} />
            </div>
            <NotificationBell href="/admin/notifications" />
          </header>
          <main id="main" tabIndex={-1} className="px-4 py-6 outline-none lg:px-8 lg:py-8">
            <title>{`${pageName(pathname)} · Bluecut Socials`}</title>
            {mounted ? children : <PageSkeleton />}</main>
        </div>
      </div>

      <Dialog open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu" variant="sheet">
        <div className="flex items-center gap-2">
          <Logo size={28} />
          <span className="font-display text-display-lg text-primary">Bluecut</span>
        </div>
        <nav aria-label="Main">
          <NavList onNavigate={() => setMenuOpen(false)} />
        </nav>
      </Dialog>
    </>
  );
}

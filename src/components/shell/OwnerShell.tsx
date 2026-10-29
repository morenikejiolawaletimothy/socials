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
import { isActive, navItemClass, ownerNav } from "./nav";

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="flex flex-col gap-1">
      {ownerNav.map((item) => {
        const active = isActive(pathname, item);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-md px-4 py-2 text-body-sm font-medium ${navItemClass(active, "vertical")}`}
            >
              <item.icon className="size-5" aria-hidden />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
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
      <div className="lg:flex">
        <aside className="hidden w-64 shrink-0 flex-col gap-6 border-r border-border bg-card px-4 py-6 lg:sticky lg:top-0 lg:flex lg:h-dvh">
          <Link href="/admin" className="flex items-center gap-2 rounded-full px-2 focus-visible:focus-ring">
            <Logo size={32} />
            <span className="font-display text-display-lg text-primary">Bluecut</span>
          </Link>
          <nav aria-label="Main" className="flex-1">
            <NavList />
          </nav>
          <div className="flex items-center gap-3 px-2">
            <Avatar name={name || "Owner"} src={user?.photo} size="sm" />
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
          <main className="px-4 py-6 lg:px-8 lg:py-8">{mounted ? children : <PageSkeleton />}</main>
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

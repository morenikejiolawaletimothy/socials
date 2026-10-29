"use client";

import { Bell, CaretDown } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, Logo, Menu } from "@/components/ui";
import { useNotifications, useSession } from "@/lib/mock";
import { CoveringBanner } from "./CoveringBanner";
import { DemoBar } from "./DemoBar";
import { isActive, mainNav, meHref, meIcon as MeIcon, navItemClass, profileNav, type NavItem } from "./nav";
import { PageSkeleton } from "./PageSkeleton";
import { usePageReady } from "./useMounted";
import { useRoleSync } from "./useRoleSync";

function UnreadDot({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="absolute -right-2 -top-1 flex min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-caption leading-4 text-inverse">
      {count}
    </span>
  );
}

/** Desktop nav item: icon above a short label, like LinkedIn's top bar. */
function TopItem({ item, active, count = 0 }: { item: NavItem; active: boolean; count?: number }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      aria-label={count ? `${item.label}, ${count} new` : undefined}
      className={`flex h-14 min-w-20 flex-col items-center justify-center gap-1 px-2 text-caption ${navItemClass(active)}`}
    >
      <span className="relative">
        <item.icon className="size-6" aria-hidden />
        <UnreadDot count={count} />
      </span>
      {item.label}
    </Link>
  );
}

/**
 * Web app shell for clients and managers (not a dashboard), laid out like LinkedIn.
 * Top bar and page share one container so columns line up with the logo and the Me menu.
 * Mobile: compact top bar plus a floating bottom bar.
 */
export function AppShell({ role, children }: { role: "client" | "manager"; children: React.ReactNode }) {
  useRoleSync(role);
  const pathname = usePathname();
  const mounted = usePageReady(pathname);
  const { user } = useSession();
  const unread = useNotifications(user?.id).filter((n) => !n.read).length;
  const name = user ? `${user.firstName} ${user.lastName}` : "";
  const home = mainNav[role][0].href;
  const notifications: NavItem = {
    label: "Notifications",
    href: role === "client" ? "/notifications" : "/manager/notifications",
    icon: Bell,
  };
  const meActive = pathname === meHref[role] || profileNav[role].some((i) => isActive(pathname, i));

  return (
    <>
      <DemoBar />
      {role === "manager" && <CoveringBanner />}
      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href={home} className="flex items-center gap-2 rounded-full focus-visible:focus-ring" aria-label="Bluecut Socials home">
            <Logo size={36} />
            <span className="font-display text-display-lg text-primary">Bluecut</span>
          </Link>

          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center">
              {mainNav[role].map((item) => (
                <li key={item.href}>
                  <TopItem item={item} active={isActive(pathname, item)} />
                </li>
              ))}
              <li>
                <TopItem item={notifications} active={isActive(pathname, notifications)} count={unread} />
              </li>
              <li>
                <Menu
                  label="Me"
                  triggerClassName={`flex h-14 min-w-20 flex-col items-center justify-center gap-1 px-2 text-caption ${navItemClass(meActive)}`}
                  trigger={
                    <>
                      <Avatar name={name || "You"} size="xs" />
                      <span className="flex items-center gap-1">
                        Me <CaretDown className="size-3" aria-hidden />
                      </span>
                    </>
                  }
                  header={
                    <div className="flex items-center gap-3">
                      <Avatar name={name || "You"} />
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-body-sm font-semibold text-primary">{name}</span>
                        <span className="truncate text-caption text-secondary">{user?.title}</span>
                      </div>
                    </div>
                  }
                  items={[...profileNav[role].map((i) => ({ label: i.label, href: i.href })), { label: "Sign out", href: "/" }]}
                />
              </li>
            </ul>
          </nav>

          <Link
            href={notifications.href}
            aria-label={unread ? `Notifications, ${unread} new` : "Notifications"}
            className="relative flex size-10 items-center justify-center rounded-full text-secondary hover:text-primary focus-visible:focus-ring md:hidden"
          >
            <span className="relative">
              <Bell className="size-6" aria-hidden />
              <UnreadDot count={unread} />
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-32 pt-6 md:pb-16">{mounted ? children : <PageSkeleton />}</main>

      <nav aria-label="Main" data-bottom-bar className="fixed inset-x-4 bottom-4 z-30 rounded-xl border border-border bg-card px-2 shadow-lg md:hidden">
        <ul className="grid grid-cols-4">
          {[...mainNav[role], { label: "Me", href: meHref[role], icon: MeIcon }].map((item) => {
            const active = item.label === "Me" ? meActive : isActive(pathname, item);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center gap-1 pb-3 pt-2 text-caption ${navItemClass(active)}`}
                >
                  <item.icon className="size-6" aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

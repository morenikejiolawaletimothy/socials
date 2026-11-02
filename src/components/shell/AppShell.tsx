"use client";

import { Bell, CaretDown } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Avatar, EmptyState, Logo, Menu, Tooltip } from "@/components/ui";
import { act, useNotifications, useSession } from "@/lib/mock";
import { CoveringBanner } from "./CoveringBanner";
import { DemoBar } from "./DemoBar";
import { isActive, mainNav, pageName, meHref, meIcon as MeIcon, navItemClass, profileNav, type NavItem } from "./nav";
import { PageSkeleton } from "./PageSkeleton";
import { usePageReady } from "./useMounted";
import { useRoleSync } from "./useRoleSync";

/** Red count on a nav icon, so new things stand out and invite a click. */
function UnreadDot({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="absolute -right-2 -top-1 flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-caption leading-4 text-inverse ring-2 ring-neutral-0">
      {count}
    </span>
  );
}

/** Desktop nav item: icon only, with a tooltip naming it on hover or keyboard focus. */
function TopItem({ item, active, count = 0 }: { item: NavItem; active: boolean; count?: number }) {
  return (
    <Tooltip label={item.label}>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        aria-label={count ? `${item.label}, ${count} new` : item.label}
        className={`flex h-14 items-center px-4 ${navItemClass(active)}`}
      >
        <span className="relative">
          <item.icon className="size-6" aria-hidden />
          <UnreadDot count={count} />
        </span>
      </Link>
    </Tooltip>
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
  const title = pageName(pathname);

  const { user } = useSession();
  const myNotifications = useNotifications(user?.id);
  const unread = myNotifications.filter((n) => !n.read).length;
  const messagesHref = mainNav[role].find((i) => i.label === "Messages")?.href;
  // New messages arrive as notifications that link to Messages; opening Messages clears them.
  const unreadMessageIds = myNotifications.filter((n) => !n.read && messagesHref && n.href.startsWith(messagesHref)).map((n) => n.id);
  const onMessages = Boolean(messagesHref && pathname.startsWith(messagesHref));
  const unreadKey = unreadMessageIds.join(",");
  useEffect(() => {
    if (onMessages && unreadKey) unreadKey.split(",").forEach((id) => act.markRead(id));
  }, [onMessages, unreadKey]);
  const countFor = (href: string) => (href === messagesHref ? unreadMessageIds.length : 0);
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
      <a href="#main" className="sr-only z-50 rounded-md bg-card px-4 py-2 text-body-sm font-medium text-primary-700 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus-visible:focus-ring">
        Skip to content
      </a>
      <DemoBar />
      {role === "manager" && <CoveringBanner />}
      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <div className="flex flex-1 items-center">
            <Link href={home} className="flex items-center gap-2 rounded-full focus-visible:focus-ring" aria-label="Bluecut Socials home">
              <Logo size={36} />
              <span className="font-display text-display-lg text-primary">Bluecut</span>
            </Link>
          </div>

          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-4">
              {mainNav[role].map((item) => (
                <li key={item.href}>
                  <TopItem item={item} active={isActive(pathname, item)} count={countFor(item.href)} />
                </li>
              ))}
              <li>
                <TopItem item={notifications} active={isActive(pathname, notifications)} count={unread} />
              </li>
            </ul>
          </nav>

          <div className="flex flex-1 items-center justify-end">
            <div className="hidden md:block">
                <Menu
                  label="Your account"
                  triggerClassName={`flex h-14 items-center gap-1 px-2 ${navItemClass(meActive)}`}
                  trigger={
                    <>
                      <Avatar name={name || "You"} src={user?.photo} size="md" />
                      <CaretDown className="size-4" aria-hidden />
                    </>
                  }
                  header={
                    <div className="flex items-center gap-3">
                      <Avatar name={name || "You"} src={user?.photo} />
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-body-sm font-semibold text-primary">{name}</span>
                        <span className="truncate text-caption text-secondary">{user?.title}</span>
                      </div>
                    </div>
                  }
                  items={[...profileNav[role].map((i) => ({ label: i.label, href: i.href })), { label: "Sign out", href: "/" }]}
                />
            </div>

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
        </div>
      </header>

      <main id="main" tabIndex={-1} className="mx-auto outline-none w-full max-w-6xl px-4 pb-32 pt-6 md:pb-16">
        <title>{`${title} · Bluecut Socials`}</title>
        <h1 className="sr-only">{title}</h1>
        {!mounted ? (
          <PageSkeleton />
        ) : user?.deletedAt ? (
          <EmptyState
            title="This account has been deleted"
            action={
              <Link href="/signup" className="inline-flex min-h-11 items-center rounded-md bg-primary-600 px-6 text-body font-medium text-inverse hover:bg-primary-700 focus-visible:focus-ring">
                Sign up again
              </Link>
            }
          >
            Your data has been removed. We kept only invoices and payment records, as the law requires.
          </EmptyState>
        ) : (
          children
        )}</main>

      <nav aria-label="Main" data-bottom-bar className="fixed inset-x-4 bottom-4 z-30 rounded-xl border border-border bg-card px-2 shadow-lg md:hidden">
        <ul className="grid grid-cols-4">
          {[...mainNav[role], { label: "Me", href: meHref[role], icon: MeIcon }].map((item) => {
            const active = item.label === "Me" ? meActive : isActive(pathname, item);
            const count = countFor(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  aria-label={count ? `${item.label}, ${count} new` : undefined}
                  className={`flex flex-col items-center gap-1 pb-3 pt-2 text-caption ${navItemClass(active)}`}
                >
                  <span className="relative">
                    <item.icon className="size-6" aria-hidden />
                    <UnreadDot count={count} />
                  </span>
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, Logo, Menu, ToastProvider } from "@/components/ui";
import { useSession } from "@/lib/mock";
import { DemoBar } from "./DemoBar";
import { NotificationBell } from "./NotificationBell";
import { useRoleSync } from "./useRoleSync";
import { isActive, mainNav, meHref, meIcon as MeIcon, navItemClass, profileNav } from "./nav";

/**
 * Web app shell for clients and managers (not a dashboard).
 * Desktop: slim top bar. Mobile: compact floating bottom bar.
 */
export function AppShell({ role, children }: { role: "client" | "manager"; children: React.ReactNode }) {
  useRoleSync(role);
  const pathname = usePathname();
  const { user } = useSession();
  const name = user ? `${user.firstName} ${user.lastName}` : "";
  const home = mainNav[role][0].href;
  const notificationsHref = role === "client" ? "/notifications" : "/manager/notifications";
  const meActive = pathname === meHref[role] || profileNav[role].some((i) => isActive(pathname, i));

  return (
    <ToastProvider>
      <DemoBar />
      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href={home} className="flex items-center gap-2 rounded-full focus-visible:focus-ring" aria-label="Bluecut Socials home">
            <Logo size={32} />
            <span className="hidden font-display text-display-lg text-primary sm:inline">Bluecut</span>
          </Link>

          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {mainNav[role].map((item) => {
                const active = isActive(pathname, item);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-2 px-3 py-2 text-body-sm font-medium ${navItemClass(active)}`}
                    >
                      <item.icon className="size-5" aria-hidden />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <NotificationBell href={notificationsHref} />
            <Menu
              label="Your menu"
              trigger={<Avatar name={name || "You"} size="sm" />}
              header={
                <div className="flex flex-col">
                  <span className="text-body-sm font-semibold text-primary">{name}</span>
                  <span className="text-caption text-secondary">{user?.title}</span>
                </div>
              }
              items={[...profileNav[role].map((i) => ({ label: i.label, href: i.href })), { label: "Sign out", href: "/" }]}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-32 pt-6 md:pb-16">{children}</main>

      <nav
        aria-label="Main"
        className="fixed inset-x-4 bottom-4 z-30 rounded-xl border border-border bg-card p-1 shadow-lg md:hidden"
      >
        <ul className="grid grid-cols-4">
          {[...mainNav[role], { label: "Me", href: meHref[role], icon: MeIcon }].map((item) => {
            const active = item.label === "Me" ? meActive : isActive(pathname, item);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center gap-1 py-2 text-caption ${navItemClass(active)}`}
                >
                  <item.icon className="size-5" aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </ToastProvider>
  );
}

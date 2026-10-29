import {
  BookOpen,
  ChatCircle,
  CurrencyCircleDollar,
  Gear,
  House,
  IdentificationBadge,
  ListChecks,
  Megaphone,
  SquaresFour,
  UserCircle,
  Users,
  UsersThree,
  WarningCircle,
  type Icon,
} from "@phosphor-icons/react";
import type { Role } from "@/lib/mock";

export type NavItem = { label: string; href: string; icon: Icon; exact?: boolean };

/** Main navigation per role. Kept short: 3 items plus "Me" on mobile. */
export const mainNav: Record<Exclude<Role, "owner">, NavItem[]> = {
  client: [
    { label: "Home", href: "/home", icon: House },
    { label: "Content", href: "/content", icon: Megaphone },
    { label: "Messages", href: "/messages", icon: ChatCircle },
  ],
  manager: [
    { label: "Home", href: "/manager", icon: House, exact: true },
    { label: "Clients", href: "/manager/clients", icon: UsersThree },
    { label: "Messages", href: "/manager/messages", icon: ChatCircle },
  ],
};

/** Items under the profile menu (desktop) and the Me page (mobile). */
export const profileNav: Record<Exclude<Role, "owner">, { label: string; href: string; description: string }[]> = {
  client: [
    { label: "Your brand", href: "/brand", description: "Photos, voice, Moments and what is off limits" },
    { label: "Control", href: "/control", description: "What we do for you, how you review, activity" },
    { label: "Contract", href: "/contract", description: "Your plan, payments and invoices" },
    { label: "Account", href: "/account", description: "Profile, sign-in and notifications" },
  ],
  manager: [
    { label: "Calls and availability", href: "/manager/calls", description: "Your open slots and booked calls" },
    { label: "Profile", href: "/manager/profile", description: "Photo, intro, sign-in and notifications" },
  ],
};

export const meHref: Record<Exclude<Role, "owner">, string> = { client: "/me", manager: "/manager/me" };
export const meIcon = UserCircle;

export const ownerNav: NavItem[] = [
  { label: "Overview", href: "/admin", icon: SquaresFour, exact: true },
  { label: "Clients", href: "/admin/clients", icon: Users },
  { label: "Managers", href: "/admin/managers", icon: IdentificationBadge },
  { label: "Framework", href: "/admin/framework", icon: BookOpen },
  { label: "Money", href: "/admin/money", icon: CurrencyCircleDollar },
  { label: "Complaints", href: "/admin/complaints", icon: WarningCircle },
  { label: "Settings", href: "/admin/settings", icon: Gear },
  { label: "Audit log", href: "/admin/audit-log", icon: ListChecks },
];

export function isActive(pathname: string, item: { href: string; exact?: boolean }) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/**
 * One hover and active treatment for every navigation item in the product:
 * the active item turns brand blue with a short indicator line (under it, or beside it in vertical menus).
 */
export const navItemClass = (active: boolean, direction: "horizontal" | "vertical" = "horizontal") =>
  `relative transition-colors focus-visible:focus-ring ${
    active
      ? `text-primary-700 ${
          direction === "horizontal"
            ? "after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary-700"
            : "before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-primary-700"
        }`
      : "text-secondary hover:text-primary"
  }`;

/** Page names for the browser tab and the screen-reader heading (client and manager pages have no visible title). */
const pageNames: [RegExp, string][] = [
  [/^\/home$/, "Home"],
  [/^\/content\/review$/, "Review your posts"],
  [/^\/content$/, "Your content"],
  [/^\/strategy$/, "Your strategy"],
  [/^\/progress\/[^/]+$/, "Update"],
  [/^\/progress$/, "Progress"],
  [/^\/tasks\/[^/]+$/, "Quick task"],
  [/^\/messages$/, "Messages"],
  [/^\/notifications$/, "Notifications"],
  [/^\/brand$/, "Your brand"],
  [/^\/control\/complaint$/, "Raise a complaint"],
  [/^\/control$/, "Control"],
  [/^\/contract\/cancel$/, "Pull out of your contract"],
  [/^\/contract$/, "Contract"],
  [/^\/account$/, "Account"],
  [/^\/me$/, "Me"],
  [/^\/setup\/linkedin$/, "Connect LinkedIn"],
  [/^\/setup\/calls$/, "Book your calls"],
  [/^\/setup\/plan$/, "Choose a plan"],
  [/^\/setup\/review$/, "Set how you review"],
  [/^\/manager$/, "Home"],
  [/^\/manager\/clients\/[^/]+\/content$/, "Client content"],
  [/^\/manager\/clients\/[^/]+\/onboard$/, "Onboarding"],
  [/^\/manager\/clients\/[^/]+$/, "Client"],
  [/^\/manager\/clients$/, "Your clients"],
  [/^\/manager\/messages$/, "Messages"],
  [/^\/manager\/notifications$/, "Notifications"],
  [/^\/manager\/calls$/, "Calls and availability"],
  [/^\/manager\/profile$/, "Profile"],
  [/^\/manager\/me$/, "Me"],
  [/^\/admin$/, "Overview"],
  [/^\/admin\/clients\/[^/]+$/, "Client"],
  [/^\/admin\/managers\/[^/]+$/, "Manager"],
  [/^\/admin\/complaints\/[^/]+$/, "Complaint"],
  [/^\/admin\/notifications$/, "Notifications"],
];

export function pageName(pathname: string) {
  return pageNames.find(([re]) => re.test(pathname))?.[1] ?? ownerNav.find((i) => isActive(pathname, i))?.label ?? "Bluecut Socials";
}

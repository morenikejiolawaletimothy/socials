"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card } from "@/components/ui";

/** Left-column menu for settings-style pages, like LinkedIn's "Manage my network". */
export function SideMenu({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  const pathname = usePathname();
  return (
    <Card padding="none">
      <p className="border-b border-border px-6 py-4 font-display text-display-lg text-primary">{title}</p>
      <nav aria-label={title} className="p-2">
        <ul className="flex flex-col">
          {items.map((i) => {
            const active = pathname === i.href;
            return (
              <li key={i.href}>
                <Link
                  href={i.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative block rounded-md px-4 py-3 text-body-sm font-medium focus-visible:focus-ring ${
                    active
                      ? "text-primary-700 before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-primary-700"
                      : "text-secondary hover:text-primary"
                  }`}
                >
                  {i.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </Card>
  );
}

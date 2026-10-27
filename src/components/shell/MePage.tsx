"use client";

import Link from "next/link";
import { Card } from "@/components/ui";
import { profileNav } from "./nav";

/** Mobile "Me" tab: the same items as the desktop profile menu. */
export function MePage({ role }: { role: "client" | "manager" }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Card title="Me" padding="sm">
        <ul className="flex flex-col">
          {[...profileNav[role], { label: "Sign out", href: "/", description: "Leave the demo" }].map((i) => (
            <li key={i.href + i.label}>
              <Link href={i.href} className="flex flex-col gap-1 rounded-md px-4 py-3 hover:bg-primary-50 focus-visible:focus-ring">
                <span className="text-body font-medium text-primary">{i.label}</span>
                <span className="text-body-sm text-secondary">{i.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

"use client";

import { Palette, Target, type Icon } from "@phosphor-icons/react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { useDb, useSession } from "@/lib/mock";

/** Left-column card under the profile card: the client's own strategy and brand assets. */
export function AccountLinksCard() {
  const { role, user } = useSession();
  const client = useDb((db) => db.clients.find((c) => c.userId === user?.id));
  if (role !== "client" || !client) return null;

  const links: { label: string; href: string; icon: Icon }[] = [
    ...(client.stage === "running" ? [{ label: "Strategy", href: "/strategy", icon: Target }] : []),
    { label: "Brand assets", href: "/brand", icon: Palette },
  ];

  return (
    <Card title="My brand" padding="none">
      <nav aria-label="My brand" className="flex flex-col py-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex items-center gap-3 px-6 py-3 text-body-sm font-medium text-primary hover:bg-primary-50 hover:text-primary-700 focus-visible:focus-ring"
          >
            <l.icon className="size-5 shrink-0 text-primary-700" aria-hidden />
            {l.label}
          </Link>
        ))}
      </nav>
    </Card>
  );
}

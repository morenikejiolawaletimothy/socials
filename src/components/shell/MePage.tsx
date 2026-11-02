"use client";

import Link from "next/link";
import { AccountLinksCard } from "@/components/rails/AccountLinksCard";
import { CallsCard } from "@/components/rails/CallsCard";
import { GoalCard } from "@/components/rails/GoalCard";
import { ManagerCard } from "@/components/rails/ManagerCard";
import { NextCallCard } from "@/components/rails/NextCallCard";
import { ProfileCard } from "@/components/rails/ProfileCard";
import { WeekCard } from "@/components/rails/WeekCard";
import { Card } from "@/components/ui";
import { profileNav } from "./nav";

/**
 * Mobile "Me" tab. Phones hide the side columns, so their cards live here:
 * the profile, then (clients) goal, account manager, this week and My brand, or (managers) today's calls.
 * Then the same links as the desktop profile menu.
 */
export function MePage({ role }: { role: "client" | "manager" }) {
  // "Your brand" is already in the My brand card for clients, so it is not repeated in the list.
  const links = profileNav[role].filter((i) => !(role === "client" && i.href === "/brand"));

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <ProfileCard />
      {role === "client" ? (
        <>
          <GoalCard />
          <ManagerCard />
          <NextCallCard />
          <WeekCard />
          <AccountLinksCard />
        </>
      ) : (
        <CallsCard />
      )}
      <Card title="Settings" padding="sm">
        <ul className="flex flex-col">
          {[...links, { label: "Sign out", href: "/", description: "Leave the demo" }].map((i) => (
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

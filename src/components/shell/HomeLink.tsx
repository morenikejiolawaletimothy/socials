"use client";

import Link from "next/link";
import { buttonClass } from "@/components/ui";
import { useSession } from "@/lib/mock";

const homes = { client: "/home", manager: "/manager", owner: "/admin" } as const;

/** "Go to Home" for whoever is signed in: the client, manager or owner home. */
export function HomeLink({ variant = "primary" }: { variant?: "primary" | "secondary" }) {
  const { role } = useSession();
  return (
    <Link href={homes[role] ?? "/"} className={buttonClass(variant)}>
      Go to Home
    </Link>
  );
}

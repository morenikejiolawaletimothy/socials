"use client";

import { useRouter } from "next/navigation";
import { DelegatedAccessSetup } from "@/components/client/DelegatedAccessSetup";
import { useMyClient } from "@/lib/mock";

/** Full-service onboarding: set up secure delegated access (vault login + authenticator 2FA). No LinkedIn API. */
export default function SetupAccessPage() {
  const router = useRouter();
  const { client } = useMyClient();
  if (!client) return null;
  // Self-serve clients have no access step; send them on.
  if (client.service !== "full-service") {
    router.replace("/home");
    return null;
  }
  return <DelegatedAccessSetup inSetup />;
}

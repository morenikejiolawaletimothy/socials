"use client";

import { Columns } from "@/components/layout/Columns";
import { ManagerCard } from "@/components/rails/ManagerCard";
import { ProfileCard } from "@/components/rails/ProfileCard";
import { rails } from "@/components/rails";
import { PausedCard, SetupCard, StateBanners } from "@/components/client/HomeCards";
import { HomeTabs } from "@/components/client/HomeTabs";
import { useMyClient } from "@/lib/mock";

/**
 * Figma Home. During setup: profile (with progress), Account setup, Account manager. After setup, for both
 * account types: profile and Resources, the tabbed feed (Feed · Calls · Coming up · Reports · History), Account manager.
 */
export default function HomePage() {
  const b = useMyClient();
  const settingUp = b.client?.stage === "setup";

  if (settingUp) {
    return (
      <Columns left={<ProfileCard />} leftLabel="Your profile" right={<ManagerCard />} rightLabel="Your account manager">
        <SetupCard b={b} />
      </Columns>
    );
  }

  return (
    <Columns {...rails.clientHome}>
      <PausedCard b={b} />
      <StateBanners b={b} />
      <HomeTabs b={b} />
    </Columns>
  );
}

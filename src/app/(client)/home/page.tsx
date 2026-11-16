"use client";

import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import {
  CallsCard,
  PausedCard,
  SetupCard,
  StateBanners,
  StrategyReadyCard,
} from "@/components/client/HomeCards";
import { HomeTabs } from "@/components/client/HomeTabs";
import { useMyClient } from "@/lib/mock";

/**
 * C1 Home (Figma feed-tab model). Before the account is running it leads with setup, the two calls
 * and the strategy-ready card. Once running, the centre becomes the tabbed feed: Feed · Calls ·
 * Coming up · Reports · History.
 */
export default function HomePage() {
  const b = useMyClient();
  const running = b.client?.stage === "running";

  return (
    <Columns {...rails.clientHome}>
      <PausedCard b={b} />
      <StateBanners b={b} />
      {running ? (
        <HomeTabs b={b} />
      ) : (
        <>
          <SetupCard b={b} />
          <StrategyReadyCard b={b} />
          <CallsCard b={b} />
        </>
      )}
    </Columns>
  );
}

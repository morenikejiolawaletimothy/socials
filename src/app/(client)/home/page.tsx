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
import { HomeFeed } from "@/components/client/HomeFeed";
import { useMyClient } from "@/lib/mock";

/**
 * C1 Home. Changes with where the client is:
 * setting up (setup card), before the calls (the two calls), strategy ready, then a feed of cards.
 * Paused accounts lead with the paused card (C16).
 */
export default function HomePage() {
  const b = useMyClient();
  const running = b.client?.stage === "running";
  const paused = b.client?.status === "paused";

  return (
    <Columns {...rails.clientFeed}>
      <PausedCard b={b} />
      <StateBanners b={b} />
      <SetupCard b={b} />
      <StrategyReadyCard b={b} />
      <CallsCard b={b} />
      {running && <HomeFeed b={b} primary={!paused} />}
    </Columns>
  );
}

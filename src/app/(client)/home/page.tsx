"use client";

import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import {
  CallsCard,
  LiveCard,
  MessageCard,
  PausedCard,
  ReviewCard,
  SetupCard,
  StateBanners,
  StrategyReadyCard,
  TasksCard,
  UpcomingCard,
  UpdateCard,
} from "@/components/client/HomeCards";
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
      {running && (
        <>
          <TasksCard b={b} />
          <ReviewCard b={b} primary={!paused} />
          <UpdateCard b={b} />
          <LiveCard b={b} />
          <UpcomingCard b={b} />
          <MessageCard b={b} />
        </>
      )}
    </Columns>
  );
}

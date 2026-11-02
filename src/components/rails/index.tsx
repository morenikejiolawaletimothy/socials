"use client";

import { SideMenu } from "@/components/layout/SideMenu";
import { AccountLinksCard } from "./AccountLinksCard";
import { CallsCard } from "./CallsCard";
import { GoalCard } from "./GoalCard";
import { ManagerCard } from "./ManagerCard";
import { clientAccountMenu, managerAccountMenu } from "./menus";
import { NextCallCard } from "./NextCallCard";
import { ProfileCard } from "./ProfileCard";
import { WeekCard } from "./WeekCard";

/** Named column sets so every page of a kind is laid out the same way. */
export const rails = {
  clientFeed: {
    left: (
      <>
        <ProfileCard />
        <GoalCard />
        <AccountLinksCard />
      </>
    ),
    leftLabel: "Your profile and account",
    right: (
      <>
        <ManagerCard />
        <NextCallCard />
        <WeekCard />
      </>
    ),
    rightLabel: "Your manager and this week",
  },
  clientMain: {
    right: (
      <>
        <ManagerCard />
        <NextCallCard />
      </>
    ),
    rightLabel: "Your manager",
  },
  /** Messages: the chat already shows the manager at the top, so only the calls card sits beside it. */
  clientMessages: {
    right: <NextCallCard />,
    rightLabel: "Upcoming calls",
  },
  /** The account manager's profile page: the page is the manager, so only the calls card sits beside it. */
  clientManagerProfile: {
    right: <NextCallCard />,
    rightLabel: "Upcoming calls",
  },
  clientSettings: { left: <SideMenu {...clientAccountMenu} />, leftLabel: "Your account" },
  managerFeed: { left: <ProfileCard />, leftLabel: "Your profile", right: <CallsCard />, rightLabel: "Calls today" },
  managerMain: { right: <CallsCard />, rightLabel: "Calls today" },
  managerSettings: { left: <SideMenu {...managerAccountMenu} />, leftLabel: "Your account" },
};
export type RailSet = keyof typeof rails;

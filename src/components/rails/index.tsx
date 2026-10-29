"use client";

import { SideMenu } from "@/components/layout/SideMenu";
import { CallsCard } from "./CallsCard";
import { ManagerCard } from "./ManagerCard";
import { clientAccountMenu, managerAccountMenu } from "./menus";
import { ProfileCard } from "./ProfileCard";
import { WeekCard } from "./WeekCard";

/** Named column sets so every page of a kind is laid out the same way. */
export const rails = {
  clientFeed: {
    left: <ProfileCard />,
    leftLabel: "Your profile",
    right: (
      <>
        <ManagerCard />
        <WeekCard />
      </>
    ),
    rightLabel: "Your manager and this week",
  },
  clientMain: { right: <ManagerCard />, rightLabel: "Your manager" },
  clientSettings: { left: <SideMenu {...clientAccountMenu} />, leftLabel: "Your account" },
  managerFeed: { left: <ProfileCard />, leftLabel: "Your profile", right: <CallsCard />, rightLabel: "Calls today" },
  managerMain: { right: <CallsCard />, rightLabel: "Calls today" },
  managerSettings: { left: <SideMenu {...managerAccountMenu} />, leftLabel: "Your account" },
};
export type RailSet = keyof typeof rails;

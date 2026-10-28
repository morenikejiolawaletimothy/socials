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
    right: (
      <>
        <ManagerCard />
        <WeekCard />
      </>
    ),
  },
  clientMain: { right: <ManagerCard /> },
  clientSettings: { left: <SideMenu {...clientAccountMenu} /> },
  managerFeed: { left: <ProfileCard />, right: <CallsCard /> },
  managerMain: { right: <CallsCard /> },
  managerSettings: { left: <SideMenu {...managerAccountMenu} /> },
};
export type RailSet = keyof typeof rails;

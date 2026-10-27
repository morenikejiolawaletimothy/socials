"use client";

import { SideMenu } from "@/components/layout/SideMenu";
import { CallsCard } from "./CallsCard";
import { ManagerCard } from "./ManagerCard";
import { clientAccountMenu, managerAccountMenu } from "./menus";
import { ProfileCard } from "./ProfileCard";

/** Named column sets so every page of a kind is laid out the same way. */
export const rails = {
  clientFeed: { left: <ProfileCard />, right: <ManagerCard /> },
  clientMain: { right: <ManagerCard /> },
  clientSettings: { left: <SideMenu {...clientAccountMenu} /> },
  managerFeed: { left: <ProfileCard />, right: <CallsCard /> },
  managerMain: { right: <CallsCard /> },
  managerSettings: { left: <SideMenu {...managerAccountMenu} /> },
};
export type RailSet = keyof typeof rails;

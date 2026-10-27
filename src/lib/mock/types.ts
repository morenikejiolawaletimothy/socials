// Domain types shared by the mock layer (Phase 1) and the real backend (Phase 2).

export type Role = "client" | "manager" | "owner";

export type ClientStatus = "setting-up" | "free" | "active" | "paused" | "removed";

export type User = {
  id: string;
  role: Role;
  firstName: string;
  lastName: string;
  email: string;
  title?: string;
  timeZone: string;
};

export type Client = {
  id: string;
  userId: string;
  managerId: string | null;
  company: string;
  role: string;
  country: string;
  status: ClientStatus;
  /** 0 to 100, setup progress shown on Home. */
  setupProgress: number;
  goal: string;
};

export type Manager = {
  id: string;
  userId: string;
  status: "invited" | "waiting-for-training" | "active" | "suspended";
  intro: string;
  maxClients: number;
};

export type Notification = {
  id: string;
  userId: string;
  text: string;
  href: string;
  createdAt: string;
  read: boolean;
};

export type DemoSession = {
  role: Role;
  /** The user currently viewing, per role. */
  userIds: Record<Role, string>;
};

export type Db = {
  version: number;
  session: DemoSession;
  users: User[];
  clients: Client[];
  managers: Manager[];
  notifications: Notification[];
};

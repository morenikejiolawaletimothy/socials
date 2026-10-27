import type { Db } from "./types";

// Realistic dummy data. Names and companies are fictional.
export function seed(): Db {
  const now = Date.now();
  const hoursAgo = (h: number) => new Date(now - h * 3_600_000).toISOString();

  return {
    version: 2,
    session: {
      role: "client",
      userIds: { client: "u-chidi", manager: "u-ada", owner: "u-fola" },
    },
    users: [
      { id: "u-fola", role: "owner", firstName: "Fola", lastName: "Morenikeji", email: "fola@bluecut.example", title: "Founder", timeZone: "Africa/Lagos", twoStep: true },
      { id: "u-ada", role: "manager", firstName: "Ada", lastName: "Obi", email: "ada@bluecut.example", title: "Account manager", timeZone: "Africa/Lagos", twoStep: true },
      { id: "u-tunde", role: "manager", firstName: "Tunde", lastName: "Bakare", email: "tunde@bluecut.example", title: "Account manager", timeZone: "Europe/London", twoStep: true },
      { id: "u-chidi", role: "client", firstName: "Chidi", lastName: "Okeke", email: "chidi@paystream.example", title: "CEO, Paystream", timeZone: "Africa/Lagos", twoStep: false },
      { id: "u-sarah", role: "client", firstName: "Sarah", lastName: "Mensah", email: "sarah@lumenhealth.example", title: "Co-founder, Lumen Health", timeZone: "Africa/Accra", twoStep: false },
      { id: "u-david", role: "client", firstName: "David", lastName: "Adeyemi", email: "david@adeyemilaw.example", title: "Managing partner, Adeyemi & Co", timeZone: "Africa/Lagos", twoStep: false },
      { id: "u-bisi", role: "manager", firstName: "Bisi", lastName: "Adebayo", email: "bisi@bluecut.example", title: "Account manager", timeZone: "Africa/Lagos", twoStep: false },
      { id: "u-kemi", role: "client", firstName: "Kemi", lastName: "Ola", email: "kemi@northwind.example", title: "Head of product, Northwind", timeZone: "America/Toronto", twoStep: false },
    ],
    clients: [
      { id: "c-chidi", userId: "u-chidi", managerId: "m-ada", company: "Paystream", role: "CEO", country: "Nigeria", status: "active", setupProgress: 100, goal: "Be known as a leading voice on payments in West Africa and attract investor conversations." },
      { id: "c-sarah", userId: "u-sarah", managerId: "m-ada", company: "Lumen Health", role: "Co-founder", country: "Ghana", status: "free", setupProgress: 100, goal: "Build trust with hospital leaders ahead of a regional launch." },
      { id: "c-david", userId: "u-david", managerId: null, company: "Adeyemi & Co", role: "Managing partner", country: "Nigeria", status: "setting-up", setupProgress: 33, goal: "Win board roles and speaking invitations." },
      { id: "c-kemi", userId: "u-kemi", managerId: "m-tunde", company: "Northwind", role: "Head of product", country: "Canada", status: "paused", setupProgress: 100, goal: "Grow visibility for a move into a VP role." },
    ],
    managers: [
      { id: "m-ada", userId: "u-ada", status: "active", intro: "I help founders in fintech and health tell their story on LinkedIn.", maxClients: 10 },
      { id: "m-bisi", userId: "u-bisi", status: "invited", intro: "", maxClients: 10, inviteToken: "demo-invite", inviteExpiresAt: new Date(now + 6 * 86_400_000).toISOString() },
      { id: "m-tunde", userId: "u-tunde", status: "active", intro: "I work with product and tech leaders in North America and the UK.", maxClients: 10 },
    ],
    notifications: [
      { id: "n1", userId: "u-chidi", text: "3 posts are ready for your review. Due tomorrow at 5pm.", href: "/content", createdAt: hoursAgo(2), read: false },
      { id: "n2", userId: "u-chidi", text: "Your post on cross-border payments is live.", href: "/content", createdAt: hoursAgo(20), read: false },
      { id: "n3", userId: "u-chidi", text: "Your weekly update is ready.", href: "/home", createdAt: hoursAgo(48), read: true },
      { id: "n4", userId: "u-ada", text: "Chidi asked for a fix on a live post.", href: "/manager", createdAt: hoursAgo(1), read: false },
      { id: "n5", userId: "u-ada", text: "Sarah added a new Moment.", href: "/manager/clients/c-sarah", createdAt: hoursAgo(5), read: false },
      { id: "n6", userId: "u-fola", text: "David Adeyemi is waiting for a manager.", href: "/admin/clients", createdAt: hoursAgo(3), read: false },
    ],
  };
}

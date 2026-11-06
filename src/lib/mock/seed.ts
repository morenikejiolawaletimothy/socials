import { weeklyToDates } from "../slots";
import type { Client, Db, Permissions, ReviewSettings, Strategy, WeekProgress } from "./types";

// Realistic dummy data. Names, companies and people are fictional. Photos are stock images from the landing page.

const DAY = 86_400_000;

/** A date relative to today: `at(1, 17)` is tomorrow at 5pm, `at(-2, 9, 30)` two days ago at 9:30am. */
function makeAt(now: number) {
  const base = new Date(now);
  base.setHours(0, 0, 0, 0);
  return (days: number, hour = 9, minute = 0) => {
    const d = new Date(base.getTime() + days * DAY);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };
}

const allOn: Permissions = { post: true, engage: true, companyPage: false, connectionDrafts: true, profileDrafts: true };
const review: ReviewSettings = {
  frequency: "weekly",
  channels: { email: true, app: true },
  approval: { posts: "ask" },
  ifNoReply: "wait",
};

const IMG = {
  event: "/landing/result-1.jpg",
  team: "/landing/hero.jpg",
  meeting: "/landing/result-3.jpg",
  desk: "/landing/statement-1.jpg",
  studio: "/landing/statement-2.jpg",
  call: "/landing/statement-3.jpg",
  office: "/landing/hero-2.jpg",
  talk: "/landing/result-2.jpg",
  review: "/landing/how-2.jpg",
  portrait: "/landing/testimonial-right.jpg",
  tablet: "/landing/result-4.jpg",
  pair: "/landing/result-5.jpg",
  laptop: "/landing/result-6.jpg",
};

export function seed(): Db {
  const now = Date.now();
  const at = makeAt(now);
  const hoursAgo = (h: number) => new Date(now - h * 3_600_000).toISOString();

  const client = (c: Partial<Client> & Pick<Client, "id" | "userId" | "company" | "role" | "country" | "industry" | "status" | "goal">): Client => ({
    managerId: null,
    service: "self-serve",
    setupProgress: 100,
    setupDone: ["service", "permissions", "goals-call", "strategy-call", "plan", "review"],
    linkedin: "connected",
    postingPaused: false,
    permissions: allOn,
    review,
    stage: "running",
    joinedAt: at(-60),
    ...c,
  });

  const strategy = (clientId: string, goal: string, topics: [string, string][], status: Strategy["status"] = "approved"): Strategy => ({
    clientId,
    version: status === "approved" ? 2 : 1,
    status,
    goal,
    audience: "Founders, investors and senior operators in their field, mostly in West Africa, plus journalists who cover it.",
    topics: topics.map(([name, why]) => ({ name, why })),
    tone: "Clear, warm and direct. Short sentences. Real numbers and real stories, no buzzwords.",
    measures: [
      "Profile views from people on the target list",
      "Inbound messages from investors, partners or press",
      "Invitations to speak, advise or comment",
    ],
    targets: [
      { period: "Weeks 1 to 2", posts: 2, comments: 10, connections: 15, extra: "1 story post and 1 opinion post a week" },
      { period: "Week 3 onward", posts: 3, comments: 15, connections: 15, videos: 1, extra: "Plus 1 article a month. 1 of the posts is a short video" },
    ],
    approvedAt: status === "approved" ? at(-50) : undefined,
    frameworkVersion: "v3",
  });

  const week = (clientId: string, p: [number, number], c: [number, number], k: [number, number], held: string[] = []): WeekProgress => ({
    clientId,
    weekOf: at(-((new Date(now).getDay() + 6) % 7)),
    posts: { target: p[0], done: p[1] },
    comments: { target: c[0], done: c[1] },
    connections: { target: k[0], done: k[1] },
    held,
  });

  return {
    version: 27,
    session: {
      role: "client",
      userIds: { client: "u-chidi", manager: "u-ada", owner: "u-fola" },
      coveringManagerId: null,
    },
    users: [
      { id: "u-fola", role: "owner", firstName: "Fola", lastName: "Morenikeji", email: "fola@bluecut.example", title: "Founder", timeZone: "Africa/Lagos", twoStep: true },
      { id: "u-ada", role: "manager", firstName: "Ada", lastName: "Obi", email: "ada@bluecut.example", title: "Account manager", photo: "/landing/leaders/05.jpg", timeZone: "Africa/Lagos", twoStep: true },
      { id: "u-tunde", role: "manager", firstName: "Tunde", lastName: "Bakare", email: "tunde@bluecut.example", title: "Account manager", timeZone: "Europe/London", twoStep: true },
      { id: "u-bisi", role: "manager", firstName: "Bisi", lastName: "Adebayo", email: "bisi@bluecut.example", title: "Account manager", timeZone: "Africa/Lagos", twoStep: false },
      { id: "u-kola", role: "manager", firstName: "Kola", lastName: "Daniels", email: "kola@bluecut.example", title: "Account manager", timeZone: "Africa/Lagos", twoStep: true },
      { id: "u-chidi", role: "client", firstName: "Chidi", lastName: "Okeke", email: "chidi@paystream.example", title: "CEO, Paystream", timeZone: "Africa/Lagos", twoStep: false , whatsapp: { number: "+234 802 555 0187", confirmed: true }, channels: { email: true, whatsapp: true, timing: "now", quietNights: true } },
      { id: "u-sarah", role: "client", firstName: "Sarah", lastName: "Mensah", email: "sarah@lumenhealth.example", title: "Co-founder, Lumen Health", timeZone: "Africa/Accra", twoStep: false },
      { id: "u-david", role: "client", firstName: "David", lastName: "Adeyemi", email: "david@adeyemilaw.example", title: "Managing partner, Adeyemi & Co", timeZone: "Africa/Lagos", twoStep: false },
      { id: "u-kemi", role: "client", firstName: "Kemi", lastName: "Ola", email: "kemi@northwind.example", title: "Head of product, Northwind", timeZone: "America/Toronto", twoStep: false },
      { id: "u-ngozi", role: "client", firstName: "Ngozi", lastName: "Eze", email: "ngozi@harvestfoods.example", title: "Founder, Harvest Foods", timeZone: "Africa/Lagos", twoStep: false },
      { id: "u-femi", role: "client", firstName: "Femi", lastName: "Lawal", email: "femi@brightgrid.example", title: "CEO, BrightGrid Energy", timeZone: "Africa/Lagos", twoStep: false },
      { id: "u-zainab", role: "client", firstName: "Zainab", lastName: "Bello", email: "zainab@carecircle.example", title: "Medical director, CareCircle", timeZone: "Africa/Lagos", twoStep: false },
      { id: "u-tobi", role: "client", firstName: "Tobi", lastName: "Akin", email: "tobi@ledgerly.example", title: "CTO, Ledgerly", timeZone: "Europe/London", twoStep: false },
      { id: "u-musa", role: "client", firstName: "Musa", lastName: "Ibrahim", email: "musa@sahelventures.example", title: "Partner, Sahel Ventures", timeZone: "Africa/Lagos", twoStep: false },
      { id: "u-tari", role: "client", firstName: "Tari", lastName: "Briggs", email: "tari@delmontgroup.example", title: "CEO, Delmont Group", timeZone: "Africa/Lagos", twoStep: true },
    ],
    clients: [
      client({ review: { ...review, channels: { email: true, app: true, whatsapp: true } }, id: "c-chidi", userId: "u-chidi", managerId: "m-ada", company: "Paystream", role: "CEO", country: "Nigeria", industry: "Fintech", status: "active", goal: "Be known as a leading voice on payments in West Africa and start conversations with investors.", joinedAt: at(-64) }),
      client({ id: "c-sarah", userId: "u-sarah", managerId: "m-ada", company: "Lumen Health", role: "Co-founder", country: "Ghana", industry: "Health", status: "free", goal: "Build trust with hospital leaders ahead of a regional launch.", joinedAt: at(-10) }),
      client({ id: "c-ngozi", userId: "u-ngozi", managerId: "m-ada", company: "Harvest Foods", role: "Founder", country: "Nigeria", industry: "Food and agriculture", status: "free", stage: "calls", goal: "Find distribution partners and become known for local sourcing.", joinedAt: at(-2) }),
      client({ id: "c-femi", userId: "u-femi", managerId: "m-ada", company: "BrightGrid Energy", role: "CEO", country: "Nigeria", industry: "Energy", status: "free", stage: "strategy", goal: "Raise a Series A and be seen as the expert on off-grid solar.", joinedAt: at(-6) }),
      client({ id: "c-zainab", userId: "u-zainab", managerId: "m-ada", company: "CareCircle", role: "Medical director", country: "Nigeria", industry: "Health", status: "active", goal: "Become a trusted voice on maternal health and win speaking invitations.", joinedAt: at(-95), atRisk: "Slow to review: 3 posts held this week", review: { ...review, frequency: "twice-weekly" } }),
      client({ id: "c-david", userId: "u-david", managerId: null, company: "Adeyemi & Co", role: "Managing partner", country: "Nigeria", industry: "Law", status: "setting-up", stage: "setup", setupProgress: 33, setupDone: ["service", "permissions"], goal: "Win board roles and speaking invitations.", joinedAt: at(-1) }),
      client({ id: "c-kemi", userId: "u-kemi", managerId: "m-tunde", company: "Northwind", role: "Head of product", country: "Canada", industry: "Software", status: "paused", pausedReason: "unpaid", pausedAt: at(-12), goal: "Grow visibility for a move into a VP role.", joinedAt: at(-26), atRisk: "Paused for 12 days, unpaid" }),
      client({ id: "c-tobi", userId: "u-tobi", managerId: "m-tunde", company: "Ledgerly", role: "CTO", country: "United Kingdom", industry: "Fintech", status: "active", goal: "Hire senior engineers and be known for engineering culture.", joinedAt: at(-120), atRisk: "Open complaint about post quality" }),
      client({ id: "c-musa", userId: "u-musa", managerId: "m-tunde", company: "Sahel Ventures", role: "Partner", country: "Nigeria", industry: "Venture capital", status: "active", goal: "Attract strong founders in the Sahel to pitch.", joinedAt: at(-40) }),
      client({ id: "c-tari", userId: "u-tari", managerId: "m-ada", company: "Delmont Group", role: "CEO", country: "Nigeria", industry: "Real estate", status: "active", service: "full-service", setupDone: ["service", "permissions", "access", "goals-call", "strategy-call", "plan", "review"], permissions: { ...allOn, companyPage: true }, fullService: { since: at(-30), pageManagement: true, pageGrant: "granted", access: { credentials: "set", twoFactor: true } }, goal: "Be the best-known name in West African commercial real estate and attract institutional investors.", joinedAt: at(-38) }),
    ],
    managers: [
      { id: "m-ada", userId: "u-ada", status: "active", intro: "I help founders in fintech and health tell their story on LinkedIn. Six years in communications, based in Lagos.",
        profile: {
          location: "Lagos, Nigeria",
          languages: ["English", "Yoruba", "French"],
          yearsExperience: 6,
          highlights: [
            "Grew a payments founder from 2,000 to 18,000 followers in 12 months",
            "Ghostwrote for 3 CEOs featured in TechCabal and Techpoint",
            "96% of posts out on time, 81% approved the first time",
          ],
          background: [
            { role: "Account manager", place: "Bluecut", years: "2023 to now" },
            { role: "Head of communications", place: "A Lagos fintech, Series B", years: "2020 to 2023" },
            { role: "Business reporter", place: "BusinessDay", years: "2018 to 2020" },
          ],
          approach: "I learn how you talk, then write like you on a good day. You get posts that sound like you, a clear plan each week, and honest advice on what is working.",
        },
        maxClients: 10, industries: ["Fintech", "Health", "Energy"], slots: weeklyToDates(["mon-morning", "tue-afternoon", "wed-morning", "thu-morning", "fri-afternoon"], now), stats: { onTime: 96, firstTimeApproval: 81, missed: 1, complaints: 0 } },
      { id: "m-tunde", userId: "u-tunde", status: "active", intro: "I work with product and tech leaders in North America and the UK.", maxClients: 10, industries: ["Software", "Fintech", "Venture capital"], slots: weeklyToDates(["mon-afternoon", "wed-afternoon", "thu-afternoon"], now), stats: { onTime: 88, firstTimeApproval: 72, missed: 4, complaints: 1 } },
      { id: "m-bisi", userId: "u-bisi", status: "invited", intro: "", maxClients: 10, industries: [], inviteToken: "demo-invite", inviteExpiresAt: new Date(now + 6 * DAY).toISOString(), stats: { onTime: 0, firstTimeApproval: 0, missed: 0, complaints: 0 } },
      { id: "m-kola", userId: "u-kola", status: "waiting-for-training", intro: "Former journalist. I write about law, policy and public life.", maxClients: 10, industries: ["Law", "Public sector"], trainingAt: at(2, 11), slots: ["tue-morning", "thu-afternoon"], stats: { onTime: 0, firstTimeApproval: 0, missed: 0, complaints: 0 } },
    ],
    notifications: [
      { id: "n1", userId: "u-chidi", text: "3 posts are ready for your review. Due tomorrow at 5pm.", href: "/content/review", createdAt: hoursAgo(2), read: false, by: "Ada Obi (manager)" },
      { id: "n-msg-chidi", userId: "u-chidi", text: "New message from Ada Obi.", href: "/messages", createdAt: hoursAgo(5), read: false },
      { id: "n-msg-ada", userId: "u-ada", text: "New message from Zainab Bello.", href: "/manager/messages?client=c-zainab", createdAt: hoursAgo(1), read: false },
      { id: "n2", userId: "u-chidi", text: "Ada sent you 6 people to connect with this week.", href: "/tasks/t-chidi-connect", createdAt: hoursAgo(5), read: false },
      { id: "n3", userId: "u-chidi", text: "Your post on cross-border payments is live.", href: "/content?tab=live", createdAt: hoursAgo(20), read: false },
      { id: "n4", userId: "u-chidi", text: "Your weekly update is ready to read.", href: "/progress/u-chidi-w9", createdAt: hoursAgo(50), read: true },
      { id: "n5", userId: "u-chidi", text: "Ada asked to post on the Paystream company Page this week.", href: "/control", createdAt: hoursAgo(26), read: true },
      { id: "n6", userId: "u-ada", text: "Zainab asked for a fix on a live post.", href: "/manager/clients/c-zainab/content", createdAt: hoursAgo(1), read: false, by: "Zainab Bello (client)" },
      { id: "n7", userId: "u-ada", text: "Chidi added a new Moment: Lagos Fintech Week.", href: "/manager/clients/c-chidi?tab=brand", createdAt: hoursAgo(4), read: false },
      { id: "n8", userId: "u-ada", text: "Sarah asked for changes on 1 post.", href: "/manager/clients/c-sarah/content", createdAt: hoursAgo(9), read: true },
      { id: "n9", userId: "u-fola", text: "David Adeyemi is waiting for a manager.", href: "/admin/clients", createdAt: hoursAgo(3), read: false },
      { id: "n10", userId: "u-fola", text: "Musa Ibrahim pulled out. A refund of $3,200 needs your approval.", href: "/admin/money", createdAt: hoursAgo(7), read: false, by: "Musa Ibrahim (client)" },
      { id: "n11", userId: "u-fola", text: "Tobi Akin raised a complaint about post quality.", href: "/admin/complaints", createdAt: hoursAgo(30), read: true },
    ],

    posts: [
      // Chidi: waiting for review
      { id: "p-c1", clientId: "c-chidi", status: "awaiting-client", dueAt: at(1, 17), sentAt: hoursAgo(6), topic: "Cross-border payments", format: "story",
        text: "Last month a trader in Kano waited 9 days for a payment from Accra.\n\nNine days. For money that crossed one border.\n\nWe rebuilt how Paystream settles across ECOWAS, and that same payment now lands in under 4 hours. Here is what we changed, and what still needs fixing in the system.\n\n1. We stopped routing through correspondent banks for small transfers.\n2. We hold local liquidity in each market.\n3. We tell the sender exactly when the money lands.\n\nThe hard part was not the technology. It was the trust.",
        why: "Opens your topic on cross-border payments with a real story. Three investors on your list posted about ECOWAS payments this week.", image: { src: IMG.team, alt: "The Paystream team at work in the Lagos office" } },
      { id: "p-c2", clientId: "c-chidi", status: "awaiting-client", dueAt: at(1, 17), sentAt: hoursAgo(6), topic: "Leadership", format: "opinion",
        text: "Unpopular view: most African fintechs do not have a product problem. They have a patience problem.\n\nWe raise for 18 months and expect to fix habits people have had for 30 years.\n\nAt Paystream we now plan in 5-year chapters. It changed who we hire, what we build first and how we talk to investors.",
        why: "An opinion post for your leadership topic. Opinion posts got you twice the comments of your other posts last month." },
      { id: "p-c3", clientId: "c-chidi", status: "awaiting-client", dueAt: at(1, 17), sentAt: hoursAgo(6), topic: "Lagos Fintech Week", format: "story",
        text: "Spoke at @[Lagos Fintech Week] on Thursday, on a panel with @[Amaka Nwosu] of @[Lagos Angel Network]. The question I keep thinking about came from a student in the second row:\n\n\"If payments get instant, what happens to trust?\"\n\nMy answer: trust moves from the speed to the receipt. People stop asking \"when\" and start asking \"what if it goes wrong\". That is the next thing we have to design for.\n\n#Fintech #Payments #LFW2026",
        why: "From the Moment you added. Event posts within a week of the event do best.",
        // Demo clip: a public sample video, with our stage photo as the frame shown before it plays.
        video: { src: "/media/sample-talk.mp4", poster: "/media/sample-talk.jpg", alt: "Chidi speaking on stage at Lagos Fintech Week", seconds: 5, shape: "landscape" } },
      // Chidi: scheduled
      { id: "p-c4", clientId: "c-chidi", status: "scheduled", scheduledAt: hoursAgo(6), scheduledFor: at(3, 9), topic: "Cross-border payments", format: "how-to",
        text: "How to pick a payments partner for West Africa, in 5 questions. A short guide for founders who are about to choose.", why: "A practical post for founders on your target list." },
      { id: "p-c5", clientId: "c-chidi", status: "scheduled", scheduledAt: hoursAgo(6), scheduledFor: at(5, 8, 30), topic: "Team", format: "story",
        text: "Our first engineer joined Paystream from a bank queue. Literally. Here is the story.", why: "A team story to support hiring next quarter.", image: { src: IMG.desk, alt: "A Paystream engineer at her desk" } },
      // Chidi: live
      { id: "p-c6", clientId: "c-chidi", status: "published", publishedAt: hoursAgo(20), topic: "Cross-border payments", format: "opinion",
        text: "Cross-border payments in Africa are not slow because of technology. They are slow because of rules written for a different decade.\n\nThree changes regulators could make this year:\n\n1. One licence that works across ECOWAS, not fifteen.\n2. Shared rules for checking who sent the money.\n3. Settlement in local currency by default.\n\nThe @[Central Bank of Nigeria] report on mobile money says the same. Worth a read: https://www.cbn.gov.ng/reports\n\n#Payments #Africa #Fintech",
        why: "", stats: { impressions: 8420, reactions: 214, comments: 37, reposts: 12 }, image: { src: IMG.meeting, alt: "Chidi in a meeting with regulators" } },
      { id: "p-c7", clientId: "c-chidi", status: "published", publishedAt: at(-4, 9), topic: "Leadership", format: "story", request: { kind: "repost", repostAs: "reshare", text: "This one did so well. Can we share it again next week with a line about the new office?", at: hoursAgo(5) },
        text: "I almost shut Paystream down in 2021. This is the message from a customer that made me stay.", why: "", stats: { impressions: 12950, reactions: 486, comments: 61, reposts: 23 } },
      { id: "p-c8", clientId: "c-chidi", status: "published", publishedAt: at(-8, 8, 30), topic: "Team", format: "carousel",
        text: "5 things we changed about hiring after we hit 50 people.\n\nThank you to @[Tobi Akin] and the team at @[Andela] for the advice that started it. Swipe through for all five.\n\n#Hiring #Startups #Paystream", why: "", stats: { impressions: 5310, reactions: 132, comments: 18, reposts: 4 },
        carousel: {
          title: "5 hiring changes at 50 people",
          slides: [
            { src: IMG.office, alt: "Cover: 5 things we changed about hiring after we hit 50 people" },
            { src: IMG.pair, alt: "1. Every hire meets two people from another team" },
            { src: IMG.desk, alt: "2. A paid trial day replaces the take-home test" },
            { src: IMG.laptop, alt: "3. Salary bands are on every job post" },
            { src: IMG.team, alt: "4 and 5. Managers hire for their team, founders only say no" },
          ],
        } },
      { id: "p-c9", clientId: "c-chidi", status: "published", publishedAt: at(-11, 9), topic: "Cross-border payments", format: "how-to",
        text: "What a settlement layer actually is, explained without jargon.", why: "", stats: { impressions: 4120, reactions: 97, comments: 11, reposts: 6 } },
      // Chidi: held and staff-side drafts
      { id: "p-c10", clientId: "c-chidi", status: "on-hold", dueAt: at(-6, 17), sentAt: at(-8, 10), topic: "Leadership", format: "opinion", heldReason: "Not reviewed by the due time. You chose to review every post first.",
        text: "Board meetings should be shorter. Ours are now 45 minutes, and better for it.", why: "" },
      { id: "p-c-video-1", clientId: "c-chidi", status: "draft", topic: "Lagos Fintech Week", format: "video", version: 1, waitingForVideo: "t-chidi-video",
        text: "A student at Lagos Fintech Week asked me the question I get most from investors.\n\nHere is what I told her.", why: "Video from the event: your goal is investor conversations, and this shows how you think.", checks: [] },
      { id: "p-c11", clientId: "c-chidi", status: "manager-review", topic: "Cross-border payments", format: "opinion", version: 2,
        text: "Mobile money is not competition for banks. It is the on-ramp. Here is what our data shows from 2 million transfers.",
        why: "Ties your payments topic to this week's central bank report on mobile money.",
        checks: [
          { id: "k1", label: "Claim needs a source: \"2 million transfers\"", kind: "claim", state: "open" },
          { id: "k2", label: "Image has no description", kind: "alt-text", state: "fixed" },
        ] },
      { id: "p-c12", clientId: "c-chidi", status: "draft", topic: "Investors", format: "story", version: 1,
        text: "What I wish I had known before our seed round. Draft 1.", why: "Investors on your list are reading about seed rounds this month.",
        checks: [{ id: "k3", label: "Mentions FirstBank, which is on your off-limits list", kind: "off-limits", state: "open" }] },
      // Sarah
      { id: "p-s1", clientId: "c-sarah", status: "awaiting-client", dueAt: at(2, 12), sentAt: hoursAgo(20), topic: "Patient safety", format: "story",
        text: "One nurse, 42 patients, one night shift. This is why we built Lumen.", why: "Your first story post. It introduces why Lumen exists." },
      { id: "p-s2", clientId: "c-sarah", status: "changes-requested", topic: "Hospital leaders", format: "opinion",
        text: "Hospitals do not need more dashboards.", why: "", feedback: [{ text: "Too strong. Can we say it more kindly? Some of our partners sell dashboards.", at: hoursAgo(9) }] },
      { id: "p-s3", clientId: "c-sarah", status: "approved", topic: "Patient safety", format: "how-to", text: "3 questions to ask before buying any ward software.", why: "" },
      { id: "p-s4", clientId: "c-sarah", status: "scheduled", scheduledFor: hoursAgo(3), scheduledAt: hoursAgo(28), topic: "Team", format: "story", text: "Meet the team behind Lumen.", why: "A people post builds trust before the launch.", image: { src: IMG.pair, alt: "Two of the Lumen team" } },
      // Zainab
      { id: "p-z1", clientId: "c-zainab", status: "on-hold", topic: "Maternal health", format: "story", heldReason: "Waiting for Zainab's review, 2 days late.", text: "The first 42 days after birth.", why: "" },
      { id: "p-z2", clientId: "c-zainab", status: "on-hold", topic: "Maternal health", format: "opinion", heldReason: "Waiting for Zainab's review, 2 days late.", text: "We count births. We should count recoveries.", why: "" },
      { id: "p-z3", clientId: "c-zainab", status: "awaiting-client", dueAt: at(0, 18), topic: "Speaking", format: "story", text: "What I said to 400 midwives in Abuja.", why: "" },
      { id: "p-z4", clientId: "c-zainab", status: "published", publishedAt: at(-3, 10), topic: "Maternal health", format: "story", request: { kind: "fix", text: "The clinic name in paragraph 2 is wrong. It should be Garki, not Gwarinpa.", at: hoursAgo(3) }, text: "A morning at the Garki clinic.", why: "", stats: { impressions: 3020, reactions: 88, comments: 9, reposts: 2 } },
      // Tobi
      { id: "p-t1", clientId: "c-tobi", status: "published", publishedAt: at(-2, 9), topic: "Engineering culture", format: "opinion", text: "We deleted our on-call rota. Here is what replaced it.", why: "", stats: { impressions: 6110, reactions: 170, comments: 24, reposts: 9 } },
    ],

    tasks: [
      { id: "t-chidi-connect", clientId: "c-chidi", kind: "connect", title: "Connect with 6 people this week", dueAt: at(4, 17), done: false, sentAt: hoursAgo(5),
        people: [
          { id: "pp1", name: "Amaka Nwosu", role: "Partner, Lagos Angel Network", profileUrl: "https://www.linkedin.com/in/example-amaka", why: "Invests in payments. Commented on your post about settlement last week.", note: "Hi Amaka, thank you for your comment on my settlement post. I would like to stay in touch as we grow Paystream across ECOWAS.", done: true },
          { id: "pp2", name: "Kwame Asante", role: "Head of payments, Accra Commercial Bank", profileUrl: "https://www.linkedin.com/in/example-kwame", why: "A likely partner for the Ghana corridor.", note: "Hi Kwame, I lead Paystream. We are working on faster Lagos to Accra payments and I would value your view on the corridor.", done: true },
          { id: "pp3", name: "Funmi Adebayo", role: "Fintech reporter, TechCabal", profileUrl: "https://www.linkedin.com/in/example-funmi", why: "Writes about cross-border payments every month.", note: "Hi Funmi, I enjoy your payments coverage. Happy to share data from our cross-border work if it is ever useful.", done: false },
          { id: "pp4", name: "Ibrahim Sule", role: "Investment director, Sahel Growth Fund", profileUrl: "https://www.linkedin.com/in/example-ibrahim", why: "On your investor list. Posts about payments infrastructure.", note: "Hi Ibrahim, I have followed your posts on payments infrastructure. I would be glad to connect.", done: false },
          { id: "pp5", name: "Ruth Mensah", role: "COO, Volta Logistics", profileUrl: "https://www.linkedin.com/in/example-ruth", why: "A customer type you want to reach: traders across borders.", note: "Hi Ruth, we help logistics firms get paid across West Africa faster. I would like to connect.", done: false },
          { id: "pp6", name: "Tolu Bamidele", role: "Policy lead, Central Bank fintech office", profileUrl: "https://www.linkedin.com/in/example-tolu", why: "Shapes the rules you write about.", note: "Hi Tolu, I write about payments policy and would value your perspective. Glad to connect.", done: false },
        ] },
      { id: "t-chidi-comment", clientId: "c-chidi", kind: "comment", title: "Comment on 3 posts", dueAt: at(3, 17), done: false, sentAt: hoursAgo(4),
        items: [
          { id: "ei1", name: "Kwame Asante", role: "Head of payments, Accra Commercial Bank", url: "https://www.linkedin.com/posts/example-2", post: "Ghana to Nigeria corridors will not scale until banks on both sides hold local liquidity.", why: "A likely partner for the Ghana corridor. Your view on liquidity is what he is asking for.", text: "Agree on liquidity. The corridor works when both sides hold local funds. We see settlement drop from 3 days to hours when they do.", done: true },
          { id: "ei2", name: "Ibrahim Sule", role: "Investment director, Sahel Growth Fund", url: "https://www.linkedin.com/posts/example-1", post: "The new mobile money report is out. Three numbers every payments founder should read before their next raise...", why: "On your investor list, writing about your topic today.", text: "The report misses one thing: settlement time. Our data shows mobile money users wait 3x longer for cross-border funds. Happy to share the numbers.", done: false },
          { id: "ei3", name: "Funmi Adebayo", role: "Fintech reporter, TechCabal", url: "https://www.linkedin.com/posts/example-7", post: "Which West African fintechs are actually profitable? I am collecting examples for next month's piece.", why: "A reporter asking for examples. A helpful answer puts Paystream in her story.", text: "Happy to be one of your examples, Funmi. Paystream has been profitable on the Lagos to Accra corridor since March. Glad to share numbers.", done: false },
        ] },
      { id: "t-chidi-react", clientId: "c-chidi", kind: "react", title: "React to 3 posts", dueAt: at(2, 17), done: false, sentAt: hoursAgo(4),
        items: [
          { id: "ei4", name: "Amaka Nwosu", role: "Partner, Lagos Angel Network", url: "https://www.linkedin.com/posts/example-5", post: "We just closed our fourth fund. 40% goes to fintech outside Lagos.", why: "An investor who commented on your post. Celebrating her news keeps you in view.", reaction: "celebrate", done: false },
          { id: "ei5", name: "Tolu Bamidele", role: "Policy lead, Central Bank fintech office", url: "https://www.linkedin.com/posts/example-6", post: "A plain-language guide to the new cross-border payment rules, with the dates that matter.", why: "Shapes the rules you write about.", reaction: "insightful", done: false },
          { id: "ei6", name: "Ruth Mensah", role: "COO, Volta Logistics", url: "https://www.linkedin.com/posts/example-8", post: "Our drivers crossed 4 borders last week. Paperwork took longer than the drive.", why: "A customer type you want to reach.", reaction: "support", done: false },
        ] },
      { id: "t-chidi-follow", clientId: "c-chidi", kind: "follow", title: "Follow 2 people and Pages", dueAt: at(4, 17), done: false, sentAt: hoursAgo(4),
        items: [
          { id: "ei7", name: "Africa Fintech Summit", role: "Company Page", url: "https://www.linkedin.com/company/example-afs", why: "You are registering for their summit. Following shows speaker calls.", done: false },
          { id: "ei8", name: "Esi Owusu", role: "Head of partnerships, Accra Pay", url: "https://www.linkedin.com/in/example-esi", why: "Posts often about the Ghana corridor. Following first, connecting later.", done: false },
        ] },
      { id: "t-chidi-video", clientId: "c-chidi", kind: "video", title: "Record a short video", dueAt: at(6, 17), done: false, sentAt: hoursAgo(3),
        video: {
          idea: "60 seconds on the question the student asked you at Lagos Fintech Week",
          why: "Your goal is investor and partner conversations. A short video of you answering a real question shows how you think, and video gets more reach than text for founders in your field.",
          shots: ["Say the question you were asked, in one line", "Your answer, as you would tell a friend", "One thing you want founders to take from it", "Close with: \u201cWhat would you have said?\u201d"],
          length: "45 to 90 seconds",
          shape: "portrait",
          tips: ["Hold your phone upright, at eye level", "Face a window for soft light", "Record somewhere quiet, close to the phone", "One take is fine. Small mistakes feel real"],
          postId: "p-c-video-1",
        } },
      { id: "t-chidi-headline", clientId: "c-chidi", kind: "profile", title: "Update your headline", dueAt: at(4, 17), done: false, sentAt: hoursAgo(5),
        text: "CEO at Paystream | Making payments across West Africa as fast as a text message", where: "On LinkedIn, open your profile, press the pencil next to your name, then paste this into Headline." },
      { id: "t-chidi-summit", clientId: "c-chidi", kind: "event", title: "Register for Africa Fintech Summit", dueAt: at(5, 17), done: false, sentAt: hoursAgo(26),
        event: { type: "event", name: "Africa Fintech Summit, Lagos", host: "Africa Fintech Foundry", startsAt: at(12, 10), endsAt: at(12, 17), place: "Eko Hotel, Lagos", url: "https://example.com/africa-fintech-summit", image: IMG.event,
          why: "Three investors on your list are speaking. A panel on cross-border payments fits your strongest topic, and it gives you a post the week after." } },
      { id: "t-chidi-program", clientId: "c-chidi", kind: "event", title: "Apply for the Founders Leadership Program", dueAt: at(9, 17), done: false, sentAt: hoursAgo(30),
        event: { type: "program", name: "Founders Leadership Program", host: "Lagos Business School", startsAt: at(24, 9), endsAt: at(66, 17), place: "Online, Tuesdays 9am", url: "https://example.com/founders-leadership", image: IMG.laptop,
          why: "A 6-week cohort of 40 West African founders. Good for leadership stories and for meeting future partners." } },
      { id: "t-chidi-webinar", clientId: "c-chidi", kind: "event", title: "Register for Payments Policy Roundtable", dueAt: at(2, 17), done: true, sentAt: hoursAgo(72),
        event: { type: "event", name: "Payments Policy Roundtable", host: "TechCabal", startsAt: at(8, 14), endsAt: at(8, 15, 30), place: "Online", url: "https://example.com/payments-roundtable", image: IMG.call,
          why: "Tolu Bamidele from the Central Bank fintech office is on the panel. A chance to ask a question in public." } },
      { id: "t-sarah-connect", clientId: "c-sarah", kind: "connect", title: "Connect with 4 hospital leaders", dueAt: at(3, 17), done: false, sentAt: hoursAgo(20),
        people: [
          { id: "ps1", name: "Dr. Kofi Boateng", role: "CEO, Korle Health", profileUrl: "https://www.linkedin.com/in/example-kofi", why: "Runs 3 hospitals in your launch region.", note: "Hi Dr. Boateng, I lead Lumen Health. We are launching in Accra soon and I would value your view.", done: false },
        ] },
    ],

    calls: [
      { id: "cl-chidi-1", clientId: "c-chidi", managerId: "m-ada", kind: "goals", at: at(-60, 10), minutes: 30, meetUrl: "https://meet.google.com/example-abc", recording: true, status: "done", summary: "Goal: be known for payments in West Africa and open investor conversations before the Series A. Audience: investors, bank partners, fintech press." },
      { id: "cl-chidi-2", clientId: "c-chidi", managerId: "m-ada", kind: "strategy", at: at(-56, 10), minutes: 30, meetUrl: "https://meet.google.com/example-def", recording: true, status: "done", summary: "Agreed 3 topics, 2 posts a week for 2 weeks, then 3. Added FirstBank to off limits." },
      { id: "cl-chidi-3", clientId: "c-chidi", managerId: "m-ada", kind: "check-in", at: at(6, 11), minutes: 30, meetUrl: "https://meet.google.com/example-ghi", recording: true, status: "booked" },
      { id: "cl-chidi-4", clientId: "c-chidi", managerId: "m-ada", kind: "check-in", title: "Monthly review", at: at(20, 14, 30), minutes: 30, meetUrl: "https://meet.google.com/example-yza", recording: true, status: "booked" },
      { id: "cl-ngozi-1", clientId: "c-ngozi", managerId: "m-ada", kind: "goals", at: at(0, 15), minutes: 30, meetUrl: "https://meet.google.com/example-jkl", recording: true, status: "booked",
        prep: ["Her headline still says \"Founder\" only. Ask what she wants to be known for.", "Last post was 8 months ago, a product launch with 40 reactions.", "Ask about distribution partners she would most like to reach.", "Ask what is off limits: competitors, suppliers, politics."] },
      { id: "cl-ngozi-2", clientId: "c-ngozi", managerId: "m-ada", kind: "strategy", at: at(4, 10), minutes: 30, meetUrl: "https://meet.google.com/example-mno", recording: true, status: "booked" },
      { id: "cl-femi-1", clientId: "c-femi", managerId: "m-ada", kind: "goals", at: at(-4, 11), minutes: 30, meetUrl: "https://meet.google.com/example-pqr", recording: false, status: "done", summary: "Written notes (no recording). Goal: Series A in 9 months. Wants to be the voice on off-grid solar." },
      { id: "cl-femi-2", clientId: "c-femi", managerId: "m-ada", kind: "strategy", at: at(-1, 11), minutes: 30, meetUrl: "https://meet.google.com/example-stu", recording: false, status: "done", summary: "Written notes. Femi asked to make topic 3 about the team, not fundraising, and to start with 2 posts a week." },
      { id: "cl-sarah-3", clientId: "c-sarah", managerId: "m-ada", kind: "check-in", at: at(0, 17, 30), minutes: 30, meetUrl: "https://meet.google.com/example-vwx", recording: true, status: "booked", prep: ["First week review: 1 post approved, 1 changed.", "Ask about the image for the team post."] },
    ],

    strategies: [
      strategy("c-chidi", "Be known as a leading voice on payments in West Africa and start conversations with investors before the Series A.", [
        ["Cross-border payments", "Your strongest expertise, and what investors on your list follow."],
        ["Leadership", "Stories from building Paystream show who you are, not only what you sell."],
        ["Team", "Supports hiring 12 engineers next year."],
        ["Investors", "Opens conversations ahead of the Series A."],
      ]),
      strategy("c-sarah", "Build trust with hospital leaders ahead of the regional launch.", [
        ["Patient safety", "What hospital leaders worry about most."],
        ["Hospital leaders", "Speaks to the people who buy."],
        ["Team", "Shows the clinical people behind Lumen."],
      ]),
      strategy("c-femi", "Raise a Series A within 9 months and be seen as the expert on off-grid solar in Nigeria.", [
        ["Off-grid solar", "Your field, and where investors look for experts."],
        ["Energy policy", "The rules shaping the market this year."],
        ["The BrightGrid team", "Changed on the call: the people building it, not the fundraising."],
      ], "agreed-sent"),
      strategy("c-zainab", "Become a trusted voice on maternal health and win speaking invitations.", [
        ["Maternal health", "Your expertise."],
        ["Speaking", "Leads to invitations."],
      ]),
      strategy("c-tobi", "Hire senior engineers and be known for engineering culture.", [["Engineering culture", "Why engineers join."], ["Fintech", "Your field."]]),
      strategy("c-musa", "Attract strong founders in the Sahel to pitch.", [["Investing in the Sahel", "What founders look for."]]),
      strategy("c-tari", "Be the best-known name in West African commercial real estate and attract institutional investors.", [["Commercial real estate", "Where the market is going."], ["Institutional investment", "What funds look for in a local partner."]]),
      strategy("c-kemi", "Grow visibility for a move into a VP role.", [["Product leadership", "Shows VP-level thinking."]]),
    ],

    progress: [
      week("c-chidi", [3, 1], [15, 11], [15, 6], ["3 posts waiting for your review, due tomorrow 5pm", "1 post held last week: not reviewed in time"]),
      week("c-sarah", [2, 0], [10, 4], [15, 0], ["1 post waiting for your review"]),
      week("c-zainab", [3, 1], [15, 13], [10, 10], ["2 posts held, waiting for review"]),
      week("c-tobi", [3, 2], [15, 9], [10, 7]),
      week("c-musa", [2, 2], [10, 10], [10, 4]),
      week("c-tari", [2, 2], [12, 12], [8, 8]),
    ],

    updates: [
      { id: "u-chidi-w9", clientId: "c-chidi", kind: "weekly", title: "Week 9 update", periodLabel: "Week of " + new Date(now - 7 * DAY).toLocaleDateString("en-GB", { day: "numeric", month: "short" }), sentAt: hoursAgo(50), status: "sent",
        headline: "Your best week so far. Two investors on your list viewed your profile and one sent a message.",
        did: [{ label: "Posts", target: 3, done: 2 }, { label: "Comments", target: 15, done: 15 }, { label: "Connection requests", target: 15, done: 12 }],
        best: ["p-c7"], progress: "Profile views from your target list are up 38% on last month. Amaka Nwosu (Lagos Angel Network) messaged you after your leadership post.",
        held: ["1 post held: not reviewed in time", "3 connection requests not sent yet"], field: "The central bank's new mobile money report is the talk of the week. 3 investors you follow wrote about it. We have a post ready that ties it to your data.",
        next: "Two cross-border posts, and a story from Lagos Fintech Week.", note: "Great week, Chidi. The leadership story did better than anything so far. Let's do one like it every month. Ada", results: ["Message from Amaka Nwosu, Lagos Angel Network"] },
      { id: "u-chidi-m2", clientId: "c-chidi", kind: "monthly", title: "Month 2 update", periodLabel: "Last month", sentAt: at(-14, 9), status: "sent",
        headline: "You are now seen as a payments voice: 3 times more profile views from your target list than in month 1.",
        did: [{ label: "Posts", target: 10, done: 9 }, { label: "Comments", target: 50, done: 54 }, { label: "Connection requests", target: 60, done: 51 }],
        best: ["p-c8", "p-c9"], progress: "Target-list profile views: 41 in month 1, 126 in month 2. Two invitations to comment for press.", held: ["1 post held"], field: "Payments regulation in Ghana and Nigeria is moving fast.", next: "Add articles from month 3.", note: "Ada" },
      { id: "u-chidi-w8", clientId: "c-chidi", kind: "weekly", title: "Week 8 update", periodLabel: "Two weeks ago", sentAt: at(-9, 9), status: "sent",
        headline: "A steady week. Comments are building relationships with 4 bank partners.",
        did: [{ label: "Posts", target: 3, done: 3 }, { label: "Comments", target: 15, done: 13 }, { label: "Connection requests", target: 15, done: 15 }],
        best: ["p-c8"], progress: "Steady growth.", held: [], field: "", next: "", note: "Ada" },
      { id: "u-sarah-w1", clientId: "c-sarah", kind: "weekly", title: "Week 1 update", periodLabel: "This week", status: "draft",
        headline: "A good first week. Your first post is approved and goes out on Tuesday.",
        did: [{ label: "Posts", target: 2, done: 0 }, { label: "Comments", target: 10, done: 4 }, { label: "Connection requests", target: 15, done: 0 }],
        best: [], progress: "Too early for results. We will start measuring from week 3.", held: ["1 post waiting for your review"], field: "Ghana's health ministry announced a digital records plan for regional hospitals.", next: "Your story post and the team post.", note: "" },
    ],

    messages: [
      { id: "ms1", clientId: "c-chidi", threadId: "th-posts", fromUserId: "u-ada", text: "Good morning Chidi. Your 3 posts for next week are ready. The Lagos Fintech Week one uses the photos you sent.", at: hoursAgo(26) },
      { id: "ms2", clientId: "c-chidi", threadId: "th-posts", fromUserId: "u-chidi", text: "Thanks Ada. I will look tonight. Can we use the stage photo, not the panel one?", at: hoursAgo(25), reactions: [{ userId: "u-ada", kind: "done" }] },
      { id: "ms3", clientId: "c-chidi", threadId: "th-posts", fromUserId: "u-ada", text: "Yes, already done. You will see it in the review.", at: hoursAgo(24), reactions: [{ userId: "u-chidi", kind: "like" }] },
      { id: "ms4", clientId: "c-chidi", threadId: "th-ghana", fromUserId: "u-chidi", voice: { seconds: 34, transcript: "One more thing. Please don't mention our new Ghana licence yet, it is not public until next month." }, at: hoursAgo(8), pinned: true },
      { id: "ms5", clientId: "c-chidi", threadId: "th-ghana", fromUserId: "u-ada", text: "Noted. I have added it to your off limits until the announcement.", at: hoursAgo(7) },
      { id: "ms6", clientId: "c-chidi", threadId: "th-photos", fromUserId: "u-chidi", text: "Here is the stage photo from Fintech Week. The full set is at https://photos.example.com/fintech-week", file: { name: "Fintech-week-stage.jpg", size: "2.4 MB", kind: "image", src: IMG.talk }, at: hoursAgo(6) },
      { id: "ms7", clientId: "c-chidi", threadId: "th-photos", fromUserId: "u-ada", text: "Lovely photo. I have also sent you 6 people to connect with this week. It takes about 3 minutes.", at: hoursAgo(5) },
      { id: "ms8", clientId: "c-sarah", fromUserId: "u-sarah", text: "Can we make the dashboards post softer? Some partners sell dashboards.", at: hoursAgo(9) },
      { id: "ms9", clientId: "c-sarah", fromUserId: "u-ada", text: "Of course. I will send a new version today.", at: hoursAgo(8) },
      { id: "ms10", clientId: "c-zainab", fromUserId: "u-zainab", text: "The clinic name in Monday's post is wrong. Please fix it.", at: hoursAgo(1) },
      { id: "ms11", clientId: "c-femi", fromUserId: "u-ada", text: "Thanks for the call, Femi. I changed topic 3 to the team, as you asked. What we agreed is ready for you to approve.", at: hoursAgo(20) },
      { id: "ms12", clientId: "c-ngozi", fromUserId: "u-ada", text: "Welcome Ngozi. Looking forward to our call today at 3pm.", at: hoursAgo(3) },
    ],

    threads: [
      { id: "th-posts", clientId: "c-chidi", title: "Next week's posts", createdAt: hoursAgo(26) },
      { id: "th-ghana", clientId: "c-chidi", title: "Ghana licence: keep it quiet", createdAt: hoursAgo(8) },
      { id: "th-photos", clientId: "c-chidi", title: "Fintech Week photos", createdAt: hoursAgo(6) },
    ],

    activity: [
      { id: "a1", clientId: "c-chidi", who: "team", kind: "post", text: "Published \"Cross-border payments in Africa are not slow because of technology\"", at: hoursAgo(20) },
      { id: "a2", clientId: "c-chidi", who: "team", kind: "engagement", text: "Commented on a post by Amaka Nwosu", at: hoursAgo(22) },
      { id: "a3", clientId: "c-chidi", who: "team", kind: "engagement", text: "Liked 6 posts from your target list", at: hoursAgo(23) },
      { id: "a4", clientId: "c-chidi", who: "you", kind: "post", text: "Approved \"I almost shut Paystream down in 2021\"", at: at(-5, 19) },
      { id: "a5", clientId: "c-chidi", who: "you", kind: "setting", text: "Turned off \"Post to my company Page\"", at: at(-12, 14) },
      { id: "a6", clientId: "c-chidi", who: "team", kind: "engagement", text: "Commented on a post by Kwame Asante", at: at(-2, 11) },
      { id: "a7", clientId: "c-chidi", who: "system", kind: "post", text: "Held \"Board meetings should be shorter\": not reviewed in time", at: at(-6, 17) },
      { id: "a8", clientId: "c-chidi", who: "you", kind: "account", text: "Signed in from a new device (Chrome on Mac)", at: at(-3, 8) },
      { id: "a9", clientId: "c-chidi", who: "team", kind: "message", text: "Sent you 6 people to connect with", at: hoursAgo(5) },
      { id: "a10", clientId: "c-chidi", who: "team", kind: "engagement", text: "Commented on a post by Funmi Adebayo", at: at(-7, 10) },
      // Week 9: everything done, by Chidi and by Ada on his behalf. The week 9 report lists all of it.
      { id: "a11", clientId: "c-chidi", who: "team", kind: "post", text: "Published \"I almost shut Paystream down in 2021\"", at: at(-4, 9) },
      { id: "a12", clientId: "c-chidi", who: "team", kind: "post", text: "Published \"What 1,000 merchants taught us about settlement\"", at: at(-7, 9) },
      { id: "a13", clientId: "c-chidi", who: "team", kind: "engagement", text: "Reacted to 9 posts from investors on your list", at: at(-3, 16) },
      { id: "a14", clientId: "c-chidi", who: "team", kind: "engagement", text: "Commented on a post by Ibrahim Sule (Sahel Growth Fund)", at: at(-3, 12) },
      { id: "a15", clientId: "c-chidi", who: "team", kind: "engagement", text: "Replied to 14 comments on your leadership post", at: at(-4, 15) },
      { id: "a16", clientId: "c-chidi", who: "team", kind: "engagement", text: "Reposted TechCabal's article on cross-border payments, with your view", at: at(-5, 11) },
      { id: "a17", clientId: "c-chidi", who: "team", kind: "engagement", text: "Reacted to 12 posts from bank partners and fintech press", at: at(-6, 16) },
      { id: "a18", clientId: "c-chidi", who: "team", kind: "engagement", text: "Commented on a post by Ruth Mensah (Volta Logistics)", at: at(-8, 10) },
      { id: "a19", clientId: "c-chidi", who: "team", kind: "connection", text: "Sent 8 connection requests to people on your target list", at: at(-6, 10) },
      { id: "a20", clientId: "c-chidi", who: "team", kind: "connection", text: "Accepted 5 connection requests from fintech founders", at: at(-5, 9) },
      { id: "a21", clientId: "c-chidi", who: "you", kind: "connection", text: "Sent a connection request to Amaka Nwosu", at: at(-4, 20) },
      { id: "a22", clientId: "c-chidi", who: "you", kind: "connection", text: "Sent a connection request to Kwame Asante", at: at(-4, 20, 10) },
      { id: "a23", clientId: "c-chidi", who: "team", kind: "follow-up", text: "Followed up with Amaka Nwosu after her message, and suggested a call", at: at(-3, 10) },
      { id: "a24", clientId: "c-chidi", who: "team", kind: "follow-up", text: "Thanked 6 new connections with a short message", at: at(-5, 14) },
      { id: "a25", clientId: "c-chidi", who: "you", kind: "event", text: "Registered for Payments Policy Roundtable", at: at(-3, 19) },
      { id: "a26", clientId: "c-chidi", who: "team", kind: "profile", text: "Added your Lagos Fintech Week talk to Featured", at: at(-6, 15) },
      // Week 8 and month 2.
      { id: "a27", clientId: "c-chidi", who: "team", kind: "post", text: "Published \"Settlement is a trust problem\"", at: at(-11, 9) },
      { id: "a28", clientId: "c-chidi", who: "team", kind: "engagement", text: "Commented on 13 posts from bank partners", at: at(-12, 12) },
      { id: "a29", clientId: "c-chidi", who: "team", kind: "connection", text: "Sent 15 connection requests to people on your target list", at: at(-13, 10) },
      { id: "a30", clientId: "c-chidi", who: "team", kind: "call", text: "Held your monthly check-in call", at: at(-15, 11) },
      { id: "a31", clientId: "c-chidi", who: "you", kind: "profile", text: "Updated your About section", at: at(-20, 18) },
      { id: "a32", clientId: "c-chidi", who: "team", kind: "engagement", text: "Reacted to 40 posts from your target list", at: at(-25, 16) },
    ],

    requests: [
      { id: "r1", clientId: "c-chidi", text: "Post the Q3 product update to the Paystream company Page", why: "Your company Page has not posted in 3 weeks. This post is already approved for your profile.", at: hoursAgo(26), status: "pending" },
      { id: "r2", clientId: "c-chidi", text: "Reply to comments on your leadership post", why: "61 comments, several from your target list.", at: at(-4, 15), status: "approved" },
    ],

    brands: [
      { clientId: "c-chidi", colours: ["#224cd5", "#0a226d", "#f2b84b"], voice: "Plain and confident. I like short sentences and real numbers. I sound like I am talking to a smart friend, not giving a speech.",
        wordsUse: ["settlement", "trust", "corridor", "builders"], wordsAvoid: ["disrupt", "revolutionary", "synergy", "game-changer"],
        examples: ["My 2022 post about our first 1,000 merchants", "Interview with TechCabal, March"],
        offLimits: [
          { id: "o1", kind: "topic", text: "Politics and elections" },
          { id: "o2", kind: "company", text: "FirstBank (in talks, confidential)" },
          { id: "o3", kind: "topic", text: "Our Ghana licence, until it is public next month" },
          { id: "o4", kind: "person", text: "Former co-founder, Emeka Obi" },
          { id: "o5", kind: "interaction", text: "Never reply to comments about our valuation" },
        ] },
      { clientId: "c-sarah", colours: ["#0f7a38"], voice: "Warm, careful, clinical when needed.", wordsUse: ["patients", "safety"], wordsAvoid: ["disrupt"], examples: [], offLimits: [{ id: "o6", kind: "topic", text: "Named patients or cases" }] },
      { clientId: "c-zainab", colours: [], voice: "Kind and expert.", wordsUse: [], wordsAvoid: [], examples: [], offLimits: [{ id: "o7", kind: "topic", text: "Abortion law" }] },
    ],
    brandFiles: [
      { id: "b1", clientId: "c-chidi", section: "photos", name: "Headshot-2024.jpg", src: IMG.portrait, size: "1.8 MB", at: at(-58) },
      { id: "b2", clientId: "c-chidi", section: "photos", name: "Office-team.jpg", src: IMG.team, size: "3.1 MB", at: at(-40) },
      { id: "b3", clientId: "c-chidi", section: "photos", name: "Fintech-week-stage.jpg", src: IMG.talk, size: "2.4 MB", at: hoursAgo(6) },
      { id: "bv1", clientId: "c-chidi", section: "videos", name: "Office-walkthrough.mp4", src: "/media/sample-talk.mp4", size: "0.1 MB", at: at(-12), video: { poster: "/media/sample-talk.jpg", seconds: 10, shape: "landscape" }, addedBy: "client" },
      { id: "bc1", clientId: "c-chidi", section: "carousels", name: "Payments-myths.pdf", size: "2.2 MB", at: at(-20), carousel: { pages: 4, slides: [{ src: IMG.desk, alt: "Cover: 4 myths about cross-border payments" }, { src: IMG.laptop, alt: "1. It is slow because of technology" }, { src: IMG.meeting, alt: "2. Only banks can do it" }, { src: IMG.pair, alt: "3 and 4. Costs and rules" }] }, addedBy: "team" },
      { id: "b4", clientId: "c-chidi", section: "photos", name: "Board-meeting.jpg", src: IMG.meeting, size: "2.0 MB", at: at(-20) },
      { id: "b5", clientId: "c-chidi", section: "logos", name: "Paystream-logo.svg", size: "24 KB", at: at(-58) },
      { id: "b6", clientId: "c-chidi", section: "documents", name: "Paystream brand guide.pdf", size: "4.2 MB", at: at(-58) },
      { id: "b7", clientId: "c-chidi", section: "documents", name: "Speaker bio.docx", size: "120 KB", at: at(-30) },
    ],
    moments: [
      { id: "mo1", clientId: "c-chidi", note: "I spoke at Lagos Fintech Week on Thursday. I want a post about the question from the student in the second row.", photos: [IMG.talk, IMG.event], at: hoursAgo(4), status: "post-drafted" },
      { id: "mo2", clientId: "c-chidi", note: "We crossed 10,000 merchants in Ghana. Can we post when it is public?", photos: [], at: at(-15), status: "seen" },
      { id: "mo3", clientId: "c-sarah", note: "Visited Korle Bu hospital with our clinical team.", photos: [IMG.pair], at: hoursAgo(30), status: "new" },
    ],

    contracts: [
      { id: "k-chidi", clientId: "c-chidi", months: 6, monthlyCents: 80000, signedAt: at(-63), signedName: "Chidi Okeke", freeEndsAt: at(-49), startsAt: at(-49), endsAt: at(133), status: "active", paid: true, card: { brand: "Visa", last4: "4242" } },
      { id: "k-sarah", clientId: "c-sarah", months: 3, monthlyCents: 90000, signedAt: at(-10), signedName: "Sarah Mensah", freeEndsAt: at(4), startsAt: at(4), endsAt: at(95), status: "free", paid: false },
      { id: "k-ngozi", clientId: "c-ngozi", months: 3, monthlyCents: 90000, signedAt: at(-2), signedName: "Ngozi Eze", freeEndsAt: at(12), startsAt: at(12), endsAt: at(103), status: "free", paid: false },
      { id: "k-femi", clientId: "c-femi", months: 12, monthlyCents: 70000, signedAt: at(-6), signedName: "Femi Lawal", freeEndsAt: at(8), startsAt: at(8), endsAt: at(373), status: "free", paid: true, card: { brand: "Mastercard", last4: "8810" } },
      { id: "k-zainab", clientId: "c-zainab", months: 6, monthlyCents: 80000, signedAt: at(-95), signedName: "Zainab Bello", freeEndsAt: at(-81), startsAt: at(-81), endsAt: at(101), status: "active", paid: true, card: { brand: "Visa", last4: "1177" } },
      { id: "k-kemi", clientId: "c-kemi", months: 3, monthlyCents: 90000, signedAt: at(-26), signedName: "Kemi Ola", freeEndsAt: at(-12), startsAt: at(-12), endsAt: at(79), status: "paused", paid: false },
      { id: "k-tobi", clientId: "c-tobi", months: 12, monthlyCents: 70000, signedAt: at(-120), signedName: "Tobi Akin", freeEndsAt: at(-106), startsAt: at(-106), endsAt: at(259), status: "active", paid: true, card: { brand: "Visa", last4: "5560" } },
      { id: "k-musa", clientId: "c-musa", months: 6, monthlyCents: 80000, signedAt: at(-40), signedName: "Musa Ibrahim", freeEndsAt: at(-26), startsAt: at(-26), endsAt: at(9), status: "cancelled", paid: true, card: { brand: "Visa", last4: "3301" } },
      { id: "k-tari", clientId: "c-tari", months: 12, monthlyCents: 80000, signedAt: at(-38), signedName: "Tari Briggs", freeEndsAt: at(-24), startsAt: at(-24), endsAt: at(341), status: "active", paid: true, card: { brand: "Mastercard", last4: "7782" } },
    ],
    // Contracts are paid up front, so each contract has one invoice for its full amount.
    invoices: [
      { id: "i1", clientId: "c-chidi", number: "BC-1042", amountCents: 480000, at: at(-49), status: "paid", label: "6 months, paid in full" },
      { id: "i4", clientId: "c-kemi", number: "BC-1120", amountCents: 270000, at: at(-12), status: "failed", label: "3 months, paid in full" },
      { id: "i5", clientId: "c-femi", number: "BC-1135", amountCents: 840000, at: at(-6), status: "paid", label: "12 months, paid in full" },
      { id: "i6", clientId: "c-musa", number: "BC-1101", amountCents: 480000, at: at(-26), status: "paid", label: "6 months, paid in full" },
      { id: "i7", clientId: "c-tobi", number: "BC-1099", amountCents: 840000, at: at(-106), status: "paid", label: "12 months, paid in full" },
      { id: "i8", clientId: "c-zainab", number: "BC-1112", amountCents: 480000, at: at(-81), status: "paid", label: "6 months, paid in full" },
    ],
    refunds: [
      { id: "rf1", clientId: "c-musa", amountCents: 320000, calc: "Paid 6 months in full ($4,800). Service runs to the end of month 2. Months 3 to 6 have not started: 4 x $800 = $3,200.", reason: "Not seeing results", at: hoursAgo(7), status: "waiting" },
      { id: "rf2", clientId: "c-kemi", amountCents: 0, calc: "Nothing paid yet.", reason: "Paused, unpaid", at: at(-12), status: "auto-approved" },
    ],
    cancellations: [
      { id: "x1", clientId: "c-musa", reason: "Not seeing results", note: "I expected more founders to reach out by now.", at: hoursAgo(7) },
      { id: "x2", clientId: "c-tobi", reason: "Too expensive", note: "Withdrawn after a call with the owner.", at: at(-30) },
      { id: "x3", clientId: "c-zainab", reason: "Not enough time to review", at: at(-45) },
    ],
    complaints: [
      { id: "cp1", clientId: "c-tobi", kind: "quality", text: "Two of last week's posts sounded generic. They did not sound like me at all.", at: hoursAgo(30), status: "in-review",
        timeline: [
          { at: at(-9, 10), text: "Posts sent to Tobi for review", who: "manager" },
          { at: at(-8, 21), text: "Tobi approved both without changes", who: "client" },
          { at: at(-7, 9), text: "Both posts published", who: "system" },
          { at: hoursAgo(30), text: "Complaint raised: quality", who: "client" },
          { at: hoursAgo(20), text: "Owner reviewing. Manager asked for the drafts and checks", who: "owner" },
        ] },
      { id: "cp2", clientId: "c-zainab", kind: "missed", text: "My Monday post had the wrong clinic name.", at: at(-1, 9), status: "open",
        timeline: [{ at: at(-3, 10), text: "Post published", who: "system" }, { at: at(-1, 9), text: "Fix requested", who: "client" }] },
    ],

    managerTasks: [
      { id: "mt1", managerId: "m-ada", clientId: "c-zainab", group: "urgent", column: "todo", title: "Fix a live post", detail: "The clinic name in paragraph 2 is wrong. It should be Garki, not Gwarinpa.", dueAt: at(0, 14), action: "Fix the post", href: "/manager/clients/c-zainab/content" },
      { id: "mt2", managerId: "m-ada", clientId: "c-sarah", group: "urgent", column: "todo", title: "Post failed to publish", detail: "LinkedIn rejected the image size. Tried 3 times.", dueAt: at(0, 16), action: "Fix and retry", href: "/manager/clients/c-sarah/content" },
      { id: "mt3", managerId: "m-ada", clientId: "c-sarah", group: "work", column: "doing", title: "Apply Sarah's changes", detail: "1 post: make the dashboards post softer.", dueAt: at(0, 18), action: "Apply changes", href: "/manager/clients/c-sarah/content" },
      { id: "mt4", managerId: "m-ada", clientId: "c-chidi", group: "work", column: "todo", title: "New Moment: Lagos Fintech Week", detail: "Chidi added photos and a note. A draft is ready for you to review.", dueAt: at(1, 12), action: "Open the Moment", href: "/manager/clients/c-chidi?tab=brand" },
      { id: "mt5", managerId: "m-ada", clientId: "c-femi", group: "waiting", column: "waiting", title: "What we agreed, sent to Femi", detail: "Updated after yesterday's call. Waiting for Femi to approve.", dueAt: at(1, 17), action: "Open strategy", href: "/manager/clients/c-femi/onboard" },
      { id: "mt6", managerId: "m-ada", clientId: "c-sarah", group: "work", column: "todo", title: "Schedule 1 approved post", detail: "\"3 questions to ask before buying any ward software\".", dueAt: at(1, 12), action: "Schedule", href: "/manager/clients/c-sarah/content" },
      { id: "mt7", managerId: "m-ada", clientId: "c-chidi", group: "work", column: "todo", title: "Draft next week's posts", detail: "3 posts: 2 cross-border, 1 from Lagos Fintech Week.", dueAt: at(2, 17), action: "Plan content", href: "/manager/clients/c-chidi/content" },
      { id: "mt8", managerId: "m-ada", clientId: "c-sarah", group: "work", column: "todo", title: "Send Sarah's weekly update", detail: "Drafted. Add your note and send.", dueAt: at(2, 17), action: "Open update", href: "/manager/clients/c-sarah?tab=updates" },
      { id: "mt9", managerId: "m-ada", clientId: "c-ngozi", group: "work", column: "todo", title: "Set up listening for Ngozi", detail: "No Google Alerts yet. 4 topics suggested.", dueAt: at(-1, 17), action: "Set up listening", href: "/manager/clients/c-ngozi?tab=listening" },
      { id: "mt10", managerId: "m-ada", clientId: "c-zainab", group: "waiting", column: "waiting", title: "2 posts held", detail: "Waiting for Zainab's review, 2 days late.", dueAt: at(-2, 17), action: "Send a reminder", href: "/manager/messages?client=c-zainab" },
      { id: "mt11", managerId: "m-ada", clientId: "c-chidi", group: "waiting", column: "waiting", title: "3 posts with Chidi", detail: "Due tomorrow at 5pm.", dueAt: at(1, 17), action: "Open", href: "/manager/clients/c-chidi/content" },
      { id: "mt12", managerId: "m-ada", clientId: "c-chidi", group: "work", column: "done", title: "Sent 6 people to connect with", detail: "Quick task sent to Chidi.", dueAt: hoursAgo(5), action: "Open", href: "/manager/clients/c-chidi?tab=engagement" },
      { id: "mt13", managerId: "m-ada", clientId: "c-zainab", group: "work", column: "done", title: "Weekly update sent", detail: "Week 14.", dueAt: at(-1, 17), action: "Open", href: "/manager/clients/c-zainab?tab=updates" },
      { id: "mt14", managerId: "m-tunde", clientId: "c-tobi", group: "work", column: "done", title: "Post on hiring", detail: "Went out a day late.", dueAt: at(-6, 9), action: "Open", href: "/manager/clients/c-tobi/content", missed: { reason: "Client sent the photos late, so the post slipped a day.", at: at(-6, 18) } },
      { id: "mt15", managerId: "m-tunde", clientId: "c-musa", group: "work", column: "done", title: "Weekly update", detail: "Sent on Tuesday.", dueAt: at(-13, 17), action: "Open", href: "/manager/clients/c-musa?tab=updates", missed: { reason: "Was ill on Monday.", at: at(-12, 10) } },
      { id: "mt16", managerId: "m-tunde", clientId: "c-kemi", group: "work", column: "done", title: "Draft next week's posts", detail: "Sent a day late.", dueAt: at(-20, 17), action: "Open", href: "/manager/clients/c-kemi/content", missed: { reason: "", at: at(-19, 9) } },
    ],
    leads: [
      { id: "l1", clientId: "c-chidi", kind: "post", action: "comment", name: "Ibrahim Sule", detail: "Investment director, Sahel Growth Fund · Post, 2 hours ago, 84 comments", url: "https://www.linkedin.com/posts/example-1", post: "The new mobile money report is out. Three numbers every payments founder should read before their next raise...", fit: "strong", why: "Investor on Chidi's list, writing about his topic.", draft: "The report misses one thing: settlement time. Our data shows mobile money users wait 3x longer for cross-border funds. Happy to share the numbers.", status: "suggested" },
      { id: "l2", clientId: "c-chidi", kind: "post", action: "comment", name: "Kwame Asante", detail: "Head of payments, Accra Commercial Bank · Post, yesterday, 22 comments", url: "https://www.linkedin.com/posts/example-2", post: "Ghana to Nigeria corridors will not scale until banks on both sides hold local liquidity.", fit: "good", why: "Likely bank partner for the Ghana corridor.", draft: "Agree on liquidity. The corridor works when both sides hold local funds.", status: "kept" },
      { id: "l3", clientId: "c-chidi", kind: "post", action: "react", name: "FirstBank", detail: "Company Page · Post, today, 310 comments", url: "https://www.linkedin.com/posts/example-3", fit: "weak", why: "Popular post about payments.", warning: "FirstBank is on Chidi's off-limits list.", reaction: "like", status: "suggested" },
      { id: "l5", clientId: "c-chidi", kind: "post", action: "react", name: "Amaka Nwosu", detail: "Partner, Lagos Angel Network · Post, today", url: "https://www.linkedin.com/posts/example-5", post: "We just closed our fourth fund. 40% goes to fintech outside Lagos.", fit: "strong", why: "Investor who commented on Chidi's settlement post. Celebrating the news keeps Chidi in view.", reaction: "celebrate", status: "suggested" },
      { id: "l6", clientId: "c-chidi", kind: "post", action: "save", name: "Tolu Bamidele", detail: "Policy lead, Central Bank fintech office · Post, 3 days ago", url: "https://www.linkedin.com/posts/example-6", post: "A plain-language guide to the new cross-border payment rules, with the dates that matter.", fit: "good", why: "Reference for Chidi's post on the new rules next week.", status: "suggested" },
      { id: "l7", clientId: "c-chidi", kind: "person", action: "follow", name: "Africa Fintech Summit", detail: "Company Page · 48k followers", url: "https://www.linkedin.com/company/example-afs", fit: "strong", why: "Chidi is registering for their summit. Following shows their updates and speaker calls.", status: "suggested" },
      { id: "l8", clientId: "c-chidi", kind: "person", action: "message", name: "Ruth Mensah", detail: "COO, Volta Logistics · Connected last week", url: "https://www.linkedin.com/in/example-ruth", fit: "strong", why: "Accepted Chidi's request. A short thank-you starts the conversation.", draft: "Hi Ruth, thanks for connecting. If late payments from Ghana are ever a headache for Volta, I would be glad to show you how we fix it.", status: "suggested" },
      { id: "l4", clientId: "c-chidi", kind: "person", action: "connect", name: "Funmi Adebayo", detail: "Fintech reporter, TechCabal", url: "https://www.linkedin.com/in/example-funmi", fit: "strong", why: "Writes about cross-border payments every month.", draft: "Hi Funmi, I enjoy your payments coverage. Happy to share data from our cross-border work if it is ever useful.", status: "done" },
    ],
    signals: [
      { id: "sg1", clientId: "c-chidi", title: "Central bank publishes mobile money report", source: "Google Alert: mobile money Nigeria", url: "https://example.com/report", at: hoursAgo(10), topic: "Cross-border payments" },
      { id: "sg2", clientId: "c-chidi", title: "3 Lagos founders post about ECOWAS payments", source: "Found by Ada on LinkedIn", url: "https://www.linkedin.com/feed", at: hoursAgo(28), topic: "Cross-border payments" },
      { id: "sg3", clientId: "c-chidi", title: "Ghana fintech licence round opens", source: "Google Alert: Ghana fintech", url: "https://example.com/ghana", at: at(-2, 8), topic: "Cross-border payments" },
      { id: "sg4", clientId: "c-chidi", title: "Seed rounds in Africa slow for the third quarter", source: "News search: African fintech funding", url: "https://example.com/funding", at: at(-3, 8), topic: "Investors" },
    ],
    alerts: [
      { id: "al1", clientId: "c-chidi", topic: "mobile money Nigeria", url: "https://www.google.com/alerts/feeds/example/1", working: true, lastItemAt: hoursAgo(10) },
      { id: "al2", clientId: "c-chidi", topic: "Ghana fintech", url: "https://www.google.com/alerts/feeds/example/2", working: true, lastItemAt: at(-2, 8) },
      { id: "al3", clientId: "c-chidi", topic: "ECOWAS payments", url: "https://www.google.com/alerts/feeds/example/3", working: false, lastItemAt: at(-16) },
    ],

    framework: [
      { id: "f1", section: "templates", title: "Founder visibility strategy", body: "For founders who want investors and partners to know them. 3 to 4 topics: the field, the company story, leadership, and one for the next raise.", updatedAt: at(-20) },
      { id: "f2", section: "templates", title: "Expert voice strategy", body: "For specialists such as doctors and lawyers. Lead with expertise, add speaking, keep claims careful.", updatedAt: at(-35) },
      { id: "f3", section: "topics", title: "The field", body: "What is changing in the client's field, with their view on it.", updatedAt: at(-40) },
      { id: "f4", section: "formats", title: "Story post", body: "A moment, a turn, a lesson. 120 to 220 words. Opens with the moment, not the lesson.", updatedAt: at(-12) },
      { id: "f5", section: "formats", title: "Opinion post", body: "One clear view, why, and what to do. Invite disagreement.", updatedAt: at(-12) },
      { id: "f6", section: "tone", title: "Plain and specific", body: "Short sentences. Real numbers. No buzzwords. Sounds like the client talking.", updatedAt: at(-50) },
      { id: "f7", section: "banned", title: "Banned phrases", body: "Game-changer, revolutionary, thrilled to announce, humbled, synergy, in today's fast-paced world.", updatedAt: at(-8) },
      { id: "f8", section: "checks", title: "Before any post goes to a client", body: "Off limits, claims with sources, banned phrases, generic writing, repeats, image descriptions.", updatedAt: at(-8) },
      { id: "f9", section: "industry", title: "Health", body: "No patient stories without written consent. No treatment claims. Add a disclaimer on medical advice.", updatedAt: at(-60) },
      { id: "f10", section: "industry", title: "Law", body: "No comment on live cases. No advice to the public. Follow the bar's rules on publicity.", updatedAt: at(-60) },
      { id: "f11", section: "linkedin", title: "Timing", body: "Weekdays 8 to 10am in the client's time zone do best for West African audiences. Avoid Friday afternoons.", updatedAt: at(-5) },
      { id: "f12", section: "linkedin", title: "Links and length", body: "Posts with outside links reach fewer people. Put the link in the first comment. 150 to 250 words works best right now.", updatedAt: at(-5) },
    ],
    frameworkVersions: [
      { version: "v3", at: at(-5), note: "Updated timing and length from October results." },
      { version: "v2", at: at(-40), note: "Added the health and law industry rules." },
      { version: "v1", at: at(-120), note: "First version." },
    ],
    audit: [
      { id: "au1", who: "Musa Ibrahim", action: "Pulled out of contract (reason: not seeing results)", target: "Sahel Ventures", at: hoursAgo(7), kind: "account" },
      { id: "au2", who: "System", action: "Refund of $3,200 is waiting for approval (above the $1,000 limit)", target: "Musa Ibrahim", at: hoursAgo(7), kind: "refund" },
      { id: "au3", who: "Fola Morenikeji", action: "Assigned Ada Obi", target: "Ngozi Eze", at: at(-2, 10), kind: "assignment" },
      { id: "au4", who: "Fola Morenikeji", action: "Changed the automatic refund limit from $800 to $1,000", target: "Settings", at: at(-6, 15), kind: "setting" },
      { id: "au5", who: "System", action: "Paused account: free 2 weeks ended without payment", target: "Kemi Ola", at: at(-12), kind: "account" },
      { id: "au6", who: "Fola Morenikeji", action: "Covered for Tunde Bakare (2 hours)", target: "Tobi Akin", at: at(-9, 14), kind: "step-in" },
      { id: "au7", who: "Fola Morenikeji", action: "Published framework v3", target: "Framework", at: at(-5, 9), kind: "setting" },
      { id: "au8", who: "Fola Morenikeji", action: "Invited Bisi Adebayo as a manager", target: "Managers", at: at(-1, 12), kind: "account" },
      { id: "au9", who: "Ada Obi", action: "Took down a post at the client's request", target: "Zainab Bello", at: at(-20, 9), kind: "content" },
    ],
    payouts: [
      { id: "po1", managerId: "m-ada", period: "This month", clients: 5, amountCents: 125000, status: "to-approve" },
      { id: "po2", managerId: "m-tunde", period: "This month", clients: 3, amountCents: 75000, status: "to-approve" },
      { id: "po3", managerId: "m-ada", period: "Last month", clients: 4, amountCents: 100000, status: "paid" },
      { id: "po4", managerId: "m-tunde", period: "Last month", clients: 3, amountCents: 75000, status: "paid" },
    ],
    settings: { freeDays: 14, autoRefundLimitCents: 100000, reminderDays: [5, 3, 0], pauseWarningDays: 15, removalDays: 30, goAheadHours: 24, maxClientsPerManager: 10, daysBetweenCalls: 3, sessionTimeoutMinutes: 60, fullServiceCents: 80000, pageManagementCents: 40000 },
    changeRequests: [{ id: "cr1", clientId: "c-zainab", reason: "I would like a manager with a health background.", at: at(-1, 16), status: "open" }],
    accessLog: [
      { id: "ac1", clientId: "c-tari", who: "Ada Obi", at: hoursAgo(6), action: "Posted your approved update and replied to comments on your Page", minutes: 25 },
      { id: "ac2", clientId: "c-tari", who: "Ada Obi", at: at(-2, 10), action: "Researched investors and commented on your behalf", minutes: 40 },
      { id: "ac3", clientId: "c-tari", who: "Ada Obi", at: at(-5, 9), action: "Published your weekly post and updated your headline (you approved it)", minutes: 20 },
    ],
    accessAlerts: [{ id: "al1", clientId: "c-tari", managerName: "Ada Obi", at: hoursAgo(5), kind: "security-page", detail: "Opened LinkedIn Sign-in & security during a session. Blocked automatically.", resolved: false }],
    assistants: [{ id: "as-amaka", clientId: "c-chidi", name: "Amaka Obi", role: "EA", email: "amaka@paystream.example", whatsapp: "+234 803 555 0142", auto: [] }],
    outbox: [
      { id: "o1", to: "Chidi Okafor", userId: "u-chidi", channel: "email", address: "chidi@paystream.example", text: "3 posts are ready for your review. Due tomorrow at 5pm.", href: "/content/review", at: hoursAgo(2), by: "Ada Obi (manager)" },
      { id: "o2", to: "Chidi Okafor", userId: "u-chidi", channel: "whatsapp", address: "+234 802 555 0110", text: "3 posts are ready for your review. Due tomorrow at 5pm.", href: "/content/review", at: hoursAgo(2), by: "Ada Obi (manager)" },
      { id: "o3", to: "Fola Morenikeji", userId: "u-fola", channel: "email", address: "fola@bluecut.example", text: "Musa Ibrahim pulled out. A refund of $3,200 needs your approval.", href: "/admin/money", at: hoursAgo(7), by: "Musa Ibrahim (client)" },
      { id: "o4", to: "Ada Obi", userId: "u-ada", channel: "email", address: "ada@bluecut.example", text: "Zainab asked for a fix on a live post.", href: "/manager/clients/c-zainab/content", at: hoursAgo(1), by: "Zainab Bello (client)" },
      { id: "o5", to: "Chidi Okafor", userId: "u-chidi", channel: "email", address: "chidi@paystream.example", text: "Your weekly update is ready to read.", href: "/progress/u-chidi-w9", at: hoursAgo(50) },
    ],
  };
}

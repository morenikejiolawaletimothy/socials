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
  /** Two-step sign-in. Required for staff, optional for clients. */
  twoStep: boolean;
  /** Profile photo, as a small data URL until Phase 2 stores files. */
  photo?: string;
  /** #43: the LinkedIn profile URL we extract name/photo from, and re-sync on demand. */
  linkedinUrl?: string;
  /** Email and alert choices, by key. Missing keys use the default for that key. */
  prefs?: Record<string, boolean>;
  /** Session ids the person signed out of (Account, "Where you are signed in"). */
  signedOut?: string[];
  /** Set when a client deletes their account. */
  deletedAt?: string;
  /** C18: WhatsApp number for notifications, confirmed with a code sent on WhatsApp. */
  whatsapp?: { number: string; confirmed: boolean };
  /** C18: how this person is told. Clients set it in How you review (C5) and Account; staff in Profile. */
  channels?: Channels;
};

/** C18: where notifications go. In the app is always on. */
export type Channels = {
  email: boolean;
  whatsapp: boolean;
  /** "now": as they happen. "daily": together once a day at 9am. Urgent items always go at once. */
  timing: "now" | "daily";
  /** No messages 9pm to 7am in the person's time zone, except urgent ones. */
  quietNights: boolean;
};

/** C2: what the client lets us do on LinkedIn. */
export type Permissions = {
  post: boolean;
  engage: boolean;
  companyPage: boolean;
  connectionDrafts: boolean;
  profileDrafts: boolean;
};

/** C5: how the client reviews. */
export type ReviewSettings = {
  frequency: "weekly" | "twice-weekly" | "every-post";
  channels: { email: boolean; app: boolean; whatsapp?: boolean };
  /** For each kind of work: ask first, or go ahead without asking. */
  /** Engagement and connection notes are done by the client themselves (quick tasks), so only posts need a setting. */
  approval: { posts: "ask" | "go" };
  ifNoReply: "wait" | "go";
};

/** C1: the six setup steps, in order. */
export type SetupStep = "service" | "permissions" | "access" | "goals-call" | "strategy-call" | "plan" | "review";

export type Client = {
  id: string;
  userId: string;
  managerId: string | null;
  company: string;
  role: string;
  country: string;
  industry: string;
  status: ClientStatus;
  /** Why the account is paused, when it is. */
  pausedReason?: "unpaid" | "contract-ended";
  pausedAt?: string;
  /** 0 to 100, setup progress shown on Home. */
  setupProgress: number;
  setupDone: SetupStep[];
  goal: string;
  linkedin: "connected" | "expired" | "disconnected" | "not-connected";
  postingPaused: boolean;
  permissions: Permissions;
  review: ReviewSettings;
  /** What the manager confirmed after the goals call (M3). */
  onboarding?: { audience: string; tone: string; notes?: string; confirmedAt: string };
  /** Where the client is in onboarding, after setup. */
  stage: "setup" | "calls" | "strategy" | "running";
  joinedAt: string;
  atRisk?: string;
  /** B (onboarding fork): self-serve (client does the LinkedIn actions) or full-service (done-for-you). Missing = self-serve. */
  service?: "self-serve" | "full-service";
  /** Set when the client is on full-service (C20). */
  fullService?: FullService;
  /** #41: the company Page add-on (either tier). Presence means it is on. Billed pro-rated, on top of the plan. */
  companyPage?: { since: string };
};

/**
 * C20 Full-service: the client delegates the work, not control. We never see their password and can never
 * change their account security. We act only through: the company Page as an official admin they grant, and
 * (delegated access) a login the client secures with their own authenticator 2FA and approves each time. There
 * is no Tasks tab; anything only the member can do is asked for in Messages. The permission contract is the
 * client's alone: the manager follows it and cannot change it. The client can pause or end access any time.
 */
export type FullService = {
  since: string;
  /** Delegated profile access (D): the client's secured login we operate with their per-session approval. */
  access?: DelegatedAccess;
  /** The client paused all our work from their side. We stop at once until they resume. */
  paused?: boolean;
  pausedAt?: string;
};

/**
 * D Delegated access: the client stores their LinkedIn login in an encrypted vault (we never read it), turns
 * on authenticator-app 2FA, and approves every management session on their phone. No cookies, no proxy.
 */
export type DelegatedAccess = {
  /** The vault holds the client's login (encrypted). In Phase 1 this is mocked; no real password is stored. */
  credentials: "set" | "none";
  /** The client turned on authenticator-app 2FA on LinkedIn, so they approve each login. */
  twoFactor: boolean;
  /** The stored login needs re-entering (LinkedIn rotated the session). */
  needsRefresh?: boolean;
  /** An open or pending management session by the account manager. */
  session?: AccessSession;
};

/** D: one management session: the manager notifies, the client approves on their phone, then the manager works. */
export type AccessSession = {
  id: string;
  managerName: string;
  /** requested: manager notified, waiting for the client. active: client approved, manager working. */
  state: "requested" | "active" | "ended" | "declined";
  note?: string;
  requestedAt: string;
  approvedAt?: string;
  endedAt?: string;
};

export type Manager = {
  id: string;
  userId: string;
  /** Single-use invite token while status is "invited". */
  inviteToken?: string;
  inviteExpiresAt?: string;
  status: "invited" | "waiting-for-training" | "active" | "suspended";
  intro: string;
  /** What the client sees on the manager's profile. Name, photo and work only: never their own accounts. */
  profile?: {
    location: string;
    languages: string[];
    yearsExperience: number;
    /** Short proof points ("Took a fintech founder from 2k to 18k followers in a year"). */
    highlights: string[];
    /** Past roles, newest first. */
    background: { role: string; place: string; years: string }[];
    /** How they like to work with clients, in their own words. */
    approach: string;
  };
  maxClients: number;
  /** #48 The account manager agreement, signed with their full name at onboarding. */
  agreement?: { fullName: string; signedAt: string; version: string };
  /** Open call slots, as "mon-morning" style keys. */
  slots?: string[];
  trainingAt?: string;
  /** Google Calendar: booked calls go in, busy times close slots. */
  calendarConnected?: boolean;
  industries: string[];
  stats: {
    onTime: number;
    firstTimeApproval: number;
    missed: number;
    complaints: number;
    /** #46: the average content grade across their clients' drafts (word, staff-only). */
    avgGrade?: "very bad" | "not so good" | "good" | "very good" | "perfect";
    /** #46: median hours to answer a client request (fix, take-down, question). */
    responseHours?: number;
    /** #46: out-of-access attempts in the two-strike escalation (0, 1 = warned, 2 = barred). */
    strikes?: number;
  };
};

export type Notification = {
  id: string;
  userId: string;
  text: string;
  href: string;
  createdAt: string;
  read: boolean;
  /** Also sent by email (Phase 2 sends it with Resend, following the person's notification settings). */
  email?: boolean;
  /** Urgent items are shown first and always emailed. */
  urgent?: boolean;
  /** Who did what made this notification (the signed-in person, as "Ada Obi (manager)"). Missing means the system. */
  by?: string;
};

/* ---------- Content (C7, C8, M4, M5) ---------- */

export type PostStatus =
  | "draft"
  | "manager-review"
  | "awaiting-client"
  | "changes-requested"
  | "approved"
  | "scheduled"
  | "on-hold"
  | "published"
  | "failed"
  | "taken-down";

export type Post = {
  id: string;
  clientId: string;
  text: string;
  topic: string;
  format: "story" | "opinion" | "how-to" | "carousel" | "video" | "article" | "newsletter";
  /** The manager's short note to the client: why this post. */
  why: string;
  image?: { src: string; alt: string };
  /** A video post: the clip, the frame shown before it plays, its length and its shape. Use one of image, video or carousel. */
  video?: {
    src: string;
    poster: string;
    alt: string;
    seconds: number;
    shape?: "landscape" | "portrait" | "square";
    /** The caption file's name (LinkedIn takes one English .srt). */
    captions?: string;
    /** The manager confirmed the video has no speech, so it needs no captions. */
    noSpeech?: boolean;
    /** The Brand file it came from, if any. */
    fileId?: string;
  };
  /** A LinkedIn document carousel: a title and its pages, swiped one at a time. */
  carousel?: {
    title: string;
    slides: { src: string; alt: string }[];
    /** The document LinkedIn receives (PDF, PowerPoint or Word). PowerPoint and Word have no page preview here. */
    file?: { name: string; size: string; src?: string; pages?: number };
    fileId?: string;
  };
  /** A post waiting for a video the client was asked to record (quick task id). */
  waitingForVideo?: string;
  status: PostStatus;
  /** When the client's review is due. */
  dueAt?: string;
  /** When the post was sent to the client for review. */
  sentAt?: string;
  /** When the post was put on the schedule. */
  scheduledAt?: string;
  scheduledFor?: string;
  publishedAt?: string;
  stats?: { impressions: number; reactions: number; comments: number; reposts: number };
  /** Feedback from the client, newest last. */
  feedback?: { text: string; at: string; voice?: boolean }[];
  /** Routine work the manager did without asking, shown for information. */
  noAsk?: boolean;
  /** The client's open request on a live or taken-down post: fix it, or post it again. */
  request?: { kind: "fix" | "repost"; text: string; at: string; repostAs?: "reshare" | "new" };
  /** When the text of a live post was last edited on LinkedIn. Only the text can change once a post is live. */
  editedAt?: string;
  /** On a repost: the post it repeats. A reshare shows the original under a new comment; a new post copies it. */
  repostOf?: { id: string; text: string; publishedAt?: string; reshare: boolean };
  takenDownBy?: "client" | "team";
  heldReason?: string;
  failedReason?: string;
  /** Staff-only: checks run on the draft (M4). */
  checks?: { id: string; label: string; kind: "off-limits" | "claim" | "phrase" | "generic" | "repeat" | "alt-text"; state: "open" | "fixed" | "dismissed" }[];
  version?: number;
};

/* ---------- Quick tasks (C17, M6) ---------- */

/**
 * Engagement LinkedIn only lets the member do themselves (the API allows posting only). The manager finds the
 * right posts and people with their own account, and the client (or their assistant) does each in seconds.
 */
export type EngageAction = "comment" | "react" | "reshare" | "save" | "follow" | "message";

/** LinkedIn's reactions. */
export type LinkedInReaction = "like" | "celebrate" | "support" | "love" | "insightful" | "funny";

/** One post or person in an engagement task. */
export type EngageItem = {
  id: string;
  /** The post's author, or the person or Page to follow or message. */
  name: string;
  /** Their headline ("Partner, Lagos Angel Network"). */
  role: string;
  photo?: string;
  /** The post, or the profile for follow and message. */
  url: string;
  /** The opening of the post, so the client knows they opened the right one. */
  post?: string;
  why: string;
  /** Ready to paste: the comment, the thoughts on a reshare, or the message. */
  text?: string;
  reaction?: LinkedInReaction;
  done: boolean;
  /** The assistant who did it, when they did. */
  doneBy?: string;
  /** The suggestion it came from (M6), marked done with it. */
  leadId?: string;
};

export type Person = { id: string; name: string; role: string; profileUrl: string; why: string; note: string; done: boolean; /** The assistant who sent it, when they did. */ doneBy?: string; /** Their LinkedIn photo, when we have it. */ photo?: string };

export type TaskEvent = {
  type: "event" | "program";
  name: string;
  host: string;
  startsAt: string;
  /** Programs run over weeks; events can leave this out. */
  endsAt?: string;
  /** "Online" or a venue ("Eko Hotel, Lagos"). */
  place: string;
  /** Where to register. */
  url: string;
  why: string;
  /** The event's own picture (banner or venue), shown round on task tiles. */
  image?: string;
};

export type QuickTask = {
  id: string;
  clientId: string;
  kind: "connect" | "profile" | "event" | "video" | EngageAction;
  title: string;
  /** For "event" tasks: register by this date. */
  dueAt: string;
  /** Engagement tasks (comment, react, reshare, save, follow, message): the posts or people, one action each. */
  items?: EngageItem[];
  /** "connect" tasks: the people to connect with. */
  people?: Person[];
  /** "profile" tasks: the text to paste, and where. */
  text?: string;
  where?: string;
  /** "event" tasks: an event or program to register for and attend. Done means registered. */
  event?: TaskEvent;
  /** "video" tasks: what to record (suggested by the system from the strategy, edited by the manager), and the clip once uploaded. */
  video?: VideoBrief;
  done: boolean;
  sentAt: string;
  /** C19: handed to the client's assistant, who works on it from a private link. */
  handoff?: Handoff;
  /** Name of the assistant who finished it, when they did. */
  doneBy?: string;
};

/** C19: the client's executive or personal assistant. They never get an account. */
export type Assistant = {
  id: string;
  clientId: string;
  name: string;
  role: "EA" | "PA";
  email?: string;
  whatsapp?: string;
  /** Task kinds sent to this assistant automatically when they arrive. */
  auto: QuickTask["kind"][];
};

/** C19: a task handed to an assistant. The token opens that one task only (Phase 2 stores it hashed). */
export type Handoff = {
  assistantId: string;
  token: string;
  note?: string;
  sentAt: string;
  openedAt?: string;
  expiresAt: string;
  /** Set when the link stops working: the task was done, the client took it back. */
  endedAt?: string;
  endedReason?: "done" | "taken-back";
};

/** Phase 1 only: each email and WhatsApp message the real app would send, shown in the demo bar so links can be tried. */
export type OutboxItem = {
  id: string;
  /** Who it went to, as a name ("Chidi Okafor", "Amaka Obi (EA)"). */
  to: string;
  /** The person's account, when it went to a user (not to an assistant). */
  userId?: string;
  channel: "email" | "whatsapp";
  address: string;
  text: string;
  href: string;
  at: string;
  /** Who did what sent this message (as on Notification). Missing means the system. */
  by?: string;
};

/* ---------- Calls (C3, M10) ---------- */

export type Call = {
  id: string;
  clientId: string;
  managerId: string;
  kind: "goals" | "strategy" | "check-in";
  /** The call's name as the client sees it ("Onboarding call", "Quarterly review"). Falls back to a name for its kind. */
  title?: string;
  at: string;
  minutes: number;
  meetUrl: string;
  recording: boolean;
  status: "booked" | "done" | "cancelled";
  /** #42: the raw call transcript, only present when the call was recorded (the AM's own notetaker, with consent). */
  transcript?: string;
  /** #42: the synthesized insights the AM writes from the call. Feeds the strategy. */
  insights?: string;
  /** #42: set when the AM shares the transcript and insights with the client. The client sees them only after this. */
  sharedAt?: string;
  prep?: string[];
};

/* ---------- Strategy (C6, M3) ---------- */

export type Strategy = {
  clientId: string;
  version: number;
  status: "drafting" | "shared" | "agreed-sent" | "approved" | "change-asked";
  goal: string;
  audience: string;
  topics: { name: string; why: string }[];
  tone: string;
  measures: string[];
  /** Weekly targets by period. */
  targets: { period: string; posts: number; comments: number; connections: number; videos?: number; extra?: string }[];
  changeNote?: string;
  approvedAt?: string;
  frameworkVersion: string;
};

/** One line on a scorecard: the weekly target and how many are done. */
export type ScoreLine = { target: number; done: number };

/** The activities tracked on a scorecard. `profileTasks` is only on the personal profile, not the company Page (#45). */
export type Scorecard = {
  posts: ScoreLine;
  comments: ScoreLine;
  reactions: ScoreLine;
  follows: ScoreLine;
  connections: ScoreLine;
  saves: ScoreLine;
  profileTasks?: ScoreLine;
};

/** This week's numbers against the strategy (C9, M6). The flat fields are the personal-profile scorecard; `page` is the company-Page scorecard when the add-on is on (#45). */
export type WeekProgress = {
  clientId: string;
  weekOf: string;
  posts: ScoreLine;
  comments: ScoreLine;
  reactions: ScoreLine;
  follows: ScoreLine;
  connections: ScoreLine;
  saves: ScoreLine;
  profileTasks: ScoreLine;
  page?: Scorecard;
  held: string[];
};

/* ---------- Updates (C9, M8) ---------- */

export type Update = {
  id: string;
  clientId: string;
  kind: "weekly" | "monthly";
  title: string;
  periodLabel: string;
  sentAt?: string;
  status: "draft" | "sent";
  headline: string;
  did: { label: string; target: number; done: number }[];
  best: string[];
  progress: string;
  held: string[];
  field: string;
  next: string;
  note: string;
  results?: string[];
  /** When the manager corrected the update after sending it. */
  correctedAt?: string;
};

/* ---------- Messages (C10, M9) ---------- */

export type Message = {
  id: string;
  clientId: string;
  /** The conversation it belongs to. Older messages without one belong to the client's first conversation. */
  threadId?: string;
  fromUserId: string;
  text?: string;
  file?: { name: string; size: string; kind: "image" | "pdf" | "doc" | "video"; src?: string; poster?: string; seconds?: number };
  voice?: { seconds: number; transcript: string };
  at: string;
  savedToBrand?: boolean;
  /** Signed "Your account team" when the owner covers for the manager. */
  asTeam?: boolean;
  /** Quick reactions, one per person: like, dislike or "got it". */
  reactions?: { userId: string; kind: Reaction }[];
  /** Pinned to the top of its conversation, so it is easy to find again. */
  pinned?: boolean;
  /** Set when the sender changed the text after sending. */
  editedAt?: string;
};

export type Reaction = "like" | "dislike" | "done";

/** One conversation between a client and their manager, like a chat in an AI app: a title and its own messages. */
export type Thread = {
  id: string;
  clientId: string;
  title: string;
  createdAt: string;
};

/* ---------- Activity (C11) and requests ---------- */

export type Activity = {
  id: string;
  clientId: string;
  who: "you" | "team" | "system";
  /**
   * Every action on the account, by the client or by the team on their behalf. Reports list all of it for their period
   * except "setting" and "account" (housekeeping, not work toward the goal).
   */
  kind: "post" | "engagement" | "connection" | "follow-up" | "event" | "profile" | "call" | "setting" | "account" | "message";
  text: string;
  at: string;
};

/** A one-off permission the manager asks for (C11, M9). */
export type PermissionRequest = {
  id: string;
  clientId: string;
  text: string;
  why: string;
  at: string;
  status: "pending" | "approved" | "declined";
};

/* ---------- Your brand (C15) ---------- */

export type BrandFile = {
  id: string;
  clientId: string;
  section: "photos" | "logos" | "documents" | "videos" | "carousels";
  name: string;
  src?: string;
  size: string;
  at: string;
  /** Videos: cover frame, length and shape. */
  video?: { poster: string; seconds: number; shape: "landscape" | "portrait" | "square" };
  /** Carousels: page count and page previews (PDF only). */
  carousel?: { pages?: number; slides: { src: string; alt: string }[] };
  /** Who added it: the client, or the manager while drafting. */
  addedBy?: "client" | "team";
};

export type OffLimit = { id: string; kind: "topic" | "person" | "company" | "interaction"; text: string };

/** What to record, for a "Record a short video" quick task. */
export type VideoBrief = {
  idea: string;
  /** Why this video helps the client's goal. */
  why: string;
  /** What to say or show, in order. */
  shots: string[];
  length: string;
  shape: "landscape" | "portrait" | "square";
  tips: string[];
  /** The post this video is for, if any. */
  postId?: string;
  /** The Brand file once the client uploads the clip. */
  fileId?: string;
};

export type Moment = {
  id: string;
  clientId: string;
  note: string;
  photos: string[];
  /** Videos attached to the Moment (sources, as in Brand files). */
  videos?: { src: string; poster: string; seconds: number }[];
  at: string;
  status: "new" | "seen" | "post-drafted";
};

export type Brand = {
  clientId: string;
  colours: string[];
  voice: string;
  wordsUse: string[];
  wordsAvoid: string[];
  examples: string[];
  offLimits: OffLimit[];
};

/* ---------- Money (C13, A5) ---------- */

export type Contract = {
  id: string;
  clientId: string;
  months: 3 | 6 | 12;
  monthlyCents: number;
  signedAt: string;
  signedName: string;
  freeEndsAt: string;
  startsAt: string;
  endsAt: string;
  status: "free" | "active" | "ending" | "paused" | "completed" | "cancelled";
  /** The status before the client pulled out, so they can change their mind. */
  cancelledFrom?: Exclude<Contract["status"], "cancelled">;
  paid: boolean;
  card?: { brand: string; last4: string };
};

export type Invoice = {
  id: string;
  clientId: string;
  number: string;
  amountCents: number;
  at: string;
  status: "paid" | "failed" | "refunded" | "due";
  label: string;
};

export type Refund = {
  id: string;
  clientId: string;
  amountCents: number;
  calc: string;
  reason: string;
  at: string;
  status: "waiting" | "auto-approved" | "approved" | "declined" | "paid";
};

export type Cancellation = { id: string; clientId: string; reason: string; note?: string; at: string; withdrawnAt?: string };

/* ---------- Complaints (C12, A6) ---------- */

export type Complaint = {
  id: string;
  clientId: string;
  kind: "missed" | "quality" | "not-allowed" | "billing" | "manager" | "other";
  text: string;
  at: string;
  status: "open" | "in-review" | "resolved";
  outcome?: string;
  /** Who was waiting on whom: shown on the owner's timeline. */
  timeline: { at: string; text: string; who: "client" | "manager" | "owner" | "system" }[];
};

/* ---------- Manager work (M1, M6, M7) ---------- */

export type ManagerTask = {
  id: string;
  managerId: string;
  clientId: string;
  group: "urgent" | "work" | "waiting";
  column: "todo" | "doing" | "waiting" | "done";
  title: string;
  detail: string;
  dueAt: string;
  action: string;
  href: string;
  /** The manager's reason when a due time was missed (M1). The owner sees it on the manager's page. */
  missed?: { reason: string; at: string };
};

/**
 * M6: something worth doing on LinkedIn for the client, suggested by the system or added by the manager.
 * The manager checks it with their own account, then it goes to the client as part of a quick task.
 * suggested → kept (checked, ready to send) → sent (in a task) → done (the client did it); or dropped.
 */
export type Lead = {
  id: string;
  clientId: string;
  kind: "post" | "person";
  /** What the client should do. */
  action: EngageAction | "connect";
  name: string;
  detail: string;
  url: string;
  /** Post leads: the opening of the post. */
  post?: string;
  photo?: string;
  fit: "strong" | "good" | "weak";
  why: string;
  warning?: string;
  /** The comment, thoughts, note or message, in the client's voice. */
  draft?: string;
  reaction?: LinkedInReaction;
  status: "suggested" | "kept" | "sent" | "dropped" | "done";
  /** The quick task it went out in. */
  taskId?: string;
};

export type Signal = { id: string; clientId: string; title: string; source: string; url: string; at: string; topic: string };

export type AlertFeed = { id: string; clientId: string; topic: string; url: string; working: boolean; lastItemAt: string };

/* ---------- Owner (A3, A4, A7, A8) ---------- */

export type FrameworkItem = {
  id: string;
  section: "templates" | "topics" | "formats" | "tone" | "banned" | "checks" | "industry" | "linkedin";
  title: string;
  body: string;
  updatedAt: string;
};

export type FrameworkVersion = { version: string; at: string; note: string };

export type AuditEntry = { id: string; who: string; action: string; target: string; at: string; kind: "assignment" | "refund" | "setting" | "account" | "content" | "step-in" };

/* ---------- Admin roles and access (#49) ---------- */

/** The admin areas access can be scoped to. */
export type AdminArea = "clients" | "managers" | "framework" | "services" | "money" | "complaints" | "settings" | "audit" | "roles";

/** Access level to an area: nothing, read-only, or act. */
export type AdminAccess = "none" | "view" | "manage";

/**
 * #49: an admin role. `owner` marks the built-in Owner/Super admin: full access, cannot be edited or removed, and only
 * an Owner can grant it. All other roles are owner-creatable with per-area none/view/manage access.
 */
export type AdminRole = {
  id: string;
  name: string;
  description?: string;
  owner?: boolean;
  access: Record<AdminArea, AdminAccess>;
};

/** #49: an admin on the team. Holds one or more roles; effective access is the most permissive across them. */
export type AdminMember = {
  id: string;
  userId: string;
  roleIds: string[];
  status: "active" | "invited" | "deactivated";
  invitedAt?: string;
};

/** C20: a record of the account team working on a full-service client's account, shown to the client. */
export type AccessLog = { id: string; clientId: string; who: string; at: string; action: string; minutes?: number };

/** D: a breach signal on a full-service client's delegated access, for admins (insider-threat monitoring). */
export type AccessAlert = { id: string; clientId: string; managerName: string; at: string; kind: "no-notify" | "security-page" | "off-hours" | "bulk" | "devtools"; detail: string; resolved?: boolean };

export type Payout = { id: string; managerId: string; period: string; clients: number; amountCents: number; status: "to-approve" | "approved" | "paid" };

/**
 * A service Bluecut offers. "included" services come free with every plan and are delivered as normal work.
 * "extra" services are quoted and billed off the platform; the platform only offers them and captures a request.
 * Owner-managed in the catalog.
 */
export type Service = { id: string; name: string; description: string; bucket: "included" | "extra"; active: boolean };

/** A client's request for an extra service. Captured and handed to the owner, who follows up and bills off the platform. No status is kept. */
export type ServiceRequest = { id: string; clientId: string; serviceId: string; serviceName: string; note?: string; at: string };

export type Settings = {
  freeDays: number;
  autoRefundLimitCents: number;
  reminderDays: number[];
  pauseWarningDays: number;
  removalDays: number;
  goAheadHours: number;
  maxClientsPerManager: number;
  daysBetweenCalls: number;
  sessionTimeoutMinutes: number;
  /** Full-service done-for-you tier, a month, on top of the plan (USD cents). */
  fullServiceCents: number;
  /** Company Page add-on, a month (USD cents). Available on either tier. */
  pageManagementCents: number;
};

export type ManagerChangeRequest = { id: string; clientId: string; reason: string; at: string; status: "open" | "done" };

export type DemoSession = {
  role: Role;
  /** The user currently viewing, per role. */
  userIds: Record<Role, string>;
  /** Owner only: the manager being covered for, if any. */
  coveringManagerId?: string | null;
};

export type Db = {
  version: number;
  session: DemoSession;
  users: User[];
  clients: Client[];
  managers: Manager[];
  notifications: Notification[];
  posts: Post[];
  tasks: QuickTask[];
  calls: Call[];
  strategies: Strategy[];
  progress: WeekProgress[];
  updates: Update[];
  messages: Message[];
  threads: Thread[];
  activity: Activity[];
  requests: PermissionRequest[];
  brands: Brand[];
  brandFiles: BrandFile[];
  moments: Moment[];
  contracts: Contract[];
  invoices: Invoice[];
  refunds: Refund[];
  cancellations: Cancellation[];
  complaints: Complaint[];
  managerTasks: ManagerTask[];
  leads: Lead[];
  signals: Signal[];
  alerts: AlertFeed[];
  framework: FrameworkItem[];
  frameworkVersions: FrameworkVersion[];
  audit: AuditEntry[];
  payouts: Payout[];
  settings: Settings;
  changeRequests: ManagerChangeRequest[];
  assistants: Assistant[];
  outbox: OutboxItem[];
  accessLog: AccessLog[];
  accessAlerts: AccessAlert[];
  services: Service[];
  serviceRequests: ServiceRequest[];
  adminRoles: AdminRole[];
  adminMembers: AdminMember[];
};

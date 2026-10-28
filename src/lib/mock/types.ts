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
  channels: { email: boolean; app: boolean };
  /** For each kind of work: ask first, or go ahead without asking. */
  approval: { posts: "ask" | "go"; comments: "ask" | "go"; connectionNotes: "ask" | "go" };
  ifNoReply: "wait" | "go";
};

/** C1: the six setup steps, in order. */
export type SetupStep = "linkedin" | "permissions" | "goals-call" | "strategy-call" | "plan" | "review";

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
  /** Where the client is in onboarding, after setup. */
  stage: "setup" | "calls" | "strategy" | "running";
  joinedAt: string;
  atRisk?: string;
};

export type Manager = {
  id: string;
  userId: string;
  /** Single-use invite token while status is "invited". */
  inviteToken?: string;
  inviteExpiresAt?: string;
  status: "invited" | "waiting-for-training" | "active" | "suspended";
  intro: string;
  maxClients: number;
  /** Open call slots, as "mon-morning" style keys. */
  slots?: string[];
  trainingAt?: string;
  industries: string[];
  stats: { onTime: number; firstTimeApproval: number; missed: number; complaints: number };
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
  format: "story" | "opinion" | "how-to" | "carousel" | "article";
  /** The manager's short note to the client: why this post. */
  why: string;
  image?: { src: string; alt: string };
  status: PostStatus;
  /** When the client's review is due. */
  dueAt?: string;
  scheduledFor?: string;
  publishedAt?: string;
  stats?: { impressions: number; reactions: number; comments: number; reposts: number };
  /** Feedback from the client, newest last. */
  feedback?: { text: string; at: string; voice?: boolean }[];
  /** Routine work the manager did without asking, shown for information. */
  noAsk?: boolean;
  fixRequested?: string;
  heldReason?: string;
  failedReason?: string;
  /** Staff-only: checks run on the draft (M4). */
  checks?: { id: string; label: string; kind: "off-limits" | "claim" | "phrase" | "generic" | "repeat" | "alt-text"; state: "open" | "fixed" | "dismissed" }[];
  version?: number;
};

/* ---------- Quick tasks (C17, M6) ---------- */

export type Person = { id: string; name: string; role: string; profileUrl: string; why: string; note: string; done: boolean };

export type QuickTask = {
  id: string;
  clientId: string;
  kind: "connect" | "profile";
  title: string;
  dueAt: string;
  /** "connect" tasks: the people to connect with. */
  people?: Person[];
  /** "profile" tasks: the text to paste, and where. */
  text?: string;
  where?: string;
  done: boolean;
  sentAt: string;
};

/* ---------- Calls (C3, M10) ---------- */

export type Call = {
  id: string;
  clientId: string;
  managerId: string;
  kind: "goals" | "strategy" | "check-in";
  at: string;
  minutes: number;
  meetUrl: string;
  recording: boolean;
  status: "booked" | "done" | "cancelled";
  summary?: string;
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
  targets: { period: string; posts: number; comments: number; connections: number; extra?: string }[];
  changeNote?: string;
  approvedAt?: string;
  frameworkVersion: string;
};

/** This week's numbers against the strategy (C9, M6). */
export type WeekProgress = {
  clientId: string;
  weekOf: string;
  posts: { target: number; done: number };
  comments: { target: number; done: number };
  connections: { target: number; done: number };
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
};

/* ---------- Messages (C10, M9) ---------- */

export type Message = {
  id: string;
  clientId: string;
  fromUserId: string;
  text?: string;
  file?: { name: string; size: string; kind: "image" | "pdf" | "doc"; src?: string };
  voice?: { seconds: number; transcript: string };
  at: string;
  savedToBrand?: boolean;
  /** Signed "Your account team" when the owner covers for the manager. */
  asTeam?: boolean;
};

/* ---------- Activity (C11) and requests ---------- */

export type Activity = {
  id: string;
  clientId: string;
  who: "you" | "team" | "system";
  kind: "post" | "engagement" | "setting" | "account" | "message";
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
  section: "photos" | "logos" | "documents";
  name: string;
  src?: string;
  size: string;
  at: string;
};

export type OffLimit = { id: string; kind: "topic" | "person" | "company" | "interaction"; text: string };

export type Moment = {
  id: string;
  clientId: string;
  note: string;
  photos: string[];
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

export type Cancellation = { id: string; clientId: string; reason: string; note?: string; at: string };

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
};

export type Lead = {
  id: string;
  clientId: string;
  kind: "post" | "person";
  name: string;
  detail: string;
  url: string;
  fit: "strong" | "good" | "weak";
  why: string;
  warning?: string;
  draft?: string;
  status: "suggested" | "kept" | "dropped" | "done";
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

export type Payout = { id: string; managerId: string; period: string; clients: number; amountCents: number; status: "to-approve" | "approved" | "paid" };

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
};

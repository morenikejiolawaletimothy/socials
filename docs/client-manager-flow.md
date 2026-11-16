# Bluecut Socials — product walkthrough and the client ↔ account manager flow

**Purpose.** Two things in one document:
1. **Feature inventory** — every feature by role (client, account manager, admin) and what it is for.
2. **The flow that matters most** — the complete client journey, the complete account‑manager (AM) journey, and exactly how the two interweave and communicate — ending with an honest list of **gaps and assumptions** so we can decide what to lock down next.

This describes the product **as it is built today** (Phase 1, on mock data). Where something is implied but not actually built as a clear mechanism, it is called out in **Part E**.

---

## Part A — Feature inventory

### A1. Client features (what the client can see and do)

**Getting in**
- **Sign up / sign in** (`/signup`, `/signin`) — including LinkedIn‑URL sign‑up (we read name/photo from their URL) and Continue with Google.
- **Onboarding setup** (`/setup/*`) — a guided series: choose how we help (self‑serve vs full‑service), set what we may do for them (permissions), full‑service only: set up secure access (vault), **book the discovery + strategy calls**, choose a plan and sign, set how they review.

**Home and account**
- **Home** (`/home`) — a LinkedIn‑style feed: setup progress, next calls, posts awaiting their review, latest update from the AM, this week's progress.
- **Account** (`/account`) — profile, sign‑in/security, LinkedIn connection, notifications.
- **Me** (`/me`) — the mobile profile menu.

**The work**
- **Content** (`/content`) — their posts across the lifecycle; **Review** (`/content/review`) to approve or ask for changes; **Publish** (`/content/publish`, self‑serve) to copy the caption, open LinkedIn and mark as posted.
- **Strategy** (`/strategy`) — their agreed strategy (goal, audience, topics, tone, measures, weekly targets). They approve it or ask for a change.
- **Progress** (`/progress`, `/progress/[id]`) — weekly updates from the AM and the scorecard.
- **Brand** (`/brand`) — their voice, photos, **Moments** (life/work moments to turn into content, `/brand/moments/new`), and **off‑limits** (what we must never do or say).
- **Calls** (`/calls`, `/calls/book`) — discovery, strategy and ad‑hoc check‑in calls with the AM (the negotiation flow).
- **Account manager** (`/account-manager`) — who their AM is, their profile, message them.
- **Quick tasks** (`/tasks/[id]`) — small things the client does themselves (e.g. a comment or connection), which they can **hand to an assistant**.
- **Assistants** (`/assistants`, `/assistants/new`, `/assistants/[id]`) — their EA/PA who can do the quick tasks for them.
- **Services** (`/services`) — what is included in their plan, and extra services they can request (billed off‑platform).

**Control, money, support**
- **Control** (`/control`) — what we do for them, how they review, the activity log; **Raise a complaint** (`/control/complaint`).
- **Full‑service** (`/full-service`, `/full-service/access`) — manage the AM's delegated access: the permission contract, the vault, approve/pause/revoke login sessions, the access log.
- **Contract** (`/contract`, `/contract/cancel`) — plan, payments, invoices, extend, pull out.
- **Messages** (`/messages`) — chat with the AM.
- **Notifications** (`/notifications`).

### A2. Account manager features (what the AM can see and do)

- **Home** (`/manager`) — a work feed grouped by **Urgent, Tasks, Due time, Calls today, Waiting**, filterable by client.
- **Clients** (`/manager/clients`, `/manager/clients/[id]`) — each client's full picture across tabs (overview, strategy, content, engagement, calls & notes, access, brand/off‑limits).
- **Onboard** (`/manager/clients/[id]/onboard`) — the discovery → research/audit → strategy draft → approved‑strategy pipeline for a new client.
- **Content workspace** (`/manager/clients/[id]/content`, `.../content/video`) — create and prepare posts (text, image, carousel, video), run checks (off‑limits, claims, phrasing), share for approval, mark as posted (full‑service), handle fix/repost/take‑down requests.
- **Book a call with a client** (`/manager/clients/[id]/book-call`) — Flow B of the call system.
- **Calls and availability** (`/manager/calls`) — Requests · Booked · Open slots; confirm/suggest times, add the Meet link, record post‑call outcome.
- **Messages** (`/manager/messages`) — chat with each client.
- **Profile** (`/manager/profile`) — photo, intro (shown to clients when booking), the signed account‑manager agreement, calendar, notifications.
- **Notifications** (`/manager/notifications`).

### A3. Admin / owner features

- **Overview** (`/admin`) — the business at a glance.
- **Clients** (`/admin/clients`, `/admin/clients/[id]`) — every client, their state, assign a manager.
- **Managers** (`/admin/managers`, `/admin/managers/[id]`, `/admin/managers/invite`) — invite, train, step in, suspend/reinstate, **Pay** (download a performance report; no on‑platform pay).
- **Framework** (`/admin/framework`) — the house framework/playbook the AMs work to, with versions.
- **Services** (`/admin/services`, `/new`, `/[id]`) — the catalog of included vs off‑platform extra services.
- **Money** (`/admin/money`) — contracts, payments, invoices, refunds, why clients pull out.
- **Complaints** (`/admin/complaints`, `/[id]`) — the owner handles every complaint.
- **Settings** (`/admin/settings`) — free days, refund rules, reminders, session timeout, prices, etc.
- **Roles & team** (`/admin/roles`, `/new`, `/[id]`, `/invite`) — admin RBAC: roles, areas, members.
- **Audit log** (`/admin/audit-log`) — every owner action.
- **Notifications** (`/admin/notifications`).

---

## Part B — The complete client journey (lifecycle)

1. **Discover & sign up.** They arrive (landing page), sign up (LinkedIn URL / Google / email).
2. **Onboard (setup).**
   - Choose **self‑serve** (we prepare, you post) or **full‑service** (we do it all, including posting on your behalf via secure access).
   - Set **permissions** (what we may do).
   - Full‑service only: **set up secure access** (vault + 2FA guidance).
   - **Request the discovery and strategy calls** (offer times; the AM confirms).
   - **Choose a plan and sign** the contract (paying now optional; free trial starts).
   - Set **how you review** (frequency; ask‑first vs go‑ahead for posts; what happens if you don't reply).
3. **Discovery call.** Meet the AM. We learn goals, audience, what they want to be known for, and off‑limits.
4. **Wait while we prepare.** The AM audits their profile, researches their field, and drafts the strategy. (Client sees "strategy not ready yet".)
5. **Strategy call + approve the strategy.** The AM presents the strategy; the client **approves** it or **asks for a change**. Once approved, it runs for the contract period.
6. **Steady state — the weekly rhythm.**
   - Posts are prepared and **shared for the client to review** (approve / ask for changes), per their review settings.
   - **Self‑serve:** the client **publishes** approved posts themselves (copy caption → open LinkedIn → mark as posted).
   - **Full‑service:** the AM publishes on their behalf through the vault; the client is told.
   - The client does their **engagement quick tasks** (comments, connections) themselves or hands them to an **assistant** — unless full‑service, where the AM does engagement.
   - The client adds **Moments** and responds to **video requests**; raises **fix / repost / take‑down** on live posts; reads **weekly updates** and the **scorecard**.
   - **Check‑in calls** any time; **messages** any time.
7. **Manage the relationship.** Change review settings, pause posting, raise a complaint, request a different manager, add an extra service, extend or pull out of the contract.

---

## Part C — The complete account‑manager journey (operating loop)

1. **Join.** Invited by the owner → set password + 2‑step → profile → **sign the AM agreement** → book onboarding training → marked trained → assigned clients.
2. **Take on a client.** Assigned by the owner. Run the **onboarding pipeline**: prep for the discovery call → hold it → research + profile audit → draft strategy → hold the strategy call → get it approved.
3. **Run the account (the daily loop).** Work the **Home feed** (Urgent, Tasks, Due, Calls today, Waiting):
   - **Create content** to the strategy and framework; run checks; **share for approval**; publish (full‑service) or leave the client to publish (self‑serve).
   - **Engagement** (full‑service) or guide the client's quick tasks.
   - **Answer client requests:** fix a post, repost, take‑down, questions in messages.
   - **Calls:** confirm/hold discovery, strategy and check‑in calls; record outcomes; feed insights to strategy.
   - **Send the weekly update** and keep the scorecard moving.
   - **Request videos / assets** from the client when needed.
4. **Be accountable.** On‑time %, first‑time approval, response time, complaints, access strikes are all tracked; the owner can step in or suspend.

---

## Part D — How the two flows interweave (the communication map)

Every row is a **touchpoint**: who starts it, what the other side sees, and what carries the message. There are **three communication channels** between client and AM, and most touchpoints use the first two:

- **Structured handoffs** — a specific action that changes a work item's state and notifies the other side (approve a post, confirm a call, request a video…). This is the backbone.
- **Notifications** — every structured handoff pings the other party (in‑app, and email where set).
- **Free chat (Messages)** — open conversation for anything not structured.

| # | Touchpoint | Who starts it | What the other side sees / does | Carried by |
| --- | --- | --- | --- | --- |
| 1 | **Discovery/strategy call booking** | Client offers times | AM confirms a time + Meet link, or suggests others | Call request → notification |
| 2 | **Strategy approval** | AM shares the strategy | Client approves or asks a change | Strategy state (`shared → approved / change-asked`) → notification |
| 3 | **Post review** | AM shares a draft | Client approves / asks changes (per review settings) | Post state (`awaiting-client → approved / changes-requested`) → notification |
| 4 | **Publishing** | Self‑serve: client. Full‑service: AM | The other is told it went live | `approved → published` (`markPosted`) → notification |
| 5 | **Fix / repost / take‑down on a live post** | Client | AM gets a task to fix/repost/take down | Post `request` → manager task → notification |
| 6 | **Engagement** | Client (quick tasks) or AM (full‑service) | The counterpart sees it done / progress | Quick task / `doEngagementForClient` |
| 7 | **Moments** | Client adds a Moment | AM turns it into content | Moment → manager feed |
| 8 | **Video / asset request** | AM requests | Client submits the clip | Video request ↔ submit → notification |
| 9 | **Weekly update** | AM sends | Client reads it on Progress | Update → notification |
| 10 | **Check‑in calls** | Either side | The other accepts a time or suggests others | Call negotiation → notification |
| 11 | **Messages** | Either side | Chat, reactions, voice | Thread |
| 12 | **Full‑service access** | AM asks to log in → client approves the session | Session active / paused / revoked; access log | Session handshake → urgent notification |
| 13 | **Review settings / pause** | Client | Changes what the AM may do without asking | Permissions / review settings |
| 14 | **Escalation** | Client raises a complaint / requests a new manager | **Owner** handles it (not the AM) | Complaint / change request → owner |

**The governing rule today:** the client's **review settings** decide how much the AM may do without asking — but only for **posts** (`ask` vs `go`, and `ifNoReply: wait vs go`). Engagement is the client's own quick task (or the AM's job in full‑service). Everything else is an explicit, per‑item handoff.

---

## Part E — Gaps and assumptions (the part to decide on)

These are the places where the product **implies** a behaviour but does not yet make it a clear, built mechanism — the "many assumptions" worth resolving before we build more.

1. **What triggers the AM to create the week's content?** The strategy sets topics and weekly targets, and the scorecard tracks them — but there is **no explicit "here's this week's plan → prepare these N posts"** step. Today it's assumed the AM just knows. *Decision needed: is there a weekly content plan the client sees and the AM works from?*
2. **The strategy → content link is implicit.** Approving the strategy doesn't visibly generate anything. *Decision: should the agreed strategy produce a visible, recurring weekly schedule both sides see?*
3. **"Ask vs go" only covers posts.** For engagement, connections, profile/Page changes, and off‑platform service work, the boundary of what the AM may do without asking is unstated. *Decision: define the full permission matrix, not just posts.*
4. **Chat vs structured action overlap.** A client can ask for a change in **Messages** (free text) or via the **structured "ask for changes"** on the post. Two doors to the same room creates ambiguity and dropped requests. *Decision: when is chat the right channel, and should chat be able to spawn a structured task?*
5. **No client responsiveness model beyond posts.** `ifNoReply` handles held posts. But if a client never approves the **strategy**, never **accepts a call time**, or never **submits a requested video**, there's no nudge/timeout/what‑happens‑next. *Decision: define reminders and fallbacks for each waiting state.*
6. **No single "needs me" queue per side.** The client leans on Home cards; the AM leans on the Home feed; both lean on notifications. There is no one place that says "these 4 things are waiting on you." *Decision: is an explicit action inbox needed for each role?*
7. **Escalation short of a complaint.** Repeated change‑requests, a stalled client, or a dissatisfied‑but‑not‑complaining client have no path. Only a formal complaint reaches the owner. *Decision: soft‑escalation / health signals?*
8. **Self‑serve vs full‑service divergence isn't mapped end‑to‑end.** Publishing and engagement clearly differ; but across *every* touchpoint (who acts, who's notified, what the client sees) the branch isn't written down in one place. *Decision: a single branched map.*
9. **Discovery‑call note & framework guidance (already flagged).** The discovery/strategy call "note" is framework‑driven and fixed; it should be an **open input** the AM fills, with the platform **guiding** (suggested questions) rather than dictating. *You said you'll detail this next.*
10. **Who owns the posting schedule/calendar?** Recommended times exist and self‑serve clients publish themselves, but the **weekly cadence and calendar** (when things go out, who moves them) is loosely defined. *Decision: an explicit content calendar?*
11. **Strategy lifecycle over the contract.** The strategy "runs for the contract period" and the scorecard "adapts" it — but the trigger to **revisit / re‑present** a strategy (monthly? on drift? on a check‑in) isn't defined. *Decision: strategy refresh cadence.*
12. **Measuring the relationship, not just the work.** We track AM delivery metrics, but not the **client‑side health** of the relationship (engagement with reviews, satisfaction, momentum). *Decision: do we need a relationship health view?*

---

## Part F — Open questions for you

To turn the above into a clear build plan, the key decisions are:

- **A. The weekly operating rhythm:** does an agreed strategy produce a visible **weekly plan / content calendar** that both the client and AM work from? (This resolves gaps 1, 2, 10, 11.)
- **B. The permission & "ask vs go" matrix:** the full list of what the AM may do without asking, by work type and by tier. (Gap 3, 8.)
- **C. Communication model:** the clear split between **structured handoffs** and **free chat**, and whether chat can raise a structured task. (Gap 4.)
- **D. Waiting & nudges:** reminders/timeouts/fallbacks for every state that waits on the client (and on the AM). (Gap 5, 6.)
- **E. Escalation & health:** soft escalation before a formal complaint, and whether we show relationship health. (Gap 7, 12.)
- **F. Discovery note + framework guidance:** open input with platform‑suggested questions. (Gap 9 — your next piece.)

Tell me which of these you want to lock first, and I'll turn it into a scoped flow we build the same way we've been working.

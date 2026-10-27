# Bluecut Socials PRD v2: LinkedIn Account Management Platform

Oct 27 2026 · Owner: Fola · Replaces v1 (Oct 17 2026, kept in `docs/archive/prd-v1.md`)

This version folds in every decision from the flow reviews. Screen-by-screen detail lives in `docs/flow-map.md` (flow IDs such as C4 or M3 are referenced throughout). Build order lives in `docs/implementation-plan.md`.

---

## 1. Overview

Bluecut Socials is a LinkedIn account management service for busy senior professionals, run on its own platform. A dedicated account manager (the expert) runs each client's LinkedIn presence to the founder's proven personal brand framework. An in-house AI does the research and proposes the work; people decide; the client approves.

**Problem for the founder.** Running a client by hand takes 2 to 3 weeks of onboarding and constant manual work, so only a few clients are possible. Other strategists cannot reproduce the framework.

**Problem for the client.** Senior professionals will pay for LinkedIn positioning, but they worry about account security, privacy and their reputation. They want results tied to their goals, not generic posts or vanity numbers, and they want to stay in control.

**Solution.** The platform encodes the framework so trained account managers, backed by in-house AI research and drafting, deliver to the founder's standard across 5 to 10 clients each. Clients connect LinkedIn through LinkedIn's own sign-in, choose what Bluecut may do, approve what goes out, and can pause, take down or pull out at any time.

**What we sell.** A dedicated expert who runs your LinkedIn, a strategy built around your goal, and full control. AI is an in-house tool and is never part of what clients or visitors see.

## 2. Goals, non-goals and success metrics

**Goals**

- One account manager runs 5 to 10 clients to the founder's standard.
- Onboarding (goals call to approved strategy) in about 1 week, inside the free 2 weeks.
- The framework is the system: quality does not depend on who the manager is.
- Clients are always in control and always see content before it goes live.
- Success is measured against each client's own goal, with measurable weekly targets.

**Non-goals for v1**

- Platforms other than LinkedIn.
- Publishing with no client involvement (the client either approves or has chosen "Go ahead if I have not replied").
- Monthly subscriptions. Contracts are 3, 6 or 12 months.
- Results-based pricing.
- A self-serve tool without an account manager.
- In-app manager training modules (training is a call, see US-13.2).

**Metrics** (targets set after the pilot)

| Metric | What it shows |
| --- | --- |
| Active clients per manager | Scale (target 5 to 10) |
| Days from signing to first approved post | Onboarding speed |
| Share of posts approved first time | Draft quality and voice fit |
| Median client review time | Friction in the review loop |
| Weekly targets done vs planned | Delivery |
| Clients meeting their goal at contract end | Real results |
| Free 2 weeks to paid | Whether the free period proves value |
| Cancellations by reason, refund and complaint rate | Trust and service quality |

## 3. Roles

| Role | Who | Core jobs | Access |
| --- | --- | --- | --- |
| Owner (admin) | The founder who owns the framework | Assign managers, maintain the framework, oversee every account, step in for managers, money, complaints, settings | Everything, but never beyond a client's own permissions |
| Account manager | A trained operator, not necessarily a strategist | Run assigned clients: direct the AI, prepare content and engagement, send for review, schedule, report | Assigned clients only, only the actions each client allows |
| Client | Senior professionals: C-suite, founders, business owners, heads of department, technical leaders. Worldwide | Set up, approve the strategy, review content, do quick tasks, pay, see progress | Own account only |
| AI (in-house) | The platform's built-in assistant | Research, listening, proposals (topics, drafts, engagement, visual ideas, strategy updates), summaries, checks | Reads client data needed for the task; writes proposals only. Never publishes, never client-facing |

**Client personas:** starting out, inconsistent, lost traction, regulated (health, law). All are busy, can pay, and their livelihood depends on visibility. Many have an executive assistant.

## 4. Product principles

1. **Simple first.** Few steps, few fields, one primary action per screen.
2. **Client and manager use a web app, not a dashboard.** LinkedIn-style: a slim top bar, one column of cards, profile-style pages. Only the owner gets a dashboard.
3. **Mobile first for everyone.** Clients and managers can do everything on a phone.
4. **Seamless navigation.** Slim top bar on desktop, compact floating bottom bar on mobile, small icons with short labels. Breadcrumbs inside every flow with sub-pages. Never hunt for the way back.
5. **AI is in-house.** Never named to clients or on the marketing site. The notetaker is "a notetaker".
6. **Human in the loop, in order:** AI proposes → manager reviews and directs → client approves (per their review setting) → it goes live.
7. **The client always sees it first.** Every post is shared before it goes live.
8. **Time waiting on the client is on the client.** The contract keeps running; held work is reported, not blamed on the manager.
9. **Off limits are absolute.** Content and engagement never touch what the client has ruled out.
10. **Records stay true.** Every action is logged against the person who really did it, internally.
11. **No word "trial".** It is always "your first 2 weeks are free".

## 5. Scope, assumptions and conventions

**LinkedIn.** All actions go through LinkedIn's official API after the client authorises Bluecut on LinkedIn's own consent screen. Posting, commenting, liking and deleting the client's own posts are covered by the member permission (`w_member_social`). Company Page posting uses the Community Management API, applied for before launch. Actions the API does not allow (connection requests, profile edits, reading the feed, searching people) become client quick tasks (US-6.5) or manager research. Bluecut never stores passwords or session cookies and never drives the client's browser.

**Payments.** Stripe only, on the US entity. US dollar base prices; clients see their local currency through Stripe's local pricing. Fixed NGN prices for Nigeria; Naira cards if Stripe's Naira card feature is available, standard card flow if not.

**Assumptions**

- Contracts run 3, 6 or 12 months, paid up front, signed before the free 2 weeks start.
- The first 2 weeks are free and full service. Paying at signing is optional.
- Unpaid at the end of the free 2 weeks, or a contract ended without renewal: the account pauses.
- Clients can pull out any time; months not yet started are refunded.
- Clients keep the same manager for the life of the account.

**Story format.** As a [role], I want [capability], so that [benefit]. **P0** is required for launch, **P1** soon after, **P2** later. **(changed)** and **(new)** mark differences from v1.

---

## Epic 1. Accounts and access

**US-1.1 (P0, changed)** As a visitor, I want to create an account with Google or with my email, so that I can get started in under a minute. (P2)
- Google, or first name, last name, email and password (min 12 characters).
- Email sign-ups confirm with a 6-digit code.
- Not asked: country, location, time zone. Time zone comes from the browser; country from LinkedIn on connect (asked only if missing).
- Duplicate email: inline message with a link to sign in.

**US-1.2 (P0)** As a manager, I want to join only through an owner invitation, so that unvetted people cannot reach client accounts. (P4)
- Single-use link, expires after 7 days. No public sign-up for staff.
- Setup includes photo, short intro and open call slots.

**US-1.3 (P0)** As any user, I want two-step sign-in, so that my account is safe if my password leaks. (P3)
- Required for owner and managers; offered to clients. Authenticator app and backup codes.

**US-1.4 (P0)** As any user, I want to reset a forgotten password. (P3)
- Link expires after 1 hour; all other sessions end.

**US-1.5 (P0)** As the owner, I want role-based access on every page and request, so that each user sees only what their role allows.
- Managers see only assigned clients. Links outside a role show a "no access" page.

**US-1.6 (P1)** As any user, I want to see my active sessions and sign out everywhere. Staff sessions time out after a period the owner sets.

**US-1.7 (P1)** As any user, I want to manage my profile, time zone and notification choices. (C14)

**US-1.8 (P1, changed)** As a client, I want to download my data and delete my account. (C14)
- Deleting during a contract first runs the cancel flow (US-11.3), then deletes.

## Epic 2. Contract, free 2 weeks, payment and pause

**US-2.1 (P0, changed)** As a visitor, I want to understand the service, the contract terms and prices on the landing page, so that I can decide to get started. (P1)
- Sections: benefit-led hero, how it works, why Bluecut, you stay in control, testimonials (client videos and LinkedIn profile images, real only), contract terms (3, 6, 12 months, first 2 weeks free, pull out any time), Get started.
- Prices from one pricing source; dummy USD prices until set; local currency via Stripe later.

**US-2.2 (P0, changed)** As a client, I want to choose a 3, 6 or 12-month contract and sign it during setup, so that my free 2 weeks can start. (C4)
- Terms shown: plan, price, contract start and end dates, what is included, first 2 weeks free, pull out any time with unused months refunded, account pauses if unpaid at the end of the free 2 weeks.
- Signed with a typed name; signature recorded with name, timestamp and terms version.
- The free 2 weeks start on the signing date.

**US-2.3 (P0, new)** As a client, I want to pay now or skip and pay later, so that I can try the full service first. (C4)
- "Pay now" and "Skip for now" carry equal weight.
- Reminders by email and in-app 5 days and 3 days before the free 2 weeks end, and on the last day, each linking to payment.

**US-2.4 (P0, changed)** As a client, I want my account to pause, not break, if I have not paid or my contract has ended, so that I can pick up where I left off. (C16)
- Pause stops all scheduled posts and engagement; drafts and settings are kept.
- Client is told why, by email and in-app; Home shows a Pay now (or Renew) card.
- Payment reactivates the account automatically. Future-dated posts return to Scheduled; past-dated posts return to the manager to reschedule.
- Paused time is the client's responsibility and is not a missed delivery.
- The client keeps the same manager while paused and after renewing.

**US-2.5 (P0, new)** As the owner, I want long-paused accounts removed, so that the platform holds no dormant client data.
- Regular reminders while paused; at 15 days a clear notice that removal happens at 30 days.
- At 30 days: account removed and all client data deleted, after a last chance to download. Only invoices and payment records are kept, as the law requires.
- Coming back means signing up and onboarding again.

**US-2.6 (P1)** As the owner, I want one free 2 weeks per person, so that it is not abused.
- One per LinkedIn profile and per email; repeats are blocked with a message to contact us.

**US-2.7 (P0)** As the owner, I want to see and manage every contract. (A5)
- Status filters: Free 2 weeks, Active, Ending soon, Paused, Completed, Cancelled. Extend or credit with a required note.

**US-2.8 (P1)** As a client, I want a reminder before my contract ends, so that I can renew on my terms. 14 and 3 days before the end.

## Epic 3. Setup and onboarding calls

**US-3.1 (P0, changed)** As a client, I want Home to show my setup progress, so that I know what is next and can continue now or later. (C1)
- Steps: connect LinkedIn, choose what we do, book goals call, book strategy call, choose plan and sign, set how you review. Percentage and one Continue button.
- Email and in-app reminders while setup is unfinished.

**US-3.2 (P0, changed)** As a client, I want to book both calls at times that suit me, knowing why each matters and who I will meet. (C3)
- One screen explains both 30-minute calls (goals; strategy and content plan) and introduces the manager (name, photo, intro).
- Times come from the manager's open slots, in the client's time zone. Strategy call only at least 3 days after the goals call.
- Google Meet by default (Zoom and Teams supported). Calendar invite and reminders the day before and 1 hour before.
- Once booked, the manager must attend or reschedule from their side; the client then picks a new time.

**US-3.3 (P0, changed)** As a client, I want to be asked before a call is recorded, so that I decide. (C3)
- Consent asked before booking; saying no is fine.
- Recorded calls: a notetaker joins and returns a transcript.
- Unrecorded calls: the manager writes up the notes and adds them to the client record.

**US-3.4 (P0)** As a manager, I want the goals call turned into a structured summary, so that it becomes context without manual work. (M3)
- Summary of goals, audience, tone and off limits. The manager corrects and confirms.

**US-3.5 (P0)** As a manager, I want a prep sheet and follow-up questions before each call. (M3)

**US-3.6 (P0, changed)** As a client, I want to approve "What we agreed" after the strategy call, so that work starts only on a strategy I agree with. (C6)
- The manager updates the strategy with any changes from the call first, then sends it.
- Client can Approve or Ask for a change; each change makes a new version. Approved versions are locked.
- Approval creates the content plan and weekly targets.

**US-3.7 (P0, changed)** As a client, I want to set how I review during setup, so that I stay in control without micromanaging. (C5)
- How often: once a week (default), twice a week, every post.
- Where to tell me: email (default), in the app, or both.
- What needs my approval: "Ask me first" or "Go ahead without asking" per action type. Defaults: posts ask first; routine likes and comments go ahead. Profile changes and sensitive topics always ask first.
- If I do not reply by the due time: "Wait for me" (default; held, reported as waiting on me) or "Go ahead if I have not replied within 24 hours" (fixed).
- Changes apply to new items only.

## Epic 4. Research, framework and strategy

**US-4.1 (P0)** As the owner, I want my framework encoded in the platform, so that every account follows my method. (A4)
- Library: strategy templates, positioning formulas, topic (pillar) models, post formats, tone rules, banned phrases, quality checks, industry rules with restricted claims and disclaimers.
- A maintained "What works on LinkedIn" knowledge base.
- Versioned; each strategy records its framework version.

**US-4.2 (P0)** As a manager, I want AI research on my client's field, with sources, so that I understand an industry I am not expert in. (M3)
- Overview, glossary, trends, notable voices, communities and hashtags, common audience questions. Unsourced claims labelled.

**US-4.3 (P0)** As a manager, I want an audit of the client's current LinkedIn profile. (M3)
- Each part rated strong, needs work or missing, with a recommendation. The existing network and posts are never changed.

**US-4.4 (P2)** Benchmark of comparable profiles.

**US-4.5 (P0, changed)** As a manager, I want the AI to draft a detailed, measurable strategy that I direct until it is right. (M3)
- Positioning, audience, 3 to 5 topics, tone, off limits, and measurable weekly targets by period (posts by format, comments, connection requests, articles).
- Each goal maps to 1 to 3 metrics with a plain reason; vanity metrics shown as secondary.
- The manager directs with instructions and edits any section.

**US-4.6 (P1)** As a manager, I want to revise the strategy when goals change or results stall. A revision is a new version and needs client approval; the plan changes only from approval forward.

## Epic 5. Content planning and creation

**US-5.1 (P0)** As a manager, I want a content plan for the contract from the approved strategy, so that every week is planned against the targets. (M4)
- Each slot: date, time, topic, format, goal served. Topics balanced per the strategy.

**US-5.2 (P0)** As any role, I want week and list views of the plan. Staff can drag to move.

**US-5.3 (P0, changed)** As a manager, I want topic ideas with reasons, so that content follows the goal and what is happening in the field. (M4)
- Reasons: goal served, a field signal, a client Moment, or a past preference. Nothing touching off limits is proposed.

**US-5.4 (P0)** As a manager, I want drafts in the client's voice that I direct and edit. (M4)
- Formats: text, image, carousel, video, article, newsletter. Versions, compare, character counts against LinkedIn limits.

**US-5.5 (P0, changed)** As a manager, I want visual suggestions and the client's brand and templates to hand, so that I can create the right visual. (M4)
- The AI suggests the kind of visual and why (client photo or event photo, text on a brand background, carousel or quote template, an existing video doing well online, or none).
- The manager creates, sources or uploads the media and attaches it.
- Per-client template library. Optional simple text-graphic maker, never applied by default.

**US-5.6 (P0, changed)** As a manager, I want automatic checks before sending, so that weak or risky content is caught. (M4)
- Flags: off limits, restricted claims, banned phrases, generic writing, off-topic, near-duplicates (with a link to the earlier post), broken links, missing image descriptions.
- Fix or dismiss with a reason. Off-limits flags can only be fixed.

**US-5.7 (P0, changed)** As a manager, I want to send content on the client's chosen rhythm (weekly, twice weekly or per post), so that review fits their life.

**US-5.8 (P1)** As any role, I want a searchable library of past content.

## Epic 6. Engagement and client quick tasks

**US-6.1 (P0)** As a manager, I want a weekly search brief from the goal, framework and field signals, so that I know exactly who and what to look for. (M6)
- The manager searches on their own LinkedIn and the web; the platform never scrapes LinkedIn.

**US-6.2 (P0)** As a manager, I want to add the people and posts I find and have them rated for fit, so that only strong targets reach the client. (M6)
- Fit reasons shown; off-limits people, companies and topics warned. Drafted comments and connection notes in the client's voice.

**US-6.3 (P0)** As a manager, I want engagement to go out the right way for each action. (M6)
- Likes and comments through the API, following the client's review setting.
- Totals stay within the strategy's targets and LinkedIn limits.

**US-6.4 (P0)** As any role, I want engagement tracked against weekly targets.

**US-6.5 (P0, new)** As a client, I want the things only I can do prepared as quick tasks, so that each takes 1 to 3 minutes. (C17)
- Connection requests: person, profile link, why they matter, ready note; Open profile, Copy note, Mark as sent.
- Profile updates: text ready to copy, where to paste it, Mark as done.
- Brought up when the strategy needs them; sent by the manager.
- "Send to my assistant" emails the list and notes; no account needed.
- Progress shown (9 of 15 sent). Unfinished tasks count as waiting on the client.

**US-6.6 (P2)** Opportunities (events, podcasts, awards) and communities to join.

## Epic 7. Review and approval

**US-7.1 (P0)** As a manager, I want to send content for review with a due time. Client is notified per their setting.

**US-7.2 (P0)** As a client, I want to approve or ask for changes on each post, or approve all, seeing each as it will look on LinkedIn on mobile and desktop. (C7)
- Each post can carry the manager's short "why this post" note.
- Approve all asks for one confirmation.

**US-7.3 (P0)** As a client, I want to give feedback by typing or voice note. (C7)
- Voice notes transcribed, transcript editable. Feedback becomes a change list for the manager. Preferences are remembered for future posts.

**US-7.4 (P0)** As a manager, I want to apply feedback with AI help and resend; the client sees before and after. (M5)

**US-7.5 (P0, changed)** As a client, I want my review settings applied automatically. (C5, C7)
- "Go ahead without asking" types skip review but appear in activity and the weekly update.
- No reply under "Wait for me": held, reported as waiting on the client.
- No reply under "Go ahead": approved automatically after 24 hours.

**US-7.6 (P0)** As any role, I want reminders before review deadlines (24 hours before and at the deadline).

**US-7.7 (P0)** As any role, I want a full approval history per item.

## Epic 8. LinkedIn access and control

**US-8.1 (P0)** As a client, I want to connect LinkedIn without sharing my password, and optionally my company Page. (C2)
- Tokens encrypted, never shown to anyone.

**US-8.2 (P0, changed)** As a client, I want plain switches for what Bluecut does for me. (C2, C11)

| Switch | Default | Notes |
| --- | --- | --- |
| Post for me | On | API |
| Like and comment for me | On | API |
| Post to my company Page | Off | Connect the Page; Community Management API |
| Draft connection requests for me to send | Off | Quick tasks |
| Draft profile updates for me to apply | Off | Quick tasks; always asks first |
| Account and privacy settings | Never | Not available to anyone |

**US-8.3 (P0)** As a manager, I want to act only through the platform's API connection. Every action logged.

**US-8.4 (P0)** As a client, I want to pause all posting or disconnect at any time. (C11)
- Immediate. Affected scheduled items go On hold; manager notified.

**US-8.5 (P0)** As a client, I want an activity log of every action on my account. (C11)
- Filter by date and type. Staff actions shown as "Your account team" or the manager's name. CSV export.

**US-8.6 (P1)** As a manager, I want to request a one-off permission. Client approves or declines; expires after use or 7 days.

**US-8.7 (P0)** As a client, I want to know if my connection breaks, with a Reconnect button. Publishing pauses meanwhile.

## Epic 9. Publishing and live posts

**US-9.1 (P0)** As a manager, I want to schedule approved content at the best time. (M5)
- Platform suggests a time; manager confirms. Client and manager time zones shown. Personal profile or company Page.
- Schedule disabled for anything not approved.

**US-9.2 (P0)** As a manager, I want to reschedule or cancel. Rescheduling keeps approval; editing content needs review again.

**US-9.3 (P0)** As a manager, I want failed posts retried 3 times, then marked Failed with the reason and flagged to me.

**US-9.4 (P0)** As a client, I want confirmation when a post goes live, with a link.

**US-9.5 (P0, new)** As a client, I want to take a live post down at once, or ask for a fix. (C8)
- "Take it down now": removed from LinkedIn after one confirmation; logged.
- "Ask for a fix": urgent note or voice note to the manager.

## Epic 10. Progress and updates

**US-10.1 (P0, changed)** As a client, I want to see progress toward my goal in plain words first, numbers second. (C9)

**US-10.2 (P0)** As a manager, I want weekly updates drafted for me to add a note and send; monthly updates compare with last month. (M8)
- Contents: targets vs done, best posts, goal progress, anything held back and why, what is happening in your field, next week's focus.

**US-10.3 (P0)** As a client, I want to see this week's targets vs what was done.

**US-10.4 (P1)** As a client or manager, I want to log real outcomes (leads, invitations, offers).

**US-10.5 (P1)** As any role, I want updates as PDF.

**US-10.6 (P0)** As the owner, I want an overview of all clients with at-risk flags. (A1, A2)

## Epic 11. Cancellation and refunds

**US-11.1 (P0)** As a client, I want to pay by card in the app; payment activates or reactivates the contract and shows a receipt.

**US-11.2 (P0)** As a client, I want invoices and receipts in my account. (C13)

**US-11.3 (P0, changed)** As a client, I want to pull out any time in 3 short steps. (C13)
1. Why are you leaving? Required, with plain choices and an optional note.
2. Can we fix this? One matching offer (talk to the owner, change my manager, pause posting) and an equally clear "No, continue to cancel".
3. Here is what happens: end date, what stops, refund. Confirm.

**US-11.4 (P0)** As a client, I want unused months refunded.
- During the free 2 weeks: everything stops, full refund if paid.
- After the contract starts: service runs to the end of the current month; every month not yet started is refunded.

**US-11.5 (P0, changed)** As the owner, I want small refunds automatic and large ones approved by me. (A5)
- Threshold set in Settings. Approved refunds pay automatically; client notified.

**US-11.6 (P0)** As the owner, I want every cancellation reason collected and shown by reason over time, and to be told at once. (A1, A5)

**US-11.7 (P1)** As a client, I want failed payments handled clearly: retry, update card; account pauses after the grace period.

## Epic 12. Accountability and complaints

**US-12.1 (P0)** Every task has an owner, a due time and a "waiting on" status (client or manager), switching automatically.

**US-12.2 (P0)** Delays are attributed automatically: held for client review, unfinished quick tasks and paused time are on the client; approved work not done on time is on the manager.

**US-12.3 (P0)** As a client, I want to raise a complaint from any post or from Control. (C12)

**US-12.4 (P0)** As the owner, I want a complaint page with the full timeline and outcome options (no action, credit, partial refund, manager warning, change of manager). (A6)

**US-12.5 (P0)** Managers who miss a due time are asked for a reason; repeated misses go to the owner.

**US-12.6 (P0, changed)** As a client, I want to ask for a different manager. Managers change only on client request, after a complaint, or for a no-show. A handover summary goes to the new manager; the client is told. (C13, A3)

**US-12.7 (P1)** Service targets set by the owner.

## Epic 13. Owner and manager operations

**US-13.1 (P0)** As the owner, I want to invite managers. (A3)

**US-13.2 (P0, changed)** As the owner, I want each new manager trained on a 60-minute onboarding video call (off the platform) before they get clients. (A3)
- Status Waiting for training until the owner marks Training done.

**US-13.3 (P0, changed)** As the owner, I want the platform to suggest a manager for each new client, which I confirm or override. (A2)
- Reasons shown: free capacity, industry experience, time zone. Managers at 10 clients cannot be chosen.

**US-13.4 (P0, changed)** As a manager, I want one task list across clients as a feed or a board. (M1)
- Board columns: To do, Doing, Waiting on client, Done. Manager drags between To do and Doing; other moves are automatic.

**US-13.5 (P1)** As the owner, I want performance per manager.

**US-13.6 (P0)** As the owner, I want to suspend a manager instantly; their clients are listed for reassignment.

**US-13.7 (P0)** As the owner, I want to manage plans, prices, free period, reminders, pause and removal periods, the 24-hour wait, max clients, days between calls, refund threshold, service targets and session timeout. New contracts only. (A7)

**US-13.8 (P0)** As the owner, I want an audit log of every admin and system action. (A8)

**US-13.9 (P1)** As the owner, I want manager payouts from active client counts, within a minimum and maximum, for me to approve.

**US-13.10 (P0, new)** As the owner, I want to step in for a manager without the client noticing a change. (A2)
- "Step in for [manager]" on one client or all their clients. Same workspace and limits; banner shown.
- Client sees "Your account team" in activity and messages.
- Internal audit log, complaints and manager stats record the owner as the actor.
- "Stop covering" hands back, or reassign.

**US-13.11 (P0, new)** As a manager, I want to set my open call slots and keep them current. (M10, P4)

**US-13.12 (P0, new)** As the owner, I want to be assignable to clients and run them from the manager view.

## Epic 14. Notifications and messages

**US-14.1 (P0)** In-app and email notifications for events that need each role.

**US-14.2 (P1)** Choose which notifications come by email. Security, billing, review deadlines and pause notices cannot be turned off.

**US-14.3 (P0)** As a client, I want one message thread with my manager: text, files, voice notes. Files can be saved to Your brand. The owner can see every thread.

**US-14.4 (P0)** Clear feedback for every action: success messages, inline errors, warnings before destructive actions (take down, disconnect, pause, cancel, delete).

**US-14.5 (P2)** Daily or weekly digest.

**Event catalogue**

| Event | Client | Manager | Owner |
| --- | --- | --- | --- |
| Setup unfinished | Yes | | |
| Call booked, rescheduled, reminder | Yes | Yes | |
| Content ready for review | Yes | | |
| Review due in 24 hours, missed | Yes | Yes | |
| Client approved, asked for changes | | Yes | |
| Quick tasks ready | Yes | | |
| New Moment added | | Yes | |
| Post published | Yes | Yes | |
| Post failed | | Yes | Yes |
| Post taken down, fix requested | | Yes | Yes |
| Permission changed, posting paused, disconnected | Yes | Yes | Yes |
| LinkedIn connection expired | Yes | Yes | |
| Manager missed a deadline | | Yes | Yes |
| Complaint raised or updated | Yes | Yes | Yes |
| Payment reminder (5, 3, 0 days), paid, failed | Yes | | Yes |
| Account paused, 15-day warning, removed | Yes | Yes | Yes |
| Cancellation requested (with reason) | Yes | Yes | Yes |
| Refund awaiting approval, paid | Yes | | Yes |
| Client assigned or manager changed | Yes | Yes | Yes |
| New manager waiting for training | | | Yes |
| Weekly update sent | Yes | | |

## Epic 15. Niche listening (in-house)

**US-15.1 (P0, new)** As a manager, I want each client's field watched continuously, so that proposals reflect what is happening now. (M7)
- Sources: Google Alerts the manager creates and adds per client (feed links), the manager's own findings ("Add what I found"), web and news search including location, the client's own LinkedIn results, the "What works on LinkedIn" knowledge base, and the client's review preferences.
- Stored per client and used for every proposal (retrieval from a per-client knowledge base).
- Signals always show their source. Nothing is posted because of a signal without the full review path.
- Never client-facing; clients see the results as the manager's insight.

## Epic 16. Your brand and off limits

**US-16.1 (P0, new)** As a client, I want one place for my brand, so that content looks and sounds like me. (C15)
- Photos, logos and colours, your voice, brand documents, Moments (photos plus a note about something to post about; manager notified).
- JPG, PNG, PDF, DOCX, MP4; size limits shown inline.

**US-16.2 (P0, new)** As a client, I want to say what is off limits, so that nothing I would not do is done in my name. (C15)
- Topics, people, companies, employer or professional restrictions, kinds of interaction.
- Captured on the goals call, editable any time, checked against every proposal, post and engagement.

---

## Pages by role

| Area | Page | Flow |
| --- | --- | --- |
| Public | Landing | P1 |
| Public | Create account, sign in, reset, staff invite | P2 to P4 |
| Client | Home (setup progress, then feed) | C1, C17 |
| Client | Setup: connect, what we do, calls, plan and sign, how you review | C2 to C5 |
| Client | Strategy | C6 |
| Client | Content: to review, scheduled, live | C7, C8 |
| Client | Progress and updates | C9 |
| Client | Messages | C10 |
| Client | Control: what we do, how you review, pause, disconnect, activity, requests | C11 |
| Client | Complaint | C12 |
| Client | Contract and billing, cancel | C13 |
| Client | Account | C14 |
| Client | Your brand | C15 |
| Manager | Home: feed and board | M1 |
| Manager | Clients and client page | M2 |
| Manager | Onboard a client | M3 |
| Manager | Plan and draft content | M4, M5 |
| Manager | Engagement and quick tasks | M6 |
| Manager | Listening | M7 |
| Manager | Updates | M8 |
| Manager | Messages | M9 |
| Manager | Calls, availability, profile | M10 |
| Owner | Overview | A1 |
| Owner | Clients, assignment, step in | A2 |
| Owner | Managers, training, payouts | A3 |
| Owner | Framework | A4 |
| Owner | Money: contracts, payments, refunds, reasons | A5 |
| Owner | Complaints | A6 |
| Owner | Settings | A7 |
| Owner | Audit log | A8 |

## State models

**Content item**

| State | Moves to |
| --- | --- |
| AI draft | Manager review |
| Manager review | Awaiting client, or Approved for "Go ahead without asking" types |
| Awaiting client | Approved, Changes requested, Approved automatically (Go ahead, 24 hours), or held past due (Wait for me) |
| Changes requested | Manager review |
| Approved | Scheduled |
| Scheduled | Published, Failed (after 3 tries), On hold |
| On hold | Scheduled when restored; Manager review if the date passed |
| Published | Taken down |
| Failed | Manager review |
| Taken down | End |

Editing approved content sends it back to Awaiting client.

**Other objects**

| Object | States |
| --- | --- |
| Client account | Setting up, Free 2 weeks, Active, Paused (by client, unpaid, contract ended), Removed |
| Contract | Signed (free 2 weeks), Active, Ending soon, Paused, Completed, Cancelled |
| LinkedIn connection | Not connected, Connected, Paused, Expired, Disconnected |
| Call | Booked, Rescheduled, Done, Missed |
| Quick task | Ready, Partly done, Done, Not done |
| Permission request | Pending, Approved, Used or expired, Declined |
| Refund | Requested, Awaiting owner, Processing, Paid, Declined |
| Complaint | Open, Under review, Resolved, Closed |
| Account manager | Invited, Waiting for training, Active, Suspended, Removed |
| Task | To do, Doing, Waiting on client, Done, Missed |

## Non-functional requirements

**Security**
- LinkedIn tokens and client data encrypted at rest and in transit (TLS 1.2+); keys outside the app database.
- Role checks on the server for every request.
- Two-step sign-in for staff; rate limits and lockout on failed sign-ins.
- Immutable audit log, always recording the real actor (including owner step-in).

**Privacy**
- GDPR, NDPA and local law; consent recorded at sign-up and before recording calls.
- Client data never used to train external AI models; no-retention terms with AI providers where available.
- Paused 30 days: all client data deleted; only invoices and payment records kept.

**AI**
- In-house only; never named to clients.
- A person starts, directs and reviews every AI step. The AI never publishes.
- Sources shown for research and signals; uncertainty labelled.
- Industry rules and off limits block restricted content.

**Performance and reliability**
- Pages load in under 2 seconds; AI work shows progress.
- Scheduled posts publish within 5 minutes of their time.
- 99.5% uptime; daily backups.

**Accessibility and design**
- WCAG 2.1 AA, full keyboard use, text alternatives.
- Mobile first; everything usable on a phone for clients and managers.
- Bluecut Socials design system for every visual decision.

## Edge cases

| Situation | Behaviour |
| --- | --- |
| Client pauses or disconnects with posts scheduled | Posts go On hold; manager notified; nothing publishes |
| Client does not review in time, "Wait for me" | Held; waiting on client; shown in the weekly update; contract keeps running |
| Client does not review in time, "Go ahead" | Approved automatically after 24 hours |
| Unpaid at the end of the free 2 weeks | Account pauses; paying reactivates automatically |
| Contract ends without renewal | Account pauses; renewing reactivates with the same manager |
| Paused 15 days | Warning that removal happens at 30 days |
| Paused 30 days | Account and data removed; invoices kept |
| Client takes a live post down | Removed via API; logged; manager notified |
| Client edits approved content | Manager checks the edit, then it counts as approved |
| Manager edits approved content | Back to Awaiting client |
| LinkedIn token expires | Publishing pauses; both told; Reconnect shown |
| LinkedIn rejects a post | 3 retries, then Failed with reason; manager alerted |
| Content touches off limits | Flagged; cannot be dismissed, only fixed |
| Recording declined | Call goes ahead; manager writes notes |
| Manager reschedules a call | Client notified, picks a new slot |
| Manager does not do the work | Owner steps in; client sees no change; records stay true |
| Manager suspended mid-week | Drafts kept; clients listed for reassignment with suggestions |
| Client pulls out during the free 2 weeks | Everything stops; full refund if paid |
| Client pulls out mid-month | Service to end of month; unstarted months refunded |
| Voice note fails to transcribe | Audio kept; client asked to type |
| Two staff edit the same draft | Second sees a lock notice |
| File too large or wrong type | Inline message with allowed types and size |
| Time zone or daylight saving change | Scheduled times stay fixed in the client's local time |
| Same person tries a second free 2 weeks | Blocked with a message to contact us |

## Release phasing

| Phase | Scope | Moves on when |
| --- | --- | --- |
| 1. Pilot | All P0 stories | Pilot clients complete setup and publish approved content with no security incidents |
| 2. Scale | P1 stories | One manager runs 5+ clients to standard |
| 3. Expand | P2 and new platforms (X first), deeper analytics, team accounts | Phase 2 metrics hold for a full contract |

## Decisions log

| Decision | Outcome |
| --- | --- |
| LinkedIn access | Official API and client OAuth only; quick tasks for what the API cannot do |
| Payments | Stripe only, USD base, local currency via Stripe, fixed NGN, Naira card if available |
| Trial wording | Never "trial"; "first 2 weeks free" |
| Contract timing | Signed during setup before the free 2 weeks; payment optional until the end of the free 2 weeks |
| Unpaid or ended | Account pauses; payment reactivates automatically |
| Pause removal | Warning at 15 days, removal at 30; only invoices kept |
| Calls | Two 30-minute calls, booked in setup from the manager's slots, at least 3 days apart; recording needs consent |
| Review | Client chooses rhythm, channel, what needs approval, and "Wait for me" or "Go ahead after 24 hours" (fixed) |
| Validation | The client's approval is the validation step; no separate owner check |
| Managers | Same manager for life; change only on request, complaint or no-show; suggested by the platform, confirmed by the owner; max 10 clients; trained on a 60-minute call |
| Owner step-in | Through the manager's workspace; invisible to the client; recorded truthfully inside |
| Refunds | Automatic below a set amount; cancellation reason always collected |
| AI | In-house only, never sold or shown |
| Layout | Web app (LinkedIn-style) for clients and managers; dashboard for the owner only |
| Plan prices | Still to set; dummy USD prices in the build |

## Glossary

| Term | Meaning |
| --- | --- |
| Framework | The founder's method, encoded as templates, rules and checks |
| Topic (pillar) | One of 3 to 5 themes a client's content is built around |
| Weekly targets | Measurable numbers from the strategy: posts by format, comments, connection requests, articles |
| Off limits | What a client never wants done or said in their name |
| Moment | Something the client wants a post about, added with photos and a note |
| Quick task | A 1 to 3 minute action only the client can do on LinkedIn, prepared by Bluecut |
| Signal | Something happening in a client's field, with its source |
| Free 2 weeks | The full service, free, from the day the contract is signed |
| Paused | Nothing goes out; data kept until removal at 30 days |
| Step in | The owner working through a manager's workspace |
| Waiting on | Who must act next: client or manager |

# Bluecut Socials flow map

Every user flow, end to end, screen by screen. Built from `docs/prd.md` and Fola's design direction (review 1, Oct 27 2026).

**Status:** Draft v2 for review by Fola (design authority). Nothing is built until its flow is marked Approved.

## How to review

For each flow, reply **Approved**, **Change: ...**, or answer its questions. Status moves Draft → Approved → Built → Signed off.

---

## 0. Design direction

These rules apply to every flow below.

- **Simple first.** Few steps, few fields, one clear action per screen. Busy senior people use this. If a step can be removed or done for them, remove it.
- **Client and account manager: a normal web app, not a dashboard.** The model is LinkedIn: a top bar, one centred content column made of cards (a feed), profile-style pages, an optional side column on wide screens. No grids of charts, no dense tables, no sidebars full of menus.
- **Admin: dashboard.** The admin is the only role that gets a dashboard layout (side navigation, tables, metrics).
- **Mobile first for everyone.** Clients and account managers must be able to do everything on a phone. On mobile, the top bar becomes a bottom tab bar.
- **Nothing happens without the client.** The client approves content, sets what the manager may do, and can pause, take down or disconnect at any time. The product says so wherever it matters.

---

## 1. The end-to-end journey

| Stage | Client | Account manager | Admin |
| --- | --- | --- | --- |
| Discover | Lands on the marketing page, clicks Get started | | |
| Create account | Google, or email and password with first and last name | | |
| Set up (trial week 1) | Sees setup progress on Home. Connects LinkedIn and sets permissions. Picks a time for the goals call | Is assigned, fits the call into the client's chosen time | Assigns a manager |
| Goals call (30 min) | Joins the call. AI notetaker records | Runs the call, then AI research, audit and strategy draft | |
| Strategy call (30 min) | Reviews strategy and content plan, approves | Runs the call, finalises the plan | |
| Contract | Chooses 3, 6 or 12 months, signs, pays | | Sees the contract go active |
| Every week | Reviews posts, sees what went live, reads the weekly update | Drafts, checks, schedules, engages, writes the update | Watches accounts at risk |
| Something is wrong | Takes a post down, asks for a fix, pauses, complains | Fixes, answers queries | Resolves complaints and refunds |
| End | Cancels any time, unused months refunded | Unassigned | Approves the refund |

---

## 2. Flow inventory

| ID | Flow | Role | PRD stories | Status |
| --- | --- | --- | --- | --- |
| P1 | Marketing landing page | Visitor | 2.1 | Draft |
| P2 | Create account | Client | 1.1 | Draft |
| P3 | Sign in and reset password | All | 1.3, 1.4 | Draft |
| P4 | Accept staff invite | Manager | 1.2, 1.3 | Draft |
| C1 | Home and setup progress | Client | 3.9, 10.1 | Draft |
| C2 | Connect LinkedIn and set permissions | Client | 8.1, 8.2, 3.8 | Draft |
| C3 | Book the goals call | Client | 3.3, 3.4 | Draft |
| C4 | Strategy call and approval | Client | 3.7, 4.6, 4.7 | Draft |
| C5 | Choose a plan, sign and pay | Client | 2.2, 2.3, 11.1 | Draft |
| C6 | Review content | Client | 7.2, 7.3, 7.5 | Draft |
| C7 | Take down or fix a live post | Client | New | Draft |
| C8 | Progress and weekly updates | Client | 10.1 to 10.5 | Draft |
| C9 | Messages | Client | 14.3 | Draft |
| C10 | Control: permissions, pause, disconnect, activity | Client | 8.2, 8.4, 8.5, 8.6, 8.7, 9.3 | Draft |
| C11 | Raise a complaint | Client | 12.3 | Draft |
| C12 | Contract, billing and cancel | Client | 11.2 to 11.7 | Draft |
| C13 | Account: profile, security, delete | Client | 1.6 to 1.8, 14.2 | Draft |
| M1 | Home: what to do next | Manager | 13.4, 12.1, 12.5 | Draft |
| M2 | Client page | Manager | 3.8, 8.2 | Draft |
| M3 | Onboard a client | Manager | 3.4 to 3.7, 4.2 to 4.5 | Draft |
| M4 | Plan and draft a week | Manager | 5.1 to 5.7, 7.1 | Draft |
| M5 | Feedback, scheduling and live posts | Manager | 7.4, 9.1, 9.2, 9.4, 8.6 | Draft |
| M6 | Weekly engagement | Manager | 6.1 to 6.3, 6.6, 8.3 | Draft |
| M7 | Weekly update | Manager | 10.2 | Draft |
| A1 | Overview | Admin | 10.6 | Draft |
| A2 | Account managers | Admin | 13.1 to 13.3, 13.5, 13.6, 13.9 | Draft |
| A3 | Framework | Admin | 4.1 | Draft |
| A4 | Contracts and refunds | Admin | 2.7, 11.5 | Draft |
| A5 | Complaints | Admin | 12.2, 12.4, 12.6 | Draft |
| A6 | Settings and audit log | Admin | 12.7, 13.7, 13.8 | Draft |

**Later (not in the first build):** manager training (13.2), opportunities (6.4, 6.5), benchmarks (4.4), digests (14.5).

---

## 3. Public flows

### P1. Marketing landing page

- **Goal:** a busy senior professional understands, in seconds, what we do for them, trusts us with their account, and clicks Get started.
- **Sections, top to bottom:**
  1. **Hero (above the fold):** one benefit-led headline about what they get (being seen and known for the right things on LinkedIn, without spending their time on it). One supporting line. One primary button: Get started. Secondary: See how it works.
  2. **How it works:** 3 or 4 short steps. Connect LinkedIn, two short calls, we create and you approve, see results against your goals.
  3. **Why Bluecut:** the main selling points. Your strategy, not generic AI posts. A real account manager checks everything. Results measured against your goals, not likes.
  4. **You stay in control:** nothing is posted without your approval. You choose what we can do. We never see your password. Pause or disconnect at any time.
  5. **Testimonials:** quotes with name, role and company, and the result they got.
  6. **Start free, then commit:** 2-week free trial with no card. Then a 3, 6 or 12-month contract. Cancel any time and get unused months back.
  7. **Final call to action:** Get started.
  8. **Footer:** sign in, privacy, terms, contact.
- **States:** mobile layout, sticky Get started on mobile after the hero.
- **Questions:**
  1. Show prices on the page, or only the terms (3, 6, 12 months) until prices are set?
  2. Do you have real testimonials, or do we use placeholders for now?

### P2. Create account

- **Goal:** an account in under a minute.
- **Steps:**
  1. Create your account: "Continue with Google", or first name, last name, email and password.
  2. Email path only: enter the 6-digit code we sent (proves the email is theirs).
  3. Lands on Home (C1).
- **Not asked here:** country, location or time zone. Time zone is read quietly from the browser. Country comes from their LinkedIn profile when they connect (C2), and is asked only if LinkedIn does not provide it.
- **States:** email already used (link to sign in), weak password, wrong or expired code, second trial blocked.

### P3. Sign in and reset password

- **Steps:** Google, or email and password. 6-digit code if 2FA is on (required for staff, optional for clients). Forgot password: email, link, new password, signed out everywhere else.
- **States:** wrong details, locked after repeated tries, link expired (1 hour).

### P4. Accept staff invite

- **Steps:** open invite link, set password, set up 2FA (required), lands on Home.
- **States:** link used or expired (7 days).

---

## 4. Client flows

**Layout:** top bar on desktop with Home, Content, Messages, notifications and the profile menu. On mobile, a bottom tab bar with the same items. Content sits in one centred column of cards.

### C1. Home and setup progress

- **Goal:** the client always knows what is next, and can choose to continue now or later.
- **While setting up:** a setup card at the top with a percentage and the steps:
  1. Create account (done)
  2. Connect LinkedIn
  3. Book your goals call
  4. Goals call
  5. Strategy call
  6. Choose your plan
  
  One button for the current step. Steps waiting on Bluecut say so ("Your manager is preparing your strategy").
- **After setup:** Home becomes a feed of cards, newest first: posts waiting for your review, what went live, upcoming posts, the weekly update, messages from your manager.
- **States:** trial days left (small banner), LinkedIn connection expired (Reconnect card at the top), publishing paused.
- **Reminders:** email and in-app reminders when setup is unfinished.

### C2. Connect LinkedIn and set permissions

- **Steps:**
  1. Why we connect: what we can do, that you approve everything, that we never see your password.
  2. LinkedIn's own sign-in and consent screen (mocked in Phase 1).
  3. **What should we do for you?** A short list of plain switches:
     - Post for me (on)
     - Like and comment for me (on)
     - Post to my company Page (off, connect the Page to turn on)
     - Draft connection requests for me to send (off)
     - Draft profile updates for me to apply (off)
     
     Under each switch that is on: "Ask me first" or "Go ahead without asking". Profile changes and sensitive topics always ask first.
  4. Connected. Next step: book your goals call.
- **States:** consent declined, connection failed.

### C3. Book the goals call

- **Steps:**
  1. What this call is: 30 minutes to agree your goals. What we will ask, so you can think ahead. An AI notetaker joins so nothing is missed.
  2. Pick a time that suits you. Times are shown in your time zone and cover a wide range, including early mornings and evenings. The manager fits around you.
  3. Booked: date, time, Google Meet link, add to calendar. Reminders the day before and 1 hour before.
- **States:** reschedule, cancel, notetaker declined (call goes ahead without recording).

### C4. Strategy call and approval

- **Before the call:** "Your strategy is ready" notice. The client can read it: who you want to reach, your 3 to 5 topics, your tone, how often we post and engage, and how we measure progress against your goals.
- **Book the strategy call:** same as C3, 30 minutes.
- **After the call:** one screen, "What we agreed": the final strategy and content plan, with any changes from the call. Two actions: Approve, or Ask for a change.
- **States:** new version after a change request.

### C5. Choose a plan, sign and pay

- **Steps (Stepper):** Choose 3, 6 or 12 months. Review and sign the contract (dates, price, what you get, cancel any time with unused months refunded). Pay by card. Done, with receipt.
- **States:** payment failed, trial ended without signing (posting stops, access paused, data kept 30 days).
- **Questions:** see open question 1 on when this happens.

### C6. Review content

- **Entry:** Home card, notification or email link.
- **Steps:**
  1. The week's posts, each shown as it will look on LinkedIn.
  2. For each: Approve or Ask for changes. Changes by typing or a voice note (transcript shown and editable).
  3. Approve all remaining, with one confirmation.
- **States:** due soon, missed (post not published, marked as waiting on you), items your manager handled without asking (shown for information).
- **Questions:**
  1. On mobile, one post at a time (like stories), or a scrolling list? I suggest one at a time on mobile, list on desktop.

### C7. Take down or fix a live post

- **Goal:** if something already published is wrong, the client can act at once.
- **Entry:** any live post (Home feed, Content).
- **Actions:**
  - **Take it down now:** removed from LinkedIn straight away, after one confirmation.
  - **Ask for a fix:** a short note or voice note to the manager. Urgent by default.
- **States:** taken down (logged in activity), fix requested, fix done.

### C8. Progress and weekly updates

- **Steps:** progress toward your goals (in plain words first, numbers second), what we did vs what we promised this week, the weekly and monthly updates as readable posts, download as PDF, add a result (a lead, an invitation, an offer).
- **States:** too early for results (first weeks).

### C9. Messages

- **Steps:** one conversation with your manager. Text, files and voice notes. Photos and past posts for the brand can be shared here.

### C10. Control

- **Steps:** the same switches as C2, editable any time. Pause all posting (one tap, with confirmation). Disconnect LinkedIn. Requests from your manager for a one-off action (approve or decline). Activity: every action on your account, who and when, with filters.
- **States:** connection expired (Reconnect), paused, disconnected.

### C11. Raise a complaint

- **Entry:** from any post, or from Control.
- **Steps:** what went wrong (missed delivery, quality, action I did not allow, billing, other), describe it, attach a file if needed, send. Status shown afterwards.

### C12. Contract, billing and cancel

- **Steps:** your plan and dates, invoices and receipts, update card.
- **Cancel:** reason (optional), then "Here is what happens": the end date, what stops, and your refund. Refund covers every full month not yet started. Example: cancel 2 weeks into a 3-month contract, service runs to the end of month 1, months 2 and 3 are refunded. Confirm. Refund status shown until paid.

### C13. Account

- **Steps:** name and photo, time zone, sign-in and 2FA, active sessions, email notifications, download my data, delete my account.
- **Delete:** during a contract, deleting first cancels the contract (shows the refund, as in C12), then deletes.

---

## 5. Account manager flows

**Layout:** same web app style as the client, not a dashboard. Top bar on desktop with Home, Clients, Messages and notifications. Bottom tab bar on mobile. Everything works on a phone.

### M1. Home: what to do next

- **Steps:** a feed of task cards sorted by due time: what it is, which client, due when, and who it is waiting on. Urgent items first (fix requests, failed posts, missed deadlines). Tapping a card opens exactly the right screen.
- **Includes:** missed-deadline questions to answer with a reason.

### M2. Client page

- **Layout:** like a LinkedIn profile page. Header with the client's name, photo, role, status and setup progress. Sections below: Goals and strategy, Content, Engagement, Notes and calls, Messages.
- **Also shows:** what the client lets you do (read only), connection status, contract status.

### M3. Onboard a client

- **Steps (Stepper):**
  1. Goals call: transcript arrives from the AI notetaker (or paste notes). AI summary of goals, audience, tone and limits. Edit and save.
  2. Research and audit: run AI research on the client's field (sources shown) and a profile audit (each part rated with a suggestion). Review and edit.
  3. Strategy: AI draft. Edit any section, or regenerate one section with an instruction. Share with the client.
  4. Strategy call: agenda and follow-up questions ready. After the call, update and send "What we agreed" to the client.

### M4. Plan and draft a week

- **Steps:**
  1. The content plan for the contract, shown by week. Move a post by dragging.
  2. Draft the week: AI drafts in the client's voice. Edit, see versions, character count. Visual idea for each post, attach the image.
  3. Checks: any flags (risky claim, banned phrase, sounds generic, repeat of an old post, missing alt text) must be fixed or dismissed with a reason.
  4. Send to the client for review, with a due date.

### M5. Feedback, scheduling and live posts

- **Steps:** client feedback as a list of changes, fix with AI help, mark each done, resend. Schedule approved posts (client's time and your time shown). Failed posts with the reason and a retry. Fix requests on live posts (from C7). Ask the client for a one-off permission.
- **States:** Schedule unavailable until approved, on hold after the client removes a permission or pauses.

### M6. Weekly engagement

- **Steps:** this week's search brief (who to look for and why). Paste a profile or post link, see how well it fits and why. Keep or drop. Drafted comments and connection notes. Connection list sent to the client to send. Done vs target this week.

### M7. Weekly update

- **Steps:** AI drafts the update (what we did, best posts, progress toward goals, next week). Add your note. Send.

---

## 6. Admin flows

**Layout:** dashboard. Side navigation, tables, filters and metrics.

### A1. Overview
All clients with goal progress, delivery, approval delays, complaints and an at-risk flag. Unassigned clients at the top.

### A2. Account managers
Invite, status, how many clients each has (warning at the maximum), performance, assign and reassign clients, suspend (their clients move to Unassigned), payouts to approve.

### A3. Framework
The library behind the AI: strategy templates, topic models, post formats, tone rules, banned phrases, checks and industry rules. Every change saved as a new version.

### A4. Contracts and refunds
Contracts by status. Extend or credit with a note. Refunds waiting for approval, with the calculation. Approve or decline.

### A5. Complaints
Each complaint with the full timeline (approvals, activity, messages, who caused the delay). Choose an outcome and send it to the client. Reassign with a handover summary.

### A6. Settings and audit log
Plans and prices, trial length, refund rules, service targets, session timeout. Every admin and system action in the audit log.

---

## 7. Changes from the PRD

Once approved, these will be written into `docs/prd.md`.

| Area | PRD said | Now |
| --- | --- | --- |
| Plans | Separate plans page | Terms shown on the landing page; plan chosen at contract time |
| Sign up | Name, email, password, country, time zone | Google, or name, email and password. Location from LinkedIn, time zone from the browser |
| Intake form | Long guided form before call 1 | Removed. Goals are gathered on the goals call by the notetaker |
| Brand assets | Upload step in onboarding | Optional, shared through Messages |
| Calls | 90 and 60 minutes | 30 minutes each, at a time the client picks |
| Decision record and strategy approval | Two separate steps | One "What we agreed" approval after the strategy call |
| Client home | Dashboard | Feed of cards, LinkedIn style |
| Manager layout | Panels and workspace tabs | Feed of tasks and profile-style client pages |
| Live posts | No client action | Client can take a post down now or ask for a fix |

---

## 8. Open questions

1. **When does the client sign and pay?** Your note says the contract is accepted when LinkedIn is connected, and also that there is a free 2-week trial. Options:
   - a) Sign after the strategy call, and pay at the end of the 2-week trial. (My suggestion: they sign once they have seen their strategy.)
   - b) Sign when connecting LinkedIn, and pay at the end of the trial.
   - c) Sign and pay when connecting LinkedIn, with no free trial.
2. **Navigation icons.** The design system says no decorative icons in navigation, but LinkedIn-style top bars and mobile tab bars use an icon above each label. I suggest allowing icons with labels in the main navigation only, since the icon helps people find things on a small screen. Agree?
3. **Content lifecycle.** The PRD's 8-state content lifecycle diagram did not export. Please share the states.
4. **White logo** for dark surfaces, if it exists.

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
- **Mobile first for everyone.** Clients and account managers must be able to do everything on a phone.
- **Navigation: seamless and simple.**
  - Desktop: a slim top bar. Mobile: a compact floating bottom bar. Small, clean icons, each with a short label. Never big icons, never icons alone.
  - Inside any flow with sub-steps or sub-pages, a breadcrumb at the top (for example "Content / Week of 3 Nov / Post 2") so people can step back out at any level. On mobile the breadcrumb shortens to the parent page.
  - Moving back and forward must never need searching. Every sub-page has a clear way out, and multi-step flows show the Stepper.
- **The platform leads, the manager carries it out.** Bluecut's AI decides what to post about, what to engage with and when the strategy needs to change, from the client's goal, the framework and what is happening in their field (see Niche listening). The manager reviews, adjusts and executes. Managers never start from a blank page or their own taste.
- **Nothing happens without the client.** The client approves content, sets what the manager may do, and can pause, take down or disconnect at any time. The product says so wherever it matters.

---

## 1. The end-to-end journey

| Stage | Client | Account manager | Admin |
| --- | --- | --- | --- |
| Discover | Lands on the marketing page, clicks Get started | | |
| Create account | Google, or email and password with first and last name | | |
| Set up | Sees setup progress on Home. Connects LinkedIn, chooses what we do, books both calls, chooses a plan and signs (paying now is optional), sets how they review | Is assigned, fits both calls into the client's chosen times | Assigns a manager |
| First 2 weeks (free) | Full service. Payment reminders 3 days before the end and on the last day | | |
| End of free 2 weeks | Pays, or the account pauses until they pay. Paying reactivates it automatically | Nothing to do while paused | Sees paused accounts |
| Goals call (30 min) | Meets their account manager. AI notetaker records | Runs the call, then AI research, audit and strategy draft | |
| Strategy call (30 min) | Reviews strategy and content plan, approves "What we agreed" | Runs the call, finalises the plan | |
| First posts | Reviews the first week of posts | Drafts, schedules, engages | |
| Week 3 onward (paid contract) | | | Sees the contract run |
| Every week | Reviews posts as often as they chose, sees what went live, reads the weekly update | Drafts, checks, schedules, engages, writes the update, reports anything held back and why | Watches accounts at risk |
| Something is wrong | Takes a post down, asks for a fix, pauses, complains | Fixes, answers queries | Resolves complaints and refunds |
| Contract ends | Account pauses. Renewing reactivates it automatically | Nothing to do while paused | |
| Pull out | Cancels any time, unused months refunded | Unassigned | Approves the refund |

---

## 2. Flow inventory

| ID | Flow | Role | PRD stories | Status |
| --- | --- | --- | --- | --- |
| P1 | Marketing landing page | Visitor | 2.1 | Draft |
| P2 | Create account | Client | 1.1 | Draft |
| P3 | Sign in and reset password | All | 1.3, 1.4 | Draft |
| P4 | Accept staff invite | Manager | 1.2, 1.3 | Draft |
| C1 | Home and setup progress | Client | 3.9, 10.1 | Draft |
| C2 | Connect LinkedIn and choose what we do | Client | 8.1, 8.2 | Draft |
| C3 | Book your two calls | Client | 3.3, 3.4 | Draft |
| C4 | Choose a plan, sign, pay now or later | Client | 2.2, 2.3, 11.1 | Draft |
| C5 | Set how you review | Client | 3.8, 7.5, 7.6, 14.2 | Draft |
| C6 | Strategy call and approval | Client | 3.7, 4.6, 4.7 | Draft |
| C7 | Review content | Client | 7.2, 7.3, 7.5 | Draft |
| C8 | Take down or fix a live post | Client | New | Draft |
| C9 | Progress and weekly updates | Client | 10.1 to 10.5 | Draft |
| C10 | Messages | Client | 14.3 | Draft |
| C11 | Control: permissions, pause, disconnect, activity | Client | 8.2, 8.4, 8.5, 8.6, 8.7, 9.3 | Draft |
| C12 | Raise a complaint | Client | 12.3 | Draft |
| C13 | Contract, billing and cancel | Client | 11.2 to 11.7 | Draft |
| C14 | Account: profile, security, delete | Client | 1.6 to 1.8, 14.2 | Draft |
| C15 | Your brand | Client | 3.2, 5.4 | Draft |
| C16 | Paused account and reactivation | Client | 2.4, 2.5, 11.6, 11.7 | Draft |
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
  6. **How it works with the contract:** choose a 3, 6 or 12-month contract. Your first 2 weeks are free, and the contract starts in week 3. Pull out any time and get unused months back. (The word "trial" is not used anywhere in the product.)
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
- **States:** email already used (link to sign in), weak password, wrong or expired code, person already had their free 2 weeks (blocked with a message to contact us).

### P3. Sign in and reset password

- **Steps:** Google, or email and password. 6-digit code if 2FA is on (required for staff, optional for clients). Forgot password: email, link, new password, signed out everywhere else.
- **States:** wrong details, locked after repeated tries, link expired (1 hour).

### P4. Accept staff invite

- **Steps:** open invite link, set password, set up 2FA (required), lands on Home.
- **States:** link used or expired (7 days).

---

## 4. Client flows

**Layout:** slim top bar on desktop with Home, Content, Messages, notifications and the profile menu (Your brand, Control, Contract, Account). On mobile, a compact floating bottom bar with the same main items. Content sits in one centred column of cards.

### C1. Home and setup progress

- **Goal:** the client always knows what is next, and can choose to continue now or later.
- **While setting up:** a setup card at the top with a percentage and these steps, done in one sitting or over several visits:
  1. Connect LinkedIn
  2. Choose what we do for you
  3. Book your goals call
  4. Book your strategy call
  5. Choose your plan and sign
  6. Set how you review

  One button: Continue setup. Reminders by email and in-app while setup is unfinished.
- **After setup, before the calls:** Home shows the two booked calls with your account manager (name and photo), what each call covers, and Reschedule.
- **After the calls:** Home becomes a feed of cards, newest first: posts waiting for your review, what went live, upcoming posts, the weekly update, messages from your manager.
- **States:** "Your first 2 weeks are free" banner with the end date (becomes "Pay to keep going" in the last 3 days if not paid), account paused (see C16), LinkedIn connection expired (Reconnect card at the top), posting paused by you.

### C2. Connect LinkedIn and choose what we do

- **Steps:**
  1. Why we connect: what we can do, that nothing happens without your say, that we never see your password.
  2. LinkedIn's own sign-in and consent screen (mocked in Phase 1).
  3. **What should we do for you?** Plain switches:
     - Post for me (on)
     - Like and comment for me (on)
     - Post to my company Page (off, connect the Page to turn on)
     - Draft connection requests for me to send (off)
     - Draft profile updates for me to apply (off)
- **States:** consent declined, connection failed.
- **Note:** whether each of these needs your approval first is set in C5, in one place.

### C3. Book your two calls

- **Goal:** the client books both calls at times that suit them, knowing why each call matters and who they will meet.
- **Steps:**
  1. **Your two calls:** why we need them, in plain words.
     - Goals call (30 minutes): we agree what you want from LinkedIn. What we will ask, so you can think ahead.
     - Strategy call (30 minutes): we walk you through your strategy and content plan and agree it.
     - You will meet your account manager (name, photo, short intro). An AI notetaker joins both calls so nothing is missed.
  2. **Pick a time for your goals call.** Times in your time zone, a wide range including early mornings and evenings. The account manager fits around you.
  3. **Pick a time for your strategy call.** Only times that leave your manager enough days to prepare after the goals call are offered.
  4. **Booked:** both dates, Google Meet links, add to calendar. Reminders by email the day before and 1 hour before.
- **States:** reschedule, cancel, notetaker declined (call goes ahead and the manager takes notes).

### C4. Choose a plan, sign, pay now or later

- **Rule:** the contract must be signed before the free 2 weeks start. Paying is optional at this point.
- **Steps (Stepper):**
  1. **Choose your contract:** 3 months, 6 months or 12 months. Each shows the price and what you get.
  2. **Review and sign:** your first 2 weeks are free, with the full service. Your contract starts on [date] and ends on [date]. Price. What you get. **You can pull out any time** and we refund every month not yet started. If you have not paid by [end of free 2 weeks], your account pauses until you do. Sign with your typed name.
  3. **Pay:** pay now by card, or **Skip for now**. Skipping is equal in weight to paying; nobody is pushed.
  4. **Done:** what happens next, "You can pull out any time from Contract", and the receipt if they paid.
- **Reminders if not paid:** email and in-app 3 days before the free 2 weeks end, and on the last day. Each links straight to payment.
- **States:** payment failed (try again or use another card).

### C5. Set how you review

- **Goal:** the client decides how involved they want to be, and understands clearly what happens if they do not respond.
- **Steps:**
  1. **How often do you want to review?** Once a week (default), twice a week, or every post.
  2. **Where should we tell you?** Email, in the app, or both. (Email is on by default.)
  3. **What needs your approval?** For each thing we do: "Ask me first" or "Go ahead without asking". Defaults: posts ask first; routine likes and comments go ahead. Profile changes and sensitive topics always ask first.
  4. **If you do not reply by the due time:**
     - "Wait for me" (default): nothing goes out until you approve. We remind you, but we cannot post without you. Posts not approved in time are held, and your weekly update shows what was held and why.
     - "Go ahead if I have not replied within [24 hours]": your manager posts the reviewed drafts. You can still take any post down.
  5. Short summary of the choices. Save. Change any time in Control.
- **States:** changes apply to new posts only (items already sent to you keep their path).

### C6. Strategy call and approval

- **Before the call:** "Your strategy is ready" notice. The client can read it: who you want to reach, your 3 to 5 topics, your tone, how often we post and engage, and how we measure progress against your goals.
- **After the call:** one screen, "What we agreed": the final strategy and content plan, with any changes from the call. Two actions: Approve, or Ask for a change.
- **States:** new version after a change request.

### C7. Review content

- **Entry:** Home card, notification or email link.
- **Steps:**
  1. The posts for this review, each shown as it will look on LinkedIn. Due time shown at the top, with what happens if you do not reply (from your C5 choice).
  2. For each: Approve or Ask for changes. Changes by typing or a voice note (transcript shown and editable).
  3. Approve all remaining, with one confirmation.
- **States:** due soon (reminder), not reviewed in time (held if you chose "Wait for me", or posted if you chose "Go ahead"), items your manager handled without asking (shown for information).
- **Questions:**
  1. On mobile, one post at a time (like stories), or a scrolling list? I suggest one at a time on mobile, list on desktop.

### C8. Take down or fix a live post

- **Goal:** if something already published is wrong, the client can act at once.
- **Entry:** any live post (Home feed, Content).
- **Actions:**
  - **Take it down now:** removed from LinkedIn straight away, after one confirmation.
  - **Ask for a fix:** a short note or voice note to the manager. Urgent by default.
- **States:** taken down (logged in activity), fix requested, fix done.

### C9. Progress and weekly updates

- **Steps:** progress toward your goals (in plain words first, numbers second), what we did vs what we promised this week, anything held back and why (for example "2 posts held, waiting for your review"), the weekly and monthly updates as readable posts, download as PDF, add a result (a lead, an invitation, an offer).
- **States:** too early for results (first weeks).

### C10. Messages

- **Steps:** one conversation with your manager. Text, files and voice notes. Files shared here can be saved to Your brand (C15) with one tap.

### C11. Control

- **Steps:** what we do for you (C2 switches) and how you review (C5 settings), editable any time. Pause all posting (one tap, with confirmation). Disconnect LinkedIn. Requests from your manager for a one-off action (approve or decline). Activity: every action on your account, who and when, with filters.
- **States:** connection expired (Reconnect), paused, disconnected.

### C12. Raise a complaint

- **Entry:** from any post, or from Control.
- **Steps:** what went wrong (missed delivery, quality, action I did not allow, billing, other), describe it, attach a file if needed, send. Status shown afterwards.

### C13. Contract, billing and cancel

- **Steps:** your plan and dates, invoices and receipts, update card.
- **Cancel (pull out):** reason (optional), then "Here is what happens": the end date, what stops, and your refund. Confirm. Refund status shown until paid.
  - During the first 2 free weeks: everything stops, full refund if they paid early.
  - After the contract starts: service runs to the end of the current month, and every month not yet started is refunded. Example: pull out 2 weeks into a 3-month contract, service runs to the end of month 1, months 2 and 3 are refunded.

### C14. Account

- **Steps:** name and photo, time zone, sign-in and 2FA, active sessions, email notifications, download my data, delete my account.
- **Delete:** during a contract, deleting first cancels the contract (shows the refund, as in C13), then deletes.

### C15. Your brand

- **Goal:** one place for everything that makes content sound and look like the client. The manager uses it when creating content.
- **Entry:** Account menu, and from Messages ("Add to your brand").
- **Sections:**
  - **Photos:** headshots and other pictures of you.
  - **Logos and colours:** for you or your company.
  - **Your voice:** how you like to sound, words you use or avoid, past posts or writing you like.
  - **Your brand documents:** any personal brand strategy or guide you already have.
  - **Moments:** something you want a post about, such as an event you attended. Add photos and a short note ("I spoke at this event, I want a post about it"). Your manager is notified at once and replies in Messages.
- **States:** file too large or wrong type (inline message with the allowed types and size), empty sections with a short prompt.

### C16. Paused account and reactivation

- **When an account pauses:** the free 2 weeks ended without payment, or the contract ended without renewal.
- **What pauses:** all scheduled posts, likes, comments and engagement. Nothing goes out. Drafts and settings are kept.
- **What the client sees:** email and in-app notice: your account is paused, why, and what is waiting. A card at the top of Home: "Your account is paused. Pay to pick up where you left off." One button: Pay now (or Renew, at contract end).
- **Reactivation:** as soon as payment succeeds, the account reactivates automatically. Posts whose dates are still ahead go back to Scheduled. Posts whose dates passed go back to the manager to reschedule.
- **Responsibility:** time spent paused is on the client, not the manager. It is not counted as a missed delivery.
- **Questions:** see open questions 4 and 5.

---

## 5. Account manager flows

**Layout:** same web app style as the client, not a dashboard. Top bar on desktop with Home, Clients, Messages and notifications. Bottom tab bar on mobile. Everything works on a phone.

### M1. Home: what to do next

- **Steps:** a feed of task cards sorted by due time: what it is, which client, due when, and who it is waiting on. Urgent items first (fix requests, failed posts, missed deadlines). Tapping a card opens exactly the right screen.
- **Includes:** missed-deadline questions to answer with a reason.

### M2. Client page

- **Layout:** like a LinkedIn profile page. Header with the client's name, photo, role, status and setup progress. Sections below: In their field this week, Goals and strategy, Content, Engagement, Their brand (from C15, with new Moments highlighted), Notes and calls, Messages.
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

- **Steps:** client feedback as a list of changes, fix with AI help, mark each done, resend. Schedule approved posts (client's time and your time shown). Failed posts with the reason and a retry. Fix requests on live posts (from C8). Ask the client for a one-off permission.
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
Plans and prices, length of the free period, refund rules, service targets, session timeout. Every admin and system action in the audit log.

---

## 7. Niche listening (runs in the background)

- **Goal:** content and engagement are based on the client's goal **and** on what people in their field are talking about right now, so the strategy works in practice.
- **How it works:**
  1. From the strategy, the AI sets each client's listening topics: keywords, people, companies and events in their field. The manager can add or remove topics.
  2. Sources are watched continuously: Google Alerts for each topic, news and web search, and the client's own LinkedIn performance (what is working, what is not).
  3. The AI reads what comes in, drops noise, and turns it into signals: rising topics, conversations to join, news worth a reaction, opportunities (events, podcasts, awards).
- **Where it shows up:**
  - **Content plan (M4):** suggested topics tied to a signal, for example "3 founders posted about X this week, a reaction post fits your topic 2".
  - **Weekly engagement (M6):** the search brief includes the conversations and people the signals point to.
  - **Strategy:** when the field shifts or results stall, the AI suggests a strategy update for the manager to review and the client to approve.
  - **Manager client page (M2):** "In their field this week", a short list of signals.
  - **Client review (C7):** each post can show "Why this post": the goal it serves and the signal behind it.
  - **Weekly update (C9):** "What is happening in your field" in two or three lines.
- **Rules:** sources are shown for every signal. Nothing is posted because of a signal without the normal review path.

## 8. Content lifecycle

From the PRD, with today's additions marked **new**.

| State | Meaning | Moves to |
| --- | --- | --- |
| AI draft | Drafted by the AI | Manager review |
| Manager review | Manager edits and checks | Awaiting client, or Approved if it is a "Go ahead without asking" type |
| Awaiting client | Sent for the client's review | Approved, Changes requested, or Approved automatically if the client chose "Go ahead if I have not replied" and the wait passed (**new**) |
| Changes requested | Client asked for changes | Manager review |
| Approved | Ready to schedule | Scheduled |
| Scheduled | Will go out at a set time | Published, Failed (after 3 tries), On hold |
| On hold | Client paused posting, removed a needed permission, or the account is paused (**new**: unpaid or contract ended) | Scheduled when restored, or Manager review if the date has passed |
| Published | Live on LinkedIn | Taken down (**new**) |
| Failed | LinkedIn rejected it 3 times | Manager review |
| Taken down (**new**) | Client removed it from LinkedIn | End |

Editing approved content sends it back to Awaiting client. Content Awaiting client past its due time under "Wait for me" is held and reported as waiting on the client.

## 9. Changes from the PRD

Once approved, these will be written into `docs/prd.md`.

| Area | PRD said | Now |
| --- | --- | --- |
| Plans | Separate plans page | Terms shown on the landing page; plan chosen at contract time |
| Sign up | Name, email, password, country, time zone | Google, or name, email and password. Location from LinkedIn, time zone from the browser |
| Intake form | Long guided form before call 1 | Removed. Goals are gathered on the goals call by the notetaker |
| Calls | 90 and 60 minutes, call 2 booked later | 30 minutes each, both booked during setup at times the client picks |
| Trial | 2-week trial, no card, pay at the end | Never called a trial. Client signs during setup, before the free 2 weeks start. Paying then is optional. Reminders before the end. Unpaid at the end: the account pauses until payment, then reactivates automatically |
| Contract end | Access revoked, manager unassigned | Account pauses. Renewing reactivates it automatically |
| Brand assets (update) | Upload step in onboarding | A "Your brand" section in the account: photos, logos, voice, brand documents, and Moments for things they want posts about |
| Approval settings | Set after call 2 | Set during setup in "How you review": how often, email or app, what needs approval |
| Missed approvals | Never published automatically | Client chooses: "Wait for me" (held, reported as waiting on client) or "Go ahead if I have not replied" |
| Decision record and strategy approval | Two separate steps | One "What we agreed" approval after the strategy call |
| Client home | Dashboard | Feed of cards, LinkedIn style |
| Manager layout | Panels and workspace tabs | Feed of tasks and profile-style client pages |
| Research | One-off at onboarding, plus a weekly engagement brief | Continuous niche listening (Google Alerts, news and web search, the client's own performance) feeding the content plan, engagement and strategy updates |
| Who decides | Manager reviews AI output | Explicit: the platform leads on what to post and engage with; the manager reviews and carries it out |
| Live posts | No client action | Client can take a post down now or ask for a fix |
| Client account states | Trial, Onboarding, Active, Paused, Ended | Setting up, Free 2 weeks, Active, Paused (by client, unpaid or contract ended), Ended |

---

## 10. Open questions

1. **Gap between the calls.** How many days does a manager need between the goals call and the strategy call to prepare the strategy? I suggest at least 3 working days, so both calls fit inside the free 2 weeks.
2. **Contract dates.** If someone signs today but books their calls for next week, does the free period start at signing or at the goals call? I suggest at signing, so the contract start date shown when they sign is exact.
3. **"Go ahead if I have not replied":** is 24 hours the right wait, or should the client pick (12, 24 or 48 hours)?
4. **Contract end.** While an account is paused after a contract ends, does the client keep the same account manager when they renew? I suggest yes, for up to 30 days, then the manager is freed for other clients.
5. **How long can an account stay paused** before it ends and the data retention period starts? I suggest 30 days, set by the admin.
6. **Reminder timing:** 3 days before the free 2 weeks end and on the last day. Add one at 5 days too?

**Resolved:** navigation (section 0), content lifecycle (section 7), white logo (to be added to the design system in Claude, then synced here).

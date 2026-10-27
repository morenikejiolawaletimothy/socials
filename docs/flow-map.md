# Bluecut Socials flow map

Every user flow, end to end, screen by screen. Built from `docs/prd.md` and Fola's design direction (review 1, Oct 27 2026).

**Status:** All flows approved by Fola (design authority), Oct 27 2026. Changes go through the same review.

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
- **AI is an in-house tool, never part of what we sell.** Clients and visitors never see the word AI. To them, an expert account manager runs their account, backed by Bluecut. Inside the product, the AI does the fast research and proposes options (topics, drafts, engagement, strategy changes), and people decide.
- **Human in the loop, in this order:** AI proposes → the account manager (the expert) reviews, directs and adjusts ("change this, try this") → the client reads and approves, as set in "How you review" (C5) → it goes live. Managers never start from a blank page or their own taste, and the AI is never the sole decider.
- **The client always sees it first.** Every post is shared with the client before it goes live, so nothing on their profile surprises them. If they chose "Wait for me" and do not reply, the post is held. The contract keeps running, and the time is on the client, not on Bluecut.
- **Nothing happens without the client.** The client approves content, sets what the manager may do, and can pause, take down or disconnect at any time. The product says so wherever it matters.

---

## 1. The end-to-end journey

| Stage | Client | Account manager | Admin |
| --- | --- | --- | --- |
| Discover | Lands on the marketing page, clicks Get started | | |
| Create account | Google, or email and password with first and last name | | |
| Set up | Sees setup progress on Home. Connects LinkedIn, chooses what we do, books both calls, chooses a plan and signs (paying now is optional), sets how they review | Is assigned. The client books inside the manager's open slots | Confirms the manager the platform suggests, or picks another |
| First 2 weeks (free) | Full service. Payment reminders 5 days and 3 days before the end, and on the last day | | |
| End of free 2 weeks | Pays, or the account pauses until they pay. Paying reactivates it automatically | Nothing to do while paused | Sees paused accounts |
| Goals call (30 min) | Meets their account manager. A notetaker records, if they agreed | Runs the call, then research, audit and strategy draft (AI-assisted, in-house) | |
| Strategy call (30 min) | Reviews strategy and content plan, approves "What we agreed" | Runs the call, finalises the plan | |
| First posts | Reviews the first week of posts | Drafts, schedules, engages | |
| Week 3 onward (paid contract) | | | Sees the contract run |
| Every week | Reviews posts as often as they chose, sees what went live, reads the weekly update | Drafts, checks, sends to the client, schedules, engages, writes the update, reports anything held back and why | Watches accounts at risk |
| Something is wrong | Takes a post down, asks for a fix, pauses, complains | Fixes, answers queries | Resolves complaints and refunds |
| Contract ends | Account pauses. Renewing reactivates it automatically, with the same manager | Stays assigned while paused | |
| Paused 30 days | Account and all data removed. Coming back means starting again | Unassigned | |
| Pull out | Cancels any time, unused months refunded | Unassigned | Approves the refund |

---

## 2. Flow inventory

| ID | Flow | Role | PRD stories | Status |
| --- | --- | --- | --- | --- |
| P1 | Marketing landing page | Visitor | 2.1 | Approved |
| P2 | Create account | Client | 1.1 | Approved |
| P3 | Sign in and reset password | All | 1.3, 1.4 | Approved |
| P4 | Accept staff invite | Manager | 1.2, 1.3 | Approved |
| C1 | Home and setup progress | Client | 3.9, 10.1 | Approved |
| C2 | Connect LinkedIn and choose what we do | Client | 8.1, 8.2 | Approved |
| C3 | Book your two calls | Client | 3.3, 3.4 | Approved |
| C4 | Choose a plan, sign, pay now or later | Client | 2.2, 2.3, 11.1 | Approved |
| C5 | Set how you review | Client | 3.8, 7.5, 7.6, 14.2 | Approved |
| C6 | Strategy call and approval | Client | 3.7, 4.6, 4.7 | Approved |
| C7 | Review content | Client | 7.2, 7.3, 7.5 | Approved |
| C8 | Take down or fix a live post | Client | New | Approved |
| C9 | Progress and weekly updates | Client | 10.1 to 10.5 | Approved |
| C10 | Messages | Client | 14.3 | Approved |
| C11 | Control: permissions, pause, disconnect, activity | Client | 8.2, 8.4, 8.5, 8.6, 8.7, 9.3 | Approved |
| C12 | Raise a complaint | Client | 12.3 | Approved |
| C13 | Contract, billing and cancel | Client | 11.2 to 11.7 | Approved |
| C14 | Account: profile, security, delete | Client | 1.6 to 1.8, 14.2 | Approved |
| C15 | Your brand | Client | 3.2, 5.4 | Approved |
| C16 | Paused account and reactivation | Client | 2.4, 2.5, 11.6, 11.7 | Approved |
| C17 | Quick tasks for you | Client | 6.3, 8.3, 5.8 | Approved |
| M1 | Home: what to do next | Manager | 13.4, 12.1, 12.5 | Approved |
| M2 | Clients and the client page | Manager | 3.8, 8.2 | Approved |
| M3 | Onboard a client | Manager | 3.4 to 3.7, 4.2 to 4.5 | Approved |
| M4 | Plan and draft content | Manager | 5.1 to 5.7, 7.1 | Approved |
| M5 | After the client reviews | Manager | 7.4, 9.1, 9.2, 9.4 | Approved |
| M6 | Weekly engagement | Manager | 6.1 to 6.3, 6.6, 8.3 | Approved |
| M7 | Listening for a client | Manager | New | Approved |
| M8 | Weekly and monthly updates | Manager | 10.2 | Approved |
| M9 | Messages | Manager | 14.3, 8.6 | Approved |
| M10 | My calls and profile | Manager | 3.3, 1.7 | Approved |
| A1 | Overview | Admin | 10.6 | Approved |
| A2 | Clients and assigning managers | Admin | 13.3, 10.6 | Approved |
| A3 | Managers | Admin | 13.1, 13.5, 13.6, 13.9, 12.6 | Approved |
| A4 | Framework | Admin | 4.1 | Approved |
| A5 | Money | Admin | 2.7, 11.5 | Approved |
| A6 | Complaints | Admin | 12.2, 12.4 | Approved |
| A7 | Settings | Admin | 12.7, 13.7 | Approved |
| A8 | Audit log | Admin | 13.8 | Approved |

**Later (not in the first build):** manager training (13.2), opportunities (6.4, 6.5), benchmarks (4.4), digests (14.5).

---

## 3. Public flows

### P1. Marketing landing page

- **Goal:** a busy senior professional understands, in seconds, what we do for them, trusts us with their account, and clicks Get started.
- **Sections, top to bottom:**
  1. **Hero (above the fold):** one benefit-led headline about what they get (being seen and known for the right things on LinkedIn, without spending their time on it). One supporting line. One primary button: Get started. Secondary: See how it works.
  2. **How it works:** 3 or 4 short steps. Connect LinkedIn, two short calls, we create and you approve, see results against your goals.
  3. **Why Bluecut:** the main selling points. A dedicated expert runs your account, with a strategy built around you. Every post is checked before you see it. Results measured against your goals, not likes.
  4. **You stay in control:** nothing is posted without your approval. You choose what we can do. We never see your password. Pause or disconnect at any time.
  5. **Testimonials:** short client videos and images of their LinkedIn profiles (before and after, results), each with name, role and company. Real only. Placeholder frames until real ones exist.
  6. **How it works with the contract:** choose a 3, 6 or 12-month contract. Your first 2 weeks are free, and the contract starts in week 3. Pull out any time and get unused months back. (The word "trial" is not used anywhere in the product.)
  7. **Final call to action:** Get started.
  8. **Footer:** sign in, privacy, terms, contact.
- **States:** mobile layout, sticky Get started on mobile after the hero.
- **Prices:** dummy prices in US dollars for now. All prices come from one pricing module, built so Stripe can later show each visitor's local currency (Stripe's automatic local pricing) without changing the page.

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

- **Steps:** open invite link, set password, set up 2FA (required), set your photo and short intro, open your call slots (availability calendar), lands on Home.
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
- **After the calls:** Home becomes a feed of cards, newest first: quick tasks for you (C17), posts waiting for your review, what went live, upcoming posts, the weekly update, messages from your manager.
- **States:** "Your first 2 weeks are free" banner with the end date (becomes "Pay to keep going" in the last 5 days if not paid), account paused (see C16), LinkedIn connection expired (Reconnect card at the top), posting paused by you.

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
     - You will meet your account manager, the expert who runs your account (name, photo, short intro). A notetaker joins and records both calls so nothing is missed. Before booking we ask for your consent to record. Saying no is fine.
  2. **Pick a time for your goals call.** Times come from your manager's open slots, shown in your time zone.
  3. **Pick a time for your strategy call.** Only times at least 3 days after the goals call are offered, so your manager has time to prepare.
  4. **Booked:** both dates, Google Meet links, add to calendar. Reminders by email the day before and 1 hour before.
- **States:** reschedule, cancel, recording declined (the call goes ahead without the notetaker), manager rescheduled (you are notified and pick a new time).

### C4. Choose a plan, sign, pay now or later

- **Rule:** the contract must be signed before the free 2 weeks start. Paying is optional at this point.
- **Steps (Stepper):**
  1. **Choose your contract:** 3 months, 6 months or 12 months. Each shows the price and what you get.
  2. **Review and sign:** your first 2 weeks are free, with the full service. Your contract starts on [date] and ends on [date]. Price. What you get. **You can pull out any time** and we refund every month not yet started. If you have not paid by [end of free 2 weeks], your account pauses until you do. Sign with your typed name.
  3. **Pay:** pay now by card, or **Skip for now**. Skipping is equal in weight to paying; nobody is pushed.
  4. **Done:** what happens next, "You can pull out any time from Contract", and the receipt if they paid.
- **Free 2 weeks** start the day the contract is signed, so the dates on the contract are exact.
- **Reminders if not paid:** email and in-app 5 days and 3 days before the free 2 weeks end, and on the last day. Each links straight to payment.
- **States:** payment failed (try again or use another card).

### C5. Set how you review

- **Goal:** the client decides how involved they want to be, and understands clearly what happens if they do not respond.
- **Steps:**
  1. **How often do you want to review?** Once a week (default), twice a week, or every post.
  2. **Where should we tell you?** Email, in the app, or both. (Email is on by default.)
  3. **What needs your approval?** For each thing we do: "Ask me first" or "Go ahead without asking". Defaults: posts ask first; routine likes and comments go ahead. Profile changes and sensitive topics always ask first.
  4. **If you do not reply by the due time:**
     - "Wait for me" (default): nothing goes out until you approve. We remind you, but we cannot post without you. Posts not approved in time are held, and your weekly update shows what was held and why.
     - "Go ahead if I have not replied within 24 hours": your manager posts the reviewed drafts. You can still take any post down. (24 hours is fixed.)
  5. Short summary of the choices. Save. Change any time in Control.
- **States:** changes apply to new posts only (items already sent to you keep their path).

### C6. Strategy call and approval

- **Before the call:** "Your strategy is ready" notice. The client can read it: who you want to reach, your 3 to 5 topics, your tone, what is off limits, and the plan in numbers (for example 2 posts, 10 comments and 15 connection requests a week), and how we measure progress against your goals.
- **After the call:** your manager updates the strategy with anything you changed on the call, then sends "What we agreed". Two actions: Approve, or Ask for a change. Work starts only once you approve.
- **States:** new version after a change request.

### C7. Review content

- **Entry:** Home card, notification or email link.
- **Steps:**
  1. The posts for this review, each shown as it will look on LinkedIn. Each can show a short note from your manager on why this post (the goal it serves, what is happening in your field). Never mentions AI. Due time shown at the top, with what happens if you do not reply (from your C5 choice).
  2. For each: Approve or Ask for changes. Changes or preferences by typing or a voice note (transcript shown and editable). Preferences are remembered for future posts.
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

- **Steps:** progress toward your goals (in plain words first, numbers second), this week's targets from your strategy vs what was done, anything held back and why (for example "2 posts held, waiting for your review"), the weekly and monthly updates as readable posts, download as PDF, add a result (a lead, an invitation, an offer).
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

- **Steps:** your plan and dates, your account manager, invoices and receipts, update card.
- **Ask for a different manager:** a short reason, sent to the owner. Managers only change when the client asks, after a complaint about the manager, or if the manager does not turn up.
- **Cancel (pull out), 3 short steps:**
  1. **Why are you leaving?** Required. A few plain choices (not seeing results, too expensive, not enough time to review, not happy with my manager, no longer need it, other) plus an optional note.
  2. **Can we fix this?** One short offer that matches the reason, for example "Talk to the owner first" (book a short call), "Change my manager", or "Pause posting instead". Always with an equally clear "No, continue to cancel". Never more than one screen.
  3. **Here is what happens:** the end date, what stops, and your refund. Confirm. Refund status shown until paid. The owner is told at once, with the reason.
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
  - **Off limits:** what you never want us to do or talk about. Topics to avoid, people or companies not to engage with, things your employer or profession does not allow, kinds of interaction to skip (for example "never comment on politics", "do not mention my employer's clients"). Captured on the goals call and editable here any time. We check every post and every engagement against it.
  - **Moments:** something you want a post about, such as an event you attended. Add photos and a short note ("I spoke at this event, I want a post about it"). Your manager is notified at once and replies in Messages.
- **States:** file too large or wrong type (inline message with the allowed types and size), empty sections with a short prompt.

### C16. Paused account and reactivation

- **When an account pauses:** the free 2 weeks ended without payment, or the contract ended without renewal.
- **What pauses:** all scheduled posts, likes, comments and engagement. Nothing goes out. Drafts and settings are kept.
- **What the client sees:** email and in-app notice: your account is paused, why, and what is waiting. A card at the top of Home: "Your account is paused. Pay to pick up where you left off." One button: Pay now (or Renew, at contract end).
- **Reactivation:** as soon as payment succeeds, the account reactivates automatically. Posts whose dates are still ahead go back to Scheduled. Posts whose dates passed go back to the manager to reschedule.
- **Responsibility:** time spent paused is on the client, not the manager. It is not counted as a missed delivery.
- **Same manager:** the client keeps the same account manager while paused and after renewing.
- **Reminders while paused:** regular reminders. At 15 days paused, a clear notice: "If your account stays paused for 30 days, we will remove it and delete your data. To come back after that, you would start again."
- **At 30 days paused:** the account is removed and all client data is deleted (strategy, content, brand files, messages, LinkedIn connection). Only invoices and payment records are kept, as the law requires, with no content or personal brand data. The client is told by email, with a last chance to download their data before deletion. Coming back means signing up and onboarding again.

### C17. Quick tasks for you

- **Why:** LinkedIn does not let anyone act for the client on some things, such as sending connection requests or editing their profile. We never have their password, so these stay with the client. We prepare everything so each task takes 1 to 3 minutes.
- **When:** the platform brings them up when the strategy needs them (for example "15 connection requests this week"), and the manager reviews and sends them to the client.
- **What a task looks like:**
  - **Connect with these people:** a short list. Each person has their name, role, a link to their profile, why they matter to your goal, and a ready-written connection note. Buttons: Open profile, Copy note, Mark as sent. Notes can be edited before copying.
  - **Update your profile:** the new headline or About text, ready to copy, with where to paste it on LinkedIn. Mark as done.
  - Other one-off steps the strategy calls for, written the same way.
- **Hand it to your assistant:** "Send to my assistant" emails the task list and notes to an address you choose. They do not need an account.
- **States:** due this week, partly done (for example 9 of 15 sent), done. Tasks not done count as waiting on you in the weekly update, the same as held posts.

---

## 5. Account manager flows

**Status:** Approved.

**Who they are:** trained operators, not necessarily strategists, each running up to 10 clients. The platform tells them what to do next and proposes the work. They review, direct and carry it out.

**Layout:** the same LinkedIn-style web app as the client, not a dashboard. Slim top bar on desktop, compact floating bottom bar on mobile: **Home, Clients, Messages**, notifications and the profile menu. Breadcrumbs inside every client ("Clients / Ada Obi / Content / Week of 3 Nov"). A manager can do the whole job on a phone.

### M1. Home: what to do next

- **Goal:** open the app and know exactly what to do, in order.
- **A feed of cards across all clients, in this order:**
  1. **Urgent:** fix requests on live posts, posts the client took down, failed posts, complaints.
  2. **Calls today:** client, time, Join button, prep notes.
  3. **Your work, by due time:** drafts to prepare, client changes to apply, new Moments from a client, posts to schedule, weekly updates to send.
  4. **Waiting on clients** (collapsed): reviews due, posts held because the client has not replied. Information only.
- **Each card:** what it is, which client, when it is due, and one button that opens exactly the right screen.
- **Missed deadline:** if the manager misses a due time, a card asks for a short reason. Repeated misses go to the owner.
- **Two views of the same tasks, switched at the top:**
  - **Feed** (default): the list above.
  - **Board:** columns To do, Doing, Waiting on client, Done (this week). The manager drags cards between To do and Doing. Cards move to Waiting on client and Done automatically when the work is actually sent or finished, so the board always matches reality. Filter by client. On mobile, one column at a time with a switcher at the top.

### M2. Clients and the client page

- **Clients:** a list of cards, one per client: name, photo, status (Setting up, Free 2 weeks, Active, Paused), and the next thing that needs doing.
- **Client page:** like a LinkedIn profile. A header with name, photo, role, status and setup progress, then sections:
  - **Overview:** goals, **off limits** (shown prominently), this week's targets vs done, what they let us do, how they review (frequency, "Wait for me" or "Go ahead after 24 hours"), in their field this week.
  - **Plan:** strategy and content plan.
  - **Content:** drafts, waiting for the client, scheduled, live.
  - **Engagement:** this week's targets and progress.
  - **Brand:** everything from the client's Your brand, with new Moments highlighted.
  - **Calls and notes:** both calls, transcripts or written notes, summaries.
  - **Activity:** everything done on the account.
- On mobile, sections are a short menu at the top of the page.

### M3. Onboard a client

- **Goal:** from goals call to approved strategy in about 1 week, with the platform doing the heavy research.
- **Steps (Stepper):**
  1. **Before the goals call:** a prep sheet. A summary of the client's current LinkedIn profile and questions to ask.
  2. **After the goals call:** the transcript arrives, or the manager writes up the notes if the client declined recording. The AI summarises goals, audience, tone and **off limits** (topics, people, companies and interactions the client does not want). The manager corrects and confirms. Off limits are saved to the client's Your brand, where the client can see and edit them.
  3. **Set up listening:** the AI suggests topics and keywords (including location). The manager creates the Google Alerts and pastes each alert's feed link in. See M7.
  4. **Research, audit and strategy:** the AI researches the field (with sources), audits the profile and drafts the strategy. The manager directs ("make topic 2 about X", "the tone is too formal") until it is right, then shares it with the client before the strategy call.
  5. **After the strategy call:** the client may have changes or corrections from the call. The manager adjusts the strategy first, then sends it as "What we agreed" for the client to approve. Nothing is implemented until the client approves.
  6. **Approved:** the approved strategy creates the content plan and the weekly targets. Work starts.
- **The strategy is detailed and measurable.** It sets out how we reach the goal from the goals call, in numbers both sides can track. For example: weeks 1 to 2, 2 posts a week (1 story post, 1 opinion post), 10 comments a week on posts from target people, 15 connection requests a week; from week 3, 3 posts a week and 1 article a month. These targets drive the manager's weekly work (M1), engagement (M6), what the client sees as done vs promised (C9), and the weekly update (M8).

### M4. Plan and draft content

- **Goal:** a ready set of posts for the client to review, on the rhythm the client chose (weekly, twice a week, or each post).
- **Steps:**
  1. **Ideas:** the AI proposes topics for the period, each with its reason: the goal it serves, a signal from their field, a Moment the client added, or a past preference. Nothing that touches the client's off limits is proposed. The manager picks, changes or asks for more.
  2. **Drafts:** written in the client's voice. The manager directs ("shorter", "open with the story"), edits, and sees versions and the character count.
  3. **Visuals:** open by design, because the right visual depends on the post. For each post the AI suggests what would work and why, for example: the client's event photo from their Brand, text on a brand-coloured background, a carousel or quote card from one of the client's templates, a relevant video already doing well online, or no visual at all. The manager creates, sources or uploads the actual image, carousel or video and attaches it. Each client keeps a template library (carousels, quote cards, image layouts) the manager builds over time. An optional simple text-graphic maker is there for quick cards, never applied by default.
  4. **Checks:** flags for anything touching the client's off limits, risky claims, banned phrases, generic writing, repeats of an old post, missing image descriptions. Each must be fixed or dismissed with a reason. Off-limits flags cannot be dismissed, only fixed.
  5. **Send to the client:** with a due time and a short "why this post" note for each.

### M5. After the client reviews

- **Approved:** the platform suggests the best time to post (from what works on LinkedIn for this client). The manager confirms or changes it. The client's local time and the manager's time are both shown.
- **Changes asked for:** the client's feedback becomes a short list of changes. Fix them (with AI help), tick each one off, send back.
- **No reply:** under "Wait for me" the post is held and shows in the weekly update as waiting on the client. Under "Go ahead after 24 hours" it is approved automatically and scheduled.
- **Live posts:** fix requests (urgent), posts the client took down, failed posts with the reason and a retry.
- **On hold:** if the client pauses, removes a permission or the account is paused, scheduled posts hold automatically. Nothing for the manager to do.

### M6. Weekly engagement

- **Steps:**
  1. **This week's brief:** who to look for and which conversations to join, based on the goal and signals from their field.
  2. **Add what you find:** paste a profile or post link. The platform rates the fit and says why, and warns if it touches the client's off limits (a topic, person or company to avoid). Keep or drop.
  3. **Drafted comments and connection notes** in the client's voice. Routine likes and comments follow the client's review setting; others go to the client for approval.
  4. **Client quick tasks:** connection requests (person, profile link, why they matter, ready-written note) and other steps LinkedIn does not allow us to do, such as profile updates. The platform prepares them when the strategy calls for them; the manager reviews and sends them to the client (C17). Progress comes back as the client marks each one done.
  5. **Progress:** done vs this week's target.

### M7. Listening for a client

- **Goal:** keep the platform aware of what is happening in the client's field.
- **Steps:** the client's listening topics (suggested by the AI, editable). Google Alert feeds: add, check they are working, remove. "Add what I found": a link or a short note from the manager's own browsing. The latest signals, each with its source.
- **Lives in:** the client page, and a reminder card on Home if a client has no working alerts.

### M8. Weekly and monthly updates

- **Steps:** the AI drafts the update: what we did vs the plan, best posts, progress toward the goal, anything held back and why, what is happening in their field, next week's focus. The manager adds a personal note and sends. The monthly update compares with last month and shows the trend toward the goal.

### M9. Messages

- **Steps:** one conversation per client. Text, files and voice notes. Save a client's file to their Brand with one tap. Ask the client for a one-off permission from here.

### M10. My calls and profile

- **Availability:** each manager sets their open call slots when they create their account (P4), and keeps them up to date here, like a calendar. Clients can only book inside these slots.
- **Calls:** all booked calls in a simple list by day, with Join links and prep notes. Once a client books, the manager is committed to attend. If something changes, the manager reschedules from their side: the client is notified and picks a new time from the open slots.
- **Profile:** name, photo, short intro (shown to clients when booking), time zone, 2FA, notifications, connect Google Calendar.

### Decided

- The platform suggests a manager for each new client (by capacity and experience). The owner confirms, or picks someone else by hand (A2).
- Managers open their call slots when they join. Clients book inside them. Once booked, the manager attends or reschedules from their side.
- Managers see only a client's status (Free 2 weeks, Active, Paused), never prices or payments.
- Maximum 10 clients per manager.

---

## 6. Admin flows

**Status:** Approved.

**Who:** the owner (the strategist). Runs the business: people, clients, the framework, money and rules.

**Layout:** a dashboard, the only one in the product. Side navigation on desktop (Overview, Clients, Managers, Framework, Money, Complaints, Settings, Audit log), a menu button on mobile. Tables with filters, a few clear numbers at the top of each page. Same design system, same calm look. Works on a phone for quick actions (confirm an assignment, approve a refund).

### A1. Overview

- **Goal:** in one look, know what needs the owner today and which accounts are at risk.
- **Top: needs you today:** clients waiting for a manager, new managers waiting for training, clients who just asked to pull out, refunds to approve, open complaints, manager change requests, repeated missed deadlines.
- **Numbers:** active clients, clients in their free 2 weeks, paused accounts (with days paused), share of posts approved first time, delivery vs targets this week.
- **At risk:** clients behind on their targets, slow to review, paused, or with a complaint. Each links to the client.

### A2. Clients

- **List:** every client with status (Setting up, Free 2 weeks, Active, Paused, days paused), manager, goal progress, targets vs done this week, and an at-risk flag. Filters by status and manager.
- **Assign a manager:** for each new client the platform suggests a manager, with the reasons (free capacity, industry experience, time zone). The owner confirms, or picks someone else from the list. Managers at their maximum (10) are shown but cannot be chosen.
- **Client view:** the owner can open any client and see the same client page the manager sees (M2), including messages.
- **Step in for a manager:** when a manager cannot or does not do the work, the owner clicks "Step in for [manager]" on one client, or on all of that manager's clients at once.
  - The owner works in the manager's exact workspace for those clients, with the same powers, limited by the same client permissions. A small banner shows "You are covering for [manager]".
  - Nothing changes for the client. Posts, comments and scheduling carry on as normal. In the client's activity log, staff actions show as "Your account team". Messages sent while covering are signed "Your account team".
  - Inside Bluecut the record stays true: the audit log, complaint timelines and the manager's numbers show that the owner did the work.
  - "Stop covering" hands back to the manager, or the owner reassigns the client (A3).
- **The owner can also be assigned clients directly** and run them from the manager view.

### A3. Managers

- **List:** each manager with status (Invited, Waiting for training, Active, Suspended), number of clients out of 10, on-time delivery, first-time approval rate, missed deadlines, complaints.
- **Invite:** name and email. They get a single-use link valid for 7 days and set themselves up (P4).
- **Training:** after setting up their account, each new manager has a 60-minute onboarding training video call with the owner (held off the platform). The owner sets the call date, then marks "Training done". Only then can the manager be assigned clients. Until then the manager's Home shows their training call and nothing else.
- **Manager page:** their clients, availability, performance over time, missed-deadline reasons, complaints.
- **Change a client's manager:** only when the client asks, after a complaint about the manager, or for a no-show. The platform prepares a handover summary (strategy, plan, open work, recent feedback, off limits) for the new manager. The client is told who their new manager is.
- **Suspend:** access ends at once. Their clients are listed for reassignment, with suggestions.
- **Payouts:** each manager's active clients for the period, the payout amount, approve.

### A4. Framework

- **Goal:** the owner's method, written down so every manager and every AI proposal follows it.
- **Library:** strategy templates, topic models, post formats, tone rules, banned phrases, quality checks, industry rules (for example health and law, with restricted claims and required disclaimers).
- **What works on LinkedIn:** the owner's up-to-date notes on what LinkedIn currently rewards (formats, timing, length, engagement). Used for every proposal (section 7).
- **Versions:** every change is saved as a new version. Each client's strategy records the version it was built on.

### A5. Money

- **Contracts:** every contract with status (Free 2 weeks, Active, Ending soon, Paused, Completed, Cancelled), plan, dates, paid or not. Extend a contract or add a credit, with a required note.
- **Payments:** payments, failed payments, invoices.
- **Refunds:** each refund with the calculation (months not yet started). Refunds below an amount the owner sets are approved automatically. Larger ones wait for the owner to approve or decline with a reason. Approved refunds are paid automatically and the client is told.
- **Why clients pull out:** every cancellation reason, with a simple count by reason over time. Each one links to the client so the owner can follow up.

### A6. Complaints

- **List:** open complaints and manager change requests, newest first.
- **Complaint page:** a timeline of everything relevant: approvals, activity, messages, who was waiting on whom. The platform shows whether a delay was on the client or the manager.
- **Outcome:** no action, credit, partial refund, warning to the manager, or change of manager. The outcome is sent to the client.

### A7. Settings

- Plans and prices (US dollars as the base; local currency handled by Stripe), automatic refund limit, length of the free period (2 weeks), payment reminders (5, 3 and 0 days), pause warning (15 days) and removal (30 days), "Go ahead" wait (24 hours), maximum clients per manager (10), days between calls (3), service targets, staff session timeout. Changes apply to new contracts only.

### A8. Audit log

- Every admin and system action: who, what, when. Includes assignments, refunds, setting changes and account deletions. Filter and export.

### Decided

- The owner can step in for any manager through the manager's workspace, without the client noticing a change, while internal records show who really did the work.
- The owner can be assigned clients directly.
- Manager training is a 60-minute onboarding video call off the platform. Managers get clients only after the owner marks training done.
- Refunds below a set amount are automatic; larger ones need the owner. A reason for pulling out is always collected.

---

## 7. Niche listening (in-house, runs in the background)

- **Goal:** everything we propose is based on the client's goal **and** on what is happening in their field, their location and on LinkedIn right now, so the strategy works in practice and keeps improving.
- **Not client facing.** Clients never see this as a feature or as AI. They see its results through their manager (better topics, timely posts, a line in the weekly update).
- **Sources:**
  1. **Google Alerts:** the account manager creates alerts for each client's topics by hand and adds each alert's feed to the client in the platform. The platform reads them continuously.
  2. **What the manager finds:** the manager browses LinkedIn and the web in the client's niche and adds what people are discussing ("Add what I found": a link or a short note). The AI uses it to suggest ideas.
  3. **Web and news search** for the client's topics, people and companies, including location-specific conversations (for example Lagos fintech, not only fintech).
  4. **The client's own results:** what is working on their profile and what is not.
  5. **How LinkedIn behaves:** a maintained knowledge base of what LinkedIn's algorithm currently rewards (formats, timing, length, engagement patterns), kept up to date by the owner.
  6. **The client's preferences:** what they ask for, approve and reject in reviews.
- **How it learns:** all of the above is stored per client and used every time the AI proposes something (retrieval from a per-client knowledge base). The strategy keeps evolving instead of staying fixed after onboarding.
- **Where it shows up (staff only):**
  - **Content plan (M4):** topic options tied to a signal, for example "3 founders in Lagos posted about X this week, a reaction post fits topic 2".
  - **Weekly engagement (M6):** conversations and people worth engaging with.
  - **Strategy:** when the field shifts or results stall, a suggested strategy update for the manager to review and the client to approve.
  - **Manager client page (M2):** "In their field this week".
- **Where clients feel it:** the manager's "why this post" note (C7) and "What is happening in your field" in the weekly update (C9), written as the manager's insight.
- **Rules:** every signal shows its source. Nothing is posted because of a signal without the full review path.

## 8. Content lifecycle

From the PRD, with today's additions marked **new**.

| State | Meaning | Moves to |
| --- | --- | --- |
| AI draft | Drafted by the AI | Manager review |
| Manager review | Manager directs, edits and checks | Awaiting client, or Approved if it is a "Go ahead without asking" type |
| Awaiting client | Sent for the client's review | Approved, Changes requested, or Approved automatically if the client chose "Go ahead if I have not replied" and 24 hours passed (**new**) |
| Changes requested | Client asked for changes | Manager review |
| Approved | Ready to schedule | Scheduled |
| Scheduled | Will go out at a set time | Published, Failed (after 3 tries), On hold |
| On hold | Client paused posting, removed a needed permission, or the account is paused (**new**: unpaid or contract ended) | Scheduled when restored, or Manager review if the date has passed |
| Published | Live on LinkedIn | Taken down (**new**) |
| Failed | LinkedIn rejected it 3 times | Manager review |
| Taken down (**new**) | Client removed it from LinkedIn | End |

Editing approved content sends it back to Awaiting client. Content Awaiting client past its due time under "Wait for me" is held and reported as waiting on the client. The contract keeps running while content is held.

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
| Research | One-off at onboarding, plus a weekly engagement brief | Continuous niche listening (manager-created Google Alerts, manager findings, web and news search including location, LinkedIn algorithm knowledge, the client's results and preferences) stored per client and used for every proposal |
| Who decides | Manager reviews AI output | AI proposes, manager directs and reviews, client approves (per their review setting) |
| AI visibility | AI notetaker and AI features named | AI is in-house only. Never mentioned to clients or on the marketing page |
| Manager changes | Admin reassigns as needed | Same manager for the life of the account, including renewals. Changes only on client request, a complaint about the manager, or a no-show |
| Paused accounts | Data kept 30 days after trial end | Reminders, a warning at 15 days, removal and full data deletion at 30 days. Coming back means starting again |
| Strategy | Pillars, tone and cadence | Detailed and measurable: weekly targets by period, tracked by client and manager. Adjusted after the strategy call before the client approves |
| Off limits | Topics to avoid in the intake form | A dedicated Off limits list in Your brand, captured on the goals call, checked against every post and engagement |
| Call slots | From manager availability | Managers open slots when they join; clients book inside them; managers must attend or reschedule from their side |
| Assigning managers | Admin assigns | Platform suggests a manager by capacity and experience; the owner confirms or picks someone else |
| Manager tasks | Task queue | Feed view and Board view of the same tasks |
| Client co-pilot tasks | Weekly connection list handed to the client | "Quick tasks for you": timed by the strategy, 1 to 3 minutes each, copy-ready notes, mark as done, send to an assistant by email |
| Owner stepping in | Not covered | "Step in for a manager": the owner works through the manager's workspace; client sees no change; internal records stay true |
| Manager training | In-app modules and test | 60-minute onboarding video call off the platform; owner marks training done before any client is assigned |
| Refunds | Every refund approved by the owner | Automatic below a set amount; reason for pulling out always collected, with one offer to fix it first |
| Live posts | No client action | Client can take a post down now or ask for a fix |
| Client account states | Trial, Onboarding, Active, Paused, Ended | Setting up, Free 2 weeks, Active, Paused (by client, unpaid or contract ended), Ended |

---

## 10. Open questions

Client and public flows approved. Manager questions are in section 5.

**Resolved:** 3 days between calls; free 2 weeks start at signing; "Go ahead" wait fixed at 24 hours; client approval is the only validation step (no separate owner check); held content is on the client and the contract keeps running; recording needs consent, and without it the manager writes up the notes; same manager while paused and on renewal; 15-day warning and 30-day removal, keeping only invoices and payment records; reminders at 5 days, 3 days and the last day; navigation; content lifecycle; white logo (to be added to the design system in Claude, then synced).

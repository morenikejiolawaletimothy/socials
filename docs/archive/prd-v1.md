# Bluecut Socials PRD: LinkedIn Account Management Platform

Oct 17, 2026 · @Fola

## 1. Overview

Bluecut Socials is a LinkedIn account management platform that lets one strategist run her proven personal brand framework across many clients, using AI for research and content and account managers as the human check before anything goes live.

**Problem for the strategist.** She can only manage a few client profiles because everything is manual. Onboarding one client takes 2 to 3 weeks: two discovery calls (about 1.5 hours and 1 hour), industry research and audits between calls, then building the brand strategy and content pillars. Learning an unfamiliar industry well enough to write credible content is the biggest single drain. Hiring other strategists does not solve it, because they cannot reproduce her framework however well it is documented.

**Problem for the client.** Senior professionals will pay for LinkedIn positioning, but they worry about account security, data privacy and handing their reputation to a stranger. They want real results tied to their goals, not generic AI posts or vanity metrics, and they want to stay in control of what the manager can do on their account.

**Solution.** The platform encodes the strategist's framework into an AI workflow that runs onboarding research, profile audits, strategy, content calendars, drafts and design assets. An assigned account manager reviews and adjusts everything, then the client approves before it is published. Clients authorise LinkedIn through its official sign-in, set permission levels and can revoke access at any time. Contracts, payments, refunds and disputes are handled in the app, with every action logged so accountability is clear.

Sources: the two Aug 24 sessions, "Discussion: Social Media Management Challenges" and "Planning: Social Media Management Solution".

## 2. Goals, non-goals and success metrics

The product succeeds when one account manager can run 5 to 10 client accounts to the strategist's standard, and clients reach the goals agreed at onboarding.

**Goals**

- Let the strategist scale past a handful of clients without lowering quality.
- Cut onboarding below the current manual 2 to 3 weeks by having the AI draft research, audits and strategy for the manager to direct and refine.
- Make the framework the system, so output quality does not depend on who the account manager is.
- Give clients full control and visibility over access to their LinkedIn account.
- Measure success against each client's goals, not likes and follower counts.

**Non-goals for v1**

- Platforms other than LinkedIn (X and others come later).
- Fully automated posting with no human review.
- Monthly billing. Contracts are 3, 6 or 12 months.
- Results-based or pay-on-results pricing; contracts are fixed-term and paid up front.
- A self-serve tool for clients to manage their own content without an account manager.

**Proposed product metrics** (targets to be set after the pilot)

| Metric | What it shows |
| --- | --- |
| Active client accounts per account manager | Whether the platform delivers scale (target range 5 to 10) |
| Days from contract start to first approved post | Onboarding speed against the 2 to 3 week manual baseline |
| Share of content approved by the client on first submission | Draft quality and fit with the client's voice |
| Median client approval turnaround | Friction in the review loop |
| Share of clients meeting their goal metrics at contract end | Real results |
| Trial to contract conversion | Whether the trial proves value |
| Refund and dispute rate | Trust and service quality |

## 3. User roles

Three human roles use the platform, and the AI system acts as a fourth actor that never publishes without human approval.

| Role | Who they are | Core jobs | Access |
| --- | --- | --- | --- |
| Admin (strategist) | The founder who owns the framework | Configure the framework, onboard and assign account managers, oversee all accounts, approve refunds, resolve disputes | All accounts and settings, but never above a client's own permission limits |
| Account manager | A trained operator, not necessarily a professional strategist | Run assigned client accounts: review AI output, adjust, request approval, publish and engage within permissions | Only assigned clients, only the actions each client allows |
| Client | Senior professionals (CEO, co-founder, CTO, senior staff) and businesses or startups, worldwide | Complete onboarding, connect LinkedIn, set permissions, approve content, give feedback, pay, view results | Own account, contract, content, activity log and reports |
| AI system | The platform's built-in agent | Research, audit, draft strategy, calendar, posts and assets, summarise feedback, flag risks, track delays | Read client data needed for the task; writes drafts only |

**Client personas**

- **Starting out:** does not know how to set up or manage a LinkedIn profile.
- **Inconsistent:** has a profile but cannot keep up posting and engaging.
- **Lost traction:** chased vanity metrics before and saw reach fade.
- **Regulated:** works in health or law, where strict rules govern what can be said online.

What they share: their livelihood depends on visibility, they can afford to pay, and they are too busy or unsure how to do it themselves.

## 4. Scope, assumptions and conventions

Version 1 covers LinkedIn only, for clients anywhere in the world, built end to end in Lovable (front end, back end, in-app AI and an MCP connection to LinkedIn).

**LinkedIn integration.** All actions on a client's account go through LinkedIn's official API after the client authorises the app through LinkedIn's own OAuth consent screen; the open w\_member\_social permission covers posting, commenting and liking on the client's behalf. The platform never stores passwords or session cookies and never drives the client's logged-in browser. Actions the API does not support (reading the feed, finding target profiles, sending connection requests, editing the profile) are handled as co-pilot steps: the platform suggests and drafts, and the client or account manager applies them. Both the client's personal profile and their company Page are supported at launch; company-Page posting uses LinkedIn's Community Management API, which Bluecut applies for before launch (a 1 to 4 week approval).

**Assumptions**

- Every piece of content is reviewed by an account manager and approved by the client, or falls under a category the client has explicitly left to the manager's discretion.
- Contracts run 3, 6 or 12 months, preceded by a 2-week free trial.
- Clients can end a contract at any time and are refunded for unused months.
- LinkedIn access is granted by the client from their own device; staff never see login details.
- Both personal profiles and company Pages are in scope at launch; the Community Management API approval for company Pages (1 to 4 weeks) is applied for before launch, while personal-profile posting, commenting and liking need no approval.

**How to read the stories**

- Each story reads: As a \[role\], I want \[capability\], so that \[benefit\].
- IDs follow the epic number (US-5.3 is the third story in Epic 5).
- Priority: **P0** is required for launch, **P1** follows soon after, **P2** is later.
- Acceptance criteria sit under each story and define done for design, development and QA.

## Epic 1. Sign-up, authentication and roles

Each role gets its own secure entry point and sees only its own workspace.

**US-1.1 (P0)** As a client, I want to sign up with my email or Google account, so that I can start a free trial.

- Fields: full name, work email, password (min 12 characters), country, time zone.
- Email verification is required before onboarding opens.
- Duplicate email shows an inline error with a link to sign in.

**US-1.2 (P0)** As an account manager, I want to join only through an admin invitation, so that unvetted people cannot reach client accounts.

- Invite link is single use and expires after 7 days.
- No public sign-up route exists for the account manager or admin roles.

**US-1.3 (P0)** As any user, I want two-factor authentication, so that my account stays safe if my password leaks.

- Required for admins and account managers; offered and recommended to clients.
- Authenticator app supported at launch; backup codes generated at setup.

**US-1.4 (P0)** As any user, I want to reset a forgotten password, so that I can get back in without contacting support.

- Reset link expires after 1 hour; all other sessions end after a reset.

**US-1.5 (P0)** As the admin, I want role-based access enforced on every page and API call, so that each user only sees what their role allows.

- Account managers see only clients assigned to them.
- Direct links to pages outside a user's role return a "no access" page, not data.

**US-1.6 (P1)** As any user, I want to see my active sessions and sign out of all devices, so that I can lock down my account quickly.

- Idle sessions time out after a period the admin sets (default 30 minutes for staff).

**US-1.7 (P1)** As any user, I want to manage my profile, time zone and notification preferences, so that the platform fits how I work.

**US-1.8 (P1)** As a client, I want to export my data and delete my account after my contract ends, so that I control my information.

- Deletion is blocked while a contract is active, with a prompt to terminate first.
- Export includes strategy, content, reports, activity log and invoices.

## Epic 2. Plans, free trial and contracts

Clients try the service free for 2 weeks, then commit to a 3-, 6- or 12-month contract they can end at any time.

**US-2.1 (P0)** As a prospective client, I want to compare the 3-, 6- and 12-month plans, so that I can choose the commitment that suits me.

- Each plan shows price, term, what is included and the refund rule in plain language.
- Prices show in the client's local currency (for example Naira, US dollar, Canadian dollar).

**US-2.2 (P0)** As a client, I want a 2-week free trial before I pay, so that I can see how the service works before committing.

- The trial is the full service, so the client experiences exactly what they would pay for: week one is onboarding, week two is the first live activity (such as posting and engagement).
- No card or payment detail is required to start the trial.
- A banner shows days left in the trial on every client page.
- At the end of week two the client is asked to accept the contract and pay to continue.

**US-2.3 (P0)** As a client, I want to review and accept the contract terms in the app, so that I know exactly what I am agreeing to.

- Terms show start date, end date, plan, price, deliverables from the approved strategy and the refund rule.
- Acceptance is recorded with name, timestamp and terms version.

**US-2.4 (P0)** As a client, I want my trial to end cleanly if I do not convert, so that nothing continues without my consent.

- At trial end with no contract: scheduled posts are cancelled, LinkedIn access is paused, data is kept for 30 days (period set by admin).

**US-2.5 (P1)** As a client, I want a reminder before my contract ends, so that I can renew or finish on my terms.

- Reminders at 14 and 3 days before end; renewal keeps the same strategy, calendar and account manager.

**US-2.6 (P1)** As the admin, I want to limit each person to one free trial, so that the trial is not abused.

- One trial per LinkedIn profile and per email; repeat attempts are blocked with a clear message.

**US-2.7 (P0)** As the admin, I want to view and manage every contract, so that I can see status, terms and history in one place.

- Filter by status: trial, active, ending soon, terminated, completed.
- Admin can extend a contract or apply a credit, with a required note.

## Epic 3. Client onboarding and discovery

Onboarding mirrors the strategist's manual method (intake, first discovery call, research, second call, signed-off decisions), with the platform doing the research in between.

**US-3.1 (P0)** As a client, I want to complete a guided intake form, so that my account manager understands me before our first call.

- Sections: goals for the next 3 and 6 months, industry and role, target audience, current challenges, past LinkedIn efforts, competitors or people I admire, topics to avoid, compliance rules in my field.
- Progress saves automatically; the client can leave and return.
- Required fields are marked; the form cannot be submitted with gaps.

**US-3.2 (P0)** As a client, I want to upload my brand assets, so that content looks and sounds like me.

- Accepts headshots, logos, colours, fonts, past posts and writing samples (JPG, PNG, PDF, DOCX; max 20 MB per file).

**US-3.3 (P0)** As a client, I want to book my first discovery call (about 90 minutes) from available slots, so that scheduling is simple.

- Slots come from the account manager's availability, shown in the client's time zone.
- Calls run on an external tool, Google Meet by default (Zoom and Teams supported), with the AI notetaker joining.
- Calendar invite and reminders go to both parties.

**US-3.4 (P0)** As an account manager, I want the discovery call captured automatically by an AI notetaker and fed to the platform AI, so that what the client said becomes context without manual work.

- An AI notetaker (for example Grain, Fireflies or Gemini) joins the booked call, records it and returns a transcript.
- The client is told the call will be recorded and agrees before the bot joins; without consent the call runs unrecorded and notes are added manually.
- The transcript is sent to the platform AI, which produces a structured summary: goals, audience, tone, constraints, open points.
- Manual upload or paste stays available as a fallback for any call the bot did not attend.

**US-3.5 (P0)** As an account manager, I want AI-generated follow-up questions after research, so that the second call fills the right gaps.

- Questions are grouped by theme and editable before the call.

**US-3.6 (P0)** As an account manager, I want to run the second discovery call (about 60 minutes) against an agenda, so that we agree content pillars, direction and major decisions.

- Agenda includes draft pillars, proposed positioning and decisions needing client input.

**US-3.7 (P0)** As a client, I want a written record of what we agreed sent to me to confirm, so that there is no confusion later.

- Summary lists decisions, changes and next steps; the client taps Confirm or Request correction.
- Confirmed records are locked and versioned; corrections create a new version.

**US-3.8 (P0)** As a client, I want to set which decisions need my approval and which my manager can make alone, so that I keep control without micromanaging.

- Defaults: headline, About section and sensitive topics always need approval; likes and routine comments are manager discretion.
- The client can change these at any time; changes apply to new items only.

**US-3.9 (P1)** As any role, I want an onboarding checklist with progress, so that everyone knows what is done and what is next.

- Steps: intake, assets, LinkedIn connected, call 1, research, call 2, decisions confirmed, strategy approved.

## Epic 4. AI research, audit, strategy and metrics

Every step here is co-pilot and human-in-the-loop: the account manager runs and directs the work, the AI does the heavy lifting the strategist used to do by hand, shaped by her framework, and the manager reviews and adjusts it before the client sees it. Nothing runs on its own.

**US-4.1 (P0)** As the admin, I want to encode my framework in the platform, so that every account follows my method regardless of who manages it.

- Editable library of: strategy templates, positioning formulas, content pillar models, post formats, tone rules, banned phrases and quality checklists.
- Industry rule sets (for example health and legal) with restricted claims and required disclaimers.
- Changes are versioned; each client strategy records which framework version produced it.

**US-4.2 (P0)** As an account manager, I want to run AI-assisted niche research on my client's field, so that I can understand an industry I am not an expert in.

- Output: industry overview, key terms glossary, trends, notable voices, active communities and hashtags, common audience questions.
- Each finding links to its source; unsourced claims are labelled.

**US-4.3 (P0)** As an account manager, I want an audit of the client's current LinkedIn profile, so that I know what to fix first.

- Covers photo, banner, headline, About, experience, featured section, skills and recent activity.
- Each item gets a rating (strong, needs work, missing) and a specific recommendation.
- The platform never alters the client's existing connections, posts or messages; it shows the current state and recommends changes, and the client decides what to act on.

**US-4.4 (P1)** As an account manager, I want a benchmark of comparable profiles in the client's field, so that positioning stands out.

**US-4.5 (P0)** As an account manager, I want the system to draft a full strategy from the intake, calls and research, so that I start from a strong first version.

- Includes positioning statement, audience, 3 to 5 content pillars, tone of voice, and weekly cadence (posts, comments, connection requests, articles or newsletter).
- Every section is editable; regenerate a single section with instructions.

**US-4.6 (P0)** As a client, I want metrics tied to my goals explained in plain language, so that I measure what drives results rather than vanity numbers.

- Each goal maps to 1 to 3 metrics with a reason (for example: goal "board roles" maps to relevant profile views and inbound invitations).
- Vanity metrics are shown as secondary, with a note on why they are not the target.

**US-4.7 (P0)** As a client, I want to review and approve the strategy and roadmap, so that work starts only on a direction I agree with.

- Client can approve, comment on sections, or request changes.
- Approval unlocks calendar generation and the contract offer.

**US-4.8 (P1)** As an account manager, I want to revise the strategy when goals change mid-contract, so that the plan stays relevant.

- A revision creates a new version and requires client approval; the calendar updates only from the approval date forward.

## Epic 5. Content calendar and content generation

Once the strategy is approved, the system builds a calendar for the full contract and drafts content in batches that the account manager refines.

**US-5.1 (P0)** As an account manager, I want a content calendar generated for the contract term, so that every week is planned against the pillars and cadence.

- Each slot holds date, time, pillar, format, topic and goal it supports.
- Pillars are balanced across each week according to the strategy.

**US-5.2 (P0)** As any role, I want month, week and list views of the calendar, so that I can plan and track at the level I need.

- Filter by pillar, format and status; drag a slot to move it (staff only).

**US-5.3 (P0)** As an account manager, I want AI drafts written in my client's voice, so that I edit rather than write from scratch.

- Formats: text post, image post, carousel, article, newsletter edition.
- Drafts follow the framework's tone rules and the client's writing samples.
- Character counts shown against LinkedIn limits for each format.

**US-5.4 (P0)** As an account manager, I want the app to suggest the visual direction for each post and hold the client's brand kit and templates, so that I can create or source the right asset without starting cold.

- For each post the app proposes a visual concept: the asset type (client photo, event photo, quote card, carousel, simple graphic), any on-image text, and how it should fit the client's brand.
- The app stores the client's brand kit (colours, fonts, logo, photos) and saved templates so the manager is not starting cold each time.
- The manager creates, sources or uploads the actual asset (the client's own photo, an event photo, a Canva file, an existing template) and attaches it to the post.
- An optional simple-graphic generator is available for straightforward cards (a quote or text graphic); the manager chooses when to use it, and it is never applied by default.

**US-5.5 (P0)** As an account manager, I want to edit a draft or regenerate it with instructions, so that it fits the goal and pillar exactly.

- Rich text editor, version history and side-by-side compare.

**US-5.6 (P0)** As an account manager, I want to generate and review a full batch (default one week), so that clients get one review session instead of many interruptions.

- Batch size set per client (weekly or as agreed).

**US-5.7 (P0)** As an account manager, I want automatic quality checks before submission, so that weak or risky content is caught early.

- Flags: restricted claims for regulated industries, banned phrases, generic AI-sounding language, off-pillar topics, near-duplicates of past posts, broken links, missing alt text.
- Flags must be resolved or dismissed with a reason before submission.

**US-5.8 (P1)** As an account manager, I want profile improvement drafts (headline, About, banner, featured), so that the profile matches the new positioning.

- Always requires client approval and profile-edit permission.

**US-5.9 (P1)** As any role, I want a searchable library of all past content, so that we can reuse what worked and avoid repeats.

## Epic 6. Engagement and opportunity scouting

Visibility comes from engaging the right people, not only posting. LinkedIn's API cannot read the feed or search profiles, so the finding is done by a person, not a bot: the account manager searches on their own LinkedIn and the open web, guided by a standardised brief from the client's framework. The manager brings candidates back into the platform, which scores them against the framework, drops the weak ones and drafts the words. Comments and likes then go out through the API; connection requests are a one-tap action for the client. The judgment and the quality bar live in the platform, so output stays consistent whoever the manager is.

**US-6.1 (P0)** As an account manager, I want a weekly search brief generated from the client's goal and framework, so that I know exactly what to look for and quality does not depend on my own taste.

- The brief states who to look for (role, industry, seniority, region, recent activity) and which post topics and voices to engage, all derived from the client's goal.
- It is built from the admin's framework, so every manager works to the same standard.
- The manager does the searching on their own LinkedIn and the open web; the platform never searches or scrapes through any LinkedIn account.

**US-6.2 (P0)** As an account manager, I want to drop the people and posts I find into the platform and have it score them against the framework, so that only strong, on-goal targets reach the client.

- The manager adds a profile or post link; the platform rates its fit against the client's goal and framework and flags weak ones.
- Each kept target shows why it fits (audience match, industry, influence, recency) and can be accepted or dismissed; dismissals sharpen future briefs.
- The platform drafts the connection note or comment in the client's voice and pillar.

**US-6.3 (P0)** As an account manager, I want approved engagement to go out the right way for each action type, so that the client's part stays tiny.

- Comments and likes post through the API; routine ones follow the client's discretion setting (US-3.8), higher-stakes ones follow the normal review path.
- Connection requests have no API, so the platform hands the client a finished weekly list (person plus note) to send from their own account or pass to their assistant.
- Weekly totals stay within the strategy cadence and LinkedIn limits.

**US-6.4 (P1)** As a client, I want relevant opportunities surfaced (events, speaking slots, podcasts, awards, publications), so that I am positioned where it counts.

- Each item shows date, location or format, fit reason and a link; client marks Interested or Not for me.

**US-6.5 (P1)** As an account manager, I want communities and groups to join, so that the client reaches engaged audiences.

**US-6.6 (P0)** As any role, I want engagement logged against weekly targets, so that we can see delivery versus plan.

- Shows comments, likes and connection requests done versus target for the week.

## Epic 7. Review, approval and feedback

Nothing goes live on a client's account without account manager review and, unless the client delegated it, client approval.

**US-7.1 (P0)** As an account manager, I want to submit a batch for client approval, so that the client reviews everything in one sitting.

- Client gets an email and in-app notice with the batch, due date and a one-tap link.

**US-7.2 (P0)** As a client, I want to approve, reject or request changes on each item, or approve the whole batch, so that review is fast.

- Preview shows the item as it will appear on LinkedIn, on desktop and mobile.
- Approve all asks for a single confirmation.

**US-7.3 (P0)** As a client, I want to give feedback by typing or recording a voice note, so that I can respond in whatever way is quickest.

- Voice notes are transcribed; the client can edit the transcript before sending.
- The system turns feedback into a clear list of change points for the account manager.

**US-7.4 (P0)** As an account manager, I want to apply feedback with AI help and resubmit, so that revisions are quick and traceable.

- Each change point is marked done; the client sees a before and after view.

**US-7.5 (P0)** As a client, I want items in my discretion categories to skip approval, so that routine work flows without me.

- Skipped items still appear in the activity log and the weekly report.

**US-7.6 (P0)** As an account manager, I want approval deadlines and automatic reminders, so that the schedule does not slip silently.

- Reminders at 24 hours before the deadline and at the deadline.
- Unapproved items are never published automatically; the slot is marked "waiting on client" and counted as client-side delay (Epic 12).

**US-7.7 (P0)** As any role, I want a full approval history per item, so that there is a clear record of who approved what and when.

## Epic 8. Secure account access and permissions

Clients connect LinkedIn from their own end, decide exactly what their manager can do, see every action taken and can cut access instantly.

**US-8.1 (P0)** As a client, I want to connect my LinkedIn account without sharing my password, so that no one at the agency ever sees my login.

- Connection uses LinkedIn's own sign-in and consent screen on the client's device.
- A client who manages a company Page can connect it the same way, for posting to the Page.
- Access tokens are encrypted and never shown to any user, including the admin.

**US-8.2 (P0)** As a client, I want to set permission levels for my account manager, so that they can only do what I allow.

| Permission | Default | Notes |
| --- | --- | --- |
| Create and schedule posts | On | Posted through LinkedIn's API |
| Post to company Page | Off | Client connects the Page; uses the Community Management API |
| Like and comment | On | Through LinkedIn's API |
| Send connection requests | Off | No API; platform drafts, client sends |
| Edit profile (headline, About, experience) | Off | No API; platform drafts, client applies; each edit needs approval |
| Account and privacy settings | Blocked | Never available to staff |

**US-8.3 (P0)** As an account manager, I want to act on the client's account only through the platform's API connection, so that I never see the client's login or browser session.

- The manager composes and approves inside the platform; the platform makes the LinkedIn API call.
- Actions the API cannot perform are surfaced as co-pilot steps for the client to apply.
- Every action is attributed to the manager in the activity log.

**US-8.4 (P0)** As a client, I want to pause, restrict or revoke access at any time, so that I am always in charge.

- Changes take effect immediately; scheduled items that need a removed permission move to "on hold" and the manager is notified.

**US-8.5 (P0)** As a client, I want a live activity log of every action on my account, so that I can see exactly what was done, by whom and when.

- Filter by date, action type and person; export as CSV.

**US-8.6 (P1)** As an account manager, I want to request a one-off permission for a specific action, so that I can do it without the client widening access permanently.

- Request states the action and reason; client approves or declines; approval expires after the action or 7 days.

**US-8.7 (P0)** As a client, I want to be told if my LinkedIn connection expires or breaks, so that service is not interrupted without my knowing.

- Client and manager are notified; a Reconnect button appears on the client dashboard.

## Epic 9. Publishing and scheduling

Only approved content can be scheduled or published, and every publish is confirmed or flagged.

**US-9.1 (P0)** As an account manager, I want to schedule approved content for a set date and time, so that posts go out when the audience is active.

- Posts publish through LinkedIn's API; times shown in the client's time zone, with the manager's own time alongside.
- Each post targets the client's personal profile or their connected company Page.
- Schedule and Publish now are disabled for any item not approved or covered by discretion.

**US-9.2 (P0)** As an account manager, I want to reschedule or cancel a scheduled item, so that the calendar can respond to news or client requests.

- Rescheduling an approved item does not need re-approval; editing its content does.

**US-9.3 (P0)** As a client, I want to pause all publishing with one action, so that I can stop activity during a sensitive moment.

**US-9.4 (P0)** As an account manager, I want to be alerted if a publish fails, so that I can fix it quickly.

- System retries up to 3 times, then marks the item Failed with the reason and notifies the manager.

**US-9.5 (P0)** As a client, I want confirmation when a post goes live, so that I know it happened.

- Confirmation includes a link to the live post and appears in the activity log.

## Epic 10. Analytics and reporting

Reports measure progress against the client's own goals first, with delivery and vanity metrics as context.

**US-10.1 (P0)** As a client, I want a dashboard of my goal metrics against targets, so that I can see whether the work is paying off.

- Goal metrics first, trend over the contract; secondary metrics (followers, reactions) below.

**US-10.2 (P0)** As an account manager, I want a weekly report drafted automatically, so that I only add commentary before sending.

- Covers delivery versus plan, top posts, goal metric movement, next week's focus.
- Monthly summary report sent at each month end.
- The monthly report compares this month with last and shows the trajectory toward the client's goal, even when the goal is not yet met, to guide the next strategy.

**US-10.3 (P0)** As a client, I want to see what was delivered against what was promised, so that I know I am getting what I pay for.

- Posts, comments and connection requests done versus contract cadence, per week.

**US-10.4 (P1)** As a client or account manager, I want to log real outcomes (inbound leads, invitations, partnership or job offers), so that results LinkedIn cannot track still count.

**US-10.5 (P1)** As any role, I want to download reports as PDF, so that I can share them with others.

**US-10.6 (P0)** As the admin, I want a portfolio view of all clients, so that I can spot accounts at risk.

- Each client shows goal progress, delivery rate, approval delays and open disputes, with an at-risk flag.

## Epic 11. Payments, termination and refunds

Clients pay in the app, can end their contract at any time, and are refunded for unused months once the admin approves.

**US-11.1 (P0)** As a client, I want to pay for my contract by card in the app, so that I can start without invoices or bank transfers.

- Uses Stripe as the sole payment provider, on a US Stripe account (Bluecut Socials is a US-established company).
- Clients are charged in their own local currency via Stripe Adaptive Pricing, converted from the USD base price; funds settle in USD to the US bank account.
- Nigerian clients are charged at fixed NGN prices per plan. Nigerian-issued Naira cards are supported through Stripe's Naira card feature (private preview at time of writing); if it is not available at launch, Nigerian clients pay through the standard Visa/Mastercard card flow.
- Payment success activates the contract and shows a receipt.

**US-11.2 (P0)** As a client, I want invoices and receipts in my account, so that I can handle my records and expenses.

**US-11.3 (P0)** As a client, I want to end my contract at any time from my settings, so that I am never locked in.

- Termination takes effect at the end of the current month of service.
- Before confirming, the client sees the refund amount, the end date and what stops.

**US-11.4 (P0)** As a client, I want a refund for months not yet worked, so that I only pay for service received.

- Refund = full months remaining after the termination date (example: end after month 1 of 3, refund months 2 and 3).
- Partial-month rules and any work already delivered for future months are set by the admin.

**US-11.5 (P0)** As the admin, I want to approve each refund before it is paid, so that I can check the calculation.

- Once approved, the refund is processed automatically and the client is notified.

**US-11.6 (P0)** As a client, I want my account closed cleanly when a contract ends, so that nothing continues on my profile.

- On end date: scheduled items cancelled, LinkedIn access revoked, account manager unassigned, data export offered.

**US-11.7 (P1)** As a client, I want clear handling of a failed payment, so that I can fix it before service stops.

- Retry and update card; service pauses after a grace period set by the admin.

## Epic 12. Disputes and accountability

Every task records who it is waiting on, so delays and disputes can be traced to the client or the account manager from the log rather than from memory.

**US-12.1 (P0)** As the admin, I want every task to have an owner, a due time and a "waiting on" status, so that responsibility is always clear.

- "Waiting on" switches automatically: client (approval or permission pending) or account manager (work pending).

**US-12.2 (P0)** As the admin, I want delays attributed automatically, so that I know whether a missed slot was the client's or the manager's.

- Client-caused: approval or permission not given by the deadline.
- Manager-caused: approved work not published or not done by its due time.

**US-12.3 (P0)** As a client, I want to raise a complaint from any item or from my account, so that issues reach the admin quickly.

- Categories: missed delivery, quality, unauthorised action, billing, other; optional attachment.

**US-12.4 (P0)** As the admin, I want a dispute workspace with the full timeline and evidence, so that I can decide fairly.

- Shows approvals, activity log, messages and delay attribution for the period in question.
- Outcomes: no action, credit, partial refund, account manager warning, reassignment; outcome sent to the client.

**US-12.5 (P0)** As the admin, I want the system to query an account manager automatically when they miss a deadline, so that issues are caught before the client notices.

- Manager must respond with a reason; repeated misses escalate to the admin.

**US-12.6 (P1)** As the admin, I want to reassign an account to another manager with a handover summary, so that service continues without a gap.

- Handover includes strategy, calendar, open items, recent feedback and client preferences.

**US-12.7 (P1)** As the admin, I want to set service level targets (for example approval window, publish window, response time), so that delays are measured against agreed standards.

## Epic 13. Admin operations and account manager management

The admin runs the business from one panel: people, assignments, framework, pricing and rules.

**US-13.1 (P0)** As the admin, I want to invite and onboard account managers, so that I can grow capacity without hiring strategists.

- Profile holds name, contact, time zone, availability and maximum accounts (default 10).

**US-13.2 (P1)** As the admin, I want account managers to complete framework training and a test before they get clients, so that quality is consistent.

- Training modules, a short assessment and a practice account; pass mark set by admin.
- No prior social-media or professional experience is required; passing the training and assessment is the only entry requirement.
- Training is written for entry-level managers (for example recent school leavers), so it assumes no background knowledge.
- Managers cannot be assigned live clients until marked certified.

**US-13.3 (P0)** As the admin, I want to assign and reassign clients to account managers, so that workload is balanced.

- Warning when a manager would exceed their maximum; industry experience shown to guide matching.

**US-13.4 (P0)** As an account manager, I want one task queue across all my clients, so that I always know what to do next.

- Sorted by due time; grouped by client; shows status and "waiting on".

**US-13.5 (P1)** As the admin, I want performance metrics per account manager, so that I can coach, reward or replace.

- On-time delivery, first-pass approval rate, client delays versus manager delays, disputes, client goal progress.

**US-13.6 (P0)** As the admin, I want to suspend or remove an account manager instantly, so that a problem cannot reach client accounts.

- All access ends immediately; their clients appear in an "unassigned" queue for reassignment.

**US-13.7 (P0)** As the admin, I want to manage plans, prices, trial scope, refund rules and service levels, so that the business runs on my terms.

- Changes apply to new contracts only; existing contracts keep the terms they accepted.

**US-13.8 (P0)** As the admin, I want a log of all admin actions, so that my own changes are traceable too.

**US-13.9 (P1)** As the admin, I want account-manager pay calculated from the number of accounts each manages, within a set minimum and maximum, so that payouts are consistent and capacity stays controlled.

- Pay is based on the count of active accounts managed, not on output.
- Each manager has a minimum and maximum number of accounts (maximum default 10); assignments stay within that band.
- The app tracks each manager's active accounts for the pay period and produces a payout figure for the admin to approve.

## Epic 14. Notifications and communication

Each role hears about what needs them, in-app and by email, and nothing else.

**US-14.1 (P0)** As any user, I want in-app and email notifications for events that need me, so that I never miss an action.

**US-14.2 (P1)** As any user, I want to choose which notifications I get by email, so that my inbox stays manageable.

- Security, billing and approval deadline notices cannot be switched off.

**US-14.3 (P0)** As a client, I want a message thread with my account manager inside the platform, so that all communication is in one place and on record.

- Admin can view every thread; messages support text, files and voice notes.

**US-14.4 (P0)** As any user, I want clear on-screen feedback when I act, so that I know whether it worked.

- Success toasts, inline validation errors, warning dialogs before destructive actions (revoke access, terminate, delete).

**US-14.5 (P1)** As a client, I want an optional daily or weekly digest, so that I can catch up in one email.

**Event catalogue**

| Event | Client | Account manager | Admin |
| --- | --- | --- | --- |
| Batch ready for approval | Yes |  |  |
| Approval deadline in 24 hours | Yes | Yes |  |
| Client approved, rejected or gave feedback |  | Yes |  |
| Post published or failed | Yes (published) | Yes | Failed only |
| Permission changed or access revoked | Yes | Yes | Yes |
| Permission request raised | Yes |  |  |
| LinkedIn connection expired | Yes | Yes |  |
| Deadline missed by account manager |  | Yes | Yes |
| Complaint raised or dispute updated | Yes | Yes | Yes |
| Trial ending, contract ending, renewal | Yes |  | Yes |
| Payment success, failure, refund issued | Yes |  | Yes |
| Refund awaiting approval |  |  | Yes |
| Client assigned or reassigned | Yes | Yes |  |
| Weekly report sent | Yes |  |  |

## Pages by role

The product has three separate panels plus shared public and sign-in pages; this is the page list for design and routing.

| Panel | Page | Purpose | Stories |
| --- | --- | --- | --- |
| Public | Landing and plans | Explain the service, compare plans, start trial | 2.1 |
| Public | Sign up, sign in, 2FA, password reset | Account access | 1.1 to 1.4 |
| Client | Onboarding | Intake form, asset upload, LinkedIn connect, call booking, checklist | 3.1 to 3.3, 3.9, 8.1 |
| Client | Dashboard | Goal metrics, delivery vs plan, items awaiting me, trial or contract status | 10.1, 10.3 |
| Client | Strategy | Positioning, pillars, metrics rationale, decision records to confirm | 3.7, 4.6, 4.7 |
| Client | Calendar | Read-only view of planned and published content | 5.2 |
| Client | Approvals | Batch review, approve, reject, feedback by text or voice | 7.2, 7.3 |
| Client | Opportunities | Events and openings to mark interest | 6.4 |
| Client | Access and permissions | Permission toggles, pause, revoke, permission requests, reconnect | 8.2, 8.4, 8.6, 8.7 |
| Client | Activity log | Every action on my account | 8.5 |
| Client | Reports | Weekly and monthly reports, outcomes log, PDF download | 10.2, 10.4, 10.5 |
| Client | Messages | Thread with account manager | 14.3 |
| Client | Billing and contract | Plan, terms, invoices, terminate with refund preview, complaints | 11.1 to 11.4, 12.3 |
| Account manager | Task queue | All tasks across clients by due time | 13.4 |
| Account manager | Client workspace: overview | Client profile, goals, discretion settings, permissions | 3.8, 8.2 |
| Account manager | Client workspace: research and audit | Niche research, profile audit, benchmark | 4.2 to 4.4 |
| Account manager | Client workspace: strategy | Edit and submit strategy, call notes, follow-up questions | 3.4 to 3.6, 4.5, 4.8 |
| Account manager | Client workspace: calendar and editor | Calendar, drafts, assets, quality checks, batch submit, schedule | 5.1 to 5.9, 7.1, 7.4, 9.1, 9.2 |
| Account manager | Client workspace: engagement | Target profiles, comment drafts, connection suggestions, weekly log | 6.1 to 6.3, 6.5, 6.6 |
| Account manager | Client workspace: LinkedIn | In-app workspace with blocked areas | 8.3 |
| Account manager | Training | Framework modules and assessment | 13.2 |
| Admin | Portfolio | All clients, at-risk flags | 10.6 |
| Admin | Account managers | Invite, certify, capacity, performance, suspend | 13.1 to 13.3, 13.5, 13.6, 13.9 |
| Admin | Framework | Templates, pillar models, tone rules, banned phrases, industry rules | 4.1 |
| Admin | Contracts and billing | Contracts, refunds to approve, payments | 2.7, 11.5 |
| Admin | Disputes | Dispute workspace, deadline misses, escalations | 12.1 to 12.6 |
| Admin | Settings | Plans, pricing, trial scope, refund rules, service levels, session policy | 12.7, 13.7 |
| Admin | Audit log | Admin and system actions | 13.8 |
| All | Profile and notifications | Personal details, time zone, 2FA, sessions, notification choices | 1.6, 1.7, 14.2 |

## State models

Content follows one gated path to LinkedIn; the other key objects have the simpler lifecycles in the table below.

**Nothing reaches LinkedIn without review and approval.** Content item lifecycle, 8 states: AI draft → Manager review → Awaiting client → Approved → Scheduled → Published. From Awaiting client, the client can ask for changes (Changes requested), which loops back to Manager review. A discretion category skips the client step (Manager review → Approved). A scheduled item becomes Failed after 3 failed retries.

Changes loop back through manager review. Editing approved content sends it back to Awaiting client. A scheduled item moves to On hold if the client pauses publishing or removes a needed permission, and returns to Scheduled when restored.

| Object | States |
| --- | --- |
| Client account | Trial, Onboarding, Active, Paused, Ended |
| Contract | Trial, Active, Ending soon, Completed or Terminated |
| LinkedIn connection | Not connected, Connected, Paused, Expired, Revoked |
| Permission request | Pending, Approved, Used or Expired, Declined |
| Refund | Requested, Awaiting admin approval, Processing, Paid or Declined |
| Dispute | Open, Under review, Resolved, Closed |
| Account manager | Invited, In training, Certified, Suspended, Removed |
| Task | To do, Waiting on client, Waiting on manager, Done, Missed |

## Non-functional requirements

Security and trust are the product's selling point, so they are launch requirements, not polish.

**Security**

- LinkedIn tokens and client data encrypted at rest and in transit (TLS 1.2 or higher); keys managed outside the application database.
- Role-based access checked on the server for every request, never only in the interface.
- 2FA required for staff; rate limiting and lockout on repeated failed sign-ins.
- Immutable audit log of every account action, permission change, approval and admin action.

**Privacy and compliance**

- Comply with data protection law in clients' regions (for example GDPR in the EU and NDPA in Nigeria); consent recorded at sign-up.
- Client data is not used to train external AI models; AI providers bound by no-retention terms where available.
- Clear retention periods for ended contracts; client can request deletion.
- Act on LinkedIn only through its official API and the client's OAuth authorisation; never store passwords or session cookies, never automate the client's browser.

**AI quality and safety**

- All AI work is co-pilot and human-in-the-loop: a person starts and directs every research, audit, strategy and content step and reviews the output, and no content reaches LinkedIn without human review. The AI never acts on its own.
- Research findings show sources; the AI labels uncertainty instead of inventing facts.
- Industry rule sets block restricted claims for regulated clients.

**Performance and reliability**

- Pages load in under 2 seconds on a typical connection; AI drafts show progress while generating.
- Scheduled posts publish within 5 minutes of their set time.
- Target 99.5% uptime; daily backups.

**Accessibility and usability**

- Meet WCAG 2.1 AA; full keyboard navigation; text alternatives for images.
- Responsive on desktop and mobile; approvals and feedback fully usable on a phone, since busy executives review on the go.
- Visual design follows the project design system tokens for colour, type, spacing and radius.

## Edge cases and validation rules

These cases need defined behaviour in design and code before launch.

| Situation | Expected behaviour |
| --- | --- |
| Client revokes access while posts are scheduled | Affected items move to On hold; manager notified; nothing publishes |
| Client does not approve before the slot time | Item is not published; slot marked Missed, waiting on client; counts as client delay |
| Client edits approved content in the review screen | Edited version needs manager check, then counts as approved |
| Manager edits content after client approval | Approval is cleared; item returns to Awaiting client |
| LinkedIn token expires | Publishing pauses for that client; both parties notified; Reconnect shown |
| LinkedIn rejects a post (length, media, rate limit) | Retry up to 3 times, then Failed with reason; manager alerted |
| Client changes a discretion setting | Applies to new items only; items already in review keep their path |
| Account manager suspended mid-batch | Drafts kept; client moves to Unassigned queue; client told a new manager is coming |
| Client terminates mid-month | Service runs to end of current month; refund preview shown before confirm |
| Client terminates during trial | No charge; access paused; data kept for the retention period |
| Payment fails at renewal | Grace period; reminders; then publishing pauses, data kept |
| Time zone or daylight saving change | Scheduled times stay fixed in the client's local time |
| Voice note fails to transcribe | Audio kept and playable; client prompted to type instead |
| AI output fails a quality check | Cannot be submitted until fixed or dismissed with a reason |
| Duplicate or near-duplicate content | Flagged with a link to the earlier post |
| Two staff edit the same draft | Second editor sees a lock notice; changes are not overwritten |
| Uploaded file too large or wrong type | Inline error with the allowed types and size |
| Client goals change mid-contract | Strategy revision flow; calendar updates only after approval |
| Same person tries a second trial | Blocked with a message to contact support |

## Release phasing

Phase 1 ships every P0 story for a pilot with the strategist and a small group of clients; dates are not yet set.

| Phase | Scope | Moves on when |
| --- | --- | --- |
| 1. Pilot (MVP) | All P0 stories: roles and security, trial and contracts, onboarding, research and strategy, calendar and drafts, approvals, permissions, publishing to personal profiles and company Pages, core reports, payments and refunds, delay tracking, admin basics | Pilot clients complete onboarding and publish approved content with no security incidents |
| 2. Scale | P1 stories: manager training and certification, opportunity scouting, benchmarks, one-off permission requests, outcome logging, digests, reassignment handover | One account manager runs 5 or more clients to standard |
| 3. Expand | P2 and new scope: more platforms (X first), deeper analytics, team accounts for companies | Phase 2 metrics hold for a full contract cycle |

## Decisions and open items

Almost everything here is now decided; each item records the decision for design and development. The only item still to set is the actual plan prices.

- [x] **LinkedIn access:** official API with client OAuth; the open w\_member\_social permission covers posting, commenting and liking; feed reading, profile search, connection requests and profile edits are co-pilot steps; company Pages use the Community Management API, applied for before launch.
- [x] **Payment provider:** Stripe as the sole provider, on a US Stripe account. Every client is charged in their own local currency via Stripe Adaptive Pricing, converted from the USD base price, with settlement in USD. Nigeria is charged natively in Naira at fixed NGN prices per plan, with Nigerian-issued Naira cards supported through Stripe's Naira card feature (private preview; access requested and tested during the build).
- [x] **Base pricing currency:** USD. Nigeria uses fixed NGN prices per plan instead of a floating converted figure; all other markets convert from the USD base via Adaptive Pricing.
- [x] **Naira card fallback:** if Stripe's Naira card feature is not available at launch, Nigerian clients pay through the standard Visa/Mastercard card flow. No second payment provider is integrated.
- [x] **Plan terms:** 3, 6 and 12 months, paid up front, priced in the client's local currency (for example Naira, US dollar, Canadian dollar).
- [ ] **Plan prices:** the structure is decided (USD base with fixed NGN equivalents for Nigeria); only the actual amounts per plan remain to be set.
- [x] **Product name:** Bluecut Socials (confirmed as final).
- [x] **Account manager vetting:** no prior experience required; passing the framework training and certification is the only gate (US-13.2). Intended pool is entry-level, for example recent school leavers.
- [x] **Account manager pay:** based on the number of accounts managed, within a set minimum and maximum, handled in the app (US-13.9); not based on output.
- [x] **Discovery calls:** held on an external tool, Google Meet by default (Zoom and Teams supported), with the AI notetaker joining and the transcript brought into the app (US-3.3, US-3.4).
- [x] **Trial and refunds:** full-service 2-week trial, no card required (week one onboarding, week two first activity); the client pays at the end to continue. Refunds charge for months worked and return the unworked months (US-11.4).
- [x] **Existing network:** left untouched; the platform shows the current state and recommendations and the client decides, building forward from what exists (US-4.3).
- [x] **Success benchmarks:** the client's own goal, evaluated over the contract term through weekly and monthly reports, with month-over-month trajectory toward the goal (US-4.6, US-10.1, US-10.2).
- [x] **Results-based offer:** not offered; contracts are fixed-term, committed and paid up front.
- [x] **Ideal customer profile:** C-suite and senior professionals, business owners, co-founders, startup and company owners, heads of department and technical leaders; strictly professional. Deeper demographic and psychographic research is a later marketing task, not a build dependency.

## Glossary

| Term | Meaning |
| --- | --- |
| Framework | The strategist's method, encoded as templates, rules and checks the AI follows |
| Content pillar | One of 3 to 5 themes all of a client's content is built around |
| Cadence | Weekly targets for posts, comments, connection requests and long-form pieces |
| Batch | A set of content items (default one week) submitted for review together |
| Discretion category | A type of action the client lets the manager do without approval |
| Waiting on | Who must act next on a task: client or account manager |
| Vanity metric | Likes and follower counts that do not by themselves show progress to a goal |
| Decision record | Locked, client-confirmed summary of what was agreed in a call |

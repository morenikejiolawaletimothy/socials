# Bluecut Socials flow map

Every user flow, end to end, screen by screen. Derived from `docs/prd.md` (stories) and `docs/implementation-plan.md` (build order).

**Status:** Draft for review by Fola (design authority). Nothing below is built until its flow is marked Approved.

## How to review

For each flow, reply with one of:

- **Approved**: build it as written.
- **Change**: what to add, remove or reorder.
- **Question answers**: each flow lists open questions. Answer them or say "your call".

Review status is tracked in the inventory table. A flow moves Draft → Approved → Built → Signed off.

---

## 1. The end-to-end journey

The golden path the whole product serves, across all three roles.

| Stage | Client | Account manager | Admin |
| --- | --- | --- | --- |
| Discover | Lands, compares plans, starts trial | | |
| Trial week 1: onboarding | Intake, assets, connect LinkedIn, books call 1 | Runs call 1, research and audit, follow-up questions | Assigns a manager |
| | Books call 2, confirms decision record, sets discretion | Runs call 2, writes decision record, drafts strategy | |
| | Approves strategy | Generates calendar and first batch | |
| Trial week 2: first activity | Reviews first batch, sees first post go live | Applies feedback, schedules, engages | |
| Convert | Accepts contract, pays | | Sees contract go active |
| Every week | Reviews batch, reads weekly report, messages | Task queue, drafts, quality checks, engagement, report | Portfolio, at-risk accounts |
| When things go wrong | Pauses, revokes, complains | Fixes failed posts, answers missed-deadline queries | Disputes, refunds, reassignment |
| End | Renews, or terminates with refund, exports data | Unassigned | Approves refund |

---

## 2. Flow inventory

| ID | Flow | Role | Stories | Batch | Status |
| --- | --- | --- | --- | --- | --- |
| S1 | App shells and navigation | All | Pages by role | 1.1 | Draft |
| P1 | Discover and compare plans | Visitor | 2.1 | 1.2 | Draft |
| P2 | Sign up and verify email | Client | 1.1, 1.3 | 1.2 | Draft |
| P3 | Sign in with 2FA | All | 1.3 | 1.2 | Draft |
| P4 | Reset password | All | 1.4 | 1.2 | Draft |
| P5 | Accept staff invite | Manager | 1.2, 1.3 | 1.2 | Draft |
| C1 | Onboarding checklist | Client | 3.9 | 1.3 | Draft |
| C2 | Intake form | Client | 3.1 | 1.3 | Draft |
| C3 | Upload brand assets | Client | 3.2 | 1.3 | Draft |
| C4 | Connect LinkedIn | Client | 8.1 | 1.3 | Draft |
| C5 | Book a discovery call | Client | 3.3, 3.4 | 1.3 | Draft |
| C6 | Confirm the decision record | Client | 3.7 | 1.3 | Draft |
| C7 | Set approvals and discretion | Client | 3.8 | 1.3 | Draft |
| C8 | Review and approve strategy | Client | 4.6, 4.7 | 1.4 | Draft |
| C9 | Accept contract and pay | Client | 2.2, 2.3, 11.1 | 1.4 | Draft |
| C10 | Dashboard | Client | 10.1, 10.3, 8.7 | 1.4 | Draft |
| C11 | Review a batch | Client | 7.2, 7.3, 7.5 | 1.4 | Draft |
| C12 | Calendar | Client | 5.2 | 1.4 | Draft |
| C13 | Access and permissions | Client | 8.2, 8.4, 8.6, 8.7, 9.3 | 1.4 | Draft |
| C14 | Activity log | Client | 8.5 | 1.4 | Draft |
| C15 | Reports and outcomes | Client | 10.2, 10.4, 10.5 | 1.4 | Draft |
| C16 | Messages | Client | 14.3 | 1.4 | Draft |
| C17 | Opportunities | Client | 6.4 | 1.4 | Draft |
| C18 | Billing, invoices and failed payment | Client | 11.2, 11.7 | 1.4 | Draft |
| C19 | End contract with refund | Client | 11.3, 11.4, 11.6 | 1.4 | Draft |
| C20 | Raise a complaint | Client | 12.3 | 1.4 | Draft |
| X1 | Profile, security and notifications | All | 1.6, 1.7, 1.8, 14.2 | 1.4 | Draft |
| M1 | Task queue | Manager | 13.4, 12.1 | 1.5 | Draft |
| M2 | Client overview | Manager | 3.8, 8.2 | 1.5 | Draft |
| M3 | Discovery call 1 to summary | Manager | 3.4 | 1.5 | Draft |
| M4 | Research and profile audit | Manager | 4.2, 4.3, 4.4 | 1.5 | Draft |
| M5 | Follow-up questions, call 2 and decision record | Manager | 3.5, 3.6, 3.7 | 1.5 | Draft |
| M6 | Draft and submit strategy | Manager | 4.5, 4.8 | 1.5 | Draft |
| M7 | Generate the calendar | Manager | 5.1, 5.2 | 1.5 | Draft |
| M8 | Draft a batch and submit for approval | Manager | 5.3 to 5.7, 7.1 | 1.5 | Draft |
| M9 | Apply feedback and resubmit | Manager | 7.4 | 1.5 | Draft |
| M10 | Schedule, reschedule and failed posts | Manager | 9.1, 9.2, 9.4 | 1.5 | Draft |
| M11 | Weekly engagement | Manager | 6.1 to 6.3, 6.6 | 1.5 | Draft |
| M12 | LinkedIn co-pilot steps | Manager | 8.3, 5.8 | 1.5 | Draft |
| M13 | Send the weekly report | Manager | 10.2 | 1.5 | Draft |
| M14 | Answer a missed-deadline query | Manager | 12.5 | 1.5 | Draft |
| M15 | Request a one-off permission | Manager | 8.6 | 1.5 | Draft |
| M16 | Training and assessment | Manager | 13.2 | 1.5 | Draft |
| A1 | Portfolio | Admin | 10.6 | 1.6 | Draft |
| A2 | Manage account managers | Admin | 13.1, 13.3, 13.5, 13.6, 13.9 | 1.6 | Draft |
| A3 | Framework editor | Admin | 4.1 | 1.6 | Draft |
| A4 | Contracts and refund approvals | Admin | 2.7, 11.5 | 1.6 | Draft |
| A5 | Disputes | Admin | 12.2, 12.4, 12.6 | 1.6 | Draft |
| A6 | Settings | Admin | 12.7, 13.7 | 1.6 | Draft |
| A7 | Audit log | Admin | 13.8 | 1.6 | Draft |
| N1 | Notifications | All | 14.1, 14.4 | 1.7 | Draft |

---

## 3. Flows

Each flow lists: **Goal**, **Entry**, **Steps** (one line per screen or step), **States** to design, and **Questions** for you.

### S1. App shells and navigation

- **Goal:** each role lands in its own workspace and can always tell where they are.
- **Steps:**
  1. Public shell: logo, "Plans", "Sign in", one primary "Start free trial".
  2. Client shell: side navigation on desktop, bottom tab bar plus "More" on mobile. Trial banner with days left on every page. Notification bell.
  3. Manager shell: side navigation (Tasks, Clients, Training). Inside a client, tabs: Overview, Research, Strategy, Calendar, Engagement, LinkedIn.
  4. Admin shell: side navigation (Portfolio, Managers, Framework, Contracts, Disputes, Settings, Audit log).
  5. Demo role switcher (Phase 1 only, removed in Phase 2).
  6. "No access" page for links outside a role (US-1.5).
- **Questions:**
  1. Client mobile tabs: I suggest Home, Approvals, Calendar, Messages, More. Agree?
  2. Client has 12 pages. Group "Access, Activity log, Billing" under a "Settings" area to keep navigation short?

### P1. Discover and compare plans

- **Goal:** a senior professional understands the service and starts a trial without a card.
- **Entry:** landing page.
- **Steps:**
  1. Landing: what we do, how it works (trial, onboarding, approve everything), trust and security section (you control access, we never see your password), plans preview, start free trial.
  2. Plans: 3, 6 and 12 months side by side. Price in local currency (USD base, fixed NGN), what is included, refund rule in plain words. One primary action: Start free trial.
- **States:** currency switch, mobile stacked plans.
- **Questions:**
  1. Prices are not set yet. Use placeholders like "$X / month" or realistic dummy figures?
  2. Is the landing page a full marketing page now, or a simple page that we replace later? (Design system says reference Awwwards for marketing.)

### P2. Sign up and verify email

- **Goal:** create a client account and start the trial.
- **Steps:**
  1. Sign up: full name, work email, password (12+ characters), country, time zone (detected, editable). "Continue with Google". Consent to terms and privacy.
  2. Check your email screen with resend.
  3. Email verified, then optional 2FA offer (recommended, skippable).
  4. Lands in onboarding (C1).
- **States:** duplicate email (inline error with sign-in link), weak password, second trial blocked (US-2.6), link expired.
- **Questions:**
  1. Should sign up use the Stepper (Account, Verify, Secure)? It is three short steps.

### P3. Sign in with 2FA

- **Steps:** email and password, then 6-digit code if 2FA is on (or backup code), then role home.
- **States:** wrong password, locked after repeated failures, wrong code.

### P4. Reset password

- **Steps:** enter email, check your email, set new password, "You are signed out everywhere else", sign in.
- **States:** link expired (1 hour).

### P5. Accept staff invite

- **Steps:** open invite link, set name and password, set up 2FA (required, shows backup codes), lands in Training if not certified, else Task queue.
- **States:** link used or expired (7 days).

### C1. Onboarding checklist

- **Goal:** the client always knows what is done and what is next in trial week 1.
- **Steps:** one page listing the 8 steps: intake, assets, LinkedIn connected, call 1, research (manager), call 2, decisions confirmed, strategy approved. Each shows done, current, waiting on manager, or locked, with one action for the current step.
- **Questions:**
  1. Show this as the client home until onboarding is complete, then switch home to the dashboard?
  2. Use the Stepper here, or a vertical checklist? (8 steps is too many for a horizontal stepper on a phone.)

### C2. Intake form

- **Goal:** the manager understands the client before call 1.
- **Steps:** a multi-step form with the Stepper. Proposed grouping into 4 steps:
  1. Goals (3 and 6 months).
  2. You and your audience (industry, role, target audience).
  3. Where you are now (challenges, past LinkedIn efforts, people you admire or compete with).
  4. Boundaries (topics to avoid, compliance rules in your field), then review and submit.
- **States:** autosaved indicator, leave and return, missing required fields on submit.
- **Questions:**
  1. Is this grouping right? Are any fields missing from your manual intake?

### C3. Upload brand assets

- **Steps:** drop zone grouped by type (headshots, logos, colours and fonts, past posts and writing samples). File list with remove.
- **States:** wrong type or over 20 MB (inline error naming the allowed types), upload progress, empty.

### C4. Connect LinkedIn

- **Steps:**
  1. Explainer: what we can and cannot do, you never share your password.
  2. LinkedIn consent screen (mocked in Phase 1).
  3. Connected: profile name and photo. Optional: connect a company Page.
- **States:** declined consent, connection failed, already connected.

### C5. Book a discovery call

- **Steps:**
  1. Pick a slot (manager availability shown in the client's time zone). Call 1 is 90 minutes, call 2 is 60 minutes.
  2. Recording consent: the AI notetaker will join and record. Agree or decline.
  3. Booked: date, Google Meet link, add to calendar.
- **States:** no slots this week, reschedule, cancel.
- **Questions:**
  1. Call 2 is only bookable after research is done. Should it appear as locked in the checklist with "Your manager is preparing your research"?

### C6. Confirm the decision record

- **Steps:** summary of decisions, changes and next steps. Two actions: Confirm, Request correction (with a comment box). Confirmed records show as locked with a version number.

### C7. Set approvals and discretion

- **Steps:** a list of action types, each with "Needs my approval" or "My manager decides". Defaults per US-3.8. Headline, About and sensitive topics are always approval and cannot be switched.
- **States:** "Changes apply to new items only" notice after saving.

### C8. Review and approve strategy

- **Steps:** positioning, audience, pillars, tone, weekly cadence, goals mapped to metrics with reasons, vanity metrics as secondary. Comment per section. Actions: Approve strategy (primary), Request changes.
- **States:** new version awaiting approval (revision mid-contract, US-4.8).
- **Questions:**
  1. The PRD says strategy approval unlocks the contract offer, and also that the client is asked to pay at the end of week 2. Which one triggers the "Accept and pay" step?

### C9. Accept contract and pay

- **Steps:** with the Stepper: Choose plan, Review terms (dates, price, deliverables, refund rule), Pay (Stripe checkout, mocked), Receipt and contract active.
- **States:** payment failed, trial ended without converting (scheduled posts cancelled, access paused, data kept 30 days).

### C10. Dashboard

- **Steps:** items awaiting me (top), goal metrics vs targets with trend, delivery vs plan this week, secondary metrics, contract or trial status.
- **States:** empty in week 1 (no data yet), LinkedIn connection expired (Reconnect shown), publishing paused.

### C11. Review a batch (key mobile flow)

- **Goal:** a busy executive reviews a week of content in one sitting on a phone.
- **Entry:** email or notification link, or Approvals page.
- **Steps:**
  1. Batch overview: due date, items with status.
  2. Item: LinkedIn preview (mobile and desktop toggle). Actions: Approve, Request changes, Reject.
  3. Feedback: type, or record a voice note, then edit the transcript, then send.
  4. Approve all remaining with one confirmation.
  5. Done: what happens next.
- **States:** deadline in 24 hours, missed deadline (waiting on client), items handled by discretion (shown as info only), voice note failed to transcribe.
- **Questions:**
  1. Item by item (swipe or next) or one scrolling list? I suggest item by item on mobile, list with a preview panel on desktop.

### C12. Calendar

- **Steps:** month, week and list views. Filter by pillar, format, status. Read only for the client.

### C13. Access and permissions

- **Steps:** connection status, permission toggles per US-8.2 table (account settings always blocked), Pause all publishing, Revoke access, pending one-off permission requests (approve or decline).
- **States:** connection expired (Reconnect), paused, revoked. Warning dialog before pause and revoke, listing affected scheduled items.

### C14. Activity log

- **Steps:** list of every action (what, who, when, link). Filter by date, action type, person. Export CSV.

### C15. Reports and outcomes

- **Steps:** weekly and monthly reports list, report detail (delivery vs plan, top posts, goal movement, next focus, manager commentary), download PDF, log an outcome (lead, invitation, offer).

### C16. Messages

- **Steps:** one thread with the manager. Text, files, voice notes.

### C17. Opportunities

- **Steps:** list of events, speaking slots, podcasts, awards. Each: date, format, why it fits, link. Mark Interested or Not for me.

### C18. Billing, invoices and failed payment

- **Steps:** current plan and term, invoices and receipts, update card. Failed payment banner with retry and grace period end date.

### C19. End contract with refund

- **Steps:** with the Stepper: Reason (optional), Review (end date, refund amount, what stops), Confirm (warning dialog). Then "Refund awaiting approval" status, then notification when paid.
- **States:** termination during trial (no charge).

### C20. Raise a complaint

- **Entry:** from any item, or from Billing.
- **Steps:** category, description, optional attachment, submit. Then status tracking (Open, Under review, Resolved).

### X1. Profile, security and notifications

- **Steps:** personal details and time zone, 2FA setup, active sessions with sign out everywhere, email notification choices (security, billing and approval deadlines locked on), export data, delete account (blocked during an active contract).

### M1. Task queue

- **Steps:** all tasks across clients, sorted by due time, grouped by client, status and "waiting on" shown. Each task opens the right client screen.
- **States:** overdue, missed-deadline query waiting for an answer.

### M2. Client overview

- **Steps:** client profile, goals, onboarding checklist, discretion settings, permissions (read only), connection status, contract status.

### M3. Discovery call 1 to summary

- **Steps:** call booked, transcript arrives (or paste manually), AI summary (goals, audience, tone, constraints, open points), manager edits and saves.
- **States:** no consent (manual notes), transcript missing.

### M4. Research and profile audit

- **Steps:** run research, progress while generating, findings with sources (unsourced labelled), glossary. Profile audit: each section rated strong, needs work or missing with a recommendation. Benchmark (P1).

### M5. Follow-up questions, call 2 and decision record

- **Steps:** AI follow-up questions grouped by theme, edit, call 2 agenda (draft pillars, positioning, decisions), after call write the decision record and send to client.

### M6. Draft and submit strategy

- **Steps:** AI draft, edit each section, regenerate one section with instructions, submit to client. Revision creates a new version.

### M7. Generate the calendar

- **Steps:** generate for the contract term, review slots (date, time, pillar, format, topic, goal), drag to move, balance check per week.

### M8. Draft a batch and submit for approval

- **Steps:** pick the week, generate drafts, edit each (rich text, character count, versions, compare), visual direction and asset attach, quality checks (resolve or dismiss with reason), submit batch with due date.
- **States:** blocked submit while flags are open, lock notice when another person is editing.

### M9. Apply feedback and resubmit

- **Steps:** feedback turned into change points, apply with AI help, mark each done, resubmit. Client sees before and after.

### M10. Schedule, reschedule and failed posts

- **Steps:** schedule approved items (client time and my time shown), target profile or company Page, reschedule or cancel. Failed: reason, retry, fix.
- **States:** Schedule disabled for unapproved items, on hold after permission removed.

### M11. Weekly engagement

- **Steps:** weekly search brief, add profile or post links, fit score with reasons, accept or dismiss, drafted comments and connection notes, connection list sent to client, weekly totals vs targets.

### M12. LinkedIn co-pilot steps

- **Steps:** actions the API cannot do (profile edits, connection requests) shown as ready-to-apply steps for the client, with copy buttons. Blocked areas clearly marked.

### M13. Send the weekly report

- **Steps:** auto draft, add commentary, preview, send.

### M14. Answer a missed-deadline query

- **Steps:** notification, task shows what was missed, write a reason, submit. Repeated misses escalate.

### M15. Request a one-off permission

- **Steps:** choose action, reason, send. Status: pending, approved (expires after use or 7 days), declined.

### M16. Training and assessment

- **Steps:** modules, practice account, assessment, result. Certified managers can receive clients.

### A1. Portfolio

- **Steps:** all clients with goal progress, delivery rate, approval delays, open disputes, at-risk flag. Filter and open a client.

### A2. Manage account managers

- **Steps:** invite (name, email, time zone, max accounts), list with status (Invited, In training, Certified, Suspended), capacity, performance, payouts to approve, assign clients (warning at max), suspend (clients go to Unassigned).

### A3. Framework editor

- **Steps:** library sections (strategy templates, positioning formulas, pillar models, post formats, tone rules, banned phrases, quality checklists, industry rule sets). Edit, save new version, see version history.

### A4. Contracts and refund approvals

- **Steps:** contracts filtered by status, contract detail, extend or credit with a required note, refunds awaiting approval with the calculation, approve or decline.

### A5. Disputes

- **Steps:** list, workspace with timeline (approvals, activity, messages, delay attribution), choose outcome, send to client. Reassign with handover summary.

### A6. Settings

- **Steps:** plans and prices, trial scope, refund rules, service levels, session policy. Notice that changes apply to new contracts only.

### A7. Audit log

- **Steps:** every admin and system action, filter, export.

### N1. Notifications

- **Steps:** bell with unread count, notification centre grouped by today and earlier, each linking to the right screen. Toasts for success, warning dialogs before destructive actions.

---

## 4. Open items before we start building

1. **Content lifecycle diagram.** The PRD's 8-state content lifecycle was an embedded diagram that did not export. Please share the 8 states and their order.
2. **Logo variants.** The implementation plan mentions small-wh and small-bl variants. The design system only has the blue mark. Please share the white variant for dark surfaces, if it exists.
3. **Platform.** The implementation plan's Phase 2 mentions Lovable Cloud, Lovable Payments and Lovable AI. We are building in Next.js with Claude Code. Phase 1 (dummy data) is not affected. Before Phase 2 we choose the backend (for example Supabase plus Stripe).
4. **Plan prices** are still open in the PRD. Phase 1 uses placeholders.

# Bluecut Socials implementation plan v2

Source of truth: `docs/prd.md` (v2) for stories and rules, `docs/flow-map.md` for screens (all flows approved Oct 27 2026). Replaces v1 (`docs/archive/implementation-plan-v1.md`).

## How to use this plan

- Work goes batch by batch, in order. A batch starts when its dependencies are done.
- Each batch has a status: **Not started → In progress → In review → Done**. Update "Current position" whenever work moves.
- **Review gate for every UI batch:** each flow is built, then phone (390px) and desktop screenshots go to Fola. A flow is Done only after Fola signs it off. Flow status in `docs/flow-map.md` moves Approved → Built → Signed off.
- Exit criteria define done. New asks become line items or PRD changes, never silent additions.

**Round 2 (Nov 2026 refinements):** a second pass of Phase 1 changes is tracked in `docs/implementation-plan-round2.md` and built on branch `plan/round2-implementation`. Done so far: R2.1 (removed on-platform video billing; owner-managed services catalog of included vs off-platform extras; Company Page as a pro-rated add-on for both tiers, no admin-grant) and R2.2 (hybrid add-to-calendar; delegated-access vault trust treatment; manual call transcript + insights replacing the single summary; frictionless LinkedIn-URL signup with mocked extraction). Next: R2.3 (the AM operating model), then R2.4 and R2.5. Phase 2 follow-ups (Bright Data extraction, email .ics, server-side RBAC, Stripe pro-ration) are listed in the round-2 plan.

**Current position:** Phase 1. Every screen is built and interactive on dummy data: batch 1.1 (shells), 1.2 (landing and sign-in, signed off), 1.3 and 1.4 (client C1 to C17), 1.5 (manager M1 to M10) and 1.6 (owner A1 to A8). Batch 1.7 (full walkthrough and polish) is done on our side: loading states, toasts with Undo, confirmations before anything destructive, edit and remove for everything you can add, notifications marked for email, an audit log of owner actions, a "Simulate errors" switch, and a design clean-up (type hierarchy, notices, flat cards, menus, dropdowns). Every save is stored in the demo data, so changes survive a reload. Next: Fola reviews screen by screen and signs off each flow; then the "Before Phase 2" checklist.

---

## Stack

| Part | Choice | Status |
| --- | --- | --- |
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind v4, Phosphor icons | In use |
| Design system | Bluecut Socials, synced from Claude into `design-system/` | In use |
| Hosting | Vercel Pro (preview link per pull request for reviews on a phone). Cloudflare kept for DNS if already used | Recommended, awaiting yes |
| Database, auth, files | Supabase: Postgres with row-level security, Google and email sign-in, two-step sign-in, file storage | Decided |
| Payments | Stripe (USD base, local currency via Stripe, fixed NGN) | Decided |
| AI | Claude API (in-house only) | Decided |
| Email | Resend | Decided |
| Scheduled jobs | Supabase cron and queues, or a worker on Vercel cron | Proposed |
| Notetaker | Fireflies, Grain or similar, with transcripts sent to the platform | To choose |

"Proposed" items need Fola's yes before Phase 2. Phase 1 does not depend on them.

### Before Phase 2 starts (checklist)

| # | Item | Owner |
| --- | --- | --- |
| B1 | Confirm hosting (Vercel Pro recommended) and create the team | Fola |
| B2 | Supabase project (production and a separate staging project) | Fola |
| B3 | Google Cloud OAuth client for "Continue with Google" (consent screen, privacy URL, domain verified) | Fola |
| B4 | Resend account, sending domain verified (SPF, DKIM, DMARC records on the domain) | Fola |
| B5 | Claude API key with a spend limit; confirm no-retention terms | Fola |
| B6 | Stripe account (US entity), products for 3, 6 and 12 months, test keys first | Fola |
| B7 | LinkedIn app approvals (0.1, 0.2) | Fola |
| B8 | Notetaker service chosen and connected (0.4) | Fola |
| B9 | Web and news search service for niche listening (for example Brave Search, Tavily or Exa) | Fola, Claude to compare |
| B10 | Plan prices, terms, privacy and refund policies | Fola |
| B11 | Data processing agreements with Supabase, Stripe, Resend, Anthropic and the notetaker (GDPR, NDPA) | Fola |
| B12 | Keys shared with the build through the environment settings, never in the repository | Fola and Claude |

---

## Phase 0. External track (runs alongside Phase 1, no code)

| # | Item | Owner | Lead time |
| --- | --- | --- | --- |
| 0.1 | LinkedIn developer app and `w_member_social` — **not needed for launch.** Self-serve clients publish their own approved posts (copy caption, open LinkedIn, post); full-service managers publish manually. The member API is a later, optional convenience only. | Fola | Later / optional |
| 0.2 | LinkedIn Community Management API (company Pages) | Fola | 1 to 4 weeks, may be denied |
| 0.3 | Stripe account on the US entity; Naira card access request | Fola | Days to weeks |
| 0.4 | Notetaker service account and Google Meet/Calendar access | Fola | Days |
| 0.5 | Domain | Fola | Days |
| 0.6 | Plan prices (USD base, NGN fixed) | Fola | Before launch |
| 0.7 | Real testimonials (videos, profile images) | Fola | Before launch |
| 0.8 | White logo added to the design system in Claude, then synced | Fola, then Claude | Days |
| 0.9 | Terms, privacy and refund policies | Fola | Before launch |
| 0.10 | WhatsApp Business: Meta business verification, a WhatsApp sender number, message templates approved (one per event in C18 and C19), through Meta Cloud API or Twilio | Fola | 1 to 3 weeks |
| 0.11 | Email sending domain set up (SPF, DKIM, DMARC) for Resend | Fola, then Claude | Days |
| 0.12 | Full-service pricing: full-service tier and company Page management prices (USD base, NGN fixed) | Fola | Before full-service launch |
| 0.13 | Delegated access ops: a secrets vault / KMS (e.g. AWS or GCP KMS), and a signed companion browser extension published to the Chrome Web Store (own listing). Managed-device enforcement (Chrome Enterprise / MDM) comes when devices are issued, not at launch. | Fola, then Claude | 1 to 3 weeks |

---

## Phase 1. Full frontend on dummy data

**Goal:** every approved flow exists as a real, clickable interface on realistic dummy data. Design, flows and copy are final at the end of Phase 1; Phase 2 connects real data underneath without redesigning.

**Rules for all of Phase 1**

- Design system tokens and components only (see `CLAUDE.md`). Mobile first, checked at 390px, then desktop.
- One mock data module per domain in `src/lib/mock/` (clients, contracts, content, tasks, calls, brand, signals, money…), behind the same interface Phase 2 will implement.
- The mock layer enforces the real rules: content states, review settings (Wait for me, Go ahead after 24 hours), off limits, pause, permissions, waiting on.
- Every screen has empty, loading and error states.
- No AI wording anywhere a client or visitor can see.
- A demo role switcher (Phase 1 only) moves between client, manager and owner.

### Batch 1.1. Foundation and shells
Flows: navigation rules (flow map section 0).
- Client and manager shell: slim top bar (desktop), compact floating bottom bar (mobile), small icons with labels, notifications, profile menu.
- Owner shell: dashboard side navigation, mobile menu.
- Breadcrumb component; "no access" page; demo role switcher.
- Missing primitives: toast, dialog, switch, tabs/segmented control, avatar, empty state, skeleton, file drop, banner.
- Mock data layer skeleton and seed data (3 clients at different stages, 2 managers, 1 owner).
**Exit:** all three shells render on phone and desktop from shared components; Fola signs off the shells.

### Batch 1.2. Public pages
Flows: P1 to P4.
- Landing page (reference Awwwards), pricing from one pricing module with dummy USD prices, testimonial placeholders for video and images.
- Create account, email code, sign in, two-step code, reset password, staff invite with slots.
**Exit:** visitor goes landing → Get started → account → Home on mock data. Signed off.

### Batch 1.3. Client setup
Flows: C1 to C6.
- Home with setup progress and reminders.
- Connect LinkedIn (mocked consent) and switches; book both calls (manager slots, 3-day gap, consent); choose plan, sign, pay or skip; how you review; strategy and "What we agreed".
**Exit:** a dummy client completes setup end to end, skipping payment, and approves the strategy. Signed off.

### Batch 1.4. Client everyday
Flows: C7 to C17.
- Home feed, review content (one post at a time on mobile, list on desktop, voice note), take down or fix, quick tasks with Copy and Send to my assistant, progress and updates, messages, control and activity, complaint, contract and cancel (3 steps with reason), account, Your brand with Moments and off limits, paused account and reactivation.
**Exit:** a dummy client runs a full week: reviews, approves by voice note, does quick tasks, takes a post down, reads the update; then is paused and reactivated. Signed off.

### Batch 1.5. Account manager
Flows: M1 to M10.
- Home feed, clients and client page, onboard a client (prep, summary, listening, strategy direction, What we agreed), plan and draft content (ideas with reasons, drafts, visuals, checks with off limits), after review and scheduling, engagement and quick tasks, listening, updates, messages, calls and availability.
**Exit:** a dummy manager takes one client from goals call to a scheduled first week, prepares quick tasks and sends the weekly update. Signed off.

### Batch 1.6. Owner
Flows: A1 to A8.
- Overview, clients with assignment suggestions and step in, managers with training status and payouts, framework with versions and "What works on LinkedIn", money with automatic refund threshold and cancellation reasons, complaints, settings, audit log.
**Exit:** the owner can see every state and take every action on dummy data, including stepping in for a manager. Signed off.

### Batch 1.8. Notifications and assistants (built, awaiting Fola's review)
- Account > Notifications: channels (email, WhatsApp with code), straight away or daily, quiet hours, locked items.
- Account > Assistants: add, edit, remove.
- Quick task: Hand to my assistant, automatic handover per task type, With Ada status, resend, take back.
- Assistant page `/a/[token]`: one task, no app shell; expired and taken-back states.
- Sign in from a link returns to the exact page.
- Demo bar "Sent messages": shows each email and WhatsApp message the demo would send, with its link, so the flow can be tried end to end.
**Exit:** a dummy client hands quick tasks to an assistant, the assistant completes them from the link, the client and manager see it. Signed off.

### Batch 1.9. Onboarding fork and full-service tier (built, awaiting Fola's review)
- New first setup step: choose **Self-serve** or **Full-service** (B).
- Full-service experience: no Tasks tab; permission contract the manager follows and cannot change; messages-not-tasks; access log; pause / resume / end; pricing on Contract; manager Account access card; engagement done by the team (not sent as tasks); owner prices and a Full-service pill.
- Company Page: official admin delegation add-on (client adds Bluecut as a Content admin; managed manually; priced).
**Exit:** a dummy client turns on full-service, manages the Page grant, pauses and resumes; the manager logs sessions and runs engagement directly. Signed off.

### Batch 1.10. Delegated access (built, awaiting Fola's review)
- Compliant delegated access: encrypted vault for the client's login (mocked in Phase 1, nothing real stored), client-set authenticator 2FA, consent and terms. **No cookies, no proxy, no anti-detect browser** (hard boundary; see PRD Epic 18).
- Login handshake: the manager must **notify before signing in**; the client approves on their phone; the session goes active and is recorded; the manager ends it with a note. A sign-in without the notify-and-approve step is a breach signal.
- Client controls: approve / decline a session, pause access, remove stored login, refresh an expired session, end full-service.
- Owner: an Account access alerts card (insider-threat monitoring) with resolve.
**Exit:** a manager requests a sign-in, the client approves, the session is recorded, and a breach signal shows to the owner. Signed off.

### Batch 1.7. Full walkthrough and polish
- All state machines wired in the mock layer, including every PRD edge case.
- Notifications per the event catalogue; success messages; warnings before destructive actions.
- Accessibility pass (WCAG 2.1 AA, keyboard), design system audit, copy audit (voice rules, no AI wording, no "trial").
**Exit (Phase 1 gate):** the full three-role walkthrough plays end to end on simulated data: sign up → setup → calls → strategy → first week → quick tasks → review → publish → update → pause → reactivate → cancel with refund. Fola signs off Phase 1.

---

## Phase 2. Backend, integrations and payments

Starts only after the Phase 1 gate and Fola's yes on the stack. The mock layer is replaced domain by domain; screens do not change.

| Batch | Scope | PRD | Depends on |
| --- | --- | --- | --- |
| 2.1 Data model | Schema for every state model, row-level security per role, seed framework, audit log (real actor, including step-in) | Epics 1, 12, 13 | |
| 2.2 Accounts | Google and email sign-up with code, two-step sign-in, reset, sessions, staff invites, availability | Epic 1, 13.11 | 2.1 |
| 2.3 Files and voice | Brand files and Moments, message attachments, voice notes with transcription | 7.3, 14.3, 16.1 | 2.2 |
| 2.4 Notifications | In-app, email (Resend) and WhatsApp (approved templates) for the event catalogue; deep link per event with sign-in return; channel choice, daily batch, quiet hours in the person's time zone, locked notices; delivery status webhooks; WhatsApp to email fallback; opt-in and STOP handling; retries and de-duplication | Epic 14, 14.6, 14.7 | 2.2, 0.10, 0.11 |
| 2.4b Assistant access | Assistants table per client; task-scoped access tokens (random, stored hashed, one task, ends on done, take back or 14 days, revocable); assistant endpoints limited to that task's read and complete actions and file upload; rate limits; every action audited as "by assistant"; reminders; no personal data beyond the task | 14.8 to 14.10 | 2.4, 2.3 |
| 2.5 Calls | Booking from slots, calendar invites, reminders, recording consent, notetaker transcripts, manual notes fallback | 3.2 to 3.5 | 2.2, 0.4 |
| 2.6 AI engine | Framework, research with sources, audit, measurable strategy drafting with direction, ideas with reasons, drafts in voice, visual suggestions, checks including off limits, feedback to change list, weekly updates | Epics 4, 5, 7, 10 | 2.1, 2.3 |
| 2.7 Niche listening | Per-client knowledge base: Google Alert feeds, manager findings, web and news search with location, client results, LinkedIn knowledge base, preferences; signals with sources | Epic 15 | 2.6 |
| 2.8 Payments | Stripe checkout with local currency, pay later, reminders, pause on unpaid and contract end, automatic reactivation, renewals, refunds with threshold, cancellation reasons, invoices | Epics 2, 11 | 2.2, 2.4, 0.3 |
| 2.9 LinkedIn | No API for publishing: approved posts are published by a human (client on self-serve, account manager on full-service), so no member-API auto-post, no publish-retry, no "did not post". Company Page handled by official Page admin (manual). Optional later: `w_member_social` auto-post for self-serve clients who want hands-off posting. | Epics 8, 9 | 2.2 |
| 2.10 Scheduling and accountability | Recommended-time reminders to publish (no auto-post), time zones, review deadlines, 24-hour go ahead, waiting-on attribution (includes "not published yet"), missed-deadline questions, 15 and 30-day pause jobs with data deletion | Epics 7, 12, 2.5 | 2.8, 2.9 |
| 2.11 Progress and owner views | Goal metrics, targets vs done, updates and PDF, overview and at-risk, manager performance and payouts, assignment suggestions | Epics 10, 13 | 2.9, 2.10 |
| 2.12 Hardening and pilot | Security review, rate limits, encryption checks, deletion and retention checks, accessibility and performance, policies live, live keys, LinkedIn app approved | Non-functional | All |
| 2.13 Full-service | Tier and company Page add-on billing; official LinkedIn Page admin delegation (and Community Management API only if automated Page posting is wanted); no Tasks for full-service accounts; manager cannot edit a full-service client's settings (server role check); access log; pause/resume/end enforced server-side | Epic 17, 18 | 2.2, 2.4, 2.8 |
| 2.14 Delegated access | Encrypted login vault (envelope encryption + KMS, per-credential keys, client-side encryption so neither Bluecut nor the account manager reads plaintext), rotation and revocation; **server-gated credential release** per session, only after the client approves; the companion extension autofills the login on the account manager's own local browser and instruments the session; **notify-before-login enforced** (a release without a matching client approval is blocked and alerted); full session activity logging and recording; security-page lockout; anomaly alerts; authenticator-2FA handshake. Managed-device (Chrome Enterprise/MDM) enforcement added when devices are issued. | Epic 18 | 2.2, 2.13, 0.13 |

**Explicitly out of scope, in every phase (compliance).** No capturing, storing, injecting or replaying LinkedIn **session cookies** taken from a browser; no driving a client's account through automation or an **anti-detect browser**; no routing the account manager through a **residential/location-matched proxy** to impersonate the client. Delegated access works only through the real LinkedIn login the client stores and the client's own authenticator-2FA approval of each sign-in; the account manager then operates the account by hand from their own local browser.

**Phase 2 gate (launch):** pilot clients complete setup and publish approved content with no security incidents.

---

## Companion browser extension (F)

The delegated-access autofill tool is a Chrome/Edge extension in **its own repository**, not in this app. It imports the Bluecut design system as a shared package so its few screens use the exact same components and tokens. Scope is deliberately small and compliant:
- Fetch the client's login from the backend **only after the client has approved the session**, autofill the LinkedIn login form on the account manager's own local browser, then clear it from memory.
- Instrument the session: log pages and actions to the backend (this feeds the client's access log), detect and block the account security pages, detect dev-tools, and raise anomaly alerts.
- It never handles cookies, never runs automation against the account, and never uses a proxy. It only fills a login the client consented to and that their 2FA still gates.
- Hardening ladder: launch with the software controls above; add managed-device enforcement (Chrome Enterprise / MDM, force-installed extension, locked dev-tools) once the business issues devices to account managers.

The app side (Phase 1, built) mocks the handshake so the whole flow can be demoed without the extension.

## Phase 3. After the pilot

P1 and P2 stories in PRD order: one-off permissions, outcomes, PDF, digests, opportunities, benchmarks, content library search, then X and team accounts.

## Risks

| Risk | Where | Mitigation |
| --- | --- | --- |
| Community Management API denied | 2.9 | Personal profiles only; company Page switch hidden |
| Naira card not available | 2.8 | Standard card flow |
| Notetaker unavailable | 2.5 | Manual notes fallback from day one |
| AI quality below the founder's bar | 2.6 | Versioned framework; manager directs every step; client approves |
| Scope creep during reviews | Phase 1 | New asks become line items or PRD changes |
| Stack not yet confirmed | Phase 2 | Phase 1 is independent; confirm before 2.1 |

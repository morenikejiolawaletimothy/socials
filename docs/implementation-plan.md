# Bluecut Socials — Implementation Plan
Source of truth: Bluecut Socials PRD (LinkedIn Account Management Platform). Every batch below lists the PRD stories it covers, its dependencies, and its exit criteria, so progress can always be checked against the PRD.

## How to use this plan

- Work proceeds batch by batch, in order, within each phase. A batch starts only when its dependencies are done.
- Each batch carries a status: **Not started → In progress → In review → Done**. The "Current position" line at the top is updated whenever work moves.
- Exit criteria are the definition of done. A batch is not Done until every criterion holds, even if the visible work looks finished.
- Gaps discovered during a batch are recorded as new line items in that batch (or as PRD amendments) rather than absorbed silently.

**Current position:** Phase 1, batch 1.1 in progress. Next.js app set up with design tokens and base components (button, input, card, badge, stepper, logo). Flow map (`docs/flow-map.md`) drafted and awaiting review.

**Platform note:** the app is built in Next.js with Claude Code rather than Lovable. Phase 1 is unaffected; the Phase 2 backend choice (for example Supabase plus Stripe) is open.

---

## Phase 0 — Parallel external track (runs alongside Phase 1, no code)

These are approvals and accounts with external lead times. They are started early precisely because they are outside our control, and Phase 1's dummy-data frontend does not depend on any of them.

| # | Item | Owner | Lead time | Notes |
| --- | --- | --- | --- | --- |
| 0.1 | LinkedIn developer app + `w_member_social` approval | You | weeks | Required before any live posting (Epic 8–9) |
| 0.2 | LinkedIn Community Management API application (company Pages) | You | 1–4 weeks, may be denied | Company-Page posting degrades gracefully to personal profiles if denied (PRD assumptions) |
| 0.3 | Stripe account on the US entity; Naira card (private preview) access request | You | days–weeks | PRD decision: Stripe sole provider, USD base, fixed NGN prices |
| 0.4 | AI notetaker service account (Grain / Fireflies / similar) + Google Meet/Calendar connection | You | days | US-3.4; manual transcript fallback covers launch if this slips |
| 0.5 | Domain purchase or connection | You | days | Needed at publish time, not before |

**Exit criteria:** applications submitted; approvals tracked with dates. None of these block Phase 1.

---

## Phase 1 — Full interactive frontend, dummy data (no backend, no real accounts)

**Goal:** every screen in the PRD's "Pages by role" table exists as a clickable, realistic interface, driven by a mock data layer that simulates all the state models (content lifecycle, contract states, permissions, waiting-on). Design, flows and copy are final at the end of this phase; Phase 2 wires real behavior underneath without redesigning.

**Cross-cutting rules for all of Phase 1**

- Design system tokens (`design-system-bluecut.css/.json`) and logo variants are applied from batch 1.1 onward and never overridden ad hoc.
- The mock data layer lives behind a single interface (one module per domain: clients, contracts, content, tasks…) so Phase 2 swaps the implementation, not the screens.
- Every screen handles empty, loading and error states from the start — even against dummy data.
- Approval, permission and state-machine rules from the PRD are enforced in the mock layer (e.g. schedule disabled for unapproved items), so the UI is tested against real rules, not loose ones.

### Batch 1.1 — Foundation, design system and app shells
Covers: PRD "Pages by role", state models, non-functional (accessibility, responsive).
- Set up the three-panel + public route structure and navigation.
- Implement design tokens (colors, type, spacing, radius, shadows), fonts, logo variants (small-wh on light, small-bl on dark), base components: buttons, inputs, cards, tables, badges, toasts, modals, empty states.
- Shared layout elements: trial banner (US-2.2), notification bell, role switcher for demo purposes.
**Exit criteria:** all three panels and public routes render from a shared component library on desktop and mobile; tokens drive all styling; logo used correctly per surface.

### Batch 1.2 — Public pages and auth screens (UI only)
Covers: US-1.1–1.4, US-2.1.
- Landing and plans page (3/6/12-month comparison, plain-language terms, currency display with USD base + NGN fixed prices).
- Sign up (client), sign in, 2FA screen, password reset — full validation and error states, no real auth.
**Exit criteria:** a visitor can walk landing → compare plans → start trial → sign up → verify email screen → 2FA → land in the client panel, all mocked.

### Batch 1.3 — Client panel: onboarding
Covers: US-3.1–3.9, US-8.1 (connect screen), checklist (3.9).
- Guided intake form with autosave simulation, required-field enforcement.
- Asset upload screens (JPG/PNG/PDF/DOCX, 20 MB limit shown; files stay client-side).
- LinkedIn connect step with OAuth consent placeholder.
- Call booking UI (availability slots in client timezone), call 1 and call 2 flows, agreed-decisions record with Confirm / Request correction.
- Approval-setting screen (US-3.8 defaults: headline/About/sensitive always approved; likes and routine comments discretionary).
- Onboarding checklist with progress.
**Exit criteria:** a dummy client can complete the full onboarding journey start to finish, including the confirmed decision record.

### Batch 1.4 — Client panel: daily workspace
Covers: US-10.1, 10.3, 4.6, 4.7, 5.2 (read-only), 7.2, 7.3, 7.5, 6.4, 8.2, 8.4–8.7, 8.5, 10.2, 10.4, 10.5, 11.1–11.4, 12.3, 14.3, 14.5.
- Dashboard: goal metrics vs targets, delivery vs plan, items awaiting me, trial/contract status.
- Strategy page: positioning, pillars, metrics rationale, approve/comment/request changes.
- Calendar (read-only), Approvals screen (per-item approve/reject/request changes, batch approve-all, LinkedIn preview desktop + mobile, voice-note UI with transcript edit).
- Opportunities list (Interested / Not for me), Access & permissions (toggle table per US-8.2, pause, revoke, one-off permission requests, reconnect state), Activity log with filters and CSV view.
- Reports (weekly/monthly drafts, outcomes log, PDF button), Messages thread (text, files, voice notes), Billing & contract (plans, invoices, termination with refund preview, complaint form).
**Exit criteria:** a dummy client can run a realistic week: review a batch, approve with a voice note, watch a post appear in the activity log, and read their weekly report.

### Batch 1.5 — Account manager panel
Covers: US-13.4, 3.8, 8.2, 8.3, 4.2–4.5, 4.8, 3.4–3.6, 5.1–5.9, 7.1, 7.4, 9.1, 9.2, 6.1–6.3, 6.5, 6.6, 8.6, 13.2 (trainee view).
- Task queue across clients, sorted by due time, grouped, showing "waiting on".
- Client workspace: overview (goals, discretion, permissions), research & audit screens (AI output shown as reviewed drafts), strategy editor, call notes and follow-up questions.
- Calendar & editor: calendar generation view, draft editor with versions and side-by-side compare, visual-direction suggestions, brand kit storage, quality-check flags with resolve/dismiss-with-reason, batch generation and submission.
- Engagement workspace: weekly search brief, target profiles with fit scores and reasons, drafted comments/notes, weekly log vs targets.
- LinkedIn co-pilot screen with blocked areas (US-8.3), scheduling UI with timezone display, training area (trainee view).
**Exit criteria:** a dummy manager can run one client end to end: intake review → research → strategy draft → calendar → batch of 5 posts with quality checks → submit for approval → apply feedback → schedule.

### Batch 1.6 — Admin panel
Covers: US-10.6, 13.1–13.3, 13.5–13.9, 2.7, 11.5, 12.1–12.7, 4.1, 13.7, 13.8.
- Portfolio view with at-risk flags; account managers (invite flow, capacity, performance, suspend with unassigned queue); framework editor (templates, pillar models, tone rules, banned phrases, industry rule sets, versioning).
- Contracts & billing (status filters, extend/credit with note, refund approvals); Disputes workspace (timeline, evidence, delay attribution, outcomes); Settings (plans, trial scope, refund rules, service levels, session policy); Audit log.
**Exit criteria:** the admin can see every object's state across the whole product and take each admin action defined in the PRD, all on dummy data.

### Batch 1.7 — State simulation, notifications and polish pass
Covers: state models, edge cases table, US-14.1–14.4, non-functional requirements.
- Wire the mock layer to the real state machines: content lifecycle (8 states), contract, connection, permission request, refund, dispute, manager, task — including the edge cases table (revoke mid-schedule, token expiry, edits after approval, suspension mid-batch, DST handling as display rule).
- Notification centre and in-app events per the event catalogue; success toasts, destructive-action warnings.
- Full responsive pass (approvals usable on a phone), keyboard navigation and accessibility pass (WCAG 2.1 AA targets), design-system consistency audit, cross-role link-backs.
**Exit criteria (Phase 1 overall):** every PRD page exists and behaves per its story's acceptance criteria on dummy data; the full three-role walkthrough (sign up → onboard → strategy → batch → approve → publish → report → terminate with refund) plays end to end with simulated state. **This is the demo gate for Phase 2.**

---

## Phase 2 — Backend, integrations and payments

**Goal:** replace the mock layer with real data, real accounts, real AI, real money and real LinkedIn actions, in dependency order. Nothing in Phase 2 starts before batch 1.7 is Done.

### Batch 2.1 — Cloud foundation and data model
- Enable Lovable Cloud; create the full schema from the PRD state models (clients, contracts, content items, tasks, permissions, refunds, disputes, activity log, framework library, audit log) with migrations.
- Row-level security and server-side role checks per role (US-1.5); seeded framework content and test data.
**Dependencies:** none. **Exit criteria:** schema live with policies; a data-integrity check against every state model passes.

### Batch 2.2 — Authentication and access control
Covers: US-1.1–1.8.
- Email + Google sign-up, email verification, password reset (1-hour links, session invalidation), TOTP 2FA with backup codes for staff, session management and admin-set idle timeout, manager invite links (single-use, 7-day expiry), data export and account deletion with contract guard.
**Dependencies:** 2.1. **Exit criteria:** all Epic 1 acceptance criteria pass; role-scoped access verified server-side on every route.

### Batch 2.3 — Storage, files and voice
Covers: US-3.2, 7.3, 14.3.
- File storage buckets for brand assets (type/size validation), voice notes with transcription (Lovable AI speech-to-text), message attachments.
**Dependencies:** 2.2. **Exit criteria:** uploads, playback and transcripts work within the stated limits; transcription failure falls back to typed input (edge case).

### Batch 2.4 — Notifications and email
Covers: US-14.1–14.5, event catalogue.
- In-app + email notifications for every catalogue event, per-role routing, preference settings with unswitchable security/billing/approval notices, digests.
**Dependencies:** 2.2. **Exit criteria:** every event in the catalogue reaches the right roles in-app and by email.

### Batch 2.5 — AI engine
Covers: US-4.1–4.5, 4.8, 5.3–5.9, 5.7, 3.4–3.5, 7.4, 10.2.
- Framework encoding (admin library), AI research with cited sources, profile audit, strategy drafting, calendar generation, voice-matched content drafts, regenerate-with-instructions, quality-check pipeline (restricted claims, banned phrases, near-duplicates, generic-AI language, alt text), feedback-to-change-points.
- Notetaker integration: transcript ingestion from the chosen service (Phase 0.4), manual paste fallback.
- All co-pilot: human starts and reviews every step (PRD AI quality rules).
**Dependencies:** 2.1, 2.3. **Exit criteria:** a manager produces a full client strategy + one-week batch through the AI pipeline, every item passing or consciously dismissing checks; sources shown on research findings.

### Batch 2.6 — Payments and contracts
Covers: US-2.1–2.7, 11.1–11.7.
- Lovable Payments with Stripe: USD base prices + fixed NGN prices, Checkout for up-front contract payment, invoices/receipts, termination with refund preview, pro-rated refund calculation, admin refund approval flow, failed-payment retry and grace period, trial enforcement (one trial per LinkedIn profile/email).
- Enablement note: payments setup is done from the project's main thread, not a draft.
**Dependencies:** 2.2, 2.4; Phase 0.3 (Stripe account). **Exit criteria:** test-mode purchase → contract activation → termination → admin-approved refund completes on test cards; go-live readiness items (terms, refund policy, privacy policy) drafted.

### Batch 2.7 — LinkedIn connection and publishing
Covers: US-8.1, 8.3, 8.4, 8.7, 9.1–9.5, 3.3 (calendar invites).
- OAuth connect on the client's device, encrypted token storage (never displayed), permission enforcement against US-8.2 defaults, schedule-and-publish through the API with retry (3 attempts) then Failed-with-reason, publish confirmations with live-post links, pause-all, revoke/handle-expired-token flows, reschedule rules (9.2).
**Dependencies:** 2.2, 2.5; Phase 0.1. **Exit criteria:** a real post, comment and like flow from approved content to a test LinkedIn account, with failure and revoke paths verified.

### Batch 2.8 — Scheduling, tasks and accountability engine
Covers: US-12.1–12.7, 13.4, 9.4.
- Scheduled jobs: publish within 5 minutes of set time, timezone-safe (fixed local times across DST), approval-deadline reminders, waiting-on attribution (client vs manager), automatic manager queries on missed deadlines, escalation, task queue from live data.
**Dependencies:** 2.7. **Exit criteria:** a scheduled post publishes on time in a non-UTC timezone; a missed deadline is attributed correctly and triggers the automatic query.

### Batch 2.9 — Analytics, reporting and admin intelligence
Covers: US-10.1–10.6, 13.5, 13.9.
- Goal-metric dashboards from LinkedIn data where available, automated weekly/monthly report drafts (with AI commentary draft), delivery-vs-plan tracking, PDF export, portfolio at-risk flags, manager performance metrics, payout calculation (US-13.9).
**Dependencies:** 2.7, 2.8. **Exit criteria:** one contract cycle of data produces complete weekly and monthly reports and a correct portfolio view.

### Batch 2.10 — Hardening, compliance and pilot launch
Covers: non-functional requirements, security, US-1.8, 2.4, 11.6.
- Security scan and remediation, rate limiting and lockout, immutable audit log verification, encryption-at-rest checks for tokens, retention periods and deletion for ended contracts, data export, accessibility audit, performance pass (under-2s loads), go-live checklist (policies live, Stripe live keys, LinkedIn app approved).
**Dependencies:** all of Phase 2. **Exit criteria (Phase 2 overall / launch gate):** PRD Phase-1 release condition met — pilot clients complete onboarding and publish approved content with no security incidents.

---

## Phase 3 — After pilot (from the PRD release phasing)

Sequenced per PRD, not planned in detail here: manager training & certification modules (13.2), opportunity scouting automation (6.4–6.5), benchmarks, one-off permission requests, outcome logging, digests, reassignment handover — then X integration and team accounts in Phase 3 of the PRD's own release table.

---

## Risks and watch items

| Risk | Where it bites | Mitigation |
| --- | --- | --- |
| Community Management API denied/limited | 2.7 | Ship with personal profiles only; company-Page posting flagged, not blocking |
| Naira card private preview not granted | 2.6 | Standard Visa/Mastercard fallback (PRD decision); UX unchanged |
| Notetaker service unavailable | 2.5 | Manual transcript paste fallback built from day one |
| AI output quality below strategist's bar | 2.5 | Framework library is versioned and tunable; manager review is mandatory in the flow |
| Scope creep during Phase 1 demo reviews | 1.x batches | New asks become line items or PRD amendments, not silent additions |
| Two providers of truth during Phase 2 swap | 2.1–2.9 | Mock layer swapped domain by domain behind one interface; screens never change |

# Bluecut Socials — implementation plan, round 2 (Phase 1 refinements)

**Status: APPROVED and in build on branch `plan/round2-implementation`.**
- **R2.1** (video billing removed · services catalog · Company Page pro-rated add-on) — built and signed off.
- **R2.2** (add-to-calendar · vault trust + InfoTip · call transcript + insights · LinkedIn-URL signup) — built and signed off.
- **R2.3** (AM operating model: scorecards profile+Page · platform vetting word-grades · approval → do/complete lifecycle · engagement rework) — built.
- **R2.4** (intelligence + tracking) — next.
- **R2.5** — not started.

Source: the Nov 2026 ideation round, captured as to-do items #41–#51 (and #25 retired as superseded). This plan sequences those eleven items into five batches (R2.1–R2.5). It slots into `docs/implementation-plan.md` after Phase 1; everything here is Phase 1 (frontend on mock data), with Phase 2 follow-ups listed at the end.

## How this plan works (same rules as v2)

- Work goes batch by batch, in order. A batch starts when its dependencies are done.
- **Review gate for every UI batch:** each flow is built, then phone (390px) and desktop screenshots go to Fola; a flow is Done only after sign-off.
- Design-system tokens/components only; mobile first at 390px; empty/loading/error states; "Simulate errors" must pass; no AI wording where a client can see it.
- Each batch lists its **shared foundations** (data-model/component changes done once, so flows aren't rebuilt), its **deliverables**, the **open decisions** to settle at batch start, and its **exit**.

## Dependency order

```
R2.1 Billing & services ─┐
R2.2 Signup/calls/vault/calendar ─┤ (independent of each other)
R2.3 AM operating model (#45) ──► R2.4 Intelligence & tracking (#46) ──► #47 (in R2.5)
R2.5 Roles & accountability: #49 ──► #47 ; #48 independent
#50 strategy-driven offers hook ──► waits on R2.3/R2.4
```

Hard dependencies captured in the list: **#46 blocked by #45**, **#47 blocked by #46**. #47 also needs #49 (who may access the report). Everything else is independent.

---

## Batch R2.1 — Billing and services foundation  (#50, #41)

Reworks billing once, before anything else touches Contract/pricing.

**Shared foundations (data model):**
- Remove the on-platform video add-on end to end: `Contract.videoAddon`, `settings.videoAddonCents`, any `pricing.ts` reference, the `VideoAddonCard` (`src/components/client/VideoAddon.tsx`), its line in `src/app/(client)/contract/page.tsx` and its effect on the contract total, and the onboarding video-add-on choice. Keep free: video/carousel posting, the system video guide, the "Record a short video" quick task + `VideoBrief`.
- New `Service` + `ServiceRequest` types in `src/lib/mock/types.ts`; seed a starter catalog; `act.*` for request→notify owner admin (no invoice, no status).
- Company Page add-on billing: pro-rated model in pricing/settings; drop `FullService.pageGrant` and the admin-grant concept.

**Deliverables:**
- **#50 Services:** owner catalog screen (`/admin/services`: add/edit/remove, each service name + description + bucket included|extra + active, extras show "price on request"); client **Services** page (included = "in your plan", extras = "Request"); contextual entry points on Brand/content/profile; request action = capture + notify owner admin + confirmation toast, nothing more. (The *strategy-driven* offer hook is deferred to after R2.3/R2.4 — see note.)
- **#41 Company Page add-on:** paid, pro-rated add-on for **both** tiers; turn on/off in onboarding ("How can we help you?") under both options and in Contract; mid-contract add = pay remaining pro-rated, remove = refund remaining Page-fee balance only; **remove** the Company Page on/off card from the Full-service hub page; Page work delivered via delegated account (full-service) or as tasks (self-serve).

**Open decisions to settle at batch start:** exact pro-ration/refund display copy; where the Page toggle sits inside "How can we help you?".

**Exit:** no video charge anywhere; a client can view the services catalog and send a request that reaches the owner admin; a client can turn the Page add-on on/off at onboarding and in Contract with correct pro-rated money; the Full-service hub no longer shows the Page card. Phone + desktop signed off.

---

## Batch R2.2 — Signup, calls, vault, calendar  (#43, #42, #44, #51)

Four discrete, lower-risk flows grouped into one review batch.

**Shared foundations:**
- `#43` signup: mocked LinkedIn-URL extraction helper; route `/in/` → user profile, `/company/` → business profile; manual-name fallback path; "Update my profile / Update client profile" on-demand sync actions.
- `#42` call model: replace `Call.summary` with `transcript?` (raw, only if recorded) + `insights?` (synthesised); keep `recording` consent; "Share with client"; insights feed the strategy "What we agreed".
- `#51` calendar helper `src/lib/calendar.ts` (Google URL, Outlook URL, `.ics`) + reusable "Add to calendar" component.

**Deliverables:**
- **#43:** new signup order — email/password: Email → Password → LinkedIn URL → OTP; Google: authenticate → LinkedIn URL → OTP. Auto name/photo from the URL (mocked), manual-name fallback when extraction fails, on-demand sync. No AI wording.
- **#42:** AM pastes Transcript (if recorded) + Insights after a call and shares; client sees them on their call; strategy "What we agreed" drafts from Insights (AM edits). Availability is already built — no change.
- **#44:** delegated-access vault trust treatment (lock iconography, "encrypted the moment you save it", masked password, "never seen/shared") + an InfoTip on the "Set up secure access" title.
- **#51:** Add-to-calendar (Google/Outlook/.ics) on the booking confirmation and call detail; `.ics` client-side download in Phase 1; include the Meet link when present (AM pastes it after booking per #42).

**Open decisions:** #43 signing-step/field copy and what a failed extraction shows; #51 whether to show an "invite updates when your link is ready" note before the Meet link exists.

**Exit:** a dummy client signs up from a LinkedIn URL (and via the manual fallback); an AM shares transcript+insights and the client sees them; the vault reads as safe with its InfoTip; add-to-calendar works for all three targets on confirmation and call detail. Signed off.

---

## Batch R2.3 — AM operating model  (#45)  *(largest; built in sub-batches)*

The core "do it for me" / "do it myself" engine. No LinkedIn API: the platform guides + vets; the AM researches and acts.

**Shared foundations (data model):**
- Strategy = numeric **scorecard** across **all** activity kinds (posts, comments, reactions, follows, connects, saves, profile tasks), with a **second scorecard for the company Page** when active.
- Typed activity/task with kind + content + media + quality grade + lifecycle state (draft → vetted → shared → approved/adjust → done) + performer (self-serve client vs full-service AM).
- Vetting/scoring producing **word grades** (very bad → not so good → good → very good → perfect) against goal + LinkedIn best practice + off-limits + field signals.

**Sub-batches:**
- **R2.3a Strategy & scorecards:** extend strategy + scorecards (profile + Page); adapts from client feedback + performance + AM observation.
- **R2.3b Create & vet workspace:** AM create-task (pick kind, paste content, attach media); platform vet/score (staff-only grade) + assist writing; adjust until it passes. Topic/keyword guidance surface (keep M4 "topic ideas with reasons").
- **R2.3c Share → approve → do/complete:** share for client approval; self-serve = stays a client task; full-service = AM performs then marks Completed → Done → logged. Adjustment loop; client-initiated requests (pull-down/fix) route to AM → done (extends C8).
- **R2.3d Engagement rework + preservation:** rework the Engagement tab (no auto-surfaced leads; AM brings everything; all kinds). Preserve and fold in Moment (`MomentForm`, `brand/moments/new`), quick tasks, video requests, content workspace, Brand inputs — adjust, don't remove.

**Open decisions:** the exact word-grade labels in the UI; whether the AM can raise a service request on the client's behalf (ties to #50); the Page scorecard's default targets.

**Exit:** an AM takes a client through a full week under the new model for profile and (if active) Page: scorecard set, content created→vetted→shared→approved→performed/logged; self-serve vs full-service both work; Moment/quick tasks/video still work. Signed off.

---

## Batch R2.4 — In-app intelligence and tracking  (#46)   *(blocked by #45)*

Define the engine; make "expected / done / left / next" clear on all three sides by **consolidating and extending** existing surfaces (no new standalone "intelligence" page).

**Deliverables:**
- **Client:** extend `WeekCard`, `/progress`, `/strategy` to all activity kinds + the Page scorecard; plain words, no grades, no AI wording.
- **AM:** home feed + per-client page + content workspace show next-action guidance, the staff-only grade on drafted items, and targets-vs-done (profile + Page).
- **Owner:** extend `/admin/managers/[id]` performance with grade trend, response time to client requests, and the escalation/strike state; keep audit-log tie-in.
- Naming split confirmed: staff "Suggested" + sparkle; client "your plan / your progress".
- Wire the **#50 strategy-driven service offer** here (surface a relevant extra service when the strategy shows it serves the goal).

**Exit:** each role sees the same truth in its own words; owner sees the extended AM tracking; strategy-driven service offers appear. Signed off.

---

## Batch R2.5 — Admin roles and AM accountability  (#49, #48, #47)

**Order within the batch:** #49 and #48 first (independent); #47 last (needs #46 data and #49 access).

**R2.5a — Admin roles & access (#49):**
- Data model: admin roles (default + custom), per-role per-area access (none/view/manage), multi-role additive (most-permissive wins), protected built-in Owner.
- Screens: `/admin/roles` (list, create/edit role with per-area access, remove with reassignment guard); **admin team** management (invite admin, assign role(s), deactivate) — mirror the manager invite pattern; "effective access" preview per admin.
- Guards: ≥1 Owner always; multiple Owners allowed; only an Owner grants/revokes Owner; no self-edit of own access; every change audit-logged.
- **Gating pass:** apply effective-access checks across every `/admin/*` screen (hide at none, read-only at view, act at manage) — done once, after the new admin screens (`/admin/services`, roles, the AM report) exist.

**R2.5b — AM contract signing (#48):**
- Add a required "Agree to terms" step to AM setup (`invite/[token]`): full-name signature + ToS/rules; proposed order Password → Two-step → Agree → Profile → Call slots.
- AM profile "Your agreement" card: view + download signed terms (date + version); owner's AM page shows + downloads it; signing written to the audit log. Clean up the pre-existing demo-help text on the invite screen while here.

**R2.5c — AM performance report (#47):**
- No AM payment recording anywhere. "Download performance report" on `/admin/managers/[id]` with a period selector; contents = performance stats + per-client activities (profile + Page) + grade trend + response time + misses/reasons + escalations + complaints. Client-side generated file in Phase 1.

**Open decisions:** the exact admin area list + default access per role; whether admins sign the same ToS as AMs; report period default + file format(s) + exact fields.

**Exit:** owner can create/edit/remove roles and assign them; access correctly gates every admin screen; an AM signs a downloadable, logged contract during setup; the owner can download an AM performance report with no payment recorded. Signed off.

---

## Phase 2 follow-ups (noted, not built in Phase 1)

- **#43:** real extraction via Bright Data Web Scraper API (cookie-free) + Vercel Blob for permanent profile images; Vercel backend detects URL type and routes into user/business tables. (Compliance caveat recorded on #43; founder accepted the scraping path.)
- **#42:** `docs/implementation-plan.md` batch 2.5 changes from "notetaker transcripts" to **AM-pasted** transcript + insights (manual; AM runs their own notetaker only with consent). Update the stack row and 2.5 scope.
- **#51:** `.ics` attachment + Google/Outlook links in confirmation/reminder emails (Resend) — belongs with 2.4/2.5.
- **#49:** server-side role/access enforcement (row-level security per role/scope); admin invites.
- **#47:** server-side report generation (PDF/CSV).
- **#50:** services requests as leads to the owner admin; still no on-platform billing for extras.
- **#41:** pro-rated Page add-on billing + refunds in Stripe (ties to 2.8/2.13).

## What to update on approval

- Fold R2.1–R2.5 into `docs/implementation-plan.md` (new batches), update **Current position**, and adjust the Phase 2 table rows noted above.
- Reflect the changes in `docs/prd.md` and `docs/flow-map.md` (new/changed flows: services, roles, AM contract, calendar, signup, calls transcript/insights, the AM operating model) and set flow statuses before building each.

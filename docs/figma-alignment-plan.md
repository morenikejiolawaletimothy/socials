# Figma alignment — design language + flow correction plan

**Source:** Bluecut Figma board — `https://www.figma.com/design/9lyziI1LykdE193IHJOvnQ/Bluecut` (file key `9lyziI1LykdE193IHJOvnQ`, canvas `197:1608` "Bluecut Design and Flows"). **Client view only** is designed; AM and admin are not, so we apply the same captured language to them.

**Goal:** make the client UI match the Figma pixel‑for‑pixel, bake that language into our design system so future work needs no trip back to Figma, and extend the same system to the account‑manager and admin views.

> I read the flow before proposing anything. This doc is the plan; no code has changed yet.

**Confirmed (Fola, Nov 16):** D1 = **adopt the feed‑tab IA**; D2 = **fully align AM + admin too**. So this is the full Figma‑driven redesign across all three roles.

**Key finding — our tokens already match the Figma.** Colours sampled from the Figma screenshots land on our existing tokens: primary blue `#224cd5` (the Figma "Ready for Action" badge = our `primary-600` exactly), page background `#f4f5f5` (= our `bg-page`), and the status colours (amber/red/green) are the same families as our `warning`/`danger`/`success`. So Phase 0 is a no‑op on the palette — the real work is the **IA (feed‑tab Home), nav, the feed‑card component, and the status‑badge taxonomy**, then extending to AM/admin. Our `Badge` statuses already map 1:1 to the taxonomy: Completed→success, Pending Review→warning, Changes Requested→danger, Ready for Action→info, Drafting→neutral.

---

## 1. What the Figma contains (the flows)

The board is organised into flow **sections**, each holding desktop screens (~1707px artboards). Reference node ids are kept so we can pull exact specs per screen during build.

| Section | Node | What it covers |
| --- | --- | --- |
| Sign in & forgot password | `230:1007` | sign in, reset, check email, new password, changed |
| Sign up & 2FA | `230:1629` | create account (3 steps), check email |
| Choose your preferred plan | `373:6691` | plan selection |
| Manage account access — Standard (self‑serve) | `373:6693` | onboarding/setup, self‑serve |
| Manage account access — Premium (full‑service) | `373:6694` | onboarding/setup, full‑service |
| Feed — Standard | `373:6695` | client Home feed, self‑serve |
| Feed — Premium | `373:6696` | client Home feed, full‑service |
| Calls | `374:6757` | calls flow |
| All Tasks (categories + actions) | `374:6756` | the task taxonomy behind the feed |
| Component | `373:6692` | shared building blocks |
| Messages | `375:7381` | client messages |

**Token basis:** the file's variables are Figma's generic "SDS" kit (`--sds-size-space-200 = 8`, 4/8/16 spacing, `Static/Title Large`, white surfaces). So the design's value is its **composition, IA and specific screen layouts**, not a novel palette — our brand tokens are already richer and stay.

---

## 2. The Figma client design language (what we standardise on)

**Shell / navigation (notable change from today):**
- Minimal top bar: **logo left · three centre icons (Home, Messages, Notifications‑with‑badge) · avatar + caret menu right**. Active item carries a short underline. There is **no "Content" top‑nav item**, and **"Me" is folded into the avatar menu**.

**Page & cards:**
- Light‑grey page background; **white, flat cards** with a hairline border and ~8px radius, generous padding. Card titles are bold with an **info icon** beside them. Breadcrumbs sit **above** the card (setup screens).

**The client Home is a tabbed feed (the big one):**
- Three columns: **left** = profile card (avatar, status badge e.g. "Active", name, role) **+ a "Resources" card** ("Brand assets and strategy documents"); **centre** = a **tabbed workspace**; **right** = the Account‑manager card (photo, bio, Message button).
- Centre tabs: **Feed · Calls · Coming up · Reports · History**, each with a count badge. Under the tabs: a section header (title + info icon) with **Filter** and an "x of y done" pill, then a **filter row** (time ▾ · sort ▾ · keyword 🔍), then the feed.
- **Every actionable item is a feed card** with: a **status badge** (top‑left) + **date/time** (top‑right, clock icon); an **icon chip + title**; body text; optional **numbered steps**; a **"Task resource"** link; and a **primary action** (e.g. "Mark as done"). Self‑serve vs full‑service use the *same card*, differing only in **voice** ("Kindly update your profile…" vs "We are about to update your profile…") and whether the client has an action.

**Status‑badge taxonomy (from the Component board):**
`Drafting` (grey) · `Pending Review` (amber) · `Changes Requested` (red) · `Ready for Action` (indigo/blue) · `Completed` (green).

**Setup screens:** single centred card, breadcrumbs above, a progress bar with "N steps left", sub‑sections with info icons, input + blue "send" button.

**Primary action colour:** vivid indigo‑blue; solid buttons, white text, ~8px radius, optional trailing icon.

---

## 3. How this differs from what we built today

Our foundation already matches a lot (3‑column LinkedIn layout, profile/AM cards, `Card title=…` with info, breadcrumbs, `SetupFrame`, `Segmented`, `Select`, `Badge`, buttons). The real deltas:

1. **Top nav** — we have Home/Content/Messages/Notifications/Me; Figma is Home/Messages/Notifications + avatar menu (no Content, Me in the menu).
2. **Home = tabbed feed** — we route Content, Strategy, Calls, Progress, Activity to **separate pages**; Figma folds them into **Home tabs (Feed · Calls · Coming up · Reports · History)**.
3. **Unified task feed** — Figma turns every to‑do (review a post, profile task, engagement, etc.) into one **feed card with a status badge and an action**; we spread these across Content/Tasks/Publish surfaces.
4. **Resources card** on the left column — a quick link to brand assets/strategy docs.
5. **Status‑badge labels/colours** — align our `Badge`/`PostStatus` wording to the Figma taxonomy.
6. **Exact visual tokens** — tune the blue, radii, page background and card border/shadow to the Figma.
7. **Feed filter row** — time/sort/keyword.

---

## 4. Proposed implementation plan (phased, flow‑by‑flow)

**Phase 0 — Capture the design language (no screen‑level risk).** Pull exact values (blue, type sizes, spacing, radii, card treatment) from the Figma components via `get_design_context`/`get_variable_defs`; reconcile `design-system/tokens.json` + `src/app/globals.css`; add the Figma patterns (feed card, status badges, filter row, minimal shell) to `design-system/README.md` and the `/design-system` page. *This is the "no more Figma trips" deliverable.*

**Phase 1 — Shell & nav.** Simplify the client top bar (Home · Messages · Notifications · avatar menu), fold "Me" into the menu, match the active underline and spacing. Mirror the cleaner shell to the AM; admin keeps its dashboard shell.

**Phase 2 — Client Home = tabbed feed.** Build the `FeedCard` and the tabbed Home (Feed · Calls · Coming up · Reports · History), the filter row, the Resources card, and map existing data (posts, quick tasks, calls, weekly updates→Reports, activity→History) into feed items with the right status badges and actions. Keep self‑serve vs full‑service as a voice/action branch on one card.

**Phase 3 — Reconcile the remaining client screens** to the Figma pixels: auth, sign‑up (3 steps), setup/plan/access, calls, messages.

**Phase 4 — Extend to AM & admin.** Apply the shared tokens, `FeedCard`, badges, tabs and nav polish to the manager and (where it fits) admin surfaces, keeping one visual system across all three roles. No Figma exists for these, so we follow the captured language, not invent.

**Phase 5 — Design‑system page + docs refresh; verify (build/lint, 390px + desktop); ship.**

Each phase ships on its own with mobile + desktop screenshots for sign‑off, as we've been working.

---

## 5. Decisions that change the size of the work

- **D1 (pivotal) — Information architecture.** Adopt the Figma **feed‑tab Home** (fold Content/Strategy/Calls/Progress/History into Home tabs + one unified task feed), **or** keep our current multi‑page IA and apply **visual polish only**? The Figma strongly implies the feed‑tab model and it resolves several flow gaps from `client-manager-flow.md` (it is the single "needs‑me" queue). **Recommendation: adopt the feed‑tab IA.**
- **D2 — AM & admin scope.** Full visual alignment to the new language, or shared tokens + components + nav polish only? **Recommendation: shared tokens/components + nav polish now; deeper redesign later if wanted.**
- **D3 — Status taxonomy.** Adopt the Figma badge labels (Drafting · Pending Review · Changes Requested · Ready for Action · Completed) across client/AM/admin? **Recommendation: yes, map our states to these.**

---

## 6. Figma reference (for implementation)

File key `9lyziI1LykdE193IHJOvnQ`. Key nodes: components `373:6692`; Home/feed `266:76`, `373:3818` (self‑serve), `373:5277` (full‑service); onboarding `253:738`; sign‑in `238:1650`; messages `375:7381`. Pull `get_design_context` on the specific node when building each screen for exact spacing/assets.

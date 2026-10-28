# Bluecut Socials

Next.js 15 (App Router) + TypeScript + Tailwind CSS v4. Mobile first.

## Design system (mandatory)

The Bluecut Socials design system is the only source of visual decisions.

- `design-system/` is a copy of the design system from Claude (https://claude.ai/artifact/RZzACyhFQGFyKyZb2cKJMJ). Read `design-system/README.md` before building any screen. It covers voice, color roles, type, spacing, icons, buttons, flows and mobile rules.
- `design-system/tokens.json` holds the token values. `src/app/globals.css` mirrors them as the Tailwind theme. Tailwind's default colors, radii and shadows are removed, so only brand tokens exist.
- Build screens from `src/components/ui` (Button, Badge, Card, Input, Stepper, Logo). Add a new primitive there only when no existing one fits, and follow the design-system README for it.
- `/design-system` renders every component. Update it when a component changes.

Rules:
- Never hard-code a color, font, size, radius or shadow. No arbitrary values like `p-[13px]` or `#hex` in components.
- Spacing uses the 4px scale: Tailwind `p-4` = `space-4` (16px), `gap-6` = `space-6` (24px).
- Color classes: `bg-page`, `bg-card`, `bg-dark`, `text-primary`, `text-secondary`, `text-inverse`, `border-border`, `border-border-strong`, brand scale `primary-50..950`, status `success|warning|danger|info` and `*-bg`. `bg-primary` is ink, not blue; the brand action blue is `primary-600`.
- Type: `font-display text-display-3xl|2xl|xl|lg` for headings; `text-body-lg|body|body-sm|caption` for text; `font-medium` for body-medium.
- Focus: `focus-visible:focus-ring` on every interactive element.
- Cursor: a pointer (hand) on everything clickable, `not-allowed` on anything disabled, `grab`/`grabbing` on things you drag, the text cursor only in fields. `globals.css` sets this for links, buttons, tabs, labels and checkboxes; when you make anything else clickable (a `div` or card with `onClick`, a hover-to-open card), add `cursor-pointer` yourself. Check the cursor when you review a screen.
- Buttons have no shadow on hover, only a colour change (the landing `lp-btn` also lifts 1px).
- One primary button per view. Sentence case. No em dashes, hype or emoji in UI copy. Errors say what happened and what to do.
- Icons: Phosphor (`@phosphor-icons/react`) only, including social logos; no other icon set and no hand-drawn SVG icons. The one exception is Google's official multicolour "G" on "Continue with Google" (`public/brand/google-g.svg`), which Google's guidelines require. Regular weight only, functional only. No arrows on buttons or for navigation.
- Multi-step tasks show the Stepper.
- Check every screen at 390px wide first, then desktop. No horizontal scroll.

## Layout (client and manager follow LinkedIn's arrangement)

- Top bar and page body share one container (`max-w-6xl px-4`), so columns line up with the logo on the left and the Me menu on the right.
- Top bar: logo left; nav right with icon above a short label (Home, Content or Clients, Messages, Notifications, Me ▾). Active item: brand blue with an underline indicator (`navItemClass`). Mobile: compact top bar plus floating bottom bar.
- Pages use `Columns` (`src/components/layout/Columns.tsx`) with a named rail set from `src/components/rails`:
  - feed pages (Home, Notifications): left profile card, centre feed, right card (3 / 6 / 3)
  - main pages (Content, Messages, client page): main plus right card (8 / 4)
  - settings pages (Your brand, Control, Contract, Account, Calls, Profile): left `SideMenu` plus main (3 / 9)
- Content lives in cards with equal gaps (`gap-4` within a column, `gap-6` between columns). On mobile, columns stack and rails hide unless needed.
- No page titles or subtitles on client and manager pages, so the first card in every column lines up at the top. Each card carries its own title through `Card title=...`: a header strip with a divider under it (breadcrumbs go in `eyebrow`). The owner dashboard may keep page titles.
- The owner keeps the dashboard shell (sidebar).

## Lessons from reviews (do not repeat)

Corrections Fola has already made. Check every new screen against them before sharing.

- Client and manager pages have no page title or subtitle. Every card has its title in the header strip (`Card title=...`).
- Keep screens simple: no extra lines under titles unless they say something needed (for example, sign-up has the title only).
- Demo-only help (demo logins, codes, "any 6 digits") never shows on screens. Pre-fill it instead and keep it in `docs/demo-accounts.md`.
- Hand cursor on everything clickable; no shadow on button hover; Phosphor icons only (Google "G" excepted).
- Dates mid-sentence use `dayIn`, `dayTimeIn` and `agoIn` from `src/lib/format.ts`. Never `.toLowerCase()` a formatted date ("due Sun 1 Nov", not "due sun 1 nov").
- Check 390px for horizontal scroll on every page, including the demo bar and wide tables (tables scroll inside their card, never the page).
- Every button does something on the demo data (`act.*` in `src/lib/mock/actions.ts`), with a toast that says what happened. No dead buttons.
- Clients never see the word AI. Staff screens may show "Suggested" with the sparkle icon.
- Only `page`, `default` and Next.js route exports in `page.tsx` files. Shared labels and helpers go in components.
- Every action gives feedback. Run it through `useTask` (spinner on the button, success toast, error toast if it fails) and pass `loading` to the Button. Route changes show the page skeleton briefly.
- Anything destructive or hard to undo (delete, remove, cancel, withdraw, take down, suspend, refund, publish) asks first with `useConfirm`: say what will happen, put what cannot be undone in `warning`, run the action inside the dialog. Small removals that can come back get an Undo action on the toast instead.
- Every add or create has a matching edit and remove.
- Actions that tell someone use `notify(...)` in `src/lib/mock/actions.ts` (`email: true` marks the ones that will also send an email in Phase 2). Owner actions also write to the audit log.
- Test error states with "Simulate errors" in the demo bar: every action must fail gracefully, keep what the person typed, and say what to do.

## Landing page exception

The marketing landing page (`src/app/page.tsx`, `src/components/landing/`) is built pixel-perfect from the approved Figma template (`1440w light`). It uses Inter only, with the `lp-*` type utilities in `globals.css`, and may use the template's exact pixel values (spacing, radii, shadows, blurs). Colours still come from design-system tokens. Mock-ups are drawn at template size inside `FitBox`, which scales them down on small screens. All landing motion comes from `src/components/landing/motion.tsx` (Motion + Lenis): one ease, reveal, stagger and card hover, plus the `lp-btn`, `lp-zoom` and `lp-marquee` utilities. Reuse those instead of new timings, and keep reduced motion working. Everything else in the app follows the design-system rules above.

If the design system changes in Claude, re-sync `design-system/` and `globals.css` together.

## Product docs

- `docs/prd.md`: the PRD (v2). Source of truth for stories, roles, states and edge cases. v1 is in `docs/archive/`.
- `docs/implementation-plan.md`: build order by phase and batch. Update "Current position" when work moves.
- `docs/flow-map.md`: every flow screen by screen, with review status. Only build flows marked Approved.
- `docs/demo-accounts.md`: Phase 1 demo sign-ins (emails, codes, invite link). Keep it current when seed data changes.

Phase 1 is frontend only with dummy data behind one mock layer per domain (`src/lib/mock/`), so Phase 2 swaps data without redesigning screens.

## How we work

The product owner is the design authority. Work flow by flow:
1. Scope: the flow must be written up and approved before any UI is built.
2. Reference: find proven patterns (Mobbin for app UI, Awwwards for marketing) before designing.
3. Build one flow at a time, share screenshots (mobile and desktop) and wait for approval before starting the next.
If a flow is unclear, ask instead of guessing.

## Commands

- `npm run dev` start locally
- `npm run build` production build
- `npm run lint` lint

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
- One primary button per view. Sentence case. No em dashes, hype or emoji in UI copy. Errors say what happened and what to do.
- Icons: Phosphor (`@phosphor-icons/react`), Regular weight only, functional only. No arrows on buttons or for navigation.
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
- The owner keeps the dashboard shell (sidebar).

If the design system changes in Claude, re-sync `design-system/` and `globals.css` together.

## Product docs

- `docs/prd.md`: the PRD (v2). Source of truth for stories, roles, states and edge cases. v1 is in `docs/archive/`.
- `docs/implementation-plan.md`: build order by phase and batch. Update "Current position" when work moves.
- `docs/flow-map.md`: every flow screen by screen, with review status. Only build flows marked Approved.

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

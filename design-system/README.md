Bluecut Socials is a social media and brand studio. The identity is one confident brand blue on a clean, near-white canvas, with deep neutral ink for text and soft rounded shapes that echo the circular logo. Keep every screen calm and uncluttered: plenty of white space, one accent, few actions.

## Voice and content

Write for people, not for show. Use plain, everyday words and short sentences. Say one thing at a time. Use sentence case everywhere (headings, buttons, labels), never Title Case or ALL CAPS. Talk to the reader as "you", and call the studio "we" (or "Bluecut" after the first mention). Keep labels to a short verb phrase, like "Book a call" or "See the work".

Avoid in all copy:

- No em dashes. Use a full stop, a comma, or brackets instead.
- No "it's not this, it's that" phrasing, and no clever contrasts for effect. Just say the thing.
- No filler, no hype words, no emoji in product UI.
- No long clauses or heavy grammar. If a sentence is hard to read aloud, shorten it.

### Errors and system messages

Never show a bare "Error". Tell the person, in plain words, what happened and what to do next. Keep it to one short line where you can. Instead of "Invalid input", write "Enter a work email so we can send your proposal". Name the problem, then the fix.

## Color

Build on a neutral canvas and spend the brand blue deliberately. Use `bg-page` for app and page backgrounds and `bg-card` for cards, sheets and modals, separated by `border`. Set primary text in `text-primary` and supporting text in `text-secondary`.

`primary-600` is the one brand action color. Use it for primary buttons, links, active states and the focus ring, and `primary-700` for its hover and pressed states. The lighter steps (`primary-50` to `primary-200`) are tints for chips, selected rows and quiet brand surfaces, not for text. For readable brand-colored text or icons on a light surface, drop to `primary-900`.

On dark, use `bg-dark` (the brand ink) with `text-inverse`, paired with the light logo variant.

Keep status meaning carried by more than color. Each status pairs its color with a word or icon. `success`, `warning`, `danger` and `info` work as text, icons, dots, borders and fills. Set status banners and badges on the matching `*-bg` background, with the status color or `neutral-900` as the label text. `info` is the brand blue, so never rely on blue alone to mean "informational"; always add the label.

## Typography

Two brand faces, both Google-hosted: Plus Jakarta Sans for display (the `display` family) and Inter for body and UI (the `sans` family). JetBrains Mono (`mono`) is for code, tokens, IDs and figures. Load all three from Google Fonts; the stacks fall back to `system-ui`.

Set titles in the Display styles (`display-3xl` down to `display-lg`) and running text in `body`. Use `body-medium` for button labels and emphasis, `body-sm` for help text and dense tables, and `caption` for labels, badges and metadata (usually in `text-secondary`). Don't set long body copy in the display face, and don't mix more than two type sizes in one small component.

## Spacing and layout

Everything sits on a 4px grid. Compose with the `space-*` scale: `space-3` for control padding, `space-4` as the default gap, `space-6` for card padding, and `space-12` or `space-16` for section rhythm. Prefer whitespace over borders to group content.

## Radius and shape

Rounded, friendly geometry is core to the brand. Use `radius-md` for buttons and cards by default, `radius-sm` for inputs and tags, `radius-lg` or `radius-xl` for large panels and modals, and `radius-full` for pills, avatars and the logo mark.

## Elevation

Keep surfaces mostly flat and lift only what floats. Use `shadow-sm` for resting cards and inputs, `shadow-md` for raised cards, and `shadow-lg` for overlays (menus, popovers, modals). Always show keyboard focus with `focus-ring`.

## Consistency

Every value comes from a token, and every role uses the same token everywhere. One radius for all buttons (`radius-md`), one for all inputs (`radius-sm`). One brand blue for all primary actions (`primary-600`). The same text style for every body paragraph (`body`), every label (`caption`), every field. Never hand-type a near value like `9px` or `4.1px` next to a token. Change the token once and it updates everywhere. That is the point of the system.

## Icons

Use one icon family across the whole product and nothing else: **Phosphor**, at its Regular weight, so icons match the brand's soft rounded shapes. Keep to that one weight everywhere. Never mix in Phosphor's other weights, or icons from another set.

Keep icons functional, not decorative. No arrows on buttons. No arrows for "next", "back", routing between pages, or moving between steps. No shortcut or decorator icons in navigation or in the search bar. Use an icon only when it does a real job, such as download, or when it is specifically asked for. When in doubt, use a clear text label instead.

## Buttons and actions

Few actions per screen. One primary button per view, in `primary-600`, with a text label that says the action. Everything else is secondary or ghost. No arrows or symbols on buttons unless the icon is functional (like download) or asked for. If a screen offers many possible actions, cut it to the one or two that matter here.

## Navigation and states

Keep navigation clean and quiet. Pick one hover and active treatment for navigation and use the exact same one everywhere in the web view. Do the same for links, buttons and cards: one hover behaviour per component type, applied the same way across the product. Interaction should feel identical wherever the person is.

## Flow and progress

Guide people step by step. Break tasks into a few short, easy steps, and keep the number of steps as low as it can go. Always show a progress indicator so people know where they are, what they have done, and what is next (see the Stepper). Make each step do one clear thing, then move on.

## Designing new screens

Don't design from imagination. Start from a real, proven product.

For app UI and flows like sign in, sign up or settings, reference how established platforms handle it, or use Mobbin for patterns. For marketing pages (layout, motion, interaction), reference Awwwards for current, well-made examples. Match a known pattern first, then dress it in Bluecut's tokens. If a flow is unclear, ask before building anything.

## Responsive and mobile

Design mobile first. People use this on phones as much as on the web, so every screen must work and feel right on a small screen first, then scale up. Keep tap targets comfortable, stack content in one column on narrow widths, and check the real mobile view, not a shrunk desktop. Mobile friendliness is required, not optional.

## Logo

The mark is a circular brand-blue disc with a white "b" monogram, supplied as a transparent PNG (see the Logos group). Keep clear space of at least half the mark's diameter around it, never recolor or distort it, and place it on `bg-page`, `bg-card` or any light tint. On `bg-dark` or `primary-600` surfaces, use a light logo variant (not yet supplied; see the Logos README). The disc may be cropped to a favicon or app icon.

## Accessibility

Target WCAG AA, and every color token meets it. `text-primary`, `text-secondary` and `primary-600`-as-text all meet 4.5:1 on `bg-page` and `bg-card`. The status colors (`success`, `warning`, `danger`, `info`) are tuned to meet 4.5:1 as text on `bg-card`, `bg-page` and their own `*-bg` tint, and they carry AA white text when used as a solid fill. `info` resolves to the brand blue, so always keep its text label. Control borders (`border-strong`) meet 3:1 against `bg-card` and `bg-page`; `border` is for decorative dividers and card edges only. Disabled text (`neutral-300`) is exempt from the contrast rule; input placeholders (`neutral-400`) always sit next to a visible label. This system ships a single Light theme; a contrast-checked Dark theme can be added on request.

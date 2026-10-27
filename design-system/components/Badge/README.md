# Badge

A compact status label that pairs a status color with text so meaning never rests on color alone.

Set the badge on the matching `*-bg` surface (`success-bg`, `warning-bg`, `danger-bg`, `info-bg`) with `neutral-900` label text and a `success`/`warning`/`danger`/`info` dot. Use the `neutral-100` variant for inert states (draft). Badges are pill-shaped (`radius-full`), `caption`-sized, with `space-2`/`space-3` padding. Because `info` shares the brand hue, always keep the text label.

The consumer provides the status label and chooses the variant from the item's state.

Foundational example built from the tokens. It shows the brand's semantic color roles.

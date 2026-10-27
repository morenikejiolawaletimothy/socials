# Button

Triggers an action; the primary variant is the one brand-blue call to action on a view.

Use **primary** (`primary-600`, hover `primary-700`) for the single most important action per section — set its label in `text-inverse`. Use **secondary** (outlined, `border-strong`) for alternative actions and **ghost** for low-emphasis or inline actions. Use **danger** (`danger`) only for destructive confirmation. Buttons use `radius-md`, `space-3`/`space-5` padding and a `body-medium` label. Always render keyboard focus with `focus-ring`.

The consumer provides the label and click handler; keep to one primary button per group.

Foundational example built from the tokens. Bluecut's source files define no component library, so this shows the brand action style. Adjust padding or label to your framework.

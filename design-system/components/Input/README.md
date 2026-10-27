# Input

A single-line text field with label and help text, in the brand's rounded, low-shadow style.

Use `radius-sm`, a `border-strong` resting border and `shadow-sm`. On focus, switch the border to `primary-600` and add `focus-ring`. Set the label in `body-sm`/medium `text-primary`, help text in `body-sm` `text-secondary`, and placeholders in `neutral-400`. For errors, switch the border and help text to `danger` and always include a text message — color is never the only signal.

The consumer provides the label, value, placeholder, help/error text and change handler.

Foundational example built from the tokens. It shows form styling and the focus and error states.

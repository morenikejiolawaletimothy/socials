# Stepper

Shows people where they are in a multi-step task, what they have done, and what is next.

Use it at the top of any flow with more than one step (sign up, onboarding, checkout). Show a plain "Step x of y" count, then the steps with short labels. Three states: done (filled `primary-600` dot), current (outlined `primary-600` dot with `focus-ring`, bold label), and upcoming (`neutral-200` dot, muted label). The connector line fills `primary-600` up to the current step. Keep the number of steps low and give each step one clear job. No arrows, no icons.

The consumer provides the step labels and the current step index.

Follows the standard numbered-stepper pattern used in common onboarding and checkout flows (reference Mobbin for live examples before adapting). Mobile: keep labels short so steps fit in one row on a phone; the count line always tells people where they are.

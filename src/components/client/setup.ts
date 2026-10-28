import type { SetupStep } from "@/lib/mock";

/** C1: the six setup steps, where each one is done, in order. */
export const setupSteps: { step: SetupStep; label: string; href: string; minutes: string }[] = [
  { step: "linkedin", label: "Connect LinkedIn", href: "/setup/linkedin", minutes: "1 min" },
  { step: "permissions", label: "Choose what we do for you", href: "/setup/linkedin?step=2", minutes: "1 min" },
  { step: "goals-call", label: "Book your goals call", href: "/setup/calls", minutes: "1 min" },
  { step: "strategy-call", label: "Book your strategy call", href: "/setup/calls?step=2", minutes: "1 min" },
  { step: "plan", label: "Choose your plan and sign", href: "/setup/plan", minutes: "3 min" },
  { step: "review", label: "Set how you review", href: "/setup/review", minutes: "2 min" },
];

export function nextSetupStep(done: SetupStep[]) {
  return setupSteps.find((s) => !done.includes(s.step));
}

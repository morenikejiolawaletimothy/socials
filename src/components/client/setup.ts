import type { Client, SetupStep } from "@/lib/mock";

type Service = Client["service"];
export type SetupStepInfo = { step: SetupStep; label: string; href: string; minutes: string };

/**
 * Figma onboarding: two steps for both account types. The plan step picks Regular or Premium and add-ons;
 * the access step holds the LinkedIn link, permissions, how we notify, and (Premium) delegated access.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- same steps for both account types today
export function stepsFor(_service?: Service): SetupStepInfo[] {
  return [
    { step: "plan", label: "Choose your preferred plan", href: "/setup/plan", minutes: "1 min" },
    { step: "access", label: "Manage account access", href: "/setup/access", minutes: "1 min" },
  ];
}

export function nextSetupStep(done: SetupStep[], service?: Service) {
  return stepsFor(service).find((s) => !done.includes(s.step));
}

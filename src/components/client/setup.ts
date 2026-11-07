import type { Client, SetupStep } from "@/lib/mock";

type Service = Client["service"];
export type SetupStepInfo = { step: SetupStep; label: string; href: string; minutes: string };

/**
 * C1: the setup steps for a client, in order. Neither service uses the LinkedIn API: self-serve clients do
 * the LinkedIn actions themselves, full-service clients set up secure access (a vault, not a login connection).
 */
export function stepsFor(service: Service): SetupStepInfo[] {
  const fullService = service === "full-service";
  return [
    { step: "service", label: "Choose how we help you", href: "/setup/service", minutes: "10 secs" },
    { step: "permissions", label: fullService ? "Choose what we do for you" : "Choose what we prepare for you", href: "/setup/permissions", minutes: "5 secs" },
    ...(fullService ? [{ step: "access" as SetupStep, label: "Set up secure access", href: "/setup/access", minutes: "2 min" }] : []),
    { step: "discovery-call", label: "Book your discovery call", href: "/setup/calls", minutes: "5 secs" },
    { step: "strategy-call", label: "Book your strategy call", href: "/setup/calls?step=2", minutes: "5 secs" },
    { step: "plan", label: "Choose your plan and sign", href: "/setup/plan", minutes: "10 secs" },
    { step: "review", label: "Set how you review", href: "/setup/review", minutes: "20 secs" },
  ];
}

export function nextSetupStep(done: SetupStep[], service: Service) {
  return stepsFor(service).find((s) => !done.includes(s.step));
}

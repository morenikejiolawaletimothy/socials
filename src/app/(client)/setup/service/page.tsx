import { redirect } from "next/navigation";

/** Retired by the Figma onboarding (two steps: plan, then account access). Old links land on the right step. */
export default function Page() {
  redirect("/setup/plan");
}

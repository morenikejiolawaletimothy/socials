/**
 * #45: the platform's content vetting. Staff-only. Scores a draft against the client's goal, LinkedIn best
 * practice, their off limits and what is topical, and returns a WORD grade (never a number the client sees).
 * Phase 1 is a deterministic mock from the text; Phase 2 uses the real engine with the field-signal RAG.
 */
export type Grade = "very bad" | "not so good" | "good" | "very good" | "perfect";

const SCALE: Grade[] = ["very bad", "not so good", "good", "very good", "perfect"];

export type VetCriterion = { label: string; ok: boolean; note: string };
export type Vet = { grade: Grade; criteria: VetCriterion[] };

/** Badge tone for a grade. */
export function gradeTone(grade: Grade): "success" | "info" | "warning" | "danger" {
  if (grade === "perfect" || grade === "very good") return "success";
  if (grade === "good") return "info";
  if (grade === "not so good") return "warning";
  return "danger";
}

export function vetContent(text: string, { offLimits = [], goal = "" }: { offLimits?: string[]; goal?: string } = {}): Vet {
  const t = text.trim();
  const low = t.toLowerCase();
  const words = t ? t.split(/\s+/).filter(Boolean).length : 0;
  const offHit = offLimits.find((o) => o && low.includes(o.toLowerCase()));
  const goalWords = (goal.toLowerCase().match(/[a-z]{5,}/g) ?? []).filter((w) => !["their", "about", "known", "voice"].includes(w));
  const goalFit = goalWords.length === 0 ? words > 0 : goalWords.some((w) => low.includes(w));
  const bestPractice = words >= 40 && words <= 280 && t.includes("\n");
  const specific = /\d/.test(t) || t.includes("?");

  const criteria: VetCriterion[] = [
    { label: "Serves the goal", ok: goalFit, note: goalFit ? "Ties to what the client wants to be known for." : "Tie it to the client's goal and audience." },
    {
      label: "LinkedIn best practice",
      ok: bestPractice,
      note: bestPractice ? "Good length, and easy to scan." : words < 40 ? "A little short. Add a specific example." : words > 280 ? "Long. Tighten it so the hook lands early." : "Break it into short lines so it is easy to scan.",
    },
    { label: "Within off limits", ok: !offHit, note: offHit ? `Mentions "${offHit}", which is off limits. Take it out.` : "Nothing off limits." },
    { label: "Timely and specific", ok: specific, note: specific ? "Has a specific detail or a question that invites replies." : "Add a number, a result or a question so it lands." },
  ];

  const okCount = criteria.filter((c) => c.ok).length;
  const grade: Grade = offHit ? "very bad" : SCALE[okCount];
  return { grade, criteria };
}

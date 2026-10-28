/** A thin bar for done vs target. Label it in text nearby; the bar is a visual aid only. */
export function ProgressBar({ value, max = 100, tone = "brand" }: { value: number; max?: number; tone?: "brand" | "success" | "warning" }) {
  const pct = Math.max(0, Math.min(100, max ? (value / max) * 100 : 0));
  const fill = { brand: "bg-primary-600", success: "bg-success", warning: "bg-warning" }[tone];
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100" aria-hidden>
      <div className={`h-full rounded-full transition-all duration-500 ${fill}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

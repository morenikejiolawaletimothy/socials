import { Avatar, Badge } from "@/components/ui";

/** Brand shapes (from the design system cover) behind a post waiting for the client's review. */
export function HeroVisual() {
  return (
    <div aria-hidden className="relative mx-auto h-96 w-full max-w-md">
      <div className="absolute inset-y-6 right-0 w-4/5 rounded-xl bg-primary-100" />
      <div className="absolute right-6 top-0 size-24 rounded-full bg-primary-300" />
      <div className="absolute -bottom-2 right-12 h-12 w-40 rounded-full bg-primary-900" />

      <div className="absolute inset-x-4 top-12 flex flex-col gap-4 rounded-lg border border-border bg-card p-5 shadow-lg sm:left-0 sm:right-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar name="Chidi Okeke" />
            <div className="flex flex-col">
              <span className="text-body-sm font-semibold text-primary">Chidi Okeke</span>
              <span className="text-caption text-secondary">CEO, Paystream</span>
            </div>
          </div>
          <Badge status="info">For your review</Badge>
        </div>
        <p className="text-body-sm text-primary">
          Three years ago we nearly shut down Paystream. Here is what kept us going, and what it taught me about building trust in payments.
        </p>
        <div className="flex flex-col gap-2 rounded-md bg-neutral-25 p-3">
          <span className="text-caption text-secondary">Why this post</span>
          <span className="text-body-sm text-primary">Builds trust with investors, your goal for this quarter.</span>
        </div>
        <div className="flex gap-2">
          <span className="flex-1 rounded-md bg-primary-600 py-2 text-center text-body-sm font-medium text-inverse">Approve</span>
          <span className="flex-1 rounded-md border border-border-strong py-2 text-center text-body-sm font-medium text-primary-700">Ask for changes</span>
        </div>
      </div>
    </div>
  );
}

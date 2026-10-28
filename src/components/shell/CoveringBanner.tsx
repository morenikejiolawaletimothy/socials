"use client";

import { useRouter } from "next/navigation";
import { fullName } from "@/lib/format";
import { act, useMyManager } from "@/lib/mock";

/** A2 step in: shown while the owner works in a manager's workspace. Clients see no change. */
export function CoveringBanner() {
  const router = useRouter();
  const { user, covering } = useMyManager();
  if (!covering) return null;
  return (
    <div className="bg-warning-bg">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2">
        <p className="text-body-sm text-primary">
          You are covering for <span className="font-medium">{fullName(user)}</span>. Clients see &ldquo;Your account team&rdquo;. Your actions are recorded as yours.
        </p>
        <button
          type="button"
          onClick={() => {
            act.setCovering(null);
            router.push("/admin/managers");
          }}
          className="rounded-sm text-body-sm font-medium text-primary-700 hover:underline focus-visible:focus-ring"
        >
          Stop covering
        </button>
      </div>
    </div>
  );
}
